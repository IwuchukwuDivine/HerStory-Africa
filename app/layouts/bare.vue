<template>
  <!-- No navbar, footer, newsletter modal or consent banner: the page owns
       the whole screen. Used by /links, which people open from Instagram. -->
  <main id="main-content" class="bare-layout">
    <slot />
  </main>
</template>

<script setup lang="ts">
// The consent banner is what normally restores a stored analytics choice,
// and it is not mounted here, so do it directly. Visitors who never chose
// stay untracked, as everywhere else on the site.
const { restoreStoredConsent } = useTag();
onMounted(restoreStoredConsent);
</script>

<style scoped>
.bare-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
</style>
