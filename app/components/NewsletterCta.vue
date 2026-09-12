<template>
  <aside v-if="!isSubscribed" class="panel newsletter-cta">
    <h3 class="newsletter-cta__title">{{ title }}</h3>
    <p class="newsletter-cta__desc">{{ description }}</p>
    <NewsletterForm placeholder="Your email address" />
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
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 40px;
}

.newsletter-cta__title {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0;
}

.newsletter-cta__desc {
  font-size: 15px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
}
</style>
