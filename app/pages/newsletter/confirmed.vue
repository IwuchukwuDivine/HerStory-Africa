<template>
  <div class="confirmed">
    <MuseumLabel level="h1" eyebrow="Newsletter" title="You're in." />

    <p class="confirmed__intro">
      Your subscription is confirmed. From here on, the stories of remarkable
      African women land straight in your inbox, twice a month.
    </p>

    <div class="confirmed__actions">
      <Pill to="/women" variant="primary">Start reading</Pill>
      <Pill to="/" variant="secondary">Home</Pill>
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
  ogTitle: "Subscription Confirmed | HerStory Africa",
  ogDescription:
    "You're officially part of HerStory Africa. Stories of remarkable African women are on their way to your inbox.",
  ogUrl: getAbsoluteUrl("/newsletter/confirmed"),
  robots: "noindex, follow",
});

defineOgImage("Card", {
  variant: "page",
  pill: "Newsletter",
  title: "You're in.",
  description:
    "Stories of remarkable African women are on their way to your inbox.",
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/newsletter/confirmed") }],
});
</script>

<style scoped>
.confirmed {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 48rem;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

@media (min-width: 768px) {
  .confirmed {
    padding: 64px 32px 80px;
  }
}

.confirmed__intro {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.confirmed__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
</style>
