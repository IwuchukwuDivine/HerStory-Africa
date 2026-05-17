<template>
  <div class="app-layout">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <Navbar />
    <main id="main-content" class="app-layout__main">
      <slot />
    </main>
    <Footer />
    <ClientOnly>
      <div class="floating-actions">
        <BackToTop />
        <AiAssistant />
      </div>
      <NewsletterModal />
      <IOSInstallPrompt />
      <ConsentBanner />
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

.floating-actions {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 250;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .floating-actions {
    right: 1rem;
  }
}
</style>
