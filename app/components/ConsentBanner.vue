<template>
  <Transition name="consent">
    <div
      v-if="visible && !searchOpen"
      class="consent-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <p class="consent-banner__text">
        We use cookies to understand how stories are read and shared. Your choice is saved on this device.
      </p>
      <div class="consent-banner__actions">
        <button type="button" class="pill pill--secondary consent-banner__btn" @click="onDecline">
          Decline
        </button>
        <button type="button" class="pill consent-banner__btn consent-banner__btn--accept" @click="onAccept">
          Accept
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const visible = ref(false);
const searchOpen = useSearchOpen();
const tag = useTag();

// Other prompts (the newsletter card) wait until the banner has been answered.
const consentVisible = useState<boolean>("consent-visible", () => false);
watch(visible, (v) => (consentVisible.value = v), { immediate: true });

onMounted(() => {
  const stored = tag.readStoredConsent();
  if (stored === null) {
    visible.value = true;
  } else {
    tag.restoreStoredConsent();
  }
});

const onAccept = () => {
  tag.grantConsent();
  visible.value = false;
};

const onDecline = () => {
  tag.denyConsent();
  visible.value = false;
};
</script>

<style scoped>
.consent-banner {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(16px + var(--bottom));
  z-index: 10000;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  max-width: 44rem;
  margin: 0 auto;
  padding: 16px;
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  box-shadow: var(--shadow-elevated);
}

.consent-banner__text {
  flex: 1 1 18rem;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* Both choices carry the same weight: two outlined 44px pills, equal width. */
.consent-banner__actions {
  display: flex;
  gap: 8px;
  flex: 1 1 14rem;
}

.consent-banner__btn {
  flex: 1;
}

.consent-banner__btn--accept {
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
  background: var(--surface-elevated);
}

@media (hover: hover) {
  .consent-banner__btn--accept:hover {
    background: color-mix(in srgb, var(--color-primary) 14%, var(--surface));
  }
}

.consent-banner__btn--accept:active {
  transform: scale(0.97);
}

.consent-enter-active,
.consent-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.consent-enter-from,
.consent-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .consent-enter-from,
  .consent-leave-to {
    transform: none;
  }
}
</style>
