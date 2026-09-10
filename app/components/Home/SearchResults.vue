<template>
  <div v-if="query.length >= 2" class="search-results">
    <div v-if="results?.length" class="search-results__list">
      <NuxtLink
        v-for="woman in results"
        :key="woman.slug"
        :to="`/women/${woman.slug}`"
        class="search-results__item"
        @click="$emit('select')"
      >
        <NuxtImg
          :src="woman.image"
          :alt="`Portrait of ${woman.name}, ${woman.country}`"
          width="48"
          height="48"
          format="webp"
          loading="lazy"
          class="search-results__avatar"
        />
        <div class="search-results__info">
          <span class="search-results__name">{{ woman.name }}</span>
          <span class="search-results__meta"
            >{{ woman.country }} · {{ woman.era }}</span
          >
        </div>
        <LucideArrowRight :size="14" class="search-results__arrow" />
      </NuxtLink>
    </div>

    <div v-else class="search-results__empty">
      <LucideSearchX :size="20" />
      <span>No results for "{{ query }}"</span>
    </div>

    <NuxtLink
      :to="{ path: '/women', query: { q: query } }"
      class="search-results__view-all"
      @click="$emit('select')"
    >
      See all results for "{{ query }}"
      <LucideArrowRight :size="14" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  query: string;
}>();

defineEmits<{
  select: [];
}>();

const { data: allWomen } = await useAsyncData("search-women", () =>
  queryCollection("women")
    .select("name", "slug", "image", "country", "era", "causes")
    .order("name", "ASC")
    .all(),
);

const results = computed(() => {
  const q = props.query.toLowerCase().trim();
  if (q.length < 2 || !allWomen.value) return [];

  return allWomen.value
    .filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.country.toLowerCase().includes(q) ||
        w.era.toLowerCase().includes(q) ||
        w.causes.some((c) => c.toLowerCase().includes(q)),
    )
    .slice(0, 5);
});
</script>

<style scoped>
.search-results {
  width: 100%;
  max-width: 36rem;
  margin-top: 0.5rem;
  border-radius: 1rem;
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-default);
  box-shadow: var(--shadow-elevated);
  overflow: hidden;
}

.search-results__list {
  display: flex;
  flex-direction: column;
}

.search-results__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: inherit;
  transition: background 0.12s ease;
}

.search-results__item:hover {
  background: var(--surface-muted);
}

.search-results__item + .search-results__item {
  border-top: 1px solid var(--border-light);
}

.search-results__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--surface-muted);
}

.search-results__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.search-results__name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
}

.search-results__meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.search-results__arrow {
  flex-shrink: 0;
  color: var(--text-muted);
}

.search-results__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.search-results__view-all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  border-top: 1px solid var(--border-light);
  transition: background 0.12s ease;
}

.search-results__view-all:hover {
  background: var(--surface-muted);
}
</style>
