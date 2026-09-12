<template>
  <div class="ai">
    <p class="ai__banner">
      <LucideShieldCheck :size="15" aria-hidden="true" />
      Nothing here publishes without you. Generated text still needs its sources
      checked against the archive.
    </p>

    <div class="ai__tiles">
      <AdminKpi
        :kpi="{
          label: 'Entries generated',
          value: data ? data.entries.toLocaleString('en') : '—',
          delta: '',
          note: 'tracked in the content-hash log',
          up: true,
        }"
      />
      <AdminKpi
        :kpi="{
          label: 'Awaiting review',
          value: '0',
          delta: '',
          note: 'no approval queue exists',
          up: false,
        }"
      />
      <AdminKpi
        :kpi="{
          label: 'Last run',
          value: '—',
          delta: '',
          note: 'the log records no timestamp',
          up: false,
        }"
      />
    </div>

    <AdminPanel title="Draft queue" meta="Not wired up yet">
      <AdminEmptyState title="There is no approval queue">
        <template #icon><LucideRocket :size="24" /></template>
        <code>scripts/generate-ai-content.mjs</code> writes straight to
        <code>public/ai-content.json</code>, which
        <code>AiAssistant.vue</code> reads at runtime. Generated content is live
        the moment the script commits it, so nothing is ever pending here.
        <br><br>
        Making this view real needs the script to write pending entries to a
        separate file and an endpoint that promotes an approved entry into
        <code>ai-content.json</code> — which means a write path back into the
        repository, since the site has no database.
      </AdminEmptyState>
    </AdminPanel>
  </div>
</template>

<script setup lang="ts">
import type { AdminAiStatus } from "~/utils/types/admin";

definePageMeta({ layout: "admin", middleware: "admin" });
useHead({ title: "AI drafts" });

const { data, load } = useAdminData<AdminAiStatus>("ai", "/api/admin/ai");
onMounted(() => load());

const header = useAdminHeader();

watchEffect(() => {
  header.value = {
    title: "AI drafts",
    subtitle: "Nothing waiting · generated content publishes without a review step",
    searchable: false,
    searchPlaceholder: "",
  };
});
</script>

<style scoped>
.ai {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai__banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--color-primary) 10%, var(--surface));
  color: var(--text-secondary);
  font-size: 0.8125rem;
  margin: 0;
}

.ai__tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
  gap: 0.75rem;
}
</style>
