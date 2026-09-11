<template>
  <NuxtLink :to="`/women/${slug}`" class="feature-card">
    <div class="feature-card__image" :style="{ aspectRatio: aspect }">
      <NuxtImg
        v-if="hasPortrait(image)"
        :src="image"
        :alt="`Portrait of ${name}, ${country}`"
        width="640"
        height="640"
        sizes="(min-width: 1024px) 440px, 90vw"
        format="webp"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : undefined"
        :style="{ objectPosition: focal || '50% 20%' }"
      />
      <div v-else class="no-photo"><ContinentMark :size="96" /></div>
    </div>
    <div class="feature-card__text" :class="{ 'feature-card__text--captioned': captioned }">
      <span v-if="captioned" class="feature-card__rule" aria-hidden="true" />
      <div class="feature-card__copy">
        <span class="feature-card__eyebrow">{{ eyebrow }}</span>
        <span class="feature-card__name">{{ name }}</span>
        <span v-if="summary" class="feature-card__summary">{{ summary }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { hasPortrait } from "~/utils/format";

/**
 * Feature card: one per hub "Start here" (16/11) and the desktop hero plate
 * (4/4.6 with the caption rule). Eyebrow, name 26/900, one-line summary.
 */
withDefaults(
  defineProps<{
    name: string;
    slug: string;
    image: string;
    country: string;
    eyebrow: string;
    summary?: string;
    focal?: string;
    aspect?: string;
    /** Caption layout: 24px rule to the left of the text (hero plate). */
    captioned?: boolean;
    priority?: boolean;
  }>(),
  { summary: "", focal: "", aspect: "16 / 11", captioned: false, priority: false },
);
</script>

<style scoped>
.feature-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.feature-card__image {
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface-muted);
}

.feature-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

@media (hover: hover) {
  .feature-card:hover img {
    transform: scale(1.03);
  }

  .feature-card:hover .feature-card__name {
    color: var(--color-primary);
  }
}

.feature-card__text {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.feature-card__rule {
  flex-shrink: 0;
  width: 24px;
  height: 2px;
  margin-top: 9px;
  background: var(--color-secondary);
}

.feature-card__copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.feature-card__text--captioned .feature-card__copy {
  gap: 4px;
}

.feature-card__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.feature-card__name {
  font-size: 26px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.3px;
  color: var(--text-primary);
  transition: color 0.15s ease;
}

.feature-card__text--captioned .feature-card__name {
  font-size: 22px;
}

.feature-card__summary {
  font-size: 15px;
  line-height: 1.55;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feature-card__text--captioned .feature-card__summary {
  font-size: 14px;
  line-height: 1.5;
}
</style>
