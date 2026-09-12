<template>
  <button
    type="button"
    class="pill pill--secondary"
    aria-label="Spread her story"
    @click="showModal = true"
  >
    <LucideShare2 :size="16" />
    Share
  </button>
  <ShareCardModal :open="showModal" :woman="woman" @close="showModal = false" />
</template>

<script setup lang="ts">
import type { Woman } from '~/utils/types/content'

defineProps<{
  woman: Woman
}>()

const showModal = ref(false)
</script>
