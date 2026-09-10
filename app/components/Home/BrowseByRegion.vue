<template>
  <section class="section regions">
    <div class="section__header">
      <h2 class="section__title">Browse by Region</h2>
      <p class="section__subtitle">
        {{ totalCountries }} countries, {{ totalWomen }} women — tap a country
        to explore.
      </p>
    </div>

    <div class="regions__legend">
      <span class="regions__legend-label">Fewer</span>
      <span class="regions__legend-swatch regions__legend-swatch--empty" />
      <span class="regions__legend-swatch regions__legend-swatch--low" />
      <span class="regions__legend-swatch regions__legend-swatch--mid" />
      <span class="regions__legend-swatch regions__legend-swatch--high" />
      <span class="regions__legend-swatch regions__legend-swatch--max" />
      <span class="regions__legend-label">More</span>
    </div>

    <ClientOnly>
      <AfricaMap :country-counts="countryCounts" />
    </ClientOnly>

    <nav class="regions__links" aria-label="Browse by region">
      <NuxtLink
        v-for="region in REGIONS"
        :key="region"
        :to="`/women/region/${slugify(region)}`"
        class="region-pill"
      >
        {{ region }}
        <span class="region-pill__count">{{ regionCounts[region] ?? 0 }}</span>
      </NuxtLink>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { normalizeCountryName } from "~/utils/constants/countries";
import { REGIONS } from "~/utils/constants/content";

const { data: allWomen } = await useAsyncData("browse-region-women", () =>
  queryCollection("women").order("name", "ASC").all(),
);

const countryCounts = computed(() => {
  const counts: Record<string, number> = {};
  if (!allWomen.value) return counts;
  for (const woman of allWomen.value) {
    const name = normalizeCountryName(woman.country);
    counts[name] = (counts[name] ?? 0) + 1;
  }
  return counts;
});

const regionCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const woman of allWomen.value ?? []) {
    counts[woman.region] = (counts[woman.region] ?? 0) + 1;
  }
  return counts;
});

const totalWomen = computed(() => allWomen.value?.length ?? 0);
const totalCountries = computed(() => Object.keys(countryCounts.value).length);
</script>

<style scoped>
.regions {
  padding: 2rem 1.5rem 0rem;
}

.regions__legend {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 1.5rem;
}

.regions__legend-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.regions__legend-swatch {
  width: 1.5rem;
  height: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid var(--border-light);
}

.regions__legend-swatch--empty {
  background: var(--surface-muted);
}

.regions__legend-swatch--low {
  background: color-mix(
    in srgb,
    var(--color-primary) 25%,
    var(--surface-muted)
  );
}

.regions__legend-swatch--mid {
  background: color-mix(
    in srgb,
    var(--color-primary) 45%,
    var(--surface-muted)
  );
}

.regions__legend-swatch--high {
  background: color-mix(
    in srgb,
    var(--color-primary) 70%,
    var(--surface-muted)
  );
}

.regions__legend-swatch--max {
  background: var(--color-primary);
}

.regions__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin: 1.5rem 0 2.5rem;
}

.region-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.125rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.region-pill__count {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.7;
}

.region-pill:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
  transform: translateY(-1px);
}
</style>
