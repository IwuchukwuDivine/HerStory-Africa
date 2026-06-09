<template>
  <div class="ai-assistant">
    <!-- Floating action button -->
    <Transition name="fab">
      <button
        v-if="isRelevantRoute && !isOpen"
        class="ai-fab"
        aria-label="Open story assistant"
        @click="open"
      >
        <LucideSparkles :size="22" />
      </button>
    </Transition>

    <!-- Backdrop (mobile only) -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="ai-backdrop"
        @click="close"
      />
    </Transition>

    <!-- Panel -->
    <Transition name="panel">
      <aside
        v-if="isOpen"
        class="ai-panel"
        role="dialog"
        aria-label="Story assistant"
      >
        <header class="ai-panel__header">
          <div class="ai-panel__title">
            <LucideSparkles :size="18" />
            <span>Story Assistant</span>
          </div>
          <button
            class="ai-panel__close"
            aria-label="Close"
            @click="close"
          >
            <LucideX :size="20" />
          </button>
        </header>

        <div
          v-if="showExperimentalBanner"
          class="ai-banner"
        >
          <div class="ai-banner__icon">
            <LucideFlaskConical :size="16" />
          </div>
          <p class="ai-banner__text">
            <strong>Experimental.</strong>
            <template v-if="ollamaLive === true">
              Chat may occasionally make mistakes — verify important facts.
            </template>
            <template v-else>
              Quick facts are pre-written. Free-form questions are coming soon.
            </template>
          </p>
          <button
            class="ai-banner__dismiss"
            aria-label="Dismiss"
            @click="dismissBanner"
          >
            <LucideX :size="14" />
          </button>
        </div>

        <div class="ai-panel__context">
          <span class="ai-panel__context-label">Exploring</span>
          <p class="ai-panel__context-title">
            {{ contextTitle }}
          </p>
        </div>

        <!-- Output area: chat history OR chip content -->
        <div
          ref="outputEl"
          class="ai-panel__output"
          :class="{ 'ai-panel__output--empty': !activeChip && !chatMode }"
          @click="!chatMode && completeTyping()"
        >
          <!-- Chat history -->
          <template v-if="chatMode">
            <div
              v-for="(msg, i) in chatHistory"
              :key="i"
              class="ai-chat-msg"
              :class="
                msg.role === 'user'
                  ? 'ai-chat-msg--user'
                  : 'ai-chat-msg--assistant'
              "
            >
              <span class="ai-chat-msg__bubble">{{ msg.content }}</span>
            </div>
            <div
              v-if="chatLoading"
              class="ai-chat-msg ai-chat-msg--assistant"
            >
              <div
                class="ai-typing-dots"
                aria-label="Thinking"
              >
                <span /><span /><span />
              </div>
            </div>
          </template>

          <!-- Chip content -->
          <template v-else-if="activeChip">
            <h3 class="ai-panel__output-heading">
              {{ activeChip.label }}
            </h3>
            <div
              v-if="loading"
              class="ai-typing-dots"
              aria-label="Loading"
            >
              <span /><span /><span />
            </div>
            <div
              v-else
              class="ai-panel__output-body"
            >
              <p
                v-if="activeChip.kind === 'text'"
                class="ai-panel__text"
              >
                {{ typedText }}<span
                  v-if="isTyping"
                  class="ai-caret"
                />
              </p>
              <ul
                v-else-if="activeChip.kind === 'list'"
                class="ai-panel__list"
              >
                <li
                  v-for="(item, idx) in revealedItems"
                  :key="idx"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </template>

          <!-- Empty state -->
          <p
            v-else
            class="ai-panel__hint"
          >
            Tap a suggestion below to learn more about
            <strong>{{ contextShort }}</strong>.
            <template v-if="ollamaLive === true">
              Or ask your own question below.
            </template>
          </p>
        </div>

        <div
          v-if="chips.length"
          class="ai-chips"
        >
          <button
            v-for="chip in chips"
            :key="chip.id"
            class="ai-chip"
            :class="{ 'ai-chip--active': !chatMode && activeChip?.id === chip.id }"
            @click="selectChip(chip)"
          >
            {{ chip.label }}
          </button>
        </div>

        <p
          v-else
          class="ai-empty-note"
        >
          Open this on a woman's profile or article page to explore with AI.
        </p>

        <!-- Footer: 3 states based on ollama availability -->
        <footer
          v-if="ollamaLive === true"
          class="ai-chat-input"
        >
          <input
            ref="chatInputEl"
            v-model="chatInput"
            class="ai-chat-input__field"
            type="text"
            :placeholder="`Ask anything about ${contextShort}…`"
            :disabled="chatLoading"
            maxlength="500"
            autocomplete="off"
            @keydown.enter.prevent="sendChat"
          />
          <button
            class="ai-chat-input__send"
            :disabled="!chatInput.trim() || chatLoading"
            aria-label="Send message"
            @click="sendChat"
          >
            <LucideSend
              v-if="!chatLoading"
              :size="15"
            />
            <LucideLoader2
              v-else
              :size="15"
              class="ai-spin"
            />
          </button>
        </footer>
        <footer
          v-else-if="ollamaLive === null"
          class="ai-panel__footer"
        >
          <LucideLoader2
            :size="14"
            class="ai-spin"
          />
          <span>Connecting to AI…</span>
        </footer>
        <footer
          v-else
          class="ai-panel__footer"
        >
          <LucideMessageCircle :size="14" />
          <span>Free-form questions coming soon</span>
        </footer>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";

type Chip = {
  id: string;
  label: string;
  kind: "text" | "list";
  text?: string;
  items?: string[];
};

type WomanDoc = {
  name: string;
  slug: string;
  summary?: string;
  funFact?: string;
  country?: string;
  region?: string;
  born?: number;
  died?: number | null;
  era?: string;
  causes?: string[];
};

type ArticleDoc = {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  reflectionPrompt?: string;
};

type AiContent = {
  women: Record<
    string,
    { summary?: string; whyShematters?: string; timeline?: string[] }
  >;
  articles: Record<string, { summary?: string; keyTakeaways?: string[] }>;
};

type ChatMessage = { role: "user" | "assistant"; content: string };

const route = useRoute();

// Panel state
const isOpen = ref(false);
const loading = ref(false);
const activeChip = ref<Chip | null>(null);
const showExperimentalBanner = ref(true);

// Typewriter state
const typedText = ref("");
const revealedItems = ref<string[]>([]);
const isTyping = ref(false);
let typeTimer: ReturnType<typeof setInterval> | null = null;
let listTimer: ReturnType<typeof setInterval> | null = null;
let pendingText = "";
let pendingList: string[] = [];

// Context state
const contextDoc = ref<WomanDoc | ArticleDoc | null>(null);
const contextType = ref<"woman" | "article" | "general">("general");
const aiContent = ref<AiContent | null>(null);

// Chat state
const ollamaLive = ref<boolean | null>(null);
const chatMode = ref(false);
const chatInput = ref("");
const chatLoading = ref(false);
const chatHistory = ref<ChatMessage[]>([]);
const outputEl = ref<HTMLElement | null>(null);
const chatInputEl = ref<HTMLInputElement | null>(null);

// ── Computed ────────────────────────────────────────────────────────────────

const isRelevantRoute = computed(() => {
  const path = route.path;
  return (
    (path.startsWith("/women/") && path.length > "/women/".length) ||
    (path.startsWith("/articles/") && path.length > "/articles/".length)
  );
});

const contextTitle = computed(() => {
  if (contextType.value === "woman") {
    return (contextDoc.value as WomanDoc | null)?.name ?? "This woman";
  }
  if (contextType.value === "article") {
    return (contextDoc.value as ArticleDoc | null)?.title ?? "This article";
  }
  return "The HerStory Africa archive";
});

const contextShort = computed(() => {
  if (contextType.value === "woman") {
    return (contextDoc.value as WomanDoc | null)?.name ?? "her";
  }
  if (contextType.value === "article") {
    return "this article";
  }
  return "African women's history";
});

const chips = computed<Chip[]>(() => {
  if (contextType.value === "woman") {
    const w = contextDoc.value as WomanDoc | null;
    if (!w) return [];
    const aiW = aiContent.value?.women?.[w.slug];
    const list: Chip[] = [];
    const summaryText = aiW?.summary || w.summary;
    if (summaryText) {
      list.push({
        id: "summary",
        label: "Summary",
        kind: "text",
        text: summaryText,
      });
    }
    list.push({
      id: "quick-facts",
      label: "Quick facts",
      kind: "list",
      items: buildWomanFacts(w),
    });
    if (aiW?.whyShematters) {
      list.push({
        id: "why",
        label: "Why she matters",
        kind: "text",
        text: aiW.whyShematters,
      });
    }
    if (aiW?.timeline?.length) {
      list.push({
        id: "timeline",
        label: "Timeline",
        kind: "list",
        items: aiW.timeline,
      });
    }
    if (w.funFact) {
      list.push({
        id: "fun",
        label: "Did you know?",
        kind: "text",
        text: w.funFact,
      });
    }
    return list;
  }
  if (contextType.value === "article") {
    const a = contextDoc.value as ArticleDoc | null;
    if (!a) return [];
    const aiA = aiContent.value?.articles?.[a.slug];
    const list: Chip[] = [];
    const summaryText = aiA?.summary || a.description;
    if (summaryText) {
      list.push({
        id: "summary",
        label: "Summary",
        kind: "text",
        text: summaryText,
      });
    }
    if (aiA?.keyTakeaways?.length) {
      list.push({
        id: "takeaways",
        label: "Key takeaways",
        kind: "list",
        items: aiA.keyTakeaways,
      });
    }
    if (a.reflectionPrompt) {
      list.push({
        id: "reflect",
        label: "Reflect",
        kind: "text",
        text: a.reflectionPrompt,
      });
    }
    return list;
  }
  return [];
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildWomanFacts(w: WomanDoc): string[] {
  const facts: string[] = [];
  if (w.country) {
    facts.push(`From ${w.country}${w.region ? `, ${w.region}` : ""}`);
  }
  if (w.born) {
    const death = w.died ? `${w.died}` : "present";
    facts.push(`${w.born} – ${death}`);
  }
  if (w.era) facts.push(`Era: ${w.era}`);
  if (w.causes?.length) facts.push(`Known for: ${w.causes.join(", ")}`);
  return facts;
}

function getContextBody(): string {
  if (contextType.value === "woman") {
    const w = contextDoc.value as WomanDoc | null;
    if (!w) return "";
    const aiW = aiContent.value?.women?.[w.slug];
    const parts: string[] = [];
    const summary = aiW?.summary || w.summary;
    if (summary) parts.push(summary);
    if (aiW?.whyShematters) parts.push(`Why she matters: ${aiW.whyShematters}`);
    const facts = buildWomanFacts(w);
    if (facts.length) parts.push(facts.join(", "));
    return parts.join("\n");
  }
  if (contextType.value === "article") {
    const a = contextDoc.value as ArticleDoc | null;
    if (!a) return "";
    const aiA = aiContent.value?.articles?.[a.slug];
    const parts: string[] = [];
    const summary = aiA?.summary || a.description;
    if (summary) parts.push(summary);
    if (aiA?.keyTakeaways?.length) parts.push(aiA.keyTakeaways.join("; "));
    return parts.join("\n");
  }
  return "";
}

async function scrollToBottom() {
  await nextTick();
  if (outputEl.value) {
    outputEl.value.scrollTop = outputEl.value.scrollHeight;
  }
}

// ── Panel actions ────────────────────────────────────────────────────────────

let savedScrollY = 0;

function lockBodyScroll() {
  if (!import.meta.client) return;
  document.documentElement.classList.add("ai-panel-open");
  if (window.innerWidth < 768) {
    savedScrollY = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
  }
}

function unlockBodyScroll() {
  if (!import.meta.client) return;
  document.documentElement.classList.remove("ai-panel-open");
  const body = document.body;
  if (body.style.position === "fixed") {
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    window.scrollTo(0, savedScrollY);
  }
}

async function open() {
  isOpen.value = true;
  lockBodyScroll();
  checkOllamaStatus();
  await loadContext();
}

function close() {
  isOpen.value = false;
  unlockBodyScroll();
  resetTyping();
  activeChip.value = null;
  resetChat();
}

function dismissBanner() {
  showExperimentalBanner.value = false;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("ai-assistant-banner-dismissed", "1");
  }
}

// ── Typewriter ───────────────────────────────────────────────────────────────

function resetTyping() {
  if (typeTimer) clearInterval(typeTimer);
  if (listTimer) clearInterval(listTimer);
  typeTimer = null;
  listTimer = null;
  isTyping.value = false;
  typedText.value = "";
  revealedItems.value = [];
}

function completeTyping() {
  if (!isTyping.value) return;
  if (typeTimer) {
    clearInterval(typeTimer);
    typeTimer = null;
    typedText.value = pendingText;
  }
  if (listTimer) {
    clearInterval(listTimer);
    listTimer = null;
    revealedItems.value = [...pendingList];
  }
  isTyping.value = false;
}

function startTypewriter(text: string) {
  pendingText = text;
  typedText.value = "";
  isTyping.value = true;
  let i = 0;
  typeTimer = setInterval(() => {
    if (i >= text.length) {
      if (typeTimer) clearInterval(typeTimer);
      typeTimer = null;
      isTyping.value = false;
      return;
    }
    typedText.value += text[i++];
  }, 12);
}

function startListReveal(items: string[]) {
  pendingList = items;
  revealedItems.value = [];
  isTyping.value = true;
  let i = 0;
  listTimer = setInterval(() => {
    if (i >= items.length) {
      if (listTimer) clearInterval(listTimer);
      listTimer = null;
      isTyping.value = false;
      return;
    }
    revealedItems.value.push(items[i++]!);
  }, 180);
}

function selectChip(chip: Chip) {
  resetTyping();
  chatMode.value = false;
  activeChip.value = chip;
  if (chip.kind === "text" && chip.text) {
    startTypewriter(chip.text);
  } else if (chip.kind === "list" && chip.items) {
    startListReveal(chip.items);
  }
}

// ── Data loading ─────────────────────────────────────────────────────────────

async function loadAiContent() {
  if (aiContent.value) return;
  try {
    aiContent.value = await $fetch<AiContent>("/ai-content.json");
  } catch {
    aiContent.value = { women: {}, articles: {} };
  }
}

async function loadContext() {
  const path = route.path;
  loading.value = true;
  await loadAiContent();
  try {
    if (path.startsWith("/women/") && path !== "/women/") {
      const doc = await queryCollection("women").path(path).first();
      if (doc) {
        contextDoc.value = doc as unknown as WomanDoc;
        contextType.value = "woman";
      } else {
        contextType.value = "general";
        contextDoc.value = null;
      }
    } else if (path.startsWith("/articles/") && path !== "/articles/") {
      const doc = await queryCollection("articles").path(path).first();
      if (doc) {
        contextDoc.value = doc as unknown as ArticleDoc;
        contextType.value = "article";
      } else {
        contextType.value = "general";
        contextDoc.value = null;
      }
    } else {
      contextType.value = "general";
      contextDoc.value = null;
    }
  } finally {
    loading.value = false;
  }
}

// ── Chat ─────────────────────────────────────────────────────────────────────

function resetChat() {
  chatMode.value = false;
  chatHistory.value = [];
  chatInput.value = "";
  chatLoading.value = false;
  ollamaLive.value = null;
}

async function checkOllamaStatus() {
  ollamaLive.value = null;
  try {
    const result = await $fetch<{ live: boolean }>("/api/ai-status");
    ollamaLive.value = result.live;
  } catch {
    ollamaLive.value = false;
  }
}

async function sendChat() {
  const msg = chatInput.value.trim();
  if (!msg || chatLoading.value) return;

  chatHistory.value.push({ role: "user", content: msg });
  chatInput.value = "";
  chatLoading.value = true;
  chatMode.value = true;
  resetTyping();
  activeChip.value = null;

  await scrollToBottom();

  try {
    const result = await $fetch<{ reply: string }>("/api/chat", {
      method: "POST",
      body: {
        message: msg,
        history: chatHistory.value.slice(0, -1),
        contextType: contextType.value,
        contextTitle: contextTitle.value,
        contextBody: getContextBody(),
      },
    });
    chatHistory.value.push({ role: "assistant", content: result.reply });
  } catch {
    chatHistory.value.push({
      role: "assistant",
      content: "I couldn't reach the AI right now. Please try again shortly.",
    });
    ollamaLive.value = false;
  } finally {
    chatLoading.value = false;
  }
}

// ── Keyboard ─────────────────────────────────────────────────────────────────

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value) close();
}

// ── Watchers ─────────────────────────────────────────────────────────────────

watch(chatHistory, scrollToBottom, { deep: true });

watch(chatLoading, async (val) => {
  if (val && chatMode.value) await scrollToBottom();
});

watch(ollamaLive, async (val) => {
  if (val === true) {
    await nextTick();
    chatInputEl.value?.focus();
  }
});

watch(
  () => route.path,
  () => {
    if (!isRelevantRoute.value) {
      if (isOpen.value) close();
      return;
    }
    if (isOpen.value) {
      resetTyping();
      resetChat();
      activeChip.value = null;
      checkOllamaStatus();
      loadContext();
    }
  },
);

// ── Lifecycle ────────────────────────────────────────────────────────────────

if (import.meta.client) {
  if (window.localStorage.getItem("ai-assistant-banner-dismissed") === "1") {
    showExperimentalBanner.value = false;
  }
  window.addEventListener("keydown", onKeydown);
}

onBeforeUnmount(() => {
  resetTyping();
  if (import.meta.client) {
    window.removeEventListener("keydown", onKeydown);
    unlockBodyScroll();
  }
});
</script>

<style scoped>
.ai-assistant {
  display: contents;
}

/* ── FAB ──────────────────────────────────────────────────────────────────── */

.ai-fab {
  position: relative;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 9999px;
  background: linear-gradient(
    135deg,
    var(--color-primary-500) 0%,
    var(--color-primary-400) 100%
  );
  color: var(--text-on-primary);
  border: none;
  box-shadow:
    0 10px 25px -10px rgba(181, 69, 27, 0.6),
    0 4px 10px -4px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.ai-fab:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow:
    0 14px 30px -10px rgba(181, 69, 27, 0.7),
    0 6px 14px -4px rgba(0, 0, 0, 0.18);
}
.ai-fab:focus-visible {
  outline: 2px solid var(--text-on-primary);
  outline-offset: 3px;
}

/* ── Backdrop ─────────────────────────────────────────────────────────────── */

.ai-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: var(--overlay-default);
  backdrop-filter: blur(2px);
  touch-action: none;
}
@media (min-width: 768px) {
  .ai-backdrop {
    display: none;
  }
}

/* ── Panel ────────────────────────────────────────────────────────────────── */

.ai-panel {
  position: fixed;
  z-index: 310;
  top: 0;
  left: 0;
  right: 0;
  height: 100dvh;
  background: var(--surface-elevated);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overscroll-behavior: none;
}
@media (min-width: 768px) {
  .ai-panel {
    inset: auto;
    top: 0;
    right: 0;
    bottom: 0;
    width: 420px;
    height: 100vh;
    border-left: 1px solid var(--border-light);
  }
}

/* ── Header ───────────────────────────────────────────────────────────────── */

.ai-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}
.ai-panel__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.0625rem;
  color: var(--color-primary);
}
.ai-panel__close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
.ai-panel__close:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

/* ── Banner ───────────────────────────────────────────────────────────────── */

.ai-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.875rem 1.25rem 0;
  padding: 0.625rem 0.75rem;
  background: var(--surface-muted);
  border: 1px solid var(--color-primary-200);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.ai-banner__icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--color-primary);
}
.ai-banner__text {
  flex: 1;
  margin: 0;
  line-height: 1.4;
}
.ai-banner__dismiss {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
}
.ai-banner__dismiss:hover {
  background: var(--color-primary-100);
}

/* ── Context ──────────────────────────────────────────────────────────────── */

.ai-panel__context {
  padding: 1rem 1.25rem 0.5rem;
  flex-shrink: 0;
}
.ai-panel__context-label {
  display: block;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}
.ai-panel__context-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

/* ── Output ───────────────────────────────────────────────────────────────── */

.ai-panel__output {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1rem 1.25rem;
  cursor: text;
  scroll-behavior: smooth;
}
.ai-panel__output--empty {
  cursor: default;
}
.ai-panel__output-heading {
  margin: 0 0 0.625rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ai-panel__text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-primary);
}
.ai-panel__list {
  margin: 0;
  padding-left: 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ai-panel__list li {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-primary);
}
.ai-panel__hint {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-muted);
}

/* ── Chat messages ────────────────────────────────────────────────────────── */

.ai-chat-msg {
  display: flex;
  margin-bottom: 0.75rem;
}
.ai-chat-msg--user {
  justify-content: flex-end;
}
.ai-chat-msg--assistant {
  justify-content: flex-start;
}
.ai-chat-msg__bubble {
  display: inline-block;
  max-width: 88%;
  padding: 0.625rem 0.875rem;
  border-radius: 1rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}
.ai-chat-msg--user .ai-chat-msg__bubble {
  background: var(--color-primary);
  color: var(--text-on-primary);
  border-bottom-right-radius: 0.25rem;
}
.ai-chat-msg--assistant .ai-chat-msg__bubble {
  background: var(--surface-muted);
  color: var(--text-primary);
  border-bottom-left-radius: 0.25rem;
}

/* ── Caret ────────────────────────────────────────────────────────────────── */

.ai-caret {
  display: inline-block;
  width: 2px;
  height: 1.05em;
  background: var(--color-primary);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: ai-blink 1s steps(2) infinite;
}
@keyframes ai-blink {
  to {
    opacity: 0;
  }
}

/* ── Typing dots ──────────────────────────────────────────────────────────── */

.ai-typing-dots {
  display: inline-flex;
  gap: 4px;
  padding: 6px 0;
}
.ai-typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  opacity: 0.4;
  animation: ai-bounce 1.2s infinite;
}
.ai-typing-dots span:nth-child(2) {
  animation-delay: 0.15s;
}
.ai-typing-dots span:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes ai-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* ── Spin ─────────────────────────────────────────────────────────────────── */

.ai-spin {
  animation: ai-spin 1s linear infinite;
}
@keyframes ai-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Chips ────────────────────────────────────────────────────────────────── */

.ai-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
}
.ai-chip {
  font-size: 0.8125rem;
  padding: 0.4375rem 0.875rem;
  border-radius: 9999px;
  border: 1px solid var(--border-default);
  background: var(--surface-muted);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.ai-chip:hover {
  border-color: var(--color-primary-400);
  background: var(--color-primary-50);
  color: var(--color-primary);
}
.ai-chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
}
.ai-chip--active:hover {
  background: var(--color-primary-600);
  color: var(--text-on-primary);
}

/* ── Empty note ───────────────────────────────────────────────────────────── */

.ai-empty-note {
  margin: 0;
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  text-align: center;
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
}

/* ── Footer (status / coming soon) ───────────────────────────────────────── */

.ai-panel__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--surface-muted);
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
}

/* ── Chat input ───────────────────────────────────────────────────────────── */

.ai-chat-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-light);
  background: var(--surface-elevated);
  flex-shrink: 0;
}
.ai-chat-input__field {
  flex: 1;
  min-width: 0;
  padding: 0.5625rem 1rem;
  border: 1px solid var(--border-default);
  border-radius: 9999px;
  background: var(--surface-muted);
  /* 1rem (16px) prevents iOS auto-zoom on focus */
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.ai-chat-input__field::placeholder {
  color: var(--text-muted);
}
.ai-chat-input__field:focus {
  border-color: var(--color-primary-400);
  background: var(--surface-elevated);
}
.ai-chat-input__field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.ai-chat-input__send {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 9999px;
  border: none;
  background: var(--color-primary);
  color: var(--text-on-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s ease,
    transform 0.1s ease,
    opacity 0.15s ease;
}
.ai-chat-input__send:hover:not(:disabled) {
  background: var(--color-primary-600);
  transform: scale(1.06);
}
.ai-chat-input__send:active:not(:disabled) {
  transform: scale(0.96);
}
.ai-chat-input__send:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
}

/* ── Transitions ──────────────────────────────────────────────────────────── */

.fab-enter-active,
.fab-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.fab-enter-from,
.fab-leave-to {
  transform: scale(0.7) translateY(10px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.panel-enter-active,
.panel-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.25s ease;
}
.panel-enter-from,
.panel-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
@media (min-width: 768px) {
  .panel-enter-from,
  .panel-leave-to {
    transform: translateX(100%);
  }
}
</style>

<style>
/* Global layout hooks */

/* Mobile scroll lock handled entirely via JS (position:fixed on body).
   overflow:hidden alone does not reliably block iOS Safari scroll
   when the virtual keyboard is open. */

@media (min-width: 768px) {
  html.ai-panel-open body {
    padding-right: 420px;
    transition: padding-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
}
body {
  transition: padding-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
