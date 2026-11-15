// Shared wrapper for the Resend-hosted transactional templates (welcome and
// suggestion replies). Quiet writing paper, so they sit beside the newsletter
// layouts without competing with them. Pushed to Resend by
// scripts/resend-setup.mjs; Resend renders them, so variables use its
// {{{name}}} syntax.
//
// Never put a {{{variable}}} inside a heading tag: Resend builds the plain-text
// part from the HTML and uppercases headings, which breaks the variable name.

const PAPER = "#fbf7f0";
const MAT = "#efe4d3";
const INK = "#2b211a";
const MUTED = "#6b5a4a";
const ACCENT = "#b5451b";

export const SITE = "https://herstoryafrica.com.ng";

export const p = (html) =>
  `<p style="margin:0 0 18px 0; font-family:Georgia, 'Times New Roman', serif; font-size:18px; line-height:1.6; color:${INK};">${html}</p>`;

export const a = (href, label) =>
  `<a href="${href}" style="color:${ACCENT}; text-decoration:underline;">${label}</a>`;

export const button = (href, label) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 24px 0;">
<tr><td bgcolor="${ACCENT}" style="border-radius:999px; background-color:${ACCENT};">
  <a href="${href}" style="display:inline-block; padding:13px 24px; font-family:Georgia, 'Times New Roman', serif; font-size:17px; color:#ffffff; text-decoration:none; border-radius:999px;">${label}</a>
</td></tr>
</table>`;

export const signature = () =>
  `<p style="margin:26px 0 0 0; font-family:Georgia, 'Times New Roman', serif; font-size:20px; font-style:italic; color:${INK};">Deevyn</p>`;

export function page({ title, preview, body, footer }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${title}</title>
</head>
<body style="margin:0; padding:0;">
<div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:${MAT}; opacity:0;">${preview} ${"&#847;&zwnj;&nbsp;".repeat(14)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="padding:0;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:100%; background-color:${MAT};">
  <tr><td style="padding:20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAPER};">
    <tr><td style="padding:34px 32px 30px 32px;">
      <p style="margin:0 0 26px 0; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:2px; text-transform:uppercase; color:${ACCENT};">HerStory Africa</p>
${body}
    </td></tr>
    </table>
    <p style="margin:16px 4px 0 4px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; line-height:1.6; color:${MUTED};">${footer}</p>
  </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>
`;
}
