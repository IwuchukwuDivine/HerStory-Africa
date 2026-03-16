<template>
  <Transition name="slide-up">
    <div v-if="showBanner" class="ios-install-banner">
      <div class="ios-install-banner__content">
        <div class="ios-install-banner__icon">
          <img
            src="/icons/apple-icon-180.png"
            alt="HerStory Africa"
            class="ios-install-banner__app-icon"
          />
        </div>
        <div class="ios-install-banner__text">
          <p class="ios-install-banner__title">Install HerStory Africa</p>
          <p class="ios-install-banner__instruction">
            Tap
            <LucideShare :size="14" class="ios-install-banner__share-icon" />
            then
            <span>"Add to Home Screen"</span>
          </p>
        </div>
        <button
          class="ios-install-banner__close"
          aria-label="Dismiss"
          @click="dismissBanner"
        >
          <LucideX :size="20" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isIosPromptDismissed, dismissIosPrompt } = useApp();

const showBanner = ref(false);

const isIOS = (): boolean => {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return true;

  const isMacUA = /macintosh/.test(ua);
  const hasTouch = navigator.maxTouchPoints > 1;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const hasHover = window.matchMedia("(hover: hover)").matches;

  return isMacUA && hasTouch && !hasFinePointer && !hasHover;
};

const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
};

const dismissBanner = () => {
  dismissIosPrompt();
  showBanner.value = false;
};

onMounted(() => {
  setTimeout(() => {
    if (isIOS() && !isStandalone() && !isIosPromptDismissed()) {
      showBanner.value = true;
    }
  }, 2000);
});
</script>

<style scoped>
.ios-install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 0.75rem;
  padding-bottom: calc(env(safe-area-inset-bottom) + 0.75rem);
  background: var(--surface-elevated);
  border-top: 1px solid var(--border-light);
  box-shadow: 0 -4px 20px rgba(28, 15, 7, 0.1);
}

.ios-install-banner__content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 500px;
  margin: 0 auto;
}

.ios-install-banner__icon {
  flex-shrink: 0;
}

.ios-install-banner__app-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: contain;
  box-shadow: 0 2px 8px rgba(28, 15, 7, 0.1);
}

.ios-install-banner__text {
  flex: 1;
  min-width: 0;
}

.ios-install-banner__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.ios-install-banner__instruction {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.ios-install-banner__instruction span {
  font-weight: 600;
  color: var(--text-primary);
}

.ios-install-banner__share-icon {
  display: inline-flex;
  color: #007aff;
  vertical-align: middle;
}

.ios-install-banner__close {
  flex-shrink: 0;
  padding: 0.5rem;
  background: var(--surface-muted);
  border: none;
  border-radius: 50%;
  color: var(--text-muted);
  transition: all 0.2s;
}

.ios-install-banner__close:hover {
  background: var(--surface-subtle);
  color: var(--text-primary);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
