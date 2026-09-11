<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path :d="AFRICA_PATH" fill="currentColor" opacity="0.18" />
    <path :d="AFRICA_PATH" stroke="currentColor" stroke-width="1.2" fill="none" />
    <circle cx="16" cy="17" r="2.6" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
import { AFRICA_PATH } from "~/utils/format";

withDefaults(defineProps<{ size?: number | string }>(), { size: 64 });
</script>
