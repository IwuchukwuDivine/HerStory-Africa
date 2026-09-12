/**
 * Paints the "Spread her story" share card onto a canvas.
 *
 * Same family as the OG image: the photograph is the card, the name is the
 * headline, the museum rule and eyebrow carry the facts. Square (1080 × 1080)
 * and story (1080 × 1920) are one layout with different photo heights.
 */
import { AFRICA_PATH, clip, hasPortrait, lifespan } from "./format";

export type CardFormat = "square" | "story";
export type CardTheme = "light" | "dark";

export interface CardData {
  name: string;
  slug: string;
  country: string;
  era: string;
  summary: string;
  born: number;
  died: number | null;
  imageUrl: string;
  /** CSS object-position style focal point, e.g. "50% 20%". */
  focal?: string;
}

interface CardDimensions {
  width: number;
  height: number;
}

export const DIMENSIONS: Record<CardFormat, CardDimensions> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

interface Palette {
  page: string;
  name: string;
  eyebrow: string;
  body: string;
  domain: string;
}

const PALETTES: Record<CardTheme | "terracotta", Palette> = {
  light: { page: "#fdf8f3", name: "#1c0f07", eyebrow: "#b5451b", body: "#4a2e1a", domain: "#b5451b" },
  dark: { page: "#120a04", name: "#fdf8f3", eyebrow: "#edca52", body: "#d4b89a", domain: "#edca52" },
  terracotta: { page: "#7d2c10", name: "#fdf8f3", eyebrow: "#edca52", body: "#fae4d6", domain: "#faf1cc" },
};

const GOLD = "#c8941a";
const GOLD_LIGHT = "#edca52";
const CREAM = "#fdf8f3";
const FONT = '"Playfair Display", Georgia, serif';
const DOMAIN = "herstoryafrica.com.ng";
const TAGLINE = "The women history forgot to teach you.";
const DEFAULT_FOCAL = "50% 20%";

/** Everything that differs between the two formats. */
interface Layout {
  photoH: number;
  gradientH: number;
  lockup: { x: number; y: number; mark: number; text: number; gap: number };
  text: { x: number; right: number; top: number; ruleW: number; gapRule: number; eyebrow: number; gap: number; summary: number; summaryMax: number };
  footer: { size: number; bottom: number };
}

const LAYOUTS: Record<CardFormat, Layout> = {
  square: {
    photoH: 680,
    gradientH: 240,
    lockup: { x: 64, y: 56, mark: 44, text: 30, gap: 16 },
    text: { x: 64, right: 1016, top: 600, ruleW: 48, gapRule: 12, eyebrow: 24, gap: 22, summary: 34, summaryMax: 900 },
    footer: { size: 24, bottom: 1080 - 52 },
  },
  story: {
    photoH: 1300,
    gradientH: 400,
    lockup: { x: 72, y: 270, mark: 52, text: 34, gap: 18 },
    text: { x: 72, right: 1008, top: 1080, ruleW: 56, gapRule: 14, eyebrow: 28, gap: 26, summary: 38, summaryMax: 936 },
    footer: { size: 28, bottom: 1920 - 270 },
  },
};

/* ─── Helpers ─── */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** "50% 20%" -> [0.5, 0.2]; anything unparseable falls back to the default. */
function parseFocal(focal: string | undefined): [number, number] {
  const m = (focal || DEFAULT_FOCAL).match(/([\d.]+)%\s+([\d.]+)%/) ?? DEFAULT_FOCAL.match(/([\d.]+)%\s+([\d.]+)%/)!;
  return [Number(m[1]) / 100, Number(m[2]) / 100];
}

/** CSS `linear-gradient(<deg>, …)` geometry on a w × h box. */
function angledGradient(ctx: CanvasRenderingContext2D, w: number, h: number, deg: number): CanvasGradient {
  const rad = (deg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  const cx = w / 2;
  const cy = h / 2;
  return ctx.createLinearGradient(cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2);
}

type SpacingCtx = CanvasRenderingContext2D & { letterSpacing?: string };

function supportsLetterSpacing(ctx: CanvasRenderingContext2D): boolean {
  return "letterSpacing" in ctx;
}

/** Width of `text` with `spacing` px of tracking after every glyph. */
function textWidth(ctx: CanvasRenderingContext2D, text: string, spacing = 0): number {
  if (!spacing) return ctx.measureText(text).width;
  if (supportsLetterSpacing(ctx)) {
    const c = ctx as SpacingCtx;
    const prev = c.letterSpacing;
    c.letterSpacing = `${spacing}px`;
    const w = ctx.measureText(text).width;
    c.letterSpacing = prev;
    return w;
  }
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + spacing;
  return w;
}

/** fillText with tracking, native where the browser has it, per glyph otherwise. */
function fillTracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing = 0): void {
  if (!spacing) {
    ctx.fillText(text, x, y);
    return;
  }
  if (supportsLetterSpacing(ctx)) {
    const c = ctx as SpacingCtx;
    const prev = c.letterSpacing;
    c.letterSpacing = `${spacing}px`;
    ctx.fillText(text, x, y);
    c.letterSpacing = prev;
    return;
  }
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

/**
 * Baseline for a line of the current font whose line box starts at `top`
 * and is `size × lineHeight` tall, the way CSS centres the glyph box inside
 * the line box. Falls back to Playfair's metrics when the browser cannot
 * report them.
 */
function baselineFor(ctx: CanvasRenderingContext2D, top: number, size: number, lineHeight: number): number {
  const m = ctx.measureText("Hg");
  const ascent = m.fontBoundingBoxAscent || size * 1.082;
  const descent = m.fontBoundingBoxDescent || size * 0.251;
  return top + (size * lineHeight - (ascent + descent)) / 2 + ascent;
}

/** Greedy word wrap; the last line gets an ellipsis when there is more text than lines. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number, spacing = 0): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (!line || textWidth(ctx, test, spacing) <= maxWidth) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1]!;
  const overflowed = last.endsWith("…");
  if (!overflowed) last = `${last}…`;
  while (textWidth(ctx, last, spacing) > maxWidth && last.includes(" ")) {
    last = `${last.slice(0, last.lastIndexOf(" ")).replace(/[,;:.]$/, "")}…`;
  }
  kept[maxLines - 1] = last;
  return kept;
}

/** The continent mark: AFRICA_PATH lives in a 32-unit box, drawn at `size` px from (x, y). */
function drawMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: { fill: string; fillAlpha?: number; stroke: string; strokeWidth: number; strokeAlpha?: number; dotR: number; dotAlpha?: number },
): void {
  const path = new Path2D(AFRICA_PATH);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 32, size / 32);

  ctx.globalAlpha = style.fillAlpha ?? 1;
  ctx.fillStyle = style.fill;
  ctx.fill(path);

  ctx.globalAlpha = style.strokeAlpha ?? 1;
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = style.strokeWidth;
  ctx.stroke(path);

  ctx.globalAlpha = style.dotAlpha ?? 1;
  ctx.fillStyle = style.stroke;
  ctx.beginPath();
  ctx.arc(16, 17, style.dotR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

async function ensureFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load('900 92px "Playfair Display"'),
      document.fonts.load('700 30px "Playfair Display"'),
      document.fonts.load('400 34px "Playfair Display"'),
      document.fonts.load('italic 400 24px "Playfair Display"'),
    ]);
  } catch {
    // Fall through to the serif fallback rather than failing the render.
  }
}

/* ─── Painter ─── */

export async function drawShareCard(
  canvas: HTMLCanvasElement,
  data: CardData,
  format: CardFormat = "square",
  theme: CardTheme = "light",
): Promise<void> {
  const { width, height } = DIMENSIONS[format];
  const L = LAYOUTS[format];

  await ensureFonts();

  let photo: HTMLImageElement | null = null;
  if (hasPortrait(data.imageUrl)) {
    photo = await loadImage(data.imageUrl).catch(() => null);
  }

  const palette = photo ? PALETTES[theme] : PALETTES.terracotta;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  /* 1. Ground */
  if (photo) {
    ctx.fillStyle = palette.page;
    ctx.fillRect(0, 0, width, height);

    // Cover-fit the photo into the plate, offset by the focal point the way
    // CSS object-position does: offset = (container − drawn) × pct.
    const [fx, fy] = parseFocal(data.focal);
    const scale = Math.max(width / photo.naturalWidth, L.photoH / photo.naturalHeight);
    const dw = photo.naturalWidth * scale;
    const dh = photo.naturalHeight * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, L.photoH);
    ctx.clip();
    ctx.drawImage(photo, (width - dw) * fx, (L.photoH - dh) * fy, dw, dh);
    ctx.restore();

    // Fade the bottom of the photo into the page so the name sits on solid ground.
    const gradTop = L.photoH - L.gradientH;
    const fade = ctx.createLinearGradient(0, gradTop, 0, L.photoH);
    fade.addColorStop(0, hexToRgba(palette.page, 0));
    fade.addColorStop(1, palette.page);
    ctx.fillStyle = fade;
    ctx.fillRect(0, gradTop, width, L.gradientH);
  } else {
    const ground = angledGradient(ctx, width, height, 112);
    ground.addColorStop(0, "#7d2c10");
    ground.addColorStop(1, "#b5451b");
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, width, height);

    drawMark(ctx, width - 560, -40, 720, {
      fill: GOLD,
      fillAlpha: 0.22,
      stroke: GOLD_LIGHT,
      strokeWidth: 0.5,
      strokeAlpha: 0.6,
      dotR: 2.2,
      dotAlpha: 0.7,
    });
  }

  /* 2. Lockup */
  drawMark(ctx, L.lockup.x, L.lockup.y, L.lockup.mark, {
    fill: "rgba(200,148,26,0.25)",
    stroke: GOLD_LIGHT,
    strokeWidth: 1.6,
    dotR: 3,
  });
  ctx.save();
  ctx.font = `700 ${L.lockup.text}px ${FONT}`;
  ctx.fillStyle = CREAM;
  ctx.shadowColor = "rgba(18,10,4,0.6)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 1;
  const lockupLine = L.lockup.text * 1.333;
  const lockupTop = L.lockup.y + (L.lockup.mark - lockupLine) / 2;
  ctx.fillText("HerStory Africa", L.lockup.x + L.lockup.mark + L.lockup.gap, baselineFor(ctx, lockupTop, L.lockup.text, 1.333));
  ctx.restore();

  /* 3. Footer (measured first so the text block knows where it must stop) */
  const F = L.footer;
  const footerLine = F.size * 1.3;
  let footerTop: number;

  if (format === "square") {
    footerTop = F.bottom - footerLine;
    const y = baselineFor(ctx, footerTop, F.size, 1.3);
    ctx.font = `700 ${F.size}px ${FONT}`;
    ctx.fillStyle = palette.domain;
    ctx.fillText(DOMAIN, L.text.x, y);

    ctx.font = `italic 400 ${F.size}px ${FONT}`;
    ctx.fillStyle = palette.body;
    ctx.fillText(TAGLINE, L.text.right - ctx.measureText(TAGLINE).width, y);
  } else {
    const taglineTop = F.bottom - footerLine;
    footerTop = taglineTop - 8 - footerLine;

    ctx.font = `700 ${F.size}px ${FONT}`;
    ctx.fillStyle = palette.domain;
    ctx.fillText(`${DOMAIN}/women/${data.slug}`, L.text.x, baselineFor(ctx, footerTop, F.size, 1.3));

    ctx.font = `italic 400 ${F.size}px ${FONT}`;
    ctx.fillStyle = palette.body;
    ctx.fillText(TAGLINE, L.text.x, baselineFor(ctx, taglineTop, F.size, 1.3));
  }

  /* 4. Text block: rule, eyebrow, name, summary */
  const T = L.text;
  const maxWidth = T.right - T.x;
  let y = T.top;

  ctx.fillStyle = GOLD;
  ctx.fillRect(T.x, y, T.ruleW, 3);
  y += 3 + T.gapRule;

  const eyebrow = `${data.era} · ${data.country} · ${lifespan(data.born, data.died)}`.toUpperCase();
  const eyebrowLine = 1.3;
  ctx.font = `700 ${T.eyebrow}px ${FONT}`;
  ctx.fillStyle = palette.eyebrow;
  fillTracked(ctx, eyebrow, T.x, baselineFor(ctx, y, T.eyebrow, eyebrowLine), T.eyebrow * 0.14);
  y += T.eyebrow * eyebrowLine + T.gap;

  const nameSize = data.name.length > 20 ? 76 : 92;
  const nameLine = 0.98;
  ctx.font = `900 ${nameSize}px ${FONT}`;
  ctx.fillStyle = palette.name;
  const nameLines = wrapText(ctx, data.name, maxWidth, 2, -2.5);
  for (const line of nameLines) {
    fillTracked(ctx, line, T.x, baselineFor(ctx, y, nameSize, nameLine), -2.5);
    y += nameSize * nameLine;
  }
  y += T.gap;

  const summaryLine = 1.35;
  const summaryLineH = T.summary * summaryLine;
  const room = footerTop - 24 - y;
  const maxSummaryLines = Math.max(1, Math.min(4, Math.floor(room / summaryLineH)));
  ctx.font = `400 ${T.summary}px ${FONT}`;
  ctx.fillStyle = palette.body;
  const summaryLines = wrapText(ctx, clip(data.summary, 140), Math.min(T.summaryMax, maxWidth), maxSummaryLines);
  for (const line of summaryLines) {
    ctx.fillText(line, T.x, baselineFor(ctx, y, T.summary, summaryLine));
    y += summaryLineH;
  }
}
