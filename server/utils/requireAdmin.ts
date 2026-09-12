import type { H3Event } from "h3";

// Guard for every /api/admin/* handler. Throws 401 unless the sealed session
// cookie proves the caller is the admin.
export async function requireAdmin(event: H3Event) {
  const session = await useAdminSession(event);

  if (!session.data.admin) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated." });
  }

  return session;
}
