<template>
  <Teleport to="body">
    <Transition name="search-overlay">
      <div
        v-if="open"
        class="search-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Search HerStory Africa"
        @click.self="close"
        @touchmove="onTouchMove"
      >
        <div class="search-modal">
          <div class="search-modal__input-row">
            <LucideSearch :size="20" class="search-modal__input-icon" />
            <input
              ref="inputRef"
              :value="query"
              type="search"
              placeholder="Search women, articles, opportunities…"
              class="search-modal__input"
              @input="onInput"
              @compositionupdate="onInput"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="selectActive"
              @keydown.esc="close"
            >
            <button
              type="button"
              class="search-modal__close"
              aria-label="Close search"
              @click="close"
            >
              <span class="search-modal__close-kbd">Esc</span>
              <LucideX :size="20" class="search-modal__close-icon" />
            </button>
          </div>

          <div
            class="search-modal__results"
            :style="resultsStyle"
            @touchstart.passive="dismissKeyboard"
          >
            <div v-if="!query.trim()" class="search-modal__empty">
              Start typing to search across the archive.
            </div>

            <div v-else-if="failed" class="search-modal__empty">
              Search is unavailable right now. Please try again later.
            </div>

            <div v-else-if="!ready" class="search-modal__empty">
              Preparing the archive…
            </div>

            <div
              v-else-if="flatResults.length === 0"
              class="search-modal__empty"
            >
              No matches for "{{ query }}".
            </div>

            <template v-else>
              <section
                v-for="group in groupedResults"
                :key="group.type"
                class="search-modal__group"
              >
                <div class="search-modal__group-title">
                  {{ group.label }}
                </div>
                <NuxtLink
                  v-for="item in group.items"
                  :key="`${item.type}-${item.slug}`"
                  :to="item.to"
                  class="search-modal__item"
                  :class="{
                    'search-modal__item--active': activeIndex === item.index,
                  }"
                  @mouseenter="activeIndex = item.index"
                  @click="close"
                >
                  <component :is="iconFor(item.type)" :size="16" />
                  <div class="search-modal__item-text">
                    <div class="search-modal__item-title">{{ item.title }}</div>
                    <div
                      v-if="item.subtitle"
                      class="search-modal__item-subtitle"
                    >
                      {{ item.subtitle }}
                    </div>
                    <div v-if="item.snippet" class="search-modal__item-snippet">
                      <template v-for="(part, i) in item.snippet" :key="i">
                        <span
                          v-if="part.match"
                          class="search-modal__item-snippet-match"
                          >{{ part.text }}</span
                        >
                        <template v-else>{{ part.text }}</template>
                      </template>
                    </div>
                  </div>
                </NuxtLink>
              </section>
            </template>
          </div>

          <div class="search-modal__footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> open</span>
            <span><kbd>Esc</kbd> close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type {
  ArchiveSearchResult,
  ArchiveSearchResultType,
} from "~/utils/types/search";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const query = ref("");
const activeIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

const { ready, failed, ensureLoaded, search } = useArchiveSearch();

type IndexedResult = ArchiveSearchResult & { index: number };

const groupedResults = computed(() => {
  const q = query.value.trim();
  if (!q) return [];
  const groups: {
    type: ArchiveSearchResultType;
    label: string;
    items: IndexedResult[];
  }[] = [
    { type: "woman", label: "Women", items: [] },
    { type: "article", label: "Articles", items: [] },
    { type: "opportunity", label: "Opportunities", items: [] },
  ];
  for (const result of search(q)) {
    groups
      .find((g) => g.type === result.type)
      ?.items.push({ ...result, index: 0 });
  }
  let index = 0;
  for (const group of groups) {
    for (const item of group.items) item.index = index++;
  }
  return groups.filter((g) => g.items.length > 0);
});

const flatResults = computed(() => groupedResults.value.flatMap((g) => g.items));

function iconFor(type: ArchiveSearchResultType) {
  if (type === "woman") return resolveComponent("LucideUser");
  if (type === "article") return resolveComponent("LucideBookOpen");
  return resolveComponent("LucideRocket");
}

function move(delta: number) {
  const max = flatResults.value.length - 1;
  if (max < 0) return;
  let next = activeIndex.value + delta;
  if (next < 0) next = max;
  if (next > max) next = 0;
  activeIndex.value = next;
}

function selectActive() {
  const item = flatResults.value[activeIndex.value];
  if (!item) return;
  navigateTo(item.to);
  close();
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value;
}

function close() {
  emit("close");
}

watch(query, () => {
  activeIndex.value = 0;
});

// iOS Safari ignores `overflow: hidden` on body for touch scrolling, so the
// page behind the modal keeps moving. Pinning body with position: fixed is the
// only reliable lock; the saved scroll offset is restored on unlock.
let scrollLockY = 0;

function lockBodyScroll() {
  scrollLockY = window.scrollY;
  const { style } = document.body;
  style.position = "fixed";
  style.top = `-${scrollLockY}px`;
  style.left = "0";
  style.right = "0";
  style.width = "100%";
  style.overflow = "hidden";
}

function unlockBodyScroll() {
  const { style } = document.body;
  style.position = "";
  style.top = "";
  style.left = "";
  style.right = "";
  style.width = "";
  style.overflow = "";
  window.scrollTo(0, scrollLockY);
}

// The modal itself is a stable 100% of the viewport and never resizes with
// the keyboard. The keyboard is handled purely as extra bottom padding on the
// results list, so every result stays reachable above it.
const keyboardInset = ref(0);

const resultsStyle = computed(() =>
  keyboardInset.value > 0
    ? { paddingBottom: `calc(0.5rem + ${keyboardInset.value}px)` }
    : undefined,
);

function syncKeyboardInset() {
  const vv = window.visualViewport;
  if (!vv) return;
  keyboardInset.value = Math.max(
    0,
    Math.round(window.innerHeight - vv.height - vv.offsetTop),
  );
}

function attachViewportListeners() {
  const vv = window.visualViewport;
  if (!vv) return;
  syncKeyboardInset();
  vv.addEventListener("resize", syncKeyboardInset);
  vv.addEventListener("scroll", syncKeyboardInset);
}

function detachViewportListeners() {
  const vv = window.visualViewport;
  if (vv) {
    vv.removeEventListener("resize", syncKeyboardInset);
    vv.removeEventListener("scroll", syncKeyboardInset);
  }
  keyboardInset.value = 0;
}

// Dragging with the iOS keyboard open makes the browser pan the visual
// viewport (an uncancelable browser-chrome behavior), which drags the pinned
// input row off-screen. Standard mobile search UX: dismiss the keyboard the
// moment the user touches the results, so all scrolling happens with the
// keyboard closed and the input row stays fixed.
function dismissKeyboard() {
  const input = inputRef.value;
  if (input && document.activeElement === input) input.blur();
}

// Block touch drags outside the results pane so nothing reaches the page
// behind the modal; real scrolls inside the results pane pass through.
function onTouchMove(event: TouchEvent) {
  const target = event.target instanceof Element ? event.target : null;
  const results = target?.closest(".search-modal__results");
  if (results && results.scrollHeight > results.clientHeight) return;
  event.preventDefault();
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      ensureLoaded();
      query.value = "";
      activeIndex.value = 0;
      lockBodyScroll();
      attachViewportListeners();
      await nextTick();
      inputRef.value?.focus();
    } else {
      detachViewportListeners();
      unlockBodyScroll();
    }
  },
);

onBeforeUnmount(() => {
  if (props.open) {
    detachViewportListeners();
    unlockBodyScroll();
  }
});
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: var(--overlay-default, rgba(28, 15, 7, 0.55));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(2rem, 10vh, 6rem) 1rem 1rem;
}

.search-overlay-enter-active,
.search-overlay-leave-active {
  transition: opacity 0.18s ease;
}
.search-overlay-enter-from,
.search-overlay-leave-to {
  opacity: 0;
}

.search-modal {
  width: min(40rem, 100%);
  max-height: 80vh;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 14px;
  box-shadow: 0 24px 64px rgba(28, 15, 7, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-modal__input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-light);
}

.search-modal__input-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-modal__input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
}

.search-modal__input::placeholder {
  color: var(--text-muted);
}

.search-modal__footer kbd {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.4rem;
  font-size: 0.7rem;
  font-family: inherit;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--surface-muted);
  border: 1px solid var(--border-default);
  border-radius: 4px;
}

.search-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0.125rem 0.4rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 6px;
}

.search-modal__close-kbd {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--surface-muted);
  border: 1px solid var(--border-default);
  border-radius: 4px;
}

.search-modal__close-icon {
  display: none;
}

@media (hover: hover) {
  .search-modal__close:hover {
    color: var(--text-primary);
    background: var(--surface-muted);
  }
}

.search-modal__results {
  flex: 1;
  /* Without min-height: 0, Safari sizes this flex child to its content and
     overflow never engages, so touch scrolls fall through to the page. */
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  padding: 0.5rem;
}

.search-modal__empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.search-modal__group {
  margin-bottom: 0.5rem;
}

.search-modal__group-title {
  padding: 0.5rem 0.75rem 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.search-modal__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
}

.search-modal__item--active {
  background: var(--surface-muted);
}

.search-modal__item-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.search-modal__item-title {
  font-weight: 600;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-modal__item-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-modal__item-snippet {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.search-modal__item-snippet-match {
  color: var(--text-primary);
  font-weight: 600;
}

.search-modal__footer {
  display: flex;
  gap: 1rem;
  padding: 0.625rem 1rem;
  border-top: 1px solid var(--border-light);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.search-modal__footer span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

@media (max-width: 640px) {
  .search-overlay {
    padding: 0;
    overscroll-behavior: contain;
  }
  .search-modal {
    /* A stable 100% of the fixed overlay — never resized by the keyboard,
       so the flex layout and scroll geometry can never break. The keyboard
       is compensated with bottom padding on the results list instead. */
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
    border: none;
  }
  .search-modal__input-row {
    padding-top: calc(env(safe-area-inset-top, 0px) + 0.875rem);
  }
  .search-modal__close {
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
  }
  .search-modal__close-kbd {
    display: none;
  }
  .search-modal__close-icon {
    display: block;
  }
  .search-modal__results {
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 0.5rem);
  }
  /* Desktop keyboard hints are meaningless on touch devices. */
  .search-modal__footer {
    display: none;
  }
}
</style>
