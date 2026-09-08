import Anthropic from "@anthropic-ai/sdk";
import type { H3Event } from "h3";

// HerStory AI: grounded Q&A over the archive. Retrieves the most relevant
// content sections by embedding similarity and asks Claude to answer from
// those excerpts only, citing each one it used.

const MODEL = "claude-haiku-4-5";
const TOP_K = 8;
// Best-match cosine similarity below this means the archive almost certainly
// can't answer; we refuse without calling Claude. Tune against real queries.
const REFUSAL_THRESHOLD = 0.4;

const ALLOWED_ORIGIN_HOSTS = [
  "herstoryafrica.com.ng",
  "www.herstoryafrica.com.ng",
  "localhost",
  "127.0.0.1",
];

const REFUSAL_ANSWER =
  "The archive doesn't cover that yet. Try asking about one of the women or articles on the site, their causes, or the history around them.";

interface AskBody {
  question?: string;
  context?: { type?: string; slug?: string };
}

interface AskResponse {
  answer: string;
  citations: Array<{ title: string; path: string }>;
}

const ANSWER_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    citations: { type: "array", items: { type: "integer" } },
  },
  required: ["answer", "citations"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = [
  "You answer questions for HerStory Africa, an educational archive of African women in history.",
  "You are given numbered excerpts from the archive. Rules:",
  "- Answer ONLY from the excerpts. Never use outside knowledge, and never invent names, dates, places, or events.",
  "- Keep answers to 2-5 sentences. Voice: warm, direct, grounded. No em dashes.",
  "- Every factual claim must be supported by at least one excerpt; list the index of each excerpt you used in citations.",
  "- If the excerpts do not contain the answer, say so in one sentence and return an empty citations array.",
  "- If the question is unrelated to African women's history or this archive, decline in one sentence and return an empty citations array.",
].join("\n");

// ── Best-effort, per-instance protections ─────────────────────────────
// These reset on every cold start and are per serverless instance, so they
// soften abuse rather than guarantee limits. The hard guarantees are the
// question length cap, max_tokens, the refusal short-circuit, and a spend
// alert in the Anthropic console. If real abuse shows up, move to a shared
// store (e.g. @upstash/ratelimit).
const RATE_WINDOWS = [
  { ms: 60_000, max: 5 },
  { ms: 3_600_000, max: 30 },
];
const ipHits = new Map<string, number[]>();
const GLOBAL_DAILY_CAP = 500;
let globalCount = 0;
let globalCountDay = "";

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  if (day !== globalCountDay) {
    globalCountDay = day;
    globalCount = 0;
  }
  if (globalCount >= GLOBAL_DAILY_CAP) return true;

  const hits = (ipHits.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOWS[1]!.ms,
  );
  for (const w of RATE_WINDOWS) {
    if (hits.filter((t) => now - t < w.ms).length >= w.max) return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) ipHits.clear();
  globalCount++;
  return false;
}

// Tiny per-instance LRU for repeated questions.
const answerCache = new Map<string, AskResponse>();
const CACHE_MAX = 200;

function cacheGet(key: string): AskResponse | undefined {
  const hit = answerCache.get(key);
  if (hit) {
    answerCache.delete(key);
    answerCache.set(key, hit);
  }
  return hit;
}

function cacheSet(key: string, value: AskResponse) {
  answerCache.set(key, value);
  if (answerCache.size > CACHE_MAX) {
    const oldest = answerCache.keys().next().value;
    if (oldest) answerCache.delete(oldest);
  }
}

function checkOrigin(event: H3Event) {
  const source = getHeader(event, "origin") ?? getHeader(event, "referer");
  if (!source) return true;
  try {
    const host = new URL(source).hostname;
    return (
      ALLOWED_ORIGIN_HOSTS.includes(host) || host.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

async function embedQuery(
  question: string,
  apiKey: string,
  model: string,
  dims: number,
): Promise<number[]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [question],
      input_type: "query",
      output_dimension: dims,
    }),
  });
  if (!res.ok) throw new Error(`Voyage API ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding;
}

export default defineEventHandler(async (event): Promise<AskResponse> => {
  const { anthropicApiKey, voyageApiKey } = useRuntimeConfig();
  if (!anthropicApiKey || !voyageApiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: "The assistant is not configured on this deployment",
    });
  }

  if (!checkOrigin(event)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const body = await readBody<AskBody>(event);
  const question = body?.question?.trim() ?? "";
  if (question.length < 3 || question.length > 300) {
    throw createError({
      statusCode: 400,
      statusMessage: "Question must be between 3 and 300 characters",
    });
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
  if (isRateLimited(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many questions, try again in a minute",
    });
  }

  const contextSlug = body?.context?.slug?.trim();
  const contextType = body?.context?.type;
  const boostPath =
    contextSlug && (contextType === "woman" || contextType === "article")
      ? `/${contextType === "woman" ? "women" : "articles"}/${contextSlug}`
      : undefined;

  const cacheKey = `${question.toLowerCase().replace(/\s+/g, " ")}|${boostPath ?? ""}`;
  const cachedAnswer = cacheGet(cacheKey);
  if (cachedAnswer) return cachedAnswer;

  const index = await loadEmbeddingIndex();
  if (!index) {
    throw createError({
      statusCode: 503,
      statusMessage: "The archive index has not been built yet",
    });
  }

  // Resolve the current page's title so pronoun questions ("is she still
  // active?") asked from a profile page have a referent, both for retrieval
  // and for the model.
  const contextTitle = boostPath
    ? index.chunks.find((c) => c.path === boostPath)?.title
    : undefined;

  let queryVector: number[];
  try {
    queryVector = await embedQuery(
      contextTitle ? `${contextTitle}: ${question}` : question,
      voyageApiKey,
      index.model,
      index.dims,
    );
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Could not process the question, try again",
    });
  }

  const top = topKSimilar(index, queryVector, TOP_K, boostPath);
  if (!top.length || top[0]!.score < REFUSAL_THRESHOLD) {
    return { answer: REFUSAL_ANSWER, citations: [] };
  }

  const excerpts = top
    .map(
      (t, i) =>
        `[${i}] ${t.chunk.title} - ${t.chunk.heading}\n${t.chunk.text}`,
    )
    .join("\n\n");

  const anthropic = new Anthropic({
    apiKey: anthropicApiKey,
    maxRetries: 1,
    timeout: 20_000,
  });

  let parsed: { answer: string; citations: number[] };
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      output_config: {
        format: { type: "json_schema", schema: ANSWER_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            `Excerpts from the archive:\n\n${excerpts}`,
            contextTitle
              ? `The reader is asking from the page about ${contextTitle}; pronouns like "she" or "her" refer to ${contextTitle} unless the question says otherwise.`
              : null,
            `Question: ${question}`,
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
    });
    const text = msg.content.find((b) => b.type === "text")?.text ?? "";
    parsed = JSON.parse(text);
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "The assistant could not answer, try again",
    });
  }

  const seen = new Set<string>();
  const citations: AskResponse["citations"] = [];
  for (const i of parsed.citations ?? []) {
    const hit = top[i];
    if (!hit || seen.has(hit.chunk.path)) continue;
    seen.add(hit.chunk.path);
    citations.push({
      title: hit.chunk.title,
      path: hit.chunk.anchor
        ? `${hit.chunk.path}#${hit.chunk.anchor}`
        : hit.chunk.path,
    });
  }

  const response: AskResponse = {
    answer: String(parsed.answer ?? "").trim() || REFUSAL_ANSWER,
    citations,
  };
  cacheSet(cacheKey, response);
  return response;
});
