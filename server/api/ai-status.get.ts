export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const baseUrl = config.ollamaBaseUrl || "http://localhost:11434";

  try {
    await $fetch(baseUrl, { timeout: 3000 });
    return { live: true };
  } catch {
    return { live: false };
  }
});
