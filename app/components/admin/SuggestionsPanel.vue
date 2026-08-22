<template>
  <div class="sug-panel">
    <div class="sug-panel__bar">
      <p class="sug-panel__count">
        {{ suggestions?.length ?? 0 }} open
        {{ (suggestions?.length ?? 0) === 1 ? "suggestion" : "suggestions" }}
      </p>
      <button
        class="sug-panel__refresh"
        :disabled="status === 'pending'"
        @click="refresh()"
      >
        <LucideRefreshCw
          :size="15"
          :class="{ 'sug-panel__spin': status === 'pending' }"
        />
        Refresh
      </button>
    </div>

    <p v-if="error" class="sug-panel__state sug-panel__state--error">
      <LucideAlertCircle :size="18" />
      Couldn't load suggestions. Check the GitHub token and try again.
    </p>

    <p v-else-if="status === 'pending'" class="sug-panel__state">
      Loading suggestions…
    </p>

    <p v-else-if="!suggestions?.length" class="sug-panel__state">
      <LucideInbox :size="28" />
      No open suggestions right now.
    </p>

    <div v-else class="sug-panel__list">
      <AdminSuggestionCard
        v-for="s in suggestions"
        :key="s.number"
        :suggestion="s"
        @done="refresh()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminSuggestion } from "~/utils/types/admin";

const {
  data: suggestions,
  status,
  error,
  refresh,
} = useFetch<AdminSuggestion[]>("/api/admin/suggestions", {
  lazy: true,
});
</script>

<style scoped>
.sug-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sug-panel__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sug-panel__count {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
}

.sug-panel__refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sug-panel__refresh:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.sug-panel__spin {
  animation: spin 0.8s linear infinite;
}

.sug-panel__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9375rem;
}

.sug-panel__state--error {
  color: var(--color-crimson);
}

.sug-panel__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
