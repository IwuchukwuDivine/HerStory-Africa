<template>
  <div class="path-bar">
    <span class="path-bar__step">Path · {{ index }} of {{ total }}</span>
    <NuxtLink :to="`/women/path/${pathSlug}`" class="path-bar__title">{{ title }}</NuxtLink>
    <button
      type="button"
      class="icon-btn path-bar__close"
      aria-label="Leave this reading path"
      @click="leave"
    >
      <LucideX :size="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * Gold-tinted strip at the top of a profile reached from a reading path
 * ("Path · 3 of 5 · The Aba Women's War, in five lives"). The × drops the
 * `?path=` query so the profile reads as a plain profile again.
 */
defineProps<{
  title: string;
  index: number;
  total: number;
  pathSlug: string;
}>();

const router = useRouter();

function leave() {
  router.replace({ query: {} });
}
</script>

<style scoped>
.path-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: color-mix(in srgb, var(--color-secondary) 16%, var(--surface));
  border-bottom: 1px solid var(--border-light);
}

.path-bar__step {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary-600);
  white-space: nowrap;
}

.path-bar__title {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.path-bar__title:hover {
  color: var(--color-primary);
}

.path-bar__close {
  flex-shrink: 0;
  margin: -10px -12px -10px 0;
  color: var(--text-muted);
}
</style>
