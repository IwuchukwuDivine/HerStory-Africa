<template>
  <section class="section featured">
    <div class="section__header">
      <h2 class="section__title">Newest in the Archive</h2>
      <NuxtLink to="/women" class="section__cta">
        View all
        <LucideArrowRight :size="16" />
      </NuxtLink>
    </div>

    <div v-if="women?.length" class="featured__grid">
      <WomanCard
        v-for="woman in women"
        :key="woman.slug"
        :name="woman.name"
        :slug="woman.slug"
        :image="woman.image"
        :country="woman.country"
        :born="woman.born"
        :died="woman.died"
        :era="woman.era"
        :summary="woman.summary"
        :causes="woman.causes"
      />
    </div>
    <div v-else class="featured__grid">
      <div v-for="n in 6" :key="n" class="skeleton-card">
        <div class="skeleton" style="aspect-ratio: 4/5" />
        <div
          style="
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          "
        >
          <div class="skeleton" style="height: 1.25rem; width: 70%" />
          <div class="skeleton" style="height: 0.875rem; width: 50%" />
          <div class="skeleton" style="height: 2.5rem; width: 100%" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: women } = await useAsyncData("featured-women", () =>
  queryCollection("women").order("dateAdded", "DESC").limit(5).all(),
);
</script>

<style scoped>
.featured__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 480px) {
  .featured__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .featured__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

.skeleton-card {
  border-radius: 1rem;
  overflow: hidden;
  background: var(--surface-elevated);
  box-shadow: var(--shadow-card);
}
</style>
