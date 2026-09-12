/**
 * URL slug for a region, era, or cause value:
 * lowercase, `&` becomes "and", apostrophes are dropped, every other run of
 * non-alphanumerics becomes a single hyphen.
 */
const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default slugify;

/** Map a slug back to the exact value it was made from, or undefined. */
export function unslugify<T extends string>(
  values: readonly T[],
  slug: string,
): T | undefined {
  return values.find((v) => slugify(v) === slug);
}

export interface CauseHub {
  cause: string;
  slug: string;
  count: number;
}

/**
 * Distinct causes used across the given women, with their slug and count,
 * sorted by count (desc) then name. Only causes shared by at least `min`
 * women are returned; those are the ones that get a hub page.
 */
export function causeHubs(
  women: ReadonlyArray<{ causes: string[] }>,
  min = 3,
): CauseHub[] {
  const counts = new Map<string, number>();
  for (const w of women) {
    for (const c of w.causes) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= min)
    .map(([cause, count]) => ({ cause, slug: slugify(cause), count }))
    .sort((a, b) => b.count - a.count || a.cause.localeCompare(b.cause));
}

const SMALL_WORDS = new Set(["a", "an", "and", "for", "in", "of", "the", "&"]);

/** "Women's political participation" -> "Women's Political Participation". */
export function titleCaseCause(cause: string): string {
  return cause
    .split(" ")
    .map((word, i) => {
      if (i > 0 && SMALL_WORDS.has(word.toLowerCase())) return word;
      if (word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
