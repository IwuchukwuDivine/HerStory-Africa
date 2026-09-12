<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="Pagination">
    <button
      type="button"
      class="pagination__btn"
      :disabled="modelValue <= 1"
      aria-label="Previous page"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      <LucideChevronLeft :size="18" />
    </button>

    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="pagination__ellipsis">…</span>
      <button
        v-else
        type="button"
        class="pagination__page"
        :class="{ 'pagination__page--active': page === modelValue }"
        :aria-label="`Page ${page}`"
        :aria-current="page === modelValue ? 'page' : undefined"
        @click="$emit('update:modelValue', page as number)"
      >
        {{ page }}
      </button>
    </template>

    <button
      type="button"
      class="pagination__btn"
      :disabled="modelValue >= totalPages"
      aria-label="Next page"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      <LucideChevronRight :size="18" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import scrollToTop from "~/utils/scrollToTop";

const props = defineProps<{
  modelValue: number;
  totalPages: number;
}>();

defineEmits<{
  "update:modelValue": [page: number];
}>();

watch(
  () => props.modelValue,
  () => {
    scrollToTop();
  },
);

const visiblePages = computed(() => {
  const total = props.totalPages;
  const current = props.modelValue;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
});
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 40px;
}

.pagination__btn,
.pagination__page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 0 8px;
  border-radius: 10px;
  border: 1.5px solid transparent;
  background: transparent;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.pagination__btn {
  border-color: var(--border-default);
  background: var(--surface-elevated);
}

@media (hover: hover) {
  .pagination__btn:hover:not(:disabled) {
    border-color: var(--ring-default);
    color: var(--color-primary);
  }

  .pagination__page:hover:not(.pagination__page--active) {
    background: var(--surface-muted);
    color: var(--text-primary);
  }
}

.pagination__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pagination__page--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
}

.pagination__ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 44px;
  font-size: 14px;
  color: var(--text-muted);
  user-select: none;
}
</style>
