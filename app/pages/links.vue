<template>
  <div class="bulletin">
    <div class="bulletin__sheet">
      <header class="bulletin__masthead">
        <div class="bulletin__ears">
          <span>VOL. I</span>
          <span class="bulletin__ear-mid">herstoryafrica.com.ng</span>
          <span>PASS IT ON</span>
        </div>

        <h1 class="bulletin__nameplate">
          <span class="bulletin__her">Her</span>Story Africa
        </h1>

        <div class="bulletin__rule bulletin__rule--thick" />
        <div class="bulletin__rule" />
        <p class="bulletin__motto">
          History has always had remarkable women. We tell their stories.
        </p>
        <div class="bulletin__rule" />
      </header>

      <section class="bulletin__notices" aria-labelledby="notices-label">
        <h2 id="notices-label" class="bulletin__label">A little something for you</h2>

        <ul class="bulletin__list">
          <li>
            <div v-if="onTheList" class="notice notice--filled">
              <span class="notice__body">
                <span class="notice__title">You're on the list</span>
                <span class="notice__line notice__line--voice">The next story will find you.</span>
              </span>
              <LucideCheck :size="20" class="notice__mark" aria-hidden="true" />
            </div>

            <template v-else>
              <button
                type="button"
                class="notice notice--filled"
                :aria-expanded="open"
                aria-controls="links-subscribe"
                @click="toggle"
              >
                <span class="notice__body">
                  <span class="notice__title">A little HerStory in your inbox.</span>
                  <span class="notice__line">Stories of remarkable African women, fascinating histories, and discoveries worth sharing.</span>
                  <span class="notice__cta">Subscribe to the newsletter</span>
                </span>
                <LucideChevronRight
                  :size="20"
                  class="notice__mark notice__chevron"
                  :class="{ 'notice__chevron--open': open }"
                  aria-hidden="true"
                />
              </button>

              <div
                id="links-subscribe"
                ref="panel"
                class="signup"
                :class="{ 'signup--open': open }"
                :inert="!open"
              >
                <div class="signup__inner">
                  <form
                    v-if="!success"
                    class="signup__form"
                    novalidate
                    @submit.prevent="submit"
                  >
                    <input
                      v-model="website"
                      type="text"
                      name="website"
                      class="signup__trap"
                      tabindex="-1"
                      autocomplete="off"
                      aria-hidden="true"
                    >
                    <label for="links-email" class="signup__label">Your email address</label>
                    <input
                      id="links-email"
                      ref="emailInput"
                      v-model="email"
                      type="email"
                      inputmode="email"
                      autocomplete="email"
                      autocapitalize="off"
                      spellcheck="false"
                      required
                      class="signup__input"
                      :disabled="loading"
                      :aria-invalid="showValidationError ? 'true' : undefined"
                      aria-describedby="links-email-note"
                      @blur="touched = true"
                    >
                    <button type="submit" class="signup__button" :disabled="loading">
                      {{ loading ? "Sending…" : "Subscribe" }}
                    </button>
                    <p
                      v-if="showValidationError || error"
                      class="signup__error"
                      role="alert"
                    >
                      {{ showValidationError ? "That address doesn't look right." : error }}
                    </p>
                    <p id="links-email-note" class="signup__note">
                      No spam. Stop delivery whenever you like.
                    </p>
                  </form>

                  <p
                    v-else
                    ref="doneLine"
                    class="signup__done"
                    tabindex="-1"
                    aria-live="polite"
                  >
                    You're in. Your first letter is on its way.
                  </p>
                </div>
              </div>
            </template>
          </li>
        </ul>

        <div class="bulletin__rule bulletin__rule--gap" />

        <ul class="bulletin__list">
          <li v-if="latest">
            <NuxtLink
              :to="`/women/${latest.slug}`"
              class="notice"
              @click="tap('latest_story')"
            >
              <span class="notice__body">
                <span class="notice__title">Fresh off the press</span>
                <span class="notice__line notice__line--voice">{{ latestLine }}</span>
              </span>
              <LucideChevronRight :size="20" class="notice__mark" aria-hidden="true" />
            </NuxtLink>
          </li>

          <li>
            <NuxtLink to="/women" class="notice" @click="tap('archive')">
              <span class="notice__body">
                <span class="notice__title">Meet the women</span>
                <span class="notice__line">Discover the women who shaped Africa, in ways big and small.</span>
              </span>
              <LucideChevronRight :size="20" class="notice__mark" aria-hidden="true" />
            </NuxtLink>
          </li>

          <li>
            <NuxtLink to="/newsletter/archive" class="notice" @click="tap('past_letters')">
              <span class="notice__body">
                <span class="notice__title">From the letterbox</span>
                <span class="notice__line">Missed a letter? There's plenty to catch up on.</span>
              </span>
              <LucideChevronRight :size="20" class="notice__mark" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section v-if="alsoFromUs.length" class="bulletin__also" aria-labelledby="also-label">
        <h2 id="also-label" class="bulletin__label bulletin__label--quiet">Beyond HerStory</h2>
        <ul class="bulletin__list">
          <li v-for="item in alsoFromUs" :key="item.id">
            <a
              :href="item.url"
              class="notice notice--quiet"
              target="_blank"
              rel="noopener"
              @click="tap(item.id)"
            >
              <span class="notice__body">
                <span class="notice__title">{{ item.title }}</span>
                <span class="notice__line">{{ item.line }}</span>
              </span>
              <LucideChevronRight :size="20" class="notice__mark" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </section>

      <footer class="bulletin__colophon">
        <div class="bulletin__rule" />
        <div class="bulletin__rule bulletin__rule--thick" />
        <p class="bulletin__printed">
          Good stories are meant to be shared. Pass it on.
        </p>
        <nav class="bulletin__social" aria-label="HerStory Africa elsewhere">
          <template v-for="(s, i) in social" :key="s.id">
            <span v-if="i" class="bulletin__dot" aria-hidden="true">·</span>
            <a
              :href="s.url"
              class="bulletin__social-link"
              target="_blank"
              rel="noopener noreferrer"
              @click="tap(s.id)"
            >{{ s.label }}</a>
          </template>
        </nav>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "bare" });

useSeoMeta({
  title: "HerStory Africa links",
  // The template would turn it into "HerStory Africa links | HerStory Africa".
  titleTemplate: "%s",
  description:
    "Subscribe to the HerStory Africa newsletter, read the latest story and meet the women.",
  robots: "noindex, follow",
});

// Paper behind the page too, so overscroll and the Instagram browser chrome
// never show the site's own background (or its dark mode).
useHead({
  bodyAttrs: { class: "bulletin-body" },
  meta: [{ name: "theme-color", content: "#f1e8d3", key: "theme-color" }],
});

// A Bulletin-style card instead of the shared Satori template, which cannot
// render these faces. Source and how to regenerate: scripts/og/links-card.html.
const ogImage = getAbsoluteUrl("/og/links.png");
useSeoMeta({
  ogTitle: "HerStory Africa",
  ogDescription: "History has always had remarkable women. We tell their stories.",
  ogUrl: getAbsoluteUrl("/links"),
  ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt:
    "HerStory Africa nameplate in blackletter on newsprint, over the line: History has always had remarkable women. We tell their stories.",
  twitterCard: "summary_large_image",
  twitterTitle: "HerStory Africa",
  twitterDescription: "History has always had remarkable women. We tell their stories.",
  twitterImage: ogImage,
});

// ── Content, resolved at build time (the page is prerendered) ───────
const { data: latest } = await useAsyncData("links-latest", () =>
  queryCollection("women")
    .order("dateAdded", "DESC")
    .select("slug", "name", "hook", "summary")
    .first(),
);

const latestLine = computed(() => {
  const w = latest.value;
  if (!w) return "";
  return w.hook || `${w.name}. ${w.summary}`;
});

// A row shows once its one-line description is filled in; the section stays
// hidden while no row has one.
const alsoFromUs = [
  {
    id: "amani_site",
    title: "Meet Amani",
    line: "Helping survivors of sexual violence find support, trusted professionals, and a way forward.",
    url: "https://theamani.org",
  },
  {
    id: "amani_community",
    title: "Join the Amani community",
    line: "Be part of a community working towards safety, support, and dignity for all.",
    url: "https://chat.whatsapp.com/DzlluROayCaKVq4FJA1Gvl",
  },
].filter((item) => item.line);

// Same accounts as Footer.vue.
const social = [
  { id: "instagram", label: "Instagram", url: "https://www.instagram.com/herstoryafrica_" },
  { id: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@herstoryafrica" },
  { id: "facebook", label: "Facebook", url: "https://www.facebook.com/herstoryafriq" },
];

// ── Tracking ────────────────────────────────────────────────────────
const { track } = useTag();
function tap(link: string) {
  track("links_click", { link });
}

// ── Subscribe ───────────────────────────────────────────────────────
const { isSubscribed } = useApp();
const {
  email,
  website,
  loading,
  success,
  error,
  touched,
  showValidationError,
  subscribe,
} = useSubscribe();

// The store is restored from localStorage on the client only, so wait for
// mount before trusting it; otherwise the prerendered HTML and the first
// client render disagree.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
// A visitor who subscribes here keeps seeing the confirmation line rather
// than the row flipping to "You're on the list" under their thumb.
const onTheList = computed(() => mounted.value && isSubscribed.value && !success.value);

const open = ref(false);
const panel = ref<HTMLElement | null>(null);
const emailInput = ref<HTMLInputElement | null>(null);
const doneLine = ref<HTMLElement | null>(null);

function toggle() {
  open.value = !open.value;
  tap(open.value ? "subscribe_open" : "subscribe_close");
  if (!open.value || !panel.value) return;
  // iOS only raises the keyboard for a focus() made inside the tap itself,
  // so lift `inert` now instead of waiting for Vue's next render.
  panel.value.inert = false;
  emailInput.value?.focus({ preventScroll: true });
}

async function submit() {
  if (await subscribe()) {
    await nextTick();
    doneLine.value?.focus({ preventScroll: true });
  }
}
</script>

<style>
/* Unscoped on purpose: the body sits outside this component. */
body.bulletin-body {
  background: #f1e8d3;
}
</style>

<style scoped>
.bulletin {
  --paper: #f1e8d3;
  --ink: #1c0f07;
  --terra: #b5451b;
  --muted: #5c4a3a;
  --cream: #f7f0e0;

  flex: 1;
  display: flex;
  color-scheme: light;
  background: var(--paper);
  color: var(--ink);
  /* Literal, not a custom property: @nuxt/fonts only self-hosts families it
     finds in a font-family declaration. */
  font-family: "Old Standard TT", "Times New Roman", Times, serif;
}

/* main.css gives headings and form fields Playfair; on this page that would
   be a second download for nothing. */
.bulletin :is(h2, input, button) {
  font-family: inherit;
}

.bulletin__sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: calc(16px + env(safe-area-inset-top)) 16px
    calc(20px + env(safe-area-inset-bottom));
}

/* ── Masthead ─────────────────────────────────────────────────────── */
.bulletin__ears {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.bulletin__ears > :last-child {
  text-align: right;
}

.bulletin__ear-mid {
  font-style: italic;
  letter-spacing: 0;
}

.bulletin__nameplate {
  margin: 14px 0 12px;
  text-align: center;
  font-family: "UnifrakturCook", "Old English Text MT", "Times New Roman", serif;
  font-weight: 700;
  font-size: clamp(38px, 12vw, 50px);
  line-height: 1.05;
  letter-spacing: 0;
  color: var(--ink);
}

.bulletin__her {
  color: var(--terra);
}

.bulletin__rule {
  border-top: 1px solid var(--ink);
}

.bulletin__rule--thick {
  border-top-width: 3px;
  margin-bottom: 2px;
}

.bulletin__motto {
  margin: 0;
  padding: 8px 0;
  text-align: center;
  font-style: italic;
  font-size: 15px;
  line-height: 1.4;
  text-wrap: balance;
}

/* ── Notices ──────────────────────────────────────────────────────── */
.bulletin__notices {
  margin-top: 22px;
}

.bulletin__label {
  margin: 0 0 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--terra);
}

.bulletin__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.notice {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 64px;
  padding: 12px 14px;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.notice:active {
  background: color-mix(in srgb, var(--ink) 6%, transparent);
}

.notice:focus-visible,
.signup__input:focus-visible,
.signup__button:focus-visible,
.bulletin__social-link:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

.notice--filled {
  border-color: var(--terra);
  background: var(--terra);
  color: var(--cream);
  cursor: default;
}

button.notice--filled {
  cursor: pointer;
}

button.notice--filled:active {
  background: color-mix(in srgb, var(--ink) 15%, var(--terra));
}

.notice__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.notice__title {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.25;
}

.notice__line {
  font-size: 14px;
  line-height: 1.4;
  color: var(--muted);
}

/* Italic is kept for the lines with a voice (a story's hook), so the
   practical descriptions stay quick to scan on a phone. */
.notice__line--voice {
  font-style: italic;
}

.notice--filled .notice__line {
  color: color-mix(in srgb, var(--cream) 88%, var(--terra));
}

.notice__cta {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.notice__mark {
  flex-shrink: 0;
}

.bulletin__rule--gap {
  margin: 18px 0;
}

.notice__chevron {
  transition: transform 200ms ease;
}

.notice__chevron--open {
  transform: rotate(90deg);
}

/* ── Subscribe panel ──────────────────────────────────────────────── */
/* Animating grid rows from 0fr to 1fr slides the panel open to its real
   height without measuring it. */
.signup {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease;
}

.signup--open {
  grid-template-rows: 1fr;
}

.signup__inner {
  overflow: hidden;
  min-height: 0;
}

.signup__form,
.signup__done {
  margin: 0;
  padding: 14px;
  border: 1px solid var(--terra);
  border-top: 0;
}

.signup__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.signup__trap {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.signup__label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.signup__input {
  width: 100%;
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid var(--ink);
  border-radius: 0;
  background: #fbf6ea;
  color: var(--ink);
  font-family: inherit;
  /* 16px stops iOS zooming the page when the field takes focus. */
  font-size: 16px;
}

.signup__input[aria-invalid="true"] {
  border-color: var(--terra);
  border-width: 2px;
}

.signup__button {
  min-height: 48px;
  border: 1px solid var(--ink);
  border-radius: 0;
  background: var(--ink);
  color: var(--paper);
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
}

.signup__button:disabled {
  opacity: 0.7;
  cursor: progress;
}

.signup__error {
  margin: 0;
  font-size: 14px;
  color: var(--terra);
}

.signup__note {
  margin: 0;
  font-size: 13px;
  font-style: italic;
  color: var(--muted);
}

.signup__done {
  font-size: 16px;
  font-style: italic;
  outline: none;
}

/* ── Also from us ─────────────────────────────────────────────────── */
.bulletin__also {
  margin-top: 26px;
  padding-top: 14px;
  border-top: 3px double var(--ink);
}

/* Amani is a separate organisation with a different purpose, so its rows
   step back: muted label, lighter border, smaller type. */
.bulletin__label--quiet {
  color: var(--muted);
}

.notice--quiet {
  min-height: 56px;
  padding: 10px 14px;
  border-color: color-mix(in srgb, var(--ink) 35%, var(--paper));
}

.notice--quiet .notice__title {
  font-size: 15px;
}

.notice--quiet .notice__line {
  font-size: 13px;
}

/* ── Colophon ─────────────────────────────────────────────────────── */
.bulletin__colophon {
  margin-top: auto;
  padding-top: 32px;
  text-align: center;
}

.bulletin__colophon .bulletin__rule--thick {
  margin: 2px 0 0;
}

.bulletin__printed {
  margin: 10px 0 2px;
  font-size: 14px;
  font-style: italic;
  color: var(--muted);
}

.bulletin__social {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0 8px;
  flex-wrap: wrap;
}

.bulletin__dot {
  color: var(--muted);
}

.bulletin__social-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 4px;
  font-size: 15px;
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .signup,
  .notice__chevron {
    transition: none;
  }
}
</style>
