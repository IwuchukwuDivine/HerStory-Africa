<template>
  <div class="hub">
    <nav class="hub__crumbs" aria-label="Breadcrumb">
      <NuxtLink to="/women" class="hub__crumb">Women</NuxtLink>
      <span class="hub__crumb-sep" aria-hidden="true">/</span>
      <span class="hub__crumb">By cause</span>
    </nav>

    <header class="hub__header">
      <h1 class="hub__title">{{ copy.heading }}</h1>
      <p class="hub__intro">{{ copy.intro }}</p>
      <p class="hub__count">
        {{ women.length }} {{ women.length === 1 ? "woman" : "women" }} in the
        archive
      </p>
    </header>

    <div class="hub__grid">
      <WomanCard
        v-for="woman in women"
        :key="woman.slug"
        :name="woman.name"
        :slug="woman.slug"
        :image="woman.image"
        :country="woman.country"
        :born="woman.born"
        :died="woman.died"
        :era="woman.era"
        :summary="woman.summary"
        :causes="woman.causes"
      />
    </div>

    <footer class="hub__footer">
      <div class="hub__siblings">
        <h2 class="hub__siblings-title">More causes</h2>
        <ul class="hub__sibling-list">
          <li v-for="h in otherCauses" :key="h.slug">
            <NuxtLink :to="`/women/cause/${h.slug}`" class="hub__pill">
              {{ h.cause }}
              <span class="hub__pill-count">{{ h.count }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="hub__siblings">
        <h2 class="hub__siblings-title">Browse by region</h2>
        <ul class="hub__sibling-list">
          <li v-for="r in REGIONS" :key="r">
            <NuxtLink :to="`/women/region/${slugify(r)}`" class="hub__pill">
              {{ REGION_HUBS[r].label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <p class="hub__more">
        <NuxtLink to="/women" class="hub__more-link"
          >Search and filter every woman</NuxtLink
        >
        <span aria-hidden="true">·</span>
        <NuxtLink to="/women/all" class="hub__more-link">All women A to Z</NuxtLink>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { REGIONS, CAUSE_HUB_MIN_WOMEN } from "~/utils/constants/content";
import {
  REGION_HUBS,
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
const otherCauses = hubs.filter((h) => h.slug !== slug).slice(0, 12);

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
      "born",
      "died",
      "era",
      "summary",
      "causes",
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

<style scoped>
.hub {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .hub {
    padding: 2.5rem 2rem 4rem;
  }
}

.hub__crumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.hub__crumb {
  color: inherit;
  text-decoration: none;
}

a.hub__crumb:hover {
  color: var(--color-primary);
}

.hub__header {
  max-width: 44rem;
  margin-bottom: 2.25rem;
}

.hub__title {
  font-size: clamp(1.625rem, 3.5vw, 2.375rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--text-primary);
  margin: 0 0 0.875rem;
}

.hub__intro {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 0.75rem;
}

.hub__count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
}

.hub__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 480px) {
  .hub__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .hub__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

.hub__footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.hub__siblings-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin: 0 0 0.75rem;
}

.hub__sibling-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hub__pill {
  display: inline-block;
  padding: 0.4375rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.15s ease;
}

.hub__pill:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
}

.hub__pill-count {
  margin-left: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.7;
}

.hub__more {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin: 0;
}

.hub__more-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.hub__more-link:hover {
  text-decoration: underline;
}
</style>
