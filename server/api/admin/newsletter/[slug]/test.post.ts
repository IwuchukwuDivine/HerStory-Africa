/**
 * Sends one copy of the edition to the editor's own address. The recipient is
 * fixed by NUXT_NEWSLETTER_TEST_ADDRESS on the server and never taken from the
 * request, so this cannot reach a subscriber.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const { newsletterTestAddress } = useRuntimeConfig(event);
  if (!newsletterTestAddress) {
    throw createError({
      statusCode: 400,
      statusMessage: "Set NUXT_NEWSLETTER_TEST_ADDRESS to send tests.",
    });
  }

  const edition = await readEdition(getRouterParam(event, "slug") ?? "");
  const result = await resendApi<{ id: string }>("/emails", {
    method: "POST",
    body: {
      from: NEWSLETTER_FROM,
      to: [newsletterTestAddress],
      reply_to: NEWSLETTER_REPLY_TO,
      subject: `[Test] ${edition.meta.subject}`,
      html: withoutUnsubscribeTag(edition.html),
      text: withoutUnsubscribeTag(edition.text),
    },
  });

  return { sent: true, to: newsletterTestAddress, id: result.id };
});
