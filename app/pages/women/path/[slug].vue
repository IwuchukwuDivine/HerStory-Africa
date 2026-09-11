<template>
  <div v-if="path" class="path">
    <header class="path__header wash">
      <div class="path__header-inner">
        <NuxtLink to="/#paths" class="back-link">
          <LucideArrowLeft :size="18" />
          Reading paths
        </NuxtLink>

        <MuseumLabel
          level="h1"
          :eyebrow="`A reading path · ${steps.length} women · ${totalMinutes} min`"
          :title="path.title"
        />

        <p class="path__description">{{ path.description }}</p>

        <ContentRenderer v-if="hasNote" :value="path" class="prose path__note" />

        <ClientOnly>
          <div class="path__progress">
            <div class="progress-line">
              <div class="progress-line__fill" :style="{ width: `${progressPct}%` }" />
            </div>
            <span class="path__progress-label">{{ readCount }} of {{ steps.length }} read</span>
          </div>

          <Pill
            v-if="nextStep"
            variant="primary"
            size="lg"
            :to="`/women/${nextStep.slug}?path=${path.slug}`"
            class="path__cta"
          >
            {{ ctaLabel }}
          </Pill>
        </ClientOnly>
      </div>
    </header>

    <div class="path__body">
      <ReadingPathSteps :steps="steps" :path-slug="path.slug" />

      <section v-if="furtherArticles.length" class="path__deeper">
        <article
          v-for="article in furtherArticles"
          :key="article.slug"
          class="panel path__deeper-item"
        >
          <span class="eyebrow eyebrow--gold">Go deeper</span>
          <NuxtLink :to="`/articles/${article.slug}`" class="path__deeper-title">
            {{ article.title }}
          </NuxtLink>
          <span class="path__deeper-meta">
            Article · {{ article.category }} · {{ minutesLabel(article.readingTime) }}
          </span>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { hubTitle } from "~/utils/constants/hubs";
import { lifespan, minutesLabel } from "~/utils/format";

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

const stepSlugs = path.value.steps.map((s) => s.slug);
const furtherSlugs = path.value.further ?? [];

/* The woman whose portrait fronts the card. */
const { data: cover } = await useAsyncData(`path-cover-${contentPath}`, () =>
  path.value
    ? queryCollection("women")
        .where("slug", "=", path.value.cover)
        .select("image", "ogFocal")
        .first()
    : Promise.resolve(null),
);

const { data: stepWomen } = await useAsyncData(`path-women-${contentPath}`, () =>
  stepSlugs.length
    ? queryCollection("women")
        .where("slug", "IN", stepSlugs)
        .select("name", "slug", "image", "country", "born", "died", "era", "readingTime", "ogFocal")
        .all()
    : Promise.resolve([]),
);

const { data: further } = await useAsyncData(`path-further-${contentPath}`, () =>
  furtherSlugs.length
    ? queryCollection("articles")
        .where("slug", "IN", furtherSlugs)
        .select("title", "slug", "category", "readingTime", "image")
        .all()
    : Promise.resolve([]),
);

/* Read state lives in localStorage, so it only applies after mount; that
   keeps the server and first client render identical. */
const { isRead } = useApp();
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const steps = computed(() => {
  const bySlug = new Map((stepWomen.value ?? []).map((w) => [w.slug, w]));
  const ordered = (path.value?.steps ?? []).flatMap((s) => {
    const w = bySlug.get(s.slug);
    return w ? [{ ...w, why: s.why }] : [];
  });
  const firstUnread = ordered.findIndex((w) => !(mounted.value && isRead("woman", w.slug)));
  return ordered.map((w, i) => ({
    n: i + 1,
    slug: w.slug,
    name: w.name,
    meta: `${w.era} · ${w.country} · ${lifespan(w.born, w.died)}`,
    why: w.why,
    minutes: w.readingTime ?? 1,
    image: w.image,
    focal: w.ogFocal,
    read: mounted.value && isRead("woman", w.slug),
    current: i === firstUnread,
  }));
});

const totalMinutes = computed(() =>
  Math.max(1, Math.round(steps.value.reduce((sum, s) => sum + s.minutes, 0))),
);

const readCount = computed(() => steps.value.filter((s) => s.read).length);
const progressPct = computed(() =>
  steps.value.length ? Math.round((readCount.value / steps.value.length) * 100) : 0,
);

const nextStep = computed(() => steps.value.find((s) => s.current) ?? steps.value[0]);

const ctaLabel = computed(() => {
  const step = nextStep.value;
  if (!step) return "";
  if (readCount.value === 0) return `Start with 1 · ${step.name}`;
  if (readCount.value >= steps.value.length) return `Read it again from 1 · ${step.name}`;
  return `Continue with ${step.n} · ${step.name}`;
});

const furtherArticles = computed(() => {
  const bySlug = new Map((further.value ?? []).map((a) => [a.slug, a]));
  return furtherSlugs.flatMap((slug) => {
    const a = bySlug.get(slug);
    return a ? [a] : [];
  });
});

/* The markdown body under the frontmatter is the editor's note. */
const hasNote = computed(() => {
  const body = path.value?.body as { children?: unknown[] } | undefined;
  return Boolean(body?.children?.length);
});

const canonicalUrl = getAbsoluteUrl(route.path);
const pageTitle = hubTitle(path.value.title);
const description = seoDescription(path.value.description);

useHead({ titleTemplate: "%s" });

useSeoMeta({
  title: pageTitle,
  description,
  ogTitle: path.value.title,
  ogDescription: description,
  ogUrl: canonicalUrl,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: path.value.title,
  twitterDescription: description,
});

defineOgImage("Card", {
  variant: "page",
  pill: "A reading path",
  title: () => path.value?.title ?? "",
  description: () => path.value?.description ?? "",
  image: () => cover.value?.image ?? "",
  focal: () => cover.value?.ogFocal ?? "50% 20%",
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: path.value?.title,
        description,
        url: canonicalUrl,
        isPartOf: {
          "@type": "WebSite",
          name: "HerStory Africa",
          url: getAbsoluteUrl("/"),
        },
        mainEntity: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: steps.value.length,
          itemListElement: steps.value.map((s) => ({
            "@type": "ListItem",
            position: s.n,
            url: getAbsoluteUrl(`/women/${s.slug}`),
            name: s.name,
          })),
        },
      }),
    },
  ],
}));
</script>

<style scoped>
.path {
  padding-bottom: 56px;
}

@media (min-width: 768px) {
  .path {
    padding-bottom: 64px;
  }
}

.path__header {
  padding: 20px 24px 32px;
}

@media (min-width: 768px) {
  .path__header {
    padding: 28px 32px 48px;
  }
}

.path__header-inner {
  max-width: 48rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.path__description {
  margin: 0;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.path__note :deep(p) {
  font-size: 16px;
  line-height: 1.65;
  color: var(--text-secondary);
  margin: 0 0 12px;
}

.path__note :deep(p:last-child) {
  margin-bottom: 0;
}

.path__progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.path__progress-label {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

.path__cta {
  align-self: flex-start;
  max-width: 100%;
  white-space: normal;
  text-align: center;
}

.path__body {
  max-width: 48rem;
  margin: 0 auto;
  padding: 32px 24px 0;
}

@media (min-width: 768px) {
  .path__body {
    padding: 40px 32px 0;
  }
}

.path__deeper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.path__deeper-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
}

.path__deeper-title {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
  text-decoration: none;
}

.path__deeper-title:hover {
  color: var(--color-primary);
}

.path__deeper-meta {
  font-size: 14px;
  color: var(--text-muted);
}
</style>
