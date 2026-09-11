<template>
  <div class="region-rows">
    <NuxtLink v-for="row in rows" :key="row.to" :to="row.to" class="region-row">
      <span class="region-row__label">{{ row.label }}</span>
      <span class="region-row__count">
        {{ row.count }} {{ row.count === 1 ? "woman" : "women" }}
        <LucideChevronRight :size="18" />
      </span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
/** 56px rows with counts: regions on home and hubs, eras on era hubs. */
defineProps<{ rows: { label: string; count: number; to: string }[] }>();
</script>

<style scoped>
.region-rows {
  display: flex;
  flex-direction: column;
}

.region-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 4px;
  border-top: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  transition: background 0.15s ease;
}

.region-row:active {
  background: var(--surface-muted);
}

.region-row__label {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

@media (min-width: 768px) {
  .region-row__label {
    font-size: 18px;
  }
}

@media (hover: hover) {
  .region-row:hover .region-row__label {
    color: var(--color-primary);
  }
}

.region-row__count {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-muted);
}
</style>
