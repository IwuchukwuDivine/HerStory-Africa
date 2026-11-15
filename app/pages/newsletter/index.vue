<template>
  <div class="newsletter">
    <header class="newsletter__header">
      <MuseumLabel
        level="h1"
        eyebrow="The HerStory letter"
        title="History has more stories to tell."
      />
      <p class="newsletter__intro">
        Discover the remarkable African women who shaped history, challenged
        expectations, and left legacies worth remembering. Stories to inspire
        you, surprise you, and sometimes change the way you see the world.
      </p>
    </header>

    <div class="newsletter__form">
      <NewsletterForm placeholder="Your email address" button-label="Join the newsletter" />
      <NuxtLink to="/newsletter/archive" class="newsletter__archive">
        Explore past editions
        <LucideArrowRight :size="14" aria-hidden="true" />
      </NuxtLink>
    </div>

    <section class="newsletter__perks" aria-label="A look inside">
      <MuseumLabel eyebrow="A look inside" title="A little history, a lot to discover." />

      <div class="newsletter__grid">
        <div class="panel newsletter__perk">
          <LucideUsers :size="20" class="newsletter__perk-icon" />
          <h3 class="newsletter__perk-title">Women worth knowing</h3>
          <p class="newsletter__perk-text">
            Meet the pioneers, trailblazers, and everyday women whose stories
            deserve to be told.
          </p>
        </div>
        <div class="panel newsletter__perk">
          <LucideBookOpen :size="20" class="newsletter__perk-icon" />
          <h3 class="newsletter__perk-title">Beyond the history books</h3>
          <p class="newsletter__perk-text">
            Discover the moments, decisions, and untold details that bring
            history to life.
          </p>
        </div>
        <div class="panel newsletter__perk">
          <LucideHeart :size="20" class="newsletter__perk-icon" />
          <h3 class="newsletter__perk-title">Stories that stay with you</h3>
          <p class="newsletter__perk-text">
            The kind of stories that spark conversations, shift perspectives,
            and make you want to know more.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Subscribe to the Newsletter",
  description:
    "Discover the remarkable African women who shaped history, challenged expectations, and left legacies worth remembering.",
  ogTitle: "Subscribe to HerStory Africa",
  ogDescription:
    "Discover the remarkable African women who shaped history, challenged expectations, and left legacies worth remembering.",
  ogUrl: getAbsoluteUrl("/newsletter"),
});

defineOgImage("Card", {
  variant: "page",
  pill: "Newsletter",
  title: "History has more stories to tell.",
  description:
    "Discover the remarkable African women who shaped history, challenged expectations, and left legacies worth remembering.",
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/newsletter") }],
});
</script>

<style scoped>
.newsletter {
  max-width: 48rem;
  margin: 0 auto;
  padding: 28px 24px 56px;
}

@media (min-width: 768px) {
  .newsletter {
    padding: 40px 32px 64px;
  }
}

.newsletter__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.newsletter__intro {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.newsletter__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 32rem;
}

.newsletter__archive {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  min-height: 44px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.newsletter__archive:hover {
  text-decoration: underline;
}

.newsletter__perks {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 48px;
}

@media (min-width: 768px) {
  .newsletter__perks {
    margin-top: 64px;
  }
}

.newsletter__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .newsletter__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

.newsletter__perk {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.newsletter__perk-icon {
  color: var(--color-primary);
  margin-bottom: 4px;
}

.newsletter__perk-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
  margin: 0;
}

.newsletter__perk-text {
  font-size: 15px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
}
</style>
