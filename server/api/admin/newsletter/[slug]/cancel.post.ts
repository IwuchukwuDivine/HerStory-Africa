/**
 * Takes a scheduled edition off the schedule. Resend returns it to a draft,
 * so it can be fixed and approved again. Only scheduled broadcasts are
 * touched: cancelling one that is already sending would stop it half way.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const slug = getRouterParam(event, "slug") ?? "";
  await readEdition(slug);

  const existing = (await broadcastsBySlug()).get(slug);
  if (!existing || existing.status !== "scheduled") {
    throw createError({ statusCode: 409, statusMessage: "This edition is not scheduled." });
  }

  await resendApi(`/broadcasts/${existing.id}/cancel`, { method: "POST" });
  return { status: "draft" as const, broadcastId: existing.id };
});
