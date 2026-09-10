/**
 * Clip `text` so it is at most `max` characters long, cutting at a word
 * boundary and stripping any trailing `,` `:` `;` left behind by the cut.
 * Returns the trimmed text unchanged when it already fits.
 */
export function clipAtWord(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;

  // Look one character past the limit so a word ending exactly at `max` survives.
  const window = trimmed.slice(0, max + 1);
  const lastSpace = window.lastIndexOf(" ");
  const clipped = lastSpace > 0 ? window.slice(0, lastSpace) : trimmed.slice(0, max);

  return clipped.replace(/[\s,:;]+$/, "");
}

/**
 * Build a meta description of at most `max` characters from `text`:
 * whole sentences are accumulated while the total still fits; if even the
 * first sentence is too long, it is clipped at a word boundary and ended
 * with an ellipsis.
 */
export function seoDescription(text: string, max = 155): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;

  const sentences = trimmed.split(/(?<=[.!?])\s+/);
  let result = "";
  for (const sentence of sentences) {
    const candidate = result ? `${result} ${sentence}` : sentence;
    if (candidate.length > max) break;
    result = candidate;
  }

  if (result) return result;
  return `${clipAtWord(trimmed, max - 1)}…`;
}
