import { createHmac, timingSafeEqual } from "node:crypto";

// Newsletter contacts in Resend. There is no database: a contact's state lives
// in Resend, and the only thing we mint is a signed unsubscribe token.
//
// Token: "<contact id>.<signature>", where the signature is an HMAC of the id
// under NUXT_NEWSLETTER_SECRET. It names one contact and cannot be forged or
// pointed at someone else. It is stored on the contact as the custom property
// `unsub_token`, so a broadcast can merge it into the footer link, and the
// welcome email computes it directly.

/** Custom contact property that holds the token. Letters, digits, underscores. */
export const UNSUB_TOKEN_KEY = "unsub_token";

const SITE = "https://herstoryafrica.com.ng";

function secret(): string {
  const { newsletterSecret } = useRuntimeConfig();
  if (!newsletterSecret || newsletterSecret.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_NEWSLETTER_SECRET is missing or shorter than 32 characters.",
    });
  }
  return newsletterSecret;
}

const sign = (contactId: string) =>
  createHmac("sha256", secret()).update(`unsubscribe:${contactId}`).digest("base64url").slice(0, 32);

export function unsubscribeToken(contactId: string) {
  return `${contactId}.${sign(contactId)}`;
}

export const unsubscribeUrl = (contactId: string) =>
  `${SITE}/newsletter/unsubscribe?t=${encodeURIComponent(unsubscribeToken(contactId))}`;

/** The contact id a token names, or null when the token is not one we signed. */
export function verifyUnsubscribeToken(token: string): string | null {
  const match = /^([0-9a-f-]{36})\.([\w-]{32})$/.exec(token);
  if (!match) return null;
  const [, id, signature] = match as unknown as [string, string, string];
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given) ? id : null;
}

/* ── Contacts ───────────────────────────────────────────────────── */

export interface ResendContact {
  id: string;
  email: string;
  unsubscribed: boolean;
}

const statusOf = (error: unknown) =>
  (error as { response?: { status?: number }; statusCode?: number })?.response?.status
  ?? (error as { statusCode?: number })?.statusCode;

/** The contact for an email address, or null when Resend has none. */
export async function findContact(email: string): Promise<ResendContact | null> {
  try {
    return await resendApi<ResendContact>(`/contacts/${encodeURIComponent(email)}`);
  } catch (error) {
    if (statusOf(error) === 404) return null;
    throw error;
  }
}

/** Adds a contact to the General segment. Already being in it is fine. */
async function joinGeneral(contactId: string) {
  const segment = await generalSegmentId();
  try {
    await resendApi(`/contacts/${contactId}/segments/${segment}`, { method: "POST" });
  } catch (error) {
    if (statusOf(error) !== 409 && statusOf(error) !== 422) throw error;
  }
}

/**
 * Single opt-in: subscribes the address, or resubscribes someone who left.
 * Returns what happened so the caller knows whether to send a welcome.
 */
export async function subscribe(email: string): Promise<{
  contactId: string;
  outcome: "new" | "returning" | "already";
}> {
  const existing = await findContact(email);

  if (!existing) {
    const segment = await generalSegmentId();
    const created = await resendApi<{ id: string }>("/contacts", {
      method: "POST",
      body: { email, unsubscribed: false, segments: [{ id: segment }] },
    });
    // The token is signed over the id, which only exists once Resend made it.
    await resendApi(`/contacts/${created.id}`, {
      method: "PATCH",
      body: { properties: { [UNSUB_TOKEN_KEY]: unsubscribeToken(created.id) } },
    });
    return { contactId: created.id, outcome: "new" };
  }

  await joinGeneral(existing.id);
  if (!existing.unsubscribed) {
    return { contactId: existing.id, outcome: "already" };
  }
  await resendApi(`/contacts/${existing.id}`, {
    method: "PATCH",
    body: {
      unsubscribed: false,
      properties: { [UNSUB_TOKEN_KEY]: unsubscribeToken(existing.id) },
    },
  });
  return { contactId: existing.id, outcome: "returning" };
}

/** Unsubscribes the contact a token names. A contact Resend no longer has counts as done. */
export async function unsubscribeContact(contactId: string) {
  try {
    await resendApi(`/contacts/${contactId}`, { method: "PATCH", body: { unsubscribed: true } });
  } catch (error) {
    if (statusOf(error) !== 404) throw error;
  }
}

/* ── Welcome email ──────────────────────────────────────────────── */

/** Resend-hosted template; its source is emails/templates/newsletter-welcome.html. */
const WELCOME_TEMPLATE = "newsletter-welcome";

export function sendWelcome(email: string, contactId: string) {
  return resendApi("/emails", {
    method: "POST",
    // One welcome per contact per day, however often the form is pressed.
    idempotencyKey: `welcome/${contactId}/${new Date().toISOString().slice(0, 10)}`,
    body: {
      to: [email],
      reply_to: NEWSLETTER_REPLY_TO,
      template: {
        id: WELCOME_TEMPLATE,
        variables: { unsubscribe_url: unsubscribeUrl(contactId) },
      },
    },
  });
}
