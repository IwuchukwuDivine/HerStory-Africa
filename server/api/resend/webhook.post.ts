import { createHmac, timingSafeEqual } from "node:crypto";

// Resend webhook: keeps the list clean without a confirmation step.
//   email.bounced (Permanent) → the contact is deleted, per the build plan
//   email.complained          → the contact is unsubscribed
//
// Requests are signed the Svix way (Resend's docs): HMAC-SHA256 of
// "<svix-id>.<svix-timestamp>.<raw body>" with the base64 secret after the
// "whsec_" prefix, sent as space-separated "v1,<base64>" entries in
// svix-signature. Verified by hand so no SDK is needed.

const TOLERANCE_S = 5 * 60;

function verify(secret: string, id: string, timestamp: string, signatures: string, body: string) {
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_S) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
  return signatures.split(" ").some((entry) => {
    const [version, value] = entry.split(",");
    if (version !== "v1" || !value) return false;
    const given = Buffer.from(value, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

interface WebhookEvent {
  type: string;
  data: { to?: string[]; bounce?: { type?: string } };
}

export default defineEventHandler(async (event) => {
  const { resendWebhookSecret } = useRuntimeConfig(event);
  if (!resendWebhookSecret) {
    throw createError({ statusCode: 503, statusMessage: "Webhook is not configured." });
  }

  const body = (await readRawBody(event, "utf8")) ?? "";
  const ok = verify(
    resendWebhookSecret,
    getHeader(event, "svix-id") ?? "",
    getHeader(event, "svix-timestamp") ?? "",
    getHeader(event, "svix-signature") ?? "",
    body,
  );
  if (!ok) throw createError({ statusCode: 400, statusMessage: "Invalid signature." });

  const payload = JSON.parse(body) as WebhookEvent;
  const recipients = payload.data?.to ?? [];

  const permanentBounce =
    payload.type === "email.bounced" && payload.data?.bounce?.type === "Permanent";
  const complaint = payload.type === "email.complained";
  if (!permanentBounce && !complaint) return { handled: false };

  for (const email of recipients) {
    const contact = await findContact(email.toLowerCase());
    if (!contact) continue;
    if (permanentBounce) {
      await resendApi(`/contacts/${contact.id}`, { method: "DELETE" });
      console.info(`[webhook] removed bounced contact ${contact.id}`);
    } else {
      await unsubscribeContact(contact.id);
      console.info(`[webhook] unsubscribed contact ${contact.id} after a complaint`);
    }
  }
  return { handled: true };
});
