<template>
  <NuxtLink :to="`/women/${slug}`" class="compact" :class="{ 'compact--read': read }">
    <div class="compact__image">
      <img
        v-if="hasPortrait(image) && raw"
        :src="image"
        :alt="`Portrait of ${name}, ${country}`"
        loading="lazy"
        :style="focal ? { objectPosition: focal } : undefined"
        class="compact__img"
      >
      <NuxtImg
        v-else-if="hasPortrait(image)"
        :src="image"
        :alt="`Portrait of ${name}, ${country}`"
        width="320"
        format="webp"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : undefined"
        :style="focal ? { objectPosition: focal } : undefined"
        class="compact__img"
      />
      <div v-else class="no-photo">
        <ContinentMark :size="56" />
      </div>
      <span v-if="badge" class="compact__badge">{{ badge }}</span>
      <span v-else-if="era" class="image-chip">{{ era }}</span>
    </div>
    <div class="compact__body">
      <span class="compact__name">{{ name }}</span>
      <span class="compact__meta">{{ country }} · {{ lifespan(born, died) }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { hasPortrait, lifespan } from "~/utils/format";

/**
 * The mobile default card: 4:5 portrait on --surface-muted, era chip inside
 * the image, name and meta. No summary, no cause chips, no chrome.
 */
const props = withDefaults(
  defineProps<{
    name: string;
    slug: string;
    image: string;
    country: string;
    born: number | null;
    died: number | null;
    era?: string;
    focal?: string;
    /** Gold "New" style badge in place of the era chip. */
    badge?: string;
    priority?: boolean;
    /** Client-only grids (favourites): use the original asset, since ipxStatic has no on-demand variants. */
    raw?: boolean;
  }>(),
  { era: "", focal: "", badge: "", priority: false, raw: false },
);

const { isRead } = useApp();
const read = computed(() => isRead("woman", props.slug));
</script>

<style scoped>
.compact {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  border-radius: 12px;
  transition: transform 0.25s ease;
}

.compact__image {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-muted);
  transition: box-shadow 0.25s ease;
}

.compact__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

@media (hover: hover) {
  .compact:hover {
    transform: translateY(-4px);
  }

  .compact:hover .compact__image {
    box-shadow: var(--shadow-elevated);
  }

  .compact:hover .compact__img {
    transform: scale(1.05);
  }

  .compact:hover .compact__name {
    color: var(--color-primary);
  }
}

.compact:active {
  transform: scale(0.98);
}

.compact:active .compact__image {
  opacity: 0.9;
}

.compact:focus-visible {
  outline: none;
}

.compact:focus-visible .compact__image {
  outline: 2px solid var(--ring-default);
  outline-offset: 3px;
}

.compact__badge {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 4px 10px;
  border-radius: 9999px;
  background: var(--color-secondary);
  color: #1c0f07;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.2;
}

.compact__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.compact__name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
  transition: color 0.15s ease;
}

@media (min-width: 768px) {
  .compact__name {
    font-size: 18px;
  }
}

.compact__meta {
  font-size: 13px;
  color: var(--text-muted);
}

@media (min-width: 768px) {
  .compact__meta {
    font-size: 14px;
  }
}

.compact--read .compact__name {
  color: var(--text-secondary);
}
</style>
