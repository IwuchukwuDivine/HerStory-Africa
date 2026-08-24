#!/usr/bin/env node

// Extracts structured relationships (organizations, movements, related women)
// from each woman's profile body and writes them into the .md frontmatter,
// so the knowledge graph (/graph) has real curated edges.
//
// Two passes:
//   1. Extract per profile (hash-cached in data/relationships-log.json,
//      raw results in data/relationships-raw.json).
//   2. Canonicalize org/movement names across all profiles (one call;
//      the map is saved to data/relationships-canonical.json and can be
//      hand-edited, then the script re-applied).
//
// Run on a branch and review the git diff before merging. FORCE=1 re-extracts.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDir, hashOf } from "./lib/frontmatter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const WOMEN_DIR = join(ROOT, "app/content/women");
const RAW_PATH = join(ROOT, "data/relationships-raw.json");
const CANONICAL_PATH = join(ROOT, "data/relationships-canonical.json");
const LOG_PATH = join(ROOT, "data/relationships-log.json");

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-5";
const FORCE = process.env.FORCE === "1";
const SCHEMA_VERSION = "v1";
const CONCURRENCY = 4;

const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    organizations: { type: "array", items: { type: "string" } },
    movements: { type: "array", items: { type: "string" } },
    relatedWomen: { type: "array", items: { type: "string" } },
  },
  required: ["organizations", "movements", "relatedWomen"],
  additionalProperties: false,
};

async function callClaudeJson(system, user, schema, maxTokens = 1500) {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  for (let attempt = 0; ; attempt++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        output_config: { format: { type: "json_schema", schema } },
        messages: [{ role: "user", content: user }],
      }),
    });
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) {
      throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const text = data.content?.find((b) => b.type === "text")?.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  }
}

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return fallback;
  }
}

// ── Pass 1: per-profile extraction ────────────────────────────────────

function extractSystem(slugList) {
  return [
    "You extract structured relationship data from biography profiles of African women for a knowledge graph.",
    "Return JSON with three arrays:",
    '- "organizations": organizations the woman founded, led, or was a significant member of, according to the profile body. Use the full formal name ("African National Congress", never "ANC" or "the ANC"). Only include real organizations named in the text.',
    '- "movements": broader movements or struggles she was part of, named or clearly described in the text (e.g. "Nigerian independence movement", "Anti-apartheid movement"). Keep names short and reusable across profiles.',
    '- "relatedWomen": slugs of OTHER women from the list below who are substantively connected to her in the profile body (mentioned as collaborator, mentor, contemporary she worked with, co-founder). Only use slugs from this list. Never include her own slug. If no one qualifies, return an empty array.',
    "Do not invent anything. If the profile names no organizations or movements, return empty arrays.",
    "",
    "Known women (name: slug):",
    slugList,
  ].join("\n");
}

async function extractAll(women) {
  const log = readJson(LOG_PATH, { hashes: {} });
  const raw = readJson(RAW_PATH, {});
  const slugList = women.map((w) => `${w.name}: ${w.slug}`).join("\n");
  const system = extractSystem(slugList);

  const todo = women.filter((w) => {
    const h = hashOf(SCHEMA_VERSION + MODEL + w.body);
    return FORCE || log.hashes[`woman:${w.slug}`] !== h || !raw[w.slug];
  });
  console.log(`Extracting ${todo.length} profiles (${women.length - todo.length} cached)`);

  let failed = 0;
  let index = 0;
  async function worker() {
    for (;;) {
      const i = index++;
      if (i >= todo.length) return;
      const w = todo[i];
      try {
        const result = await callClaudeJson(
          system,
          `Profile of ${w.name} (slug: ${w.slug}), from ${w.country}:\n\n${w.body.slice(0, 8000)}`,
          EXTRACT_SCHEMA,
        );
        raw[w.slug] = {
          organizations: result.organizations.filter(Boolean),
          movements: result.movements.filter(Boolean),
          relatedWomen: result.relatedWomen.filter(Boolean),
        };
        log.hashes[`woman:${w.slug}`] = hashOf(SCHEMA_VERSION + MODEL + w.body);
        console.log(`  ${w.name}: ${raw[w.slug].organizations.length} orgs, ${raw[w.slug].movements.length} movements, ${raw[w.slug].relatedWomen.length} related`);
      } catch (err) {
        failed++;
        console.log(`  ${w.name}: FAILED (${err.message})`);
      }
      writeFileSync(RAW_PATH, JSON.stringify(raw, null, 2) + "\n");
      writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + "\n");
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (failed) console.log(`WARNING: ${failed} profiles failed; re-run to retry.`);
  return raw;
}

// ── Pass 2: canonicalize org/movement names ───────────────────────────

async function canonicalize(raw) {
  const counts = {};
  for (const entry of Object.values(raw)) {
    for (const name of [...entry.organizations, ...entry.movements]) {
      counts[name] = (counts[name] || 0) + 1;
    }
  }
  const names = Object.keys(counts).sort();
  if (!names.length) return {};

  const log = readJson(LOG_PATH, { hashes: {} });
  const h = hashOf(SCHEMA_VERSION + MODEL + names.join("|"));
  const existing = readJson(CANONICAL_PATH, null);
  if (!FORCE && existing && log.hashes["canonical"] === h) {
    console.log("Canonical map up to date");
    return existing.map;
  }

  console.log(`Canonicalizing ${names.length} distinct org/movement names`);
  const result = await callClaudeJson(
    [
      "You are deduplicating entity names for a knowledge graph of African women's history.",
      "Given a list of organization and movement names extracted from many documents, find near-duplicates that refer to the SAME real-world entity (abbreviations, spelling variants, with/without articles) and map each variant to one canonical full formal name.",
      'Return JSON: {"pairs": [{"from": "<variant name>", "to": "<canonical name>"}, ...]}. Only include names that should CHANGE (variants); leave out names that are already canonical and have no duplicates. Never merge genuinely different entities.',
    ].join("\n"),
    names.map((n) => `${n} (${counts[n]})`).join("\n"),
    {
      type: "object",
      properties: {
        pairs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              from: { type: "string" },
              to: { type: "string" },
            },
            required: ["from", "to"],
            additionalProperties: false,
          },
        },
      },
      required: ["pairs"],
      additionalProperties: false,
    },
    16000,
  );
  const map = {};
  for (const n of names) map[n] = n;
  for (const pair of result.pairs || []) {
    if (map[pair.from] !== undefined) map[pair.from] = pair.to;
  }
  writeFileSync(
    CANONICAL_PATH,
    JSON.stringify({ note: "Edit canonical values and re-run ai:relationships to re-apply.", map }, null, 2) + "\n",
  );
  log.hashes["canonical"] = h;
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + "\n");
  return map;
}

// ── Apply: validate, mirror, write frontmatter ────────────────────────

const REL_KEYS = ["organizations", "movements", "relatedWomen"];

function serializeKey(key, values) {
  return [`${key}:`, ...values.map((v) => `  - "${v.replace(/"/g, "'")}"`)].join("\n");
}

// Remove existing organizations/movements/relatedWomen keys from a
// frontmatter block (so re-runs replace instead of duplicating).
function stripRelKeys(fmBlock) {
  const lines = fmBlock.split("\n");
  const out = [];
  let skipping = false;
  for (const line of lines) {
    const keyMatch = line.match(/^([a-zA-Z_]\w*):/);
    if (keyMatch) skipping = REL_KEYS.includes(keyMatch[1]);
    if (!skipping) out.push(line);
  }
  return out.join("\n");
}

function applyToFiles(women, raw, canonicalMap) {
  const validSlugs = new Set(women.map((w) => w.slug));

  // Canonicalize + validate.
  const final = {};
  let dropped = 0;
  for (const [slug, entry] of Object.entries(raw)) {
    if (!validSlugs.has(slug)) continue;
    const related = entry.relatedWomen.filter((s) => {
      const ok = validSlugs.has(s) && s !== slug;
      if (!ok) {
        dropped++;
        console.log(`  WARNING: dropping unknown/self relatedWomen slug "${s}" on ${slug}`);
      }
      return ok;
    });
    final[slug] = {
      organizations: [...new Set(entry.organizations.map((n) => canonicalMap[n] || n))],
      movements: [...new Set(entry.movements.map((n) => canonicalMap[n] || n))],
      relatedWomen: new Set(related),
    };
  }
  if (dropped) console.log(`WARNING: dropped ${dropped} invalid related-women slugs`);

  // Mirror relatedWomen so the graph is undirected-consistent.
  for (const [slug, entry] of Object.entries(final)) {
    for (const other of entry.relatedWomen) {
      final[other]?.relatedWomen.add(slug);
    }
  }

  let written = 0;
  for (const w of women) {
    const entry = final[w.slug];
    if (!entry) continue;
    const values = {
      organizations: entry.organizations,
      movements: entry.movements,
      relatedWomen: [...entry.relatedWomen].sort(),
    };
    if (!values.organizations.length && !values.movements.length && !values.relatedWomen.length) {
      continue;
    }

    const filePath = join(WOMEN_DIR, w._file);
    const original = readFileSync(filePath, "utf-8");
    const match = original.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
      console.log(`  WARNING: no frontmatter in ${w._file}, skipping`);
      continue;
    }
    const cleaned = stripRelKeys(match[1]).replace(/\n+$/, "");
    const additions = REL_KEYS.filter((k) => values[k].length)
      .map((k) => serializeKey(k, values[k]))
      .join("\n");
    const newFm = `---\n${cleaned}\n${additions}\n---`;
    const updated = original.slice(0, match.index) + newFm + original.slice(match.index + match[0].length);
    if (updated !== original) {
      writeFileSync(filePath, updated);
      written++;
    }
  }
  console.log(`Updated frontmatter in ${written} files`);
}

async function main() {
  console.log("HerStory Africa — extracting relationships\n");
  const women = loadDir(WOMEN_DIR, "woman");
  console.log(`Loaded ${women.length} women`);

  const raw = await extractAll(women);
  const canonicalMap = await canonicalize(raw);
  applyToFiles(women, raw, canonicalMap);

  console.log("\nDone. Review the git diff before committing.");
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
