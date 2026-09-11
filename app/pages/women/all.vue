<template>
  <div class="az">
    <nav class="az__crumbs" aria-label="Breadcrumb">
      <NuxtLink to="/women" class="az__crumb">Women</NuxtLink>
      <span class="az__crumb-sep" aria-hidden="true">/</span>
      <span class="az__crumb">A to Z</span>
    </nav>

    <header class="az__header">
      <h1 class="az__title">All Women A to Z</h1>
      <p class="az__intro">
        Every one of the {{ total }} women in the HerStory Africa archive, listed
        by first name. Looking for something more specific? You can
        <NuxtLink to="/women" class="az__link">search and filter the archive</NuxtLink>
        or browse by
        <NuxtLink to="/women/region/west-africa" class="az__link">region</NuxtLink>,
        <NuxtLink to="/women/era/colonial" class="az__link">era</NuxtLink>, or
        <NuxtLink to="/women/cause/womens-rights" class="az__link">cause</NuxtLink>.
      </p>
    </header>

    <nav class="az__jump" aria-label="Jump to letter">
      <a
        v-for="group in groups"
        :key="group.letter"
        :href="`#letter-${group.letter}`"
        class="az__jump-link"
      >
        {{ group.letter }}
      </a>
    </nav>

    <section
      v-for="group in groups"
      :id="`letter-${group.letter}`"
      :key="group.letter"
      class="az__group"
    >
      <h2 class="az__letter">{{ group.letter }}</h2>
      <ul class="az__list">
        <li v-for="w in group.women" :key="w.slug" class="az__item">
          <NuxtLink :to="`/women/${w.slug}`" class="az__name">{{ w.name }}</NuxtLink>
          <span class="az__meta">{{ w.country }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { hubTitle } from "~/utils/constants/hubs";

const { data } = await useAsyncData("women-a-to-z", () =>
  queryCollection("women")
    .select("name", "slug", "country")
    .order("name", "ASC")
    .all(),
);

const total = computed(() => data.value?.length ?? 0);

function initial(name: string): string {
  const first = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .charAt(0)
    .toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

const groups = computed(() => {
  const byLetter = new Map<string, { name: string; slug: string; country: string }[]>();
  for (const w of data.value ?? []) {
    const letter = initial(w.name);
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter)!.push(w);
  }
  return [...byLetter.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, women]) => ({ letter, women }));
});

const canonicalUrl = getAbsoluteUrl("/women/all");
const title = hubTitle("All Women A to Z");
const description =
  "An alphabetical index of every African woman profiled on HerStory Africa: queens, activists, scientists, writers, and leaders from across the continent.";

useHead({ titleTemplate: "%s" });

useSeoMeta({
  title,
  description,
  ogTitle: "All Women A to Z",
  ogDescription: description,
  ogUrl: canonicalUrl,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "All Women A to Z",
  twitterDescription: description,
});

defineOgImage("Card", {
  variant: "page",
  pill: "The index",
  title: "All women A to Z",
  description,
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "All Women A to Z",
        description,
        url: canonicalUrl,
        isPartOf: {
          "@type": "WebSite",
          name: "HerStory Africa",
          url: getAbsoluteUrl("/"),
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: total.value,
          itemListElement: (data.value ?? []).map((w, i) => ({
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
.az {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .az {
    padding: 2.5rem 2rem 4rem;
  }
}

.az__crumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.az__crumb {
  color: inherit;
  text-decoration: none;
}

a.az__crumb:hover {
  color: var(--color-primary);
}

.az__header {
  max-width: 44rem;
  margin-bottom: 1.75rem;
}

.az__title {
  font-size: clamp(1.625rem, 3.5vw, 2.375rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
}

.az__intro {
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-secondary);
  margin: 0;
}

.az__link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.az__link:hover {
  text-decoration: underline;
}

.az__jump {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 2rem;
}

.az__jump-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  font-size: 0.8125rem;
  font-weight: 700;
  border-radius: 0.375rem;
  color: var(--text-secondary);
  background: var(--surface-subtle);
  text-decoration: none;
  transition: all 0.15s ease;
}

.az__jump-link:hover {
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.az__group {
  padding: 1.25rem 0;
  border-top: 1px solid var(--border-light);
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: 1rem;
  scroll-margin-top: 5rem;
}

.az__letter {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0;
  line-height: 1;
}

.az__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.375rem 1.5rem;
}

@media (min-width: 640px) {
  .az__list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 900px) {
  .az__list {
    grid-template-columns: repeat(3, 1fr);
  }
}

.az__item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.az__name {
  color: var(--text-primary);
  font-weight: 600;
  text-decoration: none;
}

.az__name:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.az__meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
