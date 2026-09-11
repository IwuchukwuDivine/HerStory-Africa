<template>
  <HubPage
    kind="cause"
    :heading="copy.heading"
    :intro="copy.intro"
    :women="women"
    back-label="Women · By cause"
    back-to="/women"
    :scope-label="cause"
  />
</template>

<script setup lang="ts">
import { CAUSE_HUB_MIN_WOMEN } from "~/utils/constants/content";
import {
  CAUSE_INTROS,
  causeIntro,
  causeHeading,
  hubTitle,
} from "~/utils/constants/hubs";

const route = useRoute();
const slug = route.params.slug as string;

// The cause list comes from the data itself, since profiles use many more
// causes than the CAUSES constant lists. Only causes shared by at least
// CAUSE_HUB_MIN_WOMEN women get a page.
const { data: causeIndex } = await useAsyncData("hub-cause-index", () =>
  queryCollection("women").select("causes").all(),
);

const hubs = causeHubs(causeIndex.value ?? [], CAUSE_HUB_MIN_WOMEN);
const hub = hubs.find((h) => h.slug === slug);

if (!hub) {
  throw createError({
    statusCode: 404,
    statusMessage: "Cause not found",
    fatal: true,
  });
}

const cause = hub.cause;

const copy = {
  heading: causeHeading(cause, titleCaseCause(cause)),
  intro: CAUSE_INTROS[cause] ?? causeIntro(cause, hub.count),
  description: seoDescription(
    `${hub.count} African women who fought for ${cause.charAt(0).toLowerCase()}${cause.slice(1)}: their lives, achievements, and impact today, from the HerStory Africa archive.`,
  ),
};

// causes is stored as a JSON array, so match the quoted value inside it.
const { data } = await useAsyncData(`hub-cause-${slug}`, () =>
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
    .where("causes", "LIKE", `%"${cause}"%`)
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
