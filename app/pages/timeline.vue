<template>
  <div class="timeline">
    <header class="timeline__header">
      <MuseumLabel
        level="h1"
        :eyebrow="`Across the centuries · ${totalCount} women`"
        title="Timeline"
      />
      <p class="timeline__intro">
        Every woman in the archive in the order she was born, from the queens
        who ruled before colonial borders were drawn to the leaders shaping the
        continent today.
      </p>
    </header>

    <div v-if="groupedEras.length" class="timeline__body">
      <section v-for="era in groupedEras" :key="era.label" class="timeline__era">
        <MuseumLabel
          :eyebrow="`${era.eyebrow} · ${era.women.length} ${era.women.length === 1 ? 'woman' : 'women'}`"
          :title="era.heading"
          :subtitle="era.description"
        />

        <ol class="timeline__track">
          <li v-for="woman in era.women" :key="woman.slug" class="timeline__entry">
            <div class="timeline__marker" aria-hidden="true">
              <span class="timeline__year">{{ yearLabel(woman.born) }}</span>
              <span class="timeline__dot" />
            </div>
            <WomanRow
              :name="woman.name"
              :slug="woman.slug"
              :image="woman.image"
              :country="woman.country"
              :born="woman.born"
              :died="woman.died"
              :focal="woman.ogFocal"
              :meta="`${woman.country} · ${lifespan(woman.born, woman.died)}`"
              :thumb="48"
              :priority="woman.index < 2"
              class="timeline__row"
            />
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ERAS } from "~/utils/constants/content";
import { ERA_HUBS } from "~/utils/constants/hubs";
import { lifespan } from "~/utils/format";

const { data: allWomen } = await useAsyncData("timeline-all", () =>
  queryCollection("women")
    .select("name", "slug", "image", "country", "born", "died", "era", "ogFocal")
    .order("born", "ASC")
    .all(),
);

const totalCount = computed(() => allWomen.value?.length ?? 0);

type Woman = NonNullable<typeof allWomen.value>[number] & { index: number };

/** "Pre-Colonial" -> "Pre-colonial" for the eyebrow; the hub heading is already sentence case. */
function eraEyebrow(era: string): string {
  return era.charAt(0) + era.slice(1).toLowerCase();
}

/** Chronological groups in era order; each carries the hub copy for its label. */
const groupedEras = computed(() => {
  const women = (allWomen.value ?? []).map((w, index): Woman => ({ ...w, index }));
  return ERAS.map((era) => ({
    label: era,
    eyebrow: eraEyebrow(era),
    heading: ERA_HUBS[era].heading,
    description: ERA_HUBS[era].description,
    women: women.filter((w) => w.era === era),
  })).filter((group) => group.women.length > 0);
});

/** "60 BC" for negative years, otherwise the year as written. */
function yearLabel(born: number): string {
  return born < 0 ? `${Math.abs(born)} BC` : String(born);
}

useSeoMeta({
  title: "Timeline",
  description:
    "A chronological timeline of African women who shaped history, from pre-colonial queens to contemporary leaders.",
  ogTitle: "Timeline | HerStory Africa",
  ogDescription:
    "Explore the full timeline of African women who fought for equality across the centuries.",
  ogUrl: getAbsoluteUrl("/timeline"),
});

defineOgImage("Card", {
  variant: "page",
  pill: "Timeline",
  title: "Timeline",
  description:
    "A chronological timeline of African women who shaped history, from pre-colonial queens to contemporary leaders.",
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/timeline") }],
});
</script>

<style scoped>
.timeline {
  max-width: 48rem;
  margin: 0 auto;
  padding: 28px 24px 56px;
}

@media (min-width: 768px) {
  .timeline {
    padding: 40px 32px 64px;
  }
}

.timeline__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.timeline__intro {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.timeline__era + .timeline__era {
  margin-top: 48px;
}

@media (min-width: 768px) {
  .timeline__era + .timeline__era {
    margin-top: 64px;
  }
}

.timeline__track {
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
}

.timeline__entry {
  display: flex;
  gap: 12px;
}

/* Year and dot sit on the row's centre line (64px row, 10px dot). The vertical
   rule is drawn behind the dot and runs the full height of the entry. */
.timeline__marker {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 10px;
  width: 72px;
  padding-top: 25px;
}

.timeline__marker::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  right: 4.25px;
  width: 1.5px;
  background: var(--border-light);
}

.timeline__entry:first-child .timeline__marker::before {
  top: 27px;
}

.timeline__entry:last-child .timeline__marker::before {
  bottom: auto;
  height: 37px;
}

.timeline__year {
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  color: var(--text-gold);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.timeline__dot {
  position: relative;
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: 2px;
  border-radius: 50%;
  background: var(--color-primary);
}

.timeline__row {
  flex: 1;
  min-width: 0;
}
</style>
