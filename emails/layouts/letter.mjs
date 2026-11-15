import { UNSUBSCRIBE, esc, formatDate, inline, links, shell } from "./shared.mjs";

export const meta = {
  id: "letter",
  name: "The Letter",
  vibe: "Cream writing paper, old-style italics, a snapshot taped to the page. A letter from a friend who has just found something out.",
  useWhen: [
    "A question-led or conversational edition written to the reader",
    "Playful or warm stories: firsts, clever wins, surprises",
    "The writer's own reaction is part of the story",
  ],
  avoidWhen: [
    "Solemn material (use the Love Letter or a quieter layout)",
    "Editions with several items or a fact box",
  ],
  registers: ["playful", "warm"],
  fields: {
    required: ["salutation", "closing", "ps"],
    optional: [],
  },
  blocks: ["p", "highlight", "photo"],
};

const INK = "#2a1c33";
const TERRA = "#b5451b";
const HAND = "'IM Fell English',Georgia,'Times New Roman',serif";
const PAPER = "#f7f0e0";

export async function assets(edition, t) {
  // A faded print with a white border, taped to the page at a slight tilt.
  const photo = await t
    .sharp(t.photoPath)
    .resize(560, 560, { fit: "cover", position: t.photoPosition })
    .modulate({ saturation: 0.78 })
    .linear(0.93, 14)
    .extend({ top: 30, left: 30, right: 30, bottom: 110, background: "#fcfaf4" })
    .png()
    .toBuffer();
  const shadow = await t
    .sharp(Buffer.from(`<svg width="820" height="900" xmlns="http://www.w3.org/2000/svg"><rect x="108" y="118" width="620" height="700" fill="rgb(60,35,15)" fill-opacity="0.38"/></svg>`))
    .blur(12)
    .png()
    .toBuffer();
  const tape = Buffer.from(`<svg width="820" height="900" xmlns="http://www.w3.org/2000/svg"><rect x="315" y="74" width="190" height="54" fill="rgb(226,205,150)" fill-opacity="0.72" transform="rotate(-6 410 101)"/></svg>`);
  const scene = await t
    .sharp({ create: { width: 820, height: 900, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: shadow }, { input: photo, left: 100, top: 100 }, { input: tape }])
    .png()
    .toBuffer();
  const tilted = await t
    .sharp(scene)
    .rotate(3.2, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten({ background: PAPER })
    .toBuffer({ resolveWithObject: true });
  const left = Math.round((tilted.info.width - 720) / 2);
  const top = Math.round((tilted.info.height - 840) / 2);
  const data = await t.sharp(tilted.data).extract({ left, top, width: 720, height: 840 }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  return [{ name: "snapshot.jpg", data, width: 360, height: 420 }];
}

export function render(edition, a) {
  const l = links(edition);
  const hand = `font-family:${HAND}; font-size:21px; line-height:34px; font-style:italic; color:${INK};`;
  const rows = [];
  let run = [];

  const flush = () => {
    if (!run.length) return;
    rows.push(`<tr><td class="pad hand" style="padding:22px 56px 0 56px; ${hand}">${run.join("\n")}</td></tr>`);
    run = [];
  };

  for (const block of edition.blocks) {
    if (block.type === "p") {
      const last = run.length;
      run.push(`<p style="margin:${last ? "20px" : "0"} 0 0 0;">${inline(block.text, { link: `color:${TERRA}; text-decoration:underline;` })}</p>`);
      continue;
    }
    flush();
    if (block.type === "highlight") {
      rows.push(`<tr><td class="pad ask" style="padding:22px 56px 0 56px; font-family:${HAND}; font-size:29px; line-height:39px; font-style:italic; color:${TERRA};">${inline(block.text)}</td></tr>`);
    } else if (block.type === "photo") {
      const img = a.get("snapshot.jpg");
      rows.push(`<tr><td align="center" style="padding:14px 20px 0 20px;"><img src="${img.url}" width="${img.width}" alt="${esc(edition.photoAlt)}" style="width:100%; max-width:${img.width}px; height:auto; margin:0 auto;"></td></tr>
    <tr><td class="pad" align="center" style="padding:2px 56px 0 56px; font-family:${HAND}; font-size:14px; line-height:20px; font-style:italic; color:#6b5a4a;">${esc(edition.photoCaption)}</td></tr>`);
    }
  }
  flush();

  const content = `  <table role="presentation" class="shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:${PAPER};">
    <tr><td class="pad" align="center" style="padding:34px 56px 0 56px; font-family:${HAND}; font-size:13px; line-height:18px; letter-spacing:4px; color:${TERRA};"><a href="https://herstoryafrica.com.ng" style="color:${TERRA}; text-decoration:none;">HERSTORY AFRICA</a></td></tr>
    <tr><td align="center" style="padding:10px 0 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="44" style="width:44px; border-top:1px solid ${TERRA}; font-size:0; line-height:0; height:1px;">&nbsp;</td></tr></table></td></tr>
    <tr><td class="pad" align="right" style="padding:30px 56px 0 56px; font-family:${HAND}; font-size:18px; line-height:28px; font-style:italic; color:#3a2a4a;">${formatDate(edition.date)}</td></tr>
    <tr><td class="pad hand" style="padding:26px 56px 0 56px; ${hand}">${esc(edition.salutation)}</td></tr>
    ${rows.join("\n    ")}
    <tr><td class="pad hand" style="padding:26px 56px 0 56px; ${hand}">${esc(edition.closing)}</td></tr>
    <tr><td class="pad" style="padding:0 56px 0 50px;"><img src="${a.kit("signature-letter.png")}" width="230" alt="${esc(edition.signedBy)}" style="width:230px; height:auto; font-family:Georgia,serif; font-size:30px; font-style:italic; color:${INK};"></td></tr>
    <tr><td class="pad hand" style="padding:10px 56px 0 56px; font-family:${HAND}; font-size:19px; line-height:30px; font-style:italic; color:${INK};">${inline(edition.ps, { link: `color:${TERRA}; text-decoration:underline;` })}</td></tr>
    <tr><td class="pad" style="padding:38px 56px 30px 56px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border-top:1px solid #d8c9ac; font-size:0; line-height:0; height:1px;">&nbsp;</td></tr>
        <tr><td align="center" style="padding-top:14px; font-family:${HAND}; font-size:13px; line-height:21px; color:#6b5a4a;">
          A letter from HerStory Africa, twice a month. You asked for these at herstoryafrica.com.ng.<br>
          <a href="${l.archive}" style="color:#6b5a4a;">Earlier letters</a> &nbsp;|&nbsp;
          <a href="${l.browser}" style="color:#6b5a4a;">Read in your browser</a> &nbsp;|&nbsp;
          <a href="${UNSUBSCRIBE}" style="color:#6b5a4a;">Stop these letters</a>
        </td></tr>
      </table>
    </td></tr>
  </table>`;

  return shell({
    title: edition.subject,
    preview: edition.preview,
    background: "#cfc3ab",
    fontHref: "https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap",
    css: `    .pad { padding-left:26px !important; padding-right:26px !important; }
    .hand { font-size:19px !important; line-height:31px !important; }
    .ask { font-size:25px !important; line-height:34px !important; }`,
    content,
  });
}
