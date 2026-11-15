import type { AdminEdition, AdminKpi, AdminNewsletter } from "~/utils/types/admin";
import type { Broadcast } from "~~/server/utils/newsletter";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "Africa/Lagos",
});

/**
 * Every built edition with where it stands in Resend, plus subscriber counts.
 *
 * Editions come from server/assets/newsletter/ (written by the build and
 * deployed with the site). Their status comes from Resend, matched by the
 * broadcast name. Resend calls run one after another: the account's rate
 * limit is low and this view is only opened by the editor.
 */
export default defineEventHandler(async (event): Promise<AdminNewsletter> => {
  await requireAdmin(event);
  const { newsletterTestAddress } = useRuntimeConfig(event);

  const metas = await listEditions();

  let resendError: string | null = null;
  let broadcasts = new Map<string, Broadcast>();
  try {
    broadcasts = await broadcastsBySlug();
  } catch (error) {
    resendError = (error as { statusMessage?: string; message?: string }).statusMessage
      ?? (error as Error).message
      ?? "Resend is unreachable.";
  }

  const editions: AdminEdition[] = [];
  for (const meta of metas) {
    const broadcast = broadcasts.get(meta.slug);
    let outOfDate: boolean | null = null;
    if (broadcast && (broadcast.status === "draft" || broadcast.status === "scheduled")) {
      try {
        const detail = await getBroadcast(broadcast.id);
        const edition = await readEdition(meta.slug);
        outOfDate = !broadcastMatches(detail, edition);
      } catch {
        outOfDate = null;
      }
    }
    editions.push({
      slug: meta.slug,
      number: meta.number,
      subject: meta.subject,
      preview: meta.preview,
      layout: meta.layout,
      register: meta.register,
      date: meta.date,
      sendAt: meta.sendAt,
      status: resendError ? "local" : (broadcast?.status ?? "local"),
      broadcastId: broadcast?.id ?? null,
      scheduledAt: broadcast?.scheduled_at ?? null,
      sentAt: broadcast?.sent_at ?? null,
      outOfDate,
    });
  }

  const subscribers = resendError ? null : await newsletterAudience();
  const sent = editions.filter((e) => e.status === "sent");
  const next = editions
    .filter((e) => e.status !== "sent" && e.status !== "canceled")
    .sort((a, b) => a.sendAt.localeCompare(b.sendAt))[0];

  const tiles: AdminKpi[] = [
    {
      label: "Subscribed",
      value: subscribers ? subscribers.subscribed.toLocaleString("en") : "—",
      delta: "",
      note: subscribers ? "in the General segment" : "Resend unavailable",
      up: true,
    },
    {
      label: "Unsubscribed",
      value: subscribers ? subscribers.unsubscribed.toLocaleString("en") : "—",
      delta: "",
      note: subscribers ? "still held in Resend" : "Resend unavailable",
      up: false,
    },
    {
      label: "Editions sent",
      value: String(sent.length),
      delta: "",
      note: `${editions.length} built`,
      up: true,
    },
    {
      label: "Next edition",
      value: next ? `No. ${next.number}` : "—",
      delta: next ? DATE_FMT.format(new Date(next.sendAt)) : "",
      note: next ? (next.status === "scheduled" ? "scheduled" : "not scheduled yet") : "nothing waiting",
      up: next?.status === "scheduled",
    },
  ];

  return {
    tiles,
    editions,
    subscribers,
    testAddress: newsletterTestAddress || null,
    resendError,
  };
});
