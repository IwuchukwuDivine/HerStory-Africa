<template>
  <Transition name="modal">
    <div v-if="visible" class="newsletter-modal" @click.self="dismiss">
      <div class="newsletter-modal__card">
        <button class="newsletter-modal__close" aria-label="Close" @click="dismiss">
          <LucideX :size="20" />
        </button>

        <div class="newsletter-modal__accent" />

        <div class="newsletter-modal__body">
          <h2 class="newsletter-modal__title">
            Don't let these stories stay hidden.
          </h2>
          <p class="newsletter-modal__desc">
            Get new stories of remarkable African women delivered to your inbox.
            No spam, just history worth knowing.
          </p>
          <NewsletterForm
            placeholder="Your email address"
            @subscribed="onSubscribed"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { hasSeenNewsletterPrompt, isSubscribed } = useApp();

const visible = ref(false);
let scrollCleanup: (() => void) | null = null;
let timeout: ReturnType<typeof setTimeout> | null = null;

function shouldShow() {
  return !hasSeenNewsletterPrompt.value && !isSubscribed.value;
}

function show() {
  if (!shouldShow()) return;
  visible.value = true;
  cleanup();
}

function dismiss() {
  visible.value = false;
  const { dismissNewsletter } = useApp();
  dismissNewsletter();
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
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
}

onMounted(() => {
  if (!shouldShow()) return;

  timeout = setTimeout(show, 15000);

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0 && scrollTop / docHeight >= 0.6) {
      show();
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  scrollCleanup = () => window.removeEventListener("scroll", onScroll);
});

onUnmounted(cleanup);
</script>

<style scoped>
.newsletter-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--overlay-default);
}

.newsletter-modal__card {
  position: relative;
  width: 100%;
  max-width: 28rem;
  background: var(--surface-elevated);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: var(--shadow-elevated);
}

.newsletter-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.newsletter-modal__close:hover {
  background: var(--surface-subtle);
  color: var(--text-primary);
}

.newsletter-modal__accent {
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
}

.newsletter-modal__body {
  padding: 2rem 1.75rem 1.75rem;
}

.newsletter-modal__title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.25;
}

.newsletter-modal__desc {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 1.25rem;
}

/* ── Transition ── */
.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .newsletter-modal__card {
  transition:
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-leave-active .newsletter-modal__card {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from .newsletter-modal__card {
  opacity: 0;
  transform: translateY(1.5rem) scale(0.96);
}

.modal-leave-to {
  opacity: 0;
}

.modal-leave-to .newsletter-modal__card {
  opacity: 0;
  transform: translateY(0.5rem) scale(0.98);
}
</style>
