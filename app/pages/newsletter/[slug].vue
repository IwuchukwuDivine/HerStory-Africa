<template>
  <div class="nl-edition">
    <template v-if="edition">
      <MuseumLabel
        level="h1"
        :eyebrow="`No. ${edition.number} · ${formatEditionDate(edition.date)}`"
        :title="edition.subject"
      />
      <p class="nl-edition__intro">{{ edition.preview }}</p>

      <!-- The edition exactly as it was emailed, built by the newsletter build
           into public/newsletter/<slug>/web.html. Same origin, so the frame can
           grow to the letter's full height and no inner scrollbar appears. -->
      <iframe
        ref="frame"
        class="nl-edition__frame"
        :src="`/newsletter/${slug}/web.html`"
        :title="`Newsletter No. ${edition.number}: ${edition.subject}`"
        :style="{ height: `${height}px` }"
        @load="watchLetter"
      />

      <div class="nl-edition__actions">
        <Pill v-if="storyLink" :to="storyLink" variant="primary">Read her full story</Pill>
        <Pill to="/newsletter/archive" variant="secondary">Explore past editions</Pill>
      </div>

      <section class="panel nl-edition__subscribe" aria-label="Subscribe">
        <h2 class="nl-edition__subscribe-title">Don't miss the next story.</h2>
        <p class="nl-edition__subscribe-text">
          A little more HerStory in your inbox. Join our newsletter and discover
          something worth knowing.
        </p>
        <NewsletterForm placeholder="Your email address" />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";

const route = useRoute();
const slug = String(route.params.slug ?? "");

const { data: edition } = await useAsyncData(`newsletter-${slug}`, () =>
  queryCollection("newsletter").where("stem", "=", `newsletter/${slug}`).first(),
);

if (!edition.value) {
  throw createError({ statusCode: 404, statusMessage: "Edition not found", fatal: true });
}

const storyLink = computed(() => {
  const e = edition.value;
  if (e?.woman) return `/women/${e.woman}`;
  if (e?.article) return `/articles/${e.article}`;
  return "";
});

// Prerendered before its date so the emailed "read in your browser" link
// works on the day; until then it stays out of search and the archive.
const unpublished = edition.value.date > new Date().toISOString().slice(0, 10);

const frame = ref<HTMLIFrameElement | null>(null);
const height = ref(1400);

function fit() {
  const doc = frame.value?.contentDocument;
  if (doc?.body) height.value = doc.documentElement.scrollHeight;
}

// The prerendered frame often finishes loading before hydration, so its load
// event is missed. Measure on mount too, and keep following the letter's
// height as its images arrive or the window narrows.
let observer: ResizeObserver | undefined;
function watchLetter() {
  const doc = frame.value?.contentDocument;
  if (!doc?.body || doc.readyState === "loading") return;
  fit();
  observer?.disconnect();
  observer = new ResizeObserver(fit);
  observer.observe(doc.body);
}
onMounted(watchLetter);
onBeforeUnmount(() => observer?.disconnect());
useEventListener("resize", () => fit());

const description = edition.value.preview;
useSeoMeta({
  title: edition.value.subject,
  description,
  ogTitle: `${edition.value.subject} | HerStory Africa`,
  ogDescription: description,
  ogUrl: getAbsoluteUrl(`/newsletter/${slug}`),
  robots: unpublished ? "noindex, nofollow" : undefined,
});

defineOgImage("Card", {
  variant: "page",
  pill: `Newsletter No. ${edition.value.number}`,
  title: edition.value.subject,
  description,
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl(`/newsletter/${slug}`) }],
});
</script>

<style scoped>
.nl-edition {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 48rem;
  margin: 0 auto;
  padding: 28px 24px 56px;
}

@media (min-width: 768px) {
  .nl-edition {
    padding: 40px 32px 64px;
  }
}

/* Under 768px the page gutter would squeeze the 644px letter, so it uses the
   full width and lets the email's own phone layout take over. */
.nl-edition__frame {
  display: block;
  width: calc(100% + 48px);
  margin: 8px -24px 0;
  border: 0;
}

@media (min-width: 768px) {
  .nl-edition__frame {
    width: 100%;
    margin: 8px 0 0;
  }
}

.nl-edition__intro {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.nl-edition__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.nl-edition__subscribe {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.nl-edition__subscribe-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
}

.nl-edition__subscribe-text {
  margin: 0 0 4px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
}
</style>
