#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const WOMEN_DIR = join(ROOT, "app/content/women");
const ARTICLES_DIR = join(ROOT, "app/content/articles");
const LOG_PATH = join(ROOT, "data/newsletter-log.json");
const SITE_URL = "https://her-story-africa-seven.vercel.app";

const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ---------------------------------------------------------------------------
// Frontmatter parser (handles the consistent YAML used in this project)
// ---------------------------------------------------------------------------
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, body: raw };

  const fm = {};
  let currentKey = "";

  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([a-zA-Z_]\w*):\s*(.*)?$/);
    if (kv) {
      const [, key, rawVal = ""] = kv;
      const val = rawVal.trim();
      currentKey = key;

      if (val === "") fm[key] = [];
      else if (val === "true") fm[key] = true;
      else if (val === "false") fm[key] = false;
      else if (val === "null") fm[key] = null;
      else if (/^-?\d+$/.test(val)) fm[key] = Number(val);
      else fm[key] = val.replace(/^["']|["']$/g, "");
    } else {
      const item = line.match(/^\s+-\s+"?([^"]*)"?$/);
      if (item && Array.isArray(fm[currentKey])) {
        fm[currentKey].push(item[1]);
      }
    }
  }

  const body = raw.slice(match[0].length).trim();
  return { data: fm, body };
}

// ---------------------------------------------------------------------------
// Load content from a directory
// ---------------------------------------------------------------------------
function loadContent(dir, type) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf-8");
      const { data, body } = parseFrontmatter(raw);
      return { ...data, type, body };
    });
}

// ---------------------------------------------------------------------------
// Log helpers
// ---------------------------------------------------------------------------
function readLog() {
  try {
    return JSON.parse(readFileSync(LOG_PATH, "utf-8"));
  } catch {
    return { editions: [] };
  }
}

function writeLog(log) {
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + "\n");
}

function getAllFeaturedSlugs(log) {
  const slugs = new Set();
  for (const edition of log.editions) {
    slugs.add(edition.mainFeature);
    for (const s of edition.alsoRead || []) slugs.add(s);
  }
  return slugs;
}

// ---------------------------------------------------------------------------
// Selection logic
// ---------------------------------------------------------------------------
function pickMainFeature(items, featuredSlugs, recentRegions) {
  let pool = items.filter((i) => !featuredSlugs.has(i.slug));

  // If everything has been featured, reset
  if (pool.length === 0) {
    console.log("All items featured. Cycling from the full pool.");
    pool = [...items];
  }

  // Prefer regions not recently used (women only)
  const fresh = pool.filter(
    (i) => i.region && !recentRegions.includes(i.region),
  );
  const candidates = fresh.length > 0 ? fresh : pool;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickAlsoRead(items, featuredSlugs, excludeSlug, count = 2) {
  const pool = items
    .filter((i) => i.slug !== excludeSlug && !featuredSlugs.has(i.slug))
    .sort(() => Math.random() - 0.5);

  if (pool.length >= count) return pool.slice(0, count);

  // Not enough unfeatured, backfill from all items
  const backfill = items
    .filter((i) => i.slug !== excludeSlug)
    .sort(() => Math.random() - 0.5);
  return backfill.slice(0, count);
}

// ---------------------------------------------------------------------------
// Gemini: generate a subject line + intro
// ---------------------------------------------------------------------------
async function generateIntro(feature, type) {
  const fallback = {
    subject: type === "woman" ? `Meet ${feature.name}` : feature.title,
    intro:
      type === "woman"
        ? `This edition, we spotlight ${feature.name} from ${feature.country}. ${feature.summary}`
        : `This edition: ${feature.title}. ${feature.description}`,
  };

  if (!GEMINI_API_KEY) {
    console.log("  No GEMINI_API_KEY. Using summary as fallback intro.");
    return fallback;
  }

  const firstParagraphs = feature.body
    .split("\n\n")
    .filter((p) => !p.startsWith("##"))
    .slice(0, 3)
    .join("\n\n");

  const context =
    type === "woman"
      ? [
          `Name: ${feature.name}`,
          `Country: ${feature.country}, ${feature.region}`,
          `Born: ${feature.born}${feature.died ? `, Died: ${feature.died}` : " (still living)"}`,
          `Era: ${feature.era}`,
          `Causes: ${(feature.causes || []).join(", ")}`,
          `Summary: ${feature.summary}`,
          ``,
          `Opening paragraphs:`,
          firstParagraphs,
        ].join("\n")
      : [
          `Title: ${feature.title}`,
          `Category: ${feature.category}`,
          `Description: ${feature.description}`,
          ``,
          `Opening paragraphs:`,
          firstParagraphs,
        ].join("\n");

  const systemPrompt = [
    `You write newsletter intros for HerStory Africa, an archive of African women who shaped history.`,
    `Your voice is warm and direct, like telling a friend about someone incredible you just discovered.`,
    `You can be witty, occasionally funny, but always respectful of the subject.`,
    `Never be preachy, formal, or generic. Never use em dashes.`,
    `Keep it grounded in facts from the profile.`,
    ``,
    `Return a JSON object with two fields:`,
    `- "subject": a compelling email subject line (under 60 characters)`,
    `- "intro": 3-5 sentences that hook the reader and transition naturally into the featured story below.`,
  ].join("\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Write a newsletter intro for this ${type === "woman" ? "woman's profile" : "article"}:\n\n${context}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.85,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  Gemini error (${res.status}): ${err}`);
    console.log("  Falling back to summary.");
    return fallback;
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;

  try {
    return JSON.parse(raw);
  } catch {
    console.error("  Failed to parse Gemini JSON. Using raw text.");
    return {
      subject: fallback.subject,
      intro: raw || fallback.intro,
    };
  }
}

// ---------------------------------------------------------------------------
// Compose the full email body (Markdown)
// ---------------------------------------------------------------------------
function composeEmail(main, alsoRead, intro, type) {
  const mainLink =
    type === "woman"
      ? `${SITE_URL}/women/${main.slug}`
      : `${SITE_URL}/articles/${main.slug}`;

  const spotlight =
    type === "woman"
      ? `## This edition's spotlight\n\n**${main.name}**\n${main.country}, ${main.region} · ${main.born}${main.died ? `–${main.died}` : "–present"}\n\n${main.summary}\n\n[Read her full story →](${mainLink})`
      : `## This edition's spotlight\n\n**${main.title}**\n\n${main.description}\n\n[Read the full article →](${mainLink})`;

  const alsoReadItems = alsoRead
    .map((item) => {
      if (item.type === "woman") {
        return `- **[${item.name}](${SITE_URL}/women/${item.slug})** · ${item.country}\n  ${item.summary}`;
      }
      return `- **[${item.title}](${SITE_URL}/articles/${item.slug})**\n  ${item.description}`;
    })
    .join("\n\n");

  return [
    intro,
    "",
    "---",
    "",
    spotlight,
    "",
    "---",
    "",
    "## Also worth reading",
    "",
    alsoReadItems,
    "",
    "---",
    "",
    "Until next time,",
    "**HerStory Africa**",
    "*The women history forgot to teach you.*",
    "",
    `[Visit the archive](${SITE_URL}) · [Browse all women](${SITE_URL}/women) · [Read articles](${SITE_URL}/articles)`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Create Buttondown draft
// ---------------------------------------------------------------------------
async function createDraft(subject, body) {
  if (!BUTTONDOWN_API_KEY) {
    console.log("\n  No BUTTONDOWN_API_KEY. Printing preview:\n");
    console.log(`  Subject: ${subject}\n`);
    console.log(body);
    return { preview: true };
  }

  const res = await fetch("https://api.buttondown.com/v1/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${BUTTONDOWN_API_KEY}`,
    },
    body: JSON.stringify({ subject, body, status: "draft" }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Buttondown API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  console.log(`  Draft created in Buttondown (id: ${data.id})`);
  return data;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("📰 HerStory Africa Newsletter Draft Generator\n");

  console.log("Loading content...");
  const women = loadContent(WOMEN_DIR, "woman");
  const articles = loadContent(ARTICLES_DIR, "article");
  console.log(`  ${women.length} women, ${articles.length} articles\n`);

  const log = readLog();
  const featuredSlugs = getAllFeaturedSlugs(log);
  console.log(`Previously featured: ${featuredSlugs.size} items`);

  // Alternate between woman and article
  const last = log.editions[log.editions.length - 1];
  const nextType = last?.type === "woman" ? "article" : "woman";
  console.log(`Next edition type: ${nextType}\n`);

  // Regions from last 5 editions (for variety)
  const recentRegions = log.editions
    .slice(-5)
    .map((e) => e.region)
    .filter(Boolean);

  // Pick content
  const mainPool = nextType === "woman" ? women : articles;
  const main = pickMainFeature(mainPool, featuredSlugs, recentRegions);
  console.log(`Main feature: ${main.name || main.title}`);

  const alsoReadPool = nextType === "woman" ? articles : women;
  const alsoRead = pickAlsoRead(alsoReadPool, featuredSlugs, main.slug);
  console.log(
    `Also read: ${alsoRead.map((i) => i.name || i.title).join(", ")}\n`,
  );

  // Generate AI intro
  console.log("Generating intro...");
  const { subject, intro } = await generateIntro(main, nextType);
  console.log(`  Subject: ${subject}\n`);

  // Compose email
  const emailBody = composeEmail(main, alsoRead, intro, nextType);

  // Push to Buttondown as draft
  console.log("Creating draft...");
  const result = await createDraft(subject, emailBody);

  // Only update log if draft was created (or previewed)
  log.editions.push({
    date: new Date().toISOString().split("T")[0],
    type: nextType,
    mainFeature: main.slug,
    alsoRead: alsoRead.map((i) => i.slug),
    region: main.region || null,
    subject,
  });
  writeLog(log);

  console.log("\nDone! Check your Buttondown drafts.");
  if (result.preview) {
    console.log("(This was a preview. Set BUTTONDOWN_API_KEY to create a real draft.)");
  }
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
