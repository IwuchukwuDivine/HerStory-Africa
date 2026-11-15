// Helpers shared by every newsletter layout. Layouts stay small: they only
// decide how each block looks.

export const SITE = "https://herstoryafrica.com.ng";

/** Resend swaps this for each reader's own unsubscribe link. */
export const UNSUBSCRIBE = "{{{RESEND_UNSUBSCRIBE_URL}}}";

export const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Inline Markdown for edition copy: [text](url), **bold**, *italic*, __underline__.
 * `link` is the inline style each layout wants on its links.
 */
export function inline(text = "", { link = "" } = {}) {
  return esc(text)
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_, label, url) => `<a href="${url}" style="${link}">${label}</a>`,
    )
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/__([^_]+)__/g, "<u>$1</u>")
    .replace(/\*([^*]+)\*/g, "<i>$1</i>");
}

/**
 * Edition body → blocks. Paragraphs are separated by a blank line.
 * Directives sit on their own line:
 *   :::photo            the portrait, wherever the layout allows it to move
 *   :::fold             a pause (a paper crease, a rule)
 *   :::highlight Text   the line the whole edition turns on
 *   :::column           start the next column (layouts with columns)
 *   ## Text             a small subhead
 */
export function parseBody(body = "") {
  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const directive = chunk.match(/^:::(\w+)\s*(.*)$/s);
      if (directive) return { type: directive[1], text: directive[2].trim() };
      if (chunk.startsWith("## ")) return { type: "subhead", text: chunk.slice(3).trim() };
      return { type: "p", text: chunk.replace(/\s*\n\s*/g, " ") };
    });
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function ordinal(n) {
  const rem = n % 100;
  if (rem >= 11 && rem <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

/** "Tuesday, 1 December 2026", or the longhand a letter writer would use. */
export function formatDate(iso, style = "plain") {
  const d = new Date(`${iso}T12:00:00Z`);
  const day = DAYS[d.getUTCDay()];
  const month = MONTHS[d.getUTCMonth()];
  if (style === "longhand") return `${day}, the ${ordinal(d.getUTCDate())} of ${month}, ${d.getUTCFullYear()}`;
  return `${day}, ${d.getUTCDate()} ${month} ${d.getUTCFullYear()}`;
}

/** Hidden inbox preview line, padded so the body copy does not leak in after it. */
export function preheader(text, colour) {
  const pad = "&#847;&zwnj;&nbsp;".repeat(14);
  return `<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${colour}; opacity:0;">${esc(text)} ${pad}</div>`;
}

/**
 * The document every layout sits in. These emails are printed matter, so they
 * stay on their paper colours in dark mode.
 */
export function shell({ title, preview, background, fontHref, css = "", content }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(title)}</title>
${fontHref ? `<!--[if !mso]><!-->\n<link href="${fontHref}" rel="stylesheet">\n<!--<![endif]-->` : ""}
<style>
  :root { color-scheme: light only; }
  body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; }
  table { border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0; }
  img { border:0; display:block; outline:none; text-decoration:none; }
  @media only screen and (max-width:620px) {
    .shell { width:100% !important; }
    .mat { width:100% !important; }
    .mat-pad { padding:14px 10px 18px 10px !important; }
${css}
  }
</style>
</head>
<body style="margin:0; padding:0;">
${preheader(preview, "#ffffff")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="padding:0;">
  <!-- The mat: a narrow band of the layout's surface colour around the paper,
       so wide screens do not get two slabs of colour either side. -->
  <table role="presentation" class="mat" width="644" cellpadding="0" cellspacing="0" border="0" style="width:644px; max-width:100%; background-color:${background};">
  <tr><td class="mat-pad" align="center" style="padding:22px 22px 26px 22px;">
${content}
  </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>
`;
}

/**
 * The site's address as a real link in the layout's own ink. Left as plain
 * text, Gmail turns it into a blue link of its own.
 */
export const siteLink = (colour) =>
  `<a href="${SITE}" style="color:${colour}; text-decoration:none;">herstoryafrica.com.ng</a>`;

/** Where "Read in your browser" and the archive point for an edition. */
export const links = (edition) => ({
  browser: `${SITE}/newsletter/${edition.slug}`,
  archive: `${SITE}/newsletter/archive`,
  story: edition.link,
});
