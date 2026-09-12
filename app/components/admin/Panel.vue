<template>
  <section class="a-panel">
    <div v-if="title || $slots.head" class="a-panel__head">
      <div class="a-panel__head-text">
        <h2 class="a-panel__title">{{ title }}</h2>
        <p v-if="meta" class="a-panel__meta">{{ meta }}</p>
      </div>
      <slot name="head" />
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{ title?: string; meta?: string }>();
</script>

<style scoped>
.a-panel {
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
  overflow: hidden;
}

.a-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-light);
}

.a-panel__head-text {
  min-width: 0;
}

.a-panel__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.a-panel__meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.125rem 0 0;
}
</style>
