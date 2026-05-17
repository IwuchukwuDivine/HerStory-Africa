<template>
  <Transition name="consent">
    <div v-if="visible && !searchOpen" class="consent-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <p class="consent-banner__text">
        We use cookies to understand how stories are read and shared. Your choice is saved on this device.
      </p>
      <div class="consent-banner__actions">
        <button class="consent-banner__btn consent-banner__btn--ghost" @click="onDecline">
          Decline
        </button>
        <button class="consent-banner__btn consent-banner__btn--primary" @click="onAccept">
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
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 44rem;
  margin: 0 auto;
  padding: 0.875rem 1.125rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-elevated);
}

.consent-banner__text {
  flex: 1;
  min-width: 14rem;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.consent-banner__actions {
  display: inline-flex;
  gap: 0.5rem;
  margin-left: auto;
}

.consent-banner__btn {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.consent-banner__btn--ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border-default);
}

.consent-banner__btn--ghost:hover {
  color: var(--text-primary);
  border-color: var(--ring-default);
}

.consent-banner__btn--primary {
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.consent-banner__btn--primary:hover {
  background: var(--color-primary-600);
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
  transform: translateY(0.5rem);
}
</style>
