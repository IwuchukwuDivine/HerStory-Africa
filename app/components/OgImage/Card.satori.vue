<template>
  <div :style="root">
    <!-- ── Ground ── -->
    <template v-if="hasImage">
      <img :src="image" :style="photo">
      <div :style="veilA" />
      <div :style="veilB" />
    </template>
    <template v-else>
      <div :style="terracotta" />
      <div :style="watermark">
        <svg width="720" height="720" viewBox="0 0 32 32" fill="none">
          <path :d="AFRICA_PATH" fill="#c8941a" opacity="0.22" />
          <path
            :d="AFRICA_PATH"
            stroke="#edca52"
            stroke-width="0.5"
            fill="none"
            opacity="0.6"
          />
          <circle cx="16" cy="17" r="2.2" fill="#edca52" opacity="0.7" />
        </svg>
      </div>
    </template>

    <!-- ── Content layer ── -->
    <div :style="content">
      <div :style="lockup">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <path :d="AFRICA_PATH" :fill="markFill" opacity="0.25" />
          <path
            :d="AFRICA_PATH"
            :stroke="markFill"
            stroke-width="1.6"
            fill="none"
          />
          <circle cx="16" cy="17" r="3" :fill="markFill" />
        </svg>
        <div :style="wordmark">HerStory Africa</div>
      </div>

      <div :style="body">
        <div v-if="pillText" :style="pillStyle">{{ pillText }}</div>

        <!-- Home: "forgot" set in italic gold. Satori only lays out mixed
             text + span children inside a flex container, so the sentence
             is a wrapping row of word spans rather than one text node. -->
        <div v-if="isHome" :style="homeTitle">
          <div
            v-for="(word, i) in HOME_WORDS"
            :key="i"
            :style="word.accent ? homeAccent : homeWord"
          >
            {{ word.text }}
          </div>
        </div>
        <div v-else :style="titleStyle">{{ title }}</div>

        <div v-if="meta" :style="metaStyle">{{ meta }}</div>
        <div v-if="clampedDescription" :style="descriptionStyle">
          {{ clampedDescription }}
        </div>
      </div>

      <div :style="footer">
        <div :style="domainStyle">herstoryafrica.com.ng</div>
        <div :style="dotStyle" />
        <div :style="taglineStyle">{{ taglineText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * The single social card for every route: a full-bleed portrait under a
 * dark veil when the page has an image, a terracotta ground with the
 * continent watermark when it does not. Rendered by nuxt-og-image through
 * Satori, which resolves no CSS variables (hex only), needs an explicit
 * `display: flex` on anything with more than one child, has no
 * line-clamp (text is cut by hand below), and only sees the Playfair
 * Display faces registered globally in `nuxt.config.ts` (400 to 900,
 * normal and italic).
 */
const props = withDefaults(
  defineProps<{
    title?: string;
    /** "Contemporary era", "Concepts · 8 March 2026", "93 women", ... */
    pill?: string;
    /** Women only: "Somalia · 1965–present". */
    meta?: string;
    description?: string;
    image?: string;
    /** CSS object-position for the photo, e.g. "50% 10%". */
    focal?: string;
    variant?: "woman" | "article" | "page";
    isHome?: boolean;
    tagline?: string;
  }>(),
  {
    title: "HerStory Africa",
    pill: "",
    meta: "",
    description: "",
    image: "",
    focal: "",
    variant: "page",
    isHome: false,
    tagline: "",
  },
);

/* Simplified continent silhouette from the favicon (see app/utils/format.ts). */
const AFRICA_PATH =
  "M 16,1 C 20,1 24,3 25,7 C 26,10 27,14 25,18 C 27,22 26,26 24,28 C 22,30 19,31 16,31 C 13,31 10,30 8,28 C 6,26 5,22 7,18 C 5,14 6,10 7,7 C 8,3 12,1 16,1 Z";

const CREAM = "#fdf8f3";
const GOLD = "#c8941a";
const GOLD_LIGHT = "#edca52";

const HOME_WORDS = [
  { text: "The" },
  { text: "women" },
  { text: "history" },
  { text: "forgot", accent: true },
  { text: "to" },
  { text: "teach" },
  { text: "you." },
];

/* ── Derived content ────────────────────────────────────── */

/* Never render the grey placeholder.svg as a hero. */
const hasImage = computed(
  () => !!props.image && !props.image.includes("placeholder"),
);

/* A long pill ("Why it matters · 12 September 2026") drops the date. */
const pillText = computed(() => {
  if (props.isHome) return "";
  const text = (props.pill || "").trim();
  if (text.length <= 40) return text;
  return text.split(" · ")[0]?.trim() ?? "";
});

/* Satori has no text-overflow: cut at the last space before 137 chars. */
const clampedDescription = computed(() => {
  const text = (props.description || "").trim();
  if (text.length <= 140) return text;
  const cut = text.slice(0, 137);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
});

const taglineText = computed(
  () => props.tagline || "The women history forgot to teach you.",
);

/* Size ladder: names at 900, everything else at 800. */
const titleMetrics = computed(() => {
  const len = (props.title || "").length;
  if (props.variant === "woman") {
    const size = len <= 12 ? 96 : len <= 20 ? 84 : 68;
    return {
      size,
      weight: 900,
      leading: 0.98,
      tracking: size >= 84 ? -2.5 : -1.5,
    };
  }
  const size = len <= 30 ? 68 : len <= 50 ? 58 : len <= 70 ? 50 : 42;
  return { size, weight: 800, leading: 1.04, tracking: -1.2 };
});

/* ── Palette per ground ─────────────────────────────────── */

const markFill = computed(() => (hasImage.value ? GOLD : GOLD_LIGHT));
const metaColor = computed(() => (hasImage.value ? "#d4b89a" : "#fae4d6"));
const domainColor = computed(() => (hasImage.value ? GOLD_LIGHT : "#faf1cc"));
const taglineColor = computed(() => (hasImage.value ? "#d4b89a" : "#fae4d6"));

/* ── Ground ─────────────────────────────────────────────── */

const root = {
  display: "flex",
  width: "1200px",
  height: "630px",
  position: "relative" as const,
  overflow: "hidden",
  backgroundColor: "#120a04",
  fontFamily: "Playfair Display",
};

const fullBleed = {
  position: "absolute" as const,
  top: "0px",
  left: "0px",
  width: "1200px",
  height: "630px",
};

const photo = computed(() => ({
  ...fullBleed,
  objectFit: "cover" as const,
  objectPosition: props.focal || "50% 20%",
}));

const veilA = {
  ...fullBleed,
  display: "flex",
  backgroundImage:
    "linear-gradient(90deg, rgba(18,10,4,0.97) 0%, rgba(18,10,4,0.9) 38%, rgba(18,10,4,0.55) 62%, rgba(18,10,4,0.05) 100%)",
};

const veilB = {
  ...fullBleed,
  display: "flex",
  backgroundImage:
    "linear-gradient(0deg, rgba(18,10,4,0.75) 0%, rgba(18,10,4,0) 40%)",
};

const terracotta = {
  ...fullBleed,
  display: "flex",
  backgroundImage:
    "linear-gradient(112deg, #7d2c10 0%, #9a3815 45%, #b5451b 100%)",
};

const watermark = {
  display: "flex",
  position: "absolute" as const,
  top: "-40px",
  right: "-160px",
};

/* ── Content layer ──────────────────────────────────────── */

const content = {
  ...fullBleed,
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  boxSizing: "border-box" as const,
  padding: "52px 64px 48px 64px",
};

const lockup = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const wordmark = {
  display: "flex",
  fontSize: "26px",
  fontWeight: 700,
  color: CREAM,
};

const body = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "flex-start",
  gap: "20px",
  maxWidth: "880px",
};

const pillStyle = {
  display: "flex",
  padding: "9px 20px",
  border: `1.5px solid ${GOLD_LIGHT}`,
  borderRadius: "999px",
  fontSize: "17px",
  fontWeight: 700,
  letterSpacing: "3.5px",
  textTransform: "uppercase" as const,
  color: GOLD_LIGHT,
};

const titleStyle = computed(() => ({
  display: "flex",
  fontSize: `${titleMetrics.value.size}px`,
  fontWeight: titleMetrics.value.weight,
  lineHeight: titleMetrics.value.leading,
  letterSpacing: `${titleMetrics.value.tracking}px`,
  color: CREAM,
}));

const homeTitle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "0px 18px",
  maxWidth: "820px",
  fontSize: "78px",
  fontWeight: 800,
  lineHeight: 1.02,
  letterSpacing: "-2px",
  color: CREAM,
};

const homeWord = {
  display: "flex",
};

const homeAccent = {
  display: "flex",
  fontStyle: "italic" as const,
  color: GOLD_LIGHT,
};

const metaStyle = computed(() => ({
  display: "flex",
  fontSize: "30px",
  fontWeight: 400,
  fontStyle: "italic" as const,
  color: metaColor.value,
}));

const descriptionStyle = {
  display: "flex",
  fontSize: "23px",
  fontWeight: 400,
  lineHeight: 1.4,
  maxWidth: "720px",
  color: "#f5ede4",
};

/* ── Footer ─────────────────────────────────────────────── */

const footer = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const domainStyle = computed(() => ({
  display: "flex",
  fontSize: "18px",
  fontWeight: 700,
  color: domainColor.value,
}));

const dotStyle = computed(() => ({
  display: "flex",
  width: "5px",
  height: "5px",
  borderRadius: "999px",
  backgroundColor: taglineColor.value,
}));

const taglineStyle = computed(() => ({
  display: "flex",
  fontSize: "18px",
  fontWeight: 400,
  fontStyle: "italic" as const,
  color: taglineColor.value,
}));
</script>
