// Loads the vector index built by scripts/generate-embeddings.mjs from
// server/assets (bundled into the serverless function). Decoded once per
// instance; warm invocations reuse the module-level cache.

export interface IndexChunk {
  type: "woman" | "article";
  path: string;
  anchor: string | null;
  title: string;
  heading: string;
  text: string;
}

interface RawIndex {
  model: string;
  dims: number;
  count: number;
  chunks: IndexChunk[];
  vectors: string;
}

export interface EmbeddingIndex {
  model: string;
  dims: number;
  chunks: IndexChunk[];
  vectors: Float32Array;
}

let cached: EmbeddingIndex | null = null;

export async function loadEmbeddingIndex(): Promise<EmbeddingIndex | null> {
  if (cached) return cached;
  const raw = (await useStorage("assets:server").getItem(
    "embeddings.json",
  )) as RawIndex | null;
  if (!raw || !raw.vectors) return null;

  const bytes =
    typeof Buffer !== "undefined"
      ? Buffer.from(raw.vectors, "base64")
      : Uint8Array.from(atob(raw.vectors), (c) => c.charCodeAt(0));
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const vectors = new Float32Array(buffer, 0, raw.count * raw.dims);

  cached = { model: raw.model, dims: raw.dims, chunks: raw.chunks, vectors };
  return cached;
}

// Vectors from Voyage are unit-length, so dot product = cosine similarity.
export function topKSimilar(
  index: EmbeddingIndex,
  query: number[],
  k: number,
  boostPath?: string,
): Array<{ chunk: IndexChunk; score: number }> {
  const { dims, chunks, vectors } = index;
  const scores: Array<{ chunk: IndexChunk; score: number }> = [];
  for (let i = 0; i < chunks.length; i++) {
    let dot = 0;
    const offset = i * dims;
    for (let d = 0; d < dims; d++) dot += vectors[offset + d]! * query[d]!;
    const chunk = chunks[i]!;
    if (boostPath && chunk.path === boostPath) dot += 0.05;
    scores.push({ chunk, score: dot });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, k);
}
