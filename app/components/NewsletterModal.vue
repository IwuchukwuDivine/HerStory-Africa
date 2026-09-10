<template>
  <Transition name="newsletter-card">
    <aside
      v-if="visible"
      class="newsletter-card"
      role="complementary"
      aria-label="Newsletter signup"
    >
      <button
        class="newsletter-card__close"
        type="button"
        aria-label="Dismiss newsletter signup"
        @click="dismiss"
      >
        <LucideX :size="18" />
      </button>

      <div class="newsletter-card__accent" />

      <div class="newsletter-card__body">
        <h2 class="newsletter-card__title">
          Don't let these stories stay hidden.
        </h2>
        <p class="newsletter-card__desc">
          New stories of remarkable African women, straight to your inbox.
          No spam, just history worth knowing.
        </p>
        <NewsletterForm
          placeholder="Your email address"
          @subscribed="onSubscribed"
        />
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
const SCROLL_THRESHOLD = 0.6;

const { hasSeenNewsletterPrompt, isSubscribed, setValue } = useApp();
const searchOpen = useSearchOpen();
const route = useRoute();

const visible = ref(false);
let scrollCleanup: (() => void) | null = null;
let pendingShow = false;

function shouldShow() {
  if (route.path.startsWith("/newsletter")) return false;
  return !hasSeenNewsletterPrompt.value && !isSubscribed.value;
}

function show() {
  if (!shouldShow()) return;
  if (searchOpen.value) {
    pendingShow = true;
    return;
  }
  visible.value = true;
  pendingShow = false;
  cleanup();
}

watch(searchOpen, (isOpen) => {
  if (isOpen && visible.value) {
    visible.value = false;
    pendingShow = true;
  } else if (!isOpen && pendingShow) {
    show();
  }
});

function dismiss() {
  visible.value = false;
  setValue("hasSeenNewsletterPrompt", true);
}

function onSubscribed() {
  setTimeout(() => {
    visible.value = false;
  }, 2000);
}

function cleanup() {
  if (scrollCleanup) {
    scrollCleanup();
    scrollCleanup = null;
  }
}

onMounted(() => {
  if (!shouldShow()) return;

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0 && scrollTop / docHeight >= SCROLL_THRESHOLD) {
      show();
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  scrollCleanup = () => window.removeEventListener("scroll", onScroll);
});

onUnmounted(cleanup);
</script>

<style scoped>
.newsletter-card {
  position: fixed;
  bottom: calc(1.25rem + var(--bottom));
  right: calc(1.25rem + var(--right));
  z-index: 250;
  width: calc(100vw - 2.5rem);
  max-width: 22rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: var(--shadow-elevated);
}

.newsletter-card__close {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.newsletter-card__close:hover {
  background: var(--surface-subtle);
  color: var(--text-primary);
}

.newsletter-card__accent {
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-secondary)
  );
}

.newsletter-card__body {
  padding: 1.375rem 1.25rem 1.25rem;
}

.newsletter-card__title {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 1.5rem 0.375rem 0;
  line-height: 1.25;
}

.newsletter-card__desc {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

@media (max-width: 480px) {
  .newsletter-card {
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: none;
    max-height: 40vh;
    overflow-y: auto;
    border-radius: 1rem 1rem 0 0;
    border-bottom: none;
    padding-bottom: var(--bottom);
  }

  .newsletter-card__body {
    padding: 1.125rem 1rem 1rem;
  }

  .newsletter-card__title {
    font-size: 1rem;
  }

  .newsletter-card__desc {
    margin-bottom: 0.75rem;
  }
}

/* ── Transition ── */
.newsletter-card-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.newsletter-card-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.newsletter-card-enter-from,
.newsletter-card-leave-to {
  opacity: 0;
  transform: translateY(1.25rem);
}

@media (prefers-reduced-motion: reduce) {
  .newsletter-card-enter-active,
  .newsletter-card-leave-active {
    transition: opacity 0.2s ease;
  }

  .newsletter-card-enter-from,
  .newsletter-card-leave-to {
    transform: none;
  }
}
</style>
