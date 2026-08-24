<template>
  <div
    ref="wrapperEl"
    class="kg-canvas-wrap"
  >
    <canvas
      ref="canvasEl"
      role="img"
      aria-label="Interactive network graph connecting African women to the organizations and movements they were part of. Use the search box and list view below for a non-visual alternative."
    />
    <div
      v-if="hoveredNode"
      class="kg-tooltip"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
    >
      <strong>{{ hoveredNode.label }}</strong>
      <span>{{ tooltipMeta }}</span>
    </div>
    <button
      class="kg-reset"
      type="button"
      aria-label="Reset view"
      @click="resetView"
    >
      <LucideMaximize :size="15" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type {
  GraphData,
  GraphEdge,
  GraphEdgeType,
  GraphNode,
} from "~/utils/types/graph";
import type {
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from "d3-force";
import type { ZoomBehavior, ZoomTransform } from "d3-zoom";

interface SimNode extends GraphNode, SimulationNodeDatum {}
interface SimEdge extends SimulationLinkDatum<SimNode> {
  type: GraphEdgeType;
}

const props = defineProps<{
  data: GraphData;
  dimmedIds: Set<string>;
  focusId: string | null;
}>();

const emit = defineEmits<{
  select: [node: GraphNode | null];
}>();

const wrapperEl = ref<HTMLDivElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);
const hoveredNode = ref<SimNode | null>(null);
const tooltip = ref({ x: 0, y: 0 });

const tooltipMeta = computed(() => {
  const n = hoveredNode.value;
  if (!n) return "";
  const connections = `${n.degree} connection${n.degree === 1 ? "" : "s"}`;
  if (n.type === "woman") return `${n.country ?? ""} · ${connections}`;
  return `${n.type} · ${connections}`;
});

let simulation: Simulation<SimNode, SimEdge> | null = null;
let simNodes: SimNode[] = [];
let simEdges: SimEdge[] = [];
let transform: ZoomTransform | null = null;
let zoomBehavior: ZoomBehavior<HTMLCanvasElement, unknown> | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let dpr = 1;
let resizeObserver: ResizeObserver | null = null;
let themeObserver: MutationObserver | null = null;
let colors: Record<string, string> = {};
let d3: {
  forceSimulation: typeof import("d3-force").forceSimulation;
  forceLink: typeof import("d3-force").forceLink;
  forceManyBody: typeof import("d3-force").forceManyBody;
  forceCollide: typeof import("d3-force").forceCollide;
  forceCenter: typeof import("d3-force").forceCenter;
  forceX: typeof import("d3-force").forceX;
  forceY: typeof import("d3-force").forceY;
  select: typeof import("d3-selection").select;
  zoom: typeof import("d3-zoom").zoom;
  zoomIdentity: typeof import("d3-zoom").zoomIdentity;
  drag: typeof import("d3-drag").drag;
} | null = null;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  colors = {
    woman: get("--color-primary", "#b5451b"),
    organization: get("--color-secondary", "#8a6d3b"),
    movement: get("--color-forest", "#3c6e47"),
    edge: get("--border-default", "#d8cfc4"),
    label: get("--text-secondary", "#5a5248"),
    focusRing: get("--text-primary", "#2b2620"),
  };
}

function nodeRadius(n: SimNode): number {
  const base = n.type === "woman" ? 4.5 : 6;
  return Math.min(base + n.degree * 0.55, 15);
}

function draw() {
  if (!ctx || !transform) return;
  ctx.save();
  ctx.clearRect(0, 0, width * dpr, height * dpr);
  ctx.scale(dpr, dpr);
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.k, transform.k);

  const dimmed = props.dimmedIds;
  const focus = props.focusId;

  // Edges
  for (const edge of simEdges) {
    const s = edge.source as SimNode;
    const t = edge.target as SimNode;
    if (s.x == null || t.x == null) continue;
    const isDim = dimmed.has(s.id) || dimmed.has(t.id);
    ctx.globalAlpha = isDim ? 0.06 : edge.type === "similar-to" ? 0.25 : 0.5;
    ctx.strokeStyle = colors.edge!;
    ctx.lineWidth = 1 / transform.k;
    ctx.setLineDash(edge.type === "similar-to" ? [3 / transform.k, 3 / transform.k] : []);
    ctx.beginPath();
    ctx.moveTo(s.x!, s.y!);
    ctx.lineTo(t.x!, t.y!);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Nodes
  for (const n of simNodes) {
    if (n.x == null) continue;
    const r = nodeRadius(n);
    ctx.globalAlpha = dimmed.has(n.id) ? 0.12 : 1;
    ctx.fillStyle = colors[n.type]!;
    ctx.beginPath();
    ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2);
    ctx.fill();
    if (n.id === focus || n.id === hoveredNode.value?.id) {
      ctx.strokeStyle = colors.focusRing!;
      ctx.lineWidth = 2 / transform.k;
      ctx.beginPath();
      ctx.arc(n.x!, n.y!, r + 3 / transform.k, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Labels: focused/hovered always; hubs when zoomed in enough
  const showLabels = transform.k >= 1.1;
  ctx.font = `${11 / transform.k}px sans-serif`;
  ctx.textAlign = "center";
  for (const n of simNodes) {
    if (n.x == null || dimmed.has(n.id)) continue;
    const important = n.id === focus || n.id === hoveredNode.value?.id;
    if (!important && !(showLabels || n.degree >= 6)) continue;
    ctx.globalAlpha = important ? 1 : 0.8;
    ctx.fillStyle = colors.label!;
    ctx.fillText(n.label, n.x!, n.y! + nodeRadius(n) + 12 / transform.k);
  }

  ctx.restore();
}

function buildSimulation() {
  if (!d3 || !canvasEl.value) return;
  simulation?.stop();

  // Preserve positions across rebuilds so toggles don't scatter the layout.
  const prev = new Map(simNodes.map((n) => [n.id, n]));
  simNodes = props.data.nodes.map((n) => {
    const old = prev.get(n.id);
    return { ...n, x: old?.x, y: old?.y, vx: 0, vy: 0 };
  });
  const ids = new Set(simNodes.map((n) => n.id));
  simEdges = props.data.edges
    .filter((e: GraphEdge) => ids.has(e.source) && ids.has(e.target))
    .map((e) => ({ ...e }));

  simulation = d3
    .forceSimulation<SimNode>(simNodes)
    .force(
      "link",
      d3
        .forceLink<SimNode, SimEdge>(simEdges)
        .id((n) => n.id)
        .distance((e) => (e.type === "member-of" || e.type === "part-of" ? 55 : 40)),
    )
    .force("charge", d3.forceManyBody().strength(-80))
    .force("collide", d3.forceCollide<SimNode>((n) => nodeRadius(n) + 3))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.04))
    .force("y", d3.forceY(height / 2).strength(0.04));

  if (prefersReducedMotion()) {
    simulation.stop();
    simulation.tick(300);
    draw();
  } else {
    // Warm up off-screen so the first paint isn't an explosion.
    simulation.tick(80);
    simulation.on("tick", draw);
    simulation.alpha(0.5).restart();
  }
}

function pickNode(clientX: number, clientY: number): SimNode | null {
  if (!simulation || !transform || !canvasEl.value) return null;
  const rect = canvasEl.value.getBoundingClientRect();
  const x = transform.invertX(clientX - rect.left);
  const y = transform.invertY(clientY - rect.top);
  const node = simulation.find(x, y, 18 / transform.k);
  return (node as SimNode | undefined) ?? null;
}

function onPointerMove(event: PointerEvent) {
  const node = pickNode(event.clientX, event.clientY);
  hoveredNode.value = node;
  if (node && wrapperEl.value) {
    const rect = wrapperEl.value.getBoundingClientRect();
    tooltip.value = {
      x: Math.min(event.clientX - rect.left + 12, rect.width - 160),
      y: event.clientY - rect.top + 12,
    };
    canvasEl.value!.style.cursor = "pointer";
  } else if (canvasEl.value) {
    canvasEl.value.style.cursor = "grab";
  }
  draw();
}

function onClick(event: MouseEvent) {
  // d3-drag/zoom suppress this event natively when the pointer travelled
  // beyond their clickDistance, so anything arriving here is a real click.
  emit("select", pickNode(event.clientX, event.clientY));
}

function resetView() {
  if (!d3 || !zoomBehavior || !canvasEl.value) return;
  d3.select(canvasEl.value)
    .transition()
    .duration(prefersReducedMotion() ? 0 : 400)
    .call(zoomBehavior.transform, d3.zoomIdentity);
}

function focusOnNode(id: string) {
  if (!d3 || !zoomBehavior || !canvasEl.value) return;
  const node = simNodes.find((n) => n.id === id);
  if (!node || node.x == null) return;
  const k = 1.6;
  const t = d3.zoomIdentity
    .translate(width / 2 - node.x! * k, height / 2 - node.y! * k)
    .scale(k);
  d3.select(canvasEl.value)
    .transition()
    .duration(prefersReducedMotion() ? 0 : 400)
    .call(zoomBehavior.transform, t);
}

function resize() {
  if (!wrapperEl.value || !canvasEl.value) return;
  const rect = wrapperEl.value.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  dpr = window.devicePixelRatio || 1;
  canvasEl.value.width = width * dpr;
  canvasEl.value.height = height * dpr;
  canvasEl.value.style.width = `${width}px`;
  canvasEl.value.style.height = `${height}px`;
  simulation?.force("center", d3?.forceCenter(width / 2, height / 2) ?? null);
  draw();
}

onMounted(async () => {
  const [force, selection, zoomMod, dragMod] = await Promise.all([
    import("d3-force"),
    import("d3-selection"),
    import("d3-zoom"),
    import("d3-drag"),
  ]);
  // d3-zoom's transitions need d3-transition side effects
  await import("d3-transition");
  d3 = {
    forceSimulation: force.forceSimulation,
    forceLink: force.forceLink,
    forceManyBody: force.forceManyBody,
    forceCollide: force.forceCollide,
    forceCenter: force.forceCenter,
    forceX: force.forceX,
    forceY: force.forceY,
    select: selection.select,
    zoom: zoomMod.zoom,
    zoomIdentity: zoomMod.zoomIdentity,
    drag: dragMod.drag,
  };
  transform = zoomMod.zoomIdentity;

  const canvas = canvasEl.value!;
  ctx = canvas.getContext("2d");
  readColors();
  resize();

  zoomBehavior = d3
    .zoom<HTMLCanvasElement, unknown>()
    .scaleExtent([0.25, 5])
    .clickDistance(8)
    .on("zoom", (event) => {
      transform = event.transform;
      draw();
    });

  let reheated = false;
  const dragBehavior = d3
    .drag<HTMLCanvasElement, unknown, SimNode>()
    .clickDistance(8)
    .subject((event) => {
      const [px, py] = [event.x, event.y];
      const x = transform!.invertX(px);
      const y = transform!.invertY(py);
      return simulation?.find(x, y, 18 / transform!.k) as SimNode;
    })
    .on("start", (event) => {
      // Pin only; don't wake the simulation for what may be a plain click.
      reheated = false;
      event.subject.fx = transform!.invertX(event.x);
      event.subject.fy = transform!.invertY(event.y);
    })
    .on("drag", (event) => {
      if (!reheated && !prefersReducedMotion()) {
        simulation?.alphaTarget(0.25).restart();
        reheated = true;
      }
      event.subject.fx = transform!.invertX(event.x);
      event.subject.fy = transform!.invertY(event.y);
      if (prefersReducedMotion()) {
        simulation?.tick(2);
        draw();
      }
    })
    .on("end", (event) => {
      if (reheated) simulation?.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      draw();
    });

  d3.select(canvas)
    .call(dragBehavior)
    .call(zoomBehavior)
    .on("dblclick.zoom", null);

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("click", onClick);

  buildSimulation();

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrapperEl.value!);

  themeObserver = new MutationObserver(() => {
    readColors();
    draw();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
});

watch(() => props.data, buildSimulation);
watch(() => props.dimmedIds, draw);
watch(
  () => props.focusId,
  (id) => {
    if (id) focusOnNode(id);
    draw();
  },
);

onBeforeUnmount(() => {
  simulation?.stop();
  resizeObserver?.disconnect();
  themeObserver?.disconnect();
  canvasEl.value?.removeEventListener("pointermove", onPointerMove);
  canvasEl.value?.removeEventListener("click", onClick);
});
</script>

<style scoped>
.kg-canvas-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
  background: var(--surface-subtle);
  overflow: hidden;
}
.kg-canvas-wrap canvas {
  display: block;
  touch-action: none;
}
.kg-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 5;
  max-width: 200px;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-card);
  font-size: 0.75rem;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.kg-tooltip span {
  color: var(--text-muted);
}
.kg-reset {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  z-index: 5;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kg-reset:hover {
  color: var(--text-primary);
  border-color: var(--color-primary);
}
</style>
