// The GA4 query lives in server/utils/ga4.ts so the overview endpoint can
// reuse it. The response shape and every error code are unchanged: the UI
// still special-cases 503 to show the "not connected yet" setup state.
export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  return await fetchGa4Report();
});
