import MiniSearch, { type SearchResult } from "minisearch";
import type {
  ArchiveSearchResult,
  ArchiveSearchResultType,
  SnippetPart,
} from "~/utils/types/search";

interface IndexDoc {
  id: string;
  path: string;
  name?: string;
  title?: string;
  meta?: string;
  content?: string;
}

interface DocMeta {
  type: ArchiveSearchResultType;
  slug: string;
  title: string;
  subtitle?: string;
  to: string;
  fallback: string;
}

interface ArchiveIndexData {
  docs: IndexDoc[];
  meta: Record<string, DocMeta>;
}

const RESULT_LIMIT = 24;
const SNIPPET_RADIUS = 70;

async function loadArchiveIndexData(): Promise<ArchiveIndexData> {
  const [
    women,
    articles,
    opportunities,
    womenSections,
    articleSections,
    opportunitySections,
  ] = await Promise.all([
    queryCollection("women")
      .select("path", "name", "slug", "country", "region", "era", "summary", "causes")
      .all(),
    queryCollection("articles")
      .select("path", "title", "slug", "description", "category")
      .all(),
    queryCollection("opportunities")
      .select("path", "title", "slug", "description", "organization", "category")
      .all(),
    queryCollectionSearchSections("women"),
    queryCollectionSearchSections("articles"),
    queryCollectionSearchSections("opportunities"),
  ]);

  const meta: Record<string, DocMeta> = {};
  const docs: IndexDoc[] = [];

  const addMetaDoc = (path: string, docMeta: DocMeta, metaText: string) => {
    meta[path] = docMeta;
    docs.push({ id: `${path}#__meta`, path, name: docMeta.title, meta: metaText });
  };

  for (const w of women) {
    addMetaDoc(
      w.path,
      {
        type: "woman",
        slug: w.slug,
        title: w.name,
        subtitle: [w.country, w.era && `${w.era} era`].filter(Boolean).join(" · "),
        to: `/women/${w.slug}`,
        fallback: w.summary ?? "",
      },
      [w.name, w.country, w.region, w.era, ...(w.causes ?? []), w.summary].join(" "),
    );
  }

  for (const a of articles) {
    addMetaDoc(
      a.path,
      {
        type: "article",
        slug: a.slug,
        title: a.title,
        subtitle: a.category,
        to: `/articles/${a.slug}`,
        fallback: a.description ?? "",
      },
      [a.title, a.description, a.category].filter(Boolean).join(" "),
    );
  }

  for (const o of opportunities) {
    addMetaDoc(
      o.path,
      {
        type: "opportunity",
        slug: o.slug,
        title: o.title,
        subtitle: o.organization,
        to: `/opportunities/${o.slug}`,
        fallback: o.description ?? "",
      },
      [o.title, o.description, o.organization, o.category].filter(Boolean).join(" "),
    );
  }

  for (const section of [
    ...womenSections,
    ...articleSections,
    ...opportunitySections,
  ]) {
    const path = section.id.split("#")[0] ?? "";
    if (!meta[path] || !section.content) continue;
    docs.push({
      id: section.id === path ? `${path}#__root` : section.id,
      path,
      title: section.title,
      content: section.content,
    });
  }

  return { docs, meta };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSnippet(
  text: string | undefined,
  terms: string[],
): SnippetPart[] | undefined {
  if (!text || terms.length === 0) return undefined;

  const lower = text.toLowerCase();
  let hit = -1;
  let hitLength = 0;
  for (const term of terms) {
    const i = lower.indexOf(term.toLowerCase());
    if (i !== -1 && (hit === -1 || i < hit)) {
      hit = i;
      hitLength = term.length;
    }
  }
  if (hit === -1) return undefined;

  const start = Math.max(0, hit - SNIPPET_RADIUS);
  const end = Math.min(text.length, hit + hitLength + SNIPPET_RADIUS);
  const excerpt =
    (start > 0 ? "…" : "") +
    text.slice(start, end).trim() +
    (end < text.length ? "…" : "");

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts: SnippetPart[] = [];
  let last = 0;
  for (const match of excerpt.matchAll(pattern)) {
    const i = match.index ?? 0;
    if (match[0].length === 0) break;
    if (i > last) parts.push({ text: excerpt.slice(last, i), match: false });
    parts.push({ text: match[0], match: true });
    last = i + match[0].length;
  }
  if (last < excerpt.length) parts.push({ text: excerpt.slice(last), match: false });
  return parts;
}

let loadPending = false;

export function useArchiveSearch() {
  const data = useState<ArchiveIndexData | null>(
    "archive-search-index",
    () => null,
  );
  const failed = useState<boolean>("archive-search-failed", () => false);

  const engine = computed(() => {
    if (!data.value) return null;
    const mini = new MiniSearch<IndexDoc>({
      fields: ["name", "title", "meta", "content"],
      storeFields: ["path"],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        combineWith: "AND",
        boost: { name: 4, title: 3, meta: 2, content: 1 },
      },
    });
    const byId = new Map<string, IndexDoc>();
    for (const doc of data.value.docs) {
      if (byId.has(doc.id)) continue;
      byId.set(doc.id, doc);
      mini.add(doc);
    }
    return { mini, byId };
  });

  const ready = computed(() => engine.value !== null);

  async function ensureLoaded() {
    if (import.meta.server || data.value || loadPending) return;
    loadPending = true;
    try {
      data.value = await loadArchiveIndexData();
      failed.value = false;
    } catch (error) {
      console.error("[archive-search] index load failed:", error);
      failed.value = true;
    } finally {
      loadPending = false;
    }
  }

  function search(query: string): ArchiveSearchResult[] {
    const eng = engine.value;
    const indexData = data.value;
    const q = query.trim();
    if (!eng || !indexData || !q) return [];

    const raw = eng.mini.search(q) as (SearchResult & { path: string })[];

    const grouped = new Map<
      string,
      { score: number; terms: Set<string>; sectionIds: string[] }
    >();
    for (const result of raw) {
      let group = grouped.get(result.path);
      if (!group) {
        group = { score: result.score, terms: new Set(), sectionIds: [] };
        grouped.set(result.path, group);
      }
      for (const term of result.terms) group.terms.add(term);
      if (!result.id.endsWith("#__meta")) group.sectionIds.push(result.id);
    }

    const results: ArchiveSearchResult[] = [];
    for (const [path, group] of grouped) {
      if (results.length >= RESULT_LIMIT) break;
      const docMeta = indexData.meta[path];
      if (!docMeta) continue;

      const terms = [...group.terms];
      let snippet: SnippetPart[] | undefined;
      for (const id of group.sectionIds) {
        snippet = buildSnippet(eng.byId.get(id)?.content, terms);
        if (snippet) break;
      }
      snippet ??= buildSnippet(docMeta.fallback, terms);

      results.push({
        type: docMeta.type,
        slug: docMeta.slug,
        title: docMeta.title,
        subtitle: docMeta.subtitle,
        to: docMeta.to,
        score: group.score,
        snippet,
      });
    }
    return results;
  }

  return { ready, failed, ensureLoaded, search };
}
