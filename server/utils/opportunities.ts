import { queryCollection } from "@nuxt/content/server";
import type { H3Event } from "h3";
import type {
  AdminOpportunities,
  AdminOpportunity,
  AdminOpportunityStatus,
} from "~/utils/types/admin";

/** Inside this many days a deadline counts as closing rather than open. */
const CLOSING_DAYS = 7;

const DATE_FMT = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Opportunity rows with a status derived at request time — the collection
 * stores a deadline, not a state, so "closing" has to be computed against
 * today on every load rather than baked in at build.
 */
export async function opportunityRows(
  event: H3Event,
): Promise<AdminOpportunities> {
  const items = await queryCollection(event, "opportunities")
    .select("slug", "title", "organization", "category", "deadline")
    .all();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows: AdminOpportunity[] = items.map((o) => {
    let status: AdminOpportunityStatus = "Needs review";
    let deadlineLabel = "No deadline";

    const due = o.deadline ? new Date(`${o.deadline}T00:00:00`) : null;
    if (due && !Number.isNaN(due.getTime())) {
      const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);
      status = days < 0 ? "Expired" : days <= CLOSING_DAYS ? "Closing" : "Open";
      deadlineLabel = DATE_FMT.format(due);
    }

    return {
      slug: o.slug,
      title: o.title,
      org: o.organization,
      category: o.category,
      deadline: o.deadline ?? null,
      deadlineLabel,
      status,
    };
  });

  // Soonest deadline first; the undated ones you have to chase sit at the end.
  rows.sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));

  return {
    rows,
    counts: {
      all: rows.length,
      closing: rows.filter((r) => r.status === "Closing").length,
      needsReview: rows.filter((r) => r.status === "Needs review").length,
      expired: rows.filter((r) => r.status === "Expired").length,
    },
  };
}
