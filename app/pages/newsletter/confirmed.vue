<template>
  <div class="confirmed">
    <div class="confirmed__icon-wrap">
      <LucideCheckCircle :size="48" class="confirmed__icon" />
    </div>

    <h1 class="confirmed__title">You're in.</h1>

    <p class="confirmed__lead">
      Your subscription is confirmed. From here on, the stories of remarkable
      African women will land straight in your inbox.
    </p>

    <div class="confirmed__actions">
      <NuxtLink to="/women" class="confirmed__btn confirmed__btn--primary">
        Start exploring stories
      </NuxtLink>
      <NuxtLink to="/" class="confirmed__btn confirmed__btn--secondary">
        Back to home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setSubscribed } = useApp();
setSubscribed("confirmed");

useSeoMeta({
  title: "Subscription Confirmed",
  description:
    "You're officially part of HerStory Africa. Stories of remarkable African women are on their way to your inbox.",
  ogTitle: "Subscription Confirmed — HerStory Africa",
  ogDescription:
    "You're officially part of HerStory Africa. Stories of remarkable African women are on their way to your inbox.",
  ogImage: "https://herstoryafrica.com.ng/og-image.png",
});
</script>

<style scoped>
.confirmed {
  max-width: 34rem;
  margin: 0 auto;
  padding: 4rem 1.5rem 5rem;
  text-align: center;
}

@media (min-width: 768px) {
  .confirmed {
    padding: 6rem 2rem 7rem;
  }
}

.confirmed__icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.confirmed__icon {
  color: var(--color-forest);
}

.confirmed__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.confirmed__lead {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 1rem auto 0;
  max-width: 28rem;
}

.confirmed__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2.5rem;
}

@media (min-width: 480px) {
  .confirmed__actions {
    flex-direction: row;
    justify-content: center;
  }
}

.confirmed__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 0.5rem;
  text-decoration: none;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;
}

.confirmed__btn--primary {
  color: var(--text-on-primary);
  background: var(--color-primary);
}

.confirmed__btn--primary:hover {
  background: var(--color-primary-600);
}

.confirmed__btn--secondary {
  color: var(--text-secondary);
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
}

.confirmed__btn--secondary:hover {
  border-color: var(--color-primary);
  color: var(--text-primary);
}
</style>
