export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const number = Number(getRouterParam(event, "number"));
  if (!Number.isInteger(number)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid issue number." });
  }

  const body = await readBody<{
    profileUrl?: string;
    womanName?: string;
    submitterEmail?: string;
    submitterName?: string;
    comment?: string;
    close?: boolean;
  }>(event);

  if (!body.profileUrl?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Profile URL is required." });
  }
  if (!body.womanName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Woman name is required." });
  }

  // Email only when a contact address was actually provided.
  let emailed = false;
  if (body.submitterEmail?.trim()) {
    await sendAcceptanceEmail({
      to: body.submitterEmail.trim(),
      name: body.submitterName,
      woman: body.womanName.trim(),
      url: body.profileUrl.trim(),
    });
    emailed = true;
  }

  if (body.comment?.trim()) {
    await commentIssue(number, body.comment.trim());
  }
  if (body.close !== false) {
    await closeIssue(number);
  }

  return { success: true, emailed };
});
