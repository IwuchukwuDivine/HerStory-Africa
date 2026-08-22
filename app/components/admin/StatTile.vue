<template>
  <div class="stat-tile">
    <div class="stat-tile__top">
      <slot name="icon" />
      <span class="stat-tile__label">{{ label }}</span>
    </div>
    <p class="stat-tile__value">{{ formatted }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ label: string; value: number }>();

const formatted = computed(() =>
  new Intl.NumberFormat("en").format(props.value),
);
</script>

<style scoped>
.stat-tile {
  flex: 1;
  min-width: 9rem;
  padding: 1.25rem 1.5rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  box-shadow: var(--shadow-card);
}

.stat-tile__top {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
}

.stat-tile__label {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-tile__value {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0.5rem 0 0;
  font-variant-numeric: tabular-nums;
}
</style>
