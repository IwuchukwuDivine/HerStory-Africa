<template>
  <div v-if="isSupported" class="listen-btn">
    <div class="listen-btn__controls">
      <button
        class="listen-btn__toggle"
        :class="{
          'listen-btn__toggle--active': status !== 'idle',
        }"
        @click="handleToggle"
      >
        <LucideHeadphones
          v-if="status === 'idle'"
          :size="16"
          class="listen-btn__icon"
        />
        <LucidePause v-else-if="status === 'playing'" :size="16" />
        <LucidePlay v-else :size="16" />
        <span>{{ buttonLabel }}</span>
      </button>

      <button
        v-show="status !== 'idle'"
        class="listen-btn__stop"
        title="Stop"
        @click="stop"
      >
        <LucideSquare :size="12" />
      </button>

      <div class="listen-btn__options">
        <div class="listen-btn__speed-wrapper">
          <select
            class="listen-btn__speed"
            :value="playbackSpeed"
            @change="handleSpeedChange"
          >
            <option v-for="s in speeds" :key="s" :value="s">{{ s }}x</option>
          </select>
        </div>

        <div v-if="voices.length > 1" class="listen-btn__voice-wrapper">
          <select
            class="listen-btn__voice"
            :value="preferredVoiceName"
            @change="handleVoiceChange"
          >
            <option value="">Default voice</option>
            <option v-for="v in voices" :key="v.name" :value="v.name">
              {{ formatVoiceName(v) }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div
      v-if="status !== 'idle'"
      class="listen-btn__progress"
      role="slider"
      :aria-valuenow="Math.round(progress * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Playback progress"
      @mousedown="handleSeekStart"
      @touchstart.prevent="handleTouchSeekStart"
    >
      <div
        class="listen-btn__progress-fill"
        :style="{ width: `${progress * 100}%` }"
      />
      <div
        class="listen-btn__progress-thumb"
        :style="{ left: `${progress * 100}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  contentSelector: string;
}>();

const speeds = [0.75, 1, 1.25, 1.5, 2];

const { preferredVoiceName, playbackSpeed, setValue } = useApp();
const {
  status,
  voices,
  progress,
  isSupported,
  toggle,
  stop,
  restartFromCurrentChunk,
  seekToProgress,
} = useTextToSpeech();

const buttonLabel = computed(() => {
  if (status.value === "idle") return "Listen";
  if (status.value === "playing") return "Pause";
  return "Resume";
});

/**
 * Walks the DOM tree and extracts text with proper spacing between
 * block elements so the speech engine pauses naturally at headings
 * and paragraph boundaries.
 */
function extractReadableText(el: Element): string {
  const blocks = el.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li");
  if (blocks.length === 0) return el.textContent?.trim() || "";

  return Array.from(blocks)
    .map((block) => {
      const text = block.textContent?.trim();
      if (!text) return "";
      const tag = block.tagName.toLowerCase();
      if (tag.startsWith("h") && !/[.!?]$/.test(text)) {
        return text + ".";
      }
      return text;
    })
    .filter(Boolean)
    .join(" ");
}

function getContentText(): string {
  const selectors = props.contentSelector.split(",").map((s) => s.trim());
  const parts: string[] = [];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (!el) continue;

    const hasBlockChildren = el.querySelector("h1, h2, h3, h4, h5, h6, p, li");
    if (hasBlockChildren) {
      parts.push(extractReadableText(el));
    } else {
      const text = el.textContent?.trim();
      if (text) parts.push(text);
    }
  }

  return parts.join(". ");
}

function handleToggle() {
  const text = status.value === "idle" ? getContentText() : "";
  toggle(text);
}

function handleVoiceChange(event: Event) {
  setValue("preferredVoiceName", (event.target as HTMLSelectElement).value);
  if (status.value !== "idle") {
    restartFromCurrentChunk();
  }
}

function handleSpeedChange(event: Event) {
  setValue("playbackSpeed", parseFloat((event.target as HTMLSelectElement).value));
  if (status.value !== "idle") {
    restartFromCurrentChunk();
  }
}

function seekFromEvent(event: MouseEvent, bar: HTMLElement) {
  const rect = bar.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  seekToProgress(ratio);
}

function handleSeekStart(event: MouseEvent) {
  const bar = event.currentTarget as HTMLElement;
  seekFromEvent(event, bar);

  function onMove(e: MouseEvent) {
    seekFromEvent(e, bar);
  }
  function onUp() {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  }
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

function handleTouchSeekStart(event: TouchEvent) {
  const bar = event.currentTarget as HTMLElement;
  const rect = bar.getBoundingClientRect();

  function seekFromTouch(e: TouchEvent) {
    const touch = e.touches[0];
    if (!touch) return;
    const ratio = (touch.clientX - rect.left) / rect.width;
    seekToProgress(ratio);
  }

  seekFromTouch(event);

  function onMove(e: TouchEvent) {
    seekFromTouch(e);
  }
  function onEnd() {
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);
  }
  document.addEventListener("touchmove", onMove);
  document.addEventListener("touchend", onEnd);
}

function formatVoiceName(voice: SpeechSynthesisVoice): string {
  let name = voice.name;
  name = name.replace(/\s*\(.*\)/, "");
  name = name.replace(/\s*(Desktop|Online|Mobile)\b/gi, "");
  name = name.replace(/\s*-\s*.*$/, "");
  return name.trim();
}
</script>

<style scoped>
.listen-btn {
  margin: 1.25rem 0;
  border-radius: 0.75rem;
  background: var(--surface-muted);
  border: 1px solid var(--border-light);
  padding: 0.75rem 1rem;
  transition: border-color 0.2s ease;
}

.listen-btn:has(.listen-btn__toggle--active) {
  border-color: var(--color-primary-200);
  background: var(--color-primary-50);
}

.dark .listen-btn:has(.listen-btn__toggle--active) {
  border-color: var(--color-primary-800);
  background: var(--color-primary-950);
}

.listen-btn__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ── Main toggle ── */
.listen-btn__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.125rem;
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: none;
  background: var(--surface-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.1s ease;
}

.listen-btn__toggle:hover {
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.listen-btn__toggle:active {
  transform: scale(0.97);
}

.listen-btn__toggle--active {
  background: var(--color-primary);
  color: var(--text-on-primary);
}

@keyframes gentle-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.listen-btn__icon {
  animation: gentle-pulse 2s ease-in-out infinite;
}

/* ── Stop button ── */
.listen-btn__stop {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: none;
  background: var(--surface-elevated);
  color: var(--text-muted);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.listen-btn__stop:hover {
  background: var(--color-crimson-50);
  color: var(--color-crimson);
}

/* ── Options row (speed + voice) ── */
.listen-btn__options {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.listen-btn__speed-wrapper,
.listen-btn__voice-wrapper {
  display: inline-flex;
  align-items: center;
}

.listen-btn__speed,
.listen-btn__voice {
  font-size: 0.75rem;
  font-family: var(--font-body);
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  padding: 0.3125rem 0.5rem;
  cursor: pointer;
  appearance: auto;
  outline: none;
}

.listen-btn__speed {
  max-width: 4.5rem;
}

.listen-btn__voice {
  max-width: 10rem;
}

.listen-btn__speed:focus-visible,
.listen-btn__voice:focus-visible {
  outline: 2px solid var(--ring-default);
  outline-offset: 2px;
}

/* ── Seekable progress bar ── */
.listen-btn__progress {
  position: relative;
  margin-top: 0.625rem;
  height: 6px;
  border-radius: 9999px;
  background: var(--border-light);
  overflow: visible;
  cursor: pointer;
  touch-action: none;
}

.listen-btn__progress:hover {
  height: 8px;
}

.listen-btn__progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--color-primary);
  transition: width 0.15s ease;
  pointer-events: none;
}

.listen-btn__progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background: var(--color-primary);
  border: 2px solid var(--surface-elevated);
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.listen-btn__progress:hover .listen-btn__progress-thumb {
  opacity: 1;
}
</style>
