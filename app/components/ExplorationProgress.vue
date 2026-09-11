<template>
  <div
    class="exploration-progress"
    role="progressbar"
    :aria-valuenow="readCount"
    aria-valuemin="0"
    :aria-valuemax="total"
    :aria-label="`You've read ${readCount} of ${total} women`"
  >
    <div class="progress-line">
      <div class="progress-line__fill" :style="{ width: `${percentage}%` }" />
    </div>
    <p class="exploration-progress__text">
      You've read {{ readCount }}<span class="exploration-progress__detail"> of {{ total }} women</span>
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  total: number;
}>();

const { readWomen } = useApp();

const readCount = computed(() => readWomen.value.length);

const percentage = computed(() => {
  if (props.total === 0) return 0;
  return Math.min(Math.round((readCount.value / props.total) * 100), 100);
});
</script>

<style scoped>
.exploration-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exploration-progress__text {
  flex-shrink: 0;
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-muted);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.exploration-progress__detail {
  display: none;
}

@media (min-width: 768px) {
  .exploration-progress__detail {
    display: inline;
  }
}
</style>
