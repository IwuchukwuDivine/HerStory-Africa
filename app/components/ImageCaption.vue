<template>
  <figcaption v-if="text" class="caption">
    <p class="caption__text">{{ text }}</p>
  </figcaption>
</template>

<script setup lang="ts">
/** Ruled italic caption under a photograph. Credit text is part of the caption. */
defineProps<{ text?: string }>();
</script>
