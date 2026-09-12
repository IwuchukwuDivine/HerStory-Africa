export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  return await opportunityRows(event);
});
