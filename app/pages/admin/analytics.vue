<template>
  <div class="an">
    <AdminEmptyState
      v-if="notConfigured"
      title="Analytics isn't connected yet"
    >
      <template #icon><LucideSettings2 :size="24" /></template>
      Set <code>NUXT_GA4_PROPERTY_ID</code> and
      <code>NUXT_GA4_CREDENTIALS</code> to pull reader numbers from Google
      Analytics 4.
    </AdminEmptyState>

    <AdminEmptyState v-else-if="failed" title="Couldn't load analytics" tone="error">
      <template #icon><LucideAlertCircle :size="24" /></template>
      Google Analytics didn't answer. Try again in a moment.
    </AdminEmptyState>

    <p v-else-if="loading" class="an__loading">Loading analytics…</p>

    <template v-else-if="data">
      <p class="an__note">
        <LucideInfo :size="14" aria-hidden="true" />
        Consent mode denies analytics storage by default, so real traffic is
        higher than shown.
      </p>

      <div class="an__tiles">
        <AdminKpi v-for="k in tiles" :key="k.label" :kpi="k" />
      </div>

      <AdminPanel title="Readers, last 28 days" :meta="peakLabel">
        <div class="an__chart">
          <AdminSparkbars
            v-if="data.trend.length"
            :values="data.trend.map((d) => d.views)"
            :labels="trendLabels"
            unit="page views"
          />
          <AdminEmptyState v-else title="No data in this range" />
        </div>
      </AdminPanel>

      <div class="an__cols">
        <AdminPanel title="Top pages">
          <div v-if="data.topPages.length" class="an__bars">
            <AdminBarRow
              v-for="p in data.topPages"
              :key="p.path"
              :label="p.path"
              :value="p.views"
              :max="pageMax"
            />
          </div>
          <AdminEmptyState v-else title="No page data" />
        </AdminPanel>

        <AdminPanel title="Where readers come from">
          <div v-if="data.sources.length" class="an__bars">
            <AdminBarRow
              v-for="s in data.sources"
              :key="s.channel"
              :label="s.channel"
              :value="s.sessions"
              :max="sourceMax"
            />
          </div>
          <AdminEmptyState v-else title="No channel data" />
        </AdminPanel>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AdminAnalytics, AdminKpi } from "~/utils/types/admin";

definePageMeta({ layout: "admin", middleware: "admin" });
useHead({ title: "Analytics" });

const { data, errorCode, loading, failed, load } = useAdminData<AdminAnalytics>(
  "analytics",
  "/api/admin/analytics",
);
onMounted(() => load());

const header = useAdminHeader();

// 503 means GA4 was never configured, which is a setup prompt rather than a
// failure — the same distinction the previous dashboard drew.
const notConfigured = computed(() => errorCode.value === 503 && !data.value);

const DAY_FMT = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

// GA returns YYYYMMDD; anything else passes through untouched.
function formatDay(date: string) {
  if (date.length !== 8) return date;
  return DAY_FMT.format(
    new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T00:00:00`),
  );
}

// A label under all 28 bars is unreadable, so only every seventh is kept.
const trendLabels = computed(() =>
  (data.value?.trend ?? []).map((d, i) => (i % 7 === 0 ? formatDay(d.date) : "")),
);

const peakLabel = computed(() => {
  const trend = data.value?.trend ?? [];
  if (!trend.length) return "";
  const peak = trend.reduce((a, b) => (b.views > a.views ? b : a));
  return `Peak ${peak.views.toLocaleString("en")} on ${formatDay(peak.date)}`;
});

const tiles = computed<AdminKpi[]>(() => {
  const d = data.value;
  if (!d) return [];
  const users = d.totals.totalUsers;
  const views = d.totals.screenPageViews;
  return [
    {
      label: "Readers",
      value: users.toLocaleString("en"),
      delta: "",
      note: "unique users, 28 days",
      up: true,
    },
    {
      label: "Page views",
      value: views.toLocaleString("en"),
      delta: "",
      note: "28 days",
      up: true,
    },
    {
      label: "Pages per reader",
      value: users ? (views / users).toFixed(1) : "—",
      delta: "",
      note: users ? "views ÷ readers" : "no readers in range",
      up: true,
    },
    {
      label: "Channels",
      value: String(d.sources.length),
      delta: "",
      note: "sources sending traffic",
      up: true,
    },
  ];
});

const pageMax = computed(() =>
  Math.max(1, ...(data.value?.topPages ?? []).map((p) => p.views)),
);
const sourceMax = computed(() =>
  Math.max(1, ...(data.value?.sources ?? []).map((s) => s.sessions)),
);

watchEffect(() => {
  header.value = {
    title: "Analytics",
    subtitle: "Google Analytics 4 · last 28 days",
    searchable: false,
    searchPlaceholder: "",
  };
});
</script>

<style scoped>
.an {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.an__loading {
  font-size: 0.8125rem;
  color: var(--text-muted);
  padding: 2rem 0;
  text-align: center;
}

.an__note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.an__tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
  gap: 0.75rem;
}

.an__chart,
.an__bars {
  padding: 1rem;
}

.an__bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.an__cols {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: start;
}

@media (min-width: 900px) {
  .an__cols {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
