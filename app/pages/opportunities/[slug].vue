<template>
  <article v-if="opp" class="opp-detail">
    <header class="opp-detail__header">
      <button class="go-back" @click="goBack('/opportunities')">
        <LucideArrowLeft :size="18" />
        Back
      </button>

      <div class="opp-detail__meta-row">
        <span class="opp-detail__category" :style="{ '--cat': categoryColor }">
          <component :is="categoryIcon" :size="14" />
          {{ categoryLabel }}
        </span>
        <span v-if="opp.featured" class="opp-detail__featured">
          <LucideStar :size="12" />
          Featured
        </span>
      </div>

      <h1 class="opp-detail__title">{{ opp.title }}</h1>

      <div class="opp-detail__info">
        <span class="opp-detail__info-item">
          <LucideBuilding2 :size="16" />
          {{ opp.organization }}
        </span>
        <span class="opp-detail__info-item" :class="deadlineClass">
          <LucideCalendar :size="16" />
          {{ deadlineLabel }}
          <template v-if="opp.deadline">
            &middot; {{ formatDate(opp.deadline) }}
          </template>
        </span>
      </div>

      <p class="opp-detail__description">{{ opp.description }}</p>

      <div class="opp-detail__actions">
        <a
          :href="opp.link"
          target="_blank"
          rel="noopener noreferrer"
          class="opp-detail__apply"
        >
          Apply Now
          <LucideExternalLink :size="16" />
        </a>
        <ClientOnly>
          <ShareButton :title="opp.title" :text="opp.description" :size="20" />
        </ClientOnly>
      </div>
    </header>

    <div v-if="hasBody" ref="contentEl" class="opp-detail__content">
      <ContentRenderer :value="opp" />
    </div>
  </article>

  <div v-else class="opp-detail__not-found">
    <LucideSearchX :size="48" />
    <h2>Opportunity not found</h2>
    <p>This opportunity may have expired or doesn't exist.</p>
    <NuxtLink to="/opportunities" class="opp-detail__back-btn">
      Browse all opportunities
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { Briefcase, Coins, GraduationCap, Lightbulb } from "lucide-vue-next";

const route = useRoute();

const { data: opp } = await useAsyncData(`opp-${route.path}`, () =>
  queryCollection("opportunities").path(route.path).first(),
);

const hasBody = computed(() => {
  if (!opp.value) return false;
  return opp.value.body && Object.keys(opp.value.body).length > 0;
});

const categoryMap = {
  scholarship: {
    label: "Scholarship",
    color: "var(--color-forest)",
    icon: GraduationCap,
  },
  job: {
    label: "Job / Internship",
    color: "var(--color-secondary)",
    icon: Briefcase,
  },
  grant: { label: "Grant", color: "var(--color-primary)", icon: Coins },
  fellowship: {
    label: "Fellowship",
    color: "var(--color-crimson)",
    icon: Lightbulb,
  },
} as const;

type Category = keyof typeof categoryMap;

const categoryLabel = computed(
  () => categoryMap[opp.value?.category as Category]?.label ?? "",
);
const categoryColor = computed(
  () => categoryMap[opp.value?.category as Category]?.color ?? "",
);
const categoryIcon = computed(
  () => categoryMap[opp.value?.category as Category]?.icon ?? null,
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
  if (days === 0) return "Last day!";
  if (days === 1) return "1 day left";
  return `${days} days left`;
});

const deadlineClass = computed(() => {
  if (!opp.value?.deadline) return "opp-detail__info-item--ongoing";
  const days = daysLeft.value!;
  if (days < 0) return "opp-detail__info-item--expired";
  if (days <= 7) return "opp-detail__info-item--urgent";
  if (days <= 30) return "opp-detail__info-item--soon";
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
  description: () => opp.value?.description ?? "",
  ogTitle: () => `${opp.value?.title ?? ""} — HerStory Africa`,
  ogDescription: () => opp.value?.description ?? "",
  ogImage: getAbsoluteUrl(),
  ogUrl: canonicalUrl,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: () => `${opp.value?.title ?? ""} — HerStory Africa`,
  twitterDescription: () => opp.value?.description ?? "",
  twitterImage: getAbsoluteUrl(),
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
.opp-detail {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .opp-detail {
    padding: 2rem 2rem 4rem;
  }
}

.opp-detail__header {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.opp-detail__meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.opp-detail__category {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3125rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--cat) 10%, transparent);
  color: var(--cat);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.opp-detail__featured {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.opp-detail__title {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.opp-detail__info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
}

.opp-detail__info-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.opp-detail__info-item--ongoing {
  color: var(--color-forest);
}

.opp-detail__info-item--soon {
  color: var(--color-secondary);
}

.opp-detail__info-item--urgent {
  color: var(--color-crimson);
  font-weight: 700;
}

.opp-detail__info-item--expired {
  color: var(--text-muted);
  opacity: 0.6;
}

.opp-detail__description {
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
}

.opp-detail__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.opp-detail__apply {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-on-primary);
  text-decoration: none;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.opp-detail__apply:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
}

/* ── Body content ── */
.opp-detail__content {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
}

.opp-detail__content :deep(h2) {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 2rem 0 0.75rem;
}

.opp-detail__content :deep(h2:first-child) {
  margin-top: 0;
}

.opp-detail__content :deep(p) {
  font-size: 1.0625rem;
  line-height: 1.75;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.opp-detail__content :deep(strong) {
  color: var(--text-primary);
  font-weight: 700;
}

.opp-detail__content :deep(ul) {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.opp-detail__content :deep(li) {
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-secondary);
  padding-left: 1.5rem;
  position: relative;
}

.opp-detail__content :deep(li::before) {
  content: "";
  position: absolute;
  left: 0;
  top: 0.6em;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--color-primary-300);
}

.opp-detail__content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.opp-detail__content :deep(a:hover) {
  color: var(--color-primary-600);
}

/* ── Not found ── */
.opp-detail__not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60dvh;
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.opp-detail__not-found h2 {
  margin: 1rem 0 0.25rem;
  color: var(--text-primary);
}

.opp-detail__not-found p {
  color: var(--text-secondary);
  margin: 0;
}

.opp-detail__back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0.75rem 1.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-on-primary);
  text-decoration: none;
  transition: background 0.2s ease;
}

.opp-detail__back-btn:hover {
  background: var(--color-primary-600);
}
</style>
