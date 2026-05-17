<template>
  <Transition name="back-to-top">
    <button
      v-if="isVisible"
      class="back-to-top"
      type="button"
      aria-label="Scroll back to top"
      @click.stop="scrollToTop()"
    >
      <div class="btn-content">
        <LucideChevronUp :size="22" class="arrow" />
      </div>
      <svg class="progress-ring" viewBox="0 0 52 52">
        <circle
          class="progress-bg"
          cx="26"
          cy="26"
          r="23"
          fill="none"
          stroke-width="3"
        />
        <circle
          class="progress-bar"
          cx="26"
          cy="26"
          r="23"
          fill="none"
          stroke-width="3"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
        />
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
const isVisible = ref(false)
const scrollProgress = ref(0)

const radius = 23
const circumference = 2 * Math.PI * radius

const progressOffset = computed(() =>
  circumference - scrollProgress.value * circumference,
)

function handleScroll() {
  if (typeof window === 'undefined') return

  const { scrollY, innerHeight } = window
  const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight
  const maxScroll = docHeight - innerHeight

  scrollProgress.value = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0

  if (docHeight <= innerHeight) {
    isVisible.value = false
    return
  }
  isVisible.value = scrollProgress.value >= 0.3
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-to-top {
  position: relative;
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: var(--surface-elevated);
  cursor: pointer;
  box-shadow:
    0 4px 16px rgba(181, 69, 27, 0.12),
    0 2px 4px rgba(181, 69, 27, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.back-to-top:hover {
  transform: translateY(-3px);
  box-shadow:
    0 8px 24px rgba(181, 69, 27, 0.18),
    0 4px 8px rgba(181, 69, 27, 0.1);
}

.back-to-top:active {
  transform: translateY(-1px) scale(0.95);
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.arrow {
  animation: bounce-arrow 1.5s ease-in-out infinite;
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  pointer-events: none;
}

.progress-bg {
  stroke: rgba(181, 69, 27, 0.12);
}

.progress-bar {
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-to-top-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

@media (max-width: 640px) {
  .back-to-top {
    width: 48px;
    height: 48px;
  }
}
</style>
