// Artwork the layouts draw at build time: textured paper, engraved postage
// stamps, pen and pencil marks, taped prints.
//
// Drawings are hand-written SVG rendered by resvg against the font files in
// emails/fonts/, so a build draws the same thing whatever is installed on the
// machine, and the textures come from a seeded generator so rebuilding an
// unchanged edition writes the same bytes. None of this is sent to a browser:
// the output is a JPEG or PNG in public/newsletter/<slug>/.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";

const FONT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../fonts");

const FONT_FILES = [
  "OldStandardTT-Regular.ttf",
  "OldStandardTT-Italic.ttf",
  "OldStandardTT-Bold.ttf",
  "IMFellEnglish-Regular.ttf",
  "IMFellEnglish-Italic.ttf",
  "Oswald-500.ttf",
  "Oswald-700.ttf",
  "HomemadeApple-Regular.ttf",
].map((file) => join(FONT_DIR, file));

/** The families those files provide, for the font-family attribute in a drawing. */
export const FACE = {
  print: "Old Standard TT",
  book: "IM Fell English",
  grotesque: "Oswald",
  hand: "Homemade Apple",
};

/** Drawings are laid out in 600-wide units and rasterised at twice that. */
export const DPR = 2;

/** XML-escape a string going into an SVG text node or attribute. */
export const sx = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** Wrap drawing instructions in an SVG document of w by h layout units. */
export const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

/** A buffer as a data URI, for an <image> inside a drawing. */
export const uri = (png) => `data:image/png;base64,${png.toString("base64")}`;

/** An SVG document to a PNG buffer, at DPR times its layout size. */
export const raster = (doc, scale = DPR) =>
  new Resvg(doc, {
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: FACE.print },
    fitTo: { mode: "zoom", value: scale },
  })
    .render()
    .asPng();

/** Cursive lines are drawn as images so they look the same in every inbox. */
const scriptFont = readFileSync(join(FONT_DIR, "PinyonScript-Regular.woff"));
export async function scriptText(text, { size, colour }) {
  const scale = 2;
  const doc = await satori(
    {
      type: "div",
      props: {
        style: { display: "flex", fontFamily: "Pinyon Script", fontSize: size * scale, lineHeight: 1.3, color: colour, padding: size, whiteSpace: "nowrap" },
        children: text,
      },
    },
    { width: Math.ceil(text.length * size * scale * 0.8 + size * 4), height: size * scale * 3, fonts: [{ name: "Pinyon Script", data: scriptFont, weight: 400, style: "normal" }] },
  );
  const png = new Resvg(doc, { background: "rgba(0,0,0,0)" }).render().asPng();
  const trimmed = await sharp(png)
    .trim()
    .extend({ top: 8, bottom: 12, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { data: trimmed.data, width: Math.round(trimmed.info.width / scale), height: Math.round(trimmed.info.height / scale) };
}

/**
 * How wide a line of type sets, in layout units. Drawn and measured rather
 * than estimated, because the drawings put text on fixed coordinates and a
 * guess at the advance width puts it in the wrong place.
 */
export async function measure(text, { family, size, weight = 400, style = "normal", spacing = 0 }) {
  if (!text) return 0;
  const pad = size * 2;
  const doc = svg(
    Math.ceil(text.length * size * 1.4 + pad * 2),
    Math.ceil(size * 3),
    `<rect width="100%" height="100%" fill="#ffffff"/>
     <text x="${pad}" y="${size * 2}" font-family="${family}" font-size="${size}" font-weight="${weight}" font-style="${style}" letter-spacing="${spacing}" fill="#000000">${sx(text)}</text>`,
  );
  const { info } = await sharp(raster(doc, 1)).trim({ threshold: 12 }).toBuffer({ resolveWithObject: true });
  return info.width;
}

/** Break a line of copy so no line sets wider than max units. */
export async function wrap(text, max, style) {
  const lines = [];
  let line = "";
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && (await measure(next, style)) > max) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** A small deterministic generator, so an unchanged edition redraws byte for byte. */
export function rng(seed = 1) {
  let s = (Math.round(seed) * 2654435761) >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * A sheet of paper: the flat colour, a soft cloud of unevenness over it and a
 * fine grain on top. Returned at DPR, ready to sit under a drawing.
 */
export async function paper({ width, height, colour, seed = 1, mottle = 0.07, grain = 4, fade = 0 }) {
  const w = Math.round(width * DPR);
  const h = Math.round(height * DPR);
  const r = rng(seed);

  // The cloud: a few dozen cells of noise blurred up to size, so the sheet is
  // unevenly lit rather than speckled.
  const cw = Math.max(3, Math.round(w / 48));
  const ch = Math.max(3, Math.round(h / 48));
  const cloud = Buffer.allocUnsafe(cw * ch);
  for (let i = 0; i < cloud.length; i++) cloud[i] = Math.round(255 - r() * 255 * mottle);
  const haze = await sharp(cloud, { raw: { width: cw, height: ch, channels: 1 } })
    .resize(w, h, { fit: "fill", kernel: "cubic" })
    .blur(Math.max(1, w / 28))
    .png()
    .toBuffer();

  // The grain: a fine dust that only ever darkens, so the paper keeps its hue.
  const speck = Buffer.allocUnsafe(w * h);
  for (let i = 0; i < speck.length; i++) speck[i] = 255 - Math.round(r() * grain);
  const dust = await sharp(speck, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();

  const layers = [
    { input: haze, blend: "multiply" },
    { input: dust, blend: "multiply" },
  ];

  // A strip that butts up against the flat colour in the email needs its top
  // and bottom edges blended back to it, or the join shows as a step.
  if (fade) {
    const f = Math.round(fade * DPR);
    layers.push({
      input: Buffer.from(
        svg(
          w,
          h,
          `<defs>
            <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colour}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></linearGradient>
            <linearGradient id="b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${colour}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></linearGradient>
          </defs>
          <rect width="${w}" height="${f}" fill="url(#t)"/>
          <rect y="${h - f}" width="${w}" height="${f}" fill="url(#b)"/>`,
        ),
      ),
      blend: "over",
    });
  }

  // Cloud and grain only ever darken, so the sheet would average out below the
  // colour asked for and show as a step where it meets the flat colour in the
  // email. Lighten the ground by what they take away.
  const back = hex(colour).map((v) => Math.min(255, Math.round(v / ((1 - mottle / 2) * (1 - grain / 510)))));
  return sharp({ create: { width: w, height: h, channels: 3, background: { r: back[0], g: back[1], b: back[2] } } })
    .composite(layers)
    .png()
    .toBuffer();
}

/**
 * A photograph as a line engraving, the way a postage stamp carries a portrait:
 * one ink on one tint, the lines thickening where the picture is dark.
 */
export async function engrave(photoPath, { width, height, position = "attention", zoom = 1, ink, tint, pitch = 4.6, angle = 35, lo = 0, hi = 0.95, gamma = 1.6, tones = 2.6, clahe = true }) {
  // Drawn at three times the layout size and brought back down, so the lines
  // keep a clean edge instead of crawling.
  const draw = 3;
  const w = Math.round(width * draw);
  const h = Math.round(height * draw);
  // A stamp wants the head, not the room around it: zoom in on the crop the
  // profile already chose, then take the frame back out of the middle of it.
  const zw = Math.round(w * zoom);
  const zh = Math.round(h * zoom);
  const framed = await sharp(photoPath).resize(zw, zh, { fit: "cover", position }).toBuffer();
  let sheet = sharp(framed)
    .extract({ left: Math.round((zw - w) / 2), top: Math.round((zh - h) * (position === "top" ? 0.25 : 0.5)), width: w, height: h })
    .grayscale()
    .normalise();
  // Many archive portraits are a dark subject on a dark ground. Local contrast
  // is what pulls a face out of one; a straight curve just makes it muddier.
  if (clahe) sheet = sheet.clahe({ width: Math.max(3, Math.round(w / 7)), height: Math.max(3, Math.round(h / 7)), maxSlope: 3 });
  const plate = await sheet.gamma(tones).raw().toBuffer();

  const [ir, ig, ib] = hex(ink);
  const [tr, tg, tb] = hex(tint);
  const sin = Math.sin((angle * Math.PI) / 180);
  const cos = Math.cos((angle * Math.PI) / 180);
  const out = Buffer.allocUnsafe(w * h * 3);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tone = 1 - plate[y * w + x] / 255;
      // How far across the current line this pixel sits, 0 at the centre.
      const phase = (((x * sin + y * cos) % pitch) + pitch) % pitch;
      const offset = Math.abs(phase / pitch - 0.5) * 2;
      // Darker tone, fatter line. A soft shoulder keeps the edges from crawling.
      const cover = lo + (hi - lo) * tone ** gamma;
      const amount = clamp((cover - offset) / 0.18 + 0.5);
      const i = (y * w + x) * 3;
      out[i] = tr + (ir - tr) * amount;
      out[i + 1] = tg + (ig - tg) * amount;
      out[i + 2] = tb + (ib - tb) * amount;
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .resize(Math.round(width * DPR), Math.round(height * DPR))
    .png()
    .toBuffer();
}

const clamp = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
const hex = (s) => [1, 3, 5].map((i) => Number.parseInt(s.slice(i, i + 2), 16));

/**
 * A stroke made with a pen held by a person: the points joined by curves, with
 * the line wandering a little off true.
 */
export function stroke(points, { colour, width = 2, seed = 1, wander = 0.9, opacity = 1 }) {
  const r = rng(seed);
  const p = points.map(([x, y]) => [x + (r() - 0.5) * wander * 2, y + (r() - 0.5) * wander * 2]);
  let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 1; i < p.length; i++) {
    const [x, y] = p[i];
    const [px, py] = p[i - 1];
    const mid = [(px + x) / 2, (py + y) / 2];
    d += ` Q ${px.toFixed(1)} ${py.toFixed(1)} ${mid[0].toFixed(1)} ${mid[1].toFixed(1)}`;
  }
  const last = p[p.length - 1];
  d += ` T ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  return `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
}

/** The ring a marker draws round a mark in the margin. */
export function ring(cx, cy, rx, ry, { colour, width = 2, seed = 1 }) {
  const points = [];
  for (let i = 0; i <= 22; i++) {
    const a = -2.2 + (i / 20) * 6.6;
    points.push([cx + Math.cos(a) * (rx + i * 0.25), cy + Math.sin(a) * (ry + i * 0.2)]);
  }
  return stroke(points, { colour, width, seed, wander: 0.5 });
}

/** A torn strip of masking tape, for holding a print to the page. */
export function tape(x, y, w, h, rotation) {
  return `<g transform="rotate(${rotation} ${x + w / 2} ${y + h / 2})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e2cd96" fill-opacity="0.72"/>
    <rect x="${x}" y="${y}" width="${w}" height="1.2" fill="#fffaf0" fill-opacity="0.45"/>
  </g>`;
}

/** The stylised continent from the site logo, drawn at 28 by 62 units from (0,0). */
export const MARK_PATH =
  "M 28,2 C 34,2 40,4 42,9 C 44,13 46,17 44,22 C 46,26 47,30 45,35 C 47,40 46,46 42,51 C 38,57 32,62 28,62 C 24,62 18,57 14,51 C 10,46 9,40 11,35 C 9,30 10,26 12,22 C 10,17 12,13 14,9 C 16,4 22,2 28,2 Z";

/** The mark at a given size and colour, its top-left corner at (x, y). */
export function mark(x, y, size, colour, opacity = 1) {
  const k = size / 64;
  return `<g transform="translate(${x} ${y}) scale(${k})" opacity="${opacity}">
    <path d="${MARK_PATH}" fill="${colour}" fill-opacity="0.16"/>
    <path d="${MARK_PATH}" fill="none" stroke="${colour}" stroke-width="3"/>
    <circle cx="28" cy="34" r="5.5" fill="${colour}"/>
  </g>`;
}

/** A drop shadow filter, for paper lifted off the surface under it. */
export const shadow = (id, { blur = 10, dy = 4, opacity = 0.4 }) =>
  `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%">
    <feDropShadow dx="0" dy="${dy}" stdDeviation="${blur}" flood-color="#28150a" flood-opacity="${opacity}"/>
  </filter>`;

/** Flatten a drawing onto a background and encode it for the email. */
export async function jpeg(png, { width, height, background, quality = 84 }) {
  const data = await sharp(png)
    .flatten({ background })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
  return { data, width, height };
}

/**
 * A print of the photograph with a white border, taped to the page at a tilt,
 * with a line written under it in the margin the border leaves.
 */
export async function tapedPrint(photoPath, { width, height, colour, position = "attention", note = "", seed = 21, tilt = -2.5 }) {
  const pw = 300;
  const ph = 285;
  const border = 13;
  const bottom = 54;
  const print = await sharp(photoPath)
    .resize((pw - border * 2) * DPR, (ph - border - bottom) * DPR, { fit: "cover", position })
    .modulate({ saturation: 0.78 })
    .linear(0.93, 14)
    .extend({ top: border * DPR, left: border * DPR, right: border * DPR, bottom: bottom * DPR, background: "#fcf8ee" })
    .png()
    .toBuffer();

  const doc = svg(
    width,
    height,
    `<defs>${shadow("lift", { blur: 11, dy: 6, opacity: 0.34 })}</defs>
    <image href="${uri(await paper({ width, height, colour, seed, mottle: 0.05, fade: 18 }))}" width="${width}" height="${height}"/>
    <g transform="rotate(${tilt} ${width / 2} ${height / 2})">
      <image href="${uri(print)}" x="${(width - pw) / 2}" y="${(height - ph) / 2}" width="${pw}" height="${ph}" filter="url(#lift)"/>
      ${note ? `<text x="${width / 2 - 70}" y="${(height + ph) / 2 - 17}" font-family="${FACE.hand}" font-size="16" fill="#2a1c33" fill-opacity="0.9" transform="rotate(-1.5 ${width / 2 - 70} ${(height + ph) / 2 - 17})">${sx(note)}</text>` : ""}
      ${tape(width / 2 - 48, (height - ph) / 2 - 12, 96, 26, -5)}
    </g>`,
  );
  return jpeg(raster(doc), { width, height, background: colour, quality: 84 });
}

/**
 * The strip where a sheet meets the surface under it, so the paper has an edge
 * and casts a shadow onto the desk instead of starting out of nowhere.
 */
export async function edgeStrip({ side, sheet, desk, height = 24, width = 600 }) {
  const doc = svg(
    width,
    height,
    `<defs>${shadow("cast", { blur: 11, dy: side === "top" ? 3 : 9, opacity: 0.46 })}</defs>
    <rect width="${width}" height="${height}" fill="${desk}"/>
    <rect x="0" y="${side === "top" ? height - 14 : -70}" width="${width}" height="80" fill="${sheet}" filter="url(#cast)"/>`,
  );
  return jpeg(raster(doc), { width, height, background: desk, quality: 90 });
}

/** A crease across the sheet: shadow on one side of the line, light on the other. */
export async function creaseStrip({ sheet, height = 14, width = 600 }) {
  const doc = svg(
    width,
    height,
    `<defs>
      <linearGradient id="above" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#280e04" stop-opacity="0.16"/><stop offset="1" stop-color="#280e04" stop-opacity="0"/></linearGradient>
      <linearGradient id="below" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0d2" stop-opacity="0.5"/><stop offset="1" stop-color="#fff0d2" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${sheet}"/>
    <rect y="0" width="${width}" height="${height / 2}" fill="url(#above)"/>
    <rect y="${height / 2}" width="${width}" height="${height / 2}" fill="url(#below)"/>`,
  );
  return jpeg(raster(doc), { width, height, background: sheet, quality: 88 });
}
