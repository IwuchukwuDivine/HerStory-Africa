<template>
  <div class="a-bar">
    <div class="a-bar__top">
      <span class="a-bar__label" :title="label">{{ label }}</span>
      <span class="a-bar__value">{{ formatted }}</span>
    </div>
    <div class="a-bar__track">
      <div class="a-bar__fill" :style="{ width: `${width}%` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ label: string; value: number; max: number }>();

const formatted = computed(() => props.value.toLocaleString("en"));
// 2% floor so a row that exists but barely registers is still visible.
const width = computed(() =>
  Math.max(2, (props.value / Math.max(1, props.max)) * 100),
);
</script>

<style scoped>
.a-bar {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.a-bar__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.a-bar__label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.a-bar__value {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.a-bar__track {
  height: 0.375rem;
  border-radius: 9999px;
  background: var(--surface-muted);
  overflow: hidden;
}

.a-bar__fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--color-primary);
}
</style>
