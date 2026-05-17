<template>
  <section class="hero">
    <div class="hero__content">
      <Logo size="3.5rem" class="hero__logo" />
      <h1 class="hero__tagline">
        The women history
        <span class="hero__tagline-accent">forgot</span>
        to teach you.
      </h1>
      <p class="hero__subtitle">
        An archive of African women who fought for equality, rights, and change.
      </p>

      <div ref="searchWrapperRef" class="hero__search-wrapper">
        <SearchBar
          v-model="searchQuery"
          placeholder="Search women, causes, countries…"
          class="hero__search"
          @submit="handleSearch"
        />
        <HomeSearchResults
          v-if="searchQuery.trim().length >= 2"
          :query="searchQuery"
          @select="searchQuery = ''"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";

const router = useRouter();
const searchQuery = ref("");
const searchWrapperRef = ref<HTMLElement>();

onClickOutside(searchWrapperRef, () => {
  searchQuery.value = "";
});

function handleSearch() {
  if (!searchQuery.value.trim()) return;
  router.push({ path: "/women", query: { q: searchQuery.value.trim() } });
  searchQuery.value = "";
}
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70dvh;
  padding: 4rem 1.5rem;
  background: linear-gradient(
    165deg,
    var(--surface) 0%,
    var(--surface-muted) 50%,
    var(--surface-subtle) 100%
  );
}

.hero__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 44rem;
  gap: 1.25rem;
}

.hero__logo {
  margin-bottom: 0.5rem;
}

.hero__tagline {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--text-primary);
  margin: 0;
}

.hero__tagline-accent {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-style: italic;
}

.hero__subtitle {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
  max-width: 32rem;
}

.hero__search-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.hero__search {
  width: 100%;
}
</style>
