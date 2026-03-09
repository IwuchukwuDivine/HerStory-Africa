<template>
  <section class="section timeline">
    <div class="section__header">
      <h2 class="section__title">Across the Centuries</h2>
      <p class="section__subtitle">Key moments in African women's history</p>
    </div>

    <div v-if="moments?.length" class="timeline__track">
      <div
        v-for="(woman, index) in moments"
        :key="woman.slug"
        class="timeline__item"
      >
        <div class="timeline__marker">
          <span class="timeline__year">{{ woman.born }}</span>
          <span class="timeline__dot" />
          <span v-if="index < moments.length - 1" class="timeline__line" />
        </div>

        <NuxtLink :to="`/women/${woman.slug}`" class="timeline__card">
          <div class="timeline__card-image">
            <NuxtImg
              :src="woman.image"
              :alt="woman.name"
              width="80"
              height="80"
              format="webp"
              loading="lazy"
              class="timeline__avatar"
            />
          </div>
          <div class="timeline__card-body">
            <h3 class="timeline__name">{{ woman.name }}</h3>
            <p class="timeline__summary">{{ woman.summary }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div class="timeline__footer">
      <NuxtLink to="/timeline" class="timeline__cta">
        Explore full timeline
        <LucideArrowRight :size="16" />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: moments } = await useAsyncData('timeline-teaser', () =>
  queryCollection('women')
    .select('name', 'slug', 'born', 'summary', 'image')
    .order('born', 'ASC')
    .limit(4)
    .all(),
)
</script>

<style scoped>
.timeline__track {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline__item {
  display: flex;
  gap: 1.25rem;
}

.timeline__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 3.5rem;
}

.timeline__year {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

.timeline__dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  background: var(--color-primary);
  border: 2.5px solid var(--surface);
  box-shadow: 0 0 0 2px var(--color-primary-200);
  margin: 0.375rem 0;
  flex-shrink: 0;
}

.timeline__line {
  flex: 1;
  width: 2px;
  background: var(--border-default);
  min-height: 1rem;
}

.timeline__card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem 1.125rem;
  border-radius: 0.875rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  margin-bottom: 0.75rem;
  flex: 1;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.timeline__card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-soft);
}

.timeline__card-image {
  flex-shrink: 0;
}

.timeline__avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  object-fit: cover;
  background: var(--surface-muted);
}

.timeline__card-body {
  flex: 1;
  min-width: 0;
}

.timeline__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
  line-height: 1.3;
}

.timeline__summary {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.timeline__footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.timeline__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-on-primary);
  text-decoration: none;
  transition: background 0.2s ease, transform 0.15s ease;
}

.timeline__cta:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
}
</style>
