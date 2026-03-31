<template>
  <NuxtLink
    :to="`/opportunities/${slug}`"
    class="opp-card"
    :class="{ 'opp-card--featured': featured }"
  >
    <div class="opp-card__top">
      <span class="opp-card__category" :style="{ '--cat': categoryColor }">
        <component :is="categoryIcon" :size="14" />
        {{ categoryLabel }}
      </span>
      <span v-if="featured" class="opp-card__featured-badge">
        <LucideStar :size="12" />
        Featured
      </span>
    </div>

    <h3 class="opp-card__title">{{ title }}</h3>

    <p v-if="organization" class="opp-card__org">
      <LucideBuilding2 :size="14" />
      {{ organization }}
    </p>

    <p class="opp-card__desc">{{ description }}</p>

    <div class="opp-card__footer">
      <span class="opp-card__deadline" :class="deadlineClass">
        <LucideCalendar :size="14" />
        {{ deadlineLabel }}
      </span>
      <span class="opp-card__arrow">
        <LucideArrowRight :size="16" />
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  slug: string
  category: 'scholarship' | 'job' | 'grant' | 'fellowship'
  organization: string
  description: string
  deadline: string | null
  link: string
  featured: boolean
}>()

const categoryMap = {
  scholarship: { label: 'Scholarship', color: 'var(--color-forest)', icon: 'LucideGraduationCap' },
  job: { label: 'Job / Internship', color: 'var(--color-secondary)', icon: 'LucideBriefcase' },
  grant: { label: 'Grant', color: 'var(--color-primary)', icon: 'LucideCoins' },
  fellowship: { label: 'Fellowship', color: 'var(--color-crimson)', icon: 'LucideLightbulb' },
} as const

const categoryLabel = computed(() => categoryMap[props.category].label)
const categoryColor = computed(() => categoryMap[props.category].color)
const categoryIcon = computed(() => resolveComponent(categoryMap[props.category].icon))

const daysLeft = computed(() => {
  if (!props.deadline) return null
  const diff = new Date(props.deadline).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const deadlineLabel = computed(() => {
  if (!props.deadline) return 'Ongoing'
  const days = daysLeft.value!
  if (days < 0) return 'Expired'
  if (days === 0) return 'Last day!'
  if (days === 1) return '1 day left'
  return `${days} days left`
})

const deadlineClass = computed(() => {
  if (!props.deadline) return 'opp-card__deadline--ongoing'
  const days = daysLeft.value!
  if (days < 0) return 'opp-card__deadline--expired'
  if (days <= 7) return 'opp-card__deadline--urgent'
  if (days <= 30) return 'opp-card__deadline--soon'
  return 'opp-card__deadline--plenty'
})
</script>

<style scoped>
.opp-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.opp-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-soft);
}

.opp-card--featured {
  border-color: var(--color-secondary);
  background: linear-gradient(
    135deg,
    var(--surface-elevated) 80%,
    color-mix(in srgb, var(--color-secondary) 6%, transparent)
  );
}

.opp-card--featured:hover {
  border-color: var(--color-secondary);
}

.opp-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.opp-card__category {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--cat) 10%, transparent);
  color: var(--cat);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.opp-card__featured-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.opp-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.opp-card__org {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: -0.25rem 0 0;
}

.opp-card__desc {
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.opp-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 0.5rem;
}

.opp-card__deadline {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
}

.opp-card__deadline--ongoing {
  color: var(--color-forest);
}

.opp-card__deadline--plenty {
  color: var(--text-muted);
}

.opp-card__deadline--soon {
  color: var(--color-secondary);
}

.opp-card__deadline--urgent {
  color: var(--color-crimson);
}

.opp-card__deadline--expired {
  color: var(--text-muted);
  opacity: 0.6;
}

.opp-card__arrow {
  color: var(--text-muted);
  transition: transform 0.2s ease, color 0.2s ease;
}

.opp-card:hover .opp-card__arrow {
  transform: translateX(3px);
  color: var(--color-primary);
}
</style>
