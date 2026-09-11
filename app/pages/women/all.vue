<template>
  <div class="az">
    <NuxtLink to="/women" class="back-link">
      <LucideArrowLeft :size="18" />
      Women
    </NuxtLink>

    <MuseumLabel
      level="h1"
      :eyebrow="`The index · ${total} women`"
      title="A to Z"
      class="az__header"
    />

    <section
      v-for="group in groups"
      :id="`letter-${group.letter}`"
      :key="group.letter"
      class="az__group"
      :data-letter="group.letter"
    >
      <h2 class="az__letter-head">
        <span class="az__letter">{{ group.letter }}</span>
        <span class="az__letter-count">{{ group.women.length }} {{ group.women.length === 1 ? "woman" : "women" }}</span>
      </h2>
      <div class="az__rows">
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
          :thumb="40"
          :priority="w.index < 2"
        />
      </div>
    </section>

    <LetterRail :letters="letters" :active="activeLetter" />
  </div>
</template>

<script setup lang="ts">
import { hubTitle } from "~/utils/constants/hubs";
import { initialOf } from "~/utils/format";

const { data } = await useAsyncData("women-a-to-z", () =>
  queryCollection("women")
    .select("name", "slug", "country", "image", "born", "died", "ogFocal")
    .order("name", "ASC")
    .all(),
);

const total = computed(() => data.value?.length ?? 0);

type Row = NonNullable<typeof data.value>[number] & { index: number };

const groups = computed(() => {
  const byLetter = new Map<string, Row[]>();
  (data.value ?? []).forEach((w, index) => {
    const letter = initialOf(w.name);
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter)!.push({ ...w, index });
  });
  return [...byLetter.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, women]) => ({ letter, women }));
});

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const letters = computed(() => {
  const present = new Set(groups.value.map((g) => g.letter));
  return ALPHABET.map((letter) => ({ letter, present: present.has(letter) }));
});

/* Track the group sitting under the navbar so the rail can highlight it. */
const activeLetter = ref(groups.value[0]?.letter ?? "");
let observer: IntersectionObserver | null = null;

function observeGroups() {
  observer?.disconnect();
  if (typeof IntersectionObserver === "undefined") return;
  const navHeight =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-height")) || 61;
  const line = Math.max(1, window.innerHeight - navHeight - 2);
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const letter = (entry.target as HTMLElement).dataset.letter;
          if (letter) activeLetter.value = letter;
        }
      }
    },
    { rootMargin: `-${navHeight + 1}px 0px -${line}px 0px`, threshold: 0 },
  );
  document.querySelectorAll<HTMLElement>(".az__group").forEach((el) => observer!.observe(el));
}

let resizeTimer: ReturnType<typeof setTimeout> | undefined;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(observeGroups, 150);
}

onMounted(() => {
  observeGroups();
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  clearTimeout(resizeTimer);
  window.removeEventListener("resize", onResize);
});

const canonicalUrl = getAbsoluteUrl("/women/all");
const title = hubTitle("All women A to Z");
const description =
  "An alphabetical index of every African woman profiled on HerStory Africa: queens, activists, scientists, writers, and leaders from across the continent.";

useHead({ titleTemplate: "%s" });

useSeoMeta({
  title,
  description,
  ogTitle: "All women A to Z",
  ogDescription: description,
  ogUrl: canonicalUrl,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "All women A to Z",
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
        name: "All women A to Z",
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
  /* Room on the right for the fixed letter rail. */
  padding: 24px 56px 56px 24px;
}

@media (min-width: 768px) {
  .az {
    padding: 40px 32px 64px;
  }
}

.az__header {
  margin: 12px 0 16px;
}

.az__group {
  scroll-margin-top: var(--navbar-height, 61px);
}

.az__letter-head {
  position: sticky;
  top: var(--navbar-height, 61px);
  z-index: 10;
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  padding: 8px 0 6px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
}

.az__group + .az__group {
  margin-top: 14px;
}

.az__letter {
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  color: var(--color-secondary-600);
}

.az__letter-count {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-muted);
}

.az__rows {
  display: flex;
  flex-direction: column;
}

/* The first row sits under the ruled header, so it needs no rule of its own. */
.az__rows > :first-child {
  border-top: none;
}

@media (min-width: 768px) {
  .az__rows {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 32px;
  }

  .az__rows > :nth-child(2) {
    border-top: none;
  }
}
</style>
