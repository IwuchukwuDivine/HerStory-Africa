<template>
  <div class="hl">
    <AdminEmptyState v-if="failed" title="Couldn't load content health" tone="error">
      <template #icon><LucideAlertCircle :size="24" /></template>
      Try again in a moment.
    </AdminEmptyState>

    <p v-else-if="loading" class="hl__loading">Checking the archive…</p>

    <template v-else-if="data">
      <div class="hl__stats">
        <div class="hl__stat">
          <span class="hl__stat-value hl__stat-value--primary">
            {{ data.totals.needingWork }}
          </span>
          <span class="hl__stat-label">Profiles needing work</span>
        </div>
        <div class="hl__stat">
          <span class="hl__stat-value hl__stat-value--bad">
            {{ data.totals.noPortrait }}
          </span>
          <span class="hl__stat-label">No portrait</span>
        </div>
        <div class="hl__stat">
          <span class="hl__stat-value hl__stat-value--warn">
            {{ data.totals.singleSource }}
          </span>
          <span class="hl__stat-label">One source or none</span>
        </div>
        <div class="hl__stat">
          <span class="hl__stat-value hl__stat-value--warn">
            {{ data.totals.shortBio }}
          </span>
          <span class="hl__stat-label">Bio under 400 words</span>
        </div>
      </div>

      <AdminPanel
        title="Worst first"
        :meta="`${visible.length} of ${data.totals.profiles} profiles`"
      >
        <AdminEmptyState v-if="!visible.length" title="Nothing to fix">
          <template #icon><LucideCheck :size="24" /></template>
          Every profile has a portrait, at least two sources and a full
          biography.
        </AdminEmptyState>

        <AdminDataTable
          v-else
          :columns="columns"
          :rows="visible"
          row-key="slug"
        >
          <template #cell-name="{ row }">
            <NuxtLink class="hl__name" :to="`/women/${row.slug}`" target="_blank">
              {{ row.name }}
            </NuxtLink>
          </template>
          <template #cell-portrait="{ row }">
            <AdminTag :tone="row.portrait">
              {{ row.portrait === "ok" ? "Yes" : "Missing" }}
            </AdminTag>
          </template>
          <template #cell-sources="{ row }">
            <AdminTag :tone="row.sources">{{ row.sourceLabel }}</AdminTag>
          </template>
          <template #cell-bio="{ row }">
            <AdminTag :tone="row.bio">{{ row.bioLabel }}</AdminTag>
          </template>
        </AdminDataTable>
      </AdminPanel>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AdminHealth } from "~/utils/types/admin";
import type { TableColumn } from "~/components/admin/DataTable.vue";

definePageMeta({ layout: "admin", middleware: "admin" });
useHead({ title: "Content health" });

const { data, loading, failed, load } = useAdminData<AdminHealth>(
  "health",
  "/api/admin/health",
);
onMounted(() => load());

const search = useAdminSearch();
const header = useAdminHeader();

const columns: TableColumn[] = [
  { key: "name", label: "Profile", width: "minmax(0, 1.6fr)" },
  { key: "region", label: "Region", width: "minmax(0, 1fr)" },
  { key: "portrait", label: "Photo", width: "7rem" },
  { key: "sources", label: "Sources", width: "8rem" },
  { key: "bio", label: "Bio", width: "7rem" },
];

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  const rows = data.value?.rows ?? [];
  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q),
  );
});

watchEffect(() => {
  const t = data.value?.totals;
  header.value = {
    title: "Content health",
    subtitle: t
      ? `${t.needingWork} of ${t.profiles} profiles are missing something`
      : "Checking every profile for gaps",
    searchable: !!t?.needingWork,
    searchPlaceholder: "Search name or region…",
  };
});
</script>

<style scoped>
.hl {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hl__loading {
  font-size: 0.8125rem;
  color: var(--text-muted);
  padding: 2rem 0;
  text-align: center;
}

.hl__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem;
}

.hl__stat {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.875rem 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
}

.hl__stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.hl__stat-value--primary {
  color: var(--color-primary);
}

.hl__stat-value--bad {
  color: var(--color-crimson-600);
}

.dark .hl__stat-value--bad {
  color: var(--color-crimson-300);
}

.hl__stat-value--warn {
  color: var(--text-gold);
}

.hl__stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.hl__name {
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
}

.hl__name:hover {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
