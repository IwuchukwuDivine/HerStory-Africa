/**
 * Puts the edition into Resend as a draft broadcast for the General segment,
 * or updates the draft already there. A draft sends nothing; it exists so the
 * same copy can be checked in the Resend dashboard.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const edition = await readEdition(getRouterParam(event, "slug") ?? "");
  const existing = (await broadcastsBySlug()).get(edition.meta.slug);
  const id = await saveDraft(edition, existing);
  return { status: "draft" as const, broadcastId: id };
});
