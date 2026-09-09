<template>
  <section v-if="articles?.length" class="latest__articles">
    <h3 class="latest__articles-heading">
      <LucideBookOpen :size="18" />
      Articles &amp; Explainers
    </h3>
    <div class="latest__articles-list">
      <ArticleCard
        v-for="article in articles"
        :key="article.slug"
        :title="article.title"
        :description="article.description"
        :date="article.date"
        :slug="article.slug"
        :category="article.category"
        :image="article.image"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
const PREVIEW_COUNT = 5;

const { data: articles } = await useAsyncData("latest-articles", async () => {
  const [featured, latest] = await Promise.all([
    queryCollection("articles")
      .where("featured", "=", true)
      .order("date", "DESC")
      .limit(PREVIEW_COUNT)
      .all(),
    queryCollection("articles")
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
.latest__articles {
  padding: 0.5rem 1.5rem;
  max-width: 64rem;
  margin: 0 auto;
}
.latest__articles-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.latest__articles-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
