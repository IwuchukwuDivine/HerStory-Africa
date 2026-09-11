const FALLBACK_SITE_URL = "https://herstoryafrica.com.ng";

export default (path?: string) => {
  const siteUrl = String(
    useRuntimeConfig().public.siteUrl || FALLBACK_SITE_URL,
  ).replace(/\/$/, "");
  if (!path) return `${siteUrl}/og-image.png`;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
