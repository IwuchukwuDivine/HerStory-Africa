/** Display names for the newsletter layouts in emails/layouts/. */
const LAYOUT_NAMES: Record<string, string> = {
  "love-letter": "Love letter",
  letter: "Letter",
  bulletin: "Bulletin",
};

export const layoutName = (id: string) => LAYOUT_NAMES[id] ?? id;

const EDITION_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "1 December 2026" from an edition's YYYY-MM-DD date. */
export const formatEditionDate = (iso: string) =>
  EDITION_DATE.format(new Date(`${iso}T12:00:00Z`));
