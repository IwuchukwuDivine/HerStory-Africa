<template>
  <section v-if="item" class="section section--wide continue">
    <div class="label continue__label">
      <span class="rule" aria-hidden="true" />
      <span class="eyebrow">Continue reading</span>
    </div>

    <NuxtLink :to="target" class="continue__card">
      <div class="continue__image">
        <!-- Rendered client-side only: use the original asset, ipxStatic has no on-demand variants. -->
        <img
          v-if="hasPortrait(item.image)"
          :src="item.image"
          :alt="item.type === 'woman' ? `Portrait of ${item.name}` : `Illustration for ${item.name}`"
          width="176"
          loading="eager"
          class="continue__img"
        >
        <div v-else class="no-photo">
          <ContinentMark :size="40" />
        </div>
      </div>

      <div class="continue__body">
        <span class="continue__where">
          <template v-if="item.section">You stopped at {{ item.section }}</template>
          <template v-else>You started reading</template>
        </span>
        <span class="continue__name">{{ item.name }}</span>
        <span class="continue__meta">{{ meta }}</span>
        <div class="continue__progress">
          <div class="progress-line">
            <div
              class="progress-line__fill progress-line__fill--solid"
              :style="{ width: `${Math.round(item.fraction * 100)}%` }"
            />
          </div>
          <span class="continue__left">{{ minutesLeft }} min left →</span>
        </div>
      </div>
    </NuxtLink>

    <div class="continue__stats">
      <span class="continue__count">
        You've read <strong>{{ readWomen.length }}</strong> of {{ counts.women }} women
      </span>
      <NuxtLink to="/favorites" class="continue__saved">Saved · {{ favoriteWomen.length }}</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { hasPortrait, lifespan, minutesLabel } from "~/utils/format";

/**
 * The unfinished profile or article from the last visit, with the section the
 * reader stopped at and the minutes left. Client-only: the data lives in
 * localStorage. Renders nothing once the piece has been marked read.
 */
const { lastOpened } = useReadingSession();
const { isRead, readWomen, favoriteWomen } = useApp();
const { counts } = await useArchiveCounts();

const item = computed(() => {
  const current = lastOpened.value;
  if (!current || isRead(current.type, current.slug)) return null;
  return current;
});

const target = computed(() =>
  item.value ? `/${item.value.type === "woman" ? "women" : "articles"}/${item.value.slug}` : "/",
);

const meta = computed(() => {
  if (!item.value) return "";
  if (item.value.type === "woman") {
    return `${item.value.country} · ${lifespan(item.value.born, item.value.died)}`;
  }
  return `Article · ${minutesLabel(item.value.minutes)}`;
});

const minutesLeft = computed(() => {
  if (!item.value) return 1;
  return Math.max(1, Math.round(item.value.minutes * (1 - item.value.fraction)));
});
</script>

<style scoped>
/* Sits directly under the hero, so it takes only a short top pad and hands
   the bottom spacing to the next section. */
.section.continue {
  padding: 24px 24px 0;
}

@media (min-width: 768px) {
  .section.continue {
    padding: 32px 32px 0;
  }
}

.continue__label {
  margin-bottom: 12px;
}

.continue__card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  align-items: stretch;
  transition: border-color 0.15s ease;
}

@media (hover: hover) {
  .continue__card:hover {
    border-color: var(--border-default);
  }

  .continue__card:hover .continue__name {
    color: var(--color-primary);
  }
}

.continue__image {
  flex-shrink: 0;
  width: 88px;
  min-height: 110px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface-muted);
}

.continue__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 15%;
  display: block;
}

.continue__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.continue__where {
  font-size: 13px;
  color: var(--text-muted);
}

.continue__name {
  font-size: 22px;
  font-weight: 900;
  line-height: 1.1;
  color: var(--text-primary);
  transition: color 0.15s ease;
}

.continue__meta {
  font-size: 14px;
  color: var(--text-muted);
}

.continue__progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 6px;
}

.continue__left {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}

.continue__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0 0;
}

.continue__count {
  font-size: 14px;
  color: var(--text-secondary);
}

.continue__count strong {
  color: var(--text-primary);
  font-weight: 700;
}

.continue__saved {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
}

@media (min-width: 1024px) {
  .continue__card,
  .continue__stats {
    max-width: 560px;
  }
}
</style>
