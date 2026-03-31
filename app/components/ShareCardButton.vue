<template>
  <button
    class="share-card-btn"
    aria-label="Spread her story — Stories or feed"
    @click="showModal = true"
  >
    <LucideImage :size="size" />
  </button>
  <ShareCardModal :open="showModal" :woman="woman" @close="showModal = false" />
</template>

<script setup lang="ts">
import type { Woman } from '~/utils/types/content'

withDefaults(
  defineProps<{
    woman: Woman
    size?: number
  }>(),
  { size: 18 },
)

const showModal = ref(false)
</script>

<style scoped>
.share-card-btn {
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

.share-card-btn:hover {
  color: var(--color-primary);
}

.share-card-btn:active {
  transform: scale(0.85);
}
</style>
