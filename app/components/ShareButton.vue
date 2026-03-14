<template>
  <button
    class="share-btn"
    :class="{ 'share-btn--copied': showCopied }"
    :aria-label="showCopied ? 'Link copied' : 'Share this page'"
    @click="handleShare"
  >
    <Transition name="share-btn__icon" mode="out-in">
      <LucideCheck v-if="showCopied" :size="size" />
      <LucideShare2 v-else :size="size" />
    </Transition>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    text?: string;
    size?: number;
  }>(),
  { text: "", size: 18 },
);

const showCopied = ref(false);
let timeout: ReturnType<typeof setTimeout> | null = null;

async function handleShare() {
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({
        title: props.title,
        text: props.text || props.title,
        url,
      });
    } catch {
      // User cancelled the share dialog — that's fine
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    showCopied.value = true;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      showCopied.value = false;
    }, 2000);
  } catch {
    // Clipboard API not available — do nothing
  }
}

onBeforeUnmount(() => {
  if (timeout) clearTimeout(timeout);
});
</script>

<style scoped>
.share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.share-btn:hover {
  color: var(--color-primary);
}

.share-btn--copied {
  color: var(--color-success, #16a34a);
}

.share-btn:active {
  transform: scale(0.85);
}

.share-btn__icon-enter-active,
.share-btn__icon-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.share-btn__icon-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.share-btn__icon-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
