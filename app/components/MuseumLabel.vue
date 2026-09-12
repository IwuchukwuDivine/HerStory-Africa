<template>
  <div class="museum-label" :class="{ 'museum-label--row': $slots.default }">
    <div class="museum-label__text">
      <span v-if="!noRule" class="rule" aria-hidden="true" />
      <span v-if="eyebrow" class="eyebrow" :class="{ 'eyebrow--muted': muted, 'eyebrow--gold': gold }">{{ eyebrow }}</span>
      <component :is="level" v-if="title" class="museum-label__title" :class="titleClass">{{ title }}</component>
      <p v-if="subtitle" class="section__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="museum-label__cta">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * The museum label: a 32×2 gold rule, a 12px spaced-caps eyebrow, then the
 * heading. Used above every section h2 and page h1. Pass a CTA in the slot to
 * get the right-aligned "View all →" row.
 */
withDefaults(
  defineProps<{
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    level?: "h1" | "h2" | "h3" | "p";
    /** Muted eyebrow for labels that are not navigation ("Sources", "She fought for"). */
    muted?: boolean;
    /** Gold eyebrow ("Did you know?", "Over to you"). */
    gold?: boolean;
    noRule?: boolean;
    titleClass?: string;
  }>(),
  { level: "h2", eyebrow: "", title: "", subtitle: "", titleClass: "" },
);
</script>

<style scoped>
.museum-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.museum-label--row {
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.museum-label__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.museum-label__title {
  margin: 0;
  color: var(--text-primary);
}

h2.museum-label__title,
h3.museum-label__title {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
}

@media (min-width: 768px) {
  h2.museum-label__title {
    font-size: 32px;
  }
}

h1.museum-label__title {
  font-size: 36px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.5px;
}

@media (min-width: 768px) {
  h1.museum-label__title {
    font-size: 56px;
    line-height: 1;
    letter-spacing: -1px;
  }
}

.museum-label__cta {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  min-height: 44px;
}
</style>
