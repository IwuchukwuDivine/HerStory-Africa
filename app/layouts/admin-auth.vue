<template>
  <div class="admin-auth">
    <slot />
  </div>
</template>

<script setup lang="ts">
// The login screen sits outside the console shell: no sidebar, and none of the
// authenticated fetches the admin layout runs.
useHead({
  meta: [{ name: "robots", content: "noindex,nofollow" }],
});
</script>

<style scoped>
.admin-auth {
  min-height: 100dvh;
  background: var(--surface);
}
</style>
