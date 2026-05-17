<template>
  <div class="women-listing">
    <header class="women-listing__header">
      <div class="women-listing__header-top">
        <div>
          <h1 class="women-listing__title">Women of HerStory Africa</h1>
          <p class="women-listing__subtitle">
            {{ totalCount }} women across the archive. Search, filter, and
            explore.
          </p>
        </div>
      </div>

      <ClientOnly>
        <ExplorationProgress :total="totalCount" />
      </ClientOnly>
    </header>

    <div class="women-listing__toolbar">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search by name or country…"
        class="women-listing__search"
        @submit="currentPage = 1"
      />

      <button
        class="women-listing__filter-toggle"
        @click="filtersOpen = !filtersOpen"
      >
        <LucideSlidersHorizontal :size="16" />
        Filters
        <span v-if="activeFilterCount" class="women-listing__filter-badge">{{
          activeFilterCount
        }}</span>
        <LucideChevronDown
          :size="16"
          :class="{ 'women-listing__chevron--open': filtersOpen }"
        />
      </button>

      <div
        class="women-listing__filter-panel"
        :class="{ 'women-listing__filter-panel--open': filtersOpen }"
      >
        <div class="women-listing__filter-panel-inner">
          <div class="women-listing__filters">
            <FilterBy
              v-model="activeRegion"
              label="Region"
              :options="[...REGIONS]"
            />
            <FilterBy v-model="activeEra" label="Era" :options="[...ERAS]" />
          </div>

          <FilterBy
            v-model="readFilter"
            label="Status"
            :options="['Read', 'Unread']"
            inline
          />
        </div>
      </div>
    </div>

    <div v-if="paginatedWomen.length" class="women-listing__grid">
      <WomanCard
        v-for="woman in paginatedWomen"
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

    <div v-else class="women-listing__empty">
      <LucideSearchX :size="40" />
      <p>No women match your current filters.</p>
      <button class="women-listing__clear-btn" @click="clearFilters">
        Clear all filters
      </button>
    </div>

    <Pagination v-model="currentPage" :total-pages="totalPages" />
  </div>
</template>

<script setup lang="ts">
import { REGIONS, ERAS } from "~/utils/constants/content";

const route = useRoute();
const router = useRouter();

const PER_PAGE = 9;

const searchQuery = ref((route.query.q as string) ?? "");
const activeRegion = ref((route.query.region as string) ?? "");
const activeEra = ref((route.query.era as string) ?? "");
const activeCause = ref((route.query.cause as string) ?? "");
const readFilter = ref("");
const currentPage = ref(Number(route.query.page) || 1);
const filtersOpen = ref(false);

const activeFilterCount = computed(
  () =>
    [
      activeRegion.value,
      activeEra.value,
      activeCause.value,
      readFilter.value,
    ].filter(Boolean).length,
);

const { isRead } = useApp();

const { data: allWomen } = await useAsyncData("all-women", () =>
  queryCollection("women").order("name", "ASC").all(),
);

const filteredWomen = computed(() => {
  if (!allWomen.value) return [];

  return allWomen.value.filter((w) => {
    const q = searchQuery.value.toLowerCase().trim();
    if (
      q &&
      !w.name.toLowerCase().includes(q) &&
      !w.country.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (activeRegion.value && w.region !== activeRegion.value) return false;
    if (activeEra.value && w.era !== activeEra.value) return false;
    if (activeCause.value && !w.causes.some((c) => c === activeCause.value))
      return false;
    if (readFilter.value === "Read" && !isRead("woman", w.slug)) return false;
    if (readFilter.value === "Unread" && isRead("woman", w.slug)) return false;
    return true;
  });
});

const totalCount = computed(() => allWomen.value?.length ?? 0);
const totalPages = computed(() =>
  Math.ceil(filteredWomen.value.length / PER_PAGE),
);

const paginatedWomen = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE;
  return filteredWomen.value.slice(start, start + PER_PAGE);
});

function syncUrl() {
  const query: Record<string, string> = {};
  if (searchQuery.value) query.q = searchQuery.value;
  if (activeRegion.value) query.region = activeRegion.value;
  if (activeEra.value) query.era = activeEra.value;
  if (activeCause.value) query.cause = activeCause.value;
  if (currentPage.value > 1) query.page = String(currentPage.value);
  router.replace({ query });
}

watch([searchQuery, activeRegion, activeEra, activeCause, readFilter], () => {
  currentPage.value = 1;
  syncUrl();
});

watch(currentPage, syncUrl);

function clearFilters() {
  searchQuery.value = "";
  activeRegion.value = "";
  activeEra.value = "";
  activeCause.value = "";
  readFilter.value = "";
}

const womenDescription =
  "Browse the full archive of African women who shaped history — filter by region, era, or cause.";

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
  ogImage: getAbsoluteUrl(),
  ogUrl: getAbsoluteUrl("/women"),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: womenTitle,
  twitterDescription: womenDescription,
  twitterImage: getAbsoluteUrl(),
  robots: () =>
    hasQueryFilters.value ? "noindex, follow" : "index, follow",
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/women") }],
});
</script>

<style scoped>
.women-listing {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .women-listing {
    padding: 2.5rem 2rem 4rem;
  }
}

.women-listing__header {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.women-listing__header-top {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .women-listing__header-top {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
  }
}

.women-listing__title {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.women-listing__subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0.375rem 0 0;
}

.women-listing__toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.women-listing__search {
  max-width: 100%;
}

.women-listing__filter-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  align-self: flex-start;
}

.women-listing__filter-toggle:hover {
  border-color: var(--ring-default);
  color: var(--text-primary);
}

.women-listing__filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.women-listing__chevron--open {
  transform: rotate(180deg);
}

.women-listing__filter-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
  margin-top: -1rem;
}

.women-listing__filter-panel-inner {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0;
  transition: padding-top 0.25s ease;
}

.women-listing__filter-panel--open {
  grid-template-rows: 1fr;
  margin-top: 0;
}

.women-listing__filter-panel--open .women-listing__filter-panel-inner {
  padding-top: 0.25rem;
}

@media (min-width: 768px) {
  .women-listing__filter-toggle {
    display: none;
  }

  .women-listing__filter-panel {
    grid-template-rows: 1fr;
    margin-top: 0;
  }

  .women-listing__filter-panel-inner {
    overflow: visible;
    padding-top: 0;
  }
}

.women-listing__filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
}

@media (min-width: 640px) {
  .women-listing__filters {
    flex-direction: row;
    gap: 2rem;
    padding-top: 0;
  }
}

.women-listing__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 480px) {
  .women-listing__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .women-listing__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

.women-listing__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.women-listing__empty p {
  margin: 0;
  font-size: 1rem;
}

.women-listing__clear-btn {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  transition: all 0.15s ease;
}

.women-listing__clear-btn:hover {
  border-color: var(--ring-default);
  color: var(--color-primary);
}
</style>
