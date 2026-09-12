<template>
  <div class="opportunities">
    <header class="opportunities__header">
      <MuseumLabel
        level="h1"
        :eyebrow="`Opportunities · ${openCount} open`"
        title="Scholarships, jobs, grants and fellowships"
      />
      <p class="opportunities__intro">
        Open calls for African women to study, lead and build. Every listing
        links straight to the source, and expired ones are removed each week.
      </p>
    </header>

    <div class="opportunities__toolbar">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search by title or organisation…"
        class="opportunities__search"
      />

      <div class="opportunities__chips" role="group" aria-label="Filters">
        <FilterChip
          label="Category"
          :value="categoryLabel"
          :open="sheetOpen"
          @open="sheetOpen = true"
          @clear="activeCategory = ''"
        />
      </div>

      <div class="opportunities__count-row">
        <span class="opportunities__count" aria-live="polite">
          {{ filteredOpportunities.length }}
          {{ filteredOpportunities.length === 1 ? "opportunity" : "opportunities" }}
          · Featured first
        </span>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="opportunities__clear"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
    </div>

    <template v-if="filteredOpportunities.length">
      <div class="opportunities__grid">
        <OpportunityCard
          v-for="opp in visibleOpportunities"
          :key="opp.slug"
          :title="opp.title"
          :slug="opp.slug"
          :category="opp.category"
          :organization="opp.organization"
          :description="opp.description"
          :deadline="opp.deadline"
          :link="opp.link"
          :featured="opp.featured"
        />
      </div>

      <div v-if="showMore" class="opportunities__more">
        <button
          v-if="visibleOpportunities.length < filteredOpportunities.length"
          type="button"
          class="pill pill--lg pill--secondary"
          @click="pagesLoaded += 1"
        >
          Show {{ Math.min(PER_PAGE, filteredOpportunities.length - visibleOpportunities.length) }} more
        </button>
        <span class="opportunities__page-line">
          Page {{ Math.min(pagesLoaded, totalPages) }} of {{ totalPages }}
        </span>
      </div>

      <div v-if="showPagination" class="opportunities__pagination">
        <Pagination v-model="pagesLoaded" :total-pages="totalPages" />
      </div>
    </template>

    <div v-else class="panel opportunities__empty">
      <LucideSearchX :size="32" class="opportunities__empty-icon" />
      <p class="opportunities__empty-text">{{ emptyMessage }}</p>
      <Pill variant="secondary" @click="clearFilters">Clear filters</Pill>
    </div>

    <FilterSheet
      v-model="sheetCategory"
      :open="sheetOpen"
      title="Category"
      :options="categoryOptions"
      :result-count="filteredOpportunities.length"
      noun="opportunities"
      @close="sheetOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";

type Category = "scholarship" | "job" | "grant" | "fellowship";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "scholarship", label: "Scholarships" },
  { value: "job", label: "Jobs" },
  { value: "grant", label: "Grants" },
  { value: "fellowship", label: "Fellowships" },
];

const route = useRoute();
const router = useRouter();

const PER_PAGE = 9;

const initialCategory = (route.query.category as string) ?? "";
const activeCategory = ref<Category | "">(
  CATEGORIES.some((c) => c.value === initialCategory) ? (initialCategory as Category) : "",
);
const searchQuery = ref((route.query.q as string) ?? "");
const pagesLoaded = ref(Math.max(1, Number(route.query.page) || 1));
const sheetOpen = ref(false);

const { data: allOpportunities } = await useAsyncData("opportunities", () =>
  queryCollection("opportunities").all(),
);

type Opportunity = NonNullable<typeof allOpportunities.value>[number];

/*
 * Listings whose deadline has not passed (ongoing ones have no deadline).
 * The filter depends on the current time, so it only applies after mount:
 * otherwise the prerendered list and the first client render disagree.
 */
const now = ref<number | null>(null);
onMounted(() => {
  now.value = Date.now();
});

const activeOpportunities = computed(() => {
  const all = allOpportunities.value ?? [];
  if (now.value === null) return all;
  const current = now.value;
  return all.filter(
    (opp) => !opp.deadline || new Date(opp.deadline).getTime() >= current,
  );
});

const openCount = computed(() => activeOpportunities.value.length);

function matches(opp: Opportunity, skipCategory = false): boolean {
  const q = searchQuery.value.toLowerCase().trim();
  if (q && !opp.title.toLowerCase().includes(q) && !opp.organization.toLowerCase().includes(q)) return false;
  if (!skipCategory && activeCategory.value && opp.category !== activeCategory.value) return false;
  return true;
}

/** Featured first, then soonest deadline; ongoing listings close the list. */
const filteredOpportunities = computed(() =>
  activeOpportunities.value
    .filter((opp) => matches(opp))
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }),
);

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOpportunities.value.length / PER_PAGE)));

/* One list; mobile accumulates pages, desktop shows the current page. Before
   mount both behave the same for page 1, so hydration matches. */
const isDesktop = useMediaQuery("(min-width: 768px)");
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
const paged = computed(() => mounted.value && isDesktop.value);
const showMore = computed(() => !mounted.value || !isDesktop.value);
const showPagination = computed(() => !mounted.value || isDesktop.value);

const visibleOpportunities = computed(() => {
  if (paged.value) {
    const start = (pagesLoaded.value - 1) * PER_PAGE;
    return filteredOpportunities.value.slice(start, start + PER_PAGE);
  }
  return filteredOpportunities.value.slice(0, PER_PAGE * pagesLoaded.value);
});

/* The chip and sheet speak in labels; the URL and the filter speak in values. */
const categoryLabel = computed(
  () => CATEGORIES.find((c) => c.value === activeCategory.value)?.label ?? "",
);

const sheetCategory = computed({
  get: () => categoryLabel.value,
  set: (label: string) => {
    activeCategory.value = CATEGORIES.find((c) => c.label === label)?.value ?? "";
  },
});

const categoryOptions = computed(() => {
  const counts = new Map<Category, number>();
  for (const opp of activeOpportunities.value) {
    if (!matches(opp, true)) continue;
    counts.set(opp.category, (counts.get(opp.category) ?? 0) + 1);
  }
  return CATEGORIES.map((c) => ({ label: c.label, count: counts.get(c.value) ?? 0 }));
});

const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim() || activeCategory.value));

const emptyMessage = computed(() => {
  const q = searchQuery.value.trim();
  const parts = [q ? `“${q}”` : "", categoryLabel.value].filter(Boolean);
  if (!parts.length) return "No opportunities are open right now. New ones are added every week.";
  return `No opportunities match ${parts.join(" in ")} yet.`;
});

function syncUrl() {
  const query: Record<string, string> = {};
  if (searchQuery.value) query.q = searchQuery.value;
  if (activeCategory.value) query.category = activeCategory.value;
  if (pagesLoaded.value > 1) query.page = String(pagesLoaded.value);
  router.replace({ query });
}

watch([searchQuery, activeCategory], () => {
  pagesLoaded.value = 1;
  syncUrl();
});

watch(pagesLoaded, syncUrl);

watch(totalPages, (tp) => {
  if (pagesLoaded.value > tp) pagesLoaded.value = Math.max(1, tp);
});

function clearFilters() {
  searchQuery.value = "";
  activeCategory.value = "";
}

const pageDescription =
  "Scholarships, grants, fellowships, and jobs for African women to grow, lead, and make impact.";

useSeoMeta({
  title: "Opportunities",
  description: pageDescription,
  ogTitle: "Opportunities | HerStory Africa",
  ogDescription: pageDescription,
  ogUrl: getAbsoluteUrl("/opportunities"),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "Opportunities | HerStory Africa",
  twitterDescription: pageDescription,
});

defineOgImage("Card", {
  variant: "page",
  pill: "Opportunities",
  title: "Opportunities for African Women",
  description: pageDescription,
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/opportunities") }],
});
</script>

<style scoped>
.opportunities {
  --gutter: 24px;
  max-width: 64rem;
  margin: 0 auto;
  padding: 28px var(--gutter) 56px;
}

@media (min-width: 768px) {
  .opportunities {
    --gutter: 32px;
    padding-top: 40px;
    padding-bottom: 64px;
  }
}

.opportunities__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 4px;
}

.opportunities__intro {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

/* Sticky toolbar: full-bleed ground inside the gutter. */
.opportunities__toolbar {
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

.opportunities__search {
  max-width: 100%;
}

.opportunities__chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  margin: 0 calc(-1 * var(--gutter));
  padding: 2px var(--gutter);
}

.opportunities__chips::-webkit-scrollbar {
  display: none;
}

.opportunities__count-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 24px;
}

.opportunities__count {
  font-size: 13px;
  color: var(--text-muted);
}

.opportunities__clear {
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

.opportunities__clear:hover {
  text-decoration: underline;
}

.opportunities__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .opportunities__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .opportunities__grid {
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .opportunities__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.opportunities__more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 0 0;
}

.opportunities__page-line {
  font-size: 13px;
  color: var(--text-muted);
}

.opportunities__pagination {
  display: none;
}

@media (min-width: 768px) {
  .opportunities__more {
    display: none;
  }

  .opportunities__pagination {
    display: block;
  }
}

.opportunities__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 16px;
  text-align: center;
}

.opportunities__empty-icon {
  color: var(--text-muted);
}

.opportunities__empty-text {
  margin: 0;
  font-size: 16px;
  color: var(--text-secondary);
}
</style>
