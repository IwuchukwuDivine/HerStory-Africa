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
import { envelopeScene, stampArt } from "../../emails/layouts/airmail.mjs";
import { creaseStrip, edgeStrip, mark, paper, raster, svg, uri } from "../../emails/layouts/art.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const KIT = join(ROOT, "public/newsletter/kit");

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
  ];
}

mkdirSync(KIT, { recursive: true });
for (const [name, art] of await welcome()) {
  writeFileSync(join(KIT, name), art.data);
  console.log(`  ✓ public/newsletter/kit/${name}  ${art.width}x${art.height}, ${(art.data.length / 1024).toFixed(1)} KB`);
}
console.log("\n  Commit and deploy these before pushing the templates with npm run resend:setup.\n");
