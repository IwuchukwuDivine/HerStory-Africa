#!/usr/bin/env node

// Builds the vector index for HerStory AI (/api/ask).
// Chunks every woman profile and article by markdown heading, embeds the
// chunks with Voyage AI, and writes server/assets/embeddings.json so the
// serverless function can load it via useStorage("assets:server").
// Incremental: unchanged chunks reuse their previous vector (hash log in
// data/embeddings-log.json). FORCE=1 re-embeds everything.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDir, hashOf, slugifyHeading } from "./lib/frontmatter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const WOMEN_DIR = join(ROOT, "app/content/women");
const ARTICLES_DIR = join(ROOT, "app/content/articles");
const OUT_PATH = join(ROOT, "server/assets/embeddings.json");
const LOG_PATH = join(ROOT, "data/embeddings-log.json");

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const MODEL = "voyage-3.5-lite";
const DIMS = 512;
const FORCE = process.env.FORCE === "1";
// Bump when chunking or the output format changes so everything re-embeds.
const SCHEMA_VERSION = "v1";

// Small enough to stay under Voyage's free-tier 10K tokens/minute cap;
// with a payment method on file the extra requests just run fast.
const BATCH_SIZE = 24;
const MAX_CHUNK_CHARS = 1500;

// Strip markdown syntax that adds noise to embeddings and prompts.
function cleanText(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Split text into pieces of at most MAX_CHUNK_CHARS at paragraph boundaries,
// so no answer-bearing sentence is lost to truncation.
function splitLong(text) {
  if (text.length <= MAX_CHUNK_CHARS) return [text];
  const parts = [];
  let current = "";
  for (const para of text.split(/\n\n+/)) {
    if (current && current.length + para.length + 2 > MAX_CHUNK_CHARS) {
      parts.push(current);
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
    // A single paragraph longer than the cap gets hard-split.
    while (current.length > MAX_CHUNK_CHARS) {
      parts.push(current.slice(0, MAX_CHUNK_CHARS));
      current = current.slice(MAX_CHUNK_CHARS);
    }
  }
  if (current) parts.push(current);
  return parts;
}

// Split a markdown body into { heading, anchor, text } sections.
function sectionize(body) {
  const sections = [];
  const lines = body.split("\n");
  let heading = null;
  let buf = [];
  const flush = () => {
    const text = cleanText(buf.join("\n"));
    if (text) {
      sections.push({
        heading,
        anchor: heading ? slugifyHeading(heading) : null,
        text,
      });
    }
    buf = [];
  };
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      flush();
      heading = m[1].trim();
    } else {
      buf.push(line);
    }
  }
  flush();
  return sections;
}

function womanChunks(w) {
  const path = `/women/${w.slug}`;
  const chunks = [];

  // Profile card: answers structured fact questions prose sections miss.
  const lifespan = w.died ? `${w.born}-${w.died}` : `born ${w.born}, still living`;
  chunks.push({
    type: "woman",
    path,
    anchor: null,
    title: w.name,
    heading: "Profile",
    text: cleanText(
      [
        `${w.name} (${lifespan}) from ${w.country}, ${w.region}. Era: ${w.era}.`,
        `Causes: ${(w.causes || []).join(", ")}.`,
        w.summary || "",
        w.funFact ? `Fun fact: ${w.funFact}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    ),
  });

  for (const s of sectionize(w.body)) {
    for (const [i, text] of splitLong(s.text).entries()) {
      chunks.push({
        type: "woman",
        path,
        anchor: s.anchor,
        title: w.name,
        heading: s.heading ? (i > 0 ? `${s.heading} (${i + 1})` : s.heading) : "Introduction",
        text,
      });
    }
  }
  return chunks;
}

function articleChunks(a) {
  const path = `/articles/${a.slug}`;
  const chunks = [
    {
      type: "article",
      path,
      anchor: null,
      title: a.title,
      heading: "Overview",
      text: cleanText(`${a.title}. ${a.category}. ${a.description || ""}`),
    },
  ];
  for (const s of sectionize(a.body)) {
    for (const [i, text] of splitLong(s.text).entries()) {
      chunks.push({
        type: "article",
        path,
        anchor: s.anchor,
        title: a.title,
        heading: s.heading ? (i > 0 ? `${s.heading} (${i + 1})` : s.heading) : "Introduction",
        text,
      });
    }
  }
  return chunks;
}

function chunkKey(chunk, index) {
  return `chunk:${chunk.path}#${chunk.anchor || "intro"}~${index}`;
}

// The text Voyage embeds: title + heading gives every chunk entity context.
function embedText(chunk) {
  return `${chunk.title} - ${chunk.heading}\n\n${chunk.text}`;
}

async function voyageEmbed(texts) {
  if (!VOYAGE_API_KEY) throw new Error("VOYAGE_API_KEY is not set");
  for (let attempt = 0; ; attempt++) {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        input: texts,
        input_type: "document",
        output_dimension: DIMS,
      }),
    });
    if (res.status === 429 && attempt < 10) {
      // Free-tier keys allow 3 requests/minute; wait a full window.
      const wait = 22_000;
      console.log(`    rate limited, retrying in ${wait / 1000}s...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Voyage API ${res.status}: ${err}`);
    }
    const data = await res.json();
    return data.data.map((d) => d.embedding);
  }
}

function readLog() {
  try {
    return JSON.parse(readFileSync(LOG_PATH, "utf-8"));
  } catch {
    return { hashes: {} };
  }
}

// Previous run's vectors, keyed by chunk key, for incremental reuse.
function readExistingVectors(log) {
  try {
    const existing = JSON.parse(readFileSync(OUT_PATH, "utf-8"));
    if (existing.model !== MODEL || existing.dims !== DIMS) return new Map();
    // Buffer.from().buffer may be a pooled ArrayBuffer; copy explicitly.
    const raw = Buffer.from(existing.vectors, "base64");
    const copy = new Float32Array(existing.count * existing.dims);
    for (let i = 0; i < copy.length; i++) copy[i] = raw.readFloatLE(i * 4);
    const map = new Map();
    existing.chunks.forEach((chunk, i) => {
      const key = log.keys?.[i] ?? null;
      if (key) map.set(key, copy.subarray(i * DIMS, (i + 1) * DIMS));
    });
    return map;
  } catch {
    return new Map();
  }
}

async function main() {
  console.log("HerStory AI — generating embeddings\n");

  const women = loadDir(WOMEN_DIR, "woman");
  const articles = loadDir(ARTICLES_DIR, "article");
  console.log(`Loaded ${women.length} women, ${articles.length} articles`);

  const chunks = [
    ...women.flatMap(womanChunks),
    ...articles.flatMap(articleChunks),
  ];
  // Per-path chunk indices so keys are stable per document.
  const perPathCount = {};
  const keys = chunks.map((c) => {
    const base = `${c.path}#${c.anchor || "intro"}`;
    perPathCount[base] = (perPathCount[base] || 0) + 1;
    return chunkKey(c, perPathCount[base] - 1);
  });
  console.log(`Built ${chunks.length} chunks`);

  const log = readLog();
  const existingVectors = readExistingVectors(log);

  const vectors = new Float32Array(chunks.length * DIMS);
  const toEmbed = [];
  const newHashes = {};

  chunks.forEach((chunk, i) => {
    const key = keys[i];
    const h = hashOf(SCHEMA_VERSION + MODEL + DIMS + embedText(chunk));
    newHashes[key] = h;
    const cached = existingVectors.get(key);
    if (!FORCE && log.hashes[key] === h && cached) {
      vectors.set(cached, i * DIMS);
    } else {
      toEmbed.push(i);
    }
  });

  console.log(`Embedding ${toEmbed.length} chunks (${chunks.length - toEmbed.length} reused)`);

  for (let start = 0; start < toEmbed.length; start += BATCH_SIZE) {
    const batchIdx = toEmbed.slice(start, start + BATCH_SIZE);
    process.stdout.write(
      `  batch ${Math.floor(start / BATCH_SIZE) + 1}/${Math.ceil(toEmbed.length / BATCH_SIZE)} (${batchIdx.length} chunks) ... `,
    );
    const embeddings = await voyageEmbed(batchIdx.map((i) => embedText(chunks[i])));
    embeddings.forEach((vec, j) => {
      vectors.set(Float32Array.from(vec), batchIdx[j] * DIMS);
    });
    console.log("ok");
  }

  const out = {
    model: MODEL,
    dims: DIMS,
    count: chunks.length,
    chunks: chunks.map((c) => ({
      type: c.type,
      path: c.path,
      anchor: c.anchor,
      title: c.title,
      heading: c.heading,
      text: c.text,
    })),
    vectors: Buffer.from(vectors.buffer).toString("base64"),
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out) + "\n");
  writeFileSync(
    LOG_PATH,
    JSON.stringify({ hashes: newHashes, keys }, null, 2) + "\n",
  );

  const mb = (JSON.stringify(out).length / 1024 / 1024).toFixed(1);
  console.log(`\nDone. ${chunks.length} chunks, ${mb} MB`);
  console.log(`Wrote: ${OUT_PATH}`);
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
