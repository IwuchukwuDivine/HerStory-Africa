<template>
  <aside class="a-side">
    <div class="a-side__brand">
      <span class="a-side__mark" aria-hidden="true" />
      <span class="a-side__brand-text">
        <span class="a-side__brand-name">HerStory</span>
        <span class="a-side__brand-sub">Admin</span>
      </span>
    </div>

    <nav class="a-side__nav" aria-label="Admin sections">
      <div v-for="group in groups" :key="group.label" class="a-side__group">
        <span class="a-side__group-label">{{ group.label }}</span>
        <NuxtLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="a-side__item"
          :class="{ 'a-side__item--active': isActive(item.to) }"
        >
          <component :is="item.icon" :size="16" aria-hidden="true" />
          <span class="a-side__item-label">{{ item.label }}</span>
          <span v-if="badgeFor(item.badge)" class="a-side__badge">
            {{ badgeFor(item.badge) }}
          </span>
        </NuxtLink>
      </div>
    </nav>

    <div class="a-side__foot">
      <div class="a-side__user">
        <span class="a-side__avatar" aria-hidden="true">D</span>
        <span class="a-side__user-text">
          <span class="a-side__user-name">Divine</span>
          <span class="a-side__user-role">Owner</span>
        </span>
        <button
          type="button"
          class="a-side__icon-btn"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark()"
        >
          <ClientOnly>
            <LucideSun v-if="isDark" :size="15" />
            <LucideMoon v-else :size="15" />
            <template #fallback><LucideMoon :size="15" /></template>
          </ClientOnly>
        </button>
        <button
          type="button"
          class="a-side__icon-btn"
          aria-label="Log out"
          :disabled="loggingOut"
          @click="logout"
        >
          <LucideLogOut :size="15" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import type { Component } from "vue";
// Auto-imported components resolve in templates only; the nav table holds them
// as values, so they come from #components explicitly.
import {
  LucideBriefcase,
  LucideCheck,
  LucideHouse,
  LucideLightbulb,
  LucideMail,
  LucideRocket,
  LucideSearchX,
  LucideUsers,
} from "#components";

// @vueuse/nuxt is not registered, so VueUse composables are imported directly.
// Same storage key as Navbar.vue, so the console and the public site agree.
const isDark = useDark({ initialValue: "light" });
const toggleDark = useToggle(isDark);

const route = useRoute();
const { data: overview } = useAdminOverview();
const loggingOut = ref(false);

type BadgeKey = "suggestions" | "health" | "opportunities";

interface NavItem {
  to: string;
  label: string;
  icon: Component;
  badge?: BadgeKey;
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LucideHouse }],
  },
  {
    label: "Review",
    items: [
      {
        to: "/admin/suggestions",
        label: "Suggestions",
        icon: LucideLightbulb,
        badge: "suggestions",
      },
      { to: "/admin/ai", label: "AI drafts", icon: LucideRocket },
      {
        to: "/admin/health",
        label: "Content health",
        icon: LucideCheck,
        badge: "health",
      },
    ],
  },
  {
    label: "Grow",
    items: [
      { to: "/admin/analytics", label: "Analytics", icon: LucideUsers },
      { to: "/admin/newsletter", label: "Newsletter", icon: LucideMail },
      {
        to: "/admin/opportunities",
        label: "Opportunities",
        icon: LucideBriefcase,
        badge: "opportunities",
      },
    ],
  },
  {
    label: "Maintain",
    items: [
      { to: "/admin/maintain", label: "Search & links", icon: LucideSearchX },
    ],
  },
];

// /admin must not light up for every child route, so the index is exact-matched.
function isActive(to: string) {
  return to === "/admin" ? route.path === "/admin" : route.path.startsWith(to);
}

function badgeFor(key?: BadgeKey) {
  if (!key) return null;
  const value = overview.value?.badges[key];
  return value ? String(value) : null;
}

async function logout() {
  loggingOut.value = true;
  try {
    await $fetch("/api/admin/logout", { method: "POST" });
  } finally {
    await navigateTo("/admin/login");
  }
}
</script>

<style scoped>
/* The sidebar is deliberately fixed dark in both themes: it is the chrome the
   console sits in, not a surface that should flip with the content. */
.a-side {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem 0.875rem;
  background: var(--color-stone-950);
  color: var(--color-stone-200);
  position: sticky;
  top: 0;
  height: 100vh;
  box-sizing: border-box;
}

.a-side__brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0 0.5rem;
}

.a-side__mark {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  background: var(--gradient-brand);
  flex-shrink: 0;
}

.a-side__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.a-side__brand-name {
  font-size: 0.9375rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.a-side__brand-sub {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-stone-500);
}

.a-side__nav {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.a-side__group {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.a-side__group-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-stone-600);
  padding: 0 0.5rem;
  margin-bottom: 0.1875rem;
}

.a-side__item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 40px;
  padding: 0 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--color-stone-300);
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.a-side__item:hover {
  background: rgb(240 230 216 / 8%);
  color: var(--color-stone-100);
}

.a-side__item--active,
.a-side__item--active:hover {
  background: var(--color-primary);
  color: #fff;
}

.a-side__item-label {
  flex: 1;
  min-width: 0;
}

.a-side__badge {
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.4;
  padding: 0 0.375rem;
  border-radius: 9999px;
  background: rgb(200 148 26 / 18%);
  color: var(--color-secondary);
}

.a-side__item--active .a-side__badge {
  background: rgb(255 255 255 / 22%);
  color: #fff;
}

.a-side__foot {
  border-top: 1px solid rgb(240 230 216 / 12%);
  padding-top: 0.875rem;
}

.a-side__user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.25rem;
}

.a-side__avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--color-stone-800);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-stone-200);
  flex-shrink: 0;
}

.a-side__user-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
}

.a-side__user-name {
  font-size: 0.8125rem;
  font-weight: 600;
}

.a-side__user-role {
  font-size: 0.75rem;
  color: var(--color-stone-500);
}

.a-side__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--color-stone-400);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.a-side__icon-btn:hover:not(:disabled) {
  background: rgb(240 230 216 / 8%);
  color: var(--color-stone-100);
}

.a-side__icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Below the desktop breakpoint the rail becomes a scrolling top bar: the
   groups run inline and the labels carry the meaning on their own. */
@media (max-width: 899px) {
  .a-side {
    position: static;
    height: auto;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    overflow-x: auto;
  }

  .a-side__brand-text,
  .a-side__user-text {
    display: none;
  }

  .a-side__nav {
    flex-direction: row;
    gap: 0.5rem;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .a-side__group {
    flex-direction: row;
    gap: 0.25rem;
  }

  .a-side__group-label {
    display: none;
  }

  .a-side__item {
    white-space: nowrap;
    padding: 0 0.625rem;
  }

  .a-side__foot {
    border-top: none;
    padding-top: 0;
    margin-left: auto;
  }
}
</style>
