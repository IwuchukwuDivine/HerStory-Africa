<template>
  <section v-if="cards.length" id="paths" class="section section--wide paths">
    <MuseumLabel
      eyebrow="Reading paths"
      title="Don't know where to start?"
      subtitle="Short, ordered sets chosen by our editors. Twenty minutes each."
      class="paths__label"
    />

    <div class="paths__grid">
      <ReadingPathCard
        v-for="card in cards"
        :key="card.slug"
        :title="card.title"
        :slug="card.slug"
        :kicker="card.kicker"
        :description="card.description"
        :count="card.count"
        :minutes="card.minutes"
        :faces="card.faces"
        :read-count="card.readCount"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { hasPortrait } from "~/utils/format";

const FACE_COUNT = 5;

const { data: paths } = await useAsyncData("home-paths", () =>
  queryCollection("paths").select("title", "slug", "kicker", "description", "steps").all(),
);

/* One query for every woman that appears in any path. */
const stepSlugs = computed(() => {
  const slugs = new Set<string>();
  for (const path of paths.value ?? []) {
    for (const step of path.steps) slugs.add(step.slug);
  }
  return [...slugs];
});

const { data: stepWomen } = await useAsyncData("home-path-women", () =>
  stepSlugs.value.length
    ? queryCollection("women")
        .select("slug", "name", "image", "readingTime")
        .where("slug", "IN", stepSlugs.value)
        .all()
    : Promise.resolve([]),
);

/* Read counts come from localStorage, so they only apply after mount. */
const { isRead } = useApp();
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const cards = computed(() => {
  const bySlug = new Map((stepWomen.value ?? []).map((w) => [w.slug, w]));
  return (paths.value ?? []).map((path) => {
    const women = path.steps.map((s) => bySlug.get(s.slug)).filter((w) => !!w);
    const minutes = women.reduce((sum, w) => sum + (w.readingTime ?? 0), 0);
    const faces = women
      .map((w) => w.image)
      .filter((image) => hasPortrait(image))
      .slice(0, FACE_COUNT);
    const readCount = mounted.value
      ? path.steps.filter((s) => isRead("woman", s.slug)).length
      : 0;
    return {
      title: path.title,
      slug: path.slug,
      kicker: path.kicker,
      description: path.description,
      count: path.steps.length,
      minutes: Math.max(1, Math.round(minutes)),
      faces,
      readCount,
    };
  });
});
</script>

<style scoped>
.paths__label {
  margin-bottom: 20px;
}

.paths__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .paths__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .paths__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
