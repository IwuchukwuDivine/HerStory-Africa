// Closes a suggestion for a woman who is already in the archive, pointing the
// submitter at the profile she already has. Same shape as accept.post.ts, but
// it sends the "already in the archive" email instead of the acceptance one.
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
    throw createError({
      statusCode: 400,
      statusMessage: "Profile URL is required.",
    });
  }
  if (!body.womanName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Woman name is required." });
  }

  // Email only when a contact address was actually provided.
  let emailed = false;
  if (body.submitterEmail?.trim()) {
    await sendExistsEmail({
      to: body.submitterEmail.trim(),
      name: body.submitterName,
      woman: body.womanName.trim(),
      url: body.profileUrl.trim(),
      issueNumber: number,
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
