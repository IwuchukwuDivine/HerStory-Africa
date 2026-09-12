<template>
  <div class="sug">
    <div class="sug__bar">
      <AdminChip
        v-for="f in filters"
        :key="f.key"
        :active="filter === f.key"
        @click="filter = f.key"
      >
        {{ f.label }} {{ f.count }}
      </AdminChip>
      <span class="sug__spacer" />
      <button
        type="button"
        class="sug__refresh"
        :disabled="status === 'pending'"
        @click="refresh()"
      >
        <LucideRefreshCw
          :size="14"
          :class="status === 'pending' && 'sug__spin'"
          aria-hidden="true"
        />
        Refresh
      </button>
    </div>

    <p v-if="toast" class="sug__toast">
      <LucideCheck :size="15" aria-hidden="true" />
      {{ toast }}
    </p>

    <AdminEmptyState v-if="failed" title="Couldn't load suggestions" tone="error">
      <template #icon><LucideAlertCircle :size="24" /></template>
      Check the GitHub token and try again.
    </AdminEmptyState>

    <p v-else-if="loading" class="sug__loading">Loading suggestions…</p>

    <AdminEmptyState
      v-else-if="!data?.length"
      title="No open suggestions right now"
    >
      New submissions arrive as GitHub issues labelled <code>suggestion</code>.
    </AdminEmptyState>

    <div v-else class="sug__cols">
      <AdminPanel>
        <AdminEmptyState v-if="!visible.length" title="Nothing matches that filter">
          Clear the filter or the search box to see the rest.
        </AdminEmptyState>
        <AdminSuggestionList
          v-else
          :items="visible"
          :active-number="activeNumber"
          @select="activeNumber = $event"
        />
      </AdminPanel>

      <AdminSuggestionDetail :suggestion="active" @done="onDone" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminSuggestion } from "~/utils/types/admin";
import type { SuggestionOutcome } from "~/components/admin/SuggestionDetail.vue";

definePageMeta({ layout: "admin", middleware: "admin" });
useHead({ title: "Suggestions" });

const { data, status, loading, failed, load, refresh } = useAdminData<
  AdminSuggestion[]
>("suggestions", "/api/admin/suggestions");
onMounted(() => load());

const { nameOf, statusOf } = useSuggestionDisplay();
const search = useAdminSearch();
const header = useAdminHeader();

type FilterKey = "all" | "new" | "no-email" | "raw";
const filter = ref<FilterKey>("all");
const activeNumber = ref<number | null>(null);
const toast = ref("");

const items = computed(() => data.value ?? []);

const isNew = (s: AdminSuggestion) =>
  Date.now() - new Date(s.createdAt).getTime() < 7 * 86_400_000;

const counts = computed(() => ({
  all: items.value.length,
  new: items.value.filter(isNew).length,
  "no-email": items.value.filter((s) => statusOf(s).label === "No email").length,
  raw: items.value.filter((s) => statusOf(s).label === "Raw").length,
}));

const filters = computed(() => [
  { key: "all" as const, label: "All", count: counts.value.all },
  { key: "new" as const, label: "New", count: counts.value.new },
  { key: "no-email" as const, label: "Missing email", count: counts.value["no-email"] },
  { key: "raw" as const, label: "Unparsed", count: counts.value.raw },
]);

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  return items.value.filter((s) => {
    if (filter.value === "new" && !isNew(s)) return false;
    if (filter.value === "no-email" && statusOf(s).label !== "No email") return false;
    if (filter.value === "raw" && statusOf(s).label !== "Raw") return false;
    if (!q) return true;
    return (
      nameOf(s).toLowerCase().includes(q) ||
      (s.parsed.reason ?? "").toLowerCase().includes(q) ||
      (s.parsed.country ?? "").toLowerCase().includes(q) ||
      String(s.number).includes(q)
    );
  });
});

const active = computed(
  () => visible.value.find((s) => s.number === activeNumber.value) ?? null,
);

// Keep a selection alive as the list changes — after a filter change or an
// accept, fall back to the first row rather than leaving the pane empty.
watchEffect(() => {
  if (!visible.value.length) {
    activeNumber.value = null;
  } else if (!visible.value.some((s) => s.number === activeNumber.value)) {
    activeNumber.value = visible.value[0]!.number;
  }
});

watchEffect(() => {
  const open = items.value.length;
  header.value = {
    title: "Suggestions",
    subtitle: `${open} open · submitted through the site, filed as GitHub issues`,
    searchable: open > 0,
    searchPlaceholder: "Search name, country, reason…",
  };
});

const OUTCOME_COPY: Record<SuggestionOutcome, [string, string]> = {
  accepted: ["Accepted and the submitter was emailed.", "Accepted. No email was sent."],
  exists: [
    "Closed as already listed, and the submitter was pointed at her profile.",
    "Closed as already listed. No email was sent.",
  ],
  declined: ["Rejected and closed.", "Rejected and closed. No email is ever sent."],
};

async function onDone({
  emailed,
  outcome,
}: {
  emailed: boolean;
  outcome: SuggestionOutcome;
}) {
  toast.value = OUTCOME_COPY[outcome][emailed ? 0 : 1];
  await refresh();
  setTimeout(() => (toast.value = ""), 6000);
}
</script>

<style scoped>
.sug {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sug__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sug__spacer {
  flex: 1;
}

.sug__refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 36px;
  padding: 0 0.75rem;
  border: 1.5px solid var(--border-default);
  border-radius: 9999px;
  background: transparent;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

.sug__refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sug__spin {
  animation: spin 1s linear infinite;
}

.sug__toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--color-forest) 14%, var(--surface));
  color: var(--color-forest);
  font-size: 0.8125rem;
  font-weight: 600;
  margin: 0;
}

.dark .sug__toast {
  color: var(--color-forest-300);
}

.sug__loading {
  font-size: 0.8125rem;
  color: var(--text-muted);
  padding: 2rem 0;
  text-align: center;
}

.sug__cols {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .sug__cols {
    grid-template-columns: minmax(0, 1fr) 22rem;
  }
}
</style>
