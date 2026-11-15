import { ofetch } from "ofetch";

// The newsletter on Resend Broadcasts. Editions are built locally by
// `npm run newsletter:build`, which writes the sendable copy into
// server/assets/newsletter/<slug>/. Nitro bundles that folder, so the deployed
// function reads it from the `assets:server` storage below; there is no
// database.
//
// Each edition maps to at most one live broadcast, found by its name
// (`newsletter/<slug>`). Field names follow Resend's OpenAPI spec and were
// checked against the account on 15 Nov 2026.

export const NEWSLETTER_FROM = "HerStory Africa <letters@herstoryafrica.com.ng>";
export const NEWSLETTER_REPLY_TO = "dee@herstoryafrica.com.ng";
const SEGMENT_NAME = "General";
const SITE = "https://herstoryafrica.com.ng";
const UNSUBSCRIBE = "{{{RESEND_UNSUBSCRIBE_URL}}}";

export interface EditionMeta {
  slug: string;
  number: number;
  title: string;
  subject: string;
  preview: string;
  date: string;
  /** ISO timestamp the broadcast is scheduled for on approval. */
  sendAt: string;
  layout: string;
  register: string;
  link: string;
  woman: string | null;
  article: string | null;
  /** Hash of the built HTML and text, to tell when Resend holds an older copy. */
  hash: string;
}

export interface Edition {
  meta: EditionMeta;
  html: string;
  text: string;
}

export type BroadcastStatus = "draft" | "scheduled" | "queued" | "sent" | "canceled";

export interface Broadcast {
  id: string;
  name: string | null;
  segment_id: string | null;
  status: BroadcastStatus;
  created_at: string;
  scheduled_at: string | null;
  sent_at: string | null;
}

export interface BroadcastDetail extends Broadcast {
  subject: string;
  html: string | null;
  text: string | null;
}

/* ── Built editions ─────────────────────────────────────────────── */

const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const assets = () => useStorage("assets:server");

export async function listEditions(): Promise<EditionMeta[]> {
  const keys = await assets().getKeys("newsletter");
  const metas = await Promise.all(
    keys
      .filter((key) => key.endsWith(":edition.json"))
      .map((key) => assets().getItem<EditionMeta>(key)),
  );
  return metas
    .filter((meta): meta is EditionMeta => !!meta?.slug)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** The built edition, or a 404 for anything that was not built and committed. */
export async function readEdition(slug: string): Promise<Edition> {
  if (!SLUG.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid edition." });
  }
  const base = `newsletter:${slug}`;
  const [meta, html, text] = await Promise.all([
    assets().getItem<EditionMeta>(`${base}:edition.json`),
    assets().getItemRaw(`${base}:email.html`),
    assets().getItemRaw(`${base}:email.txt`),
  ]);
  if (!meta || !html || !text) {
    throw createError({
      statusCode: 404,
      statusMessage: `No built edition "${slug}". Run npm run newsletter:build -- ${slug} and deploy.`,
    });
  }
  const decode = (value: unknown) =>
    typeof value === "string" ? value : new TextDecoder().decode(value as Uint8Array);
  return { meta, html: decode(html), text: decode(text) };
}

/**
 * For a one-off test email or the preview: Resend only fills merge tags in
 * broadcasts. The Resend unsubscribe tag becomes the newsletter page, and our
 * own unsubscribe link gets the token "test", which the page explains.
 */
export function withoutUnsubscribeTag(content: string) {
  return content
    .replaceAll(UNSUBSCRIBE, `${SITE}/newsletter`)
    .replaceAll(`{{{contact.${UNSUB_TOKEN_KEY}}}}`, "test");
}

/**
 * For the admin preview: images load from the current deployment instead of
 * the live site, so an edition can be checked before its images go live.
 */
export function previewHtml(html: string) {
  return withoutUnsubscribeTag(html).replaceAll(`${SITE}/newsletter/`, "/newsletter/");
}

/* ── Resend ─────────────────────────────────────────────────────── */

export function resendApi<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: Record<string, unknown>;
    query?: Record<string, string | number>;
    /** Resend ignores a repeat of the same key within 24 hours. */
    idempotencyKey?: string;
  } = {},
): Promise<T> {
  const { resendApiKey } = useRuntimeConfig();
  if (!resendApiKey) {
    throw createError({ statusCode: 500, statusMessage: "Resend is not configured." });
  }
  const { idempotencyKey, ...rest } = options;
  return ofetch<T>(`https://api.resend.com${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
  });
}

let segmentId: string | null = null;

/** The "General" segment every broadcast goes to. */
export async function generalSegmentId(): Promise<string> {
  if (segmentId) return segmentId;
  const { data } = await resendApi<{ data: { id: string; name: string }[] }>("/segments");
  const segment = data.find((s) => s.name === SEGMENT_NAME);
  if (!segment) {
    throw createError({
      statusCode: 500,
      statusMessage: `Resend has no "${SEGMENT_NAME}" segment.`,
    });
  }
  segmentId = segment.id;
  return segmentId;
}

export const broadcastName = (slug: string) => `newsletter/${slug}`;

/**
 * Broadcasts keyed by edition slug. When an edition has several (one was
 * canceled and remade), the newest one that is not canceled wins.
 */
export async function broadcastsBySlug(): Promise<Map<string, Broadcast>> {
  const { data } = await resendApi<{ data: Broadcast[] }>("/broadcasts");
  const bySlug = new Map<string, Broadcast>();
  const rank = (b: Broadcast) => (b.status === "canceled" ? 0 : 1);
  for (const broadcast of data) {
    const slug = broadcast.name?.match(/^newsletter\/([a-z0-9-]+)$/)?.[1];
    if (!slug) continue;
    const current = bySlug.get(slug);
    if (
      !current ||
      rank(broadcast) > rank(current) ||
      (rank(broadcast) === rank(current) && broadcast.created_at > current.created_at)
    ) {
      bySlug.set(slug, broadcast);
    }
  }
  return bySlug;
}

export function getBroadcast(id: string) {
  return resendApi<BroadcastDetail>(`/broadcasts/${id}`);
}

/** Does the copy in Resend match the edition as built now? */
export function broadcastMatches(broadcast: BroadcastDetail, edition: Edition) {
  return (
    broadcast.html === edition.html &&
    broadcast.text === edition.text &&
    broadcast.subject === edition.meta.subject
  );
}

/**
 * The broadcast body for an edition. `preview_text` is left out on purpose:
 * every layout already carries its own padded preheader, and a second one
 * injected at send time could leak into the inbox preview.
 */
async function broadcastBody(edition: Edition) {
  return {
    name: broadcastName(edition.meta.slug),
    segment_id: await generalSegmentId(),
    from: NEWSLETTER_FROM,
    reply_to: [NEWSLETTER_REPLY_TO],
    subject: edition.meta.subject,
    html: edition.html,
    text: edition.text,
  };
}

/**
 * Creates the edition's draft in Resend, or brings an existing draft up to
 * date. Never sends: `send` is left at its default of false.
 */
export async function saveDraft(edition: Edition, existing?: Broadcast): Promise<string> {
  const body = await broadcastBody(edition);
  if (existing && existing.status === "draft") {
    await resendApi(`/broadcasts/${existing.id}`, { method: "PATCH", body });
    return existing.id;
  }
  if (existing && existing.status !== "canceled") {
    throw createError({
      statusCode: 409,
      statusMessage: `This edition is already ${existing.status} in Resend.`,
    });
  }
  const created = await resendApi<{ id: string }>("/broadcasts", { method: "POST", body });
  return created.id;
}

/* ── Subscribers ────────────────────────────────────────────────── */

interface Contact {
  id: string;
  unsubscribed: boolean;
}

/**
 * Contacts in the General segment, or null when Resend cannot be asked.
 * Pages through the list 100 at a time; the free plan caps at 1,000.
 */
export async function newsletterAudience(): Promise<{
  subscribed: number;
  unsubscribed: number;
} | null> {
  const { resendApiKey } = useRuntimeConfig();
  if (!resendApiKey) return null;
  try {
    const segment = await generalSegmentId();
    let subscribed = 0;
    let unsubscribed = 0;
    let after: string | undefined;
    for (let page = 0; page < 50; page++) {
      const { data, has_more } = await resendApi<{ data: Contact[]; has_more: boolean }>(
        "/contacts",
        { query: { segment_id: segment, limit: 100, ...(after ? { after } : {}) } },
      );
      for (const contact of data) {
        if (contact.unsubscribed) unsubscribed++;
        else subscribed++;
      }
      if (!has_more || !data.length) break;
      after = data[data.length - 1]!.id;
    }
    return { subscribed, unsubscribed };
  } catch {
    return null;
  }
}
