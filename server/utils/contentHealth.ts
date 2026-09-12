import { queryCollection } from "@nuxt/content/server";
import type { H3Event } from "h3";
import type {
  AdminHealth,
  AdminHealthFlag,
  AdminHealthRow,
} from "~/utils/types/admin";

/** Under this many words a profile is a stub rather than a biography. */
const STUB_WORDS = 150;
/** Under this it reads as thin but usable. The `shortBio` total counts both
    bands, so the stat tile and the Bio column always agree. */
const SHORT_WORDS = 400;

function sourcesFlag(count: number): [AdminHealthFlag, string] {
  if (count === 0) return ["bad", "None"];
  if (count === 1) return ["warn", "1 source"];
  return ["ok", "Cited"];
}

function bioFlag(words: number): [AdminHealthFlag, string] {
  if (words < STUB_WORDS) return ["bad", "Stub"];
  if (words < SHORT_WORDS) return ["warn", "Short"];
  return ["ok", "Full"];
}

/**
 * Content health for every published profile, from the three signals frozen
 * at build by the content:file:afterParse hook in nuxt.config.ts.
 *
 * Only profiles that need work are returned as rows — that is what the view
 * is for — while the totals cover the whole archive.
 */
export async function contentHealth(event: H3Event): Promise<AdminHealth> {
  const women = await queryCollection(event, "women")
    .select("slug", "name", "region", "wordCount", "sourceCount", "hasPortrait")
    .all();

  const rows: AdminHealthRow[] = [];
  let noPortrait = 0;
  let singleSource = 0;
  let shortBio = 0;

  for (const w of women) {
    const words = w.wordCount ?? 0;
    const [sources, sourceLabel] = sourcesFlag(w.sourceCount ?? 0);
    const [bio, bioLabel] = bioFlag(words);
    const portrait: AdminHealthFlag = w.hasPortrait ? "ok" : "bad";

    if (portrait === "bad") noPortrait++;
    if (sources !== "ok") singleSource++;
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
      wordCount: words,
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
      profiles: women.length,
    },
    rows,
  };
}
