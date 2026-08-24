// Shared helpers for the content scripts (ai:generate, ai:embed, ai:relationships).
// A deliberately small frontmatter parser: our content files only use flat
// key: value pairs and string arrays, so a YAML dependency is unnecessary.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export function parseFrontmatter(raw) {
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

export function loadDir(dir, type) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf-8");
      const { data, body } = parseFrontmatter(raw);
      return { ...data, type, body, _file: f };
    });
}

export function hashOf(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

// Matches the anchor ids Nuxt Content generates for headings
// ("## Major Achievements" -> "major-achievements").
export function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
