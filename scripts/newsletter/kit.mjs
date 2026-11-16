#!/usr/bin/env node
// Draws the fixed artwork the Resend-hosted templates use, into
// public/newsletter/kit/. Editions draw their own images at build time; these
// are drawn once, committed, and deployed with the site, because a hosted
// template is the same HTML for every reader.
//
//   npm run newsletter:kit
//
// The welcome wears the By Air Mail envelope, with the brand mark on the stamp
// instead of a woman: it is a confirmation that someone subscribed, not an
// edition about anybody.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { envelopeScene, stampArt } from "../../emails/layouts/airmail.mjs";
import { FACE, creaseStrip, edgeStrip, mark, paper, raster, scriptText, svg, sx, uri } from "../../emails/layouts/art.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const KIT = join(ROOT, "public/newsletter/kit");

/** The letters are signed with the masthead, not with anybody's name. */
const SIGNED = "HerStory Africa";

const PAPER = "#f7f0e0";
const DESK = "#cfc3ab";
const INK = "#8f3414";
const TINT = "#f4e8ce";

/**
 * The continent mark the way the portrait stamps carry a face: one ink on one
 * tint, under a line screen, so the welcome stamp sits in the same album.
 */
function engravedMark(width, height) {
  // The mark is drawn on a 64 grid but only fills 38 by 60 of it, so size it
  // from the glyph rather than the grid or it sits small in the middle.
  const size = (height * 0.9) / (60 / 64);
  const x = (width - (38 / 64) * size) / 2 - (9 / 64) * size;
  const y = (height - (60 / 64) * size) / 2 - (2 / 64) * size;

  const lines = [];
  for (let row = -height; row < height * 2; row += 1.8) {
    lines.push(`<rect x="${-width}" y="${row.toFixed(2)}" width="${width * 3}" height="0.9" fill="${TINT}"/>`);
  }
  return raster(
    svg(
      width,
      height,
      `<rect width="${width}" height="${height}" fill="${TINT}"/>
      ${mark(x, y, size, INK)}
      <g opacity="0.6" transform="rotate(35 ${width / 2} ${height / 2})">${lines.join("")}</g>`,
    ),
  );
}

/**
 * The sign-off in the letter sheets' hand, written out rather than set in a
 * font the reader has, so every client shows the same one. Drawn wide and then
 * trimmed to the ink, because a handwritten face overhangs its own box and a
 * fixed canvas clips the tails.
 */
async function handSignature(ink) {
  const drawn = raster(
    svg(
      760,
      200,
      `<text x="20" y="130" font-family="${FACE.hand}" font-size="58" fill="${ink}">${sx(SIGNED)}</text>`,
    ),
    1.5,
  );
  const { data, info } = await sharp(drawn)
    .trim({ threshold: 1 })
    .extend({ top: 10, bottom: 10, left: 10, right: 10, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** The same sign-off in the love letter's copperplate. */
async function scriptSignature(ink) {
  const { data } = await scriptText(SIGNED, { size: 34, colour: ink });
  const { info } = await sharp(data).png().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function welcome() {
  const stamp = raster(
    stampArt({
      ground: uri(await paper({ width: 164, height: 204, colour: "#f7f0dd", seed: 3, mottle: 0.06 })),
      plate: uri(engravedMark(122, 124)),
      corner: "No. 0",
      name: "The women history forgot",
      line: "Posted twice a month",
    }),
  );

  return [
    [
      "welcome-envelope.jpg",
      await envelopeScene({
        stamp,
        address: "To you,\nwherever you are\nreading this.",
        // No date: a hosted template is sent on whatever day someone signs up.
        postmark: { top: "HERSTORY AFRICA", bottom: "SUBSCRIBED", day: "FIRST", year: "LETTER" },
      }),
    ],
    ["welcome-edge-top.jpg", await edgeStrip({ side: "top", sheet: PAPER, desk: DESK })],
    ["welcome-edge-bottom.jpg", await edgeStrip({ side: "bottom", sheet: PAPER, desk: DESK })],
    ["welcome-fold.jpg", await creaseStrip({ sheet: PAPER })],
    // Two inks, because the letter sheets and the love letter are not the same colour.
    ["signature-letter.png", await handSignature("#1c102f")],
    // The love letter signs in the copperplate its salutation and closing are
    // drawn in, not in the marker hand the letter sheets use.
    ["signature-script.png", await scriptSignature("#3a2012")],
  ];
}

mkdirSync(KIT, { recursive: true });
for (const [name, art] of await welcome()) {
  writeFileSync(join(KIT, name), art.data);
  console.log(`  ✓ public/newsletter/kit/${name}  ${art.width}x${art.height}, ${(art.data.length / 1024).toFixed(1)} KB`);
}
console.log("\n  Commit and deploy these before pushing the templates with npm run resend:setup.\n");
