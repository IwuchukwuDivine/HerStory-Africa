<template>
  <button
    v-for="s in items"
    :key="s.number"
    type="button"
    class="a-sug-row"
    :class="{ 'a-sug-row--active': s.number === activeNumber }"
    @click="emit('select', s.number)"
  >
    <span class="a-sug-row__body">
      <span class="a-sug-row__top">
        <span class="a-sug-row__name">{{ nameOf(s) }}</span>
        <AdminTag :tone="statusOf(s).tone">{{ statusOf(s).label }}</AdminTag>
      </span>
      <span class="a-sug-row__reason">{{ reasonOf(s) }}</span>
      <span class="a-sug-row__meta">{{ metaOf(s) }}</span>
    </span>
    <span class="a-sug-row__age">{{ ageOf(s) }}</span>
  </button>
</template>

<script setup lang="ts">
import type { AdminSuggestion } from "~/utils/types/admin";

defineProps<{ items: AdminSuggestion[]; activeNumber: number | null }>();
const emit = defineEmits<{ select: [number] }>();

const {
  nameOf,
  reasonOf,
  metaOf,
  ageOf,
  statusOf,
} = useSuggestionDisplay();
</script>

<style scoped>
.a-sug-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.625rem 1rem;
  border: none;
  border-bottom: 1px solid var(--border-light);
  border-left: 3px solid transparent;
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.a-sug-row:last-child {
  border-bottom: none;
}

.a-sug-row:hover {
  background: var(--surface-muted);
}

.a-sug-row--active {
  border-left-color: var(--color-primary);
  background: var(--surface-muted);
}

.a-sug-row__body {
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
  flex: 1;
  min-width: 0;
}

.a-sug-row__top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.a-sug-row__name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.a-sug-row__reason {
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.a-sug-row__meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.a-sug-row__age {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  flex-shrink: 0;
}
</style>
