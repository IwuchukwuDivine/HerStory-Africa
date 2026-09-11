<template>
  <NuxtLayout>
    <div class="error-page">
      <div class="error-page__content">
        <div class="label">
          <span class="rule" />
          <span class="eyebrow eyebrow--muted">Error {{ statusCode }}</span>
        </div>
        <h1 class="error-page__title">
          {{ isNotFound ? "This page is not in the archive." : "Something went wrong." }}
        </h1>
        <p class="error-page__message">
          {{
            isNotFound
              ? "The address may have changed, or the story you are after may be filed under a different name. Search the archive to find it."
              : "An unexpected error occurred. Try again, or head back to the front page."
          }}
        </p>
        <div class="error-page__actions">
          <Pill variant="primary" @click="openSearch">
            <template #icon>
              <LucideSearch :size="16" />
            </template>
            Search the archive
          </Pill>
          <Pill variant="secondary" @click="goHome">
            <template #icon>
              <LucideHome :size="16" />
            </template>
            Go home
          </Pill>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const statusCode = computed(() => props.error?.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);

const searchOpen = useSearchOpen();

useSeoMeta({
  title: () => (isNotFound.value ? "Page not found" : "Something went wrong"),
  robots: "noindex, nofollow",
});

// The global search lives in the navbar, inside the default layout.
function openSearch() {
  searchOpen.value = true;
}

function goHome() {
  clearError({ redirect: "/" });
}
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60dvh;
  padding: 64px 24px;
  background: var(--surface);
}

.error-page__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 34rem;
  gap: 16px;
}

.error-page__title {
  font-size: 36px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.5px;
  color: var(--color-primary);
  margin: 0;
}

.error-page__message {
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.error-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

@media (min-width: 768px) {
  .error-page__title {
    font-size: 44px;
    letter-spacing: -1px;
  }
}
</style>
