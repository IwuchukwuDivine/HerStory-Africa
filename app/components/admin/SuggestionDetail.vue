<template>
  <aside class="a-sug-detail">
    <template v-if="suggestion">
      <div class="a-sug-detail__head">
        <h2 class="a-sug-detail__name">{{ nameOf(suggestion) }}</h2>
        <p class="a-sug-detail__meta">
          {{ metaOf(suggestion) }} · opened {{ ageOf(suggestion) }} ago
        </p>
      </div>

      <p v-if="suggestion.parsed.reason" class="a-sug-detail__reason">
        {{ suggestion.parsed.reason }}
      </p>
      <details v-else class="a-sug-detail__raw">
        <summary>Couldn't parse this one — show raw</summary>
        <pre>{{ suggestion.parsed.raw || "(empty issue body)" }}</pre>
      </details>

      <div v-if="suggestion.parsed.sources" class="a-sug-detail__field">
        <span class="a-sug-detail__label">Sources given</span>
        <p class="a-sug-detail__sources">{{ suggestion.parsed.sources }}</p>
      </div>

      <p class="a-sug-detail__submitter">
        <LucideUser :size="14" aria-hidden="true" />
        {{ suggestion.parsed.submitterName || "Anonymous" }}
        <template v-if="suggestion.parsed.submitterEmail">
          <span aria-hidden="true">·</span>
          <LucideMail :size="14" aria-hidden="true" />
          {{ suggestion.parsed.submitterEmail }}
        </template>
        <template v-else>
          <span aria-hidden="true">·</span>
          <LucideMailX :size="14" aria-hidden="true" />
          <span class="a-sug-detail__no-email">no contact email</span>
        </template>
      </p>

      <div class="a-sug-detail__field">
        <label class="a-sug-detail__label" :for="`url-${suggestion.number}`">
          Profile URL
        </label>
        <input
          :id="`url-${suggestion.number}`"
          v-model="profileUrl"
          type="url"
          class="a-sug-detail__input"
          placeholder="https://herstoryafrica.com.ng/women/…"
        >
        <span class="a-sug-detail__hint">
          The page the email links to. Needed to accept, and to mark her
          already listed.
        </span>
      </div>

      <div class="a-sug-detail__field">
        <label class="a-sug-detail__label" :for="`note-${suggestion.number}`">
          Note on the issue <span class="a-sug-detail__optional">optional</span>
        </label>
        <input
          :id="`note-${suggestion.number}`"
          v-model="comment"
          type="text"
          class="a-sug-detail__input"
          placeholder="e.g. Added! Thanks for the suggestion."
        >
      </div>

      <label class="a-sug-detail__check" :class="{ 'a-sug-detail__check--off': !hasEmail }">
        <input v-model="sendEmail" type="checkbox" :disabled="!hasEmail">
        <span>
          {{ hasEmail
            ? "Email the submitter"
            : "No email on file — this closes the issue without notifying anyone" }}
        </span>
      </label>

      <p v-if="error" class="a-sug-detail__error">
        <LucideAlertCircle :size="15" aria-hidden="true" />
        {{ error }}
      </p>

      <div class="a-sug-detail__actions">
        <button
          type="button"
          class="a-sug-detail__btn a-sug-detail__btn--primary a-sug-detail__btn--wide"
          :disabled="busy || !profileUrl.trim()"
          @click="accept"
        >
          <LucideLoader2 v-if="mode === 'accepting'" :size="15" class="a-sug-detail__spin" />
          <LucideCheck v-else :size="15" />
          {{ sendEmail && hasEmail ? "Accept & email" : "Accept & close" }}
        </button>
        <button
          type="button"
          class="a-sug-detail__btn a-sug-detail__btn--secondary"
          :disabled="busy || !profileUrl.trim()"
          @click="markExists"
        >
          <LucideLoader2 v-if="mode === 'existing'" :size="15" class="a-sug-detail__spin" />
          <LucideLibrary v-else :size="15" />
          Already listed
        </button>
        <button
          type="button"
          class="a-sug-detail__btn a-sug-detail__btn--danger"
          :disabled="busy"
          @click="decline"
        >
          <LucideLoader2 v-if="mode === 'declining'" :size="15" class="a-sug-detail__spin" />
          <LucideX v-else :size="15" />
          Reject
        </button>
      </div>

      <a
        class="a-sug-detail__gh"
        :href="suggestion.url"
        target="_blank"
        rel="noopener"
      >
        Open issue on GitHub
        <LucideExternalLink :size="13" aria-hidden="true" />
      </a>
    </template>

    <AdminEmptyState v-else title="Nothing selected">
      Pick a suggestion on the left to review it.
    </AdminEmptyState>
  </aside>
</template>

<script setup lang="ts">
import type { AdminSuggestion } from "~/utils/types/admin";

const props = defineProps<{ suggestion: AdminSuggestion | null }>();
export type SuggestionOutcome = "accepted" | "exists" | "declined";

const emit = defineEmits<{
  done: [{ emailed: boolean; outcome: SuggestionOutcome }];
}>();

const { nameOf, metaOf, ageOf } = useSuggestionDisplay();

const profileUrl = ref("");
const comment = ref("");
const sendEmail = ref(true);
const mode = ref<"idle" | "accepting" | "existing" | "declining">("idle");
const error = ref("");

const busy = computed(() => mode.value !== "idle");
const hasEmail = computed(() => !!props.suggestion?.parsed.submitterEmail);

// Switching suggestions must not carry the previous one's URL or note across —
// pasting the wrong profile link into an acceptance is not recoverable.
watch(
  () => props.suggestion?.number,
  () => {
    profileUrl.value = "";
    comment.value = "";
    error.value = "";
    mode.value = "idle";
    sendEmail.value = true;
  },
);

/**
 * Accept and already-listed post an identical body to sibling endpoints; only
 * the template the server picks differs. Both need the profile URL, because
 * both emails link the submitter to a page.
 */
async function resolveSuggestion(
  route: "accept" | "exists",
  busyMode: "accepting" | "existing",
  outcome: SuggestionOutcome,
) {
  const s = props.suggestion;
  if (!s || !profileUrl.value.trim()) return;

  mode.value = busyMode;
  error.value = "";

  try {
    const res = await $fetch(`/api/admin/suggestions/${s.number}/${route}`, {
      method: "POST",
      body: {
        profileUrl: profileUrl.value.trim(),
        womanName: nameOf(s),
        // Omitted when the box is unticked, which is what stops the email.
        submitterEmail: sendEmail.value ? s.parsed.submitterEmail : undefined,
        submitterName: s.parsed.submitterName,
        comment: comment.value.trim() || undefined,
        close: true,
      },
    });
    emit("done", { emailed: !!res.emailed, outcome });
  } catch {
    error.value = "Something went wrong. The issue was not closed.";
    mode.value = "idle";
  }
}

const accept = () => resolveSuggestion("accept", "accepting", "accepted");
const markExists = () => resolveSuggestion("exists", "existing", "exists");

async function decline() {
  const s = props.suggestion;
  if (!s) return;
  if (!confirm(`Decline and close "${nameOf(s)}"? No email is sent.`)) return;

  mode.value = "declining";
  error.value = "";

  try {
    await $fetch(`/api/admin/suggestions/${s.number}/decline`, { method: "POST" });
    emit("done", { emailed: false, outcome: "declined" });
  } catch {
    error.value = "Couldn't close the issue. Try again.";
    mode.value = "idle";
  }
}
</script>

<style scoped>
.a-sug-detail {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
  align-self: start;
  position: sticky;
  top: 1.5rem;
}

.a-sug-detail__name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.a-sug-detail__meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.125rem 0 0;
}

.a-sug-detail__reason {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.a-sug-detail__raw {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.a-sug-detail__raw summary {
  cursor: pointer;
  font-weight: 600;
}

.a-sug-detail__raw pre {
  margin: 0.5rem 0 0;
  padding: 0.625rem;
  border-radius: 0.5rem;
  background: var(--surface-muted);
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 12rem;
  overflow-y: auto;
}

.a-sug-detail__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.a-sug-detail__label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.a-sug-detail__optional {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.a-sug-detail__sources {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-secondary);
  word-break: break-word;
  margin: 0;
}

.a-sug-detail__submitter {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.a-sug-detail__no-email {
  color: var(--text-gold);
  font-weight: 600;
}

.a-sug-detail__input {
  width: 100%;
  height: 38px;
  padding: 0 0.625rem;
  border: 1.5px solid var(--border-default);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: inherit;
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.a-sug-detail__input:focus {
  outline: none;
  border-color: var(--ring-default);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring-default) 20%, transparent);
}

.a-sug-detail__check {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--text-secondary);
  cursor: pointer;
}

.a-sug-detail__check--off {
  color: var(--text-gold);
  cursor: default;
}

.a-sug-detail__check input {
  margin: 0.125rem 0 0;
  accent-color: var(--color-primary);
}

.a-sug-detail__error {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-crimson-600);
  margin: 0;
}

.dark .a-sug-detail__error {
  color: var(--color-crimson-300);
}

.a-sug-detail__hint {
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--text-muted);
}

/* Accept spans the row; already-listed and reject share the one below. */
.a-sug-detail__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.a-sug-detail__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-width: 0;
  height: 40px;
  padding: 0 0.75rem;
  border-radius: 9999px;
  border: 1.5px solid transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.a-sug-detail__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.a-sug-detail__btn--primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
}

.a-sug-detail__btn--primary:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.a-sug-detail__btn--wide {
  grid-column: 1 / -1;
}

.a-sug-detail__btn--secondary {
  background: transparent;
  border-color: var(--border-default);
  color: var(--text-secondary);
}

.a-sug-detail__btn--secondary:hover:not(:disabled) {
  border-color: var(--ring-default);
  color: var(--color-primary);
}

.a-sug-detail__btn--danger {
  background: transparent;
  border-color: var(--border-default);
  color: var(--text-secondary);
}

.a-sug-detail__btn--danger:hover:not(:disabled) {
  border-color: var(--color-crimson);
  color: var(--color-crimson);
}

.a-sug-detail__spin {
  animation: spin 1s linear infinite;
}

.a-sug-detail__gh {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.a-sug-detail__gh:hover {
  text-decoration: underline;
}

@media (max-width: 1023px) {
  .a-sug-detail {
    position: static;
  }
}
</style>
