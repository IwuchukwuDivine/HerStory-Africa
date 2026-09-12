<template>
  <div class="admin-shell">
    <AdminSidebar />
    <main class="admin-shell__main">
      <AdminTopbar :show-range="showRange" />
      <div class="admin-shell__body">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
useHead({
  meta: [{ name: "robots", content: "noindex,nofollow" }],
});

const route = useRoute();

// One request for the whole console: the sidebar badges and the dashboard read
// the same shared state, and the loader no-ops once it has resolved.
const { load } = useAdminOverview();
onMounted(() => load());

// Only the two views backed by the fixed 28-day GA4 window advertise it.
const showRange = computed(
  () => route.path === "/admin" || route.path === "/admin/analytics",
);
</script>

<style scoped>
.admin-shell {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  min-height: 100dvh;
  background: var(--surface);
  color: var(--text-primary);
}

.admin-shell__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-shell__body {
  padding: 1.5rem;
  flex: 1;
}

@media (max-width: 899px) {
  .admin-shell {
    grid-template-columns: 1fr;
    /* Without explicit rows, `min-height: 100dvh` plus two implicit `auto`
       rows makes align-content stretch both, so the collapsed sidebar was
       given a share of the leftover height (303px for 40px of content).
       The bar takes what it needs; the view takes the rest. */
    grid-template-rows: auto 1fr;
  }

  .admin-shell__body {
    padding: 1rem;
  }
}
</style>
