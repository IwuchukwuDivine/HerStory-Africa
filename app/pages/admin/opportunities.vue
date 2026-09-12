<template>
  <div class="op">
    <div class="op__bar">
      <AdminChip
        v-for="f in filters"
        :key="f.key"
        :active="filter === f.key"
        @click="filter = f.key"
      >
        {{ f.label }} {{ f.count }}
      </AdminChip>
      <span class="op__spacer" />
      <span class="op__cron">
        <LucideRefreshCw :size="13" aria-hidden="true" />
        Sourced every Monday by the opportunities workflow
      </span>
    </div>

    <AdminEmptyState v-if="failed" title="Couldn't load opportunities" tone="error">
      <template #icon><LucideAlertCircle :size="24" /></template>
      Try again in a moment.
    </AdminEmptyState>

    <p v-else-if="loading" class="op__loading">Loading opportunities…</p>

    <AdminPanel v-else-if="data">
      <AdminEmptyState v-if="!visible.length" title="Nothing listed here">
        <template #icon><LucideBriefcase :size="24" /></template>
        The Monday cron removes expired listings and opens a PR with new ones.
      </AdminEmptyState>

      <AdminDataTable v-else :columns="columns" :rows="visible" row-key="slug">
        <template #cell-title="{ row }">
          <NuxtLink
            class="op__title"
            :to="`/opportunities/${row.slug}`"
            target="_blank"
          >
            {{ row.title }}
          </NuxtLink>
          <span class="op__org">{{ row.org }}</span>
        </template>
        <template #cell-category="{ row }">
          <AdminTag :tone="categoryTone(row.category)">{{ row.category }}</AdminTag>
        </template>
        <template #cell-status="{ row }">
          <AdminTag :tone="statusTone(row.status)">{{ row.status }}</AdminTag>
        </template>
      </AdminDataTable>
    </AdminPanel>
  </div>
</template>

<script setup lang="ts">
import type {
  AdminOpportunities,
  AdminOpportunityStatus,
} from "~/utils/types/admin";
import type { TableColumn } from "~/components/admin/DataTable.vue";

definePageMeta({ layout: "admin", middleware: "admin" });
useHead({ title: "Opportunities" });

const { data, loading, failed, load } = useAdminData<AdminOpportunities>(
  "opportunities",
  "/api/admin/opportunities",
);
onMounted(() => load());

const search = useAdminSearch();
const header = useAdminHeader();

type FilterKey = "all" | "closing" | "review" | "expired";
const filter = ref<FilterKey>("all");

const columns: TableColumn[] = [
  { key: "title", label: "Opportunity", width: "minmax(0, 2fr)" },
  { key: "category", label: "Category", width: "9rem" },
  { key: "deadlineLabel", label: "Deadline", width: "9rem" },
  { key: "status", label: "Status", width: "8rem" },
];

const filters = computed(() => {
  const c = data.value?.counts;
  return [
    { key: "all" as const, label: "All", count: c?.all ?? 0 },
    { key: "closing" as const, label: "Closing", count: c?.closing ?? 0 },
    { key: "review" as const, label: "Needs review", count: c?.needsReview ?? 0 },
    { key: "expired" as const, label: "Expired", count: c?.expired ?? 0 },
  ];
});

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  return (data.value?.rows ?? []).filter((r) => {
    if (filter.value === "closing" && r.status !== "Closing") return false;
    if (filter.value === "review" && r.status !== "Needs review") return false;
    if (filter.value === "expired" && r.status !== "Expired") return false;
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      r.org.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });
});

function categoryTone(category: string) {
  if (category === "scholarship") return "ok" as const;
  if (category === "fellowship") return "bad" as const;
  if (category === "grant") return "warn" as const;
  return "info" as const;
}

function statusTone(status: AdminOpportunityStatus) {
  if (status === "Open") return "ok" as const;
  if (status === "Closing") return "bad" as const;
  if (status === "Needs review") return "warn" as const;
  return "muted" as const;
}

watchEffect(() => {
  const c = data.value?.counts;
  header.value = {
    title: "Opportunities",
    subtitle: c
      ? `${c.all} listed · ${c.closing} closing within a week`
      : "Scholarships, grants, fellowships and jobs",
    searchable: !!c?.all,
    searchPlaceholder: "Search title or organisation…",
  };
});
</script>

<style scoped>
.op {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.op__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.op__spacer {
  flex: 1;
}

.op__cron {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.op__loading {
  font-size: 0.8125rem;
  color: var(--text-muted);
  padding: 2rem 0;
  text-align: center;
}

.op__title {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
}

.op__title:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.op__org {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
