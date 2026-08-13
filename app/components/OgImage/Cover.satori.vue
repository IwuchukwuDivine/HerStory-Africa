<template>
  <div :style="container">
    <!-- Warm glow rising behind the portrait. -->
    <div :style="glow" />

    <!-- Hairline gold frame, inset like a museum plaque. -->
    <div :style="frame" />

    <!-- ── Copy column ── -->
    <div :style="copy">
      <div :style="lockup">
        <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
          <path :d="AFRICA_PATH" :fill="GOLD" opacity="0.2" />
          <path
            :d="AFRICA_PATH"
            :stroke="GOLD"
            stroke-width="1.5"
            fill="none"
          />
          <circle cx="16" cy="17" r="3" :fill="GOLD" />
          <circle
            cx="16"
            cy="17"
            r="5"
            fill="none"
            :stroke="GOLD_LIGHT"
            stroke-width="0.8"
            opacity="0.6"
          />
        </svg>
        <div :style="lockupName">HerStory Africa</div>
      </div>

      <div :style="copyBody">
        <div v-if="eyebrow" :style="eyebrowStyle">{{ eyebrow }}</div>
        <div :style="titleStyle">{{ title }}</div>
        <div :style="rule" />
        <div v-if="clampedSubtitle" :style="subtitleStyle">
          {{ clampedSubtitle }}
        </div>
      </div>

      <div :style="footer">
        <div :style="domain">herstoryafrica.com.ng</div>
        <div :style="footerDot" />
        <div :style="tagline">The women history forgot to teach you.</div>
      </div>
    </div>

    <!-- ── Arched portrait ── -->
    <div :style="art">
      <div :style="archEcho" />
      <img v-if="hasImage" :src="image" :style="archImage" />
      <div v-else :style="archEmpty">
        <svg width="150" height="150" viewBox="0 0 32 32" fill="none">
          <path :d="AFRICA_PATH" :fill="GOLD" opacity="0.16" />
          <path
            :d="AFRICA_PATH"
            :stroke="GOLD"
            stroke-width="1.2"
            fill="none"
            opacity="0.7"
          />
          <circle cx="16" cy="17" r="3" :fill="GOLD" opacity="0.8" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * The social card for women profiles and articles — a dark, archival
 * "museum plaque": espresso-to-rust gradient, gold hairlines, Playfair
 * type and the subject's portrait in an arched frame.
 *
 * Rendered by nuxt-og-image through Satori, which resolves no CSS
 * variables — the palette is spelled out in hex. Keep it in sync with
 * the tokens in `app/assets/css/main.css`. Satori also needs an explicit
 * `display: flex` on anything with more than one child, ships no
 * line-clamp (text is cut by hand below) and only sees the weights
 * copied into `public/fonts/` — design in 400 and 700 only.
 */
const props = withDefaults(
  defineProps<{
    title?: string;
    /** Era for women, category for articles — leads the eyebrow line. */
    pill?: string;
    /** Life dates for women, description for articles. */
    subtitle?: string;
    /** Country for women, publish date for articles — ends the eyebrow. */
    meta?: string;
    image?: string;
    variant?: "article" | "woman";
  }>(),
  {
    title: "HerStory Africa",
    pill: "",
    subtitle: "",
    meta: "",
    image: "",
    variant: "article",
  },
);

/* Simplified continent silhouette from the favicon, solid gold — Satori
   cannot rasterise the SVG-gradient original. */
const AFRICA_PATH =
  "M 16,1 C 20,1 24,3 25,7 C 26,10 27,14 25,18 C 27,22 26,26 24,28 C 22,30 19,31 16,31 C 13,31 10,30 8,28 C 6,26 5,22 7,18 C 5,14 6,10 7,7 C 8,3 12,1 16,1 Z";

const CREAM = "#fdf8f3";
const TAN = "#d4b89a";
const GOLD = "#c8941a";
const GOLD_LIGHT = "#edca52";

const hasImage = computed(
  () => !!props.image && !props.image.includes("placeholder"),
);

/* Era + country ("Modern era · Kenya") or category + date, one line. */
const eyebrow = computed(() => {
  const lead =
    props.variant === "woman" && props.pill ? `${props.pill} era` : props.pill;
  return [lead, props.meta].filter(Boolean).join("  ·  ");
});

/* Satori has no text-overflow — a long article description would run
   straight through the footer. */
const clampedSubtitle = computed(() => {
  const text = (props.subtitle || "").trim();
  if (text.length <= 140) return text;
  return `${text.slice(0, 137).trimEnd()}…`;
});

const titleSize = computed(() => {
  const len = (props.title || "").length;
  if (len <= 18) return 74;
  if (len <= 28) return 64;
  if (len <= 44) return 54;
  if (len <= 60) return 46;
  return 40;
});

/* ── Stage ──────────────────────────────────────────────── */

const container = {
  width: "100%",
  height: "100%",
  display: "flex",
  position: "relative" as const,
  overflow: "hidden",
  padding: "56px 64px",
  fontFamily: "Playfair Display",
  backgroundImage:
    "linear-gradient(112deg, #21100a 0%, #38160a 52%, #5c220c 100%)",
};

const glow = {
  display: "flex",
  position: "absolute" as const,
  top: "-180px",
  right: "-140px",
  width: "760px",
  height: "760px",
  borderRadius: "380px",
  backgroundImage:
    "radial-gradient(circle, rgba(200,148,26,0.22) 0%, rgba(200,148,26,0) 65%)",
};

const frame = {
  display: "flex",
  position: "absolute" as const,
  top: "24px",
  left: "24px",
  right: "24px",
  bottom: "24px",
  border: "1.5px solid rgba(200,148,26,0.35)",
  borderRadius: "4px",
};

/* ── Copy column ────────────────────────────────────────── */

const copy = {
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  flex: 1,
  paddingRight: "56px",
  position: "relative" as const,
};

const lockup = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const lockupName = {
  display: "flex",
  fontSize: "27px",
  fontWeight: 700,
  letterSpacing: "0.3px",
  color: CREAM,
};

const copyBody = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "18px",
};

const eyebrowStyle = {
  display: "flex",
  fontSize: "19px",
  fontWeight: 700,
  letterSpacing: "3.5px",
  textTransform: "uppercase" as const,
  color: GOLD_LIGHT,
};

const titleStyle = computed(() => ({
  display: "flex",
  fontSize: `${titleSize.value}px`,
  fontWeight: 700,
  lineHeight: 1.08,
  letterSpacing: "-0.5px",
  color: CREAM,
}));

const rule = {
  display: "flex",
  width: "72px",
  height: "3px",
  borderRadius: "999px",
  backgroundColor: GOLD,
};

const subtitleStyle = computed(() => ({
  display: "flex",
  fontSize: props.variant === "woman" ? "27px" : "23px",
  fontStyle: "italic" as const,
  lineHeight: 1.45,
  color: TAN,
}));

/* ── Footer ─────────────────────────────────────────────── */

const footer = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const domain = {
  display: "flex",
  fontSize: "18px",
  fontWeight: 700,
  letterSpacing: "0.4px",
  color: GOLD,
};

const footerDot = {
  display: "flex",
  width: "5px",
  height: "5px",
  borderRadius: "999px",
  backgroundColor: "rgba(212,184,154,0.6)",
};

const tagline = {
  display: "flex",
  fontSize: "18px",
  fontStyle: "italic" as const,
  color: "rgba(212,184,154,0.85)",
};

/* ── Arched portrait ────────────────────────────────────── */

const ART_W = 330;
const ART_H = 452;
const ARCH = `${ART_W / 2}px ${ART_W / 2}px 14px 14px`;

const art = {
  display: "flex",
  position: "relative" as const,
  flexShrink: 0,
  width: `${ART_W + 22}px`,
  height: `${ART_H + 22}px`,
};

/* A second arch offset behind the portrait — the plaque's echo line. */
const archEcho = {
  display: "flex",
  position: "absolute" as const,
  top: "0px",
  right: "0px",
  width: `${ART_W}px`,
  height: `${ART_H}px`,
  border: "1.5px solid rgba(200,148,26,0.45)",
  borderRadius: ARCH,
};

const archImage = {
  position: "absolute" as const,
  bottom: "0px",
  left: "0px",
  width: `${ART_W}px`,
  height: `${ART_H}px`,
  borderRadius: ARCH,
  border: `4px solid ${GOLD}`,
  objectFit: "cover" as const,
};

/* No portrait: the continent mark inside the empty arch, not a grey
   stock avatar. */
const archEmpty = {
  display: "flex",
  position: "absolute" as const,
  bottom: "0px",
  left: "0px",
  width: `${ART_W}px`,
  height: `${ART_H}px`,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: ARCH,
  border: `4px solid rgba(200,148,26,0.65)`,
  backgroundImage: "linear-gradient(160deg, #40190b 0%, #2a1006 100%)",
};
</script>
