<template>
  <div class="an-panel">
    <!-- Not configured -->
    <div
      v-if="statusCode === 503"
      class="an-panel__state an-panel__state--setup"
    >
      <LucideSettings2 :size="26" />
      <p class="an-panel__state-title">Analytics isn't connected yet</p>
      <p class="an-panel__state-text">
        Add <code>NUXT_GA4_PROPERTY_ID</code> and
        <code>NUXT_GA4_CREDENTIALS</code> (service-account JSON) to enable live
        charts.
      </p>
    </div>

    <!-- Other errors -->
    <p
      v-else-if="error"
      class="an-panel__state an-panel__state--error"
    >
      <LucideAlertCircle :size="22" />
      Couldn't load analytics right now.
    </p>

    <!-- Loading -->
    <p v-else-if="status === 'pending'" class="an-panel__state">
      Loading analytics…
    </p>

    <!-- Data -->
    <template v-else-if="data">
      <p class="an-panel__note">
        <LucideInfo :size="15" />
        Last 28 days. Consent mode denies analytics storage by default, so real
        traffic is higher than shown.
      </p>

      <div class="an-panel__tiles">
        <AdminStatTile label="Users" :value="data.totals.totalUsers">
          <template #icon><LucideUsers :size="16" /></template>
        </AdminStatTile>
        <AdminStatTile label="Pageviews" :value="data.totals.screenPageViews">
          <template #icon><LucideEye :size="16" /></template>
        </AdminStatTile>
      </div>

      <section class="an-panel__card">
        <h3 class="an-panel__card-title">Pageviews over time</h3>
        <AdminTrendChart v-if="data.trend.length" :points="data.trend" />
        <p v-else class="an-panel__empty">No data in this range.</p>
      </section>

      <div class="an-panel__cols">
        <section class="an-panel__card">
          <h3 class="an-panel__card-title">Top pages</h3>
          <AdminBarList
            v-if="topPages.length"
            :items="topPages"
          />
          <p v-else class="an-panel__empty">No data.</p>
        </section>

        <section class="an-panel__card">
          <h3 class="an-panel__card-title">Traffic sources</h3>
          <AdminBarList
            v-if="sources.length"
            :items="sources"
          />
          <p v-else class="an-panel__empty">No data.</p>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AdminAnalytics } from "~/utils/types/admin";

const { data, status, error } = useFetch<AdminAnalytics>(
  "/api/admin/analytics",
  { lazy: true },
);

const statusCode = computed(
  () => (error.value as { statusCode?: number } | null)?.statusCode,
);

const topPages = computed(() =>
  (data.value?.topPages ?? []).map((p) => ({
    label: p.path,
    value: p.views,
  })),
);

const sources = computed(() =>
  (data.value?.sources ?? []).map((s) => ({
    label: s.channel,
    value: s.sessions,
  })),
);
</script>

<style scoped>
.an-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.an-panel__note {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0;
}

.an-panel__tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.an-panel__card {
  padding: 1.5rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  box-shadow: var(--shadow-card);
}

.an-panel__card-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.an-panel__cols {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 720px) {
  .an-panel__cols {
    grid-template-columns: 1fr 1fr;
  }
}

.an-panel__empty {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.an-panel__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9375rem;
}

.an-panel__state--error {
  color: var(--color-crimson);
}

.an-panel__state-title {
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.an-panel__state-text {
  max-width: 26rem;
  margin: 0;
  line-height: 1.6;
}

.an-panel__state-text code {
  font-size: 0.8125rem;
  padding: 0.1rem 0.35rem;
  background: var(--surface-muted);
  border-radius: 0.35rem;
}
</style>
