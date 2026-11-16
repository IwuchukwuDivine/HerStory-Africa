#!/usr/bin/env node
// Builds one newsletter edition from app/content/newsletter/<slug>.md.
//
//   npm run newsletter:build -- <slug>     build an edition
//   npm run newsletter:build -- --list     show the layouts and when to use each
//
// Writes:
//   public/newsletter/<slug>/*             the edition's images (deployed with the site)
//   .newsletter/<slug>/email.html          what gets sent (images point at the live site)
//   .newsletter/<slug>/email.txt           plain-text alternative
//   .newsletter/<slug>/preview.html        self-contained copy to open locally
//   server/assets/newsletter/<slug>/       email.html, email.txt and edition.json,
//                                          bundled into the deployed server so
//                                          /admin/newsletter can test, draft and
//                                          schedule it (samples are never written here)

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";
import { parse as parseYaml } from "yaml";
import { layoutById, layouts } from "../../emails/layouts/index.mjs";
import { SITE, UNSUBSCRIBE, formatDate, parseBody } from "../../emails/layouts/shared.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const EDITIONS = join(ROOT, "app/content/newsletter");
const PUBLIC = join(ROOT, "public");
const OUT = join(ROOT, ".newsletter");
const SERVER_ASSETS = join(ROOT, "server/assets/newsletter");

/** Default send time when an edition sets no `sendAt`: 08:00 in Lagos (WAT, UTC+1) on its date. */
const DEFAULT_SEND_TIME = "07:00:00.000Z";

const SENSITIVE = ["slavery", "sexual violence", "abuse", "massacre", "execution", "child death", "living survivors"];
const BANNED = [
  "played a pivotal role", "left an indelible mark", "a testament to", "in a world where", "trailblazer",
  "unsung hero", "paved the way", "glass ceiling", "ultimately,", "in conclusion", "it's not just",
];

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

function frontmatter(path) {
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) fail(`${path} has no frontmatter.`);
  return { data: parseYaml(match[1]) ?? {}, body: match[2] };
}

function listLayouts() {
  for (const { meta } of layouts) {
    console.log(`\n${meta.name}  (layout: ${meta.id})`);
    console.log(`  ${meta.vibe}`);
    console.log(`  Registers: ${meta.registers.join(", ")}`);
    console.log(`  Use when:`);
    for (const line of meta.useWhen) console.log(`    - ${line}`);
    console.log(`  Avoid when:`);
    for (const line of meta.avoidWhen) console.log(`    - ${line}`);
    console.log(`  Needs: ${meta.fields.required.join(", ")}`);
    console.log(`  Body blocks: ${meta.blocks.join(", ")}`);
  }
  console.log("");
}

/** Cursive lines are drawn as images so they look the same in every inbox. */
const scriptFont = readFileSync(join(ROOT, "emails/fonts/PinyonScript-Regular.woff"));
async function scriptText(text, { size, colour }) {
  const scale = 2;
  const svg = await satori(
    {
      type: "div",
      props: {
        style: { display: "flex", fontFamily: "Pinyon Script", fontSize: size * scale, lineHeight: 1.3, color: colour, padding: size, whiteSpace: "nowrap" },
        children: text,
      },
    },
    { width: Math.ceil(text.length * size * scale * 0.8 + size * 4), height: size * scale * 3, fonts: [{ name: "Pinyon Script", data: scriptFont, weight: 400, style: "normal" }] },
  );
  const png = new Resvg(svg, { background: "rgba(0,0,0,0)" }).render().asPng();
  const trimmed = await sharp(png)
    .trim()
    .extend({ top: 8, bottom: 12, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { data: trimmed.data, width: Math.round(trimmed.info.width / scale), height: Math.round(trimmed.info.height / scale) };
}

function loadEdition(slug) {
  const file = join(EDITIONS, `${slug}.md`);
  if (!existsSync(file)) {
    const have = existsSync(EDITIONS) ? readdirSync(EDITIONS).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")) : [];
    fail(`No edition at app/content/newsletter/${slug}.md. Editions: ${have.join(", ") || "none yet"}`);
  }
  const { data, body } = frontmatter(file);
  const edition = { signedBy: "Deevyn", volume: "I", linkText: "Read her full story", sensitive: [], ...data, slug, body };
  edition.date = String(edition.date instanceof Date ? edition.date.toISOString().slice(0, 10) : edition.date);
  if (edition.sendAt instanceof Date) edition.sendAt = edition.sendAt.toISOString();
  edition.sendAt ??= `${edition.date}T${DEFAULT_SEND_TIME}`;
  edition.blocks = parseBody(body);

  // The profile or article on the site is the source for the photo, its credit and the link out.
  if (edition.woman) {
    const profilePath = join(ROOT, "app/content/women", `${edition.woman}.md`);
    if (!existsSync(profilePath)) fail(`woman: "${edition.woman}" has no profile in app/content/women/.`);
    const profile = frontmatter(profilePath).data;
    edition.womanName ??= profile.name;
    edition.womanCountry ??= profile.country;
    edition.photo ??= profile.image;
    edition.photoCredit ??= `Photo: ${profile.imageCredit}.`;
    edition.photoCaption ??= `${profile.name}. Photograph: ${profile.imageCredit}.`;
    edition.photoAlt ??= `Portrait of ${profile.name}`;
    edition.link ??= `${SITE}/women/${edition.woman}`;
  } else if (edition.article) {
    edition.link ??= `${SITE}/articles/${edition.article}`;
  }
  return edition;
}

function check(edition, layout) {
  const errors = [];
  const warnings = [];
  const { meta } = layout;

  for (const field of ["title", "number", "date", "layout", "register", "subject", "preview", "link", "photo", "photoAlt"]) {
    if (edition[field] === undefined || edition[field] === "") errors.push(`Missing "${field}".`);
  }
  for (const field of meta.fields.required) {
    if (edition[field] === undefined || edition[field] === "") errors.push(`The ${meta.name} needs "${field}".`);
  }
  if (!meta.registers.includes(edition.register)) {
    errors.push(`The ${meta.name} is for ${meta.registers.join(" or ")} editions, not "${edition.register}".`);
  }
  const flagged = (edition.sensitive ?? []).filter((item) => SENSITIVE.includes(item));
  if (flagged.length && edition.register !== "solemn") {
    errors.push(`Sensitive content (${flagged.join(", ")}) means the register must be solemn.`);
  }

  const copy = [edition.body, ...Object.values(edition).filter((v) => typeof v === "string")].join("\n");
  if (/[—–]/.test(copy)) errors.push("There is an em or en dash in the copy. House style: commas, full stops or parentheses.");
  for (const phrase of BANNED) {
    if (copy.toLowerCase().includes(phrase)) errors.push(`Banned phrase: "${phrase}".`);
  }
  const besties = (copy.match(/\bbestie\b/gi) ?? []).length;
  if (besties && edition.register !== "playful") errors.push(`"Bestie" is only for playful editions.`);
  if (besties > 1) errors.push(`"Bestie" appears ${besties} times. Once at most.`);

  if (Number.isNaN(Date.parse(edition.sendAt))) errors.push(`"sendAt" is not a date and time: ${edition.sendAt}`);
  if (!/^[a-z0-9-]+$/.test(edition.slug.replace(/^_/, ""))) errors.push("The file name must be lowercase letters, digits and hyphens.");

  if (String(edition.subject).length > 50) warnings.push(`Subject is ${edition.subject.length} characters (aim for 50 or fewer).`);
  if (edition.preview === edition.subject) warnings.push("Preview text repeats the subject line.");
  const storyWords = edition.blocks.filter((b) => b.type === "p").map((b) => b.text).join(" ").split(/\s+/).filter(Boolean).length;
  if (storyWords < 250) warnings.push(`The story is ${storyWords} words. The guide asks for 400 to 700; a thin profile makes a thin edition.`);
  if (storyWords > 750) warnings.push(`The story is ${storyWords} words. Readers start dropping off past 700.`);
  for (const block of edition.blocks) {
    if (!meta.blocks.includes(block.type)) warnings.push(`":::${block.type}" is ignored by the ${meta.name}.`);
  }
  return { errors, warnings };
}

function plainText(edition) {
  const lines = [edition.subject, "", edition.salutation ?? edition.headline ?? "", ""];
  for (const block of edition.blocks) {
    if (block.type === "p" || block.type === "highlight" || block.type === "subhead") {
      lines.push(block.text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)").replace(/[*_]{1,2}/g, ""), "");
    }
  }
  if (edition.closing) lines.push(edition.closing, edition.signedBy, "");
  if (edition.ps) lines.push(edition.ps.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)"), "");
  lines.push(`${edition.linkText}: ${edition.link}`, "", `Read in your browser: ${SITE}/newsletter/${edition.slug}`, `Unsubscribe: ${UNSUBSCRIBE}`);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

async function build(slug) {
  const edition = loadEdition(slug);
  const layout = layoutById(edition.layout);
  if (!layout) fail(`Unknown layout "${edition.layout}". Run with --list to see the layouts.`);

  const { errors, warnings } = check(edition, layout);
  for (const warning of warnings) console.warn(`  ! ${warning}`);
  if (errors.length) fail(errors.join("\n  ✗ "));

  const photoPath = join(PUBLIC, edition.photo);
  if (!existsSync(photoPath)) fail(`Photo not found: public${edition.photo}`);

  const tools = { sharp, scriptText, photoPath, photoPosition: edition.photoPosition ?? "attention" };
  const made = await layout.assets(edition, tools);

  // Sample editions (slug starts with "_") never ship, so their images stay out of public/.
  const sample = slug.startsWith("_");
  const outDir = join(OUT, slug);
  const imageDir = sample ? join(outDir, "img") : join(PUBLIC, "newsletter", slug);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(imageDir, { recursive: true });
  for (const asset of made) writeFileSync(join(imageDir, asset.name), asset.data);

  const assets = {
    get(name) {
      const asset = made.find((item) => item.name === name);
      if (!asset) fail(`The layout asked for "${name}" but did not make it.`);
      return { url: `${SITE}/newsletter/${slug}/${name}`, width: asset.width, height: asset.height };
    },
    kit: (name) => `${SITE}/newsletter/kit/${name}`,
  };

  const html = layout.render(edition, assets);
  const text = plainText(edition);
  writeFileSync(join(outDir, "email.html"), html);
  writeFileSync(join(outDir, "email.txt"), text);

  // The letter as the site shows it at /newsletter/<slug>. Images and links
  // are relative to the site, links open in the page around the frame, and
  // the footer link points at the newsletter page instead of a merge tag.
  if (!sample) {
    // The unsubscribe link goes first: it is itself a ${SITE}/newsletter/ URL.
    const web = html
      .replaceAll(UNSUBSCRIBE, "/newsletter")
      .replaceAll(`${SITE}/newsletter/`, "/newsletter/")
      .replace("<head>", '<head>\n<base target="_top">');
    writeFileSync(join(imageDir, "web.html"), web);
  }

  // What the deployed server sends. .newsletter/ is gitignored, so the admin
  // reads this committed copy instead (Nitro bundles server/assets/).
  if (!sample) {
    const serverDir = join(SERVER_ASSETS, slug);
    rmSync(serverDir, { recursive: true, force: true });
    mkdirSync(serverDir, { recursive: true });
    writeFileSync(join(serverDir, "email.html"), html);
    writeFileSync(join(serverDir, "email.txt"), text);
    const meta = {
      slug,
      number: edition.number,
      title: edition.title,
      subject: edition.subject,
      preview: edition.preview,
      date: edition.date,
      sendAt: new Date(edition.sendAt).toISOString(),
      layout: edition.layout,
      register: edition.register,
      link: edition.link,
      woman: edition.woman ?? null,
      article: edition.article ?? null,
      hash: createHash("sha256").update(html).update("\0").update(text).digest("hex").slice(0, 16),
    };
    writeFileSync(join(serverDir, "edition.json"), `${JSON.stringify(meta, null, 2)}\n`);
  }

  // Preview: same markup with every image inlined, so it opens before anything is deployed.
  const dataUri = (name, data) => `data:${MIME[extname(name)]};base64,${data.toString("base64")}`;
  const preview = html.replace(new RegExp(`${SITE}/newsletter/([\\w./-]+\\.(?:png|jpe?g))`, "g"), (url, rel) => {
    const own = made.find((asset) => rel === `${slug}/${asset.name}`);
    if (own) return dataUri(own.name, own.data);
    const file = join(PUBLIC, "newsletter", rel);
    return existsSync(file) ? dataUri(file, readFileSync(file)) : url;
  });
  writeFileSync(join(outDir, "preview.html"), preview);

  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`\n  ✓ No. ${edition.number}, "${edition.subject}" (${layout.meta.name}, ${edition.register}, ${formatDate(edition.date)})`);
  console.log(`    .newsletter/${slug}/preview.html   open this to look at it`);
  console.log(`    .newsletter/${slug}/email.html     ${kb} KB${kb > 100 ? "  ! Gmail clips emails over 102 KB" : ""}`);
  if (sample) console.log("    Sample edition: not for sending.\n");
  else {
    console.log(`    public/newsletter/${slug}/         ${made.length} image${made.length === 1 ? "" : "s"}, deploy before sending`);
    console.log(`    server/assets/newsletter/${slug}/  commit this; /admin/newsletter sends from it\n`);
  }
}

const arg = process.argv[2];
if (!arg) fail("Which edition? npm run newsletter:build -- <slug>   (or --list)");
if (arg === "--list") listLayouts();
else await build(arg);
