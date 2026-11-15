/**
 * Unsubscribes the contact named by a signed token from /newsletter/unsubscribe.
 * A POST, not a GET, so link scanners that open every URL in an email do not
 * unsubscribe people by accident; the page asks for one click first.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ t?: string }>(event);
  const token = String(body?.t ?? "");

  // The token admin previews and test emails carry.
  if (token === "test") return { unsubscribed: false, test: true };

  const contactId = verifyUnsubscribeToken(token);
  if (!contactId) {
    throw createError({ statusCode: 400, statusMessage: "This unsubscribe link is not valid." });
  }

  try {
    await unsubscribeContact(contactId);
  } catch (error) {
    console.error("[unsubscribe] Resend update failed", error);
    throw createError({
      statusCode: 502,
      statusMessage: "We couldn't reach the mailing list. Please try again in a minute.",
    });
  }
  return { unsubscribed: true };
});
