import { UNSUBSCRIBE, esc, formatDate, inline, links, shell, siteLink } from "./shared.mjs";

export const meta = {
  id: "love-letter",
  name: "The Love Letter",
  vibe: "Brown parchment, cursive, a wax seal. A letter written to the woman herself, with the reader looking over the writer's shoulder.",
  useWhen: [
    "The edition is admiration for one woman and can be addressed to her directly",
    "A quiet, tender or bittersweet story",
    "Women who have died, anniversaries, birthdays",
  ],
  avoidWhen: [
    "The story is mostly events and politics rather than one person",
    "Anything that needs a second item or a list of facts",
  ],
  registers: ["warm", "solemn"],
  fields: {
    required: ["salutation", "closing", "ps"],
    optional: [],
  },
  blocks: ["p", "highlight", "photo", "fold"],
};

const INK = "#3a2012";
const RUST = "#8a2f12";
const HAND = "'Petit Formal Script',Georgia,'Times New Roman',serif";
const SERIF = "Georgia,'Times New Roman',serif";

export async function assets(edition, t) {
  const out = [];
  out.push({ name: "salutation.png", ...(await t.scriptText(edition.salutation, { size: 62, colour: INK })) });
  out.push({ name: "closing.png", ...(await t.scriptText(edition.closing, { size: 34, colour: INK })) });

  const highlights = edition.blocks.filter((b) => b.type === "highlight");
  for (const [i, block] of highlights.entries()) {
    out.push({ name: `highlight-${i + 1}.png`, ...(await t.scriptText(block.text, { size: 52, colour: RUST })) });
  }

  // Sepia oval that fades into the paper.
  const W = 440;
  const H = 544;
  const plate = await t
    .sharp(t.photoPath)
    .resize(W, H, { fit: "cover", position: t.photoPosition })
    .grayscale()
    .normalise()
    .linear(0.9, 26)
    .toColourspace("srgb")
    .removeAlpha()
    .toBuffer();
  const sepia = await t
    .sharp({ create: { width: W, height: H, channels: 3, background: "#e6c08a" } })
    .composite([{ input: plate, blend: "multiply" }])
    .removeAlpha()
    .png()
    .toBuffer();
  const mask = await t
    .sharp(Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="black"/><ellipse cx="${W / 2}" cy="${H / 2}" rx="${W / 2 - 28}" ry="${H / 2 - 28}" fill="white"/></svg>`))
    .blur(13)
    .extractChannel(0)
    .raw()
    .toBuffer();
  const cameo = await t
    .sharp(sepia)
    .joinChannel(mask, { raw: { width: W, height: H, channels: 1 } })
    .png({ palette: true, colours: 128 })
    .toBuffer();
  out.push({ name: "cameo.png", data: cameo, width: 220, height: 272 });
  return out;
}

const para = (html) => `<p style="margin:0 0 18px 0;">${html}</p>`;

export function render(edition, a) {
  const l = links(edition);
  const hand = `font-family:${HAND}; font-size:17.5px; line-height:36px; font-style:italic; color:${INK};`;
  const rows = [];
  let run = [];
  let highlight = 0;

  const flush = () => {
    if (!run.length) return;
    rows.push(`<tr><td class="pad hand" style="padding:14px 62px 0 62px; ${hand}">${run.join("\n")}</td></tr>`);
    run = [];
  };

  for (const block of edition.blocks) {
    if (block.type === "p") {
      run.push(para(inline(block.text, { link: `color:${RUST};` })));
      continue;
    }
    flush();
    if (block.type === "highlight") {
      highlight += 1;
      const img = a.get(`highlight-${highlight}.png`);
      rows.push(`<tr><td class="pad" align="center" style="padding:2px 62px 0 62px;"><img class="hl" src="${img.url}" width="${img.width}" alt="${esc(block.text)}" style="width:${img.width}px; max-width:100%; height:auto; margin:0 auto; font-family:${SERIF}; font-size:30px; font-style:italic; color:${RUST};"></td></tr>`);
    } else if (block.type === "fold") {
      rows.push(`<tr><td style="padding:14px 0 0 0; font-size:0; line-height:0;"><img src="${a.kit("crease.png")}" width="600" height="10" alt="" style="width:100%; height:10px;"></td></tr>`);
    } else if (block.type === "photo") {
      const img = a.get("cameo.png");
      rows.push(`<tr><td align="center" style="padding:18px 20px 0 20px;"><img src="${img.url}" width="${img.width}" alt="${esc(edition.photoAlt)}" style="width:${img.width}px; height:auto; margin:0 auto;"></td></tr>
        <tr><td class="pad" align="center" style="padding:2px 62px 0 62px; font-family:${SERIF}; font-size:12px; line-height:18px; font-style:italic; color:#6a4a2c;">${esc(edition.photoCaption)}</td></tr>`);
    }
  }
  flush();

  const sal = a.get("salutation.png");
  const closing = a.get("closing.png");
  const paper = a.kit("parchment.jpg");

  const content = `  <table role="presentation" class="shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">
    <tr><td style="font-size:0; line-height:0;"><img src="${a.kit("parchment-top.jpg")}" width="600" alt="" style="width:100%; height:auto;"></td></tr>
    <tr><td background="${paper}" bgcolor="#d6b480" style="background-color:#d6b480; background-image:url('${paper}'); background-repeat:repeat-y; background-size:100% auto;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td class="pad" align="right" style="padding:18px 62px 0 62px; font-family:${HAND}; font-size:15px; line-height:26px; font-style:italic; color:${INK};">${formatDate(edition.date, "longhand")}</td></tr>
        <tr><td class="pad" style="padding:22px 62px 0 50px;"><img class="sal" src="${sal.url}" width="${sal.width}" alt="${esc(edition.salutation)}" style="width:${sal.width}px; max-width:100%; height:auto; font-family:${SERIF}; font-size:34px; font-style:italic; color:${INK};"></td></tr>
        ${rows.join("\n        ")}
        <tr><td class="pad" style="padding:22px 62px 0 50px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td valign="top">
              <img class="closing" src="${closing.url}" width="${closing.width}" alt="${esc(edition.closing)}" style="width:${closing.width}px; max-width:100%; height:auto; font-family:${SERIF}; font-size:20px; font-style:italic; color:${INK};">
              <img src="${a.kit("signature-script.png")}" class="sig" width="240" alt="${esc(edition.signedBy)}" style="width:240px; max-width:100%; height:auto; margin-top:-8px; font-family:${SERIF}; font-size:30px; font-style:italic; color:${INK};">
            </td>
            <td class="seal-cell" valign="bottom" align="right" width="110"><img class="seal" src="${a.kit("seal.png")}" width="104" alt="" style="width:104px; height:auto;"></td>
          </tr></table>
        </td></tr>
        <tr><td class="pad" style="padding:22px 62px 0 62px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #a98558; padding-top:16px; font-family:${SERIF}; font-size:16px; line-height:26px; font-style:italic; color:${INK};">
            ${inline(edition.ps, { link: `color:${RUST}; font-weight:bold;` })}
          </td></tr></table>
        </td></tr>
        <tr><td class="pad" align="center" style="padding:26px 62px 10px 62px; font-family:${SERIF}; font-size:12px; line-height:20px; color:#6a4a2c;">
          HerStory Africa, twice a month. You asked for these at ${siteLink("#6a4a2c")}.<br>
          <a href="${l.archive}" style="color:#6a4a2c;">Earlier letters</a> &nbsp;|&nbsp;
          <a href="${l.browser}" style="color:#6a4a2c;">Read in your browser</a> &nbsp;|&nbsp;
          <a href="${UNSUBSCRIBE}" style="color:#6a4a2c;">Stop these letters</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="font-size:0; line-height:0;"><img src="${a.kit("parchment-bottom.jpg")}" width="600" alt="" style="width:100%; height:auto;"></td></tr>
  </table>`;

  return shell({
    title: edition.subject,
    preview: edition.preview,
    background: "#261b14",
    fontHref: "https://fonts.googleapis.com/css2?family=Petit+Formal+Script&display=swap",
    css: `    .pad { padding-left:30px !important; padding-right:30px !important; }
    .hand { font-size:16px !important; line-height:33px !important; }
    .sal { width:250px !important; }
    .sig { width:180px !important; }
    .closing { width:210px !important; }
    .seal { width:80px !important; }
    .seal-cell { width:84px !important; }
    .hl { width:220px !important; }`,
    content,
  });
}
