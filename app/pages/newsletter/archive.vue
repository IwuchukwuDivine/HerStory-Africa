<template>
  <div class="nl-archive">
    <header class="nl-archive__header">
      <MuseumLabel
        level="h1"
        eyebrow="The HerStory archive"
        title="The letters, all in one place."
      />
      <p class="nl-archive__intro">
        Some stories are worth reading twice. Others are waiting to be
        discovered.
      </p>
      <p class="nl-archive__intro">
        Explore past editions of the HerStory Africa newsletter, revisit your
        favourites, and meet women whose stories you might have missed.
      </p>
    </header>

    <section v-if="editions.length" class="nl-archive__section" aria-label="Past editions">
      <MuseumLabel
        level="h2"
        title="Previously, in HerStory..."
        subtitle="Browse the stories we've shared so far."
      />
      <ol class="nl-archive__list">
        <li v-for="e in editions" :key="e.slug">
          <NuxtLink :to="`/newsletter/${e.slug}`" class="list-row nl-archive__row">
            <span class="list-row__thumb list-row__initial" aria-hidden="true">{{ e.number }}</span>
            <span class="list-row__body">
              <span class="list-row__name">{{ e.subject }}</span>
              <span class="nl-archive__preview">{{ e.preview }}</span>
              <span class="list-row__meta">No. {{ e.number }} · {{ formatEditionDate(e.date) }}</span>
            </span>
            <span class="list-row__chevron" aria-hidden="true">
              <LucideChevronRight :size="18" />
            </span>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <section class="panel nl-archive__subscribe" aria-label="Subscribe">
      <h2 class="nl-archive__subscribe-title">Don't miss the next story.</h2>
      <p class="nl-archive__subscribe-text">
        A little more HerStory in your inbox. Join our newsletter and discover
        something worth knowing.
      </p>
      <NewsletterForm placeholder="Your email address" />
    </section>
  </div>
</template>

<script setup lang="ts">
const today = new Date().toISOString().slice(0, 10);

const { data } = await useAsyncData("newsletter-archive", () =>
  queryCollection("newsletter").order("date", "DESC").all(),
);

/** Only editions whose date has come; the build runs this at prerender. */
const editions = computed(() =>
  (data.value ?? [])
    .filter((e) => e.date <= today)
    .map((e) => ({ ...e, slug: e.stem.replace(/^newsletter\//, "") })),
);

useSeoMeta({
  title: "Newsletter archive",
  description:
    "Past editions of the HerStory Africa newsletter, all in one place.",
  ogTitle: "Newsletter archive | HerStory Africa",
  ogDescription:
    "Past editions of the HerStory Africa newsletter, all in one place.",
  ogUrl: getAbsoluteUrl("/newsletter/archive"),
});

defineOgImage("Card", {
  variant: "page",
  pill: "Newsletter",
  title: "The letters, all in one place.",
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/newsletter/archive") }],
});
</script>

<style scoped>
.nl-archive {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 48rem;
  margin: 0 auto;
  padding: 28px 24px 56px;
}

@media (min-width: 768px) {
  .nl-archive {
    padding: 40px 32px 64px;
  }
}

.nl-archive__header,
.nl-archive__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nl-archive__section {
  margin-top: 24px;
}

.nl-archive__intro {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.nl-archive__list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  border-bottom: 1px solid var(--border-light);
}

.nl-archive__row {
  align-items: flex-start;
  padding: 14px 0;
}

.nl-archive__preview {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.nl-archive__subscribe {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
}

.nl-archive__subscribe-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
}

.nl-archive__subscribe-text {
  margin: 0 0 4px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
}
</style>
