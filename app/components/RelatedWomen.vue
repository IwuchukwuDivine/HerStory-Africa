<template>
  <aside v-if="relatedWomen.length" class="related-women">
    <h2 class="related-women__title">{{ title }}</h2>
    <p class="related-women__subtitle">{{ subtitle }}</p>
    <div class="related-women__grid">
      <WomanCard
        v-for="w in relatedWomen"
        :key="w.slug"
        :name="w.name"
        :slug="w.slug"
        :image="w.image"
        :country="w.country"
        :born="w.born"
        :died="w.died"
        :era="w.era"
        :summary="w.summary"
        :causes="w.causes"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  slug: string
  region: string
  era: string
  causes: string[]
}>()

const { data: candidates } = await useAsyncData(
  `related-${props.slug}`,
  () =>
    queryCollection('women')
      .where('slug', '<>', props.slug)
      .limit(30)
      .all(),
)

const relatedWomen = computed(() => {
  if (!candidates.value?.length) return []

  const scored = candidates.value.map((w) => {
    let score = 0
    const sharedCauses = w.causes.filter((c) => props.causes.includes(c)).length
    score += sharedCauses * 3
    if (w.era === props.era) score += 2
    if (w.region === props.region) score += 1
    return { woman: w, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.woman)
})

const matchReason = computed(() => {
  const first = relatedWomen.value[0]
  if (!first) return 'region'
  const sharedCauses = first.causes.filter((c) => props.causes.includes(c))
  if (sharedCauses.length) return 'cause'
  if (first.era === props.era) return 'era'
  return 'region'
})

const title = computed(() => {
  switch (matchReason.value) {
    case 'cause': return 'Women in similar causes'
    case 'era': return `More from the ${props.era} era`
    default: return `More from ${props.region}`
  }
})

const subtitle = computed(() => {
  switch (matchReason.value) {
    case 'cause': return 'These women championed related struggles'
    case 'era': return 'Contemporaries who shaped the same period'
    default: return 'Profiles from the same region'
  }
})
</script>

<style scoped>
.related-women {
  margin-top: 3.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid var(--border-light);
}

.related-women__title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.related-women__subtitle {
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin: 0 0 1.25rem;
}

.related-women__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 480px) {
  .related-women__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .related-women__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
