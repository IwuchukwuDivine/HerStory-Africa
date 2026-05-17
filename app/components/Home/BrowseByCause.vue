<template>
  <section class="section causes">
    <div class="section__header">
      <h2 class="section__title">Explore by Cause</h2>
      <p class="section__subtitle">What did they fight for?</p>
    </div>

    <div class="causes__pills">
      <NuxtLink
        v-for="cause in CAUSES"
        :key="cause"
        :to="{ path: '/women', query: { cause } }"
        class="cause-pill"
      >
        {{ cause }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CAUSES } from "~/utils/constants/content";
</script>

<style scoped>
.causes {
  padding-top: 0rem;
}
.causes__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.cause-pill {
  padding: 0.5rem 1.125rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.cause-pill:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
  transform: translateY(-1px);
}
</style>
