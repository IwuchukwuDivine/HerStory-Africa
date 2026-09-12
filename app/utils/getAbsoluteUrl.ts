const SITE_URL = (
  process.env.NUXT_SITE_URL || "https://herstoryafrica.com.ng"
).replace(/\/$/, "");

export default (path?: string) => {
  if (!path) return `${SITE_URL}/og-image.png`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
