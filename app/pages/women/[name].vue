<template>
  <article v-if="woman" class="woman-profile">
    <header class="woman-profile__hero">
      <button class="go-back" @click="goBack('/women')">
        <LucideArrowLeft :size="18" />
        Back
      </button>

      <div class="woman-profile__hero-inner">
        <div class="woman-profile__image-wrapper">
          <NuxtImg
            :src="woman.image"
            :provider="imageProvider(woman.image)"
            :alt="`Portrait of ${woman.name}, ${woman.country}`"
            width="480"
            height="600"
            format="webp"
            class="woman-profile__image"
          />
          <p v-if="woman.imageCredit" class="woman-profile__credit">
            {{ woman.imageCredit }}
          </p>
        </div>

        <div class="woman-profile__intro">
          <div class="woman-profile__top-row">
            <span class="woman-profile__era-badge">{{ woman.era }} era</span>
            <ClientOnly>
              <div class="woman-profile__actions">
                <ShareCardButton :woman="woman" :size="22" />
                <ShareButton
                  :title="woman.name"
                  :text="woman.summary"
                  :size="22"
                />
                <FavoriteButton type="woman" :slug="woman.slug" :size="22" />
              </div>
            </ClientOnly>
          </div>
          <h1 class="woman-profile__name">{{ woman.name }}</h1>

          <div class="woman-profile__meta">
            <span class="woman-profile__meta-item">
              <LucideMapPin :size="16" />
              {{ woman.country }}, {{ woman.region }}
            </span>
            <span class="woman-profile__meta-item">
              <LucideCalendar :size="16" />
              {{ woman.born ?? "Unknown"
              }}{{
                woman.died ? `–${woman.died}` : woman.born ? "–present" : ""
              }}
            </span>
            <ClientOnly>
              <span v-if="womanRead" class="woman-profile__read-badge">
                <LucideCheck :size="14" />
                Read
              </span>
            </ClientOnly>
          </div>

          <p class="woman-profile__summary">{{ woman.summary }}</p>

          <div class="woman-profile__causes">
            <NuxtLink
              v-for="cause in woman.causes"
              :key="cause"
              :to="causeLink(cause)"
              class="woman-profile__cause-tag"
            >
              {{ cause }}
            </NuxtLink>
          </div>
        </div>
      </div>
      <ClientOnly>
        <ListenButton
          content-selector=".woman-profile__name, .woman-profile__summary, .woman-profile__content"
        />
      </ClientOnly>
    </header>

    <div class="woman-profile__content">
      <ContentRenderer :value="woman" />
    </div>

    <div ref="readSentinel" />

    <CiteThisPage
      :title="woman.name"
      :url="canonicalUrl"
      :year="woman.died ?? woman.born ?? ''"
      type="biography"
    />

    <NewsletterCta />

    <div class="woman-profile__suggest">
      <p class="woman-profile__suggest-text">
        Know an African woman whose story should be here?
      </p>
      <NuxtLink to="/suggest" class="woman-profile__suggest-link">
        <LucideSend :size="16" />
        Suggest a woman
      </NuxtLink>
    </div>

    <RelatedWomen
      :slug="woman.slug"
      :region="woman.region"
      :era="woman.era"
      :causes="woman.causes"
    />
  </article>
</template>

<script setup lang="ts">
import { CAUSE_HUB_MIN_WOMEN } from "~/utils/constants/content";
import { causeHubs } from "~/utils/slugify";

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

// Causes shared by enough women have a static hub page; the rest fall back
// to the filtered listing. Same cache key as the cause hub pages.
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

const { isRead } = useApp();
const womanRead = computed(() =>
  woman.value ? isRead("woman", woman.value.slug) : false,
);

if (woman.value?.slug) {
  useReadTracker("woman", woman.value.slug, readSentinel);
}

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

defineOgImage("Cover", {
  title: () => woman.value?.name ?? "",
  pill: () => woman.value?.era ?? "",
  subtitle: () => womanDates.value,
  meta: () => woman.value?.country ?? "",
  image: () => ogImageUrl.value,
  variant: "woman",
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
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .woman-profile {
    padding: 2rem;
  }
}

.woman-profile__hero-inner {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 768px) {
  .woman-profile__hero-inner {
    flex-direction: row;
    gap: 2.5rem;
  }
}

.woman-profile__image-wrapper {
  flex-shrink: 0;
  width: 100%;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .woman-profile__image-wrapper {
    width: 18rem;
    margin: 0;
  }
}

.woman-profile__image {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 1rem;
  background: var(--surface-muted);
}

.woman-profile__credit {
  font-size: 0.6875rem;
  color: var(--text-muted);
  margin: 0.5rem 0 0;
  text-align: center;
}

.woman-profile__intro {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.woman-profile__top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.woman-profile__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.woman-profile__era-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 0.25rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  background: var(--color-primary-50);
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.woman-profile__name {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.15;
}

.woman-profile__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
}

.woman-profile__read-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-success, #16a34a);
}

.woman-profile__meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.woman-profile__summary {
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
}

.woman-profile__causes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.woman-profile__cause-tag {
  padding: 0.3125rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 9999px;
  background: var(--surface-subtle);
  color: var(--text-muted);
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.woman-profile__cause-tag:hover {
  background: var(--color-primary);
  color: var(--text-on-primary);
}

/* ── Content body ── */
.woman-profile__content {
  margin-top: 3rem;
  padding-top: 2.5rem;
  border-top: 1px solid var(--border-light);
}

.woman-profile__content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 2.5rem 0 0.75rem;
}

.woman-profile__content :deep(h2:first-child) {
  margin-top: 0;
}

.woman-profile__content :deep(p) {
  font-size: 1.0625rem;
  line-height: 1.75;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.woman-profile__content :deep(strong) {
  color: var(--text-primary);
  font-weight: 700;
}

.woman-profile__content :deep(em) {
  font-style: italic;
}

.woman-profile__content :deep(ul) {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.woman-profile__content :deep(li) {
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-secondary);
  padding-left: 1.5rem;
  position: relative;
}

.woman-profile__content :deep(li::before) {
  content: "";
  position: absolute;
  left: 0;
  top: 0.6em;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--color-primary-300);
}

.woman-profile__content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 2rem 0;
}

.woman-profile__content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.woman-profile__content :deep(a:hover) {
  color: var(--color-primary-600);
}

/* ── Suggest CTA ── */
.woman-profile__suggest {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-light);
}

.woman-profile__suggest-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
}

.woman-profile__suggest-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.woman-profile__suggest-link:hover {
  color: var(--color-primary-600);
}
</style>
