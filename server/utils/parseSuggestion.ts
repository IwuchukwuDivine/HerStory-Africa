export interface ParsedSuggestion {
  name?: string;
  country?: string;
  reason?: string;
  sources?: string;
  submitterName?: string;
  submitterEmail?: string;
  raw: string;
}

// Suggestions arrive in two body formats:
//   A) the web form (server/api/suggest.post.ts): `**Name:** X` etc.
//   B) the GitHub issue template (.github/ISSUE_TEMPLATE): `### Heading` blocks.
// Parse both, and always return `raw` so the UI can fall back to the original
// body when parsing yields nothing.
export function parseSuggestion(body: string): ParsedSuggestion {
  const raw = body ?? "";
  const out: ParsedSuggestion = { raw };

  // ── Format A — web form ──
  const label = (re: RegExp) => raw.match(re)?.[1]?.trim() || undefined;
  out.name = label(/\*\*Name:\*\*\s*(.+)/);
  out.country = label(/\*\*Country \/ Region:\*\*\s*(.+)/);

  const reasonText = raw
    .match(/\*\*Why she should be featured:\*\*\s*\n([\s\S]*?)\n---/)?.[1]
    ?.trim();
  if (reasonText) out.reason = reasonText;

  const byName = raw.match(/Submitted by:\s*(.+)/)?.[1]?.trim();
  if (byName && !/Submitted anonymously/i.test(byName)) {
    out.submitterName = byName;
  }
  out.submitterEmail = label(/Contact:\s*(\S+@\S+)/);

  // ── Format B — GitHub issue template (only if Format A found no name) ──
  if (!out.name) {
    const blocks = [
      ...raw.matchAll(/^###\s+(.+?)\s*\n+([\s\S]*?)(?=\n###\s|\s*$)/gm),
    ];
    const pick = (needles: string[]) => {
      const block = blocks.find((m) =>
        needles.some((n) => (m[1] ?? "").toLowerCase().includes(n)),
      );
      const value = block?.[2]?.trim();
      return value && value !== "_No response_" ? value : undefined;
    };
    out.name = pick(["her name", "name"]);
    out.country = pick(["country", "region"]);
    out.reason = pick(["why", "feature"]);
    out.sources = pick(["source"]);
  }

  return out;
}
