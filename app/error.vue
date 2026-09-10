<template>
  <div class="error-page">
    <div class="error-page__content">
      <span class="error-page__code">{{ error?.statusCode ?? 500 }}</span>
      <h1 class="error-page__title">
        {{
          error?.statusCode === 404 ? "Page not found" : "Something went wrong"
        }}
      </h1>
      <p class="error-page__message">
        {{
          error?.statusCode === 404
            ? "The page you are looking for does not exist or has been moved."
            : "An unexpected error occurred. Please try again."
        }}
      </p>
      <div class="error-page__actions">
        <button
          class="error-page__btn error-page__btn--primary"
          @click="handleClear"
        >
          <LucideHome :size="16" />
          Go home
        </button>
        <button
          v-if="error?.statusCode !== 404"
          class="error-page__btn error-page__btn--secondary"
          @click="handleClear"
        >
          <LucideRefreshCw :size="16" />
          Try again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

useSeoMeta({
  title: () =>
    props.error?.statusCode === 404 ? "Page not found" : "Something went wrong",
  robots: "noindex, nofollow",
});

function handleClear() {
  clearError({ redirect: "/" });
}
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 2rem;
  background: var(--surface);
}

.error-page__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 28rem;
  gap: 0.75rem;
}

.error-page__code {
  font-size: clamp(4rem, 12vw, 7rem);
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-page__title {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.error-page__message {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-muted);
  margin: 0;
}

.error-page__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.error-page__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: none;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.error-page__btn:hover {
  transform: translateY(-1px);
}

.error-page__btn--primary {
  background: var(--color-primary);
  color: var(--text-on-primary);
  box-shadow: var(--shadow-soft);
}

.error-page__btn--primary:hover {
  box-shadow: var(--shadow-glow);
}

.error-page__btn--secondary {
  background: var(--surface-elevated);
  color: var(--text-secondary);
  border: 1.5px solid var(--border-default);
}

.error-page__btn--secondary:hover {
  border-color: var(--ring-default);
  color: var(--color-primary);
}
</style>
