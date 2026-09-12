<template>
  <div class="a-empty" :class="`a-empty--${tone}`">
    <slot name="icon"><LucideInbox :size="24" aria-hidden="true" /></slot>
    <p class="a-empty__title">{{ title }}</p>
    <p v-if="$slots.default" class="a-empty__text"><slot /></p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ title: string; tone?: "muted" | "error" }>(),
  { tone: "muted" },
);
</script>

<style scoped>
.a-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  padding: 2.5rem 1.5rem;
  color: var(--text-muted);
}

.a-empty--error {
  color: var(--color-crimson-600);
}

.dark .a-empty--error {
  color: var(--color-crimson-300);
}

.a-empty__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.a-empty--error .a-empty__title {
  color: inherit;
}

.a-empty__text {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 34rem;
  margin: 0;
}

.a-empty__text :deep(code) {
  font-size: 0.75rem;
  padding: 0.0625rem 0.25rem;
  border-radius: 0.25rem;
  background: var(--surface-muted);
}
</style>
