#!/usr/bin/env node
// Sends one built edition to a single address, to see it in a real inbox.
//
//   npm run newsletter:test -- <slug> <address>
//
// Build the edition first (npm run newsletter:build -- <slug>). This is a plain
// one-off email, not a broadcast: no subscriber receives it, and the
// unsubscribe link only points at the newsletter page.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://herstoryafrica.com.ng";
const [slug, to] = process.argv.slice(2);
const key = process.env.NUXT_RESEND_API_KEY;

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

if (!slug || !to) fail("Usage: npm run newsletter:test -- <slug> <address>");
if (!key) fail("NUXT_RESEND_API_KEY is not set in .env.");

const dir = join(ROOT, ".newsletter", slug);
if (!existsSync(join(dir, "email.html"))) fail(`No build for "${slug}". Run: npm run newsletter:build -- ${slug}`);

// Resend only fills merge tags in broadcasts. Our own unsubscribe link gets
// the token "test", which /newsletter/unsubscribe explains; Resend's own tag,
// if a build still uses it, points at the newsletter page.
const fill = (content) =>
  content
    .replaceAll("{{{contact.unsub_token}}}", "test")
    .replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", `${SITE}/newsletter`);
let html = fill(readFileSync(join(dir, "email.html"), "utf8"));
const text = fill(readFileSync(join(dir, "email.txt"), "utf8"));
const subject = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? slug;

// Sample editions keep their images out of public/, so they ride along inline.
const attachments = [];
const imgDir = join(dir, "img");
if (existsSync(imgDir)) {
  for (const file of readdirSync(imgDir)) {
    const cid = file.replace(/\W/g, "-");
    html = html.replaceAll(`${SITE}/newsletter/${slug}/${file}`, `cid:${cid}`);
    attachments.push({ filename: file, content: readFileSync(join(imgDir, file)).toString("base64"), content_id: cid });
  }
}

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    from: "HerStory Africa <letters@herstoryafrica.com.ng>",
    to: [to],
    reply_to: "dee@herstoryafrica.com.ng",
    subject: `[Test] ${subject.replaceAll("&amp;", "&").replaceAll("&quot;", '"')}`,
    html,
    text,
    ...(attachments.length ? { attachments } : {}),
  }),
});

const result = await response.text();
if (!response.ok) fail(`Resend said ${response.status}: ${result}`);
console.log(`\n  ✓ Sent "${subject}" to ${to}\n    ${result}\n`);
