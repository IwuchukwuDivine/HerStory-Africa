<template>
  <div class="hub">
    <!-- 1. Header on the muted wash -->
    <header class="hub__header wash">
      <div class="hub__header-inner">
        <NuxtLink :to="backTo" class="back-link">
          <LucideArrowLeft :size="18" />
          {{ backLabel }}
        </NuxtLink>

        <MuseumLabel level="h1" :eyebrow="collectionEyebrow" :title="heading" />

        <p class="hub__intro">{{ shortIntro }}</p>

        <div v-if="scopeChips.length > 1" class="hub__scopes" role="group" :aria-label="`Filter by ${scopeNoun}`">
          <button
            type="button"
            class="pill pill--sm"
            :class="scope ? 'pill--secondary' : 'pill--primary'"
            :aria-pressed="scope ? 'false' : 'true'"
            @click="scope = ''"
          >
            All {{ scopeNoun }}s
          </button>
          <button
            v-for="chip in scopeChips"
            :key="chip.label"
            type="button"
            class="pill pill--sm"
            :class="scope === chip.label ? 'pill--primary' : 'pill--secondary'"
            :aria-pressed="scope === chip.label ? 'true' : 'false'"
            @click="scope = scope === chip.label ? '' : chip.label"
          >
            {{ chip.label }} <span class="hub__scope-count">{{ chip.count }}</span>
          </button>
        </div>
      </div>
    </header>

    <div class="hub__body">
      <!-- 2. Start here -->
      <section v-if="picks.length === 3" class="hub__section">
        <MuseumLabel eyebrow="Start here" title="Three women to meet first" />
        <div class="hub__start">
        <FeatureCard
          :name="picks[0]!.name"
          :slug="picks[0]!.slug"
          :image="picks[0]!.image"
          :country="picks[0]!.country"
          :eyebrow="`${picks[0]!.era} · ${picks[0]!.country} · ${lifespan(picks[0]!.born, picks[0]!.died)}`"
          :summary="clip(picks[0]!.summary, 120)"
          :focal="picks[0]!.ogFocal"
          aspect="16 / 11"
          priority
        />
        <div class="compact-grid">
          <WomanCardCompact
            v-for="w in picks.slice(1)"
            :key="w.slug"
            :name="w.name"
            :slug="w.slug"
            :image="w.image"
            :country="w.country"
            :born="w.born"
            :died="w.died"
            :era="w.era"
            :focal="w.ogFocal"
            priority
          />
        </div>
        </div>
      </section>

      <!-- 3. All, A to Z -->
      <section class="hub__section">
        <MuseumLabel :eyebrow="listEyebrow" title="A to Z">
          <span class="hub__sorted">Sorted by name</span>
        </MuseumLabel>

        <div v-if="listed.length" class="hub__list">
          <template v-for="(group, gi) in groups" :key="group.letter">
            <div class="hub__divider" :class="{ 'hub__divider--first': gi === 0 }">
              {{ group.letter }}
            </div>
            <WomanRow
              v-for="w in group.women"
              :key="w.slug"
              :name="w.name"
              :slug="w.slug"
              :image="w.image"
              :country="w.country"
              :born="w.born"
              :died="w.died"
              :focal="w.ogFocal"
              :thumb="48"
              :priority="w.index < 2"
            />
          </template>
        </div>
        <p v-else class="hub__none">No women in this collection match {{ scope }} yet.</p>
      </section>

      <!-- 4. Other hubs -->
      <section v-if="otherRows.length" class="hub__section">
        <MuseumLabel :eyebrow="otherEyebrow" />
        <RegionRows :rows="otherRows" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { REGIONS, ERAS, CAUSE_HUB_MIN_WOMEN } from "~/utils/constants/content";
import { clip, hasPortrait, initialOf, lifespan } from "~/utils/format";

/** A woman as the hub pages select her. */
export interface HubWoman {
  name: string;
  slug: string;
  image: string;
  country: string;
  born: number | null;
  died: number | null;
  era: string;
  region: string;
  summary: string;
  featured?: boolean;
  dateAdded?: string;
  ogFocal?: string;
}

/**
 * Collection page for a region, era, or cause: header on the wash with scope
 * chips, three curated women, the full set as A to Z rows, then sibling hubs.
 */
const props = withDefaults(
  defineProps<{
    kind: "region" | "era" | "cause";
    heading: string;
    intro: string;
    women: HubWoman[];
    backLabel: string;
    backTo: string;
    featuredSlugs?: string[];
    /** The value this hub is scoped to (the region, era, or cause). */
    scopeLabel: string;
  }>(),
  { featuredSlugs: () => [] },
);

/* ── Header ── */
const distinct = (pick: (w: HubWoman) => string) => new Set(props.women.map(pick)).size;

const collectionEyebrow = computed(() => {
  const n = props.women.length;
  const women = `${n} ${n === 1 ? "woman" : "women"}`;
  if (props.kind === "era") {
    const k = distinct((w) => w.region);
    return `A collection · ${women} · ${k} ${k === 1 ? "region" : "regions"}`;
  }
  const k = distinct((w) => w.country);
  return `A collection · ${women} · ${k} ${k === 1 ? "country" : "countries"}`;
});

const shortIntro = computed(() => {
  const sentences = props.intro.split(". ");
  if (sentences.length <= 2) return props.intro;
  return `${sentences.slice(0, 2).join(". ")}.`;
});

/* ── Scope chips: eras on region and cause hubs, regions on era hubs ── */
const scope = ref("");
const scopeNoun = computed(() => (props.kind === "era" ? "region" : "era"));

const scopeChips = computed(() => {
  const order: readonly string[] = props.kind === "era" ? REGIONS : ERAS;
  const pick = (w: HubWoman) => (props.kind === "era" ? w.region : w.era);
  const counts = new Map<string, number>();
  for (const w of props.women) counts.set(pick(w), (counts.get(pick(w)) ?? 0) + 1);
  return order
    .filter((label) => counts.has(label))
    .map((label) => ({ label, count: counts.get(label)! }));
});

/* ── Start here ── */
const picks = computed<HubWoman[]>(() => {
  const withPhoto = props.women.filter((w) => hasPortrait(w.image));
  if (withPhoto.length < 3) return [];

  const bySlug = new Map(props.women.map((w) => [w.slug, w]));
  const chosen: HubWoman[] = [];
  const taken = new Set<string>();
  const add = (w: HubWoman | undefined) => {
    if (!w || taken.has(w.slug) || chosen.length >= 3) return;
    taken.add(w.slug);
    chosen.push(w);
  };

  for (const slug of props.featuredSlugs) add(bySlug.get(slug));

  const newestFirst = (a: HubWoman, b: HubWoman) => (b.dateAdded ?? "").localeCompare(a.dateAdded ?? "");
  for (const w of withPhoto.filter((w) => w.featured).sort(newestFirst)) add(w);
  for (const w of withPhoto) add(w);

  return chosen.length === 3 ? chosen : [];
});

/* ── A to Z list, respecting the scope chip ── */
const listed = computed(() => {
  const pick = (w: HubWoman) => (props.kind === "era" ? w.region : w.era);
  const rows = scope.value ? props.women.filter((w) => pick(w) === scope.value) : props.women;
  return [...rows]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((w, index) => ({ ...w, index }));
});

const groups = computed(() => {
  const byLetter = new Map<string, typeof listed.value>();
  for (const w of listed.value) {
    const letter = initialOf(w.name);
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter)!.push(w);
  }
  return [...byLetter.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, women]) => ({ letter, women }));
});

const listEyebrow = computed(() =>
  scope.value ? `${scope.value} · ${listed.value.length}` : `All ${listed.value.length}`,
);

/* ── Other hubs ── */
const { regionRows, eraRows } = await useArchiveCounts();

const { data: causeIndex } = await useAsyncData(`hub-others-${props.kind}`, () =>
  props.kind === "cause"
    ? queryCollection("women").select("causes").all()
    : Promise.resolve([] as { causes: string[] }[]),
);

const otherEyebrow = computed(() =>
  props.kind === "region" ? "Other regions" : props.kind === "era" ? "Other eras" : "Other causes",
);

const otherRows = computed(() => {
  if (props.kind === "region") return regionRows.value.filter((r) => r.label !== props.scopeLabel);
  if (props.kind === "era") return eraRows.value.filter((r) => r.label !== props.scopeLabel);
  return causeHubs(causeIndex.value ?? [], CAUSE_HUB_MIN_WOMEN)
    .filter((h) => h.cause !== props.scopeLabel)
    .slice(0, 8)
    .map((h) => ({ label: h.cause, count: h.count, to: `/women/cause/${h.slug}` }));
});
</script>

<style scoped>
.hub {
  padding-bottom: 56px;
}

@media (min-width: 768px) {
  .hub {
    padding-bottom: 64px;
  }
}

.hub__header {
  padding: 20px 24px 32px;
}

@media (min-width: 768px) {
  .hub__header {
    padding: 28px 32px 48px;
  }
}

.hub__header-inner {
  max-width: 64rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hub__intro {
  max-width: 42rem;
  margin: 0;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.hub__scopes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hub__scopes .pill--secondary {
  font-weight: 500;
}

.hub__scope-count {
  opacity: 0.75;
  font-weight: 500;
}

.hub__body {
  max-width: 64rem;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

@media (min-width: 768px) {
  .hub__body {
    padding: 0 32px;
    gap: 64px;
  }
}

.hub__section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hub__section:first-child {
  padding-top: 36px;
}

@media (min-width: 768px) {
  .hub__section:first-child {
    padding-top: 48px;
  }
}

.hub__sorted {
  font-size: 13px;
  color: var(--text-muted);
}

.hub__list {
  display: flex;
  flex-direction: column;
}

.hub__divider {
  padding: 20px 0 4px;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-gold);
}

.hub__divider--first {
  padding-top: 12px;
}

.hub__none {
  margin: 0;
  font-size: 15px;
  color: var(--text-muted);
}

@media (min-width: 768px) {
  .hub__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 32px;
  }

  .hub__divider {
    grid-column: 1 / -1;
  }
}

.hub__start {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 768px) {
  .hub__start {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
}
</style>
