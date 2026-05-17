#!/usr/bin/env node

// Generates pre-computed AI content for the Story Assistant panel.
// Calls Claude Haiku once per story; skips items whose body hash matches
// the previous run. Output: public/ai-content.json (consumed by AiAssistant.vue).

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const WOMEN_DIR = join(ROOT, "app/content/women");
const ARTICLES_DIR = join(ROOT, "app/content/articles");
const OUT_PATH = join(ROOT, "public/ai-content.json");
const LOG_PATH = join(ROOT, "data/ai-content-log.json");

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-4-5-20251001";
const FORCE = process.env.FORCE === "1";
// Bump when the prompt/output schema changes so cached entries regenerate.
const SCHEMA_VERSION = "v2";

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

function loadDir(dir, type) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf-8");
      const { data, body } = parseFrontmatter(raw);
      return { ...data, type, body, _file: f };
    });
}

function hashOf(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function readLog() {
  try {
    return JSON.parse(readFileSync(LOG_PATH, "utf-8"));
  } catch {
    return { hashes: {} };
  }
}

function readExisting() {
  try {
    return JSON.parse(readFileSync(OUT_PATH, "utf-8"));
  } catch {
    return { women: {}, articles: {} };
  }
}

async function callHaiku(systemPrompt, userPrompt) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error("Empty response from Anthropic");
  return text;
}

function extractJson(text) {
  let cleaned = String(text || "").trim();
  // Strip optional ```json / ``` code fences if the model wrapped its output.
  cleaned = cleaned
    .replace(/^```(?:json|JSON)?\s*\n?/, "")
    .replace(/\n?\s*```$/, "")
    .trim();

  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object in response");

  // Find the matching closing brace, ignoring braces inside string literals.
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let end = -1;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (ch === "\\") {
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) throw new Error("Unbalanced JSON braces in response");

  const candidate = cleaned.slice(start, end);

  try {
    return JSON.parse(candidate);
  } catch (err) {
    // Repair common issues: trailing commas before } or ].
    const repaired = candidate.replace(/,(\s*[}\]])/g, "$1");
    try {
      return JSON.parse(repaired);
    } catch {
      throw new Error(`Invalid JSON in response: ${err.message}`);
    }
  }
}

async function callJsonHaiku(systemPrompt, userPrompt, maxRetries = 2) {
  let lastError;
  let prompt = systemPrompt;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const text = await callHaiku(prompt, userPrompt);
    try {
      return extractJson(text);
    } catch (err) {
      lastError = err;
      // Strengthen the prompt for the retry.
      prompt =
        systemPrompt +
        "\n\nCRITICAL: Your previous response was not valid JSON. Output ONLY a single JSON object, with no prose, no commentary, and no markdown code fences. Escape any internal double quotes inside string values with a backslash.";
    }
  }
  throw lastError;
}

async function generateForWoman(w) {
  const system = [
    "You write short, factual content for HerStory Africa, an archive of African women who shaped history.",
    "Voice: warm, direct, grounded. Never preachy or generic. No em dashes.",
    "Use only facts from the supplied profile. Do not invent dates, places, or quotes.",
    "",
    "Return strict JSON with three fields:",
    '- "summary": 3-4 sentences synthesizing the full biography (distinct from the short SEO blurb).',
    '- "whyShematters": 2-3 sentences on her significance.',
    '- "timeline": 3-6 entries shaped as "YEAR — event", sorted oldest first, each one line.',
  ].join("\n");

  const context = [
    `Name: ${w.name}`,
    `Country: ${w.country}, ${w.region}`,
    `Born: ${w.born}${w.died ? `, Died: ${w.died}` : " (still living)"}`,
    `Era: ${w.era}`,
    `Causes: ${(w.causes || []).join(", ")}`,
    `Summary: ${w.summary || ""}`,
    "",
    "Profile body:",
    w.body.slice(0, 4000),
  ].join("\n");

  const parsed = await callJsonHaiku(system, context);
  return {
    summary: String(parsed.summary || "").trim(),
    whyShematters: String(parsed.whyShematters || "").trim(),
    timeline: Array.isArray(parsed.timeline)
      ? parsed.timeline.map((t) => String(t).trim()).filter(Boolean)
      : [],
  };
}

async function generateForArticle(a) {
  const system = [
    "You write short, factual content for HerStory Africa, an archive of African women's history.",
    "Voice: warm, direct, grounded. Never preachy or generic. No em dashes.",
    "Use only ideas from the supplied article body. Do not invent.",
    "",
    "Return strict JSON with two fields:",
    '- "summary": 3-4 sentences synthesizing the full article (distinct from the short blurb).',
    '- "keyTakeaways": 3-5 concise one-sentence takeaways.',
  ].join("\n");

  const context = [
    `Title: ${a.title}`,
    `Category: ${a.category}`,
    `Description: ${a.description || ""}`,
    "",
    "Article body:",
    a.body.slice(0, 5000),
  ].join("\n");

  const parsed = await callJsonHaiku(system, context);
  return {
    summary: String(parsed.summary || "").trim(),
    keyTakeaways: Array.isArray(parsed.keyTakeaways)
      ? parsed.keyTakeaways.map((t) => String(t).trim()).filter(Boolean)
      : [],
  };
}

async function main() {
  console.log("Story Assistant — generating AI content\n");

  const women = loadDir(WOMEN_DIR, "woman");
  const articles = loadDir(ARTICLES_DIR, "article");
  console.log(`Loaded ${women.length} women, ${articles.length} articles`);

  const log = readLog();
  const existing = readExisting();
  const output = {
    women: { ...existing.women },
    articles: { ...existing.articles },
  };

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const w of women) {
    const key = `woman:${w.slug}`;
    const h = hashOf(
      SCHEMA_VERSION + w.body + (w.summary || "") + (w.causes || []).join(","),
    );
    if (!FORCE && log.hashes[key] === h && output.women[w.slug]) {
      skipped++;
      continue;
    }
    process.stdout.write(`  woman: ${w.name} ... `);
    try {
      const result = await generateForWoman(w);
      output.women[w.slug] = result;
      log.hashes[key] = h;
      generated++;
      console.log("ok");
    } catch (err) {
      failed++;
      console.log(`FAILED (${err.message})`);
    }
  }

  for (const a of articles) {
    const key = `article:${a.slug}`;
    const h = hashOf(SCHEMA_VERSION + a.body + (a.description || ""));
    if (!FORCE && log.hashes[key] === h && output.articles[a.slug]) {
      skipped++;
      continue;
    }
    process.stdout.write(`  article: ${a.title} ... `);
    try {
      const result = await generateForArticle(a);
      output.articles[a.slug] = result;
      log.hashes[key] = h;
      generated++;
      console.log("ok");
    } catch (err) {
      failed++;
      console.log(`FAILED (${err.message})`);
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(output, null, 2) + "\n");
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + "\n");

  console.log(
    `\nDone. Generated: ${generated}, skipped: ${skipped}, failed: ${failed}`,
  );
  console.log(`Wrote: ${OUT_PATH}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
