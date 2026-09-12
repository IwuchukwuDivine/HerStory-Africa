<template>
  <Transition name="back-to-top">
    <button
      v-if="isVisible && !readingBarActive"
      class="back-to-top"
      type="button"
      aria-label="Scroll back to top"
      @click.stop="scrollToTop()"
    >
      <span class="back-to-top__ring">
        <span class="back-to-top__content">
          <LucideChevronUp :size="22" class="back-to-top__arrow" />
        </span>
        <svg class="back-to-top__progress" viewBox="0 0 52 52" aria-hidden="true">
          <circle
            class="back-to-top__track"
            cx="26"
            cy="26"
            r="23"
            fill="none"
            stroke-width="3"
          />
          <circle
            class="back-to-top__bar"
            cx="26"
            cy="26"
            r="23"
            fill="none"
            stroke-width="3"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
          />
        </svg>
      </span>
    </button>
  </Transition>
</template>

<script setup lang="ts">
const isVisible = ref(false);
const scrollProgress = ref(0);

// The mobile reading bar carries its own back-to-top control.
const readingBarActive = useState<boolean>("reading-bar-active", () => false);

const radius = 23;
const circumference = 2 * Math.PI * radius;

const progressOffset = computed(
  () => circumference - scrollProgress.value * circumference,
);

function handleScroll() {
  if (typeof window === "undefined") return;

  const { scrollY, innerHeight } = window;
  const docHeight =
    document.documentElement.scrollHeight || document.body.scrollHeight;
  const maxScroll = docHeight - innerHeight;

  scrollProgress.value = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

  if (docHeight <= innerHeight) {
    isVisible.value = false;
    return;
  }
  isVisible.value = scrollProgress.value >= 0.3;
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
/* The button is the hit box; the ring inside is the visual. */
.back-to-top {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  min-height: 52px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-to-top__ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--surface-elevated);
  box-shadow: var(--shadow-elevated);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

@media (hover: hover) {
  .back-to-top:hover .back-to-top__ring {
    transform: translateY(-3px);
  }
}

.back-to-top:active .back-to-top__ring {
  transform: translateY(-1px) scale(0.95);
}

.dark .back-to-top__ring {
  box-shadow: none;
  border: 1px solid var(--border-light);
}

.back-to-top__content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.back-to-top__arrow {
  animation: bounce-arrow 1.5s ease-in-out infinite;
}

.back-to-top__progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  pointer-events: none;
}

.back-to-top__track {
  stroke: color-mix(in srgb, var(--color-primary) 14%, transparent);
}

.back-to-top__bar {
  stroke: var(--color-primary);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.15s ease-out;
}

@keyframes bounce-arrow {
  0%,
  100% {
    transform: translateY(2px);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(0);
  }
}

.back-to-top-enter-active,
.back-to-top-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-to-top-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

@media (prefers-reduced-motion: reduce) {
  .back-to-top__arrow {
    animation: none;
  }

  .back-to-top-enter-from,
  .back-to-top-leave-to {
    transform: none;
  }
}
</style>
