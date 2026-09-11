import type { MinimarkElement, MinimarkNode } from "@nuxt/content";

/**
 * Helpers for slicing a Nuxt Content v3 (minimark) body before rendering.
 * A body is `{ type: 'minimark', value: MinimarkNode[] }` where each node is
 * a string or a tuple `[tag, props, ...children]`.
 */

function isElement(node: MinimarkNode): node is MinimarkElement {
  return Array.isArray(node);
}

/** Plain text of a node, children joined recursively. */
export function textOf(node: MinimarkNode | undefined): string {
  if (node === undefined) return "";
  if (typeof node === "string") return node;
  return node
    .slice(2)
    .map((child) => textOf(child as MinimarkNode))
    .join("");
}

const SOURCES_PREFIX = /^\s*sources\s*:\s*/i;

/**
 * Strips the trailing "*Sources: ...*" paragraph from a profile body.
 * The last top-level `p` whose text starts with "Sources:" is removed and its
 * text (without the prefix) returned as `sources`.
 */
export function splitSources(body: MinimarkNode[] | undefined): {
  main: MinimarkNode[];
  sources: string;
} {
  const nodes = body ?? [];
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]!;
    if (!isElement(node) || node[0] !== "p") continue;
    const text = textOf(node).trim();
    if (!SOURCES_PREFIX.test(text)) continue;
    const main = [...nodes.slice(0, i), ...nodes.slice(i + 1)];
    // A horizontal rule right before the sources line is scaffolding, not content.
    const last = main[main.length - 1];
    if (last && isElement(last) && last[0] === "hr") main.pop();
    return { main, sources: text.replace(SOURCES_PREFIX, "").trim() };
  }
  return { main: nodes, sources: "" };
}

function firstWomanHref(node: MinimarkNode): string | null {
  if (!isElement(node)) return null;
  if (node[0] === "a") {
    const href = node[1]?.href;
    if (typeof href === "string" && href.startsWith("/women/")) return href;
  }
  for (const child of node.slice(2) as MinimarkNode[]) {
    const found = firstWomanHref(child);
    if (found) return found;
  }
  return null;
}

/**
 * Splits the body after the first top-level node that links to a profile,
 * so an inline archive card can be placed between the halves.
 */
export function splitAtFirstWomanLink(body: MinimarkNode[] | undefined): {
  head: MinimarkNode[];
  tail: MinimarkNode[];
  slug: string | null;
} {
  const nodes = body ?? [];
  for (let i = 0; i < nodes.length; i++) {
    const href = firstWomanHref(nodes[i]!);
    if (!href) continue;
    const slug = href.replace(/[?#].*$/, "").split("/").filter(Boolean).pop() ?? null;
    return { head: nodes.slice(0, i + 1), tail: nodes.slice(i + 1), slug };
  }
  return { head: nodes, tail: [], slug: null };
}

/** Word count of a body, for a reading-time fallback when the build did not set one. */
export function wordCount(body: MinimarkNode[] | undefined): number {
  return (body ?? [])
    .map((node) => textOf(node))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}
