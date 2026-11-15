/** Scheduling closer than this to the send time is refused, so a stale edition never goes out at once. */
const MIN_LEAD_MS = 10 * 60 * 1000;

/**
 * "Approve and schedule": the only route that can make an edition reach
 * subscribers. It brings the Resend draft up to date with the build, then
 * schedules it for the edition's `sendAt`. The body must repeat the slug, so
 * a stray request cannot approve anything.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const slug = getRouterParam(event, "slug") ?? "";
  const body = await readBody<{ confirm?: string }>(event);
  if (body?.confirm !== slug) {
    throw createError({ statusCode: 400, statusMessage: "Approval was not confirmed." });
  }

  const edition = await readEdition(slug);
  if (Date.parse(edition.meta.sendAt) - Date.now() < MIN_LEAD_MS) {
    throw createError({
      statusCode: 409,
      statusMessage: "The send time has passed or is too close. Set a later sendAt and rebuild.",
    });
  }

  const existing = (await broadcastsBySlug()).get(slug);
  if (existing && existing.status !== "draft" && existing.status !== "canceled") {
    throw createError({
      statusCode: 409,
      statusMessage: `This edition is already ${existing.status} in Resend.`,
    });
  }

  const id = await saveDraft(edition, existing);
  await resendApi(`/broadcasts/${id}/send`, {
    method: "POST",
    body: { scheduled_at: edition.meta.sendAt },
  });

  return { status: "scheduled" as const, broadcastId: id, scheduledAt: edition.meta.sendAt };
});
