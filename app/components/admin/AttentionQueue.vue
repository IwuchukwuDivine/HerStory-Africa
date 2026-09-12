<template>
  <NuxtLink v-for="(item, i) in items" :key="i" :to="item.to" class="a-queue__row">
    <span class="a-queue__dot" :class="`a-queue__dot--${item.tone}`" aria-hidden="true" />
    <span class="a-queue__text">
      <span class="a-queue__title">{{ item.title }}</span>
      <span class="a-queue__meta">{{ item.meta }}</span>
    </span>
    <span class="a-queue__action">{{ item.action }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { AdminQueueItem } from "~/utils/types/admin";

defineProps<{ items: AdminQueueItem[] }>();
</script>

<style scoped>
.a-queue__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  transition: background 0.15s ease;
}

.a-queue__row:last-child {
  border-bottom: none;
}

.a-queue__row:hover {
  background: var(--surface-muted);
}

.a-queue__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.a-queue__dot--primary {
  background: var(--color-primary);
}

.a-queue__dot--secondary {
  background: var(--color-secondary);
}

.a-queue__dot--crimson {
  background: var(--color-crimson);
}

.a-queue__text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
}

.a-queue__title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.a-queue__meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.a-queue__action {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
  flex-shrink: 0;
}
</style>
