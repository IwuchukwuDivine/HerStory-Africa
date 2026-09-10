#!/usr/bin/env node

// Validates every internal Markdown link in app/content points at a real
// content file or a known static route. Exit code 1 when anything is broken.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "app/content");
const STATIC_ROUTES = new Set([
  "/",
  "/women",
  "/women/all",
  "/articles",
  "/opportunities",
  "/timeline",
  "/about",
  "/suggest",
  "/newsletter",
]);

const slugs = {
  women: new Set(),
  articles: new Set(),
  opportunities: new Set(),
};
for (const coll of Object.keys(slugs)) {
  const dir = join(CONTENT, coll);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (f.endsWith(".md")) slugs[coll].add(f.replace(/\.md$/, ""));
  }
}

const linkRe = /\]\((\/[^)\s#?]*)(?:[#?][^)]*)?\)/g;
let checked = 0;
let broken = 0;
let selfLinks = 0;

for (const coll of Object.keys(slugs)) {
  const dir = join(CONTENT, coll);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".md"))) {
    const self = `/${coll}/${f.replace(/\.md$/, "")}`;
    const text = readFileSync(join(dir, f), "utf-8");
    for (const m of text.matchAll(linkRe)) {
      const href = m[1].replace(/\/$/, "") || "/";
      checked++;
      if (href === self) {
        selfLinks++;
        console.log(`SELF   ${coll}/${f}: ${href}`);
        continue;
      }
      if (STATIC_ROUTES.has(href)) continue;
      if (/^\/women\/(region|era|cause)\/[a-z0-9-]+$/.test(href)) continue;
      const parts = href.split("/").filter(Boolean);
      const [c, slug] = parts;
      if (parts.length === 2 && slugs[c]?.has(slug)) continue;
      broken++;
      console.log(`BROKEN ${coll}/${f}: ${href}`);
    }
  }
}

console.log(
  `\nChecked ${checked} internal links. Broken: ${broken}. Self-links: ${selfLinks}.`,
);
if (broken > 0 || selfLinks > 0) process.exit(1);
