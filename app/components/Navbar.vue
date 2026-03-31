<template>
  <nav class="navbar">
    <div class="navbar__inner">
      <NuxtLink to="/" class="navbar__logo" aria-label="HerStory Africa home">
        <Logo size="2.25rem" />
      </NuxtLink>

      <div class="navbar__desktop">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="navbar__link"
        >
          {{ link.label }}
        </NuxtLink>

        <button
          class="navbar__theme-btn"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark()"
        >
          <LucideSun v-if="mounted && isDark" :size="18" />
          <LucideMoon v-else :size="18" />
        </button>
      </div>

      <div class="navbar__mobile-actions">
        <button
          class="navbar__theme-btn"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark()"
        >
          <LucideSun v-if="mounted && isDark" :size="18" />
          <LucideMoon v-else :size="18" />
        </button>

        <button
          class="navbar__hamburger"
          aria-label="Open menu"
          @click="drawerOpen = true"
        >
          <LucideMenu :size="22" />
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile drawer -->
  <Teleport to="body">
    <Transition name="drawer-overlay">
      <div
        v-if="drawerOpen"
        class="drawer-overlay"
        @click="drawerOpen = false"
      />
    </Transition>

    <Transition name="drawer-panel">
      <aside v-if="drawerOpen" class="drawer">
        <div class="drawer__header">
          <Logo size="2rem" />
          <button
            class="drawer__close"
            aria-label="Close menu"
            @click="drawerOpen = false"
          >
            <LucideX :size="20" />
          </button>
        </div>

        <div class="drawer__links">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="drawer__link"
            @click="drawerOpen = false"
          >
            <component :is="link.icon" :size="20" />
            {{ link.label }}
          </NuxtLink>
        </div>

        <div class="drawer__footer">
          <p class="drawer__tagline">The women history forgot to teach you.</p>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useDark, useToggle, useMounted } from "@vueuse/core";

const isDark = import.meta.client
  ? useDark({ initialValue: "light" })
  : ref(false);
const toggleDark = useToggle(isDark);
const mounted = useMounted();

const drawerOpen = ref(false);

const route = useRoute();
watch(
  () => route.path,
  () => {
    drawerOpen.value = false;
  },
);

const navLinks = [
  { to: "/", label: "Home", icon: resolveComponent("LucideHome") },
  { to: "/women", label: "Women", icon: resolveComponent("LucideUsers") },
  {
    to: "/articles",
    label: "Articles",
    icon: resolveComponent("LucideBookOpen"),
  },
  {
    to: "/collections",
    label: "Collections",
    icon: resolveComponent("LucideLayoutGrid"),
  },
  { to: "/timeline", label: "Timeline", icon: resolveComponent("LucideClock") },
  {
    to: "/favorites",
    label: "Favorites",
    icon: resolveComponent("LucideHeart"),
  },
  { to: "/about", label: "About", icon: resolveComponent("LucideInfo") },
];
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: color-mix(in srgb, var(--surface-elevated) 85%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 64rem;
  margin: 0 auto;
  padding: calc(env(safe-area-inset-top, 0px) + 0.75rem) 1.5rem 0.75rem;
}

.navbar__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

/* ── Desktop nav ── */
.navbar__desktop {
  display: none;
  align-items: center;
  gap: 0.25rem;
}

@media (min-width: 768px) {
  .navbar__desktop {
    display: flex;
  }
}

.navbar__link {
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 0.5rem;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.navbar__link:hover {
  color: var(--text-primary);
  background: var(--surface-muted);
}

.navbar__link.router-link-active {
  color: var(--color-primary);
}

.navbar__theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  transition:
    color 0.15s ease,
    background 0.15s ease;
  margin-left: 0.25rem;
}

.navbar__theme-btn:hover {
  color: var(--color-secondary);
  background: var(--surface-muted);
}

/* ── Mobile actions ── */
.navbar__mobile-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

@media (min-width: 768px) {
  .navbar__mobile-actions {
    display: none;
  }
}

.navbar__hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.navbar__hamburger:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

/* ── Drawer overlay ── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--overlay-default);
}

.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

/* ── Drawer panel ── */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 201;
  width: min(20rem, 85vw);
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--surface-elevated);
  box-shadow: -8px 0 32px rgba(28, 15, 7, 0.15);
}

.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(100%);
}

.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 0px) + 1rem) 1.25rem 1rem;
  border-bottom: 1px solid var(--border-light);
}

.drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.drawer__close:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.drawer__links {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 0.75rem;
  gap: 0.25rem;
}

.drawer__link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 0.75rem;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.drawer__link:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.drawer__link.router-link-active {
  background: var(--color-primary-50);
  color: var(--color-primary);
}

.drawer__footer {
  padding: 1.25rem;
  border-top: 1px solid var(--border-light);
}

.drawer__tagline {
  font-size: 0.8125rem;
  font-style: italic;
  color: var(--text-muted);
  margin: 0;
}
</style>
