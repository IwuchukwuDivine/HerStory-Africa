<template>
  <div class="women-listing">
    <header class="women-listing__header">
      <MuseumLabel level="h1" eyebrow="The archive" :title="`${totalCount} women`" />
      <ClientOnly>
        <ExplorationProgress :total="totalCount" />
      </ClientOnly>
    </header>

    <div class="women-listing__toolbar">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search by name or country…"
        class="women-listing__search"
      />

      <div class="women-listing__chips" role="group" aria-label="Filters">
        <FilterChip
          label="Region"
          :value="activeRegion"
          :open="openSheet === 'region'"
          @open="openSheet = 'region'"
          @clear="activeRegion = ''"
        />
        <FilterChip
          label="Era"
          :value="activeEra"
          :open="openSheet === 'era'"
          @open="openSheet = 'era'"
          @clear="activeEra = ''"
        />
        <FilterChip
          label="Cause"
          :value="activeCause"
          :open="openSheet === 'cause'"
          @open="openSheet = 'cause'"
          @clear="activeCause = ''"
        />
        <FilterChip
          label="Unread"
          toggle
          :active="unreadOnly"
          @toggle="unreadOnly = !unreadOnly"
        />
      </div>

      <div class="women-listing__count-row">
        <span class="women-listing__count" aria-live="polite">
          {{ filteredWomen.length }} {{ filteredWomen.length === 1 ? "woman" : "women" }} · A to Z
        </span>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="women-listing__clear"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
    </div>

    <template v-if="filteredWomen.length">
      <!-- Mobile: compact 2-up grid, loaded 24 at a time. -->
      <div v-if="showCompact" class="women-listing__mobile">
        <div class="compact-grid">
          <WomanCardCompact
            v-for="(woman, i) in loadedWomen"
            :key="woman.slug"
            :name="woman.name"
            :slug="woman.slug"
            :image="woman.image"
            :country="woman.country"
            :born="woman.born"
            :died="woman.died"
            :era="woman.era"
            :focal="woman.ogFocal"
            :priority="i < 2"
          />
        </div>

        <div class="women-listing__more">
          <button
            v-if="loadedWomen.length < filteredWomen.length"
            type="button"
            class="pill pill--lg pill--secondary"
            @click="pagesLoaded += 1"
          >
            Show {{ Math.min(PER_PAGE, filteredWomen.length - loadedWomen.length) }} more
          </button>
          <span class="women-listing__page-line">
            Page {{ Math.min(pagesLoaded, totalPages) }} of {{ totalPages }} ·
            <NuxtLink to="/women/all">Browse A to Z instead</NuxtLink>
          </span>
        </div>
      </div>

      <!-- Desktop: full cards, three up, numbered pagination. -->
      <div v-if="showFull" class="women-listing__desktop">
        <div class="women-listing__grid">
          <WomanCard
            v-for="woman in pagedWomen"
            :key="woman.slug"
            :name="woman.name"
            :slug="woman.slug"
            :image="woman.image"
            :country="woman.country"
            :born="woman.born"
            :died="woman.died"
            :era="woman.era"
            :summary="woman.summary"
            :causes="woman.causes"
          />
        </div>
        <Pagination v-model="pagesLoaded" :total-pages="totalPages" />
      </div>
    </template>

    <div v-else class="panel women-listing__empty">
      <LucideSearchX :size="32" class="women-listing__empty-icon" />
      <p class="women-listing__empty-text">{{ emptyMessage }}</p>
      <Pill variant="secondary" @click="clearFilters">Clear all filters</Pill>
      <NuxtLink to="/suggest" class="women-listing__suggest">Suggest a woman →</NuxtLink>
    </div>

    <FilterSheet
      v-model="activeRegion"
      :open="openSheet === 'region'"
      title="Region"
      :options="regionOptions"
      :result-count="filteredWomen.length"
      @close="openSheet = null"
    />
    <FilterSheet
      v-model="activeEra"
      :open="openSheet === 'era'"
      title="Era"
      :options="eraOptions"
      :result-count="filteredWomen.length"
      @close="openSheet = null"
    />
    <FilterSheet
      v-model="activeCause"
      :open="openSheet === 'cause'"
      title="Cause"
      :options="causeOptions"
      :result-count="filteredWomen.length"
      @close="openSheet = null"
    />
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { REGIONS, ERAS } from "~/utils/constants/content";

type Facet = "region" | "era" | "cause";

const route = useRoute();
const router = useRouter();

const PER_PAGE = 24;

const searchQuery = ref((route.query.q as string) ?? "");
const activeRegion = ref((route.query.region as string) ?? "");
const activeEra = ref((route.query.era as string) ?? "");
const activeCause = ref((route.query.cause as string) ?? "");
const unreadOnly = ref(false);
const pagesLoaded = ref(Math.max(1, Number(route.query.page) || 1));
const openSheet = ref<Facet | null>(null);

const { isRead } = useApp();

const { data: allWomen } = await useAsyncData("all-women", () =>
  queryCollection("women")
    .select(
      "name",
      "slug",
      "image",
      "country",
      "region",
      "born",
      "died",
      "era",
      "summary",
      "causes",
      "dateAdded",
      "ogFocal",
    )
    .order("name", "ASC")
    .all(),
);

type Woman = NonNullable<typeof allWomen.value>[number];

/** Does the woman pass every active filter except the one being skipped? */
function matches(w: Woman, skip?: Facet): boolean {
  const q = searchQuery.value.toLowerCase().trim();
  if (q && !w.name.toLowerCase().includes(q) && !w.country.toLowerCase().includes(q)) return false;
  if (skip !== "region" && activeRegion.value && w.region !== activeRegion.value) return false;
  if (skip !== "era" && activeEra.value && w.era !== activeEra.value) return false;
  if (skip !== "cause" && activeCause.value && !w.causes.includes(activeCause.value)) return false;
  if (unreadOnly.value && isRead("woman", w.slug)) return false;
  return true;
}

const filteredWomen = computed(() => (allWomen.value ?? []).filter((w) => matches(w)));

const totalCount = computed(() => allWomen.value?.length ?? 0);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredWomen.value.length / PER_PAGE)));

/** Mobile: everything up to the current page. */
const loadedWomen = computed(() => filteredWomen.value.slice(0, PER_PAGE * pagesLoaded.value));
/** Desktop: just the current page. */
const pagedWomen = computed(() => {
  const start = (pagesLoaded.value - 1) * PER_PAGE;
  return filteredWomen.value.slice(start, start + PER_PAGE);
});

/* Both grids render on the server and CSS shows one; after mount the unused
   one is dropped so its cards (and Pagination's scroll watcher) go away. */
const isDesktop = useMediaQuery("(min-width: 768px)");
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
const showCompact = computed(() => !mounted.value || !isDesktop.value);
const showFull = computed(() => !mounted.value || isDesktop.value);

/* Facet counts reflect every other active filter plus the search. */
function countBy(skip: Facet, pick: (w: Woman) => string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const w of allWomen.value ?? []) {
    if (!matches(w, skip)) continue;
    for (const key of pick(w)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

const regionOptions = computed(() => {
  const counts = countBy("region", (w) => [w.region]);
  return REGIONS.map((r) => ({ label: r, count: counts.get(r) ?? 0 }));
});

const eraOptions = computed(() => {
  const counts = countBy("era", (w) => [w.era]);
  return ERAS.map((e) => ({ label: e, count: counts.get(e) ?? 0 }));
});

const causeOptions = computed(() => {
  const counts = countBy("cause", (w) => w.causes);
  return causeHubs(allWomen.value ?? [], 1).map((h) => ({
    label: h.cause,
    count: counts.get(h.cause) ?? 0,
  }));
});

const hasActiveFilters = computed(() =>
  Boolean(
    searchQuery.value.trim() ||
      activeRegion.value ||
      activeEra.value ||
      activeCause.value ||
      unreadOnly.value,
  ),
);

const emptyMessage = computed(() => {
  const q = searchQuery.value.trim();
  const parts = [q ? `“${q}”` : "", activeEra.value, activeCause.value].filter(Boolean);
  const region = activeRegion.value;
  if (!parts.length && !region) return "No women match your current filters.";
  if (!parts.length) return `No women in ${region} match your current filters.`;
  return `No women match ${parts.join(" and ")}${region ? ` in ${region}` : ""} yet.`;
});

function syncUrl() {
  const query: Record<string, string> = {};
  if (searchQuery.value) query.q = searchQuery.value;
  if (activeRegion.value) query.region = activeRegion.value;
  if (activeEra.value) query.era = activeEra.value;
  if (activeCause.value) query.cause = activeCause.value;
  if (pagesLoaded.value > 1) query.page = String(pagesLoaded.value);
  router.replace({ query });
}

watch([searchQuery, activeRegion, activeEra, activeCause, unreadOnly], () => {
  pagesLoaded.value = 1;
  syncUrl();
});

watch(pagesLoaded, syncUrl);

function clearFilters() {
  searchQuery.value = "";
  activeRegion.value = "";
  activeEra.value = "";
  activeCause.value = "";
  unreadOnly.value = false;
}

const womenDescription =
  "Browse the full archive of African women who shaped history. Filter by region, era, or cause.";

const hasQueryFilters = computed(() =>
  Boolean(
    route.query.q ||
      route.query.region ||
      route.query.era ||
      route.query.cause ||
      route.query.page,
  ),
);

const womenTitle = computed(
  () => `Explore ${totalCount.value} African Women in History`,
);

useSeoMeta({
  title: womenTitle,
  description: womenDescription,
  ogTitle: womenTitle,
  ogDescription: womenDescription,
  ogUrl: getAbsoluteUrl("/women"),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: womenTitle,
  twitterDescription: womenDescription,
  robots: () =>
    hasQueryFilters.value ? "noindex, follow" : "index, follow",
});

defineOgImage("Card", {
  variant: "page",
  pill: "The archive",
  title: () => `${totalCount.value} women`,
  description: womenDescription,
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/women") }],
});
</script>

<style scoped>
.women-listing {
  --gutter: 24px;
  max-width: 64rem;
  margin: 0 auto;
  padding: 28px var(--gutter) 56px;
}

@media (min-width: 768px) {
  .women-listing {
    --gutter: 32px;
    padding-top: 40px;
    padding-bottom: 64px;
  }
}

.women-listing__header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 4px;
}

/* Sticky toolbar: full-bleed ground inside the gutter. */
.women-listing__toolbar {
  position: sticky;
  top: var(--navbar-height, 61px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 calc(-1 * var(--gutter)) 20px;
  padding: 16px var(--gutter) 12px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
}

.women-listing__search {
  max-width: 100%;
}

.women-listing__chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  margin: 0 calc(-1 * var(--gutter));
  padding: 2px var(--gutter);
}

.women-listing__chips::-webkit-scrollbar {
  display: none;
}

.women-listing__count-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 24px;
}

.women-listing__count {
  font-size: 13px;
  color: var(--text-muted);
}

.women-listing__clear {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin: -10px 0;
  padding: 0 4px;
  border: none;
  background: none;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
}

.women-listing__clear:hover {
  text-decoration: underline;
}

/* Mobile vs desktop grids: CSS decides first, JS prunes after mount. */
.women-listing__desktop {
  display: none;
}

@media (min-width: 768px) {
  .women-listing__mobile {
    display: none;
  }

  .women-listing__desktop {
    display: block;
  }
}

.women-listing__more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 0 0;
}

.women-listing__page-line {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

.women-listing__page-line a {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.women-listing__page-line a:hover {
  text-decoration: underline;
}

.women-listing__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.women-listing__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 16px;
  text-align: center;
}

.women-listing__empty-icon {
  color: var(--text-muted);
}

.women-listing__empty-text {
  margin: 0;
  font-size: 16px;
  color: var(--text-secondary);
}

.women-listing__suggest {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.women-listing__suggest:hover {
  text-decoration: underline;
}
</style>
