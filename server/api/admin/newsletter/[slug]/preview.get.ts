/**
 * The edition's email HTML, for the admin preview frame. Images load from this
 * deployment and the unsubscribe tag is swapped for a plain link.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const edition = await readEdition(getRouterParam(event, "slug") ?? "");
  setHeader(event, "Content-Type", "text/html; charset=utf-8");
  setHeader(event, "Cache-Control", "no-store");
  return previewHtml(edition.html);
});
