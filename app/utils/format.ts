/** Shared formatting helpers for the redesign (dates, names, photos). */

/** "1900–1978", "1965–present", or "Unknown" when no birth year. */
export function lifespan(born: number | null | undefined, died: number | null | undefined): string {
  if (!born && !died) return "Unknown";
  const start = born ?? "Unknown";
  if (died) return `${start}–${died}`;
  return born ? `${born}–present` : String(start);
}

/** True when the image is a real photograph rather than the grey placeholder. */
export function hasPortrait(image: string | null | undefined): boolean {
  return !!image && !image.includes("placeholder");
}

/** First letter of a name, accents stripped, "#" for non-Latin initials. */
export function initialOf(name: string): string {
  const first = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .charAt(0)
    .toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

/** "Waris Dirie" -> "Waris"; keeps titles like "Queen Amina" whole. */
export function firstName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const honorifics = new Set(["queen", "empress", "princess", "dr", "dr.", "chief", "madam", "mama", "nana"]);
  if (parts.length > 1 && honorifics.has(parts[0]!.toLowerCase())) return `${parts[0]} ${parts[1]}`;
  return parts[0] ?? name;
}

/** "17 March 2026" */
export function longDate(iso: string | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** "8 min" from a reading time in minutes. */
export function minutesLabel(minutes: number | null | undefined): string {
  return `${Math.max(1, Math.round(minutes ?? 1))} min`;
}

/** Sentence case for headings: "West African Women Who Shaped History" -> "West African women who shaped history". Keeps words that look like proper nouns (all-caps or already lowercase). */
export function sentenceCase(text: string, keep: readonly string[] = []): string {
  const keepSet = new Set(keep.map((k) => k.toLowerCase()));
  return text
    .split(" ")
    .map((word, i) => {
      if (i === 0) return word;
      if (keepSet.has(word.toLowerCase().replace(/[^a-z']/g, ""))) return word;
      if (word === word.toUpperCase() && word.length > 1) return word;
      return word.charAt(0).toLowerCase() + word.slice(1);
    })
    .join(" ");
}

/** Cut at a word boundary with an ellipsis. */
export function clip(text: string, max: number): string {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 0)).trimEnd()}…`;
}

/** Path data for the continent mark used in captions, no-photo states and cards. */
export const AFRICA_PATH =
  "M 16,1 C 20,1 24,3 25,7 C 26,10 27,14 25,18 C 27,22 26,26 24,28 C 22,30 19,31 16,31 C 13,31 10,30 8,28 C 6,26 5,22 7,18 C 5,14 6,10 7,7 C 8,3 12,1 16,1 Z";
