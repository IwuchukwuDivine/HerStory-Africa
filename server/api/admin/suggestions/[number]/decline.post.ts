export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const number = Number(getRouterParam(event, "number"));
  if (!Number.isInteger(number)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid issue number." });
  }

  // Decline closes the issue and never sends an email.
  await closeIssue(number);
  return { success: true };
});
