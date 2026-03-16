<template>
  <div class="favorites">
    <header class="favorites__header">
      <h1 class="favorites__title">Your Favorites</h1>
      <p class="favorites__subtitle">
        {{ totalCount }} saved across women and articles.
      </p>
    </header>

    <div class="favorites__tabs">
      <button
        class="favorites__tab"
        :class="{ 'favorites__tab--active': activeTab === 'women' }"
        @click="activeTab = 'women'"
      >
        <LucideUsers :size="16" />
        Women
        <span v-if="favWomenList.length" class="favorites__badge">
          {{ favWomenList.length }}
        </span>
      </button>
      <button
        class="favorites__tab"
        :class="{ 'favorites__tab--active': activeTab === 'articles' }"
        @click="activeTab = 'articles'"
      >
        <LucideBookOpen :size="16" />
        Articles
        <span v-if="favArticlesList.length" class="favorites__badge">
          {{ favArticlesList.length }}
        </span>
      </button>
    </div>

    <ClientOnly>
      <template v-if="activeTab === 'women'">
        <div v-if="favWomenList.length" class="favorites__grid">
          <WomanCard
            v-for="w in favWomenList"
            :key="w.slug"
            :name="w.name"
            :slug="w.slug"
            :image="w.image"
            :country="w.country"
            :born="w.born"
            :died="w.died"
            :era="w.era"
            :summary="w.summary"
            :causes="w.causes"
          />
        </div>
        <div v-else class="favorites__empty">
          <LucideHeart :size="40" />
          <p>No favorite women yet.</p>
          <NuxtLink to="/women" class="favorites__browse-btn">
            Browse women
          </NuxtLink>
        </div>
      </template>

      <template v-else>
        <div v-if="favArticlesList.length" class="favorites__list">
          <ArticleCard
            v-for="a in favArticlesList"
            :key="a.slug"
            :title="a.title"
            :description="a.description"
            :date="a.date"
            :slug="a.slug"
            :category="a.category"
            :image="a.image"
          />
        </div>
        <div v-else class="favorites__empty">
          <LucideHeart :size="40" />
          <p>No favorite articles yet.</p>
          <NuxtLink to="/articles" class="favorites__browse-btn">
            Browse articles
          </NuxtLink>
        </div>
      </template>

      <template #fallback>
        <div class="favorites__empty">
          <p>Loading your favorites…</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const activeTab = ref<"women" | "articles">("women");

const { favoriteWomen, favoriteArticles } = useApp();

const { data: allWomen } = await useAsyncData("fav-women", () =>
  queryCollection("women").order("name", "ASC").all(),
);

const { data: allArticles } = await useAsyncData("fav-articles", () =>
  queryCollection("articles").order("date", "DESC").all(),
);

const favWomenList = computed(() => {
  if (!allWomen.value) return [];
  return allWomen.value.filter((w) => favoriteWomen.value.includes(w.slug));
});

const favArticlesList = computed(() => {
  if (!allArticles.value) return [];
  return allArticles.value.filter((a) =>
    favoriteArticles.value.includes(a.slug),
  );
});

const totalCount = computed(
  () => favWomenList.value.length + favArticlesList.value.length,
);

useSeoMeta({
  title: "Your Favorites",
  description: "Your saved women and articles from HerStory Africa.",
});
</script>

<style scoped>
.favorites {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .favorites {
    padding: 2.5rem 2rem 4rem;
  }
}

.favorites__header {
  margin-bottom: 2rem;
}

.favorites__title {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.favorites__subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0.375rem 0 0;
}

.favorites__tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.favorites__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorites__tab:hover {
  border-color: var(--ring-default);
  color: var(--text-primary);
}

.favorites__tab--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
}

.favorites__tab--active:hover {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
  color: var(--text-on-primary);
}

.favorites__badge {
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 1.25rem;
  height: 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: color-mix(in srgb, currentColor 15%, transparent);
}

.favorites__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 480px) {
  .favorites__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .favorites__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

.favorites__list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.favorites__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.favorites__empty p {
  margin: 0;
  font-size: 1rem;
}

.favorites__browse-btn {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.15s ease;
}

.favorites__browse-btn:hover {
  border-color: var(--ring-default);
  color: var(--color-primary);
}
</style>
