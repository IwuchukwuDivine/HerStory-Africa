<template>
  <Transition name="newsletter-card">
    <aside
      v-if="visible"
      class="newsletter-card"
      role="complementary"
      aria-label="Newsletter signup"
    >
      <button
        class="icon-btn newsletter-card__close"
        type="button"
        aria-label="Dismiss newsletter signup"
        @click="dismiss"
      >
        <LucideX :size="20" />
      </button>

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

/** Individual profiles and articles (not listings, hubs or reading paths). */
const READING_ROUTE = /^\/(women|articles)\/(?!all$|region\/|era\/|cause\/|path\/)[^/]+$/;

const { hasSeenNewsletterPrompt, isSubscribed, setValue } = useApp();
const searchOpen = useSearchOpen();
const consentVisible = useState<boolean>("consent-visible", () => false);
const readingFinished = useState<boolean>("reading-finished", () => false);
const route = useRoute();

const visible = ref(false);
let scrollCleanup: (() => void) | null = null;
let pendingShow = false;

const isReadingRoute = computed(() =>
  READING_ROUTE.test(route.path.replace(/\/+$/, "")),
);

function isNarrow() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function shouldShow() {
  if (route.path.startsWith("/newsletter")) return false;
  if (hasSeenNewsletterPrompt.value || isSubscribed.value) return false;
  // Reading pages below 768px carry an inline newsletter panel instead.
  if (isReadingRoute.value && isNarrow()) return false;
  return true;
}

const blocked = computed(() => searchOpen.value || consentVisible.value);

function show() {
  if (!shouldShow()) return;
  if (blocked.value) {
    pendingShow = true;
    return;
  }
  visible.value = true;
  pendingShow = false;
  cleanup();
}

watch(blocked, (isBlocked) => {
  if (isBlocked && visible.value) {
    visible.value = false;
    pendingShow = true;
  } else if (!isBlocked && pendingShow) {
    show();
  }
});

// On a profile or article, wait for the reader to reach the end of the body.
watch(readingFinished, (finished) => {
  if (finished && isReadingRoute.value) show();
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
  if (hasSeenNewsletterPrompt.value || isSubscribed.value) return;

  // Everywhere else the card appears at 60% of the page.
  function onScroll() {
    if (isReadingRoute.value) return;
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
  bottom: calc(20px + var(--bottom));
  right: calc(20px + var(--right));
  z-index: 250;
  width: calc(100vw - 40px);
  max-width: 22rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-elevated);
}

.newsletter-card__close {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  color: var(--text-muted);
}

.newsletter-card__body {
  padding: 24px 20px 20px;
}

.newsletter-card__title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 32px 6px 0;
  line-height: 1.25;
}

.newsletter-card__desc {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0 0 16px;
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
    border-radius: 16px 16px 0 0;
    border-bottom: none;
    padding-bottom: var(--bottom);
  }

  .newsletter-card__body {
    padding: 20px 16px 16px;
  }

  .newsletter-card__title {
    font-size: 16px;
  }

  .newsletter-card__desc {
    margin-bottom: 12px;
  }
}

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
  transform: translateY(20px);
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
