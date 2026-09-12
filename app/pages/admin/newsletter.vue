<template>
  <div class="nl">
    <AdminEmptyState v-if="failed" title="Couldn't load the newsletter" tone="error">
      <template #icon><LucideAlertCircle :size="24" /></template>
      Try again in a moment.
    </AdminEmptyState>

    <p v-else-if="loading" class="nl__loading">Loading newsletter…</p>

    <template v-else-if="data">
      <div class="nl__tiles">
        <AdminKpi v-for="k in data.tiles" :key="k.label" :kpi="k" />
      </div>

      <AdminPanel title="Next issue" :meta="nextIssueMeta">
        <div class="nl__next">
          <p class="nl__next-text">
            Drafting is automated: the newsletter workflow runs on the 1st and
            the 15th, builds a draft in Buttondown and commits the edition to
            <code>data/newsletter-log.json</code>. Nothing sends itself.
          </p>
          <a
            class="nl__next-cta"
            href="https://buttondown.com/emails"
            target="_blank"
            rel="noopener"
          >
            Open Buttondown
            <LucideExternalLink :size="13" aria-hidden="true" />
          </a>
        </div>
      </AdminPanel>

      <AdminPanel title="Sent issues" :meta="`${data.sendLog.length} most recent`">
        <AdminEmptyState v-if="!data.sendLog.length" title="Nothing sent yet">
          <template #icon><LucideMail :size="24" /></template>
          The log fills in as the workflow drafts each edition.
        </AdminEmptyState>

        <template v-else>
          <AdminDataTable :columns="columns" :rows="data.sendLog" row-key="no">
            <template #cell-type="{ row }">
              <AdminTag tone="info">{{ row.type }}</AdminTag>
            </template>
          </AdminDataTable>

          <p v-if="data.metricsUnavailable" class="nl__note">
            <LucideInfo :size="14" aria-hidden="true" />
            Open and click rates aren't recorded in the log, and this endpoint
            doesn't read them from Buttondown. Per-issue numbers live in
            Buttondown itself.
          </p>
        </template>
      </AdminPanel>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AdminNewsletter } from "~/utils/types/admin";
import type { TableColumn } from "~/components/admin/DataTable.vue";

definePageMeta({ layout: "admin", middleware: "admin" });
useHead({ title: "Newsletter" });

const { data, loading, failed, load } = useAdminData<AdminNewsletter>(
  "newsletter",
  "/api/admin/newsletter",
);
onMounted(() => load());

const header = useAdminHeader();

const columns: TableColumn[] = [
  { key: "no", label: "Issue", width: "5rem" },
  { key: "subject", label: "Subject", width: "minmax(0, 2fr)" },
  { key: "type", label: "Lead", width: "8rem" },
  { key: "sent", label: "Drafted", width: "7rem" },
];

const nextIssueMeta = computed(() => {
  const latest = data.value?.sendLog[0];
  return latest ? `Last edition: ${latest.subject}` : "No editions yet";
});

watchEffect(() => {
  const subs = data.value?.subscribers;
  header.value = {
    title: "Newsletter",
    subtitle: subs
      ? `${subs.confirmed.toLocaleString("en")} confirmed subscribers · ${subs.pending} awaiting confirmation`
      : "Buttondown is not configured, so subscriber counts are unavailable",
    searchable: false,
    searchPlaceholder: "",
  };
});
</script>

<style scoped>
.nl {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nl__loading {
  font-size: 0.8125rem;
  color: var(--text-muted);
  padding: 2rem 0;
  text-align: center;
}

.nl__tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
  gap: 0.75rem;
}

.nl__next {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
}

.nl__next-text {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 40rem;
  margin: 0;
}

.nl__next-text code {
  font-size: 0.75rem;
  padding: 0.0625rem 0.25rem;
  border-radius: 0.25rem;
  background: var(--surface-muted);
}

.nl__next-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 36px;
  padding: 0 0.875rem;
  border: 1.5px solid var(--border-default);
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
}

.nl__next-cta:hover {
  border-color: var(--ring-default);
}

.nl__note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-light);
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0;
}
</style>
