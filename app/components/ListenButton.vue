<template>
  <div v-if="isSupported" class="listen">
    <button
      v-if="status === 'idle'"
      type="button"
      class="pill pill--primary"
      @click="handleToggle"
    >
      <LucideHeadphones :size="16" />
      Listen · {{ minutesLabel(minutes) }}
    </button>

    <div v-else class="panel listen__panel" :class="{ 'listen__panel--paused': !playing }">
      <div class="listen__row">
        <button
          type="button"
          class="listen__main"
          :class="playing ? 'listen__main--playing' : 'listen__main--paused'"
          :aria-label="playing ? 'Pause' : 'Resume'"
          @click="handleToggle"
        >
          <LucidePause v-if="playing" :size="18" />
          <LucidePlay v-else :size="18" />
        </button>

        <div class="listen__text">
          <span class="listen__title">{{ playing ? "Listening" : "Paused" }}<template v-if="section"> · {{ section }}</template></span>
          <span class="listen__time">{{ clock(elapsedSeconds) }} of {{ clock(durationSeconds) }}<template v-if="!playing"> · Resume</template></span>
        </div>

        <button
          v-if="playing"
          type="button"
          class="pill pill--sm pill--secondary listen__speed"
          :aria-label="`Playback speed ${playbackSpeed} times. Change speed`"
          @click="cycleSpeed"
        >
          {{ speedLabel }}×
        </button>

        <button
          type="button"
          class="icon-btn icon-btn--round listen__stop"
          aria-label="Stop listening"
          @click="stop"
        >
          <LucideSquare v-if="playing" :size="14" />
          <LucideX v-else :size="16" />
        </button>
      </div>

      <template v-if="playing">
        <div
          class="listen__seek"
          role="slider"
          tabindex="0"
          :aria-valuenow="Math.round(progress * 100)"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Playback position"
          @mousedown="handleSeekStart"
          @touchstart.prevent="handleTouchSeekStart"
          @keydown.left.prevent="seekToProgress(progress - 0.05)"
          @keydown.right.prevent="seekToProgress(progress + 0.05)"
        >
          <div class="listen__track">
            <div class="listen__fill" :style="{ width: `${progress * 100}%` }" />
          </div>
          <span class="listen__thumb" :style="{ left: `${progress * 100}%` }" />
        </div>

        <div class="listen__voice">
          <span class="listen__voice-name">Voice · {{ voiceLabel }}</span>
          <button
            v-if="voices.length > 1 && !voicePickerOpen"
            type="button"
            class="listen__change"
            @click="voicePickerOpen = true"
          >
            Change
          </button>
          <select
            v-else-if="voices.length > 1"
            ref="voiceSelect"
            class="listen__select"
            aria-label="Voice"
            :value="preferredVoiceName"
            @change="handleVoiceChange"
            @blur="voicePickerOpen = false"
          >
            <option value="">Default voice</option>
            <option v-for="v in voices" :key="v.name" :value="v.name">
              {{ formatVoiceName(v) }}
            </option>
          </select>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { minutesLabel } from "~/utils/format";

const props = defineProps<{
  /** Comma-separated selectors, read in order. */
  contentSelector: string;
  /** Reading time shown on the idle pill ("Listen · 8 min"). */
  minutes: number;
}>();

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const BLOCK_SELECTOR = "h1, h2, h3, p, li";

const { preferredVoiceName, playbackSpeed, setValue } = useApp();
const { track } = useTag();
const route = useRoute();
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

const sharedDuration = useState<number>("tts-duration", () => 0);

const playing = computed(() => status.value === "playing");
const voicePickerOpen = ref(false);
const voiceSelect = ref<HTMLSelectElement | null>(null);

watch(voicePickerOpen, async (open) => {
  if (!open) return;
  await nextTick();
  voiceSelect.value?.focus();
});

/* ── Time ── */

// The composable estimates the total at play time using the speed then in
// force; rescale so the total tracks speed changes made mid-read.
let speedAtStart = 1;
const durationSeconds = computed(() =>
  sharedDuration.value * (speedAtStart / (playbackSpeed.value || 1)),
);
const elapsedSeconds = computed(() => progress.value * durationSeconds.value);

function clock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const speedLabel = computed(() => String(playbackSpeed.value));

const voiceLabel = computed(() => {
  const voice = voices.value.find((v) => v.name === preferredVoiceName.value);
  return voice ? formatVoiceName(voice) : "Default";
});

/* ── Blocks: the DOM elements being read, in reading order ── */

interface ReadBlock {
  el: HTMLElement;
  start: number;
  end: number;
  section: string;
}

let blocks: ReadBlock[] = [];
let totalLength = 0;
const currentIndex = ref(-1);
let highlighted: HTMLElement | null = null;

function blockText(el: Element): string {
  const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) return "";
  const tag = el.tagName.toLowerCase();
  if (tag.startsWith("h") && !/[.!?]$/.test(text)) return `${text}.`;
  return text;
}

/**
 * Walks every selector, collecting the readable blocks and the text handed
 * to the speech engine. Block offsets are kept so progress (a character
 * fraction) can be mapped back to the paragraph being read.
 */
function collectBlocks(): string {
  const selectors = props.contentSelector.split(",").map((s) => s.trim());
  const found: ReadBlock[] = [];
  const parts: string[] = [];
  let offset = 0;
  let section = "";

  for (const selector of selectors) {
    const root = document.querySelector<HTMLElement>(selector);
    if (!root) continue;
    const inner = Array.from(root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR));
    const elements = inner.length ? inner : [root];

    for (const el of elements) {
      const text = blockText(el);
      if (!text) continue;
      if (el.tagName === "H2") section = el.textContent?.trim() ?? section;
      const start = offset;
      offset += text.length + 1;
      found.push({ el, start, end: offset, section });
      parts.push(text);
    }
  }

  blocks = found;
  totalLength = Math.max(offset - 1, 0);
  return parts.join(" ");
}

function indexAt(fraction: number): number {
  if (!blocks.length || totalLength === 0) return -1;
  const pos = fraction * totalLength;
  const hit = blocks.findIndex((b) => pos >= b.start && pos < b.end);
  if (hit !== -1) return hit;
  return Math.min(blocks.length - 1, Math.floor(fraction * blocks.length));
}

const section = computed(() => blocks[currentIndex.value]?.section ?? "");

function clearHighlight() {
  highlighted?.classList.remove("is-speaking");
  highlighted = null;
}

watch(progress, (p) => {
  if (status.value === "idle") return;
  const next = indexAt(p);
  if (next !== currentIndex.value) currentIndex.value = next;
});

watch(currentIndex, (index) => {
  const block = blocks[index];
  clearHighlight();
  if (!block || status.value === "idle") return;
  block.el.classList.add("is-speaking");
  highlighted = block.el;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) block.el.scrollIntoView({ block: "center", behavior: "smooth" });
});

watch(status, (s) => {
  if (s !== "idle") return;
  clearHighlight();
  currentIndex.value = -1;
  blocks = [];
  totalLength = 0;
  voicePickerOpen.value = false;
});

onBeforeUnmount(clearHighlight);

/* ── Controls ── */

function handleToggle() {
  const wasIdle = status.value === "idle";
  const text = wasIdle ? collectBlocks() : "";
  if (wasIdle) {
    speedAtStart = playbackSpeed.value || 1;
    currentIndex.value = -1;
  }
  toggle(text);
  if (wasIdle) {
    currentIndex.value = indexAt(0);
    const segments = route.path.split("/").filter(Boolean);
    track("listen_play", { slug: segments[1] });
  }
}

function cycleSpeed() {
  const i = SPEEDS.indexOf(playbackSpeed.value);
  const next = SPEEDS[(i + 1) % SPEEDS.length] ?? 1;
  setValue("playbackSpeed", next);
  if (status.value !== "idle") restartFromCurrentChunk();
}

function handleVoiceChange(event: Event) {
  setValue("preferredVoiceName", (event.target as HTMLSelectElement).value);
  voicePickerOpen.value = false;
  if (status.value !== "idle") restartFromCurrentChunk();
}

function seekFromEvent(event: MouseEvent, bar: HTMLElement) {
  const rect = bar.getBoundingClientRect();
  seekToProgress((event.clientX - rect.left) / rect.width);
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
    seekToProgress((touch.clientX - rect.left) / rect.width);
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
  return voice.name
    .replace(/\s*\(.*\)/, "")
    .replace(/\s*(Desktop|Online|Mobile)\b/gi, "")
    .replace(/\s*-\s*.*$/, "")
    .trim();
}
</script>

<style scoped>
.listen {
  display: block;
}

/* Expands in place: the panel takes the full row when open. */
.listen:has(.listen__panel) {
  flex-basis: 100%;
}

.listen__panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
}

.listen__row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.listen__main {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid var(--color-primary);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.25s ease;
}

.listen__main:active {
  transform: scale(0.95);
}

.listen__main--playing {
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.listen__main--paused {
  background: transparent;
  color: var(--color-primary);
}

.listen__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.listen__title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.listen__time {
  font-size: 13px;
  line-height: 1.3;
  color: var(--text-muted);
}

/* 36px visual, 44px hit box via the pseudo-element. */
.listen__speed {
  position: relative;
  flex-shrink: 0;
  height: 36px;
  padding: 0 12px;
  font-size: 13px;
}

.listen__speed::before {
  content: "";
  position: absolute;
  inset: -4px;
}

.listen__stop {
  flex-shrink: 0;
  color: var(--text-muted);
}

/* ── Seek ── */
.listen__seek {
  position: relative;
  display: flex;
  align-items: center;
  height: 24px;
  cursor: pointer;
  touch-action: none;
  border-radius: 12px;
}

.listen__seek:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.listen__track {
  width: 100%;
  height: 4px;
  border-radius: 9999px;
  background: var(--surface-subtle);
  overflow: hidden;
}

.listen__fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--color-primary);
  transition: width 0.15s ease;
}

.listen__thumb {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 3px var(--surface-muted);
  transform: translateY(-50%);
  pointer-events: none;
  transition: left 0.15s ease;
}

/* ── Voice ── */
.listen__voice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
}

.listen__voice-name {
  font-size: 13px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.listen__change {
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
  padding: 0 8px;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
}

.listen__change:hover {
  color: var(--color-primary-600);
}

.listen__select {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 10px;
  border: 1.5px solid var(--border-default);
  border-radius: 8px;
  background: var(--surface-elevated);
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
}

.listen__select:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
