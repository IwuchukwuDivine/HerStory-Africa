<template>
  <section v-if="spotlightWomen.length" class="section on-this-day">
    <div class="section__header">
      <div>
        <h2 class="section__title">On This Day in History</h2>
        <p class="section__subtitle">Women born in years that echo today's date</p>
      </div>
    </div>

    <div class="on-this-day__grid">
      <NuxtLink
        v-for="woman in spotlightWomen"
        :key="woman.slug"
        :to="`/women/${woman.slug}`"
        class="on-this-day__card"
      >
        <div class="on-this-day__image-wrapper">
          <NuxtImg
            :src="woman.image"
            :alt="woman.name"
            width="80"
            height="80"
            format="webp"
            loading="lazy"
            class="on-this-day__avatar"
          />
        </div>
        <div class="on-this-day__body">
          <span class="on-this-day__year">Born {{ woman.born }}</span>
          <h3 class="on-this-day__name">{{ woman.name }}</h3>
          <p class="on-this-day__country">{{ woman.country }} · {{ woman.era }} era</p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: allWomen } = await useAsyncData('on-this-day', () =>
  queryCollection('women')
    .select('name', 'slug', 'born', 'country', 'era', 'image')
    .all(),
)

const spotlightWomen = computed(() => {
  if (!allWomen.value?.length) return []

  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86_400_000,
  )

  const pool = allWomen.value.filter((w) => w.born > 0)
  if (!pool.length) return []

  const seeded: { woman: (typeof pool)[number]; hash: number }[] = pool.map((w) => {
    let h = dayOfYear * 2654435761
    for (const ch of w.slug) h = ((h << 5) - h + ch.charCodeAt(0)) | 0
    return { woman: w, hash: Math.abs(h) }
  })

  seeded.sort((a, b) => a.hash - b.hash)

  const picked: typeof pool = []
  const seenEras = new Set<string>()

  for (const item of seeded) {
    if (picked.length >= 4) break
    if (!seenEras.has(item.woman.era)) {
      picked.push(item.woman)
      seenEras.add(item.woman.era)
    }
  }

  if (picked.length < 4) {
    for (const item of seeded) {
      if (picked.length >= 4) break
      if (!picked.includes(item.woman)) {
        picked.push(item.woman)
      }
    }
  }

  return picked
})
</script>

<style scoped>
.on-this-day__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 480px) {
  .on-this-day__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.on-this-day__card {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.125rem;
  border-radius: 0.875rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.on-this-day__card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-soft);
}

.on-this-day__image-wrapper {
  flex-shrink: 0;
}

.on-this-day__avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  object-fit: cover;
  background: var(--surface-muted);
}

.on-this-day__body {
  flex: 1;
  min-width: 0;
}

.on-this-day__year {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.on-this-day__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0.125rem 0 0;
  line-height: 1.3;
}

.on-this-day__country {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0.125rem 0 0;
}
</style>
