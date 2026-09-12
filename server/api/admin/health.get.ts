export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  return await contentHealth(event);
});
