<template>
  <aside v-if="relatedWomen.length" class="related-women" aria-label="Related women">
    <MuseumLabel eyebrow="Keep reading" :title="title" />
    <div class="related-women__list">
      <WomanRow
        v-for="w in relatedWomen"
        :key="w.slug"
        :name="w.name"
        :slug="w.slug"
        :image="w.image"
        :country="w.country"
        :born="w.born"
        :died="w.died"
        :focal="w.ogFocal"
        :thumb="56"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { sentenceCase } from "~/utils/format";

/** Three related profiles as rows, scored by shared causes, then era, then region. */
const props = defineProps<{
  slug: string;
  region: string;
  era: string;
  causes: string[];
}>();

const { data: candidates } = await useAsyncData(`related-${props.slug}`, () =>
  queryCollection("women")
    .where("slug", "<>", props.slug)
    .select("name", "slug", "image", "country", "born", "died", "ogFocal", "era", "region", "causes")
    .limit(30)
    .all(),
);

const relatedWomen = computed(() => {
  if (!candidates.value?.length) return [];

  const scored = candidates.value.map((w) => {
    let score = 0;
    const sharedCauses = w.causes.filter((c) => props.causes.includes(c)).length;
    score += sharedCauses * 3;
    if (w.era === props.era) score += 2;
    if (w.region === props.region) score += 1;
    return { woman: w, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.woman);
});

const matchReason = computed(() => {
  const first = relatedWomen.value[0];
  if (!first) return "region";
  if (first.causes.some((c) => props.causes.includes(c))) return "cause";
  if (first.era === props.era) return "era";
  return "region";
});

const title = computed(() => {
  switch (matchReason.value) {
    case "cause":
      return "Women in similar causes";
    case "era":
      return sentenceCase(`More from the ${props.era} era`, [props.era]);
    default:
      return `More from ${props.region}`;
  }
});
</script>

<style scoped>
.related-women {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 40px;
}

.related-women__list {
  display: flex;
  flex-direction: column;
}
</style>
