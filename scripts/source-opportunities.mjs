#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OPP_DIR = join(ROOT, "app/content/opportunities");
const LOG_PATH = join(ROOT, "data/opportunities-log.json");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ---------------------------------------------------------------------------
// Frontmatter parser (same approach as draft-newsletter.mjs)
// ---------------------------------------------------------------------------
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

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
      else fm[key] = val.replace(/^["']|["']$/g, "");
    } else {
      const item = line.match(/^\s+-\s+"?([^"]*)"?$/);
      if (item && Array.isArray(fm[currentKey])) {
        fm[currentKey].push(item[1]);
      }
    }
  }

  return fm;
}

// ---------------------------------------------------------------------------
// Load existing opportunities for dedup
// ---------------------------------------------------------------------------
function loadExisting() {
  if (!existsSync(OPP_DIR)) {
    mkdirSync(OPP_DIR, { recursive: true });
    return [];
  }

  return readdirSync(OPP_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = readFileSync(join(OPP_DIR, f), "utf-8");
      return parseFrontmatter(raw);
    })
    .filter((fm) => fm.title);
}

function buildDedupSet(existing) {
  const set = new Set();
  for (const opp of existing) {
    const key = `${opp.title?.toLowerCase()}|${opp.organization?.toLowerCase()}`;
    set.add(key);
  }
  return set;
}

// ---------------------------------------------------------------------------
// Log helpers
// ---------------------------------------------------------------------------
function readLog() {
  try {
    return JSON.parse(readFileSync(LOG_PATH, "utf-8"));
  } catch {
    return { runs: [] };
  }
}

function writeLog(log) {
  const dir = dirname(LOG_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + "\n");
}

// ---------------------------------------------------------------------------
// Reject Gemini Search grounding redirect URLs (not permanent program links)
// ---------------------------------------------------------------------------
function isGroundingRedirectUrl(url) {
  try {
    const u = new URL(url);
    return (
      u.hostname === "vertexaisearch.cloud.google.com" ||
      u.pathname.includes("grounding-api-redirect")
    );
  } catch {
    return true;
  }
}

// ---------------------------------------------------------------------------
// Validate a URL returns a non-error response
// ---------------------------------------------------------------------------
async function validateLink(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    return res.ok || res.status === 405 || res.status === 403;
  } catch {
    // Some sites block HEAD requests; try GET as fallback
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { Range: "bytes=0-0" },
      });
      clearTimeout(timeout);
      return res.ok || res.status === 206;
    } catch {
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// Slugify a title
// ---------------------------------------------------------------------------
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Call Gemini with Google Search grounding
// ---------------------------------------------------------------------------
const SEARCH_QUERIES = [
  "scholarships for African women 2026 currently open applications",
  "grants funding for women-led businesses Africa 2026 apply now",
  "fellowships for early-career African women researchers 2026",
  "tech internships for women Africa 2026 open applications",
  "leadership programs African women 2026 deadline",
  "STEM scholarships African women graduate undergraduate 2026",
  "social enterprise grants women Africa open call 2026",
  "development sector jobs internships young African women 2026",
];

function buildSystemPrompt() {
  const today = new Date().toISOString().split("T")[0];
  return `You are a meticulous research assistant for HerStory Africa, a platform celebrating African women. Your job is to find REAL, CURRENTLY OPEN opportunities for African women by searching the internet thoroughly.

TODAY'S DATE: ${today}

SEARCH STRATEGY:
- Search across multiple sources: official program websites, opportunity aggregators (Opportunity Desk, After School Africa, Opportunities For Africans, Global South Opportunities), university portals, foundation sites, and job boards.
- Look for programs from well-known organizations: AU, AfDB, Mastercard Foundation, Ford Foundation, Google, Meta, Microsoft, Chevening, DAAD, Mo Ibrahim, Tony Elumelu, Open Society, Carnegie, Wellcome Trust, and similar.
- Also look for opportunities from African-specific organizations: Amref, AWARD (African Women in Agricultural Research and Development), She Leads Africa, AWDF (African Women's Development Fund), African Leadership Academy, ALX Africa, and similar.
- Check fintech and tech companies running women-focused programs.
- Include opportunities across all regions of Africa (West, East, Southern, Central, North).

STRICT RULES:
1. ONLY include opportunities that are CONFIRMED OPEN for applications right now or opening within the next 30 days. If the deadline has passed, do NOT include it.
2. Every opportunity MUST have a working official URL: the real program or application page (https:// from the host organization). Never use search-result or redirect wrapper URLs.
3. Deadlines must be verified. If you cannot confirm the exact deadline, set it to null.
4. Do NOT fabricate or hallucinate programs. If you are unsure whether something exists, leave it out.
5. Spread results across all four categories: scholarship, grant, fellowship, job.

WRITING STYLE:
- Write in plain, clear English. No filler or fluff.
- NEVER use em dashes. Use commas, periods, or parentheses instead.
- Do not overuse bold formatting. Use bold sparingly for key terms only.
- Keep sentences direct and factual. Avoid marketing language.
- Use "to" instead of dashes for ranges (e.g. "ages 18 to 35" not "ages 18-35" or "ages 18—35").
- Write numbers as digits, not words (e.g. "$5,000" not "five thousand dollars").

OUTPUT FORMAT:
Return ONLY a single raw JSON array (no markdown, no code fences, no commentary before or after). The response must start with "[" and end with "]".
The array must have 8 to 15 objects. Each object must have these fields:
{
  "title": "Official program name, include year if applicable",
  "category": "scholarship" | "job" | "grant" | "fellowship",
  "organization": "Name of the organization running the program",
  "description": "One to two sentences summarizing the opportunity. Be specific about what is offered (amount, duration, etc).",
  "deadline": "YYYY-MM-DD" or null,
  "link": "Direct URL to the official application or program page",
  "about": "2 to 3 sentences explaining the program in more depth. What is its purpose? What makes it notable?",
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "eligibility": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "how_to_apply": "1 to 2 sentences with the specific application process. Mention the portal, required documents, or key steps."
}`;
}

/** Google Search grounding does not support JSON / controlled generation (responseMimeType). Parse array from plain text. */
function parseOpportunityJsonArray(text) {
  if (!text || typeof text !== "string") return [];
  let s = text.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start === -1 || end <= start) {
    return [];
  }
  s = s.slice(start, end + 1);
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function searchWithQuery(query, attempt = 1) {
  const maxAttempts = 4;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // responseMimeType / JSON mode is incompatible with googleSearch — omit controlled generation.
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
      contents: [
        {
          role: "user",
          parts: [{ text: query }],
        },
      ],
      tools: [{ googleSearch: {} }],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  if (res.status === 429 && attempt < maxAttempts) {
    const waitMs = Math.min(90_000, 3000 * 2 ** (attempt - 1));
    console.log(`    Rate limited (429), waiting ${Math.round(waitMs / 1000)}s before retry ${attempt + 1}/${maxAttempts}...`);
    await new Promise((r) => setTimeout(r, waitMs));
    return searchWithQuery(query, attempt + 1);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return [];

  const parsed = parseOpportunityJsonArray(raw);
  if (parsed.length === 0 && raw.trim().length > 0) {
    console.error("  Failed to parse JSON array for query:", query);
  }
  return parsed;
}

async function findOpportunities() {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required");
  }

  const allResults = [];
  const seen = new Set();

  const shuffled = SEARCH_QUERIES.sort(() => Math.random() - 0.5);
  const queries = shuffled.slice(0, 4);

  for (const query of queries) {
    console.log(`  Searching: "${query}"`);
    try {
      const results = await searchWithQuery(query);
      for (const opp of results) {
        const key = `${opp.title?.toLowerCase()}|${opp.organization?.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          allResults.push(opp);
        }
      }
      console.log(`    Found ${results.length} results`);
    } catch (err) {
      console.error(`    Query failed: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 2500));
  }

  return allResults;
}

// ---------------------------------------------------------------------------
// Write an opportunity as a .md file
// ---------------------------------------------------------------------------
function cleanText(text) {
  return text
    .replace(/\u2014/g, ", ")  // em dash
    .replace(/\u2013/g, " to ") // en dash
    .replace(/\u2018|\u2019/g, "'") // smart single quotes
    .replace(/\u201C|\u201D/g, '"') // smart double quotes
    .replace(/\s{2,}/g, " ")
    .trim();
}

function writeOpportunityFile(opp) {
  const slug = slugify(opp.title);
  const filename = `${slug}.md`;
  const filepath = join(OPP_DIR, filename);

  const deadline = opp.deadline ? `"${opp.deadline}"` : "null";
  const desc = cleanText(opp.description).replace(/"/g, '\\"');
  const title = cleanText(opp.title).replace(/"/g, '\\"');
  const org = cleanText(opp.organization).replace(/"/g, '\\"');

  const lines = [
    "---",
    `title: "${title}"`,
    `slug: ${slug}`,
    `category: ${opp.category}`,
    `organization: "${org}"`,
    `description: "${desc}"`,
    `deadline: ${deadline}`,
    `link: "${opp.link}"`,
    `featured: false`,
    "---",
    "",
  ];

  if (opp.about) {
    lines.push("## About This Opportunity", "", cleanText(opp.about), "");
  }

  if (Array.isArray(opp.benefits) && opp.benefits.length > 0) {
    lines.push("## What You Get", "");
    for (const b of opp.benefits) {
      lines.push(`- ${cleanText(b)}`);
    }
    lines.push("");
  }

  if (Array.isArray(opp.eligibility) && opp.eligibility.length > 0) {
    lines.push("## Eligibility", "");
    for (const e of opp.eligibility) {
      lines.push(`- ${cleanText(e)}`);
    }
    lines.push("");
  }

  if (opp.how_to_apply) {
    lines.push("## How to Apply", "", cleanText(opp.how_to_apply), "");
  }

  writeFileSync(filepath, lines.join("\n"));
  return filename;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("🔍 HerStory Africa — Opportunity Sourcing\n");

  console.log("Loading existing opportunities...");
  const existing = loadExisting();
  const dedupSet = buildDedupSet(existing);
  console.log(`  ${existing.length} existing opportunities\n`);

  console.log("Searching for new opportunities via Gemini (multiple queries)...\n");
  const found = await findOpportunities();
  console.log(`\n  Total unique results: ${found.length}\n`);

  const validCategories = ["scholarship", "job", "grant", "fellowship"];
  const newOpps = [];

  for (const opp of found) {
    if (!opp.title || !opp.link || !opp.category || !opp.organization) {
      console.log(`  ⏭ Skipping (missing fields): ${opp.title || "unknown"}`);
      continue;
    }

    if (!validCategories.includes(opp.category)) {
      console.log(`  ⏭ Skipping (bad category "${opp.category}"): ${opp.title}`);
      continue;
    }

    const dedupKey = `${opp.title.toLowerCase()}|${opp.organization.toLowerCase()}`;
    if (dedupSet.has(dedupKey)) {
      console.log(`  ⏭ Duplicate: ${opp.title}`);
      continue;
    }

    if (isGroundingRedirectUrl(opp.link)) {
      console.log(`  ⏭ Grounding redirect URL (not a stable program link): ${opp.title}`);
      continue;
    }

    console.log(`  🔗 Validating link: ${opp.link}`);
    const valid = await validateLink(opp.link);
    if (!valid) {
      console.log(`  ⏭ Bad link: ${opp.title}`);
      continue;
    }

    opp.description = opp.description || `Opportunity from ${opp.organization}`;

    const filename = writeOpportunityFile(opp);
    newOpps.push({ title: opp.title, filename, category: opp.category });
    dedupSet.add(dedupKey);
    console.log(`  ✅ Added: ${opp.title} → ${filename}`);
  }

  console.log(`\n${newOpps.length} new opportunities added.`);

  // Update log
  const log = readLog();
  log.runs.push({
    date: new Date().toISOString().split("T")[0],
    found: found.length,
    added: newOpps.length,
    opportunities: newOpps.map((o) => o.title),
  });
  writeLog(log);

  if (newOpps.length === 0) {
    console.log("\nNo new opportunities to add. Exiting.");
    process.exit(0);
  }

  console.log("\nDone! New files ready for PR.");
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
