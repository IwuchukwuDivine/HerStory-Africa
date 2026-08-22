<template>
  <ul class="bar-list">
    <li v-for="(item, i) in items" :key="i" class="bar-list__row">
      <span class="bar-list__label" :title="item.label">{{ item.label }}</span>
      <span class="bar-list__track">
        <span
          class="bar-list__fill"
          :style="{ width: `${pct(item.value)}%` }"
        />
      </span>
      <span class="bar-list__value">{{ format(item.value) }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{ items: { label: string; value: number }[] }>();

const max = computed(() =>
  Math.max(1, ...props.items.map((i) => i.value)),
);

function pct(v: number) {
  return Math.max(2, (v / max.value) * 100);
}

function format(v: number) {
  return new Intl.NumberFormat("en").format(v);
}
</script>

<style scoped>
.bar-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.bar-list__row {
  display: grid;
  grid-template-columns: minmax(6rem, 12rem) 1fr auto;
  align-items: center;
  gap: 0.75rem;
}

.bar-list__label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-list__track {
  height: 0.5rem;
  background: var(--surface-muted);
  border-radius: 9999px;
  overflow: hidden;
}

.bar-list__fill {
  display: block;
  height: 100%;
  background: var(--color-primary);
  border-radius: 9999px;
}

.bar-list__value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
</style>
