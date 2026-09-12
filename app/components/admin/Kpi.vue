<template>
  <div class="a-kpi">
    <span class="a-kpi__label">{{ kpi.label }}</span>
    <div class="a-kpi__row">
      <span class="a-kpi__value">{{ kpi.value }}</span>
      <span v-if="kpi.delta" class="a-kpi__delta" :class="{ 'a-kpi__delta--up': kpi.up }">
        {{ kpi.delta }}
      </span>
    </div>
    <span class="a-kpi__note">{{ kpi.note }}</span>
  </div>
</template>

<script setup lang="ts">
import type { AdminKpi } from "~/utils/types/admin";

defineProps<{ kpi: AdminKpi }>();
</script>

<style scoped>
.a-kpi {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
}

.a-kpi__label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.a-kpi__row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.a-kpi__value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.a-kpi__delta {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
}

.a-kpi__delta--up {
  color: var(--color-forest);
}

.dark .a-kpi__delta--up {
  color: var(--color-forest-300);
}

.a-kpi__note {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
