import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Lazy singleton — grpc client is expensive to build; reuse across warm invocations.
let client: BetaAnalyticsDataClient | null = null;
function getClient(credentials: Record<string, unknown>) {
  if (!client) client = new BetaAnalyticsDataClient({ credentials });
  return client;
}

const num = (v: unknown) => Number(v ?? 0);

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const { ga4PropertyId, ga4Credentials } = useRuntimeConfig();

  if (!ga4PropertyId || !ga4Credentials) {
    throw createError({
      statusCode: 503,
      statusMessage: "Analytics is not configured yet.",
    });
  }

  // Accept either raw JSON (starts with "{") or base64-encoded JSON. Base64 is
  // recommended — it survives .env and Vercel without quoting/newline issues.
  let credentials: Record<string, unknown>;
  try {
    const text = ga4Credentials.trim().startsWith("{")
      ? ga4Credentials
      : Buffer.from(ga4Credentials, "base64").toString("utf8");
    credentials = JSON.parse(text);
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Analytics credentials are not valid JSON.",
    });
  }

  const analytics = getClient(credentials);
  const property = `properties/${ga4PropertyId}`;
  const dateRanges = [{ startDate: "28daysAgo", endDate: "today" }];

  try {
    const [totals, trend, topPages, sources] = await Promise.all([
      analytics.runReport({
        property,
        dateRanges,
        metrics: [{ name: "totalUsers" }, { name: "screenPageViews" }],
      }),
      analytics.runReport({
        property,
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "totalUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      analytics.runReport({
        property,
        dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      analytics.runReport({
        property,
        dateRanges,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      }),
    ]);

    const totalsRow = totals[0]?.rows?.[0];

    return {
      totals: {
        totalUsers: num(totalsRow?.metricValues?.[0]?.value),
        screenPageViews: num(totalsRow?.metricValues?.[1]?.value),
      },
      trend: (trend[0]?.rows ?? []).map((r) => ({
        date: r.dimensionValues?.[0]?.value ?? "",
        users: num(r.metricValues?.[0]?.value),
        views: num(r.metricValues?.[1]?.value),
      })),
      topPages: (topPages[0]?.rows ?? []).map((r) => ({
        path: r.dimensionValues?.[0]?.value ?? "",
        views: num(r.metricValues?.[0]?.value),
      })),
      sources: (sources[0]?.rows ?? []).map((r) => ({
        channel: r.dimensionValues?.[0]?.value ?? "",
        sessions: num(r.metricValues?.[0]?.value),
      })),
    };
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Couldn't reach Google Analytics.",
    });
  }
});
