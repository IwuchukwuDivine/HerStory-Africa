<template>
  <NuxtLink :to="`/women/${slug}`" class="card woman-card">
    <div class="woman-card__image-wrapper">
      <NuxtImg
        v-if="hasPortrait(image)"
        :src="image"
        :provider="imageProvider(image)"
        :alt="`Portrait of ${name}, ${country}`"
        width="400"
        height="500"
        format="webp"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : undefined"
        class="woman-card__image"
      />
      <div v-else class="no-photo">
        <ContinentMark :size="72" />
      </div>
      <span class="image-chip">{{ era }}</span>
      <ClientOnly>
        <div class="woman-card__fav">
          <FavoriteButton type="woman" :slug="slug" :size="16" />
        </div>
      </ClientOnly>
    </div>

    <div class="woman-card__body">
      <h3 class="woman-card__name">{{ name }}</h3>
      <p class="woman-card__meta">{{ country }} · {{ lifespan(born, died) }}</p>
      <ClientOnly>
        <span v-if="read" class="woman-card__read-badge">
          <LucideCheck :size="12" />
          Read
        </span>
      </ClientOnly>
      <p class="woman-card__summary">{{ summary }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { hasPortrait } from "~/utils/format";
const props = withDefaults(
  defineProps<{
    name: string;
    slug: string;
    image: string;
    country: string;
    born: number | null;
    died: number | null;
    era: string;
    summary: string;
    causes: string[];
    /** Kept for existing callers; cause chips no longer render on cards. */
    maxCauses?: number;
    /** Above-the-fold card: load its image eagerly with high priority (LCP). */
    priority?: boolean;
  }>(),
  {
    maxCauses: 2,
  },
);

const { isRead } = useApp();
const read = computed(() => isRead("woman", props.slug));
</script>

<style scoped>
.woman-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface-elevated);
  box-shadow: var(--shadow-card);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  text-decoration: none;
  color: inherit;
}

@media (hover: hover) {
  .woman-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-elevated);
  }

  .woman-card:hover .woman-card__image {
    transform: scale(1.05);
  }

  .woman-card:hover .woman-card__name {
    color: var(--color-primary);
  }
}

.woman-card:active {
  transform: scale(0.98);
}

.woman-card__image-wrapper {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--surface-muted);
}

.woman-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

/* 44px hit box top-right; the visible disc inside is 34px. */
.woman-card__fav {
  position: absolute;
  top: 6px;
  right: 6px;
}

.woman-card__fav :deep(.favorite-btn) {
  position: relative;
  isolation: isolate;
  color: #fff;
}

.woman-card__fav :deep(.favorite-btn)::before {
  content: "";
  position: absolute;
  inset: 5px;
  z-index: -1;
  border-radius: 50%;
  background: rgba(28, 15, 7, 0.55);
  backdrop-filter: blur(6px);
}

.woman-card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px 20px;
}

.woman-card__name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
  margin: 0;
  transition: color 0.15s ease;
}

.woman-card__meta {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-muted);
  margin: 0;
}

.woman-card__read-badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #16a34a;
}

.woman-card__summary {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 4px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .woman-card,
  .woman-card__image {
    transition: none;
  }
}
</style>
