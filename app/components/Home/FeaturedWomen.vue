<template>
  <section class="section section--wide featured">
    <MuseumLabel eyebrow="Newest in the archive" :title="title" class="featured__label">
      <NuxtLink to="/women" class="section__cta">View all →</NuxtLink>
    </MuseumLabel>

    <div v-if="women?.length" class="compact-grid compact-grid--4">
      <WomanCardCompact
        v-for="(woman, i) in women"
        :key="woman.slug"
        :priority="i < 2"
        :name="woman.name"
        :slug="woman.slug"
        :image="woman.image"
        :country="woman.country"
        :born="woman.born"
        :died="woman.died"
        :era="woman.era"
        :focal="woman.ogFocal"
        :badge="isNew(woman.dateAdded) ? 'New' : ''"
      />
    </div>
    <div v-else class="compact-grid compact-grid--4" aria-hidden="true">
      <div v-for="n in 4" :key="n" class="featured__skeleton">
        <div class="skeleton featured__skeleton-image" />
        <div class="skeleton featured__skeleton-name" />
        <div class="skeleton featured__skeleton-meta" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: women } = await useAsyncData("featured-women", () =>
  queryCollection("women")
    .select("name", "slug", "image", "country", "born", "died", "era", "dateAdded", "ogFocal")
    .where("image", "<>", "/women/placeholder.svg")
    .where("image", "<>", "")
    .order("dateAdded", "DESC")
    .limit(4)
    .all(),
);

/* Set by the default layout after mount; 0 on a first visit. */
const { previousVisitAt } = useReadingSession();

const title = computed(() =>
  previousVisitAt.value > 0 ? "Added since your last visit" : "Added this month",
);

function isNew(dateAdded: string) {
  return previousVisitAt.value > 0 && new Date(dateAdded).getTime() > previousVisitAt.value;
}
</script>

<style scoped>
.featured__label {
  margin-bottom: 20px;
}

@media (min-width: 768px) {
  .featured__label {
    margin-bottom: 24px;
  }
}

.featured__skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.featured__skeleton-image {
  aspect-ratio: 4 / 5;
  border-radius: 12px;
}

.featured__skeleton-name {
  height: 16px;
  width: 70%;
}

.featured__skeleton-meta {
  height: 13px;
  width: 50%;
}
</style>
