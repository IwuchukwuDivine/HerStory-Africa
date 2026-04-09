<template>
  <NuxtLink :to="`/women/${slug}`" class="woman-card">
    <div class="woman-card__image-wrapper">
      <NuxtImg
        :src="image"
        :alt="name"
        width="400"
        height="500"
        format="webp"
        loading="lazy"
        class="woman-card__image"
      />
      <span class="woman-card__era">{{ era }}</span>
      <ClientOnly>
        <FavoriteButton
          type="woman"
          :slug="slug"
          :size="16"
          class="woman-card__fav"
        />
      </ClientOnly>
    </div>

    <div class="woman-card__body">
      <h3 class="woman-card__name">{{ name }}</h3>
      <p class="woman-card__meta">
        <LucideMapPin :size="14" />
        {{ country }}
        <span class="woman-card__dates"
          >· {{ born ?? "Unknown" }}{{ died ? `–${died}` : born ? "–present" : "" }}</span
        >
      </p>
      <ClientOnly>
        <span v-if="read" class="woman-card__read-badge">
          <LucideCheck :size="12" />
          Read
        </span>
      </ClientOnly>
      <p class="woman-card__summary">{{ summary }}</p>
      <div class="woman-card__causes">
        <span v-for="cause in displayCauses" :key="cause" class="cause-tag">
          {{ cause }}
        </span>
        <span
          v-if="causes.length > maxCauses"
          class="cause-tag cause-tag--more"
        >
          +{{ causes.length - maxCauses }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    slug: string;
    image: string;
    country: string;
    born: number | null;
    died: number | null;
    era: string;
    summary: string;
    causes: string[];
    maxCauses?: number;
  }>(),
  {
    maxCauses: 2,
  },
);

const displayCauses = computed(() => props.causes.slice(0, props.maxCauses));

const { isRead } = useApp();
const read = computed(() => isRead('woman', props.slug));
</script>

<style scoped>
.woman-card {
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  overflow: hidden;
  background: var(--surface-elevated);
  box-shadow: var(--shadow-card);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  text-decoration: none;
  color: inherit;
}

.woman-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevated);
}

.woman-card__image-wrapper {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--surface-muted);
}

.woman-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.woman-card:hover .woman-card__image {
  transform: scale(1.05);
}

.woman-card__era {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  background: var(--overlay-default);
  color: #fff;
  backdrop-filter: blur(6px);
}

.woman-card__fav {
  position: absolute;
  top: 0.625rem;
  left: 0.625rem;
  background: var(--overlay-default);
  color: #fff;
  backdrop-filter: blur(6px);
  border-radius: 50%;
  padding: 0.4375rem;
}

.woman-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1rem 1.125rem 1.25rem;
}

.woman-card__name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.woman-card__meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0;
}

.woman-card__dates {
  color: var(--text-muted);
}

.woman-card__read-badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.2rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-success, #16a34a);
}

.woman-card__summary {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.woman-card__causes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

</style>
