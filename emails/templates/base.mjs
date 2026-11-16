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
export const KIT = `${SITE}/newsletter/kit`;

/* ── The writing paper ──────────────────────────────────────────────
   The welcome wears the same paper as the letters themselves, so the first
   thing a new subscriber sees is the thing they signed up for. Artwork is
   fixed and lives in public/newsletter/kit/, drawn by npm run newsletter:kit,
   because a hosted template is the same HTML for every reader.            */

const DESK = "#cfc3ab";
const SHEET = "#f7f0e0";
const LETTER_INK = "#2a1c33";
const TERRA = "#b5451b";
const FADED = "#6b5a4a";
const HAND = "'IM Fell English', Georgia, 'Times New Roman', serif";

/** A paragraph in the letter's hand. `last` closes a run, `small` is the P.S. */
export const line = (html, { last = false, small = false } = {}) =>
  `<p style="margin:0 0 ${last ? 0 : 20}px 0; font-family:${HAND}; font-size:${small ? "19px; line-height:30px" : "21px; line-height:34px"}; font-style:italic; color:${LETTER_INK};">${html}</p>`;

/** Emphasis inside handwritten prose. The letter is already italic, so a
 *  stressed phrase stands up straight rather than leaning further. */
export const stress = (text) => `<span style="font-style:normal;">${text}</span>`;

export const letterLink = (href, label) =>
  `<a href="${href}" style="color:${TERRA}; text-decoration:underline;">${label}</a>`;

/** The signature, written out, the same one the letters are signed with. */
export const hand = () =>
  `<img src="${KIT}/signature-letter.png" width="230" alt="HerStory Africa" style="display:block; width:230px; height:auto; font-family:Georgia, serif; font-size:30px; font-style:italic; color:${LETTER_INK};">`;

/** Writing paper on a desk: the shell the newsletter letters use. */
export function letterPage({ title, preview, heroAlt, body, footer }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${title}</title>
<!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet">
<!--<![endif]-->
<style>
  :root { color-scheme: light only; }
  body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; }
  table { border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0; }
  /* No global display:block here. Gmail swaps some emoji for an <img> of its
     own, and a blanket rule drops them onto a line by themselves. The artwork
     carries display:block inline instead. */
  img { border:0; outline:none; text-decoration:none; }
  @media only screen and (max-width:620px) {
    .shell { width:100% !important; }
    .mat-pad { padding:0 !important; }
    .pad { padding-left:26px !important; padding-right:26px !important; }
    .hand p { font-size:19px !important; line-height:31px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0;">
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${DESK}; opacity:0;">${preview} ${"&#847;&zwnj;&nbsp;".repeat(14)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="padding:0;">
  <table role="presentation" width="644" cellpadding="0" cellspacing="0" border="0" style="width:644px; max-width:100%; background-color:${DESK};">
  <tr><td class="mat-pad" align="center" style="padding:22px 22px 26px 22px;">
    <table role="presentation" class="shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:${SHEET};">
    <tr><td bgcolor="${DESK}" style="font-size:0; line-height:0; background-color:${DESK};"><img src="${KIT}/welcome-envelope.jpg" width="600" alt="${heroAlt}" style="display:block; width:100%; height:auto; font-family:Georgia, serif; font-size:14px; line-height:20px; font-style:italic; color:${LETTER_INK};"></td></tr>
    <tr><td bgcolor="${DESK}" style="font-size:0; line-height:0; background-color:${DESK};"><img src="${KIT}/welcome-edge-top.jpg" width="600" alt="" style="display:block; width:100%; height:auto;"></td></tr>
${body}
    <tr><td class="pad" style="padding:16px 56px 26px 56px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="border-top:1px solid #d8c9ac; font-size:0; line-height:0; height:1px;">&nbsp;</td></tr>
      <tr><td align="center" style="padding-top:14px; font-family:${HAND}; font-size:13px; line-height:21px; color:${FADED};">${footer}</td></tr>
      </table>
    </td></tr>
    <tr><td bgcolor="${DESK}" style="font-size:0; line-height:0; background-color:${DESK};"><img src="${KIT}/welcome-edge-bottom.jpg" width="600" alt="" style="display:block; width:100%; height:auto;"></td></tr>
    </table>
  </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>
`;
}

/** One row of the letter, in the hand. Bare text inherits the type from the cell. */
export const row = (html, { top = 22, align = "left" } = {}) =>
  `    <tr><td class="pad hand" align="${align}" style="padding:${top}px 56px 0 56px; font-family:${HAND}; font-size:21px; line-height:34px; font-style:italic; color:${LETTER_INK};">${html}</td></tr>`;

/** The one thing to do now, in the letter's terracotta. */
export const letterButton = (href, label) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="${TERRA}" style="border-radius:999px; background-color:${TERRA};">
  <a href="${href}" style="display:inline-block; padding:13px 26px; font-family:${HAND}; font-size:18px; font-style:italic; color:#ffffff; text-decoration:none; border-radius:999px;">${label}</a>
</td></tr></table>`;

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
  `<p style="margin:26px 0 0 0; font-family:Georgia, 'Times New Roman', serif; font-size:20px; font-style:italic; color:${INK};">HerStory Africa</p>`;

/** "With love," then the masthead in bold. The letters are signed by the archive. */
export const signoff = (closing) =>
  `<p style="margin:26px 0 0 0; font-family:Georgia, 'Times New Roman', serif; font-size:18px; line-height:1.5; color:${INK};">${closing}<br><strong>HerStory Africa</strong></p>`;

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
