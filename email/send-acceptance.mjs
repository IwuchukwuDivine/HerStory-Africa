#!/usr/bin/env node
// Send the "suggestion accepted" email to one person via Resend.
//
// Usage:
//   RESEND_API_KEY=re_xxx node email/send-acceptance.mjs \
//     --to "allansbirungi9@gmail.com" \
//     --name "Birungi" \
//     --woman "Grace Mary Mugasa" \
//     --url "https://herstoryafrica.com.ng/women/grace-mary-mugasa"
//
// Add --test to send it to yourself first (overrides --to with TEST_TO).

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) =>
    a.startsWith("--") ? [[a.slice(2), arr[i + 1]?.startsWith("--") ? true : arr[i + 1]]] : []
  )
);

const API_KEY = process.env.RESEND_API_KEY;
if (!API_KEY) throw new Error("Set RESEND_API_KEY in your environment.");

const to = args.test ? process.env.TEST_TO ?? "ekeneifunanya@gmail.com" : args.to;
const name = args.name ?? "there";
const woman = args.woman;
const url = args.url;

if (!to || !woman || !url) {
  throw new Error("Missing required flags. Need --to (or --test), --woman and --url.");
}

let html = await readFile(join(__dirname, "suggestion-accepted.html"), "utf8");
html = html
  .replaceAll("{{{name}}}", name)
  .replaceAll("{{{woman_name}}}", woman)
  .replaceAll("{{{profile_url}}}", url);

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "HerStory Africa <dee@herstoryafrica.com.ng>",
    to: [to],
    subject: `${woman} is now on HerStory Africa`,
    html,
    reply_to: "dee@herstoryafrica.com.ng",
  }),
});

const data = await res.json();
if (!res.ok) {
  console.error("Send failed:", data);
  process.exit(1);
}
console.log(`Sent to ${to}. Resend id: ${data.id}`);
