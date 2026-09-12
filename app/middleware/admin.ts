export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/admin/login") return;

  const { admin } = await $fetch("/api/admin/me", {
    // Forward the cookie during SSR; on the client the browser sends it.
    headers: useRequestHeaders(["cookie"]),
  });

  if (!admin) {
    return navigateTo(`/admin/login?next=${encodeURIComponent(to.fullPath)}`);
  }
});
