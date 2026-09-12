import newsletterLog from "~~/data/newsletter-log.json";
import type { AdminKpi, AdminNewsletter } from "~/utils/types/admin";

interface Edition {
  date: string;
  type: string;
  mainFeature: string;
  alsoRead: string[];
  region: string | null;
  subject: string;
}

const DATE_FMT = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
});

/**
 * The send log is data/newsletter-log.json, committed by the newsletter cron.
 * It is imported rather than read from disk so it lands in the serverless
 * bundle — the repo's data/ directory does not ship with the function.
 *
 * Buttondown supplies subscriber counts. It does not give us per-issue open
 * and click rates through this endpoint, and the log does not record them, so
 * those tiles report unavailable rather than inventing a number.
 */
export default defineEventHandler(async (event): Promise<AdminNewsletter> => {
  await requireAdmin(event);

  const editions = ((newsletterLog as { editions?: Edition[] }).editions ?? [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  const total = editions.length;
  const sendLog = editions.slice(0, 12).map((e, i) => ({
    no: total - i,
    subject: e.subject,
    sent: DATE_FMT.format(new Date(`${e.date}T00:00:00`)),
    type: e.type,
    mainFeature: e.mainFeature,
  }));

  const subscribers = await subscriberCounts();

  const tiles: AdminKpi[] = [
    {
      label: "Confirmed",
      value: subscribers ? subscribers.confirmed.toLocaleString("en") : "—",
      delta: "",
      note: subscribers ? "subscribers" : "Buttondown not configured",
      up: true,
    },
    {
      label: "Pending confirm",
      value: subscribers ? subscribers.pending.toLocaleString("en") : "—",
      delta: "",
      note: subscribers ? "awaiting double opt-in" : "Buttondown not configured",
      up: false,
    },
    {
      label: "Issues sent",
      value: String(total),
      delta: editions[0] ? `latest ${DATE_FMT.format(new Date(`${editions[0].date}T00:00:00`))}` : "",
      note: "from the newsletter log",
      up: true,
    },
    {
      label: "Open rate",
      value: "—",
      delta: "",
      note: "not recorded in the log",
      up: false,
    },
  ];

  return { tiles, sendLog, subscribers, metricsUnavailable: true };
});
