<template>
  <div class="app-layout">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <Navbar />
    <main id="main-content" class="app-layout__main">
      <slot />
    </main>
    <Footer />
    <ClientOnly>
      <BackToTop />
      <NewsletterModal />
      <IOSInstallPrompt />
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
