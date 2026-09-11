<template>
  <div
    class="reading-bar"
    :class="{ 'reading-bar--listening': listening }"
    role="toolbar"
    aria-label="Reading tools"
  >
    <div class="reading-bar__progress" aria-hidden="true">
      <div
        class="reading-bar__progress-fill"
        :style="{ width: `${Math.round(progress * 1000) / 10}%` }"
      />
    </div>

    <template v-if="listening">
      <button
        type="button"
        class="reading-bar__play"
        :class="{ 'reading-bar__play--paused': status === 'paused' }"
        :aria-label="status === 'playing' ? 'Pause reading aloud' : 'Resume reading aloud'"
        @click="toggleTts"
      >
        <LucidePause v-if="status === 'playing'" :size="16" />
        <LucidePlay v-else :size="16" />
      </button>
      <div class="reading-bar__track">
        <span class="reading-bar__name">{{ name }}</span>
        <span class="reading-bar__time">{{ elapsedLabel }} of {{ durationLabel }}</span>
      </div>
      <Pill size="sm" variant="secondary" @click="openAssistant">
        <template #icon>
          <LucideSparkles :size="16" />
        </template>
        Ask
      </Pill>
    </template>

    <template v-else>
      <Pill variant="secondary" class="reading-bar__ask" @click="openAssistant">
        <template #icon>
          <LucideSparkles :size="16" />
        </template>
        Ask about {{ shortName }}
      </Pill>
      <span class="reading-bar__position">{{ minutesRead }} of {{ minutes }} min</span>
      <button
        type="button"
        class="icon-btn icon-btn--round reading-bar__top"
        aria-label="Back to top"
        @click="scrollToTop()"
      >
        <LucideChevronUp :size="18" />
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
// "Ask about Waris" for people; "Ask about this article" when the page passes a phrase.

import type { TtsStatus } from "~/composables/useTextToSpeech";

const props = defineProps<{
  /** Full name of the woman, or the article title. */
  name: string;
  /** Reading time in minutes, from the page's word count. */
  minutes: number;
}>();

const shortName = computed(() => (/^[a-z]/.test(props.name) ? props.name : firstName(props.name)));

const progress = useScrollProgress();

const aiOpen = useState<boolean>("ai-open", () => false);
const readingBarActive = useState<boolean>("reading-bar-active", () => false);

const status = useState<TtsStatus>("tts-status", () => "idle");
const ttsProgress = useState<number>("tts-progress", () => 0);
const ttsDuration = useState<number>("tts-duration", () => 0);
const ttsToggle = useState<(() => void) | null>("tts-toggle", () => null);

const listening = computed(() => status.value === "playing" || status.value === "paused");

const minutesRead = computed(() =>
  Math.min(props.minutes, Math.round(progress.value * props.minutes)),
);

function clock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const elapsedLabel = computed(() => clock(ttsProgress.value * ttsDuration.value));
const durationLabel = computed(() => clock(ttsDuration.value));

function openAssistant() {
  aiOpen.value = true;
}

function toggleTts() {
  ttsToggle.value?.();
}

// The bar only exists below 768px. Other floating controls (assistant FAB,
// back-to-top) read `reading-bar-active` and step aside while it is on screen.
let media: MediaQueryList | null = null;

function syncActive() {
  const active = !!media?.matches;
  readingBarActive.value = active;
  document.body.classList.toggle("has-reading-bar", active);
}

onMounted(() => {
  media = window.matchMedia("(max-width: 767px)");
  syncActive();
  media.addEventListener("change", syncActive);
});

onBeforeUnmount(() => {
  media?.removeEventListener("change", syncActive);
  media = null;
  readingBarActive.value = false;
  document.body.classList.remove("has-reading-bar");
});
</script>

<style scoped>
.reading-bar {
  display: none;
}

@media (max-width: 767px) {
  .reading-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 240;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px calc(10px + var(--bottom));
    background: var(--surface-elevated);
    border-top: 1px solid var(--border-light);
  }
}

.reading-bar__progress {
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 3px;
  pointer-events: none;
}

.reading-bar__progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.15s linear;
}

.reading-bar__ask {
  flex-shrink: 0;
}

.reading-bar__position {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

.reading-bar__top {
  flex-shrink: 0;
  border: 1.5px solid var(--border-default);
  color: var(--text-secondary);
}

/* Listening state */
.reading-bar__play {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--text-on-primary);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.25s ease;
}

.reading-bar__play:active {
  transform: scale(0.97);
}

.reading-bar__play--paused {
  background: var(--surface-elevated);
  color: var(--color-primary);
}

.reading-bar__track {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reading-bar__name {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reading-bar__time {
  font-size: 12px;
  line-height: 1.2;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .reading-bar__progress-fill,
  .reading-bar__play {
    transition: none;
  }
}
</style>

<style>
/* Room for the fixed bar; the class is only set while the bar is on screen. */
@media (max-width: 767px) {
  body.has-reading-bar {
    padding-bottom: 76px;
  }
}
</style>
