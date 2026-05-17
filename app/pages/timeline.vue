<template>
  <div class="tl-page">
    <header class="tl-page__header">
      <h1 class="tl-page__title">Timeline</h1>
      <p class="tl-page__subtitle">
        {{ totalCount }} women across the centuries, from pre-colonial queens to
        contemporary leaders.
      </p>
    </header>

    <div v-if="groupedEras.length" class="tl-page__body">
      <section v-for="era in groupedEras" :key="era.label" class="tl-era">
        <div class="tl-era__badge" :style="{ '--era-color': era.color }">
          <span class="tl-era__label">{{ era.label }}</span>
          <span class="tl-era__count">
            {{ era.women.length }}
            {{ era.women.length === 1 ? "profile" : "profiles" }}
          </span>
        </div>

        <div class="tl-era__track">
          <div
            v-for="(woman, index) in era.women"
            :key="woman.slug"
            class="tl-item"
          >
            <div class="tl-item__marker" :style="{ '--era-color': era.color }">
              <span class="tl-item__year">{{ woman.born ?? "?" }}</span>
              <span class="tl-item__dot" />
              <span v-if="index < era.women.length - 1" class="tl-item__line" />
            </div>

            <NuxtLink :to="`/women/${woman.slug}`" class="tl-item__card">
              <div class="tl-item__avatar-wrap">
                <NuxtImg
                  :src="woman.image"
                  :alt="woman.name"
                  width="80"
                  height="80"
                  format="webp"
                  loading="lazy"
                  class="tl-item__avatar"
                />
              </div>
              <div class="tl-item__body">
                <h3 class="tl-item__name">{{ woman.name }}</h3>
                <p class="tl-item__meta">
                  {{ woman.country }} · {{ woman.era }}
                </p>
                <p class="tl-item__summary">{{ woman.summary }}</p>
              </div>
              <LucideChevronRight :size="16" class="tl-item__chevron" />
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const ERA_ORDER = [
  { label: "Pre-Colonial", color: "var(--color-secondary)" },
  { label: "Colonial", color: "var(--color-crimson)" },
  { label: "Independence", color: "var(--color-forest)" },
  { label: "Modern", color: "var(--color-primary)" },
  { label: "Contemporary", color: "var(--color-forest)" },
] as const;

const { data: allWomen } = await useAsyncData("timeline-all", () =>
  queryCollection("women").order("born", "ASC").all(),
);

const totalCount = computed(() => allWomen.value?.length ?? 0);

const groupedEras = computed(() => {
  if (!allWomen.value) return [];

  return ERA_ORDER.map((era) => ({
    ...era,
    women: allWomen.value!.filter((w) => w.era === era.label),
  })).filter((era) => era.women.length > 0);
});

useSeoMeta({
  title: "Timeline",
  description:
    "A chronological timeline of African women who shaped history, from pre-colonial queens to contemporary leaders.",
  ogTitle: "Timeline — HerStory Africa",
  ogDescription:
    "Explore the full timeline of African women who fought for equality across the centuries.",
  ogImage: getAbsoluteUrl(),
  ogUrl: getAbsoluteUrl("/timeline"),
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/timeline") }],
});
</script>

<style scoped>
.tl-page {
  max-width: 52rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .tl-page {
    padding: 2.5rem 2rem 4rem;
  }
}

.tl-page__header {
  margin-bottom: 2.5rem;
}

.tl-page__title {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.tl-page__subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0.375rem 0 0;
}

/* ── Era section ── */
.tl-era {
  margin-bottom: 2.5rem;
}

.tl-era:last-child {
  margin-bottom: 0;
}

.tl-era__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1.25rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--era-color) 10%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--era-color) 25%, transparent);
  margin-bottom: 1.5rem;
}

.tl-era__label {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--era-color);
}

.tl-era__count {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
}

/* ── Timeline track ── */
.tl-era__track {
  display: flex;
  flex-direction: column;
}

.tl-item {
  display: flex;
  gap: 1.25rem;
}

.tl-item__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 3.5rem;
}

.tl-item__year {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--era-color);
  font-variant-numeric: tabular-nums;
}

.tl-item__dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  background: var(--era-color);
  border: 2.5px solid var(--surface);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--era-color) 30%, transparent);
  margin: 0.375rem 0;
  flex-shrink: 0;
}

.tl-item__line {
  flex: 1;
  width: 2px;
  background: var(--border-default);
  min-height: 1rem;
}

/* ── Timeline card ── */
.tl-item__card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem 1.125rem;
  border-radius: 0.875rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  margin-bottom: 0.75rem;
  flex: 1;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.tl-item__card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-soft);
}

.tl-item__avatar-wrap {
  flex-shrink: 0;
}

.tl-item__avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  object-fit: cover;
  background: var(--surface-muted);
}

.tl-item__body {
  flex: 1;
  min-width: 0;
}

.tl-item__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.125rem;
  line-height: 1.3;
}

.tl-item__meta {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0 0 0.375rem;
}

.tl-item__summary {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tl-item__chevron {
  flex-shrink: 0;
  color: var(--text-muted);
  margin-top: 0.25rem;
  transition:
    transform 0.15s ease,
    color 0.15s ease;
}

.tl-item__card:hover .tl-item__chevron {
  transform: translateX(2px);
  color: var(--color-primary);
}
</style>
