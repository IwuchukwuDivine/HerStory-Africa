<template>
  <NuxtLink :to="`/articles/${slug}`" class="article-feature">
    <div class="article-feature__image">
      <NuxtImg v-if="image" :src="image" :alt='`Illustration for "${title}"`' width="768" height="432" format="webp" loading="lazy" />
      <div v-else class="no-photo"><LucideBookOpen :size="40" /></div>
    </div>
    <span class="article-feature__eyebrow">{{ category }}<template v-if="readingTime"> · {{ minutesLabel(readingTime) }}</template></span>
    <span class="article-feature__title">{{ title }}</span>
    <span v-if="description" class="article-feature__desc">{{ description }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { minutesLabel } from "~/utils/format";

/** "Read next" feature: 16:9 image, eyebrow, title 22/800, one-line description. */
withDefaults(
  defineProps<{
    title: string;
    slug: string;
    category?: string;
    image?: string;
    description?: string;
    readingTime?: number | null;
  }>(),
  { category: "", image: "", description: "", readingTime: null },
);
</script>

<style scoped>
.article-feature {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.article-feature__image {
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: var(--surface-muted);
}

.article-feature__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

@media (hover: hover) {
  .article-feature:hover img {
    transform: scale(1.03);
  }

  .article-feature:hover .article-feature__title {
    color: var(--color-primary);
  }
}

.article-feature__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.article-feature__title {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-primary);
  transition: color 0.15s ease;
}

.article-feature__desc {
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
