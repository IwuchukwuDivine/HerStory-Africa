<template>
  <div class="graph-page">
    <header class="graph-page__header">
      <h1 class="graph-page__title">The Connection Graph</h1>
      <p class="graph-page__intro">
        Every woman in the archive, linked to the organizations she built, the
        movements she carried, and the women she worked alongside. Drag, zoom,
        and click any dot to explore.
      </p>
      <p
        v-if="stats.women"
        class="graph-page__stats"
      >
        {{ stats.women }} women · {{ stats.organizations }} organizations ·
        {{ stats.movements }} movements · {{ stats.edges }} connections
      </p>
    </header>

    <div class="graph-page__controls">
      <FilterBy
        label="Era"
        :options="[...ERAS]"
        :model-value="eraFilter"
        @update:model-value="eraFilter = $event"
      />
      <FilterBy
        label="Region"
        :options="[...REGIONS]"
        :model-value="regionFilter"
        @update:model-value="regionFilter = $event"
      />
      <div class="graph-page__tools">
        <input
          v-model="searchText"
          class="graph-page__search"
          type="search"
          list="kg-node-names"
          placeholder="Find a woman, organization or movement..."
          aria-label="Find a node in the graph"
          @change="focusSearch"
        >
        <datalist id="kg-node-names">
          <option
            v-for="node in graphData.nodes"
            :key="node.id"
            :value="node.label"
          />
        </datalist>
        <label class="graph-page__toggle">
          <input
            v-model="similarityEdges"
            type="checkbox"
          >
          <span>Similarity links</span>
        </label>
        <label class="graph-page__toggle">
          <input
            v-model="includeUnconnected"
            type="checkbox"
          >
          <span>Show unconnected women</span>
        </label>
      </div>
    </div>

    <div class="graph-page__legend">
      <button
        v-for="entry in legend"
        :key="entry.type"
        type="button"
        class="graph-page__legend-item"
        :class="{ 'graph-page__legend-item--off': hiddenTypes.has(entry.type) }"
        @click="toggleType(entry.type)"
      >
        <span
          class="graph-page__legend-dot"
          :class="`graph-page__legend-dot--${entry.type}`"
        />
        {{ entry.label }} ({{ entry.count }})
      </button>
    </div>

    <div class="graph-page__stage">
      <ClientOnly>
        <KnowledgeGraph
          :data="graphData"
          :dimmed-ids="dimmedIds"
          :focus-id="focusId"
          @select="onSelect"
        />
        <template #fallback>
          <div class="graph-page__loading">Loading the graph...</div>
        </template>
      </ClientOnly>

      <aside
        v-if="selectedNode"
        class="graph-detail"
        aria-label="Selection details"
      >
        <button
          class="graph-detail__close"
          aria-label="Close details"
          @click="onSelect(null)"
        >
          <LucideX :size="16" />
        </button>
        <NuxtImg
          v-if="selectedWoman?.image"
          :src="selectedWoman.image"
          :alt="selectedNode.label"
          class="graph-detail__image"
          width="96"
          height="96"
        />
        <p class="graph-detail__type">{{ selectedNode.type }}</p>
        <h2 class="graph-detail__name">{{ selectedNode.label }}</h2>
        <p
          v-if="selectedWoman"
          class="graph-detail__summary"
        >
          {{ selectedWoman.summary }}
        </p>
        <NuxtLink
          v-if="selectedWoman"
          :to="`/women/${selectedWoman.slug}`"
          class="graph-detail__cta"
        >
          View profile
        </NuxtLink>
        <div
          v-if="neighbors.length"
          class="graph-detail__connections"
        >
          <h3>Connected to</h3>
          <ul>
            <li
              v-for="n in neighbors"
              :key="n.id"
            >
              <button
                type="button"
                @click="onSelect(n)"
              >
                {{ n.label }}
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <details class="graph-list">
      <summary>Browse the connections as a list</summary>
      <div class="graph-list__columns">
        <section
          v-for="group in listGroups"
          :key="group.title"
        >
          <h2>{{ group.title }}</h2>
          <div
            v-for="entity in group.entities"
            :key="entity.id"
            class="graph-list__entity"
          >
            <h3>{{ entity.label }}</h3>
            <ul>
              <li
                v-for="member in entity.members"
                :key="member.id"
              >
                <NuxtLink :to="`/women/${member.slug}`">
                  {{ member.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ERAS, REGIONS } from "~/utils/constants/content";
import type { GraphNode, GraphNodeType } from "~/utils/types/graph";

useSeoMeta({
  title: "Connection Graph",
  description:
    "An interactive knowledge graph linking African women in history to the organizations they built, the movements they led, and each other.",
});

const { ensureLoaded, buildGraph, womanDetails, women } = useKnowledgeGraph();

const eraFilter = ref("");
const regionFilter = ref("");
const searchText = ref("");
const similarityEdges = ref(false);
const includeUnconnected = ref(false);
const hiddenTypes = ref(new Set<GraphNodeType>());
const selectedNode = ref<GraphNode | null>(null);
const focusId = ref<string | null>(null);

onMounted(ensureLoaded);

const graphData = computed(() => {
  // Touch the women state so this recomputes once data loads.
  void women.value;
  return buildGraph({
    similarityEdges: similarityEdges.value,
    includeUnconnected: includeUnconnected.value,
  });
});

const stats = computed(() => {
  const nodes = graphData.value.nodes;
  return {
    women: nodes.filter((n) => n.type === "woman").length,
    organizations: nodes.filter((n) => n.type === "organization").length,
    movements: nodes.filter((n) => n.type === "movement").length,
    edges: graphData.value.edges.length,
  };
});

const legend = computed(() => [
  { type: "woman" as const, label: "Women", count: stats.value.women },
  {
    type: "organization" as const,
    label: "Organizations",
    count: stats.value.organizations,
  },
  { type: "movement" as const, label: "Movements", count: stats.value.movements },
]);

function toggleType(type: GraphNodeType) {
  const next = new Set(hiddenTypes.value);
  if (next.has(type)) next.delete(type);
  else next.add(type);
  hiddenTypes.value = next;
}

const dimmedIds = computed(() => {
  const dimmed = new Set<string>();
  for (const node of graphData.value.nodes) {
    if (hiddenTypes.value.has(node.type)) {
      dimmed.add(node.id);
      continue;
    }
    if (node.type !== "woman") continue;
    if (eraFilter.value && node.era !== eraFilter.value) dimmed.add(node.id);
    if (regionFilter.value && node.region !== regionFilter.value) {
      dimmed.add(node.id);
    }
  }
  return dimmed;
});

function onSelect(node: GraphNode | null) {
  selectedNode.value = node;
  focusId.value = node?.id ?? null;
}

function focusSearch() {
  const query = searchText.value.trim().toLowerCase();
  if (!query) return;
  const node = graphData.value.nodes.find(
    (n) => n.label.toLowerCase() === query,
  );
  if (node) onSelect(node);
}

const selectedWoman = computed(() => {
  const slug = selectedNode.value?.slug;
  return slug ? womanDetails(slug) : undefined;
});

const neighbors = computed<GraphNode[]>(() => {
  const id = selectedNode.value?.id;
  if (!id) return [];
  const byId = new Map(graphData.value.nodes.map((n) => [n.id, n]));
  const out: GraphNode[] = [];
  for (const edge of graphData.value.edges) {
    const otherId =
      edge.source === id ? edge.target : edge.target === id ? edge.source : null;
    if (!otherId) continue;
    const other = byId.get(otherId);
    if (other) out.push(other);
  }
  return out.sort((a, b) => a.label.localeCompare(b.label)).slice(0, 20);
});

const listGroups = computed(() => {
  const byId = new Map(graphData.value.nodes.map((n) => [n.id, n]));
  const build = (type: GraphNodeType, title: string) => ({
    title,
    entities: graphData.value.nodes
      .filter((n) => n.type === type)
      .sort((a, b) => b.degree - a.degree)
      .map((entity) => ({
        id: entity.id,
        label: entity.label,
        members: graphData.value.edges
          .filter((e) => e.source === entity.id || e.target === entity.id)
          .map((e) => byId.get(e.source === entity.id ? e.target : e.source))
          .filter((n): n is GraphNode => !!n && n.type === "woman")
          .sort((a, b) => a.label.localeCompare(b.label)),
      }))
      .filter((entity) => entity.members.length),
  });
  return [
    build("organization", "Organizations"),
    build("movement", "Movements"),
  ];
});
</script>

<style scoped>
.graph-page {
  max-width: 72rem;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.graph-page__title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}
.graph-page__intro {
  margin: 0;
  max-width: 46rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
.graph-page__stats {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.graph-page__controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.graph-page__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}
.graph-page__search {
  flex: 1 1 16rem;
  max-width: 24rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-primary);
  font-size: 0.875rem;
}
.graph-page__search:focus {
  outline: none;
  border-color: var(--color-primary);
}
.graph-page__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}
.graph-page__toggle input {
  accent-color: var(--color-primary);
}

.graph-page__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.graph-page__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  padding: 0.3125rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid var(--border-default);
  background: var(--surface-muted);
  color: var(--text-primary);
  cursor: pointer;
}
.graph-page__legend-item--off {
  opacity: 0.45;
}
.graph-page__legend-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 9999px;
}
.graph-page__legend-dot--woman {
  background: var(--color-primary);
}
.graph-page__legend-dot--organization {
  background: var(--color-secondary);
}
.graph-page__legend-dot--movement {
  background: var(--color-forest, #3c6e47);
}

.graph-page__stage {
  position: relative;
  height: 70vh;
  min-height: 420px;
}
.graph-page__loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
  background: var(--surface-subtle);
  color: var(--text-muted);
  font-size: 0.9375rem;
}

.graph-detail {
  position: absolute;
  z-index: 10;
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-elevated);
  padding: 1.25rem;
  overflow-y: auto;
  /* Mobile: bottom sheet */
  left: 0.5rem;
  right: 0.5rem;
  bottom: 0.5rem;
  max-height: 55%;
  border-radius: 0.75rem;
}
@media (min-width: 768px) {
  .graph-detail {
    /* Desktop: right-side card */
    left: auto;
    top: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
    width: 20rem;
    max-height: none;
  }
}
.graph-detail__close {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
}
.graph-detail__close:hover {
  color: var(--text-primary);
}
.graph-detail__image {
  width: 6rem;
  height: 6rem;
  border-radius: 0.75rem;
  object-fit: cover;
  margin-bottom: 0.75rem;
}
.graph-detail__type {
  margin: 0;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}
.graph-detail__name {
  margin: 0.125rem 0 0.5rem;
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--text-primary);
}
.graph-detail__summary {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--text-secondary);
}
.graph-detail__cta {
  display: inline-block;
  padding: 0.4375rem 1rem;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-on-primary);
  font-size: 0.8125rem;
  text-decoration: none;
}
.graph-detail__connections {
  margin-top: 1rem;
}
.graph-detail__connections h3 {
  margin: 0 0 0.375rem;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}
.graph-detail__connections ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
.graph-detail__connections button {
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  border: 1px solid var(--border-default);
  background: var(--surface-muted);
  color: var(--text-primary);
  cursor: pointer;
}
.graph-detail__connections button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.graph-list {
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--surface-subtle);
}
.graph-list summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-primary);
}
.graph-list__columns {
  display: grid;
  gap: 1.5rem;
  margin-top: 1rem;
}
@media (min-width: 768px) {
  .graph-list__columns {
    grid-template-columns: 1fr 1fr;
  }
}
.graph-list h2 {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  margin: 0 0 0.75rem;
  color: var(--text-primary);
}
.graph-list__entity {
  margin-bottom: 0.875rem;
}
.graph-list__entity h3 {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}
.graph-list__entity ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
}
.graph-list__entity a {
  font-size: 0.8125rem;
  color: var(--color-primary);
  text-decoration: none;
}
.graph-list__entity a:hover {
  text-decoration: underline;
}
</style>
