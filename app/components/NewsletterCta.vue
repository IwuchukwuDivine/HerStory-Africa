<template>
  <aside v-if="!isSubscribed" class="newsletter-cta">
    <div class="newsletter-cta__accent" />
    <div class="newsletter-cta__body">
      <h3 class="newsletter-cta__title">{{ title }}</h3>
      <p class="newsletter-cta__desc">{{ description }}</p>
      <NewsletterForm placeholder="Your email address" />
    </div>
  </aside>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: "Enjoyed this story?",
    description:
      "Get more stories of remarkable African women delivered to your inbox.",
  },
);

const { isSubscribed } = useApp();
</script>

<style scoped>
.newsletter-cta {
  margin-top: 3rem;
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--surface-muted);
}

.newsletter-cta__accent {
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
}

.newsletter-cta__body {
  padding: 1.75rem;
}

.newsletter-cta__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.375rem;
}

.newsletter-cta__desc {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 1.25rem;
}
</style>
