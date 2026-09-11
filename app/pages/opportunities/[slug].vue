<template>
  <article v-if="opp" class="opp">
    <header class="opp__header">
      <NuxtLink
        :to="{ path: '/opportunities', query: { category: opp.category } }"
        class="back-link"
      >
        <LucideArrowLeft :size="18" />
        Opportunities · {{ categoryLabel }}
      </NuxtLink>

      <MuseumLabel level="p" :eyebrow="`${categoryLabel} · ${opp.organization}`" />
      <h1 class="opp__title">{{ opp.title }}</h1>

      <ul class="opp__meta" aria-label="Details">
        <li class="opp__meta-item" :class="deadlineClass">
          <LucideCalendar :size="14" />
          <span>
            {{ deadlineLabel }}<template v-if="opp.deadline"> · Closes {{ formatDate(opp.deadline) }}</template>
          </span>
        </li>
        <li v-if="opp.featured" class="opp__meta-item opp__meta-item--featured">
          <LucideStar :size="14" />
          <span>Featured</span>
        </li>
      </ul>

      <p class="opp__deck">{{ opp.description }}</p>

      <div class="opp__actions">
        <Pill
          :to="opp.link"
          variant="primary"
          size="lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apply now
          <LucideExternalLink :size="16" />
        </Pill>
        <ClientOnly>
          <ShareButton :title="opp.title" :text="opp.description" label="Share" />
        </ClientOnly>
      </div>
    </header>

    <div v-if="hasBody" ref="contentEl" class="prose opp__body">
      <ContentRenderer :value="opp" />
    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute();
// Strip any trailing slash so the content lookup and payload key match the
// prerendered URL (the canonical form has no trailing slash).
const contentPath = route.path.replace(/\/+$/, "") || "/";

const { data: opp } = await useAsyncData(`opp-${contentPath}`, () =>
  queryCollection("opportunities").path(contentPath).first(),
);

if (!opp.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Opportunity not found",
    fatal: true,
  });
}

const hasBody = computed(() => {
  if (!opp.value) return false;
  return opp.value.body && Object.keys(opp.value.body).length > 0;
});

const CATEGORY_LABELS = {
  scholarship: "Scholarship",
  job: "Job / Internship",
  grant: "Grant",
  fellowship: "Fellowship",
} as const;

type Category = keyof typeof CATEGORY_LABELS;

const categoryLabel = computed(
  () => CATEGORY_LABELS[opp.value?.category as Category] ?? "",
);

const daysLeft = computed(() => {
  if (!opp.value?.deadline) return null;
  const diff = new Date(opp.value.deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const deadlineLabel = computed(() => {
  if (!opp.value?.deadline) return "Ongoing";
  const days = daysLeft.value!;
  if (days < 0) return "Expired";
  if (days === 0) return "Last day";
  if (days === 1) return "1 day left";
  return `${days} days left`;
});

/* Forest for ongoing, crimson under a week, otherwise muted. */
const deadlineClass = computed(() => {
  if (!opp.value?.deadline) return "opp__meta-item--ongoing";
  const days = daysLeft.value!;
  if (days >= 0 && days <= 7) return "opp__meta-item--urgent";
  return "";
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const canonicalUrl = computed(() =>
  opp.value ? getAbsoluteUrl(`/opportunities/${opp.value.slug}`) : "",
);

useSeoMeta({
  title: () => opp.value?.title ?? "Opportunity not found",
  description: () => seoDescription(opp.value?.description ?? ""),
  ogTitle: () => `${opp.value?.title ?? ""} | HerStory Africa`,
  ogDescription: () => seoDescription(opp.value?.description ?? ""),
  ogUrl: canonicalUrl,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: () => `${opp.value?.title ?? ""} | HerStory Africa`,
  twitterDescription: () => opp.value?.description ?? "",
});

defineOgImage("Card", {
  variant: "page",
  pill: () => categoryLabel.value,
  title: () => opp.value?.title ?? "",
  description: () => {
    if (!opp.value) return "";
    const deadline = opp.value.deadline
      ? `Deadline ${formatDate(opp.value.deadline)}`
      : "Ongoing, no fixed deadline";
    return `${opp.value.organization} · ${deadline}`;
  },
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
}));

const contentEl = useTemplateRef<HTMLElement>("contentEl");

onMounted(() => {
  nextTick(() => {
    if (!contentEl.value) return;
    contentEl.value.querySelectorAll("a[href]").forEach((a) => {
      const el = a as HTMLAnchorElement;
      if (el.hostname !== window.location.hostname) {
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      }
    });
  });
});
</script>

<style scoped>
.opp {
  max-width: 48rem;
  margin: 0 auto;
  padding: 16px 24px 56px;
}

@media (min-width: 768px) {
  .opp {
    padding: 24px 32px 64px;
  }
}

.opp__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.opp__title {
  font-size: 36px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  margin: 0;
}

@media (min-width: 768px) {
  .opp__title {
    font-size: 44px;
    letter-spacing: -1px;
  }
}

/* ── Meta row ── */
.opp__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 20px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.opp__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

.opp__meta-item--ongoing {
  color: var(--color-forest);
}

.opp__meta-item--urgent {
  color: var(--color-crimson);
}

.opp__meta-item--featured {
  color: var(--color-secondary-600);
}

.opp__deck {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.opp__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

/* ── Body ── */
.opp__body {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--border-light);
}
</style>
