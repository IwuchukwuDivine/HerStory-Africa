<template>
  <div class="ov">
    <p v-if="data?.unavailable.length" class="ov__warn">
      <LucideAlertTriangle :size="15" aria-hidden="true" />
      Couldn't reach {{ listSources(data.unavailable) }}. Those figures show a
      dash rather than a zero.
    </p>

    <AdminEmptyState
      v-if="failed"
      title="Couldn't load the dashboard"
      tone="error"
    >
      <template #icon><LucideAlertCircle :size="24" /></template>
      Try again in a moment. If it keeps failing, check the admin session and
      the GitHub token.
    </AdminEmptyState>

    <p v-else-if="loading" class="ov__loading">Loading dashboard…</p>

    <template v-else-if="data">
      <div class="ov__kpis">
        <AdminKpi v-for="k in data.kpis" :key="k.label" :kpi="k" />
      </div>

      <div class="ov__cols">
        <AdminPanel
          title="Needs your attention"
          :meta="`${data.queue.length} ${data.queue.length === 1 ? 'item' : 'items'}`"
        >
          <AdminAttentionQueue v-if="data.queue.length" :items="data.queue" />
          <AdminEmptyState v-else title="Nothing is waiting">
            <template #icon><LucideCheck :size="24" /></template>
            Every portrait, source and deadline is accounted for.
          </AdminEmptyState>
        </AdminPanel>

        <div class="ov__side">
          <AdminPanel title="Archive growth" :meta="growthMeta">
            <div class="ov__chart">
              <AdminSparkbars
                :values="data.growth.map((g) => g.count)"
                :labels="data.growth.map((g) => g.label)"
                unit="profiles"
              />
            </div>
          </AdminPanel>

          <AdminPanel title="Top pages" meta="Last 28 days">
            <div v-if="data.topPages.length" class="ov__bars">
              <AdminBarRow
                v-for="p in data.topPages"
                :key="p.path"
                :label="p.path"
                :value="p.views"
                :max="topPageMax"
              />
            </div>
            <AdminEmptyState v-else title="No analytics yet">
              <template #icon><LucideBarChart3 :size="24" /></template>
              Connect GA4 with <code>NUXT_GA4_PROPERTY_ID</code> and
              <code>NUXT_GA4_CREDENTIALS</code> to see traffic here.
            </AdminEmptyState>
          </AdminPanel>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });
useHead({ title: "Dashboard" });

// The layout already kicked this off for the sidebar badges; the loader is
// guarded, so landing here reuses that payload instead of refetching.
const { data, loading, failed, load } = useAdminOverview();
onMounted(() => load());

const header = useAdminHeader();
watchEffect(() => {
  const profiles = data.value?.kpis[0]?.value;
  header.value = {
    title: "Dashboard",
    subtitle: profiles
      ? `${profiles} profiles · everything that needs you, in one place`
      : "Everything that needs you, in one place",
    searchable: false,
    searchPlaceholder: "",
  };
});

const topPageMax = computed(() =>
  Math.max(1, ...(data.value?.topPages ?? []).map((p) => p.views)),
);

const growthMeta = computed(() => {
  const g = data.value?.growth ?? [];
  const year = g.reduce((sum, m) => sum + m.count, 0);
  return `${year} added in the last 12 months`;
});

function listSources(sources: string[]) {
  if (sources.length === 1) return sources[0];
  return `${sources.slice(0, -1).join(", ")} and ${sources.at(-1)}`;
}
</script>

<style scoped>
.ov {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ov__warn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--color-secondary) 14%, var(--surface));
  color: var(--text-gold);
  font-size: 0.8125rem;
  font-weight: 600;
  margin: 0;
}

.ov__loading {
  font-size: 0.8125rem;
  color: var(--text-muted);
  padding: 2rem 0;
  text-align: center;
}

.ov__kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
  gap: 0.75rem;
}

.ov__cols {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: start;
}

@media (min-width: 1100px) {
  .ov__cols {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  }
}

.ov__side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ov__chart,
.ov__bars {
  padding: 1rem;
}

.ov__bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
