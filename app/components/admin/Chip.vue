<template>
  <button
    type="button"
    class="a-chip"
    :class="{ 'a-chip--active': active }"
    :aria-pressed="active"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ active?: boolean }>();
</script>

<style scoped>
.a-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 36px;
  padding: 0 0.875rem;
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.a-chip:hover:not(.a-chip--active) {
  border-color: var(--ring-default);
  color: var(--color-primary);
}

.a-chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
}

@media (max-width: 767px) {
  .a-chip {
    height: 44px;
  }
}
</style>
