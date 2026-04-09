<template>
  <section v-if="woman" class="section wotd">
    <div class="wotd__label">
      <LucideCalendarDays :size="16" />
      <span>Today's Story</span>
    </div>

    <NuxtLink :to="`/women/${woman.slug}`" class="wotd__card gradient-brand-subtle">
      <div class="wotd__image-wrapper">
        <NuxtImg
          :src="woman.image"
          :alt="woman.name"
          width="480"
          height="600"
          format="webp"
          loading="lazy"
          class="wotd__image"
        />
        <span class="wotd__era">{{ woman.era }}</span>
      </div>

      <div class="wotd__body">
        <ClientOnly>
          <time class="wotd__date">{{ formattedDate }}</time>
        </ClientOnly>
        <h2 class="wotd__name">{{ woman.name }}</h2>
        <p class="wotd__meta">
          <LucideMapPin :size="14" />
          {{ woman.country }}
          <span class="wotd__dates">
            · {{ woman.born ?? "Unknown" }}{{ woman.died ? `–${woman.died}` : woman.born ? "–present" : "" }}
          </span>
        </p>
        <p class="wotd__summary">{{ woman.summary }}</p>
        <div class="wotd__causes">
          <span
            v-for="cause in woman.causes?.slice(0, 3)"
            :key="cause"
            class="cause-tag"
          >
            {{ cause }}
          </span>
        </div>
        <span class="wotd__cta">
          Read her story
          <LucideArrowRight :size="16" />
        </span>
      </div>
    </NuxtLink>
  </section>

  <section v-else class="section wotd">
    <div class="wotd__label">
      <LucideCalendarDays :size="16" />
      <span>Today's Story</span>
    </div>
    <div class="wotd__card wotd__card--skeleton gradient-brand-subtle">
      <div class="wotd__image-wrapper">
        <div class="skeleton" style="width: 100%; height: 100%" />
      </div>
      <div
        style="
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        "
      >
        <div class="skeleton" style="height: 0.875rem; width: 40%" />
        <div class="skeleton" style="height: 1.75rem; width: 75%" />
        <div class="skeleton" style="height: 0.875rem; width: 50%" />
        <div class="skeleton" style="height: 3.5rem; width: 100%" />
        <div style="display: flex; gap: 0.375rem">
          <div class="skeleton" style="height: 1.25rem; width: 4rem; border-radius: 9999px" />
          <div class="skeleton" style="height: 1.25rem; width: 5rem; border-radius: 9999px" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: women } = await useAsyncData("all-women-wotd", () =>
  queryCollection("women").all(),
);

const { woman } = useWomanOfTheDay(women);

const formattedDate = computed(() => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
});
</script>

<style scoped>
.wotd {
  padding-bottom: 0;
}

.wotd__label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.wotd__card {
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-card);
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.wotd__card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-elevated);
}

.wotd__card--skeleton {
  pointer-events: none;
}

.wotd__image-wrapper {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--surface-muted);
}

.wotd__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.wotd__card:hover .wotd__image {
  transform: scale(1.04);
}

.wotd__era {
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

.wotd__body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem 1.5rem;
}

.wotd__date {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
}

.wotd__name {
  font-size: clamp(1.375rem, 3vw, 1.75rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.wotd__meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.wotd__dates {
  color: var(--text-muted);
}

.wotd__summary {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wotd__causes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

.wotd__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 0.5rem;
  transition: gap 0.2s ease;
}

.wotd__card:hover .wotd__cta {
  gap: 0.625rem;
}

@media (min-width: 640px) {
  .wotd__card {
    flex-direction: row;
  }

  .wotd__image-wrapper {
    flex: 0 0 40%;
    max-width: 40%;
    aspect-ratio: auto;
    min-height: 22rem;
  }

  .wotd__body {
    flex: 1;
    justify-content: center;
    padding: 2rem 2.25rem;
  }

  .wotd__summary {
    -webkit-line-clamp: 4;
  }
}
</style>
