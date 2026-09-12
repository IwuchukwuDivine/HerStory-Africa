import { queryCollection } from "@nuxt/content/server";
import type {
  AdminKpi,
  AdminOverview,
  AdminQueueItem,
  AdminSuggestion,
} from "~/utils/types/admin";

const MONTH_FMT = new Intl.DateTimeFormat("en", { month: "short" });

const DAY_MS = 86_400_000;

/** YYYY-MM for a date, the key the growth chart buckets on. */
const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

/**
 * The overview stitches six independent sources together: two content
 * collections, GA4, GitHub, Buttondown and the derived health/opportunity
 * views. Any of them can be down or unconfigured, so each is caught
 * individually and named in `unavailable` — the page renders what it has and
 * says plainly what it could not reach, rather than showing a confident zero.
 */
export default defineEventHandler(async (event): Promise<AdminOverview> => {
  await requireAdmin(event);

  const unavailable: string[] = [];

  const [women, articles, health, opportunities, analytics, subscribers, suggestions] =
    await Promise.all([
      queryCollection(event, "women").select("slug", "name", "dateAdded").all(),
      queryCollection(event, "articles").select("slug", "title", "date").all(),
      contentHealth(event),
      opportunityRows(event),
      tryGa4Report(),
      subscriberCounts(),
      listSuggestions()
        .then((issues) =>
          issues
            .filter((i) => !i.pull_request)
            .map(
              (i) =>
                ({
                  number: i.number,
                  title: i.title,
                  url: i.html_url,
                  createdAt: i.created_at,
                  parsed: parseSuggestion(i.body ?? ""),
                }) satisfies AdminSuggestion,
            ),
        )
        .catch(() => null),
    ]);

  if (!analytics) unavailable.push("Google Analytics");
  if (!subscribers) unavailable.push("Buttondown");
  if (!suggestions) unavailable.push("GitHub");

  const now = new Date();
  const thisMonth = monthKey(now);

  const profilesThisMonth = women.filter(
    (w) => w.dateAdded?.slice(0, 7) === thisMonth,
  ).length;
  const articlesThisMonth = articles.filter(
    (a) => a.date?.slice(0, 7) === thisMonth,
  ).length;

  // Twelve buckets ending on the current month, so the chart always spans a
  // year even when a month added nothing.
  const growth: AdminOverview["growth"] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    growth.push({
      month: key,
      label: MONTH_FMT.format(d).charAt(0),
      count: women.filter((w) => w.dateAdded?.slice(0, 7) === key).length,
    });
  }

  const openSuggestions = suggestions?.length ?? 0;
  const newSuggestions =
    suggestions?.filter(
      (s) => now.getTime() - new Date(s.createdAt).getTime() < 7 * DAY_MS,
    ).length ?? 0;
  const oldest = suggestions?.reduce<AdminSuggestion | null>(
    (acc, s) => (!acc || s.createdAt < acc.createdAt ? s : acc),
    null,
  );
  const oldestDays = oldest
    ? Math.floor((now.getTime() - new Date(oldest.createdAt).getTime()) / DAY_MS)
    : 0;

  const newest = suggestions?.reduce<AdminSuggestion | null>(
    (acc, s) => (!acc || s.createdAt > acc.createdAt ? s : acc),
    null,
  );

  const kpis: AdminKpi[] = [
    {
      label: "Profiles live",
      value: women.length.toLocaleString("en"),
      delta: profilesThisMonth ? `+${profilesThisMonth}` : "—",
      note: "this month",
      up: profilesThisMonth > 0,
    },
    {
      label: "Articles",
      value: articles.length.toLocaleString("en"),
      delta: articlesThisMonth ? `+${articlesThisMonth}` : "—",
      note: "this month",
      up: articlesThisMonth > 0,
    },
    {
      label: "Open suggestions",
      value: suggestions ? String(openSuggestions) : "—",
      delta: suggestions ? (newSuggestions ? `${newSuggestions} new` : "none new") : "",
      note: suggestions
        ? oldest
          ? `oldest ${oldestDays} days`
          : "nothing waiting"
        : "GitHub unreachable",
      up: false,
    },
    {
      label: "Subscribers",
      value: subscribers ? subscribers.confirmed.toLocaleString("en") : "—",
      delta: subscribers && subscribers.pending ? `${subscribers.pending} pending` : "",
      note: subscribers ? "confirmed" : "Buttondown not configured",
      up: true,
    },
    {
      label: "Readers, 28d",
      value: analytics ? analytics.totals.totalUsers.toLocaleString("en") : "—",
      delta: "",
      note: analytics
        ? `${analytics.totals.screenPageViews.toLocaleString("en")} page views`
        : "GA4 not connected",
      up: true,
    },
    {
      label: "Content gaps",
      value: String(health.totals.needingWork),
      delta: "profiles",
      note: "missing photo or source",
      up: false,
    },
  ];

  // Everything in the queue is a real, actionable finding. No row is added
  // unless its underlying count is non-zero.
  const queue: AdminQueueItem[] = [];

  if (newest) {
    const days = Math.floor(
      (now.getTime() - new Date(newest.createdAt).getTime()) / DAY_MS,
    );
    queue.push({
      title: `${newest.parsed.name || newest.title} suggested`,
      meta: `Suggestion #${newest.number} · ${days === 0 ? "today" : `${days} days old`}`,
      action: "Review",
      tone: "primary",
      to: "/admin/suggestions",
    });
  }

  if (health.totals.noPortrait > 0) {
    queue.push({
      title: `${health.totals.noPortrait} profiles have no portrait`,
      meta: "Still on the shared placeholder",
      action: "Fix",
      tone: "crimson",
      to: "/admin/health",
    });
  }

  const closing = opportunities.rows.filter((r) => r.status === "Closing");
  for (const o of closing.slice(0, 2)) {
    queue.push({
      title: `${o.title} closes ${o.deadlineLabel}`,
      meta: `Opportunity · ${o.org}`,
      action: "Verify",
      tone: "crimson",
      to: "/admin/opportunities",
    });
  }

  if (opportunities.counts.expired > 0) {
    queue.push({
      title: `${opportunities.counts.expired} opportunities have expired`,
      meta: "The Monday cron removes these on its next run",
      action: "Review",
      tone: "secondary",
      to: "/admin/opportunities",
    });
  }

  const missingSources = health.rows.filter((r) => r.sources === "bad").length;
  if (missingSources > 0) {
    queue.push({
      title: `${missingSources} profiles cite no sources`,
      meta: "No trailing Sources line in the body",
      action: "Cite",
      tone: "secondary",
      to: "/admin/health",
    });
  }

  return {
    kpis,
    queue,
    growth,
    topPages: analytics?.topPages.slice(0, 5) ?? [],
    badges: {
      suggestions: suggestions ? openSuggestions : null,
      health: health.totals.needingWork,
      opportunities: opportunities.counts.closing + opportunities.counts.expired,
    },
    unavailable,
  };
});
