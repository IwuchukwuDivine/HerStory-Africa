#!/usr/bin/env node
// Brings the Resend account in line with this repo. Safe to run again.
//
//   npm run resend:setup                             property + templates
//   npm run resend:setup -- --preview                write the templates to .resend/ and stop
//   npm run resend:setup -- --backfill-tokens        show which contacts lack a token
//   npm run resend:setup -- --backfill-tokens --apply   write the missing tokens
//
// 1. Creates the `unsub_token` contact property the unsubscribe link uses.
// 2. Creates or updates each template in emails/templates/ by alias, then
//    publishes it. Nothing is sent.
// 3. Backfill: contacts added outside the signup form (the Buttondown import)
//    have no token. This computes it exactly as server/utils/subscribers.ts
//    does and writes it to the contact. Without --apply it only reports.
//
// Needs NUXT_RESEND_API_KEY (full access) in .env, plus NUXT_NEWSLETTER_SECRET
// for the backfill.

import { createHmac } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { templates } from "../emails/templates/index.mjs";

const KEY = process.env.NUXT_RESEND_API_KEY;
const SECRET = process.env.NUXT_NEWSLETTER_SECRET;
const PROPERTY = "unsub_token";
const args = new Set(process.argv.slice(2));

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

/**
 * Writes each template out with its variables filled in, so the copy can be
 * read in a browser before it is pushed. Artwork is read from the local
 * public/ folder, which is also where a missing kit image will show up.
 */
function preview() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const out = join(root, ".resend");
  const sample = {
    unsubscribe_url: "https://herstoryafrica.com.ng/newsletter/unsubscribe?t=sample",
    next_1: "1 December",
    next_2: "15 December",
    next_3: "1 January",
    name: "Ada",
    woman_name: "Nwanyeruwa",
    profile_url: "https://herstoryafrica.com.ng/women/nwanyeruwa",
  };
  mkdirSync(out, { recursive: true });
  for (const template of templates) {
    let html = template.html;
    for (const [key, value] of Object.entries(sample)) html = html.replaceAll(`{{{${key}}}}`, value);
    html = html.replaceAll("https://herstoryafrica.com.ng/newsletter/kit/", `file://${join(root, "public/newsletter/kit")}/`);
    writeFileSync(join(out, `${template.alias}.html`), html);
    console.log(`  ✓ .resend/${template.alias}.html   subject: ${template.subject}`);
  }
  console.log("\n  Nothing was sent or pushed. Open these to read them.\n");
}

if (args.has("--preview")) {
  preview();
  process.exit(0);
}

if (!KEY) fail("NUXT_RESEND_API_KEY is not set in .env.");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Resend's default rate limit is low, so calls are spaced out. */
async function api(path, { method = "GET", body } = {}) {
  await sleep(600);
  const response = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const error = new Error(`${method} ${path} → ${response.status}: ${text}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function ensureProperty() {
  const { data } = await api("/contact-properties");
  if (data.some((prop) => prop.key === PROPERTY)) {
    console.log(`  ✓ Contact property "${PROPERTY}" exists`);
    return;
  }
  await api("/contact-properties", {
    method: "POST",
    body: { key: PROPERTY, type: "string", fallback_value: "" },
  });
  console.log(`  ✓ Created contact property "${PROPERTY}"`);
}

async function syncTemplates() {
  for (const template of templates) {
    const { alias, ...fields } = template;
    let exists = true;
    try {
      await api(`/templates/${alias}`);
    } catch (error) {
      if (error.status !== 404) throw error;
      exists = false;
    }
    if (exists) await api(`/templates/${alias}`, { method: "PATCH", body: fields });
    else await api("/templates", { method: "POST", body: { alias, ...fields } });
    await api(`/templates/${alias}/publish`, { method: "POST" });
    console.log(`  ✓ ${exists ? "Updated" : "Created"} and published template "${alias}"`);
  }
}

const tokenFor = (id) =>
  `${id}.${createHmac("sha256", SECRET).update(`unsubscribe:${id}`).digest("base64url").slice(0, 32)}`;

async function backfill(apply) {
  if (!SECRET || SECRET.length < 32) fail("NUXT_NEWSLETTER_SECRET must be set (32+ characters) to compute tokens.");
  const contacts = [];
  let after;
  do {
    const query = new URLSearchParams({ limit: "100", ...(after ? { after } : {}) });
    const page = await api(`/contacts?${query}`);
    contacts.push(...page.data);
    after = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (after);

  let missing = 0;
  for (const { id } of contacts) {
    const contact = await api(`/contacts/${id}`);
    const current = contact.properties?.[PROPERTY];
    const value = typeof current === "object" && current ? current.value : current;
    if (value === tokenFor(id)) continue;
    missing++;
    if (apply) await api(`/contacts/${id}`, { method: "PATCH", body: { properties: { [PROPERTY]: tokenFor(id) } } });
  }
  console.log(
    apply
      ? `  ✓ Wrote tokens for ${missing} of ${contacts.length} contacts`
      : `  ${missing} of ${contacts.length} contacts need a token. Run again with --apply to write them.`,
  );
}

console.log("");
if (args.has("--backfill-tokens")) {
  await backfill(args.has("--apply"));
} else {
  await ensureProperty();
  await syncTemplates();
}
console.log("");
