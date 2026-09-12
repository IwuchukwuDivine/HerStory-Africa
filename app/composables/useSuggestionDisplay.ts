import type { AdminSuggestion } from "~/utils/types/admin";

const DATE_FMT = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/**
 * Shared derivations for a suggestion, so the list row and the detail pane
 * always agree on what a submission is called and how healthy it looks.
 *
 * The parser produces every field as optional (see server/utils/parseSuggestion.ts)
 * and a GitHub-template submission never carries a submitter name or email, so
 * each of these has to survive the whole object being empty apart from `raw`.
 */
export function useSuggestionDisplay() {
  function nameOf(s: AdminSuggestion) {
    return (
      s.parsed.name ||
      s.title.replace(/^Suggestion:\s*/i, "").trim() ||
      "Unnamed suggestion"
    );
  }

  function reasonOf(s: AdminSuggestion) {
    return s.parsed.reason || "No reason given — open the issue to read it raw.";
  }

  function metaOf(s: AdminSuggestion) {
    const country = s.parsed.country ? `${s.parsed.country} · ` : "";
    return `${country}#${s.number} · ${DATE_FMT.format(new Date(s.createdAt))}`;
  }

  function daysOf(s: AdminSuggestion) {
    return Math.floor(
      (Date.now() - new Date(s.createdAt).getTime()) / 86_400_000,
    );
  }

  function ageOf(s: AdminSuggestion) {
    const days = daysOf(s);
    return days === 0 ? "today" : `${days}d`;
  }

  /**
   * How much work a submission still needs before it can be accepted:
   * unparsed bodies need reading by hand, and one without an email can be
   * closed but never acknowledged.
   */
  function statusOf(s: AdminSuggestion): {
    label: string;
    tone: "ok" | "warn" | "muted";
  } {
    if (!s.parsed.name && !s.parsed.reason) return { label: "Raw", tone: "muted" };
    if (!s.parsed.submitterEmail) return { label: "No email", tone: "warn" };
    return { label: "Parsed", tone: "ok" };
  }

  return { nameOf, reasonOf, metaOf, daysOf, ageOf, statusOf };
}
