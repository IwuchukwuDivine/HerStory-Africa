<template>
  <div class="app-layout">
    <Navbar />
    <main class="app-layout__main">
      <slot />
    </main>
    <Footer />
    <ClientOnly>
      <BackToTop />
      <NewsletterModal />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-layout__main {
  flex: 1;
}
</style>
