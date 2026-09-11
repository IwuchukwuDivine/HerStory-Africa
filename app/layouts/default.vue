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
      <ConsentBanner />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/store/app";

// Visit bookkeeping for "Continue reading": remember when the visitor was
// last here before stamping this visit. Runs once per session.
const store = useAppStore();
const previousVisitAt = useState<number>("previous-visit-at", () => 0);
const visitRecorded = useState<boolean>("visit-recorded", () => false);

onMounted(() => {
  if (visitRecorded.value) return;
  previousVisitAt.value = store.lastVisitAt;
  store.touchVisit();
  visitRecorded.value = true;
});
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-layout__main {
  flex: 1;
}

/* The children hide themselves via the reading-bar / AI flags. */
.floating-actions {
  position: fixed;
  bottom: calc(24px + var(--bottom));
  right: calc(24px + var(--right));
  z-index: 250;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

@media (max-width: 640px) {
  .floating-actions {
    right: calc(16px + var(--right));
  }
}
</style>
