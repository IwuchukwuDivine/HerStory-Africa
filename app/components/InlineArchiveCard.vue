<template>
  <NuxtLink :to="`/women/${slug}`" class="archive-card">
    <div class="archive-card__thumb" :class="{ 'list-row__initial': !hasPortrait(image) }">
      <NuxtImg v-if="hasPortrait(image)" :src="image" :alt="`Portrait of ${name}`" width="104" height="104" format="webp" loading="lazy" :style="focal ? { objectPosition: focal } : undefined" />
      <template v-else>{{ initialOf(name) }}</template>
    </div>
    <div class="archive-card__body">
      <span class="archive-card__eyebrow">In the archive</span>
      <span class="archive-card__name">{{ name }}</span>
      <span class="archive-card__meta">{{ country }} · {{ lifespan(born, died) }}</span>
    </div>
    <span class="archive-card__chevron"><LucideChevronRight :size="18" /></span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { hasPortrait, initialOf, lifespan } from "~/utils/format";

/** Inserted after the paragraph that first links a woman inside an article. */
withDefaults(
  defineProps<{
    name: string;
    slug: string;
    image?: string;
    country?: string;
    born?: number | null;
    died?: number | null;
    focal?: string;
  }>(),
  { image: "", country: "", born: null, died: null, focal: "" },
);
</script>

<style scoped>
.archive-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  margin: 4px 0 24px;
  border-radius: 12px;
  background: var(--surface-muted);
  text-decoration: none;
  color: inherit;
}

.archive-card__thumb {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-subtle);
}

.archive-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.archive-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.archive-card__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.archive-card__name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.archive-card__meta {
  font-size: 13px;
  color: var(--text-muted);
}

.archive-card__chevron {
  display: flex;
  color: var(--text-muted);
}
</style>
