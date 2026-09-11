<template>
  <HubPage
    kind="era"
    :heading="copy.heading"
    :intro="copy.intro"
    :women="women"
    back-label="Women · By era"
    back-to="/women"
    :featured-slugs="HUB_FEATURED.era[era]"
    :scope-label="era"
  />
</template>

<script setup lang="ts">
import { ERAS } from "~/utils/constants/content";
import { ERA_HUBS, HUB_FEATURED, hubTitle } from "~/utils/constants/hubs";

const route = useRoute();
const slug = route.params.slug as string;
const era = unslugify(ERAS, slug);

if (!era) {
  throw createError({
    statusCode: 404,
    statusMessage: "Era not found",
    fatal: true,
  });
}

const copy = ERA_HUBS[era];

// LIKE rather than = so "Pre-colonial" in older frontmatter still matches.
const { data } = await useAsyncData(`hub-era-${slug}`, () =>
  queryCollection("women")
    .select(
      "name",
      "slug",
      "image",
      "country",
      "region",
      "born",
      "died",
      "era",
      "summary",
      "featured",
      "dateAdded",
      "ogFocal",
    )
    .where("era", "LIKE", era)
    .order("name", "ASC")
    .all(),
);

const women = computed(() => data.value ?? []);

const canonicalUrl = getAbsoluteUrl(route.path);
const title = hubTitle(copy.heading);

useHead({ titleTemplate: "%s" });

useSeoMeta({
  title,
  description: copy.description,
  ogTitle: copy.heading,
  ogDescription: copy.description,
  ogUrl: canonicalUrl,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: copy.heading,
  twitterDescription: copy.description,
});

defineOgImage("Card", {
  variant: "page",
  pill: () => `${women.value.length} women`,
  title: copy.heading,
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: copy.heading,
        description: copy.description,
        url: canonicalUrl,
        isPartOf: {
          "@type": "WebSite",
          name: "HerStory Africa",
          url: getAbsoluteUrl("/"),
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: women.value.length,
          itemListElement: women.value.map((w, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: getAbsoluteUrl(`/women/${w.slug}`),
            name: w.name,
          })),
        },
      }),
    },
  ],
}));
</script>
