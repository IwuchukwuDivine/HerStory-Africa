<template>
  <div class="newsletter">
    <header class="newsletter__header">
      <MuseumLabel
        level="h1"
        eyebrow="Newsletter · twice a month"
        title="Don't let these stories stay hidden."
      />
      <p class="newsletter__intro">
        Every edition brings you the story of a remarkable African woman who
        shaped a continent but missed the textbooks. No spam, just history worth
        knowing.
      </p>
    </header>

    <div class="newsletter__form">
      <NewsletterForm placeholder="Your email address" />
    </div>

    <section class="newsletter__perks" aria-label="What you'll get">
      <MuseumLabel eyebrow="Every edition" title="What you'll get" />

      <div class="newsletter__grid">
        <div class="panel newsletter__perk">
          <LucideBookOpen :size="20" class="newsletter__perk-icon" />
          <h3 class="newsletter__perk-title">New stories</h3>
          <p class="newsletter__perk-text">
            Profiles of queens, scientists, activists, and rebels as they're
            published.
          </p>
        </div>
        <div class="panel newsletter__perk">
          <LucideNewspaper :size="20" class="newsletter__perk-icon" />
          <h3 class="newsletter__perk-title">Articles and essays</h3>
          <p class="newsletter__perk-text">
            Deeper dives into the movements and moments that shaped the
            continent.
          </p>
        </div>
        <div class="panel newsletter__perk">
          <LucideHeart :size="20" class="newsletter__perk-icon" />
          <h3 class="newsletter__perk-title">No noise</h3>
          <p class="newsletter__perk-text">
            No spam, no fluff, no daily emails. Just stories that matter, when
            they're ready.
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
    "Get stories of remarkable African women delivered to your inbox. Queens, scientists, activists, and rebels who shaped a continent.",
  ogTitle: "Subscribe to HerStory Africa",
  ogDescription:
    "Get stories of remarkable African women delivered to your inbox. No spam, just history worth knowing.",
  ogUrl: getAbsoluteUrl("/newsletter"),
});

defineOgImage("Card", {
  variant: "page",
  pill: "Newsletter",
  title: "Don't let these stories stay hidden.",
  description:
    "Every edition brings you the story of a remarkable African woman who shaped a continent but missed the textbooks. No spam, just history worth knowing.",
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
  max-width: 32rem;
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
