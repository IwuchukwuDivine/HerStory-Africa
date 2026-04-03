<template>
  <div class="articles-listing">
    <header class="articles-listing__header">
      <h1 class="articles-listing__title">Articles & Explainers</h1>
      <p class="articles-listing__subtitle">
        {{ totalCount }} articles. Context, analysis, and the bigger picture.
      </p>
    </header>

    <div class="articles-listing__toolbar">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search articles…"
        class="articles-listing__search"
        @submit="currentPage = 1"
      />

      <button class="articles-listing__filter-toggle" @click="filtersOpen = !filtersOpen">
        <LucideSlidersHorizontal :size="16" />
        Filters
        <span v-if="activeFilterCount" class="articles-listing__filter-badge">{{ activeFilterCount }}</span>
        <LucideChevronDown :size="16" :class="{ 'articles-listing__chevron--open': filtersOpen }" />
      </button>

      <div class="articles-listing__filter-panel" :class="{ 'articles-listing__filter-panel--open': filtersOpen }">
        <div class="articles-listing__filter-panel-inner">
          <FilterBy
            v-model="activeCategory"
            label="Category"
            :options="[...ARTICLE_CATEGORIES]"
          />
          <FilterBy
            v-model="readFilter"
            label="Status"
            :options="['Read', 'Unread']"
            inline
          />
        </div>
      </div>
    </div>

    <div v-if="paginatedArticles.length" class="articles-listing__list">
      <ArticleCard
        v-for="article in paginatedArticles"
        :key="article.slug"
        :title="article.title"
        :description="article.description"
        :date="article.date"
        :slug="article.slug"
        :category="article.category"
        :image="article.image"
      />
    </div>

    <div v-else class="articles-listing__empty">
      <LucideSearchX :size="40" />
      <p>No articles match your current filters.</p>
      <button class="articles-listing__clear-btn" @click="clearFilters">
        Clear all filters
      </button>
    </div>

    <Pagination v-model="currentPage" :total-pages="totalPages" />
  </div>
</template>

<script setup lang="ts">
import { ARTICLE_CATEGORIES } from '~/utils/constants/content'

const route = useRoute()
const router = useRouter()

const PER_PAGE = 10
const searchQuery = ref((route.query.q as string) ?? '')
const activeCategory = ref((route.query.category as string) ?? '')
const readFilter = ref('')
const currentPage = ref(Number(route.query.page) || 1)
const filtersOpen = ref(false)

const activeFilterCount = computed(() =>
  [activeCategory.value, readFilter.value].filter(Boolean).length,
)

const { isRead } = useApp()

const { data: allArticles } = await useAsyncData('all-articles', () =>
  queryCollection('articles').order('date', 'DESC').all(),
)

const filteredArticles = computed(() => {
  if (!allArticles.value) return []

  return allArticles.value.filter((a) => {
    const q = searchQuery.value.toLowerCase().trim()
    if (q && !a.title.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) {
      return false
    }
    if (activeCategory.value && a.category !== activeCategory.value) return false
    if (readFilter.value === 'Read' && !isRead('article', a.slug)) return false
    if (readFilter.value === 'Unread' && isRead('article', a.slug)) return false
    return true
  })
})

const totalCount = computed(() => allArticles.value?.length ?? 0)
const totalPages = computed(() => Math.ceil(filteredArticles.value.length / PER_PAGE))

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE
  return filteredArticles.value.slice(start, start + PER_PAGE)
})

watch([searchQuery, activeCategory, readFilter], () => {
  currentPage.value = 1
  const query: Record<string, string> = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (activeCategory.value) query.category = activeCategory.value
  router.replace({ query })
})

watch(currentPage, (page) => {
  const query: Record<string, string> = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (activeCategory.value) query.category = activeCategory.value
  if (page > 1) query.page = String(page)
  router.replace({ query })
})

function clearFilters() {
  searchQuery.value = ''
  activeCategory.value = ''
  readFilter.value = ''
}

const articlesDescription =
  'Context, analysis, and the bigger picture behind the stories of African women who shaped history.'

useSeoMeta({
  title: 'Articles & Explainers',
  description: articlesDescription,
  ogTitle: 'Articles & Explainers',
  ogDescription: articlesDescription,
  ogImage: getAbsoluteUrl(),
  ogUrl: getAbsoluteUrl('/articles'),
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Articles & Explainers',
  twitterDescription: articlesDescription,
  twitterImage: getAbsoluteUrl(),
})

useHead({
  link: [{ rel: 'canonical', href: getAbsoluteUrl('/articles') }],
})
</script>

<style scoped>
.articles-listing {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .articles-listing {
    padding: 2.5rem 2rem 4rem;
  }
}

.articles-listing__header {
  margin-bottom: 2rem;
}

.articles-listing__title {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.articles-listing__subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0.375rem 0 0;
}

.articles-listing__toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.articles-listing__search {
  max-width: 100%;
}

.articles-listing__filter-toggle {
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

.articles-listing__filter-toggle:hover {
  border-color: var(--ring-default);
  color: var(--text-primary);
}

.articles-listing__filter-badge {
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

.articles-listing__chevron--open {
  transform: rotate(180deg);
}

.articles-listing__filter-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
  margin-top: -1rem;
}

.articles-listing__filter-panel-inner {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0;
  transition: padding-top 0.25s ease;
}

.articles-listing__filter-panel--open {
  grid-template-rows: 1fr;
  margin-top: 0;
}

.articles-listing__filter-panel--open .articles-listing__filter-panel-inner {
  padding-top: 0.25rem;
}

@media (min-width: 768px) {
  .articles-listing__filter-toggle {
    display: none;
  }

  .articles-listing__filter-panel {
    grid-template-rows: 1fr;
    margin-top: 0;
  }

  .articles-listing__filter-panel-inner {
    overflow: visible;
    padding-top: 0;
  }
}

.articles-listing__list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.articles-listing__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.articles-listing__empty p {
  margin: 0;
  font-size: 1rem;
}

.articles-listing__clear-btn {
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

.articles-listing__clear-btn:hover {
  border-color: var(--ring-default);
  color: var(--color-primary);
}
</style>
