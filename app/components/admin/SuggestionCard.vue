<template>
  <article class="sug-card">
    <header class="sug-card__head">
      <div>
        <h3 class="sug-card__name">{{ womanName }}</h3>
        <p class="sug-card__meta">
          <span v-if="suggestion.parsed.country">
            {{ suggestion.parsed.country }} ·
          </span>
          #{{ suggestion.number }} · {{ createdLabel }}
        </p>
      </div>
      <a
        :href="suggestion.url"
        target="_blank"
        rel="noopener"
        class="sug-card__gh"
        title="View issue on GitHub"
      >
        <LucideExternalLink :size="16" />
      </a>
    </header>

    <p v-if="suggestion.parsed.reason" class="sug-card__reason">
      {{ suggestion.parsed.reason }}
    </p>

    <details v-else class="sug-card__raw">
      <summary>Couldn't parse this one — show raw</summary>
      <pre>{{ suggestion.parsed.raw }}</pre>
    </details>

    <div class="sug-card__submitter">
      <LucideUser :size="14" />
      <span>{{ suggestion.parsed.submitterName || "Anonymous" }}</span>
      <template v-if="hasEmail">
        <span class="sug-card__dot">·</span>
        <LucideMail :size="14" />
        <span>{{ suggestion.parsed.submitterEmail }}</span>
      </template>
      <span v-else class="sug-card__no-email">
        <LucideMailX :size="14" /> no contact email
      </span>
    </div>

    <!-- Accept form -->
    <div v-if="mode === 'accepting'" class="sug-card__accept">
      <label class="sug-card__label" :for="`url-${suggestion.number}`">
        Profile URL
      </label>
      <input
        :id="`url-${suggestion.number}`"
        v-model="profileUrl"
        type="url"
        class="sug-card__input"
        placeholder="https://herstoryafrica.com.ng/women/…"
      />

      <label class="sug-card__label" :for="`note-${suggestion.number}`">
        Comment on the issue <span class="sug-card__optional">optional</span>
      </label>
      <input
        :id="`note-${suggestion.number}`"
        v-model="comment"
        type="text"
        class="sug-card__input"
        placeholder="e.g. Added! Thanks for the suggestion."
      />

      <p v-if="!hasEmail" class="sug-card__warn">
        <LucideAlertTriangle :size="15" />
        No email on file — this will close the issue without notifying anyone.
      </p>

      <p v-if="error" class="sug-card__error">
        <LucideAlertCircle :size="15" />
        {{ error }}
      </p>

      <div class="sug-card__actions">
        <button
          class="sug-card__btn sug-card__btn--primary"
          :disabled="busy || !profileUrl.trim()"
          @click="confirmAccept"
        >
          <LucideLoader2 v-if="busy" :size="16" class="sug-card__spinner" />
          <LucideCheck v-else :size="16" />
          {{ acceptLabel }}
        </button>
        <button
          class="sug-card__btn sug-card__btn--ghost"
          :disabled="busy"
          @click="mode = 'idle'"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Idle actions -->
    <div v-else class="sug-card__actions">
      <button
        class="sug-card__btn sug-card__btn--primary"
        @click="mode = 'accepting'"
      >
        <LucideCheck :size="16" />
        Accept &amp; notify
      </button>
      <button
        class="sug-card__btn sug-card__btn--danger"
        :disabled="busy"
        @click="decline"
      >
        <LucideLoader2
          v-if="busy && mode === 'declining'"
          :size="16"
          class="sug-card__spinner"
        />
        <LucideX v-else :size="16" />
        Decline
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { AdminSuggestion } from "~/utils/types/admin";

const props = defineProps<{ suggestion: AdminSuggestion }>();
const emit = defineEmits<{ done: [] }>();

const mode = ref<"idle" | "accepting" | "declining">("idle");
const profileUrl = ref("");
const comment = ref("");
const busy = ref(false);
const error = ref("");

const womanName = computed(
  () =>
    props.suggestion.parsed.name ||
    props.suggestion.title.replace(/^Suggestion:\s*/i, "").trim() ||
    "Unnamed suggestion",
);

const hasEmail = computed(() => !!props.suggestion.parsed.submitterEmail);

const acceptLabel = computed(() =>
  hasEmail.value ? "Accept, email & close" : "Accept & close",
);

const createdLabel = computed(() =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(props.suggestion.createdAt)),
);

async function confirmAccept() {
  if (!profileUrl.value.trim()) return;
  error.value = "";
  busy.value = true;
  try {
    await $fetch(`/api/admin/suggestions/${props.suggestion.number}/accept`, {
      method: "POST",
      body: {
        profileUrl: profileUrl.value.trim(),
        womanName: womanName.value,
        submitterEmail: props.suggestion.parsed.submitterEmail,
        submitterName: props.suggestion.parsed.submitterName,
        comment: comment.value.trim() || undefined,
        close: true,
      },
    });
    emit("done");
  } catch {
    error.value = "Something went wrong. The issue was not closed.";
    busy.value = false;
  }
}

async function decline() {
  if (!confirm(`Decline and close "${womanName.value}"? No email is sent.`)) {
    return;
  }
  mode.value = "declining";
  busy.value = true;
  try {
    await $fetch(`/api/admin/suggestions/${props.suggestion.number}/decline`, {
      method: "POST",
    });
    emit("done");
  } catch {
    error.value = "Couldn't close the issue. Try again.";
    busy.value = false;
    mode.value = "idle";
  }
}
</script>

<style scoped>
.sug-card {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.5rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  box-shadow: var(--shadow-card);
}

.sug-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.sug-card__name {
  font-size: 1.1875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.sug-card__meta {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0;
}

.sug-card__gh {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.sug-card__gh:hover {
  color: var(--color-primary);
}

.sug-card__reason {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.sug-card__raw {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.sug-card__raw pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0.5rem 0 0;
  padding: 0.75rem;
  background: var(--surface-muted);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
}

.sug-card__submitter {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.sug-card__dot {
  margin: 0 0.125rem;
}

.sug-card__no-email {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-secondary-700, var(--color-secondary));
}

.sug-card__accept {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface-muted);
  border-radius: 0.75rem;
}

.sug-card__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.sug-card__optional {
  font-weight: 400;
  color: var(--text-muted);
}

.sug-card__input {
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-light);
  border-radius: 0.625rem;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.sug-card__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

.sug-card__warn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: var(--color-secondary-700, var(--color-secondary));
  margin: 0.25rem 0 0;
}

.sug-card__error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: var(--color-crimson);
  margin: 0.25rem 0 0;
}

.sug-card__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sug-card__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sug-card__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.sug-card__btn--primary {
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.sug-card__btn--primary:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.sug-card__btn--ghost {
  background: transparent;
  border-color: var(--border-default);
  color: var(--text-secondary);
}

.sug-card__btn--ghost:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.sug-card__btn--danger {
  background: transparent;
  border-color: var(--border-default);
  color: var(--text-secondary);
}

.sug-card__btn--danger:hover:not(:disabled) {
  border-color: var(--color-crimson);
  color: var(--color-crimson);
}

.sug-card__spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
