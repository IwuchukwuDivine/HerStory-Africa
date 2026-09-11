<template>
  <nav
    ref="railRef"
    class="letter-rail"
    aria-label="Jump to letter"
    @touchstart.passive="onTouch"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <template v-for="item in letters" :key="item.letter">
      <a
        v-if="item.present"
        :href="`#letter-${item.letter}`"
        class="letter-rail__letter letter-rail__letter--present"
        :class="{ 'letter-rail__letter--active': item.letter === active }"
        :data-letter="item.letter"
        :aria-current="item.letter === active ? 'true' : undefined"
      >
        {{ item.letter }}
      </a>
      <span
        v-else
        class="letter-rail__letter"
        :data-letter="item.letter"
        aria-disabled="true"
      >
        {{ item.letter }}
      </span>
    </template>

    <Transition name="letter-rail-bubble">
      <span
        v-if="bubble"
        class="letter-rail__bubble"
        :style="{ top: `${bubble.y}px` }"
        aria-hidden="true"
      >
        {{ bubble.letter }}
      </span>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
/**
 * Fixed A to Z rail on the right of the index page. 26 anchors so it works
 * without JS; with JS, dragging a finger over the rail scrolls to the letter
 * under it and shows a terracotta bubble. Hidden from 768px up.
 */
const props = withDefaults(
  defineProps<{
    letters: { letter: string; present: boolean }[];
    /** Letter of the group currently at the top of the viewport. */
    active?: string;
  }>(),
  { active: "" },
);

const railRef = ref<HTMLElement | null>(null);
const bubble = ref<{ letter: string; y: number } | null>(null);
let lastLetter = "";

function letterAt(clientX: number, clientY: number): string | null {
  const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
  const letter = el?.closest<HTMLElement>("[data-letter]")?.dataset.letter ?? null;
  if (!letter) return null;
  return props.letters.find((l) => l.letter === letter)?.present ? letter : null;
}

function jumpTo(letter: string) {
  if (letter === lastLetter) return;
  lastLetter = letter;
  document.getElementById(`letter-${letter}`)?.scrollIntoView({ block: "start" });
}

function showBubble(clientY: number, letter: string) {
  const rail = railRef.value?.getBoundingClientRect();
  if (!rail) return;
  const y = Math.min(Math.max(clientY - rail.top, 28), rail.height - 28);
  bubble.value = { letter, y };
}

function onTouch(e: TouchEvent) {
  const t = e.touches[0];
  if (!t) return;
  const letter = letterAt(t.clientX, t.clientY);
  if (letter) {
    showBubble(t.clientY, letter);
    jumpTo(letter);
  }
}

function onTouchMove(e: TouchEvent) {
  const t = e.touches[0];
  if (!t) return;
  /* Keep the page from scrolling under the finger while dragging the rail. */
  e.preventDefault();
  const letter = letterAt(t.clientX, t.clientY);
  if (letter) {
    showBubble(t.clientY, letter);
    jumpTo(letter);
  }
}

function onTouchEnd() {
  bubble.value = null;
  lastLetter = "";
}
</script>

<style scoped>
.letter-rail {
  position: fixed;
  top: var(--navbar-height, 61px);
  right: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 44px;
  background: var(--surface);
  border-left: 1px solid var(--border-light);
  touch-action: none;
}

@media (min-width: 768px) {
  .letter-rail {
    display: none;
  }
}

.letter-rail__letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  min-height: 28px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  color: var(--border-default);
  text-decoration: none;
  border-radius: 6px 0 0 6px;
  user-select: none;
}

.letter-rail__letter--present {
  font-weight: 600;
  color: var(--color-primary);
}

.letter-rail__letter--active {
  font-weight: 800;
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.letter-rail__letter:focus-visible {
  outline: 2px solid var(--ring-default);
  outline-offset: -2px;
}

.letter-rail__bubble {
  position: absolute;
  right: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-top: -28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--text-on-primary);
  font-size: 26px;
  font-weight: 900;
  box-shadow: var(--shadow-elevated);
  pointer-events: none;
}

.letter-rail-bubble-enter-active,
.letter-rail-bubble-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.letter-rail-bubble-enter-from,
.letter-rail-bubble-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
