// Best-effort brute-force throttle. Serverless instances are ephemeral so this
// is defence-in-depth, paired with a timing-safe compare and an artificial delay.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW = 15 * 60_000; // 15 minutes
const MAX = 5;

export default defineEventHandler(async (event) => {
  const { adminPassphrase } = useRuntimeConfig(event);
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
  const now = Date.now();
  const rec = attempts.get(ip);

  if (rec && now - rec.first < WINDOW && rec.count >= MAX) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many attempts. Please try again later.",
    });
  }

  const { passphrase } = await readBody<{ passphrase?: string }>(event);
  await new Promise((resolve) => setTimeout(resolve, 300)); // slow brute force

  const ok =
    !!adminPassphrase && timingSafeEqualStr(passphrase ?? "", adminPassphrase);

  if (!ok) {
    attempts.set(
      ip,
      rec && now - rec.first < WINDOW
        ? { count: rec.count + 1, first: rec.first }
        : { count: 1, first: now },
    );
    throw createError({ statusCode: 401, statusMessage: "Incorrect passphrase." });
  }

  attempts.delete(ip);
  const session = await useAdminSession(event);
  await session.update({ admin: true, loginAt: now });
  return { success: true };
});
