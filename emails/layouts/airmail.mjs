import { FACE, engrave, jpeg, mark, paper, raster, shadow, stroke, svg, sx, tapedPrint, uri } from "./art.mjs";
import { UNSUBSCRIBE, esc, formatDate, inline, links, shell, siteLink } from "./shared.mjs";

export const meta = {
  id: "airmail",
  name: "By Air Mail",
  vibe: "An airmail envelope addressed by hand, with an engraved stamp of the woman inside cancelled by the send date. The Letter arrives inside it, and the album at the foot shows the collection filling up.",
  useWhen: [
    "A question-led edition, where the envelope is the thing the reader opens before the answer",
    "An edition that wants a reason to come back: the next stamp is the next letter",
    "Playful or warm stories about one woman with a usable photograph",
  ],
  avoidWhen: [
    "Solemn material: the stamp and the album turn a woman into a collectible",
    "Women with no surviving likeness, because the stamp has nothing to engrave",
    "Editions with several items or a fact box (use the Bulletin)",
  ],
  registers: ["playful", "warm"],
  fields: {
    required: ["salutation", "closing", "ps"],
    optional: ["addressedTo", "stampLine", "albumNote", "answerNote", "envelopeAlt"],
  },
  blocks: ["p", "highlight", "photo", "fold"],
};

const INK = "#2a1c33";
const TERRA = "#b5451b";
const BROWN = "#1c0f07";
const GOLD = "#c8941a";
const PAPER = "#f7f0e0";
const DESK = "#cfc3ab";
const FADED = "#6b5a4a";
const HAND = "'IM Fell English',Georgia,'Times New Roman',serif";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** The 1st and the 15th after this edition: what the next three stamps are for. */
function nextPostings(iso, count = 3) {
  const d = new Date(`${iso}T12:00:00Z`);
  let month = d.getUTCMonth();
  let day = d.getUTCDate() < 15 ? 15 : 1;
  if (day === 1) month += 1;
  const out = [];
  while (out.length < count) {
    if (month > 11) month -= 12;
    out.push(`${day} ${MONTHS[month]}`);
    if (day === 1) day = 15;
    else {
      day = 1;
      month += 1;
    }
  }
  return out;
}

/** "15 NOV" and "2026", the two lines a postmark carries. */
function cancellation(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return [`${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3).toUpperCase()}`, String(d.getUTCFullYear())];
}

/** The wordmark as it is printed on the envelope and in the album. */
const wordmark = (x, y) => `
    ${mark(x, y, 26, TERRA)}
    <text x="${x + 32}" y="${y + 18}" font-family="${FACE.print}" font-weight="700" font-size="17" fill="${TERRA}">Her<tspan fill="${BROWN}">Story</tspan></text>
    <text x="${x + 33}" y="${y + 29}" font-family="${FACE.grotesque}" font-weight="500" font-size="7" letter-spacing="3.4" fill="${GOLD}">AFRICA</text>`;

/**
 * A perforated postage stamp, 164 by 204 units, carrying the engraved portrait.
 * The holes are punched with a mask so the khaki of the desk shows through.
 */
function stampArt({ portrait, number, name, line, ink = "#9a3816" }) {
  const W = 164;
  const H = 204;
  const px = 21;
  const py = 33;
  const pw = W - 42;
  const ph = 124;
  const holes = [];
  const across = Math.round(W / 8.6);
  const down = Math.round(H / 8.6);
  for (let i = 0; i <= across; i++) for (const y of [0, H]) holes.push(`<circle cx="${((i * W) / across).toFixed(2)}" cy="${y}" r="3.1" fill="black"/>`);
  for (let j = 0; j <= down; j++) for (const x of [0, W]) holes.push(`<circle cx="${x}" cy="${((j * H) / down).toFixed(2)}" r="3.1" fill="black"/>`);

  return svg(
    W,
    H,
    `<defs><mask id="perf" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="white"/>${holes.join("")}
    </mask></defs>
    <g mask="url(#perf)">
      <image href="${portrait.paper}" x="0" y="0" width="${W}" height="${H}"/>
      <g fill="${ink}" stroke="${ink}">
        <rect x="12.5" y="12.5" width="${W - 25}" height="${H - 25}" fill="none" stroke-width="1.5"/>
        <rect x="15.5" y="15.5" width="${W - 31}" height="${H - 31}" fill="none" stroke-width="0.5"/>
        <text x="21" y="27.5" font-family="${FACE.print}" font-weight="700" font-size="7.4" letter-spacing="1.5" stroke="none">HERSTORY AFRICA</text>
        <text x="${W - 21}" y="28" text-anchor="end" font-family="${FACE.print}" font-weight="700" font-size="9.5" stroke="none">${sx(number)}</text>
        <image href="${portrait.plate}" x="${px}" y="${py}" width="${pw}" height="${ph}"/>
        <rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" stroke-width="0.8"/>
        <text x="${W / 2}" y="${py + ph + 13}" text-anchor="middle" font-family="${FACE.print}" font-weight="700" font-size="6.9" letter-spacing="0.4"
              textLength="${Math.min(116, 4.9 * name.length)}" lengthAdjust="spacingAndGlyphs" stroke="none">${sx(name.toUpperCase())}</text>
        <text x="${W / 2}" y="${py + ph + 25}" text-anchor="middle" font-family="${FACE.print}" font-style="italic" font-size="8.5" stroke="none">${sx(line)}</text>
      </g>
    </g>`,
  );
}

/** A circular date stamp with its cancellation waves running off to the right. */
function postmarkArt(cx, cy, rotation, { top, bottom, day, year, colour, radius = 44 }) {
  const waves = [];
  for (let k = 0; k < 3; k++) {
    const points = [];
    for (let t = 0; t <= 30; t++) points.push([radius + 5 + t * 3.6, -11 + k * 11 + Math.sin(t / 2.25) * 2.6]);
    waves.push(stroke(points, { colour, width: 1.3, seed: 31 + k, wander: 0.2 }));
  }
  return `<g transform="translate(${cx} ${cy}) rotate(${rotation})" fill="${colour}" stroke="${colour}">
    <defs>
      <path id="pm-top" d="M ${-radius * 0.82} 0 A ${radius * 0.82} ${radius * 0.82} 0 0 1 ${radius * 0.82} 0" fill="none"/>
      <path id="pm-bot" d="M ${-radius * 0.82} 0 A ${radius * 0.82} ${radius * 0.82} 0 0 0 ${radius * 0.82} 0" fill="none"/>
    </defs>
    <circle r="${radius}" fill="none" stroke-width="1.7"/>
    <circle r="${radius * 0.64}" fill="none" stroke-width="1.1"/>
    <text font-family="${FACE.grotesque}" font-weight="500" font-size="${radius * 0.195}" letter-spacing="1.7" stroke="none"><textPath href="#pm-top" startOffset="50%" text-anchor="middle">${sx(top)}</textPath></text>
    <text font-family="${FACE.grotesque}" font-weight="500" font-size="${radius * 0.195}" letter-spacing="1.7" stroke="none"><textPath href="#pm-bot" startOffset="50%" text-anchor="middle">${sx(bottom)}</textPath></text>
    <circle cx="${-radius * 0.82}" cy="0" r="1.6" stroke="none"/>
    <circle cx="${radius * 0.82}" cy="0" r="1.6" stroke="none"/>
    <text y="-1" text-anchor="middle" font-family="${FACE.grotesque}" font-weight="700" font-size="${radius * 0.285}" stroke="none">${sx(day)}</text>
    <text y="${radius * 0.27}" text-anchor="middle" font-family="${FACE.grotesque}" font-weight="500" font-size="${radius * 0.24}" stroke="none">${sx(year)}</text>
    ${waves.join("")}
  </g>`;
}

export async function assets(edition, t) {
  const number = `No. ${edition.number}`;
  const name = edition.womanName ?? edition.title;
  const line = edition.stampLine ?? edition.womanCountry ?? "HerStory Africa";

  // The stamp, drawn once and used twice: on the envelope and in the album.
  const plate = await engrave(t.photoPath, {
    width: 122,
    height: 124,
    position: t.photoPosition,
    zoom: 1.4,
    ink: "#8f3414",
    tint: "#f4e8ce",
  });
  const stamp = raster(
    stampArt({
      portrait: {
        paper: uri(await paper({ width: 164, height: 204, colour: "#f7f0dd", seed: 3, mottle: 0.06 })),
        plate: uri(plate),
      },
      number,
      name,
      line,
    }),
  );

  const out = [];
  out.push({ name: "envelope.jpg", ...(await envelope(edition, stamp, number)) });
  out.push({
    name: "snapshot.jpg",
    ...(await tapedPrint(t.photoPath, { width: 600, height: 404, colour: PAPER, position: t.photoPosition, note: edition.answerNote ?? "the answer.", seed: 21 })),
  });
  out.push({ name: "album.jpg", ...(await album(edition, stamp)) });
  out.push({ name: "fold.jpg", ...(await fold()) });
  out.push({ name: "edge-top.jpg", ...(await edge("top")) });
  out.push({ name: "edge-bottom.jpg", ...(await edge("bottom")) });
  return out;
}

/** The envelope on the desk: airmail border, wordmark, label, stamp, postmark, address. */
async function envelope(edition, stamp, number) {
  const W = 600;
  const H = 372;
  const EW = 552;
  const EH = 316;
  const ex = (W - EW) / 2;
  const ey = (H - EH) / 2 - 2;
  const [day, year] = cancellation(edition.date);
  const addressedTo = (edition.addressedTo ?? "To you,\nwherever you are\nreading this.").split("\n");

  // The airmail border: slanted bars in the margin, every other one skipped.
  const bars = [];
  for (let i = 0, n = 0; i < EW + EH; i += 13, n++) {
    if (n % 2) continue;
    bars.push(`<rect x="${i}" y="0" width="13" height="${EH}" fill="${(n / 2) % 2 ? INK : TERRA}"/>`);
  }

  const stampW = 164;
  const stampH = 204;
  const stampX = EW - 34 - stampW;
  const stampY = 30;

  const doc = svg(
    W,
    H,
    `<defs>
      ${shadow("lift", { blur: 13, dy: 7, opacity: 0.42 })}
      <clipPath id="margin"><path d="M0 0 H${EW} V${EH} H0 Z M12 12 H${EW - 12} V${EH - 12} H12 Z" clip-rule="evenodd"/></clipPath>
    </defs>
    <rect width="${W}" height="${H}" fill="${DESK}"/>
    <g transform="rotate(-1 ${W / 2} ${H / 2})" filter="url(#lift)">
      <g transform="translate(${ex} ${ey})">
        <image href="${uri(await paper({ width: EW, height: EH, colour: "#f4ecd8", seed: 8, mottle: 0.08 }))}" width="${EW}" height="${EH}"/>
        <g clip-path="url(#margin)" opacity="0.92"><g transform="matrix(1,0,-0.6,1,0,0)">${bars.join("")}</g></g>
        ${wordmark(34, 28)}
        <text x="34" y="75" font-family="${FACE.print}" font-style="italic" font-size="9.5" fill="${BROWN}" fill-opacity="0.72">herstoryafrica.com.ng</text>
        <g transform="translate(${EW - 88} ${EH - 53}) rotate(-2)">
          <rect x="-54" y="-19" width="108" height="38" rx="3" fill="${INK}" fill-opacity="0.9"/>
          <text y="-6" text-anchor="middle" font-family="${FACE.grotesque}" font-weight="500" font-size="7.5" letter-spacing="2.2" fill="#f4ecd8">BY AIR MAIL</text>
          <text y="11" text-anchor="middle" font-family="${FACE.grotesque}" font-weight="700" font-size="14" letter-spacing="2.6" fill="#f4ecd8">PAR AVION</text>
        </g>
        <g transform="rotate(1.6 ${stampX + stampW / 2} ${stampY + stampH / 2})" filter="url(#lift)">
          <image href="${uri(stamp)}" x="${stampX}" y="${stampY}" width="${stampW}" height="${stampH}"/>
        </g>
        <g opacity="0.95" font-family="${FACE.hand}" fill="${INK}">
          <text x="50" y="158" font-size="27" transform="rotate(-3 50 158)">${sx(addressedTo[0] ?? "")}</text>
          <text x="58" y="200" font-size="19" transform="rotate(-3 58 200)">${sx(addressedTo[1] ?? "")}</text>
          <text x="80" y="240" font-size="19" transform="rotate(-3 80 240)">${sx(addressedTo[2] ?? "")}</text>
        </g>
        <g opacity="0.8">${postmarkArt(stampX - 14, stampY + 26, -6, { top: "HERSTORY AFRICA", bottom: `LETTER ${number.toUpperCase()}`, day, year, colour: INK })}</g>
      </g>
    </g>`,
  );
  return jpeg(raster(doc), { width: W, height: H, background: DESK, quality: 86 });
}

/** The album page: this edition's stamp in place, the next three spaces empty. */
async function album(edition, stamp) {
  const W = 600;
  const H = 166;
  const sw = 104;
  const sh = (sw * 204) / 164;
  const gap = (W - 112 - 4 * sw) / 3;
  const slots = [];
  const coming = nextPostings(edition.date);

  for (let i = 0; i < 4; i++) {
    const x = 56 + i * (sw + gap);
    const y = 18;
    if (i === 0) {
      slots.push(`<g transform="rotate(-2 ${x + sw / 2} ${y + sh / 2})" filter="url(#lift)"><image href="${uri(stamp)}" x="${x}" y="${y}" width="${sw}" height="${sh}"/></g>`);
      continue;
    }
    slots.push(`<rect x="${x + 3}" y="${y + 3}" width="${sw - 6}" height="${sh - 6}" fill="none" stroke="${INK}" stroke-opacity="0.45" stroke-width="1" stroke-dasharray="2.5 3"/>
      <text x="${x + sw / 2}" y="${y + sh / 2 - 2}" text-anchor="middle" font-family="${FACE.book}" font-style="italic" font-size="15" fill="${INK}" fill-opacity="0.55">No. ${Number(edition.number) + i}</text>
      <text x="${x + sw / 2}" y="${y + sh / 2 + 16}" text-anchor="middle" font-family="${FACE.book}" font-style="italic" font-size="12" fill="${INK}" fill-opacity="0.55">${sx(coming[i - 1])}</text>`);
  }

  const doc = svg(
    W,
    H,
    `<defs>${shadow("lift", { blur: 7, dy: 3, opacity: 0.3 })}</defs>
    <image href="${uri(await paper({ width: W, height: H, colour: PAPER, seed: 34, mottle: 0.04, fade: 14 }))}" width="${W}" height="${H}"/>
    ${slots.join("")}`,
  );
  return jpeg(raster(doc), { width: W, height: H, background: PAPER, quality: 84 });
}

/** A crease across the sheet: shadow on one side of the line, light on the other. */
async function fold() {
  const W = 600;
  const H = 14;
  const doc = svg(
    W,
    H,
    `<defs>
      <linearGradient id="above" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#280e04" stop-opacity="0.16"/><stop offset="1" stop-color="#280e04" stop-opacity="0"/></linearGradient>
      <linearGradient id="below" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0d2" stop-opacity="0.5"/><stop offset="1" stop-color="#fff0d2" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${PAPER}"/>
    <rect y="0" width="${W}" height="${H / 2}" fill="url(#above)"/>
    <rect y="${H / 2}" width="${W}" height="${H / 2}" fill="url(#below)"/>`,
  );
  return jpeg(raster(doc), { width: W, height: H, background: PAPER, quality: 88 });
}

/** The strip where the sheet meets the desk, so the paper has an edge and a shadow. */
async function edge(side) {
  const W = 600;
  const H = 24;
  const doc = svg(
    W,
    H,
    `<defs>${shadow("cast", { blur: 11, dy: side === "top" ? 3 : 9, opacity: 0.45 })}</defs>
    <rect width="${W}" height="${H}" fill="${DESK}"/>
    <rect x="0" y="${side === "top" ? 10 : -70}" width="${W}" height="80" fill="${PAPER}" filter="url(#cast)"/>`,
  );
  return jpeg(raster(doc), { width: W, height: H, background: DESK, quality: 90 });
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
      rows.push(`<tr><td class="pad ask" style="padding:24px 56px 0 56px; font-family:${HAND}; font-size:29px; line-height:39px; font-style:italic; color:${TERRA};">${inline(block.text)}</td></tr>`);
    } else if (block.type === "fold") {
      const crease = a.get("fold.jpg");
      rows.push(`<tr><td style="padding:20px 0 0 0; font-size:0; line-height:0;"><img src="${crease.url}" width="600" alt="" style="width:100%; height:auto;"></td></tr>`);
    } else if (block.type === "photo") {
      const img = a.get("snapshot.jpg");
      rows.push(`<tr><td style="padding:14px 0 0 0; font-size:0; line-height:0;"><img src="${img.url}" width="600" alt="${esc(edition.photoAlt)}" style="width:100%; height:auto; font-family:Georgia,serif; font-size:14px; line-height:20px; font-style:italic; color:${INK};"></td></tr>
    <tr><td class="pad" align="center" style="padding:2px 56px 0 56px; font-family:${HAND}; font-size:14px; line-height:20px; font-style:italic; color:${FADED};">${esc(edition.photoCaption)}</td></tr>`);
    }
  }
  flush();

  const env = a.get("envelope.jpg");
  const stamps = a.get("album.jpg");
  const albumNote = edition.albumNote ?? `The stamp on the envelope is hers. Every letter comes with a new one, of the woman inside it. This is ${edition.number === 1 ? "No. 1, so start a page" : `No. ${edition.number}`}.`;

  const content = `  <table role="presentation" class="shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:${PAPER};">
    <tr><td bgcolor="${DESK}" style="font-size:0; line-height:0; background-color:${DESK};"><img src="${env.url}" width="600" alt="${esc(edition.envelopeAlt ?? `An airmail envelope addressed by hand. The stamp is an engraved portrait, postmarked ${formatDate(edition.date)}.`)}" style="width:100%; height:auto; font-family:Georgia,serif; font-size:14px; line-height:20px; font-style:italic; color:${INK};"></td></tr>
    <tr><td bgcolor="${DESK}" style="font-size:0; line-height:0; background-color:${DESK};"><img src="${a.get("edge-top.jpg").url}" width="600" alt="" style="width:100%; height:auto;"></td></tr>
    <tr><td class="pad" align="right" style="padding:14px 56px 0 56px; font-family:${HAND}; font-size:18px; line-height:28px; font-style:italic; color:#3a2a4a;">${formatDate(edition.date)}</td></tr>
    <tr><td class="pad hand" style="padding:26px 56px 0 56px; ${hand}">${esc(edition.salutation)}</td></tr>
    ${rows.join("\n    ")}
    <tr><td class="pad hand" style="padding:26px 56px 0 56px; ${hand}">${esc(edition.closing)}</td></tr>
    <tr><td class="pad" style="padding:0 56px 0 50px;"><img src="${a.kit("signature-letter.png")}" width="170" alt="${esc(edition.signedBy)}" style="width:170px; height:auto; font-family:Georgia,serif; font-size:30px; font-style:italic; color:${INK};"></td></tr>
    <tr><td class="pad hand" style="padding:10px 56px 0 56px; font-family:${HAND}; font-size:19px; line-height:30px; font-style:italic; color:${INK};">${inline(edition.ps, { link: `color:${TERRA}; text-decoration:underline;` })}</td></tr>
    <tr><td style="padding:30px 0 0 0; font-size:0; line-height:0;"><img src="${a.get("fold.jpg").url}" width="600" alt="" style="width:100%; height:auto;"></td></tr>
    <tr><td class="pad note" align="center" style="padding:16px 56px 0 56px; font-family:${HAND}; font-size:17px; line-height:27px; font-style:italic; color:${INK};">${inline(albumNote, { link: `color:${TERRA}; text-decoration:underline;` })}</td></tr>
    <tr><td style="padding:6px 0 0 0; font-size:0; line-height:0;"><img src="${stamps.url}" width="600" alt="${esc(`A page from a stamp album. Stamp ${edition.number} is in place and the next three spaces are empty.`)}" style="width:100%; height:auto; font-family:Georgia,serif; font-size:14px; line-height:20px; font-style:italic; color:${INK};"></td></tr>
    <tr><td class="pad" style="padding:16px 56px 26px 56px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border-top:1px solid #d8c9ac; font-size:0; line-height:0; height:1px;">&nbsp;</td></tr>
        <tr><td align="center" style="padding-top:14px; font-family:${HAND}; font-size:13px; line-height:21px; color:${FADED};">
          A letter from HerStory Africa, twice a month. You asked for these at ${siteLink(FADED)}.<br>
          <a href="${l.archive}" style="color:${FADED};">Earlier letters</a> &nbsp;|&nbsp;
          <a href="${l.browser}" style="color:${FADED};">Read in your browser</a> &nbsp;|&nbsp;
          <a href="${UNSUBSCRIBE}" style="color:${FADED};">Stop these letters</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td bgcolor="${DESK}" style="font-size:0; line-height:0; background-color:${DESK};"><img src="${a.get("edge-bottom.jpg").url}" width="600" alt="" style="width:100%; height:auto;"></td></tr>
  </table>`;

  return shell({
    title: edition.subject,
    preview: edition.preview,
    background: DESK,
    fontHref: "https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap",
    css: `    .mat-pad { padding:0 !important; }
    .pad { padding-left:26px !important; padding-right:26px !important; }
    .hand { font-size:19px !important; line-height:31px !important; }
    .ask { font-size:25px !important; line-height:34px !important; }
    .note { font-size:16px !important; line-height:25px !important; }`,
    content,
  });
}
