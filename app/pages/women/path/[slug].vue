<template>
  <!-- Placeholder: the reading-path page proper is built in a later phase.
       Only the data load, the 404, and the OG card are final here. -->
  <main>
    <h1>{{ path?.title }}</h1>
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const contentPath = route.path.replace(/\/+$/, "") || "/";

const { data: path } = await useAsyncData(`path-${contentPath}`, () =>
  queryCollection("paths").path(contentPath).first(),
);

if (!path.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Reading path not found",
    fatal: true,
  });
}

/* The woman whose portrait fronts the card. */
const { data: cover } = await useAsyncData(`path-cover-${contentPath}`, () =>
  path.value
    ? queryCollection("women")
        .where("slug", "=", path.value.cover)
        .select("image", "ogFocal")
        .first()
    : Promise.resolve(null),
);

defineOgImage("Card", {
  variant: "page",
  pill: "A reading path",
  title: () => path.value?.title ?? "",
  description: () => path.value?.description ?? "",
  image: () => cover.value?.image ?? "",
  focal: () => cover.value?.ogFocal ?? "50% 20%",
});
</script>
