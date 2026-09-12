<template>
  <section class="section section--wide articles" :class="{ 'articles--with-dyk': showDidYouKnow }">
    <div class="articles__main">
      <MuseumLabel eyebrow="Articles" title="Explainers and essays" class="articles__label">
        <NuxtLink to="/articles" class="section__cta">All {{ counts.articles }} →</NuxtLink>
      </MuseumLabel>

      <div v-if="articles?.length" class="articles__list">
        <ArticleRow
          v-for="article in articles"
          :key="article.slug"
          :title="article.title"
          :slug="article.slug"
          :category="article.category"
          :image="article.image"
          :reading-time="article.readingTime"
          size="lg"
        />
      </div>
    </div>

    <!-- Above the rows on phones, a right-hand panel from 1024. -->
    <HomeDidYouKnow v-if="showDidYouKnow" class="articles__aside" />
  </section>
</template>

<script setup lang="ts">
const PREVIEW_COUNT = 3;

withDefaults(defineProps<{ showDidYouKnow?: boolean }>(), { showDidYouKnow: false });

const { counts } = await useArchiveCounts();

const { data: articles } = await useAsyncData("latest-articles", async () => {
  const fields = ["title", "slug", "category", "image", "date", "readingTime"] as const;
  const [featured, latest] = await Promise.all([
    queryCollection("articles")
      .select(...fields)
      .where("featured", "=", true)
      .order("date", "DESC")
      .limit(PREVIEW_COUNT)
      .all(),
    queryCollection("articles")
      .select(...fields)
      .order("date", "DESC")
      .limit(PREVIEW_COUNT)
      .all(),
  ]);

  const seen = new Set<string>();
  const merged = [];
  for (const a of [...featured, ...latest]) {
    if (seen.has(a.slug)) continue;
    seen.add(a.slug);
    merged.push(a);
  }
  return merged.slice(0, PREVIEW_COUNT);
});
</script>

<style scoped>
.articles {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.articles__main {
  min-width: 0;
}

.articles__label {
  margin-bottom: 18px;
}

.articles__list {
  display: flex;
  flex-direction: column;
}

/* Mobile order: the fact panel comes before the article rows. */
.articles__aside {
  order: -1;
}

@media (min-width: 1024px) {
  .articles--with-dyk {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 400px;
    gap: 48px;
    align-items: start;
  }

  .articles__aside {
    order: 0;
    margin-top: 64px;
    padding: 28px;
  }
}
</style>
