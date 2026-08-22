export default defineEventHandler(async (event) => {
  const session = await useAdminSession(event);
  return { admin: !!session.data.admin };
});
