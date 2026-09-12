<template>
  <div class="saved">
    <header class="saved__header">
      <MuseumLabel level="h1" eyebrow="Saved" title="Your saved stories" />
      <p class="saved__intro">
        The women and articles you bookmarked, kept on this device.
      </p>
    </header>

    <ClientOnly>
      <div class="saved__tabs" role="tablist" aria-label="Saved stories" @keydown="onTabKey">
        <button
          id="saved-tab-women"
          type="button"
          role="tab"
          class="pill pill--sm saved__tab"
          :class="activeTab === 'women' ? 'pill--primary' : 'pill--secondary'"
          :aria-selected="activeTab === 'women' ? 'true' : 'false'"
          aria-controls="saved-panel-women"
          :tabindex="activeTab === 'women' ? undefined : -1"
          @click="activeTab = 'women'"
        >
          Women · {{ favWomenList.length }}
        </button>
        <button
          id="saved-tab-articles"
          type="button"
          role="tab"
          class="pill pill--sm saved__tab"
          :class="activeTab === 'articles' ? 'pill--primary' : 'pill--secondary'"
          :aria-selected="activeTab === 'articles' ? 'true' : 'false'"
          aria-controls="saved-panel-articles"
          :tabindex="activeTab === 'articles' ? undefined : -1"
          @click="activeTab = 'articles'"
        >
          Articles · {{ favArticlesList.length }}
        </button>
      </div>

      <section
        v-if="activeTab === 'women'"
        id="saved-panel-women"
        role="tabpanel"
        aria-labelledby="saved-tab-women"
        class="saved__panel"
      >
        <div v-if="favWomenList.length" class="compact-grid compact-grid--4">
          <WomanCardCompact
            v-for="(w, i) in favWomenList"
            :key="w.slug"
            raw
            :name="w.name"
            :slug="w.slug"
            :image="w.image"
            :country="w.country"
            :born="w.born"
            :died="w.died"
            :era="w.era"
            :focal="w.ogFocal"
            :priority="i < 2"
          />
        </div>
        <div v-else class="panel saved__empty">
          <ContinentMark :size="48" class="saved__empty-mark" />
          <p class="saved__empty-text">
            Tap the heart on any profile and she will be kept here.
          </p>
          <Pill to="/women" variant="secondary">Browse the archive</Pill>
        </div>
      </section>

      <section
        v-else
        id="saved-panel-articles"
        role="tabpanel"
        aria-labelledby="saved-tab-articles"
        class="saved__panel"
      >
        <div v-if="favArticlesList.length" class="saved__rows">
          <ArticleRow
            v-for="a in favArticlesList"
            :key="a.slug"
            raw
            :title="a.title"
            :slug="a.slug"
            :category="a.category"
            :image="a.image"
            :reading-time="a.readingTime"
            size="lg"
          />
        </div>
        <div v-else class="panel saved__empty">
          <LucideBookOpen :size="32" class="saved__empty-icon" />
          <p class="saved__empty-text">
            Save an article while you read and it will wait for you here.
          </p>
          <Pill to="/articles" variant="secondary">Read the articles</Pill>
        </div>
      </section>

      <template #fallback>
        <div class="panel saved__empty">
          <p class="saved__empty-text">Loading your saved stories…</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
type Tab = "women" | "articles";

const activeTab = ref<Tab>("women");

const { favoriteWomen, favoriteArticles } = useApp();

const { data: allWomen } = await useAsyncData("fav-women", () =>
  queryCollection("women")
    .select("name", "slug", "image", "country", "born", "died", "era", "ogFocal")
    .order("name", "ASC")
    .all(),
);

const { data: allArticles } = await useAsyncData("fav-articles", () =>
  queryCollection("articles")
    .select("title", "slug", "category", "image", "readingTime", "date")
    .order("date", "DESC")
    .all(),
);

const favWomenList = computed(() =>
  (allWomen.value ?? []).filter((w) => favoriteWomen.value.includes(w.slug)),
);

const favArticlesList = computed(() =>
  (allArticles.value ?? []).filter((a) => favoriteArticles.value.includes(a.slug)),
);

/* Left and right arrows move between the two tabs, per the tabs pattern. */
function onTabKey(e: KeyboardEvent) {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  e.preventDefault();
  activeTab.value = activeTab.value === "women" ? "articles" : "women";
  nextTick(() => document.getElementById(`saved-tab-${activeTab.value}`)?.focus());
}

useSeoMeta({
  title: "Your Favorites",
  description: "Your saved women and articles from HerStory Africa.",
  ogTitle: "Your Favorites",
  ogDescription: "Your saved women and articles from HerStory Africa.",
  ogUrl: getAbsoluteUrl("/favorites"),
  robots: "noindex, follow",
});

defineOgImage("Card", {
  variant: "page",
  pill: "Favorites",
  title: "Your saved stories",
  description: "The women and articles you bookmarked, kept on this device.",
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/favorites") }],
});
</script>

<style scoped>
.saved {
  max-width: 64rem;
  margin: 0 auto;
  padding: 28px 24px 56px;
}

@media (min-width: 768px) {
  .saved {
    padding: 40px 32px 64px;
  }
}

.saved__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.saved__intro {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.saved__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

/* Small pill spacing at the full 44px hit height. */
.saved__tab {
  height: 44px;
}

.saved__tab:focus-visible {
  outline: 2px solid var(--ring-default);
  outline-offset: 2px;
}

.saved__rows {
  display: flex;
  flex-direction: column;
  max-width: 48rem;
}

.saved__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 16px;
  text-align: center;
}

.saved__empty-mark,
.saved__empty-icon {
  color: var(--color-primary);
}

.saved__empty-text {
  margin: 0;
  font-size: 16px;
  color: var(--text-secondary);
}
</style>
