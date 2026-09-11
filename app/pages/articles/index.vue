<template>
  <div class="articles-listing">
    <header class="articles-listing__header">
      <MuseumLabel level="h1" eyebrow="Articles" title="Explainers and essays" />
    </header>

    <div class="articles-listing__toolbar">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search articles…"
        class="articles-listing__search"
      />

      <div class="articles-listing__chips" role="group" aria-label="Filters">
        <FilterChip
          label="Category"
          :value="activeCategory"
          :open="sheetOpen"
          @open="sheetOpen = true"
          @clear="activeCategory = ''"
        />
        <FilterChip
          label="Unread"
          toggle
          :active="unreadOnly"
          @toggle="unreadOnly = !unreadOnly"
        />
      </div>

      <div class="articles-listing__count-row">
        <span class="articles-listing__count" aria-live="polite">
          {{ filteredArticles.length }} {{ filteredArticles.length === 1 ? "article" : "articles" }} · Newest first
        </span>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="articles-listing__clear"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
    </div>

    <template v-if="filteredArticles.length">
      <div class="articles-listing__list">
        <ArticleRow
          v-for="article in visibleArticles"
          :key="article.slug"
          :title="article.title"
          :slug="article.slug"
          :category="article.category"
          :image="article.image"
          :reading-time="article.readingTime"
          size="lg"
        />
      </div>

      <div v-if="showMore" class="articles-listing__more">
        <button
          v-if="visibleArticles.length < filteredArticles.length"
          type="button"
          class="pill pill--lg pill--secondary"
          @click="pagesLoaded += 1"
        >
          Show {{ Math.min(PER_PAGE, filteredArticles.length - visibleArticles.length) }} more
        </button>
        <span class="articles-listing__page-line">
          Page {{ Math.min(pagesLoaded, totalPages) }} of {{ totalPages }}
        </span>
      </div>

      <div v-if="showPagination" class="articles-listing__pagination">
        <Pagination v-model="pagesLoaded" :total-pages="totalPages" />
      </div>
    </template>

    <div v-else class="panel articles-listing__empty">
      <LucideSearchX :size="32" class="articles-listing__empty-icon" />
      <p class="articles-listing__empty-text">{{ emptyMessage }}</p>
      <Pill variant="secondary" @click="clearFilters">Clear all filters</Pill>
    </div>

    <FilterSheet
      v-model="activeCategory"
      :open="sheetOpen"
      title="Category"
      :options="categoryOptions"
      :result-count="filteredArticles.length"
      noun="articles"
      @close="sheetOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { ARTICLE_CATEGORIES } from "~/utils/constants/content";

const route = useRoute();
const router = useRouter();

const PER_PAGE = 10;
const searchQuery = ref((route.query.q as string) ?? "");
const activeCategory = ref((route.query.category as string) ?? "");
const unreadOnly = ref(false);
const pagesLoaded = ref(Math.max(1, Number(route.query.page) || 1));
const sheetOpen = ref(false);

const { isRead } = useApp();

const { data: allArticles } = await useAsyncData("all-articles", () =>
  queryCollection("articles").order("date", "DESC").all(),
);

type Article = NonNullable<typeof allArticles.value>[number];

function matches(a: Article, skipCategory = false): boolean {
  const q = searchQuery.value.toLowerCase().trim();
  if (q && !a.title.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) return false;
  if (!skipCategory && activeCategory.value && a.category !== activeCategory.value) return false;
  if (unreadOnly.value && isRead("article", a.slug)) return false;
  return true;
}

const filteredArticles = computed(() => (allArticles.value ?? []).filter((a) => matches(a)));

const totalCount = computed(() => allArticles.value?.length ?? 0);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredArticles.value.length / PER_PAGE)));

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

const visibleArticles = computed(() => {
  if (paged.value) {
    const start = (pagesLoaded.value - 1) * PER_PAGE;
    return filteredArticles.value.slice(start, start + PER_PAGE);
  }
  return filteredArticles.value.slice(0, PER_PAGE * pagesLoaded.value);
});

const categoryOptions = computed(() => {
  const counts = new Map<string, number>();
  for (const a of allArticles.value ?? []) {
    if (!matches(a, true)) continue;
    counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  }
  const known = new Set<string>(ARTICLE_CATEGORIES);
  const extra = [...counts.keys()].filter((c) => !known.has(c)).sort();
  return [...ARTICLE_CATEGORIES, ...extra].map((c) => ({ label: c, count: counts.get(c) ?? 0 }));
});

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value.trim() || activeCategory.value || unreadOnly.value),
);

const emptyMessage = computed(() => {
  const q = searchQuery.value.trim();
  const parts = [q ? `“${q}”` : "", activeCategory.value].filter(Boolean);
  if (!parts.length) return "No articles match your current filters.";
  return `No articles match ${parts.join(" in ")} yet.`;
});

function syncUrl() {
  const query: Record<string, string> = {};
  if (searchQuery.value) query.q = searchQuery.value;
  if (activeCategory.value) query.category = activeCategory.value;
  if (pagesLoaded.value > 1) query.page = String(pagesLoaded.value);
  router.replace({ query });
}

watch([searchQuery, activeCategory, unreadOnly], () => {
  pagesLoaded.value = 1;
  syncUrl();
});

watch(pagesLoaded, syncUrl);

function clearFilters() {
  searchQuery.value = "";
  activeCategory.value = "";
  unreadOnly.value = false;
}

const articlesDescription =
  "Context, analysis, and the bigger picture behind the stories of African women who shaped history.";

const articlesTitle = computed(
  () => `${totalCount.value} Articles on African Women's History`,
);

const hasQueryFilters = computed(() =>
  Boolean(route.query.q || route.query.category || route.query.page),
);

useSeoMeta({
  title: articlesTitle,
  description: articlesDescription,
  ogTitle: articlesTitle,
  ogDescription: articlesDescription,
  ogUrl: getAbsoluteUrl("/articles"),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: articlesTitle,
  twitterDescription: articlesDescription,
  robots: () =>
    hasQueryFilters.value ? "noindex, follow" : "index, follow",
});

defineOgImage("Card", {
  variant: "page",
  pill: "Articles",
  title: "Explainers and essays",
  description: articlesDescription,
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/articles") }],
});
</script>

<style scoped>
.articles-listing {
  --gutter: 24px;
  max-width: 48rem;
  margin: 0 auto;
  padding: 28px var(--gutter) 56px;
}

@media (min-width: 768px) {
  .articles-listing {
    --gutter: 32px;
    padding-top: 40px;
    padding-bottom: 64px;
  }
}

.articles-listing__header {
  margin-bottom: 4px;
}

.articles-listing__toolbar {
  position: sticky;
  top: var(--navbar-height, 61px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 calc(-1 * var(--gutter)) 8px;
  padding: 16px var(--gutter) 12px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
}

.articles-listing__search {
  max-width: 100%;
}

.articles-listing__chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  margin: 0 calc(-1 * var(--gutter));
  padding: 2px var(--gutter);
}

.articles-listing__chips::-webkit-scrollbar {
  display: none;
}

.articles-listing__count-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 24px;
}

.articles-listing__count {
  font-size: 13px;
  color: var(--text-muted);
}

.articles-listing__clear {
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

.articles-listing__clear:hover {
  text-decoration: underline;
}

.articles-listing__list {
  display: flex;
  flex-direction: column;
}

.articles-listing__more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 0 0;
}

.articles-listing__page-line {
  font-size: 13px;
  color: var(--text-muted);
}

.articles-listing__pagination {
  display: none;
}

@media (min-width: 768px) {
  .articles-listing__more {
    display: none;
  }

  .articles-listing__pagination {
    display: block;
  }
}

.articles-listing__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 32px 16px;
  text-align: center;
}

.articles-listing__empty-icon {
  color: var(--text-muted);
}

.articles-listing__empty-text {
  margin: 0;
  font-size: 16px;
  color: var(--text-secondary);
}
</style>
