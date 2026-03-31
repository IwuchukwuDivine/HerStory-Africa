<template>
  <div class="newsletter-page">
    <header class="newsletter-page__header">
      <h1 class="newsletter-page__title">
        Don't let these stories stay hidden.
      </h1>
      <p class="newsletter-page__lead">
        Every edition brings you the story of a remarkable African woman who
        shaped a continent but missed the textbooks. No spam, just history worth
        knowing.
      </p>
    </header>

    <div class="newsletter-page__form-wrapper">
      <NewsletterForm placeholder="Enter your email address" />
    </div>

    <section class="newsletter-page__what">
      <h2 class="newsletter-page__heading">What you'll get</h2>
      <div class="newsletter-page__perks">
        <div class="newsletter-page__perk">
          <LucideBookOpen :size="22" class="newsletter-page__perk-icon" />
          <h3>New stories</h3>
          <p>
            Profiles of queens, scientists, activists, and rebels as they're
            published.
          </p>
        </div>
        <div class="newsletter-page__perk">
          <LucideNewspaper :size="22" class="newsletter-page__perk-icon" />
          <h3>Articles and essays</h3>
          <p>
            Deeper dives into the movements and moments that shaped the
            continent.
          </p>
        </div>
        <div class="newsletter-page__perk">
          <LucideHeart :size="22" class="newsletter-page__perk-icon" />
          <h3>No noise</h3>
          <p>
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
  ogImage: "https://herstoryafrica.com.ng/newsletter-og.png",
});
</script>

<style scoped>
.newsletter-page {
  max-width: 40rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
}

@media (min-width: 768px) {
  .newsletter-page {
    padding: 4rem 2rem 5rem;
  }
}

.newsletter-page__header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.newsletter-page__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.newsletter-page__lead {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 1rem 0 0;
  max-width: 32rem;
  margin-inline: auto;
}

.newsletter-page__form-wrapper {
  max-width: 28rem;
  margin: 0 auto 3.5rem;
}

.newsletter-page__what {
  padding-top: 2.5rem;
  border-top: 1px solid var(--border-light);
}

.newsletter-page__heading {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.25rem;
  text-align: center;
}

.newsletter-page__perks {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .newsletter-page__perks {
    grid-template-columns: repeat(3, 1fr);
  }
}

.newsletter-page__perk {
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
}

.newsletter-page__perk-icon {
  color: var(--color-primary);
  margin-bottom: 0.625rem;
}

.newsletter-page__perk h3 {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.newsletter-page__perk p {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--text-muted);
  margin: 0;
}
</style>
