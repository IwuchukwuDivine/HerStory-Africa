<template>
  <nav ref="navRef" class="navbar">
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
          type="button"
          class="icon-btn navbar__btn navbar__btn--first"
          aria-label="Search"
          @click="searchOpen = true"
        >
          <LucideSearch :size="18" />
        </button>

        <button
          type="button"
          class="icon-btn navbar__btn"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark()"
        >
          <LucideSun v-if="mounted && isDark" :size="18" />
          <LucideMoon v-else :size="18" />
        </button>
      </div>

      <div class="navbar__mobile-actions">
        <button
          type="button"
          class="icon-btn navbar__btn"
          aria-label="Search"
          @click="searchOpen = true"
        >
          <LucideSearch :size="20" />
        </button>

        <button
          type="button"
          class="icon-btn navbar__btn"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark()"
        >
          <LucideSun v-if="mounted && isDark" :size="20" />
          <LucideMoon v-else :size="20" />
        </button>

        <button
          type="button"
          class="icon-btn navbar__btn"
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
            type="button"
            class="icon-btn drawer__close"
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

  <GlobalSearch :open="searchOpen" @close="searchOpen = false" />
</template>

<script setup lang="ts">
import { useDark, useToggle, useMounted } from "@vueuse/core";

const isDark = import.meta.client
  ? useDark({ initialValue: "light" })
  : ref(false);
const toggleDark = useToggle(isDark);
const mounted = useMounted();

const drawerOpen = ref(false);
const searchOpen = useSearchOpen();
const navRef = ref<HTMLElement | null>(null);

const route = useRoute();
watch(
  () => route.path,
  () => {
    drawerOpen.value = false;
    searchOpen.value = false;
  },
);

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    searchOpen.value = !searchOpen.value;
  }
}

// Publish the rendered nav height as --navbar-height on :root so sticky
// toolbars (reading toolbar, filter rows) can sit directly under it.
let resizeObserver: ResizeObserver | null = null;

function publishNavHeight() {
  const el = navRef.value;
  if (!el) return;
  document.documentElement.style.setProperty(
    "--navbar-height",
    `${Math.round(el.getBoundingClientRect().height)}px`,
  );
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  publishNavHeight();
  if ("ResizeObserver" in window && navRef.value) {
    resizeObserver = new ResizeObserver(publishNavHeight);
    resizeObserver.observe(navRef.value);
  } else {
    window.addEventListener("resize", publishNavHeight);
  }
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("resize", publishNavHeight);
  resizeObserver?.disconnect();
  resizeObserver = null;
});

const navLinks = [
  { to: "/", label: "Home", icon: resolveComponent("LucideHome") },
  { to: "/women", label: "Women", icon: resolveComponent("LucideUsers") },
  { to: "/timeline", label: "Timeline", icon: resolveComponent("LucideClock") },
  {
    to: "/articles",
    label: "Articles",
    icon: resolveComponent("LucideBookOpen"),
  },
  {
    to: "/opportunities",
    label: "Opportunities",
    icon: resolveComponent("LucideRocket"),
  },
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
  padding: calc(var(--top) + 8px) 12px 8px 24px;
}

@media (min-width: 768px) {
  .navbar__inner {
    padding: calc(var(--top) + 10px) 32px 10px;
  }
}

.navbar__logo {
  display: flex;
  align-items: center;
  min-height: 44px;
  text-decoration: none;
}

/* ── Desktop nav ── */
.navbar__desktop {
  display: none;
  align-items: center;
  gap: 4px;
}

@media (min-width: 768px) {
  .navbar__desktop {
    display: flex;
  }
}

.navbar__link {
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

@media (hover: hover) {
  .navbar__link:hover {
    color: var(--text-primary);
    background: var(--surface-muted);
  }
}

.navbar__link.router-link-active {
  color: var(--color-primary);
}

.navbar__btn {
  flex-shrink: 0;
}

.navbar__btn--first {
  margin-left: 8px;
}

/* ── Mobile actions ── */
.navbar__mobile-actions {
  display: flex;
  align-items: center;
}

@media (min-width: 768px) {
  .navbar__mobile-actions {
    display: none;
  }
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
  --shadow-drawer: -8px 0 32px rgba(28, 15, 7, 0.15);
  position: fixed;
  top: 0;
  right: 0;
  z-index: 201;
  width: min(20rem, 85vw);
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--surface-elevated);
  box-shadow: var(--shadow-drawer);
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
  padding: calc(var(--top) + 12px) 12px 12px 20px;
  border-bottom: 1px solid var(--border-light);
}

.drawer__close {
  color: var(--text-muted);
}

.drawer__links {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 2px;
}

.drawer__link {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 48px;
  padding: 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 12px;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

@media (hover: hover) {
  .drawer__link:hover {
    background: var(--surface-muted);
    color: var(--text-primary);
  }
}

.drawer__link.router-link-active {
  background: color-mix(in srgb, var(--color-primary) 12%, var(--surface));
  color: var(--color-primary);
}

.drawer__footer {
  padding: 20px calc(20px + var(--right)) calc(20px + var(--bottom)) 20px;
  border-top: 1px solid var(--border-light);
}

.drawer__tagline {
  font-size: 13px;
  font-style: italic;
  color: var(--text-muted);
  margin: 0;
}
</style>
