<template>
  <div class="opportunities">
    <header class="opportunities__header">
      <h1 class="opportunities__title">Opportunities for African Women</h1>
      <p class="opportunities__subtitle">
        Scholarships, grants, fellowships, and jobs to grow, lead, and make
        impact.
      </p>
    </header>

    <div class="opportunities__toolbar">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search by title or organization…"
        class="opportunities__search"
        @submit="currentPage = 1"
      />

      <div class="opportunities__categories">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="opportunities__cat-pill"
          :class="{
            'opportunities__cat-pill--active': activeCategory === cat.value,
          }"
          @click="activeCategory = cat.value"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <div v-if="filteredOpportunities.length" class="opportunities__grid">
      <OpportunityCard
        v-for="opp in paginatedOpportunities"
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

    <div v-else class="opportunities__empty">
      <LucideSearchX :size="40" />
      <p>No opportunities match your current filters.</p>
      <button class="opportunities__clear-btn" @click="clearFilters">
        Clear filters
      </button>
    </div>

    <Pagination v-model="currentPage" :total-pages="totalPages" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const PER_PAGE = 9;

const categories = [
  { value: "", label: "All" },
  { value: "scholarship", label: "Scholarships" },
  { value: "job", label: "Jobs" },
  { value: "grant", label: "Grants" },
  { value: "fellowship", label: "Fellowships" },
] as const;

const initialCategory = (route.query.category as string) ?? "";
const activeCategory = ref(
  categories.some((c) => c.value === initialCategory) ? initialCategory : "",
);

const searchQuery = ref((route.query.q as string) ?? "");
const currentPage = ref(Number(route.query.page) || 1);

const { data: allOpportunities } = await useAsyncData("opportunities", () =>
  queryCollection("opportunities").all(),
);

const activeOpportunities = computed(() => {
  if (!allOpportunities.value) return [];
  const now = Date.now();
  return allOpportunities.value.filter((opp) => {
    if (!opp.deadline) return true;
    return new Date(opp.deadline).getTime() >= now;
  });
});

const filteredOpportunities = computed(() => {
  let list = activeOpportunities.value;

  if (activeCategory.value) {
    list = list.filter((opp) => opp.category === activeCategory.value);
  }

  const q = searchQuery.value.toLowerCase().trim();
  if (q) {
    list = list.filter(
      (opp) =>
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q),
    );
  }

  return list.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredOpportunities.value.length / PER_PAGE),
);

const paginatedOpportunities = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE;
  return filteredOpportunities.value.slice(start, start + PER_PAGE);
});

function syncUrl() {
  const query: Record<string, string> = {};
  if (searchQuery.value) query.q = searchQuery.value;
  if (activeCategory.value) query.category = activeCategory.value;
  if (currentPage.value > 1) query.page = String(currentPage.value);
  router.replace({ query });
}

watch([searchQuery, activeCategory], () => {
  currentPage.value = 1;
  syncUrl();
});

watch(currentPage, syncUrl);

watch(totalPages, (tp) => {
  if (currentPage.value > tp) {
    currentPage.value = Math.max(1, tp);
  }
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
  ogTitle: "Opportunities — HerStory Africa",
  ogDescription: pageDescription,
  ogImage: getAbsoluteUrl(),
  ogUrl: getAbsoluteUrl("/opportunities"),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "Opportunities — HerStory Africa",
  twitterDescription: pageDescription,
  twitterImage: getAbsoluteUrl(),
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/opportunities") }],
});
</script>

<style scoped>
.opportunities {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .opportunities {
    padding: 2.5rem 2rem 4rem;
  }
}

.opportunities__header {
  margin-bottom: 2rem;
}

.opportunities__title {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.opportunities__subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0.375rem 0 0;
  max-width: 40rem;
}

.opportunities__count {
  display: inline-block;
  font-weight: 700;
  color: var(--color-primary);
}

.opportunities__toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.opportunities__search {
  max-width: 100%;
}

.opportunities__categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.opportunities__cat-pill {
  padding: 0.4375rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.opportunities__cat-pill:hover {
  border-color: var(--ring-default);
  color: var(--text-primary);
}

.opportunities__cat-pill--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
}

.opportunities__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .opportunities__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 960px) {
  .opportunities__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.opportunities__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.opportunities__empty p {
  margin: 0;
  font-size: 1rem;
}

.opportunities__clear-btn {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.opportunities__clear-btn:hover {
  border-color: var(--ring-default);
  color: var(--color-primary);
}
</style>
