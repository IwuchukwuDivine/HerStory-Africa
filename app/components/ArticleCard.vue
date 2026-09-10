<template>
  <NuxtLink :to="`/articles/${slug}`" class="article-card" :class="{ 'article-card--has-image': image }">
    <div v-if="image" class="article-card__image-wrapper">
      <NuxtImg
        :src="image"
        :alt='`Illustration for "${title}"`'
        width="280"
        height="158"
        format="webp"
        class="article-card__image"
      />
    </div>
    <div v-else class="article-card__icon-wrapper">
      <LucideBookOpen :size="24" class="article-card__icon" />
    </div>

    <div class="article-card__body">
      <div class="article-card__meta">
        <span v-if="category" class="article-card__category">{{ category }}</span>
        <time class="article-card__date" :datetime="date">
          {{ formattedDate }}
        </time>
        <ClientOnly>
          <span v-if="read" class="article-card__read-badge">
            <LucideCheck :size="12" />
            Read
          </span>
        </ClientOnly>
      </div>
      <h3 class="article-card__title">{{ title }}</h3>
      <p class="article-card__description">{{ description }}</p>
    </div>

    <div class="article-card__actions">
      <ClientOnly>
        <FavoriteButton type="article" :slug="slug" :size="16" />
      </ClientOnly>
      <LucideArrowRight :size="18" class="article-card__arrow" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
  date: string
  slug: string
  category?: string
  image?: string
}>()

const { isRead } = useApp()
const read = computed(() => isRead('article', props.slug))

const formattedDate = computed(() => {
  const d = new Date(props.date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<style scoped>
.article-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

@media (min-width: 480px) {
  .article-card {
    gap: 1rem;
    padding: 1.25rem;
  }
}

.article-card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-soft);
}

.article-card__image-wrapper {
  flex-shrink: 0;
  align-self: stretch;
  width: 5.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--surface-muted);
}

@media (min-width: 480px) {
  .article-card__image-wrapper {
    width: 8.5rem;
    border-radius: 0.625rem;
  }
}

.article-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-card__icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: var(--color-primary-50);
}

.article-card__icon {
  color: var(--color-primary);
}

.article-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.article-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
}

.article-card__category {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: var(--color-primary-50);
  color: var(--color-primary);
  white-space: nowrap;
}

.article-card__date {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

.article-card__read-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-success, #16a34a);
}

.article-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.35;
}

.article-card__description {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0.125rem 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.article-card__arrow {
  flex-shrink: 0;
  color: var(--text-muted);
  margin-top: 0.25rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

.article-card:hover .article-card__arrow {
  transform: translateX(3px);
  color: var(--color-primary);
}
</style>
