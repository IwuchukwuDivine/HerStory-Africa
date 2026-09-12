<template>
  <HubPage
    kind="region"
    :heading="copy.heading"
    :intro="copy.intro"
    :women="women"
    back-label="Women · By region"
    back-to="/women"
    :featured-slugs="HUB_FEATURED.region[region]"
    :scope-label="region"
  />
</template>

<script setup lang="ts">
import { REGIONS } from "~/utils/constants/content";
import { REGION_HUBS, HUB_FEATURED, hubTitle } from "~/utils/constants/hubs";

const route = useRoute();
const slug = route.params.slug as string;
const region = unslugify(REGIONS, slug);

if (!region) {
  throw createError({
    statusCode: 404,
    statusMessage: "Region not found",
    fatal: true,
  });
}

const copy = REGION_HUBS[region];

const { data } = await useAsyncData(`hub-region-${slug}`, () =>
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
    .where("region", "=", region)
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
