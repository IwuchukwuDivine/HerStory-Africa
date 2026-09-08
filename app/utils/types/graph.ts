export type GraphNodeType = "woman" | "organization" | "movement";

export type GraphEdgeType =
  | "member-of"
  | "part-of"
  | "related-to"
  | "similar-to";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  /** Only on woman nodes */
  slug?: string;
  country?: string;
  region?: string;
  era?: string;
  causes?: string[];
  degree: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: GraphEdgeType;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphBuildOptions {
  /** Add one nearest-neighbour similarity edge per woman (keeps the graph connected while curated data is sparse) */
  similarityEdges: boolean;
  /** Keep women with no edges at all */
  includeUnconnected: boolean;
}
