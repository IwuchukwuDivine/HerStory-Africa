import { FACE, jpeg, mark, measure, paper, raster, ring, shadow, stroke, svg, sx, tapedPrint, uri, wrap } from "./art.mjs";
import { UNSUBSCRIBE, esc, formatDate, inline, links, shell, siteLink } from "./shared.mjs";

export const meta = {
  id: "test",
  name: "The Test",
  vibe: "The reader's own exam script, already marked. Their pencil answer says nobody told them, the red pen agrees, and the mark goes from 0 out of 1 at the top to 1 out of 1 at the foot.",
  useWhen: [
    "The edition opens on a question almost nobody can answer",
    "The point is that she was left off the syllabus, not that the reader failed",
    "A playful edition that can take a joke at the reader's expense",
  ],
  avoidWhen: [
    "Anything solemn: the marking turns a woman's life into a quiz answer",
    "Editions without one clean question and one clean answer",
    "A reader who would plausibly have known (the pencil speaks for them)",
  ],
  registers: ["playful"],
  fields: {
    required: ["question", "pencilAnswer", "markedAnswer", "corrections", "closing"],
    optional: ["certificate", "subjectName", "paperName", "timeAllowed", "instructions", "candidate", "centre", "agreement", "verdict", "aside", "resitNote", "answerLabel", "answerNote", "examAlt"],
  },
  blocks: ["p", "highlight", "photo"],
};

const INK = "#2a1c33";
const PRINT = "#221a14";
const RED = "#c42b1c";
const PENCIL = "#565a70";
const TERRA = "#b5451b";
const PAPER = "#f7f0e0";
const DESK = "#2a1d15";
const FADED = "#6b5a4a";
const HAND = "'IM Fell English',Georgia,'Times New Roman',serif";
const SET = "'Old Standard TT','Times New Roman',Times,serif";

const DEFAULTS = {
  certificate: "General Certificate of Things They Left Out",
  subjectName: "HISTORY",
  paperName: "Paper 1",
  timeAllowed: "4 minutes",
  candidate: "You",
  centre: "your inbox",
  agreement: "Exactly.",
  verdict: "Not your fault.",
  aside: "See me.",
  resitNote: "Now you know.",
  answerLabel: "Model answer",
  instructions: [
    "Answer the question before you read any further.",
    "No conferring. No searching. Be honest.",
    "Your mark stays between you and the examiner.",
  ],
};

const field = (edition, key) => edition[key] ?? DEFAULTS[key];
const lines = (value) => String(value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);

/**
 * A figure one, drawn rather than typed: in this hand the glyph is a bare
 * slanted stroke, so a typed "1/1" sets as three slashes.
 */
function one(x, y, size, seed) {
  const h = size * 0.86;
  return (
    stroke([[x - size * 0.16, y - h * 0.6], [x + size * 0.06, y - h * 0.86], [x + size * 0.12, y - h * 0.8]], { colour: RED, width: 1.8, seed, wander: 0.3 }) +
    stroke([[x + size * 0.12, y - h * 0.84], [x + size * 0.07, y - h * 0.42], [x + size * 0.02, y]], { colour: RED, width: 2, seed: seed + 1, wander: 0.3 }) +
    stroke([[x - size * 0.14, y + 1], [x + size * 0.08, y - 0.5], [x + size * 0.28, y - 2]], { colour: RED, width: 1.6, seed: seed + 2, wander: 0.3 })
  );
}

/** A mark out of one, in the examiner's red: the score, a slash, a figure one. */
async function score(x, y, size, got, seed) {
  const figure = String(got) === "1";
  const w = figure ? size * 0.44 : await measure(String(got), { family: FACE.hand, size });
  const slash = x + w + 6;
  return `${figure ? one(x + size * 0.16, y, size, seed) : `<text x="${x}" y="${y}" font-family="${FACE.hand}" font-size="${size}" fill="${RED}">${sx(got)}</text>`}
    ${stroke([[slash, y + 3], [slash + 5, y - size * 0.45], [slash + 10, y - size * 0.92]], { colour: RED, width: 1.7, seed: seed + 5, wander: 0.4 })}
    ${one(slash + 20, y, size, seed + 8)}`;
}

export async function assets(edition, t) {
  const out = [];
  out.push({ name: "exam.jpg", ...(await examPaper(edition)) });
  out.push({
    name: "snapshot.jpg",
    ...(await tapedPrint(t.photoPath, { width: 600, height: 404, colour: PAPER, position: t.photoPosition, note: edition.answerNote ?? "the answer.", seed: 21 })),
  });
  out.push({ name: "resit.jpg", ...(await resit(edition)) });
  out.push({ name: "edge-top.jpg", ...(await edge("top")) });
  out.push({ name: "edge-bottom.jpg", ...(await edge("bottom")) });
  return out;
}

/** The script itself: the printed paper, the pencil answer and the marking. */
async function examPaper(edition) {
  const W = 600;
  const H = 704;
  const L = 46;
  const R = 554;
  const C = W / 2;
  const column = R - (L + 34);

  // The question is set as large as it goes in two lines, then shrunk to fit.
  let size = 23;
  let asked = await wrap(edition.question, column, { family: FACE.print, size });
  while (asked.length > 2 && size > 16) {
    size -= 1.5;
    asked = await wrap(edition.question, column, { family: FACE.print, size });
  }

  const pencil = lines(edition.pencilAnswer).slice(0, 2);
  const marked = lines(edition.markedAnswer).slice(0, 2);
  const instructions = field(edition, "instructions");
  const verdict = field(edition, "verdict");
  const aside = field(edition, "aside");

  // Where the red pen has to reach: under the last pencil line, and after the
  // verdict. Both need the real set width, not a guess.
  const pencilSize = 17.5;
  const lastPencil = await measure(pencil[pencil.length - 1] ?? "", { family: FACE.hand, size: pencilSize });
  const verdictWidth = await measure(verdict, { family: FACE.hand, size: 18 });
  const asideWidth = await measure(aside, { family: FACE.hand, size: 22 });

  const ux = L + 42;
  const uy = 496;
  const ax = L + 44 + verdictWidth + 20;
  const ringX = R - 50;
  const ringY = 420;

  const rules = [446, 492, 538, 584].map((y) => `<rect x="${L + 34}" y="${y}" width="${R - L - 34}" height="0.7" fill="${PRINT}" fill-opacity="0.4"/>`);
  const bullets = instructions
    .map((line, i) => `<circle cx="${L + 4}" cy="${242.5 + i * 21}" r="1.6" fill="${PRINT}"/><text x="${L + 18}" y="${247 + i * 21}" font-family="${FACE.print}" font-size="14" fill="${PRINT}">${sx(line)}</text>`)
    .join("");

  const doc = svg(
    W,
    H,
    `<image href="${uri(await paper({ width: W, height: H, colour: PAPER, seed: 5, mottle: 0.06, fade: 22 }))}" width="${W}" height="${H}"/>
    <g fill="${PRINT}" fill-opacity="0.9">
      ${mark(L, 26, 30, PRINT, 0.9)}
      <text x="${C}" y="40" text-anchor="middle" font-family="${FACE.print}" font-weight="700" font-size="11" letter-spacing="4.5">HERSTORY AFRICA</text>
      <text x="${C}" y="60" text-anchor="middle" font-family="${FACE.print}" font-style="italic" font-size="14">${sx(field(edition, "certificate"))}</text>
      <rect x="${L}" y="72" width="${R - L}" height="1.5"/>
      <rect x="${L}" y="76" width="${R - L}" height="0.6"/>
      <text x="${L}" y="114" font-family="${FACE.print}" font-weight="700" font-size="30" letter-spacing="4">${sx(field(edition, "subjectName").toUpperCase())}</text>
      <text x="${R}" y="112" text-anchor="end" font-family="${FACE.print}" font-style="italic" font-size="21">${sx(field(edition, "paperName"))}</text>
      <text x="${R}" y="138" text-anchor="end" font-family="${FACE.print}" font-size="13.5">Time allowed: ${sx(field(edition, "timeAllowed"))}</text>
      <text x="${L}" y="138" font-family="${FACE.print}" font-size="13.5">${sx(formatDate(edition.date))}</text>
      <rect x="${L}" y="152" width="${R - L}" height="0.6"/>
      <text x="${L}" y="186" font-family="${FACE.print}" font-style="italic" font-size="14">Candidate name</text>
      <text x="${L + 262}" y="186" font-family="${FACE.print}" font-style="italic" font-size="14">Centre</text>
      <path d="M ${L + 104} 188 H ${L + 244} M ${L + 310} 188 H ${R}" stroke="${PRINT}" stroke-width="1" stroke-dasharray="1.2 3" fill="none"/>
      <rect x="${L}" y="204" width="${R - L}" height="0.6"/>
      <text x="${L}" y="226" font-family="${FACE.print}" font-weight="700" font-size="9" letter-spacing="2.5">INSTRUCTIONS</text>
      ${bullets}
      <rect x="${L}" y="304" width="${R - L}" height="1.5"/>
      <text x="${L}" y="348" font-family="${FACE.print}" font-weight="700" font-size="${size}">1.</text>
      ${asked.map((line, i) => `<text x="${L + 34}" y="${348 + i * (size + 9)}" font-family="${FACE.print}" font-size="${size}">${sx(line)}</text>`).join("")}
      <text x="${R}" y="380" text-anchor="end" font-family="${FACE.print}" font-style="italic" font-size="13">[1 mark]</text>
      ${rules.join("")}
    </g>
    <g font-family="${FACE.hand}" fill="${PENCIL}" fill-opacity="0.85">
      <text x="${L + 128}" y="183" font-size="16" transform="rotate(-3 ${L + 128} 183)">${sx(field(edition, "candidate"))}</text>
      <text x="${L + 326}" y="183" font-size="13.5" transform="rotate(-2 ${L + 326} 183)">${sx(field(edition, "centre"))}</text>
      ${pencil.map((line, i) => `<text x="${L + 44}" y="${440 + i * 46}" font-size="${pencilSize}" transform="rotate(-1.5 ${L + 44} ${440 + i * 46})">${sx(line)}</text>`).join("")}
    </g>
    <g font-family="${FACE.hand}" fill="${RED}">
      ${stroke([[ux, uy], [ux + lastPencil * 0.5, uy - 3], [ux + lastPencil + 2, uy - 6]], { colour: RED, width: 1.8, seed: 31 })}
      ${stroke([[ux + 8, uy + 4.5], [ux + lastPencil * 0.6, uy + 1.5], [ux + lastPencil - 4, uy - 1.5]], { colour: RED, width: 1.3, seed: 32 })}
      <text x="${Math.min(ux + lastPencil + 22, 404)}" y="482" font-size="20" transform="rotate(-5 ${Math.min(ux + lastPencil + 22, 404)} 482)">${sx(field(edition, "agreement"))}</text>
      ${marked.map((line, i) => `<text x="${L + 44}" y="${531 + i * 46}" font-size="17" transform="rotate(-1.2 ${L + 44} ${531 + i * 46})">${sx(line)}</text>`).join("")}
      ${ring(ringX, ringY, 40, 27, { colour: RED, width: 2, seed: 41 })}
      <g transform="rotate(-4 ${ringX - 26} ${ringY + 10})">${await score(ringX - 26, ringY + 10, 22, "0", 42)}</g>
      <text x="${L + 44}" y="646" font-size="18" transform="rotate(-2.5 ${L + 44} 646)">${sx(verdict)}</text>
      <text x="${ax}" y="638" font-size="22" transform="rotate(-2.5 ${ax} 638)">${sx(aside)}</text>
      ${stroke([[ax - 2, 648], [ax + asideWidth / 2, 644], [ax + asideWidth, 641]], { colour: RED, width: 1.9, seed: 51 })}
      ${stroke([[ax + 6, 653], [ax + asideWidth / 2 + 4, 649.5], [ax + asideWidth - 6, 646.5]], { colour: RED, width: 1.3, seed: 52 })}
      ${stroke([[ax + asideWidth / 2 - 6, 661], [ax + asideWidth / 2 - 2, 674], [ax + asideWidth / 2 + 4, 688]], { colour: RED, width: 1.8, seed: 53 })}
      ${stroke([[ax + asideWidth / 2 - 6, 679], [ax + asideWidth / 2 + 4, 689], [ax + asideWidth / 2 + 12, 677]], { colour: RED, width: 1.6, seed: 54 })}
    </g>
    <circle cx="17" cy="250" r="6.5" fill="${DESK}"/>
    <circle cx="17" cy="540" r="6.5" fill="${DESK}"/>`,
  );
  return jpeg(raster(doc), { width: W, height: H, background: PAPER, quality: 86 });
}

/** The re-mark at the foot: a tick, a line in red and a new score. */
async function resit(edition) {
  const W = 600;
  const H = 132;
  const doc = svg(
    W,
    H,
    `<image href="${uri(await paper({ width: W, height: H, colour: PAPER, seed: 12, mottle: 0.04, fade: 16 }))}" width="${W}" height="${H}"/>
    ${stroke([[62, 66], [80, 90], [90, 96], [126, 30]], { colour: RED, width: 2.8, seed: 61 })}
    <text x="148" y="88" font-family="${FACE.hand}" font-size="25" fill="${RED}" transform="rotate(-3 148 88)">${sx(field(edition, "resitNote"))}</text>
    ${ring(506, 66, 40, 27, { colour: RED, width: 2, seed: 41 })}
    <g transform="rotate(-4 480 76)">${await score(480, 76, 22, "1", 42)}</g>`,
  );
  return jpeg(raster(doc), { width: W, height: H, background: PAPER, quality: 86 });
}

/** The strip where the script meets the desk it was handed back on. */
async function edge(side) {
  const W = 600;
  const H = 24;
  const doc = svg(
    W,
    H,
    `<defs>${shadow("cast", { blur: 11, dy: side === "top" ? 3 : 9, opacity: 0.5 })}</defs>
    <rect width="${W}" height="${H}" fill="${DESK}"/>
    <rect x="0" y="${side === "top" ? 10 : -70}" width="${W}" height="80" fill="${PAPER}" filter="url(#cast)"/>`,
  );
  return jpeg(raster(doc), { width: W, height: H, background: DESK, quality: 90 });
}

const rule = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:2px solid ${PRINT}; font-size:0; line-height:0; height:3px;">&nbsp;</td></tr><tr><td style="border-top:1px solid ${PRINT}; font-size:0; line-height:0; height:1px;">&nbsp;</td></tr></table>`;

const heading = (text, note) =>
  `<tr><td class="pad" style="padding:12px 56px 0 56px; font-family:${SET}; font-size:12px; line-height:18px; letter-spacing:3px; font-weight:bold; color:${PRINT};">${esc(text.toUpperCase())}${note ? ` <span style="font-weight:normal; font-style:italic; letter-spacing:0; font-size:15px;">${esc(note)}</span>` : ""}</td></tr>`;

export function render(edition, a) {
  const l = links(edition);
  const hand = `font-family:${HAND}; font-size:21px; line-height:34px; font-style:italic; color:${INK};`;
  const set = `font-family:${SET}; font-size:17.5px; line-height:28px; color:${PRINT};`;

  // The lead-in is in the examiner's hand; once the photograph is pinned up,
  // the model answer is set in print.
  const rows = [];
  let run = [];
  let marked = false;

  const flush = () => {
    if (!run.length) return;
    const style = marked ? set : hand;
    rows.push(`<tr><td class="pad ${marked ? "print" : "hand"}" style="padding:${marked ? 22 : 18}px 56px 0 56px; ${style}">${run.join("\n")}</td></tr>`);
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
      rows.push(`<tr><td class="pad ask" style="padding:24px 56px 0 56px; font-family:${HAND}; font-size:29px; line-height:39px; font-style:italic; color:#b9281a;">${inline(block.text)}</td></tr>`);
    } else if (block.type === "photo") {
      const img = a.get("snapshot.jpg");
      marked = true;
      rows.push(`<tr><td class="pad" style="padding:30px 56px 0 56px;">${rule}</td></tr>
    ${heading(edition.answerLabel ?? DEFAULTS.answerLabel)}
    <tr><td style="padding:4px 0 0 0; font-size:0; line-height:0;"><img src="${img.url}" width="600" alt="${esc(edition.photoAlt)}" style="width:100%; height:auto; font-family:Georgia,serif; font-size:14px; line-height:20px; font-style:italic; color:${INK};"></td></tr>
    <tr><td class="pad" align="center" style="padding:2px 56px 0 56px; font-family:${HAND}; font-size:14px; line-height:20px; font-style:italic; color:${FADED};">Fig. 1. ${esc(edition.photoCaption)}</td></tr>`);
    }
  }
  flush();

  const corrections = (edition.corrections ?? [])
    .map(
      (item, i) => `<tr>
          <td valign="top" width="30" style="width:30px; padding:0 0 12px 0; font-family:${SET}; font-size:17px; line-height:30px; font-weight:bold; color:${PRINT};">${i + 1}.</td>
          <td class="hand" valign="top" style="padding:0 0 12px 0; font-family:${HAND}; font-size:20px; line-height:30px; font-style:italic; color:${INK};">${inline(item, { link: `color:${TERRA}; text-decoration:underline;` })}</td>
        </tr>`,
    )
    .join("\n        ");

  const exam = a.get("exam.jpg");
  const again = a.get("resit.jpg");

  const content = `  <table role="presentation" class="shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:${PAPER};">
    <tr><td bgcolor="${DESK}" style="font-size:0; line-height:0; background-color:${DESK};"><img src="${a.get("edge-top.jpg").url}" width="600" alt="" style="width:100%; height:auto;"></td></tr>
    <tr><td style="font-size:0; line-height:0;"><img src="${exam.url}" width="600" alt="${esc(edition.examAlt ?? `An exam paper marked in red. The question: ${edition.question} The candidate's pencil answer, and the examiner's: ${lines(edition.markedAnswer).join(" ")} The mark is 0 out of 1.`)}" style="width:100%; height:auto; font-family:Georgia,serif; font-size:14px; line-height:20px; font-style:italic; color:${INK};"></td></tr>
    ${rows.join("\n    ")}
    <tr><td class="pad" style="padding:30px 56px 0 56px;">${rule}</td></tr>
    ${heading("Corrections", "(to be done at home)")}
    <tr><td class="pad" style="padding:16px 56px 0 56px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${corrections}
      </table>
    </td></tr>
    <tr><td style="padding:8px 0 0 0; font-size:0; line-height:0;"><img src="${again.url}" width="600" alt="${esc(`In red pen: a tick, the words ${edition.resitNote ?? DEFAULTS.resitNote}, and a new mark, 1 out of 1.`)}" style="width:100%; height:auto; font-family:Georgia,serif; font-size:14px; line-height:20px; font-style:italic; color:${INK};"></td></tr>
    <tr><td class="pad hand" style="padding:26px 56px 0 56px; ${hand}">${esc(edition.closing)}</td></tr>
    <tr><td class="pad" style="padding:0 56px 0 50px;"><img src="${a.kit("signature-letter.png")}" width="170" alt="${esc(edition.signedBy)}" style="width:170px; height:auto; font-family:Georgia,serif; font-size:30px; font-style:italic; color:${INK};"></td></tr>
    <tr><td class="pad" style="padding:38px 56px 26px 56px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border-top:1px solid #d8c9ac; font-size:0; line-height:0; height:1px;">&nbsp;</td></tr>
        <tr><td align="center" style="padding-top:14px; font-family:${HAND}; font-size:13px; line-height:21px; color:${FADED};">
          A paper from HerStory Africa, twice a month. You are on the register because you signed up at ${siteLink(FADED)}.<br>
          <a href="${l.archive}" style="color:${FADED};">Past papers</a> &nbsp;|&nbsp;
          <a href="${l.browser}" style="color:${FADED};">Read in your browser</a> &nbsp;|&nbsp;
          <a href="${UNSUBSCRIBE}" style="color:${FADED};">Leave the class</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td bgcolor="${DESK}" style="font-size:0; line-height:0; background-color:${DESK};"><img src="${a.get("edge-bottom.jpg").url}" width="600" alt="" style="width:100%; height:auto;"></td></tr>
  </table>`;

  return shell({
    title: edition.subject,
    preview: edition.preview,
    background: DESK,
    fontHref: "https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap",
    css: `    .mat-pad { padding:0 !important; }
    .pad { padding-left:26px !important; padding-right:26px !important; }
    .hand { font-size:19px !important; line-height:31px !important; }
    .ask { font-size:25px !important; line-height:34px !important; }
    .print { font-size:16.5px !important; line-height:26px !important; }`,
    content,
  });
}
