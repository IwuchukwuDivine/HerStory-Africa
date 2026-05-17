<template>
  <div class="exploration-progress">
    <div class="exploration-progress__icon">
      <LucideBookOpen :size="18" />
    </div>

    <div class="exploration-progress__content">
      <p class="exploration-progress__label">
        You've explored
        <strong>{{ readCount }}</strong> of <strong>{{ total }}</strong> women
      </p>

      <div class="exploration-progress__bar-track">
        <div
          class="exploration-progress__bar-fill"
          :style="{ width: `${percentage}%` }"
        />
      </div>

      <p class="exploration-progress__hint">
        {{ encouragement }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  total: number;
}>();

const { readWomen } = useApp();

const readCount = computed(() => readWomen.value.length);

const percentage = computed(() => {
  if (props.total === 0) return 0;
  return Math.min(Math.round((readCount.value / props.total) * 100), 100);
});

const encouragement = computed(() => {
  const pct = percentage.value;
  if (pct === 0) return 'Start exploring — every story matters.';
  if (pct < 10) return 'You\'re just getting started. Keep going!';
  if (pct < 25) return 'Great progress — so many stories await.';
  if (pct < 50) return 'You\'re on a journey through history.';
  if (pct < 75) return 'Impressive! You know your African heroines.';
  if (pct < 100) return 'Almost there — the full archive awaits.';
  return 'You\'ve explored every story. You are the archive.';
});
</script>

<style scoped>
.exploration-progress {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-radius: 0.875rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
}

.exploration-progress__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  background: var(--color-primary-50);
  color: var(--color-primary);
}

.dark .exploration-progress__icon {
  background: var(--color-primary-950);
}

.exploration-progress__content {
  flex: 1;
  min-width: 0;
}

.exploration-progress__label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.exploration-progress__label strong {
  color: var(--text-primary);
  font-weight: 700;
}

.exploration-progress__bar-track {
  height: 0.375rem;
  border-radius: 9999px;
  background: var(--surface-subtle);
  overflow: hidden;
}

.exploration-progress__bar-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
}

.exploration-progress__hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.375rem 0 0;
  font-style: italic;
}
</style>
