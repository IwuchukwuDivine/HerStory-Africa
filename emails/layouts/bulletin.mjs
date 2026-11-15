import { UNSUBSCRIBE, esc, formatDate, inline, links, shell } from "./shared.mjs";

export const meta = {
  id: "bulletin",
  name: "The Bulletin",
  vibe: "An old newspaper front page passed from hand to hand: blackletter nameplate, a shouting headline, two columns, a gossip column and a classified notice.",
  useWhen: [
    "Stories with events, dates and stakes: protests, elections, court cases, firsts",
    "Editions with real tea: a twist, a scandal, an underdog win",
    "When there are hard facts worth boxing up (the On file box)",
  ],
  avoidWhen: [
    "Solemn material: a headline in capitals reads as sensational",
    "Intimate, reflective editions (use a letter)",
  ],
  registers: ["playful", "warm"],
  fields: {
    required: ["kicker", "headline", "deck", "caption", "heardAround", "onFile", "notice", "signOff"],
    optional: ["heardAroundTitle"],
  },
  blocks: ["p", "subhead", "column"],
};

const INK = "#1c0f07";
const TERRA = "#b5451b";
const PAPER = "#f1e8d3";
const FACE = "'Old Standard TT','Times New Roman',Times,serif";

export async function assets(edition, t) {
  // Ink on newsprint: a greyscale plate multiplied onto the paper colour.
  const W = 1160;
  const H = 818;
  const plate = await t
    .sharp(t.photoPath)
    .resize(W, H, { fit: "cover", position: t.photoPosition })
    .grayscale()
    .normalise()
    .linear(1.12, -6)
    .toColourspace("srgb")
    .removeAlpha()
    .toBuffer();
  const data = await t
    .sharp({ create: { width: W, height: H, channels: 3, background: "#efe5cf" } })
    .composite([{ input: plate, blend: "multiply" }])
    .linear(0.93, 20)
    .jpeg({ quality: 74, mozjpeg: true })
    .toBuffer();
  return [{ name: "newsprint.jpg", data, width: 534, height: Math.round((534 * H) / W) }];
}

function column(blocks, first) {
  let lead = first;
  return blocks
    .map((block, i) => {
      const last = i === blocks.length - 1;
      if (block.type === "subhead") {
        return `<p style="margin:0 0 10px 0; text-align:center; font-size:13px; line-height:18px; letter-spacing:2px; font-weight:bold;">${esc(block.text.toUpperCase())}</p>`;
      }
      const margin = `margin:0 0 ${last ? 0 : 12}px 0;`;
      if (lead) {
        lead = false;
        const text = block.text.trim();
        return `<p style="${margin}"><span style="float:left; font-size:58px; line-height:46px; font-weight:bold; padding:4px 7px 0 0;">${esc(text[0])}</span>${inline(text.slice(1))}</p>`;
      }
      const afterSubhead = blocks[i - 1]?.type === "subhead";
      return `<p style="${margin}${afterSubhead ? "" : " text-indent:18px;"}">${inline(block.text)}</p>`;
    })
    .join("\n            ");
}

export function render(edition, a) {
  const l = links(edition);
  const split = edition.blocks.findIndex((b) => b.type === "column");
  const story = edition.blocks.filter((b) => b.type === "p" || b.type === "subhead" || b.type === "column");
  const left = split === -1 ? story : story.slice(0, story.findIndex((b) => b.type === "column"));
  const right = split === -1 ? [] : story.slice(story.findIndex((b) => b.type === "column") + 1);
  const copy = `font-family:${FACE}; font-size:16.5px; line-height:25px; color:${INK};`;
  const photo = a.get("newsprint.jpg");
  const rule = (css) => `<tr><td style="${css} font-size:0; line-height:0; height:1px;">&nbsp;</td></tr>`;

  const storyRow = right.length
    ? `<td class="col" width="50%" valign="top" style="padding:14px 14px 0 0; ${copy}">
            ${column(left, true)}
          </td>
          <td class="col col-gap" width="50%" valign="top" style="padding:14px 0 0 14px; border-left:1px solid ${INK}; ${copy}">
            ${column(right, false)}
          </td>`
    : `<td valign="top" style="padding:14px 0 0 0; ${copy}">
            ${column(left, true)}
          </td>`;

  const heard = String(edition.heardAround)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i, all) => `<p style="margin:0 0 ${i === all.length - 1 ? 0 : 10}px 0; font-size:16.5px; line-height:25px; font-style:italic;">${inline(p)}</p>`)
    .join("\n            ");
  const onFile = edition.onFile.map((row) => `<b>${esc(row.label)}.</b> ${esc(row.value)}`).join("<br>\n                ");

  const content = `  <table role="presentation" class="shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:${PAPER};">
    <tr><td class="pad" style="padding:16px 28px 0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${FACE}; font-size:12px; line-height:16px; color:${INK};">
        <tr>
          <td class="ear-side" width="30%" style="letter-spacing:1px;">VOL. ${esc(edition.volume)} &nbsp; NO. ${esc(edition.number)}</td>
          <td class="ear-mid" align="center" style="font-style:italic; font-size:13px;">${formatDate(edition.date)}</td>
          <td class="ear-side" width="30%" align="right" style="letter-spacing:1px;">PASS IT ON</td>
        </tr>
      </table>
    </td></tr>
    <tr><td class="pad" align="center" style="padding:10px 28px 0 28px;">
      <a href="https://herstoryafrica.com.ng" style="text-decoration:none;"><img src="${a.kit("nameplate.png")}" width="500" alt="HerStory Africa" style="width:100%; max-width:500px; height:auto; margin:0 auto; font-family:'Times New Roman',Times,serif; font-size:44px; font-weight:bold; color:${INK};"></a>
    </td></tr>
    <tr><td class="pad" style="padding:6px 28px 0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border-top:3px solid ${INK}; font-size:0; line-height:0; height:2px;">&nbsp;</td></tr>
        ${rule(`border-top:1px solid ${INK};`)}
        <tr><td align="center" style="padding:7px 0 7px 0; font-family:${FACE}; font-size:14px; line-height:18px; font-style:italic; color:${INK};">The women they left out of the papers, put back in.</td></tr>
        ${rule(`border-top:1px solid ${INK};`)}
      </table>
    </td></tr>

    <tr><td class="pad" align="center" style="padding:22px 28px 0 28px; font-family:${FACE}; font-size:12px; line-height:16px; letter-spacing:2.5px; color:${TERRA}; font-weight:bold;">${esc(edition.kicker.toUpperCase())}</td></tr>
    <tr><td class="pad" align="center" style="padding:10px 28px 0 28px;"><h1 class="headline" style="margin:0; font-family:${FACE}; font-size:45px; line-height:46px; font-weight:bold; letter-spacing:-0.5px; text-transform:uppercase; color:${INK};">${esc(edition.headline)}</h1></td></tr>
    <tr><td class="pad" align="center" style="padding:14px 28px 0 28px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="70" style="width:70px; border-top:1px solid ${INK}; font-size:0; line-height:0; height:1px;">&nbsp;</td></tr></table></td></tr>
    <tr><td class="pad deck" align="center" style="padding:14px 40px 0 40px; font-family:${FACE}; font-size:19px; line-height:27px; font-style:italic; color:${INK};">${inline(edition.deck)}</td></tr>

    <tr><td class="pad" style="padding:22px 28px 0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border:1px solid ${INK}; padding:4px;"><img src="${photo.url}" width="${photo.width}" alt="${esc(edition.photoAlt)}" style="width:100%; max-width:${photo.width}px; height:auto;"></td></tr>
        <tr><td style="padding:8px 2px 0 2px; font-family:${FACE}; font-size:14px; line-height:20px; color:${INK};">
          <i>${inline(edition.caption)}</i> <span style="font-size:11px; color:#5c4a3a;">${esc(edition.photoCredit)}</span>
        </td></tr>
      </table>
    </td></tr>

    <tr><td class="pad" style="padding:20px 28px 0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${INK};">
        <tr>
          ${storyRow}
        </tr>
      </table>
    </td></tr>

    <tr><td class="pad" style="padding:22px 28px 0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:3px double ${INK};">
        <tr>
          <td class="col" width="54%" valign="top" style="padding:16px 16px 0 0; font-family:${FACE}; color:${INK};">
            <p style="margin:0 0 8px 0; font-size:24px; line-height:28px; font-style:italic; font-weight:bold; color:${TERRA};">${esc(edition.heardAroundTitle ?? "Heard around")}</p>
            ${heard}
          </td>
          <td class="col box-gap" width="46%" valign="top" style="padding:16px 0 0 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${INK};">
              <tr><td align="center" style="background-color:${INK}; padding:5px 8px; font-family:${FACE}; font-size:12px; line-height:16px; letter-spacing:3px; font-weight:bold; color:${PAPER};">ON FILE</td></tr>
              <tr><td style="padding:10px 12px 12px 12px; font-family:${FACE}; font-size:14.5px; line-height:21px; color:${INK};">
                ${onFile}
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>

    <tr><td class="pad" style="padding:24px 28px 0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:3px double ${INK};">
        <tr><td align="center" style="padding:16px 18px 18px 18px; font-family:${FACE}; color:${INK};">
          <p style="margin:0 0 6px 0; font-size:12px; line-height:16px; letter-spacing:3px; font-weight:bold;">NOTICE</p>
          <p style="margin:0 0 12px 0; font-size:17px; line-height:25px; font-style:italic;">${inline(edition.notice)}</p>
          <a href="${l.story}" style="display:inline-block; background-color:${TERRA}; padding:11px 22px; font-family:${FACE}; font-size:14px; line-height:18px; letter-spacing:2px; font-weight:bold; color:${PAPER}; text-decoration:none;">${esc(edition.linkText.toUpperCase())}</a>
        </td></tr>
      </table>
    </td></tr>

    <tr><td class="pad" align="center" style="padding:24px 40px 0 40px; font-family:${FACE}; font-size:17px; line-height:26px; font-style:italic; color:${INK};">
      ${inline(edition.signOff)}<br>
      <span style="font-style:normal; font-weight:bold; letter-spacing:2px; font-size:13px;">${esc(edition.signedBy.toUpperCase())}, EDITOR</span>
    </td></tr>

    <tr><td class="pad" style="padding:24px 28px 22px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rule(`border-top:1px solid ${INK};`)}
        <tr><td style="border-top:3px solid ${INK}; font-size:0; line-height:0; height:2px;">&nbsp;</td></tr>
        <tr><td align="center" style="padding-top:12px; font-family:${FACE}; font-size:12.5px; line-height:20px; color:#3d2c1e;">
          Printed twice a month and passed from hand to hand. You are on the list because you signed up at herstoryafrica.com.ng.<br>
          <a href="${l.archive}" style="color:${INK};">Back issues</a> &nbsp;|&nbsp;
          <a href="${l.browser}" style="color:${INK};">Read in your browser</a> &nbsp;|&nbsp;
          <a href="${UNSUBSCRIBE}" style="color:${INK};">Stop delivery</a>
        </td></tr>
      </table>
    </td></tr>
  </table>`;

  return shell({
    title: edition.subject,
    preview: edition.preview,
    background: "#d9ceb8",
    fontHref: "https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap",
    css: `    .pad { padding-left:18px !important; padding-right:18px !important; }
    .col { display:block !important; width:100% !important; padding-left:0 !important; padding-right:0 !important; border-left:0 !important; }
    .col-gap { padding-top:16px !important; }
    .box-gap { padding-top:18px !important; }
    .headline { font-size:33px !important; line-height:35px !important; }
    .deck { font-size:17px !important; line-height:25px !important; }
    .ear-side { display:none !important; }`,
    content,
  });
}
