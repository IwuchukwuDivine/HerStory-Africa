<template>
  <NuxtLink :to="`/women/path/${slug}`" class="panel path-card">
    <div class="path-card__row">
      <span class="path-card__kicker">{{ kicker }}</span>
      <span class="path-card__meta">{{ count }} women · {{ minutes }} min</span>
    </div>

    <span class="path-card__title">{{ title }}</span>
    <span class="path-card__blurb">{{ description }}</span>

    <div class="path-card__foot">
      <div v-if="faces.length" class="path-card__faces" aria-hidden="true">
        <span v-for="(face, i) in faces" :key="i" class="path-card__face">
          <NuxtImg :src="face" :provider="imageProvider(face)" alt="" width="72" height="72" format="webp" loading="lazy" />
        </span>
      </div>
      <span class="path-card__cta">
        <template v-if="readCount > 0">Continue · {{ readCount }} of {{ count }} →</template>
        <template v-else>Start →</template>
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
/**
 * A reading path on the home page: kicker and length, title, blurb, then the
 * overlapping faces of the women in it and a "Start" or "Continue" cue.
 */
withDefaults(
  defineProps<{
    title: string;
    slug: string;
    kicker: string;
    description: string;
    count: number;
    minutes: number;
    faces: string[];
    readCount?: number;
  }>(),
  { readCount: 0 },
);
</script>

<style scoped>
.path-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.25s ease;
}

@media (hover: hover) {
  .path-card:hover {
    transform: translateY(-2px);
  }

  .path-card:hover .path-card__title {
    color: var(--color-primary);
  }
}

.path-card:active {
  transform: scale(0.99);
}

.path-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.path-card__kicker {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-gold);
}

.path-card__meta {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

.path-card__title {
  font-size: 22px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.3px;
  color: var(--text-primary);
  transition: color 0.15s ease;
}

.path-card__blurb {
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.path-card__foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}

.path-card__faces {
  display: flex;
  padding-left: 8px;
}

.path-card__face {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--surface-muted);
  margin-left: -8px;
  background: var(--surface-subtle);
  flex-shrink: 0;
}

.path-card__face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.path-card__cta {
  margin-left: auto;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}
</style>
