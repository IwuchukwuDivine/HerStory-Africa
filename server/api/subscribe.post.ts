// Newsletter sign-up. Single opt-in: the address goes straight into the
// General segment in Resend and gets a welcome email. The safeguards that
// replace a confirmation step:
//   - a honeypot field (`website`) that people never see and bots fill in
//   - a per-address and per-IP rate limit
//   - the welcome email itself, so a mistyped or unwanted signup is visible
//   - bounced addresses are removed by server/api/resend/webhook.post.ts
//
// Response shape is what NewsletterForm.vue expects:
//   { success: true, alreadySubscribed?: true }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** At most this many attempts per key in the window. */
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

// Best effort: each serverless instance keeps its own count, so a determined
// sender can spread across instances. It still stops a single script hammering
// the form, which is the realistic abuse.
const attempts = new Map<string, number[]>();

function limited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > LIMIT;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; website?: string }>(event);

  // A filled honeypot gets the normal reply and nothing else happens.
  if (body?.website) return { success: true };

  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    throw createError({ statusCode: 400, statusMessage: "A valid email is required." });
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
  if (limited(`ip:${ip}`) || limited(`email:${email}`)) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many tries. Please wait a few minutes.",
    });
  }

  let result: Awaited<ReturnType<typeof subscribe>>;
  try {
    result = await subscribe(email);
  } catch (error) {
    console.error("[subscribe] Resend contact failed", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong. Please try again later.",
    });
  }

  if (result.outcome === "already") {
    return { success: true, alreadySubscribed: true };
  }

  // The subscription stands even if the welcome fails; it is not worth an
  // error the reader can do nothing about.
  try {
    await sendWelcome(email, result.contactId);
  } catch (error) {
    console.error("[subscribe] welcome email failed", error);
  }

  return { success: true };
});
