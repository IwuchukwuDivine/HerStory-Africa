<template>
  <div class="admin">
    <header class="admin__header">
      <div>
        <h1 class="admin__title">Dashboard</h1>
        <p class="admin__subtitle">HerStory Africa · admin</p>
      </div>
      <button class="admin__logout" :disabled="loggingOut" @click="logout">
        <LucideLogOut :size="16" />
        Log out
      </button>
    </header>

    <nav class="admin__tabs">
      <button
        class="admin__tab"
        :class="{ 'admin__tab--active': tab === 'suggestions' }"
        @click="tab = 'suggestions'"
      >
        <LucideLightbulb :size="16" />
        Suggestions
      </button>
      <button
        class="admin__tab"
        :class="{ 'admin__tab--active': tab === 'analytics' }"
        @click="tab = 'analytics'"
      >
        <LucideBarChart3 :size="16" />
        Analytics
      </button>
    </nav>

    <KeepAlive>
      <AdminSuggestionsPanel v-if="tab === 'suggestions'" />
      <AdminAnalyticsPanel v-else />
    </KeepAlive>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

const tab = ref<"suggestions" | "analytics">("suggestions");
const loggingOut = ref(false);

async function logout() {
  loggingOut.value = true;
  try {
    await $fetch("/api/admin/logout", { method: "POST" });
  } finally {
    await navigateTo("/admin/login");
  }
}

useHead({ title: "Dashboard" });
</script>

<style scoped>
.admin {
  max-width: 52rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

@media (min-width: 768px) {
  .admin {
    padding: 2.5rem 2rem 4rem;
  }
}

.admin__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.admin__title {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.admin__subtitle {
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0;
}

.admin__logout {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.admin__logout:hover:not(:disabled) {
  border-color: var(--color-crimson);
  color: var(--color-crimson);
}

.admin__tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.admin__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin__tab:hover {
  border-color: var(--ring-default);
  color: var(--text-primary);
}

.admin__tab--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
}

.admin__tab--active:hover {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
  color: var(--text-on-primary);
}
</style>
