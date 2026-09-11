<template>
  <article v-if="article" class="article-page">
    <ReadingProgress />

    <div class="article-page__inner">
      <header class="article-page__header">
        <NuxtLink
          :to="{ path: '/articles', query: { category: article.category } }"
          class="back-link"
        >
          <LucideArrowLeft :size="18" />
          Articles · {{ article.category }}
        </NuxtLink>

        <MuseumLabel level="p" :eyebrow="eyebrow" />
        <h1 class="article-page__title">{{ article.title }}</h1>
        <p class="article-page__deck">{{ article.description }}</p>

        <ClientOnly>
          <div class="article-page__actions">
            <ListenButton
              content-selector=".article-page__title, .article-page__deck, .article-page__content"
              :minutes="readingTime"
            />
            <FavoriteButton type="article" :slug="article.slug" label="Save" />
            <ShareButton :title="article.title" :text="article.description" label="Share" />
          </div>
        </ClientOnly>
      </header>

      <figure v-if="article.image" class="article-page__hero">
        <div class="article-page__hero-frame">
          <NuxtImg
            :src="article.image"
            :alt="article.title"
            width="1536"
            height="960"
            format="webp"
            loading="eager"
            fetchpriority="high"
            class="article-page__hero-img"
            :style="{ objectPosition: article.ogFocal || 'top' }"
          />
        </div>
        <ImageCaption :text="article.imageCredit" />
      </figure>

      <div class="prose prose--dropcap article-page__content">
        <ContentRenderer :value="headDoc" />
        <InlineArchiveCard
          v-if="inlineWoman"
          :name="inlineWoman.name"
          :slug="inlineWoman.slug"
          :image="inlineWoman.image"
          :country="inlineWoman.country"
          :born="inlineWoman.born"
          :died="inlineWoman.died"
          :focal="inlineWoman.ogFocal"
        />
        <div v-if="bodySplit.tail.length" class="article-page__tail">
          <ContentRenderer :value="tailDoc" />
        </div>
      </div>

      <div ref="readSentinel" />

      <ReflectionPrompt
        v-if="article.reflectionPrompt"
        :prompt="article.reflectionPrompt"
        :slug="article.slug"
        :article-title="article.title"
      />

      <aside v-if="storyWomen?.length" class="article-page__women" aria-label="Women in this story">
        <MuseumLabel eyebrow="Women in this story" :title="storyTitle" />
        <div class="article-page__rows">
          <WomanRow
            v-for="w in storyWomen"
            :key="w.slug"
            :name="w.name"
            :slug="w.slug"
            :image="w.image"
            :country="w.country"
            :born="w.born"
            :died="w.died"
            :focal="w.ogFocal"
            :thumb="56"
          />
        </div>
      </aside>

      <SourcesBlock
        :sources="sources"
        :title="article.title"
        :url="canonicalUrl"
        :year="articleYear"
        type="article"
      />

      <aside v-if="related?.length" class="article-page__next" aria-label="Read next">
        <MuseumLabel level="p" eyebrow="Read next" />
        <ArticleFeature
          v-if="related[0]"
          :title="related[0].title"
          :slug="related[0].slug"
          :category="related[0].category"
          :image="related[0].image"
          :description="related[0].description"
          :reading-time="related[0].readingTime"
        />
        <div v-if="related.length > 1" class="article-page__rows">
          <ArticleRow
            v-for="a in related.slice(1, 3)"
            :key="a.slug"
            :title="a.title"
            :slug="a.slug"
            :category="a.category"
            :image="a.image"
            :reading-time="a.readingTime"
            size="sm"
          />
        </div>
      </aside>

      <ClientOnly>
        <section v-if="!isSubscribed" class="panel article-page__newsletter" aria-label="Newsletter">
          <h3 class="article-page__newsletter-title">Stories like this one, twice a month.</h3>
          <NewsletterForm placeholder="Your email address" />
        </section>
      </ClientOnly>
    </div>

    <ClientOnly>
      <ReadingBar name="this article" :minutes="readingTime" />
    </ClientOnly>
  </article>
</template>

<script setup lang="ts">
import { longDate } from "~/utils/format";
import {
  splitAtFirstWomanLink,
  splitSources,
  wordCount,
} from "~/composables/useProseSplit";

const route = useRoute();
// Strip any trailing slash so the content lookup and payload key match the
// prerendered URL (the canonical form has no trailing slash).
const contentPath = route.path.replace(/\/+$/, "") || "/";

const { data: article } = await useAsyncData(`article-${contentPath}`, () =>
  queryCollection("articles").path(contentPath).first(),
);

if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Article not found",
    fatal: true,
  });
}

const readSentinel = ref<HTMLElement | null>(null);

const readingTime = computed(
  () =>
    article.value?.readingTime ??
    Math.max(1, Math.round(wordCount(article.value?.body?.value) / 200)),
);

const formattedDate = computed(() => longDate(article.value?.date));

const eyebrow = computed(() =>
  article.value
    ? `${article.value.category} · ${formattedDate.value} · ${readingTime.value} min read`
    : "",
);

const articleYear = computed(() => {
  if (!article.value?.date) return "";
  return new Date(article.value.date).getFullYear();
});

/* ── Body: sources split off, then split once around the first profile link ── */
const sourcesSplit = computed(() => splitSources(article.value?.body?.value));
const sources = computed(() => sourcesSplit.value.sources);
const bodySplit = computed(() => splitAtFirstWomanLink(sourcesSplit.value.main));

function docWith(nodes: typeof bodySplit.value.head) {
  return {
    ...article.value,
    body: { ...article.value?.body, type: "minimark", value: nodes },
  };
}
const headDoc = computed(() => docWith(bodySplit.value.head));
const tailDoc = computed(() => docWith(bodySplit.value.tail));

/* ── Women ── */
const WOMAN_FIELDS = [
  "name",
  "slug",
  "image",
  "country",
  "born",
  "died",
  "ogFocal",
] as const;

const { data: storyWomen } = await useAsyncData(
  `article-women-${contentPath}`,
  async () => {
    const slugs = article.value?.women;
    if (!slugs?.length) return [];
    const women = await queryCollection("women")
      .where("slug", "IN", slugs)
      .select(...WOMAN_FIELDS)
      .all();
    return [...women].sort(
      (a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug),
    );
  },
  { watch: [article] },
);

// The woman first linked in the body, for the inline archive card. Usually
// one of the story women; otherwise a targeted lookup.
const { data: linkedWoman } = await useAsyncData(
  `article-linked-${contentPath}`,
  async () => {
    const slug = bodySplit.value.slug;
    if (!slug) return null;
    if (storyWomen.value?.some((w) => w.slug === slug)) return null;
    return queryCollection("women")
      .where("slug", "=", slug)
      .select(...WOMAN_FIELDS)
      .first();
  },
  { watch: [article] },
);

const inlineWoman = computed(() => {
  const slug = bodySplit.value.slug;
  if (!slug) return null;
  return storyWomen.value?.find((w) => w.slug === slug) ?? linkedWoman.value ?? null;
});

const NUMBER_WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

const storyTitle = computed(() => {
  const n = storyWomen.value?.length ?? 0;
  if (n === 1) return "One life that connects to this one";
  const word = NUMBER_WORDS[n] ?? String(n);
  return `${word} lives that connect to this one`;
});

/* ── Read next ── */
const RELATED_COUNT = 3;
const ARTICLE_FIELDS = [
  "title",
  "slug",
  "category",
  "image",
  "description",
  "readingTime",
  "date",
] as const;

const { data: related } = await useAsyncData(
  `related-${contentPath}`,
  async () => {
    if (!article.value) return [];
    const sameCategory = await queryCollection("articles")
      .where("category", "=", article.value.category)
      .where("slug", "<>", article.value.slug)
      .order("date", "DESC")
      .select(...ARTICLE_FIELDS)
      .limit(RELATED_COUNT)
      .all();
    if (sameCategory.length >= RELATED_COUNT) return sameCategory;

    const exclude = new Set([
      article.value.slug,
      ...sameCategory.map((a) => a.slug),
    ]);
    const newest = await queryCollection("articles")
      .order("date", "DESC")
      .select(...ARTICLE_FIELDS)
      .limit(RELATED_COUNT * 2)
      .all();
    const backfill = newest
      .filter((a) => !exclude.has(a.slug))
      .slice(0, RELATED_COUNT - sameCategory.length);
    return [...sameCategory, ...backfill];
  },
  { watch: [article] },
);

/* ── Read state ── */
const { isSubscribed } = useApp();

if (article.value?.slug) {
  useReadTracker("article", article.value.slug, readSentinel, {
    name: article.value.title,
    image: article.value.image ?? "",
    minutes: readingTime.value,
  });
}

/* ── SEO ── */
const canonicalUrl = computed(() =>
  article.value ? getAbsoluteUrl(`/articles/${article.value.slug}`) : "",
);
const ogImageUrl = computed(() => article.value?.image ?? "");

const seoTitle = computed(() => {
  if (!article.value) return "";
  return article.value.seoTitle ?? clipAtWord(article.value.title, 60);
});

const metaDescription = computed(() => {
  if (!article.value) return "";
  return (
    article.value.seoDescription ?? seoDescription(article.value.description)
  );
});

useHead({ titleTemplate: "%s" });

useSeoMeta({
  title: seoTitle,
  description: metaDescription,
  ogTitle: () => article.value?.title ?? "",
  ogDescription: metaDescription,
  ogUrl: canonicalUrl,
  ogType: "article",
  twitterCard: "summary_large_image",
  twitterTitle: () => article.value?.title ?? "",
  twitterDescription: () => article.value?.description ?? "",
});

defineOgImage("Card", {
  variant: "article",
  pill: () =>
    article.value ? `${article.value.category} · ${formattedDate.value}` : "",
  title: () => article.value?.title ?? "",
  description: () => article.value?.description ?? "",
  image: () => ogImageUrl.value,
  focal: () => article.value?.ogFocal ?? "50% 20%",
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
  script: article.value
    ? [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.value.title,
            description: article.value.description,
            image: getAbsoluteUrl(ogImageUrl.value),
            url: canonicalUrl.value,
            mainEntityOfPage: canonicalUrl.value,
            datePublished: `${article.value.date}T00:00:00+00:00`,
            dateModified: `${article.value.updated ?? article.value.date}T00:00:00+00:00`,
            author: {
              "@type": "Organization",
              name: "HerStory Africa",
              url: "https://herstoryafrica.com.ng",
            },
            publisher: {
              "@type": "Organization",
              name: "HerStory Africa",
              logo: {
                "@type": "ImageObject",
                url: "https://herstoryafrica.com.ng/og-image.png",
              },
            },
          }),
        },
      ]
    : [],
}));
</script>

<style scoped>
.article-page {
  max-width: 48rem;
  margin: 0 auto;
}

.article-page__inner {
  padding: 16px 24px 48px;
}

@media (min-width: 768px) {
  .article-page__inner {
    padding: 24px 32px 64px;
  }
}

/* ── Header ── */
.article-page__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-page__title {
  font-size: 34px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  margin: 0;
}

@media (min-width: 768px) {
  .article-page__title {
    font-size: 44px;
  }
}

.article-page__deck {
  font-size: 20px;
  line-height: 1.45;
  font-style: italic;
  color: var(--text-secondary);
  margin: 0;
}

.article-page__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* ── Hero ── */
.article-page__hero {
  margin: 28px 0 0;
}

.article-page__hero-frame {
  aspect-ratio: 16 / 10;
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface-muted);
}

@media (min-width: 768px) {
  .article-page__hero-frame {
    aspect-ratio: 16 / 9;
  }
}

.article-page__hero-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Body ── */
.article-page__content {
  margin-top: 36px;
}

/* ── Tail sections ── */
.article-page__women,
.article-page__next {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 40px;
}

.article-page__rows {
  display: flex;
  flex-direction: column;
}

.article-page__newsletter {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 40px;
}

.article-page__newsletter-title {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0;
}
</style>
