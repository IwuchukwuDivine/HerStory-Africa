import snapshot from "herstory-content-snapshot";
import type {
  AdminHealth,
  AdminHealthFlag,
  AdminHealthRow,
} from "~/utils/types/admin";

function sourcesFlag(count: number): [AdminHealthFlag, string] {
  if (count === 0) return ["bad", "None"];
  if (count === 1) return ["warn", "1 source"];
  return ["ok", "Cited"];
}

function bioFlag(words: number, stub: number, short: number): [AdminHealthFlag, string] {
  if (words < stub) return ["bad", "Stub"];
  if (words < short) return ["warn", "Short"];
  return ["ok", "Full"];
}

/**
 * Content health for every published profile, read from the build-time
 * snapshot in nuxt.config.ts. No database: `queryCollection` is unavailable
 * inside the deployed function, and the archive only changes on deploy.
 *
 * Only profiles that need work are returned as rows — that is what the view
 * is for — while the totals cover the whole archive.
 */
export function contentHealth(): AdminHealth {
  const rows: AdminHealthRow[] = [];
  let noPortrait = 0;
  let singleSource = 0;
  let shortBio = 0;

  for (const w of snapshot.women) {
    const [sources, sourceLabel] = sourcesFlag(w.sourceCount);
    const [bio, bioLabel] = bioFlag(w.wordCount, w.stubWords, w.shortWords);
    const portrait: AdminHealthFlag = w.hasPortrait ? "ok" : "bad";

    if (portrait === "bad") noPortrait++;
    if (sources !== "ok") singleSource++;
    // Counts both thin bands, so the stat tile and the Bio column agree.
    if (bio !== "ok") shortBio++;

    if (portrait === "ok" && sources === "ok" && bio === "ok") continue;

    rows.push({
      slug: w.slug,
      name: w.name,
      region: w.region,
      portrait,
      sources,
      sourceLabel,
      bio,
      bioLabel,
      wordCount: w.wordCount,
    });
  }

  // Worst first: a profile failing three checks outranks one failing a single
  // check, so the top of the table is always the best use of an hour.
  const weight = (r: AdminHealthRow) =>
    (r.portrait === "bad" ? 4 : 0) +
    (r.sources === "bad" ? 2 : r.sources === "warn" ? 1 : 0) +
    (r.bio === "bad" ? 2 : r.bio === "warn" ? 1 : 0);
  rows.sort((a, b) => weight(b) - weight(a) || a.name.localeCompare(b.name));

  return {
    totals: {
      needingWork: rows.length,
      noPortrait,
      singleSource,
      shortBio,
      profiles: snapshot.women.length,
    },
    rows,
  };
}
