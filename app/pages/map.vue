<template>
  <div class="map-page">
    <header class="map-page__header">
      <h1 class="map-page__title">Explore the Map</h1>
      <p class="map-page__subtitle">
        Discover {{ totalCountries }} countries represented across
        {{ totalWomen }} women in the archive. Tap a country to see its women.
      </p>
    </header>

    <div class="map-page__legend">
      <span class="map-page__legend-label">Fewer</span>
      <span class="map-page__legend-swatch map-page__legend-swatch--empty" />
      <span class="map-page__legend-swatch map-page__legend-swatch--low" />
      <span class="map-page__legend-swatch map-page__legend-swatch--mid" />
      <span class="map-page__legend-swatch map-page__legend-swatch--high" />
      <span class="map-page__legend-swatch map-page__legend-swatch--max" />
      <span class="map-page__legend-label">More</span>
    </div>

    <ClientOnly>
      <AfricaMap :country-counts="countryCounts" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { normalizeCountryName } from '~/utils/constants/countries'

const { data: allWomen } = await useAsyncData('map-women', () =>
  queryCollection('women').order('name', 'ASC').all(),
)

const countryCounts = computed(() => {
  const counts: Record<string, number> = {}
  if (!allWomen.value) return counts
  for (const woman of allWomen.value) {
    const name = normalizeCountryName(woman.country)
    counts[name] = (counts[name] ?? 0) + 1
  }
  return counts
})

const totalWomen = computed(() => allWomen.value?.length ?? 0)

const totalCountries = computed(() => Object.keys(countryCounts.value).length)

const mapDescription =
  'Interactive map of Africa showing women in the HerStory Africa archive by country.'

useSeoMeta({
  title: 'Explore the Map',
  description: mapDescription,
  ogTitle: 'Explore the Map — HerStory Africa',
  ogDescription: mapDescription,
  ogImage: getAbsoluteUrl(),
  ogUrl: getAbsoluteUrl('/map'),
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Explore the Map — HerStory Africa',
  twitterDescription: mapDescription,
  twitterImage: getAbsoluteUrl(),
})
</script>

<style scoped>
.map-page {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .map-page {
    padding: 2.5rem 2rem 4rem;
  }
}

.map-page__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.map-page__title {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.map-page__subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
  max-width: 40rem;
}

/* Legend */
.map-page__legend {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 1.5rem;
}

.map-page__legend-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.map-page__legend-swatch {
  width: 1.5rem;
  height: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid var(--border-light);
}

.map-page__legend-swatch--empty {
  background: var(--surface-muted);
}

.map-page__legend-swatch--low {
  background: color-mix(in srgb, var(--color-primary) 25%, var(--surface-muted));
}

.map-page__legend-swatch--mid {
  background: color-mix(in srgb, var(--color-primary) 45%, var(--surface-muted));
}

.map-page__legend-swatch--high {
  background: color-mix(in srgb, var(--color-primary) 70%, var(--surface-muted));
}

.map-page__legend-swatch--max {
  background: var(--color-primary);
}
</style>
