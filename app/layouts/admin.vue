<template>
  <div class="admin-layout">
    <slot />
  </div>
</template>

<script setup lang="ts">
useHead({
  meta: [{ name: "robots", content: "noindex,nofollow" }],
});
</script>

<style scoped>
.admin-layout {
  min-height: 100dvh;
  background: var(--surface);
}
</style>
