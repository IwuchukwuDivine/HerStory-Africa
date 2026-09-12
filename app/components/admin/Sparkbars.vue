<template>
  <div class="a-spark" role="img" :aria-label="summary">
    <div v-for="(bar, i) in bars" :key="i" class="a-spark__col">
      <div class="a-spark__bar-wrap">
        <div
          class="a-spark__bar"
          :class="{ 'a-spark__bar--peak': bar.peak }"
          :style="{ height: bar.height }"
          :title="bar.title"
        />
      </div>
      <span v-if="bar.label" class="a-spark__label">{{ bar.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  values: number[];
  /** Optional caption under each bar. */
  labels?: string[];
  /** Used in the title attribute and the aria summary, e.g. "profiles". */
  unit?: string;
}>();

const max = computed(() => Math.max(1, ...props.values));

const bars = computed(() =>
  props.values.map((v, i) => ({
    // 3% floor keeps an empty month from vanishing into the baseline.
    height: `${Math.max(3, (v / max.value) * 100)}%`,
    label: props.labels?.[i] ?? "",
    peak: v === max.value && v > 0,
    title: `${props.labels?.[i] ? `${props.labels[i]}: ` : ""}${v.toLocaleString("en")}${props.unit ? ` ${props.unit}` : ""}`,
  })),
);

const summary = computed(() => {
  const total = props.values.reduce((a, b) => a + b, 0);
  return `${total.toLocaleString("en")} ${props.unit ?? "total"} across ${props.values.length} periods, peaking at ${max.value.toLocaleString("en")}`;
});
</script>

<style scoped>
.a-spark {
  display: flex;
  align-items: flex-end;
  gap: 0.25rem;
  height: 7rem;
}

.a-spark__col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  height: 100%;
}

.a-spark__bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.a-spark__bar {
  width: 100%;
  border-radius: 0.1875rem 0.1875rem 0 0;
  background: color-mix(in srgb, var(--color-primary) 45%, var(--surface));
  transition: background 0.15s ease;
}

.a-spark__bar:hover,
.a-spark__bar--peak {
  background: var(--color-primary);
}

.a-spark__label {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1;
}
</style>
