import type {
  GraphBuildOptions,
  GraphData,
  GraphEdge,
  GraphNode,
} from "~/utils/types/graph";

// Derives the knowledge graph (women <-> organizations <-> movements) from
// women frontmatter, client-side. Same lazy useState pattern as
// useArchiveSearch: data loads once per session on first use.

interface WomanRow {
  name: string;
  slug: string;
  country: string;
  region: string;
  era: string;
  causes?: string[];
  summary?: string;
  image?: string;
  organizations?: string[];
  movements?: string[];
  relatedWomen?: string[];
}

export function useKnowledgeGraph() {
  const women = useState<WomanRow[] | null>("knowledge-graph-women", () => null);
  const loading = useState<boolean>("knowledge-graph-loading", () => false);

  async function ensureLoaded() {
    if (import.meta.server || women.value || loading.value) return;
    loading.value = true;
    try {
      const rows = await queryCollection("women")
        .select(
          "name",
          "slug",
          "country",
          "region",
          "era",
          "causes",
          "summary",
          "image",
          "organizations",
          "movements",
          "relatedWomen",
        )
        .all();
      women.value = rows as unknown as WomanRow[];
    } finally {
      loading.value = false;
    }
  }

  // Same scoring as RelatedWomen.vue: shared cause +3, same era +2, same region +1.
  function bestSimilarPartner(w: WomanRow, all: WomanRow[]): string | null {
    let best: string | null = null;
    let bestScore = 0;
    for (const other of all) {
      if (other.slug === w.slug) continue;
      let score = 0;
      const shared = (other.causes ?? []).filter((c) =>
        (w.causes ?? []).includes(c),
      ).length;
      score += shared * 3;
      if (other.era === w.era) score += 2;
      if (other.region === w.region) score += 1;
      if (score > bestScore) {
        bestScore = score;
        best = other.slug;
      }
    }
    return bestScore > 0 ? best : null;
  }

  function buildGraph(options: GraphBuildOptions): GraphData {
    const rows = women.value ?? [];
    const nodeById = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];
    const edgeKeys = new Set<string>();
    const validSlugs = new Set(rows.map((w) => w.slug));

    const womanId = (slug: string) => `w:${slug}`;

    for (const w of rows) {
      nodeById.set(womanId(w.slug), {
        id: womanId(w.slug),
        type: "woman",
        label: w.name,
        slug: w.slug,
        country: w.country,
        region: w.region,
        era: w.era,
        causes: w.causes ?? [],
        degree: 0,
      });
    }

    function ensureEntity(type: "organization" | "movement", name: string) {
      const id = `${type === "organization" ? "o" : "m"}:${name}`;
      if (!nodeById.has(id)) {
        nodeById.set(id, { id, type, label: name, degree: 0 });
      }
      return id;
    }

    function addEdge(source: string, target: string, type: GraphEdge["type"]) {
      const key =
        source < target
          ? `${source}|${target}|${type}`
          : `${target}|${source}|${type}`;
      if (edgeKeys.has(key)) return;
      edgeKeys.add(key);
      edges.push({ source, target, type });
      nodeById.get(source)!.degree++;
      nodeById.get(target)!.degree++;
    }

    for (const w of rows) {
      const wid = womanId(w.slug);
      for (const org of w.organizations ?? []) {
        addEdge(wid, ensureEntity("organization", org), "member-of");
      }
      for (const movement of w.movements ?? []) {
        addEdge(wid, ensureEntity("movement", movement), "part-of");
      }
      for (const other of w.relatedWomen ?? []) {
        if (validSlugs.has(other) && other !== w.slug) {
          addEdge(wid, womanId(other), "related-to");
        }
      }
    }

    if (options.similarityEdges) {
      for (const w of rows) {
        const partner = bestSimilarPartner(w, rows);
        if (partner) addEdge(womanId(w.slug), womanId(partner), "similar-to");
      }
    }

    let nodes = [...nodeById.values()];
    if (!options.includeUnconnected) {
      nodes = nodes.filter((n) => n.type !== "woman" || n.degree > 0);
    }
    return { nodes, edges };
  }

  function womanDetails(slug: string): WomanRow | undefined {
    return (women.value ?? []).find((w) => w.slug === slug);
  }

  return { ensureLoaded, buildGraph, womanDetails, loading, women };
}
