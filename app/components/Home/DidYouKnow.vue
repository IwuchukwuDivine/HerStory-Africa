<template>
  <div v-if="facts.length" class="panel dyk">
    <span class="eyebrow eyebrow--gold">Did you know?</span>

    <Transition name="dyk-fade" mode="out-in">
      <div :key="currentIndex" class="dyk__slide">
        <p class="dyk__fact">{{ currentFact.funFact }}</p>
        <NuxtLink :to="`/women/${currentFact.slug}`" class="dyk__link">
          {{ currentFact.name }}, {{ currentFact.country }} →
        </NuxtLink>
      </div>
    </Transition>

    <div v-if="facts.length > 1" class="dyk__nav">
      <button type="button" class="icon-btn icon-btn--round" aria-label="Previous fact" @click="prev">
        <LucideChevronLeft :size="20" />
      </button>
      <span class="dyk__counter">{{ currentIndex + 1 }} / {{ facts.length }}</span>
      <button type="button" class="icon-btn icon-btn--round" aria-label="Next fact" @click="next">
        <LucideChevronRight :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * One fun fact at a time on the muted panel, auto-advancing every 8s.
 * Placed by ArticlesPreview: above the article rows on phones, beside them on
 * desktop.
 */
const { data: womenWithFacts } = await useAsyncData("women-fun-facts", () =>
  queryCollection("women")
    .where("funFact", "<>", "")
    .select("name", "slug", "country", "funFact")
    .all(),
);

const facts = computed(() => womenWithFacts.value ?? []);

const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const currentFact = computed(
  () => facts.value[currentIndex.value] ?? { name: "", slug: "", country: "", funFact: "" },
);

function goTo(index: number) {
  currentIndex.value = index;
  resetTimer();
}

function prev() {
  goTo((currentIndex.value - 1 + facts.value.length) % facts.value.length);
}

function next() {
  goTo((currentIndex.value + 1) % facts.value.length);
}

function resetTimer() {
  if (timer) clearInterval(timer);
  if (facts.value.length > 1) {
    timer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % facts.value.length;
    }, 8000);
  }
}

onMounted(resetTimer);

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.dyk {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dyk__slide {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dyk__fact {
  font-size: 19px;
  font-weight: 600;
  font-style: italic;
  line-height: 1.4;
  color: var(--text-primary);
  margin: 0;
}

@media (min-width: 768px) {
  .dyk__fact {
    font-size: 22px;
    line-height: 1.35;
  }
}

.dyk__link {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

@media (min-width: 768px) {
  .dyk__link {
    font-size: 15px;
  }
}

.dyk__link:hover {
  color: var(--color-primary-600);
}

.dyk__nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: -12px;
}

.dyk__counter {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 56px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.dyk-fade-enter-active,
.dyk-fade-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.dyk-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.dyk-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
