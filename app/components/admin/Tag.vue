<template>
  <span class="a-tag" :class="`a-tag--${tone}`"><slot /></span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ tone?: "ok" | "warn" | "bad" | "info" | "muted" }>(),
  { tone: "muted" },
);
</script>

<style scoped>
/* Tints are color-mix against the live surface rather than the -50 ramp steps,
   which are fixed light values and turn unreadable in dark mode. */
.a-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.a-tag--ok {
  color: var(--color-forest);
  background: color-mix(in srgb, var(--color-forest) 14%, var(--surface));
}

.a-tag--warn {
  color: var(--text-gold);
  background: color-mix(in srgb, var(--color-secondary) 16%, var(--surface));
}

.a-tag--bad {
  color: var(--color-crimson-600);
  background: color-mix(in srgb, var(--color-crimson) 14%, var(--surface));
}

.a-tag--info {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, var(--surface));
}

.a-tag--muted {
  color: var(--text-muted);
  background: var(--surface-subtle);
}

.dark .a-tag--bad {
  color: var(--color-crimson-300);
}
</style>
