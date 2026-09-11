<template>
  <div class="reading-progress" role="progressbar" :aria-valuenow="Math.round(progress * 100)" aria-valuemin="0" aria-valuemax="100" aria-label="Reading progress">
    <div class="reading-progress__fill" :style="{ width: `${progress * 100}%` }" />
  </div>
</template>

<script setup lang="ts">
/** 3px line under the navbar; fills as the reader scrolls the page. */
const progress = useScrollProgress();
</script>

<style scoped>
.reading-progress {
  position: sticky;
  top: var(--navbar-height, 61px);
  z-index: 90;
  height: 3px;
  background: var(--surface-subtle);
}

.reading-progress__fill {
  height: 3px;
  background: var(--color-primary);
  transition: width 0.1s linear;
}
</style>
