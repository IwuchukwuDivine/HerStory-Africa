<template>
  <section class="section section--wide causes">
    <MuseumLabel eyebrow="Explore by cause" title="What did they fight for?" class="causes__label" />

    <div class="causes__pills">
      <Pill
        v-for="hub in visibleHubs"
        :key="hub.slug"
        :to="`/women/cause/${hub.slug}`"
        variant="secondary"
        class="causes__pill"
      >
        {{ hub.cause }}
      </Pill>

      <button
        v-if="hubs.length > VISIBLE_COUNT"
        type="button"
        class="pill pill--ghost causes__more"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? "Show fewer" : `All ${hubs.length} causes →` }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CAUSE_HUB_MIN_WOMEN } from "~/utils/constants/content";

const VISIBLE_COUNT = 8;

/* Only causes with enough women to have their own hub page are linked. */
const { data: causeIndex } = await useAsyncData("hub-cause-index", () =>
  queryCollection("women").select("causes").all(),
);

const hubs = computed(() => causeHubs(causeIndex.value ?? [], CAUSE_HUB_MIN_WOMEN));

const expanded = ref(false);
const visibleHubs = computed(() =>
  expanded.value ? hubs.value : hubs.value.slice(0, VISIBLE_COUNT),
);
</script>

<style scoped>
.causes__label {
  margin-bottom: 18px;
}

.causes__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.causes__pill {
  padding: 0 18px;
  font-size: 15px;
  font-weight: 500;
}

.causes__more {
  padding: 0 18px;
  font-size: 15px;
}

@media (hover: hover) {
  .causes__more:hover {
    color: var(--color-primary-600);
  }
}
</style>
