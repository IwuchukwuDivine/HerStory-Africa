<template>
  <ol class="steps">
    <li v-for="step in steps" :key="step.slug" class="steps__item">
      <NuxtLink
        :to="`/women/${step.slug}?path=${pathSlug}`"
        class="steps__link"
        :class="{ 'steps__link--read': step.read, 'steps__link--current': step.current }"
        :aria-current="step.current ? 'step' : undefined"
      >
        <div class="steps__rail" aria-hidden="true">
          <span class="steps__dot">
            <LucideCheck v-if="step.read" :size="14" />
            <template v-else>{{ step.n }}</template>
          </span>
          <span class="steps__line" />
        </div>

        <div class="steps__body">
          <div class="steps__head">
            <div class="steps__titles">
              <span class="eyebrow eyebrow--muted steps__meta">{{ step.meta }}</span>
              <span class="steps__name">{{ step.name }}</span>
            </div>
            <div class="steps__thumb" :class="{ 'steps__thumb--initial': !hasPortrait(step.image) }">
              <NuxtImg
                v-if="hasPortrait(step.image)"
                :src="step.image"
                :alt="`Portrait of ${step.name}`"
                width="112"
                format="webp"
                loading="lazy"
                :style="step.focal ? { objectPosition: step.focal } : undefined"
              />
              <template v-else>{{ initialOf(step.name) }}</template>
            </div>
          </div>
          <p class="steps__why">{{ step.why }}</p>
          <span class="steps__time">
            <span v-if="step.read" class="steps__read"><LucideCheck :size="12" />Read · </span>{{ minutesLabel(step.minutes) }}
          </span>
        </div>
      </NuxtLink>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { hasPortrait, initialOf, minutesLabel } from "~/utils/format";

/**
 * Ordered steps of a reading path: numbered dot (green check when read,
 * terracotta when current), meta eyebrow, name, thumbnail, the editor's one
 * sentence on why this woman is next, and the read time.
 */
defineProps<{
  steps: {
    n: number;
    slug: string;
    name: string;
    meta: string;
    why: string;
    minutes: number;
    image: string;
    focal?: string;
    read: boolean;
    current: boolean;
  }[];
  pathSlug: string;
}>();
</script>

<style scoped>
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.steps__link {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
}

.steps__link:focus-visible {
  outline: 2px solid var(--ring-default);
  outline-offset: 2px;
  border-radius: 8px;
}

.steps__rail {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 32px;
}

.steps__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--border-default);
  font-size: 14px;
  font-weight: 800;
  color: var(--text-muted);
}

.steps__link--current .steps__dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
}

.steps__link--read .steps__dot {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
}

.steps__line {
  flex: 1;
  width: 1.5px;
  background: var(--border-light);
}

.steps__item:last-child .steps__line {
  display: none;
}

.steps__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.steps__head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.steps__titles {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.steps__meta {
  letter-spacing: 0.08em;
}

.steps__name {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.15;
  color: var(--text-primary);
  transition: color 0.15s ease;
}

.steps__link--read .steps__name {
  color: var(--text-secondary);
}

@media (hover: hover) {
  .steps__link:hover .steps__name {
    color: var(--color-primary);
  }
}

.steps__thumb {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-muted);
}

.steps__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 20%;
  display: block;
}

.steps__thumb--initial {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-subtle);
  font-size: 20px;
  font-weight: 800;
  color: var(--color-primary);
}

.steps__why {
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  font-style: italic;
  color: var(--text-secondary);
}

.steps__time {
  font-size: 13px;
  color: var(--text-muted);
}

.steps__read {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #16a34a;
}
</style>
