<template>
  <NuxtLink
    :to="`/opportunities/${slug}`"
    class="card opp-card"
    :class="{ 'opp-card--featured': featured }"
  >
    <div class="opp-card__top">
      <span class="opp-card__category" :style="{ '--cat': categoryColor }">
        <component :is="categoryIcon" :size="14" />
        {{ categoryLabel }}
      </span>
      <span v-if="featured" class="tint-gold opp-card__featured-badge">
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
import { Briefcase, Coins, GraduationCap, Lightbulb } from "lucide-vue-next";

const props = defineProps<{
  title: string;
  slug: string;
  category: "scholarship" | "job" | "grant" | "fellowship";
  organization: string;
  description: string;
  deadline: string | null;
  link: string;
  featured: boolean;
}>();

const categoryMap = {
  scholarship: {
    label: "Scholarship",
    color: "var(--color-forest)",
    icon: GraduationCap,
  },
  job: {
    label: "Job / Internship",
    color: "var(--color-secondary-600)",
    icon: Briefcase,
  },
  grant: { label: "Grant", color: "var(--color-primary)", icon: Coins },
  fellowship: {
    label: "Fellowship",
    color: "var(--color-crimson)",
    icon: Lightbulb,
  },
} as const;

const categoryLabel = computed(() => categoryMap[props.category].label);
const categoryColor = computed(() => categoryMap[props.category].color);
const categoryIcon = computed(() => categoryMap[props.category].icon);

const daysLeft = computed(() => {
  if (!props.deadline) return null;
  const diff = new Date(props.deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const deadlineLabel = computed(() => {
  if (!props.deadline) return "Ongoing";
  const days = daysLeft.value!;
  if (days < 0) return "Expired";
  if (days === 0) return "Last day";
  if (days === 1) return "1 day left";
  return `${days} days left`;
});

const deadlineClass = computed(() => {
  if (!props.deadline) return "opp-card__deadline--ongoing";
  const days = daysLeft.value!;
  if (days < 0) return "opp-card__deadline--expired";
  if (days <= 7) return "opp-card__deadline--urgent";
  if (days <= 30) return "opp-card__deadline--soon";
  return "opp-card__deadline--plenty";
});
</script>

<style scoped>
.opp-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border-radius: 16px;
  background: var(--surface-elevated);
  box-shadow: var(--shadow-card);
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

@media (hover: hover) {
  .opp-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-elevated);
  }
}

.opp-card:active {
  transform: scale(0.98);
}

/* Featured cards sit on the gold tint, which flips with the theme. */
.opp-card--featured {
  background: color-mix(in srgb, var(--color-secondary) 18%, var(--surface));
}

.opp-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.opp-card__category {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.2;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--cat) 14%, var(--surface));
  color: var(--cat);
}

.opp-card__featured-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--color-secondary-600);
}

.opp-card__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.opp-card__org {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
  margin: -4px 0 0;
}

.opp-card__desc {
  font-size: 15px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.opp-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 8px;
}

.opp-card__deadline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.opp-card__deadline--ongoing {
  color: var(--color-forest);
}

.opp-card__deadline--plenty {
  color: var(--text-muted);
}

.opp-card__deadline--soon {
  color: var(--color-secondary-600);
}

.opp-card__deadline--urgent {
  color: var(--color-crimson);
}

.opp-card__deadline--expired {
  color: var(--text-muted);
  opacity: 0.6;
}

.opp-card__arrow {
  display: flex;
  color: var(--text-muted);
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

@media (hover: hover) {
  .opp-card:hover .opp-card__arrow {
    transform: translateX(3px);
    color: var(--color-primary);
  }
}

@media (prefers-reduced-motion: reduce) {
  .opp-card,
  .opp-card__arrow {
    transition: none;
  }
}
</style>
