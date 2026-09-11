<template>
  <NuxtLink
    :to="to ?? `/women/${slug}`"
    class="list-row"
    :class="[`list-row--${thumb}`, { 'list-row--read': read }]"
  >
    <div class="list-row__thumb" :class="{ 'list-row__initial': !hasPortrait(image) }" :style="{ width: `${thumb}px`, height: `${thumb}px` }">
      <NuxtImg
        v-if="hasPortrait(image)"
        :src="image"
        :alt="`Portrait of ${name}`"
        :width="thumb * 2"
        :height="thumb * 2"
        format="webp"
        :loading="priority ? 'eager' : 'lazy'"
        :style="focal ? { objectPosition: focal } : undefined"
      />
      <template v-else>{{ initialOf(name) }}</template>
    </div>
    <div class="list-row__body">
      <span class="list-row__name">{{ name }}</span>
      <span class="list-row__meta">
        <span v-if="read" class="list-row__read"><LucideCheck :size="12" />Read ·</span>
        {{ meta ?? `${country} · ${lifespan(born, died)}` }}
      </span>
    </div>
    <span class="list-row__chevron"><LucideChevronRight :size="18" /></span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { hasPortrait, initialOf, lifespan } from "~/utils/format";

/** List row: thumbnail (or initial), name, meta, chevron. For A to Z, related women, women in this story. */
const props = withDefaults(
  defineProps<{
    name: string;
    slug: string;
    image?: string;
    country?: string;
    born?: number | null;
    died?: number | null;
    focal?: string;
    /** Overrides the "country · dates" line. */
    meta?: string;
    thumb?: 40 | 48 | 56;
    to?: string;
    priority?: boolean;
    showRead?: boolean;
  }>(),
  { image: "", country: "", born: null, died: null, focal: "", thumb: 48, showRead: true, priority: false },
);

const { isRead } = useApp();
const read = computed(() => props.showRead && isRead("woman", props.slug));
</script>

<style scoped>
.list-row--40 {
  min-height: 56px;
  padding: 6px 0;
}

.list-row--56 {
  min-height: 72px;
  padding: 10px 0;
}

.list-row__initial {
  font-size: 16px;
}

.list-row--56 .list-row__initial {
  font-size: 20px;
}
</style>
