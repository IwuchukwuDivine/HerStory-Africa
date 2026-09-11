<template>
  <article v-if="woman" class="woman-profile">
    <ClientOnly>
      <PathBar
        v-if="pathContext"
        :title="pathContext.title"
        :index="pathContext.index"
        :total="pathContext.total"
        :path-slug="pathContext.slug"
      />
    </ClientOnly>

    <div class="woman-profile__inner">
      <NuxtLink :to="`/women/region/${slugify(woman.region)}`" class="back-link">
        <LucideArrowLeft :size="18" />
        Women · {{ woman.region }}
      </NuxtLink>

      <div class="woman-profile__layout">
        <figure class="woman-profile__figure">
          <div class="woman-profile__portrait">
            <NuxtImg
              v-if="portrait"
              :src="woman.image"
              :provider="imageProvider(woman.image)"
              :alt="`Portrait of ${woman.name}, ${woman.country}`"
              width="704"
              format="webp"
              loading="eager"
              fetchpriority="high"
              class="woman-profile__image"
              :style="{ objectPosition: woman.ogFocal || '50% 20%' }"
            />
            <div v-else class="no-photo">
              <ContinentMark :size="120" />
            </div>
          </div>
          <ImageCaption :text="portrait ? woman.imageCredit : 'No verified photograph exists.'" />
        </figure>

        <div class="woman-profile__main">
          <header class="woman-profile__header">
            <span class="eyebrow">{{ woman.era }} · {{ woman.country }} · {{ lifespan(woman.born, woman.died) }}</span>
            <h1 class="woman-profile__name">{{ woman.name }}</h1>
            <p v-if="woman.hook" class="woman-profile__hook">{{ woman.hook }}</p>
            <p class="woman-profile__summary">{{ woman.summary }}</p>

            <ClientOnly>
              <p v-if="pathContext" class="woman-profile__why">
                <strong class="woman-profile__why-label">Why she is next.</strong>
                {{ pathContext.why }}
              </p>
              <span v-if="womanRead" class="woman-profile__read tint-success">
                <LucideCheck :size="12" />
                Read
              </span>
              <div class="woman-profile__actions">
                <ListenButton
                  content-selector=".woman-profile__name, .woman-profile__hook, .woman-profile__summary, .woman-profile__content"
                  :minutes="readingTime"
                />
                <FavoriteButton type="woman" :slug="woman.slug" label="Save" />
                <ShareCardButton :woman="woman" />
              </div>
            </ClientOnly>

            <div v-if="woman.causes.length" class="woman-profile__causes">
              <span class="eyebrow eyebrow--muted">She fought for</span>
              <div class="woman-profile__cause-list">
                <NuxtLink
                  v-for="cause in woman.causes"
                  :key="cause"
                  :to="causeLink(cause)"
                  class="pill pill--sm pill--secondary woman-profile__cause"
                >
                  {{ cause }}
                </NuxtLink>
              </div>
            </div>
          </header>

          <TocList v-if="tocLinks.length" :links="tocLinks" class="woman-profile__toc" />

          <div class="prose prose--dropcap woman-profile__content">
            <ContentRenderer :value="mainDoc" />
          </div>

          <div ref="readSentinel" />

          <SourcesBlock
            :sources="sources"
            :title="woman.name"
            :url="canonicalUrl"
            :year="woman.died ?? woman.born ?? ''"
            type="biography"
          />

          <RelatedWomen
            :slug="woman.slug"
            :region="woman.region"
            :era="woman.era"
            :causes="woman.causes"
          />

          <section class="panel woman-profile__cta" aria-label="Newsletter and suggestions">
            <h3 class="woman-profile__cta-title">Don't let these stories stay hidden.</h3>
            <ClientOnly>
              <template v-if="!isSubscribed">
                <p class="woman-profile__cta-text">One remarkable African woman, straight to your inbox, twice a month.</p>
                <NewsletterForm placeholder="Your email address" />
              </template>
            </ClientOnly>
            <NuxtLink to="/suggest" class="woman-profile__suggest">
              Know a woman whose story should be here? Suggest her →
            </NuxtLink>
          </section>

          <ClientOnly>
            <nav v-if="pathContext" class="woman-profile__path-nav" aria-label="Reading path steps">
              <Pill
                v-if="pathContext.prev"
                variant="secondary"
                :to="{ path: `/women/${pathContext.prev.slug}`, query: { path: pathContext.slug } }"
              >
                <template #icon><LucideChevronLeft :size="16" /></template>
                {{ pathContext.index - 1 }} · {{ pathContext.prev.name }}
              </Pill>
              <span v-else />
              <Pill
                v-if="pathContext.next"
                variant="primary"
                :to="{ path: `/women/${pathContext.next.slug}`, query: { path: pathContext.slug } }"
              >
                {{ pathContext.index + 1 }} · {{ pathContext.next.name }}
                <LucideChevronRight :size="16" />
              </Pill>
              <Pill v-else variant="primary" :to="`/women/path/${pathContext.slug}`">
                Back to the path
                <LucideChevronRight :size="16" />
              </Pill>
            </nav>
          </ClientOnly>
        </div>
      </div>
    </div>

    <ClientOnly>
      <ReadingBar :name="woman.name" :minutes="readingTime" />
    </ClientOnly>
  </article>
</template>

<script setup lang="ts">
import { CAUSE_HUB_MIN_WOMEN } from "~/utils/constants/content";
import slugify, { causeHubs } from "~/utils/slugify";
import { hasPortrait, lifespan } from "~/utils/format";
import { splitSources, wordCount } from "~/composables/useProseSplit";

const route = useRoute();
// Strip any trailing slash so the content lookup and payload key match the
// prerendered URL (the canonical form has no trailing slash).
const contentPath = route.path.replace(/\/+$/, "") || "/";

const { data: woman } = await useAsyncData(`woman-${contentPath}`, () =>
  queryCollection("women").path(contentPath).first(),
);

if (!woman.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Woman not found",
    fatal: true,
  });
}

const readSentinel = ref<HTMLElement | null>(null);

const portrait = computed(() => hasPortrait(woman.value?.image));

/* ── Body: sources split off; drop cap and gold rules come from .prose ── */
const split = computed(() => splitSources(woman.value?.body?.value));
const sources = computed(() => split.value.sources);
const mainDoc = computed(() => ({
  ...woman.value,
  body: { ...woman.value?.body, type: "minimark", value: split.value.main },
}));

const tocLinks = computed(
  () =>
    woman.value?.body?.toc?.links?.map((l) => ({ id: l.id, text: l.text })) ??
    [],
);

const readingTime = computed(
  () =>
    woman.value?.readingTime ??
    Math.max(1, Math.round(wordCount(woman.value?.body?.value) / 200)),
);

/* ── Causes: hub page when enough women share the cause, else the filtered listing ── */
const { data: causeIndex } = await useAsyncData("hub-cause-index", () =>
  queryCollection("women").select("causes").all(),
);
const hubSlugByCause = new Map(
  causeHubs(causeIndex.value ?? [], CAUSE_HUB_MIN_WOMEN).map((h) => [
    h.cause,
    h.slug,
  ]),
);
function causeLink(cause: string) {
  const slug = hubSlugByCause.get(cause);
  return slug
    ? `/women/cause/${slug}`
    : { path: "/women", query: { cause } };
}

/* ── Reading path context (?path=slug), client-side only ── */
const pathQuery = computed(() =>
  typeof route.query.path === "string" ? route.query.path : "",
);

const { data: pathContext } = await useAsyncData(
  `path-context-${contentPath}`,
  async () => {
    const q = pathQuery.value;
    const slug = woman.value?.slug;
    if (!q || !slug) return null;
    const path = await queryCollection("paths").where("slug", "=", q).first();
    if (!path) return null;
    const i = path.steps.findIndex((s) => s.slug === slug);
    if (i === -1) return null;
    const prevStep = path.steps[i - 1];
    const nextStep = path.steps[i + 1];
    const neighbours = [prevStep?.slug, nextStep?.slug].filter(
      (s): s is string => !!s,
    );
    const names = neighbours.length
      ? await queryCollection("women")
          .where("slug", "IN", neighbours)
          .select("slug", "name")
          .all()
      : [];
    const nameOf = (s: string) => names.find((n) => n.slug === s)?.name ?? s;
    return {
      slug: path.slug,
      title: path.title,
      index: i + 1,
      total: path.steps.length,
      why: path.steps[i]!.why,
      prev: prevStep ? { slug: prevStep.slug, name: nameOf(prevStep.slug) } : null,
      next: nextStep ? { slug: nextStep.slug, name: nameOf(nextStep.slug) } : null,
    };
  },
  { server: false, watch: [pathQuery] },
);

/* ── Read state ── */
const { isRead, isSubscribed } = useApp();
const womanRead = computed(() =>
  woman.value ? isRead("woman", woman.value.slug) : false,
);

if (woman.value?.slug) {
  useReadTracker("woman", woman.value.slug, readSentinel, {
    name: woman.value.name,
    image: woman.value.image,
    country: woman.value.country,
    born: woman.value.born,
    died: woman.value.died,
    minutes: readingTime.value,
  });
}

/* ── SEO ── */
const canonicalUrl = computed(() =>
  woman.value ? getAbsoluteUrl(`/women/${woman.value.slug}`) : "",
);
const ogImageUrl = computed(() => woman.value?.image ?? "");

const womanDates = computed(() => {
  if (!woman.value) return "";
  const born = woman.value.born ?? "Unknown";
  const died = woman.value.died
    ? `–${woman.value.died}`
    : woman.value.born
      ? "–present"
      : "";
  return `${born}${died}`;
});

const TITLE_MAX = 60;
const MIN_HOOK_LENGTH = 12;

/** `${name}: ${hook}` within 60 chars, or the name alone if there is no room for a hook. */
const seoTitle = computed(() => {
  if (!woman.value) return "";
  const { name, summary } = woman.value;
  const hookMax = TITLE_MAX - name.length - 2;
  if (hookMax < MIN_HOOK_LENGTH) return name;
  const hook = clipAtWord(summary, hookMax);
  return hook ? `${name}: ${hook}` : name;
});

const metaDescription = computed(() =>
  woman.value ? seoDescription(woman.value.summary) : "",
);

useHead({ titleTemplate: "%s" });

useSeoMeta({
  title: seoTitle,
  description: metaDescription,
  ogTitle: () => woman.value?.name ?? "",
  ogDescription: metaDescription,
  ogUrl: canonicalUrl,
  ogType: "profile",
  twitterCard: "summary_large_image",
  twitterTitle: () => woman.value?.name ?? "",
  twitterDescription: () => woman.value?.summary ?? "",
});

defineOgImage("Card", {
  variant: "woman",
  pill: () => (woman.value?.era ? `${woman.value.era} era` : ""),
  title: () => woman.value?.name ?? "",
  meta: () =>
    woman.value ? `${woman.value.country} · ${womanDates.value}` : "",
  image: () => ogImageUrl.value,
  focal: () => woman.value?.ogFocal ?? "50% 20%",
  // Women carry the meta line only; stop the module filling this from the page description.
  description: "",
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
  script: woman.value
    ? [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: woman.value.name,
            description: woman.value.summary,
            image: getAbsoluteUrl(woman.value.image),
            url: canonicalUrl.value,
            mainEntityOfPage: canonicalUrl.value,
            birthDate: woman.value.born?.toString(),
            deathDate: woman.value.died?.toString(),
            nationality: woman.value.country,
            knowsAbout: woman.value.causes,
            ...(woman.value.sameAs?.length
              ? { sameAs: woman.value.sameAs }
              : {}),
          }),
        },
      ]
    : [],
}));
</script>

<style scoped>
.woman-profile {
  max-width: 64rem;
  margin: 0 auto;
}

.woman-profile__inner {
  padding: 16px 24px 48px;
}

@media (min-width: 768px) {
  .woman-profile__inner {
    padding: 24px 32px 64px;
  }
}

.woman-profile__layout {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-top: 8px;
}

@media (min-width: 768px) {
  .woman-profile__layout {
    flex-direction: row;
    align-items: flex-start;
    gap: 40px;
    margin-top: 12px;
  }
}

/* ── Portrait ── */
.woman-profile__figure {
  margin: 0;
  width: 100%;
}

@media (min-width: 768px) {
  .woman-profile__figure {
    position: sticky;
    top: calc(var(--navbar-height, 61px) + 24px);
    width: 22rem;
    flex-shrink: 0;
  }
}

.woman-profile__portrait {
  aspect-ratio: 4 / 4.4;
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface-muted);
}

.woman-profile__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Text column ── */
.woman-profile__main {
  flex: 1;
  min-width: 0;
}

.woman-profile__header {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.woman-profile__name {
  font-size: 44px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
  color: var(--text-primary);
  margin: 0;
}

@media (min-width: 768px) {
  .woman-profile__name {
    font-size: clamp(44px, 5vw, 64px);
  }
}

.woman-profile__hook {
  font-size: 19px;
  line-height: 1.5;
  font-style: italic;
  color: var(--text-secondary);
  margin: 0;
}

.woman-profile__summary {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.woman-profile__why {
  font-size: 16px;
  line-height: 1.6;
  font-style: italic;
  color: var(--text-secondary);
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--surface-muted);
  margin: 0;
}

.woman-profile__why-label {
  font-style: normal;
  font-weight: 700;
  color: var(--color-secondary-600);
}

.woman-profile__read {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 4px;
  height: 32px;
  padding: 0 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.woman-profile__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

/* ── Causes ── */
.woman-profile__causes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.woman-profile__cause-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.woman-profile__cause {
  color: var(--color-primary);
}

/* ── Jump list and body ── */
.woman-profile__toc {
  margin-top: 32px;
}

.woman-profile__content {
  margin-top: 40px;
}

/* ── Newsletter and suggest panel ── */
.woman-profile__cta {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 40px;
}

.woman-profile__cta-title {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0;
}

.woman-profile__cta-text {
  font-size: 15px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
}

.woman-profile__suggest {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.woman-profile__suggest:hover {
  color: var(--color-primary-600);
}

/* ── Reading path prev / next ── */
.woman-profile__path-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
  padding: 12px 0;
  border-top: 1px solid var(--border-light);
}
</style>
