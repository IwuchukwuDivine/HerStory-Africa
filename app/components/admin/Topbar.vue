<template>
  <header class="a-top">
    <div class="a-top__text">
      <h1 class="a-top__title">{{ header.title }}</h1>
      <p class="a-top__subtitle">{{ header.subtitle }}</p>
    </div>

    <div class="a-top__controls">
      <label v-if="header.searchable" class="a-top__search">
        <LucideSearch :size="14" aria-hidden="true" />
        <span class="a-top__search-label">Filter rows</span>
        <input
          v-model="search"
          type="search"
          class="a-top__search-input"
          :placeholder="header.searchPlaceholder"
        >
      </label>

      <span v-if="showRange" class="a-top__range">
        <LucideCalendar :size="14" aria-hidden="true" />
        Last 28 days
      </span>

      <a class="a-top__cta" :href="NEW_PROFILE_URL" target="_blank" rel="noopener">
        <LucidePencil :size="14" aria-hidden="true" />
        New profile
      </a>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  /** Only the views that actually read a 28-day window show the range label. */
  showRange?: boolean;
}>();

const header = useAdminHeader();
const search = useAdminSearch();

// Straight into GitHub's new-file editor, prefilled with the content path.
const NEW_PROFILE_URL =
  "https://github.com/IwuchukwuDivine/HerStory-Africa/new/main/app/content/women";
</script>

<style scoped>
.a-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--surface-elevated);
}

.a-top__text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.a-top__title {
  font-size: 1.375rem;
  font-weight: 800;
  line-height: 1.15;
  color: var(--text-primary);
  margin: 0;
}

.a-top__subtitle {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0;
}

.a-top__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.a-top__search {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 36px;
  padding: 0 0.75rem;
  border: 1.5px solid var(--border-default);
  border-radius: 9999px;
  color: var(--text-muted);
  background: var(--surface);
}

.a-top__search:focus-within {
  border-color: var(--ring-default);
}

.a-top__search-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.a-top__search-input {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  color: var(--text-primary);
  width: 13rem;
  max-width: 40vw;
}

.a-top__search-input:focus {
  outline: none;
}

.a-top__range {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 36px;
  padding: 0 0.75rem;
  border: 1.5px solid var(--border-default);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.a-top__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 36px;
  padding: 0 0.875rem;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-on-primary);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease;
}

.a-top__cta:hover {
  background: var(--color-primary-600);
}

/* Touch targets grow on small screens, where the header wraps anyway. */
@media (max-width: 767px) {
  .a-top {
    padding: 1rem;
  }

  .a-top__search,
  .a-top__range,
  .a-top__cta {
    height: 44px;
  }
}
</style>
