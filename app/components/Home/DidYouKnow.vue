<template>
  <section v-if="facts.length" class="did-you-know section">
    <div class="did-you-know__inner">
      <div class="did-you-know__badge">
        <LucideLightbulb :size="14" />
        Did you know?
      </div>

      <div class="did-you-know__carousel">
        <Transition name="dyk-fade" mode="out-in">
          <div :key="currentIndex" class="did-you-know__slide">
            <p class="did-you-know__fact">
              "{{ currentFact.funFact }}"
            </p>
            <NuxtLink
              :to="`/women/${currentFact.slug}`"
              class="did-you-know__attribution"
            >
              — {{ currentFact.name }}, {{ currentFact.country }}
              <LucideArrowRight :size="14" />
            </NuxtLink>
          </div>
        </Transition>
      </div>

      <div v-if="facts.length > 1" class="did-you-know__nav">
        <button
          class="did-you-know__arrow"
          aria-label="Previous fact"
          @click="prev"
        >
          <LucideChevronLeft :size="16" />
        </button>

        <span class="did-you-know__counter">
          {{ currentIndex + 1 }} / {{ facts.length }}
        </span>

        <button
          class="did-you-know__arrow"
          aria-label="Next fact"
          @click="next"
        >
          <LucideChevronRight :size="16" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: womenWithFacts } = await useAsyncData('women-fun-facts', () =>
  queryCollection('women')
    .where('funFact', '<>', '')
    .select('name', 'slug', 'country', 'funFact')
    .all(),
);

const facts = computed(() => womenWithFacts.value ?? []);

const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const currentFact = computed(() => facts.value[currentIndex.value] ?? { name: '', slug: '', country: '', funFact: '' });

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

onMounted(() => {
  resetTimer();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.did-you-know__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
}

.did-you-know__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3125rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 9999px;
  background: var(--color-secondary-50);
  color: var(--color-secondary-600);
  margin-bottom: 1.25rem;
}

.dark .did-you-know__badge {
  background: var(--color-secondary-950);
  color: var(--color-secondary-300);
}

.did-you-know__carousel {
  width: 100%;
  max-width: 36rem;
  min-height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.did-you-know__slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.did-you-know__fact {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 600;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0;
}

.did-you-know__attribution {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  transition: gap 0.2s ease;
}

.did-you-know__attribution:hover {
  gap: 0.625rem;
}

.did-you-know__nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.did-you-know__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.did-you-know__arrow:hover {
  border-color: var(--ring-default);
  color: var(--color-primary);
}

.did-you-know__counter {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 3.5rem;
  text-align: center;
}

/* ─── Fade transition ─── */
.dyk-fade-enter-active,
.dyk-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
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
