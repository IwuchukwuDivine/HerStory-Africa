<template>
  <article v-if="article" class="article-page">
    <button class="go-back" @click="goBack">
      <LucideArrowLeft :size="18" />
      Back
    </button>

    <header class="article-page__header">
      <div class="article-page__top-row">
        <div class="article-page__top-left">
          <time class="article-page__date" :datetime="article.date">
            {{ formattedDate }}
          </time>
          <ClientOnly>
            <span v-if="articleRead" class="article-page__read-badge">
              <LucideCheck :size="14" />
              Read
            </span>
          </ClientOnly>
        </div>
        <ClientOnly>
          <FavoriteButton type="article" :slug="article.slug" :size="20" />
        </ClientOnly>
      </div>
      <h1 class="article-page__title">{{ article.title }}</h1>
      <p class="article-page__description">{{ article.description }}</p>
      <ClientOnly>
        <ListenButton content-selector=".article-page__title, .article-page__description, .article-page__content" />
      </ClientOnly>
    </header>

    <div class="article-page__content">
      <ContentRenderer :value="article" />
    </div>

    <div ref="readSentinel" />

    <NewsletterCta
      title="Enjoyed this article?"
      description="Get new articles and stories of remarkable African women delivered to your inbox."
    />

    <footer class="article-page__footer">
      <NuxtLink to="/" class="article-page__footer-link">
        <LucideArrowLeft :size="16" />
        Back to home
      </NuxtLink>
    </footer>
  </article>

  <div v-else class="article-page__not-found">
    <LucideFileX :size="48" />
    <h2>Article not found</h2>
    <p>The article you're looking for doesn't exist.</p>
    <NuxtLink to="/" class="article-page__back-btn"> Go home </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const { data: article } = await useAsyncData(`article-${route.path}`, () =>
  queryCollection("articles").path(route.path).first(),
);

const readSentinel = ref<HTMLElement | null>(null);

const { isRead } = useApp();
const articleRead = computed(() =>
  article.value ? isRead("article", article.value.slug) : false,
);

if (article.value?.slug) {
  useReadTracker("article", article.value.slug, readSentinel);
}

const formattedDate = computed(() => {
  if (!article.value?.date) return "";
  const d = new Date(article.value.date);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

useSeoMeta({
  title: () => article.value?.title ?? "Article not found",
  description: () => article.value?.description ?? "",
  ogTitle: () => article.value?.title ?? "",
  ogDescription: () => article.value?.description ?? "",
  ogImage: "https://her-story-africa-seven.vercel.app/og-image.png",
});
</script>

<style scoped>
.article-page {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .article-page {
    padding: 2rem;
  }
}

.article-page__header {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-light);
}

.article-page__top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.article-page__top-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.article-page__read-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-success, #16a34a);
}

.article-page__date {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.article-page__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0.75rem 0 0;
  line-height: 1.2;
}

.article-page__description {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 1rem 0 0;
}

/* ── Content body ── */
.article-page__content :deep(h2) {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 2.5rem 0 0.75rem;
}

.article-page__content :deep(p) {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin: 0 0 1.25rem;
}

.article-page__content :deep(strong) {
  color: var(--text-primary);
  font-weight: 700;
}

.article-page__content :deep(em) {
  font-style: italic;
}

.article-page__content :deep(ul) {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.article-page__content :deep(li) {
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-secondary);
  padding-left: 1.5rem;
  position: relative;
}

.article-page__content :deep(li::before) {
  content: "";
  position: absolute;
  left: 0;
  top: 0.6em;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--color-primary-300);
}

.article-page__content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 2rem 0;
}

.article-page__content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.article-page__content :deep(a:hover) {
  color: var(--color-primary-600);
}

/* ── Footer ── */
.article-page__footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
}

.article-page__footer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}

.article-page__footer-link:hover {
  color: var(--color-primary);
}

/* ── Not found ── */
.article-page__not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60dvh;
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.article-page__not-found h2 {
  margin: 1rem 0 0.25rem;
  color: var(--text-primary);
}

.article-page__not-found p {
  color: var(--text-secondary);
  margin: 0;
}

.article-page__back-btn {
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

.article-page__back-btn:hover {
  background: var(--color-primary-600);
}
</style>
