<template>
  <NuxtLink :to="`/collections/${slug}`" class="collection-card">
    <div class="collection-card__header">
      <span class="collection-card__theme">{{ theme }}</span>
      <span class="collection-card__count">
        <LucideUsers :size="14" />
        {{ womenCount }}
      </span>
    </div>

    <h3 class="collection-card__title">{{ title }}</h3>
    <p class="collection-card__description">{{ description }}</p>

    <div class="collection-card__footer">
      <div v-if="previewImages.length" class="collection-card__avatars">
        <NuxtImg
          v-for="(img, i) in previewImages"
          :key="i"
          :src="img"
          :alt="`Preview ${i + 1}`"
          width="32"
          height="32"
          format="webp"
          loading="lazy"
          class="collection-card__avatar"
          :style="{ zIndex: previewImages.length - i }"
        />
        <span
          v-if="womenCount > previewImages.length"
          class="collection-card__avatar-more"
        >
          +{{ womenCount - previewImages.length }}
        </span>
      </div>

      <span class="collection-card__explore">
        Explore
        <LucideArrowRight :size="16" />
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  slug: string;
  description: string;
  theme: string;
  womenCount: number;
  previewImages: string[];
}>();
</script>

<style scoped>
.collection-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.25s ease;
}

.collection-card:hover {
  border-color: var(--color-primary-200);
  box-shadow: var(--shadow-elevated);
  transform: translateY(-4px);
}

.collection-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.collection-card__theme {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.1875rem 0.625rem;
  border-radius: 9999px;
  background: var(--color-primary-50);
  color: var(--color-primary);
  white-space: nowrap;
}

.dark .collection-card__theme {
  background: var(--color-primary-950);
}

.collection-card__count {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.collection-card__title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.collection-card__description {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.collection-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 0.5rem;
}

.collection-card__avatars {
  display: flex;
  align-items: center;
}

.collection-card__avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--surface-elevated);
  margin-left: -0.5rem;
  background: var(--surface-muted);
}

.collection-card__avatar:first-child {
  margin-left: 0;
}

.collection-card__avatar-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin-left: -0.5rem;
  background: var(--surface-subtle);
  border: 2px solid var(--surface-elevated);
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--text-muted);
}

.collection-card__explore {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
  transition: gap 0.2s ease;
}

.collection-card:hover .collection-card__explore {
  gap: 0.625rem;
}
</style>
