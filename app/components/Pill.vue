<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="!to && (disabled || loading) ? true : undefined"
    :aria-disabled="to && disabled ? 'true' : undefined"
    class="pill"
    :class="[`pill--${variant}`, size !== 'md' && `pill--${size}`]"
  >
    <LucideLoaderCircle v-if="loading" :size="16" class="pill__spin" />
    <slot v-else name="icon" />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";

withDefaults(
  defineProps<{
    to?: string | Record<string, unknown>;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    type?: "button" | "submit";
    loading?: boolean;
    disabled?: boolean;
  }>(),
  { to: undefined, variant: "secondary", size: "md", type: "button" },
);
</script>
