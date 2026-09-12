<template>
  <section class="section section--wide regions">
    <div class="regions__grid">
      <div class="regions__text">
        <MuseumLabel
          eyebrow="Browse by region"
          :title="`Five regions, ${counts.countries} countries`"
          class="regions__label"
        />
        <RegionRows :rows="regionRows" />
      </div>

      <!-- The choropleth is desktop-only; on phones the rows carry the counts. -->
      <div class="regions__map">
        <div class="regions__legend" aria-hidden="true">
          <span class="regions__legend-label">Fewer</span>
          <span class="regions__legend-swatch regions__legend-swatch--empty" />
          <span class="regions__legend-swatch regions__legend-swatch--low" />
          <span class="regions__legend-swatch regions__legend-swatch--mid" />
          <span class="regions__legend-swatch regions__legend-swatch--high" />
          <span class="regions__legend-swatch regions__legend-swatch--max" />
          <span class="regions__legend-label">More</span>
        </div>
        <ClientOnly>
          <AfricaMap v-if="isDesktop" :country-counts="countryCounts" />
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { normalizeCountryName } from "~/utils/constants/countries";

const { counts, regionRows } = await useArchiveCounts();

const { data: allWomen } = await useAsyncData("browse-region-women", () =>
  queryCollection("women").select("slug", "country").all(),
);

const countryCounts = computed(() => {
  const result: Record<string, number> = {};
  for (const woman of allWomen.value ?? []) {
    const name = normalizeCountryName(woman.country);
    result[name] = (result[name] ?? 0) + 1;
  }
  return result;
});

/* Skip mounting the SVG map entirely below the desktop breakpoint. */
const isDesktop = useMediaQuery("(min-width: 1024px)");
</script>

<style scoped>
.regions__text {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.regions__map {
  display: none;
}

.regions__legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: 12px;
}

.regions__legend-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.regions__legend-swatch {
  width: 24px;
  height: 12px;
  border-radius: 4px;
  border: 1px solid var(--border-light);
}

.regions__legend-swatch--empty {
  background: var(--surface-muted);
}

.regions__legend-swatch--low {
  background: color-mix(in srgb, var(--color-primary) 25%, var(--surface-muted));
}

.regions__legend-swatch--mid {
  background: color-mix(in srgb, var(--color-primary) 45%, var(--surface-muted));
}

.regions__legend-swatch--high {
  background: color-mix(in srgb, var(--color-primary) 70%, var(--surface-muted));
}

.regions__legend-swatch--max {
  background: var(--color-primary);
}

@media (min-width: 1024px) {
  .regions__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 440px;
    gap: 64px;
    align-items: center;
  }

  .regions__map {
    display: block;
  }
}
</style>
