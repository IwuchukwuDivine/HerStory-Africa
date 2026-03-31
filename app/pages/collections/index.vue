<template>
  <div class="collections-page">
    <header class="collections-page__header">
      <h1 class="collections-page__title">Curated Collections</h1>
      <p class="collections-page__subtitle">
        Thematic groups of women for deeper exploration and learning.
        Perfect for educators, students, and anyone who wants a guided journey through African women's history.
      </p>
    </header>

    <div v-if="collections?.length" class="collections-page__grid">
      <CollectionCard
        v-for="collection in collections"
        :key="collection.slug"
        :title="collection.title"
        :slug="collection.slug"
        :description="collection.description"
        :theme="collection.theme"
        :women-count="collection.women.length"
        :preview-images="getPreviewImages(collection.women)"
      />
    </div>

    <div v-else class="collections-page__empty">
      <LucideLayoutGrid :size="40" />
      <p>No collections yet. Check back soon.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: collections } = await useAsyncData('collections', () =>
  queryCollection('collections').order('title', 'ASC').all(),
)

const { data: allWomen } = await useAsyncData('all-women-for-collections', () =>
  queryCollection('women').order('name', 'ASC').all(),
)

const womenBySlug = computed(() => {
  const map = new Map<string, { image: string }>()
  if (allWomen.value) {
    for (const w of allWomen.value) {
      map.set(w.slug, { image: w.image })
    }
  }
  return map
})

function getPreviewImages(slugs: string[]): string[] {
  return slugs
    .slice(0, 4)
    .map((s) => womenBySlug.value.get(s)?.image)
    .filter((img): img is string => !!img)
}

const pageDescription =
  'Explore curated thematic collections of African women who shaped history — from queens and warriors to writers and scientists.'

useSeoMeta({
  title: 'Curated Collections',
  description: pageDescription,
  ogTitle: 'Curated Collections',
  ogDescription: pageDescription,
  ogImage: getAbsoluteUrl(),
  ogUrl: getAbsoluteUrl('/collections'),
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Curated Collections',
  twitterDescription: pageDescription,
  twitterImage: getAbsoluteUrl(),
})
</script>

<style scoped>
.collections-page {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .collections-page {
    padding: 2.5rem 2rem 4rem;
  }
}

.collections-page__header {
  margin-bottom: 2.5rem;
}

.collections-page__title {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.collections-page__subtitle {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-muted);
  margin: 0.5rem 0 0;
  max-width: 40rem;
}

.collections-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .collections-page__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

.collections-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.collections-page__empty p {
  margin: 0;
  font-size: 1rem;
}
</style>
