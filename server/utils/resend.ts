// Ports email/send-acceptance.mjs into the server runtime.
export async function sendAcceptanceEmail(opts: {
  to: string;
  name?: string;
  woman: string;
  url: string;
}) {
  const { resendApiKey } = useRuntimeConfig();

  if (!resendApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Email service is not configured.",
    });
  }

  const name = opts.name?.trim() || "there"; // → "Hi there,"
  const html = renderAcceptanceEmail({ name, woman: opts.woman, url: opts.url });

  return $fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}` },
    body: {
      from: "HerStory Africa <dee@herstoryafrica.com.ng>",
      to: [opts.to],
      subject: `${opts.woman} is now on HerStory Africa`,
      reply_to: "dee@herstoryafrica.com.ng",
      html,
    },
  });
}
