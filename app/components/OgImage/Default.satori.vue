<template>
  <div :style="container">
    <div :style="glow" />
    <div :style="frame" />

    <!-- Oversized continent mark bleeding off the right edge. -->
    <div :style="watermark">
      <svg width="520" height="520" viewBox="0 0 32 32" fill="none">
        <path :d="AFRICA_PATH" :fill="GOLD" opacity="0.1" />
        <path
          :d="AFRICA_PATH"
          :stroke="GOLD"
          stroke-width="0.6"
          fill="none"
          opacity="0.35"
        />
        <circle cx="16" cy="17" r="2.4" :fill="GOLD" opacity="0.45" />
      </svg>
    </div>

    <div :style="copy">
      <div :style="lockup">
        <svg width="46" height="46" viewBox="0 0 32 32" fill="none">
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

      <div :style="body">
        <div :style="titleStyle">{{ title }}</div>
        <div :style="rule" />
        <div v-if="clampedDescription" :style="descriptionStyle">
          {{ clampedDescription }}
        </div>
      </div>

      <div :style="footer">
        <div :style="domain">herstoryafrica.com.ng</div>
        <div :style="footerDot" />
        <div :style="tagline">The women history forgot to teach you.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * The fallback social card — the same dark archival plaque as
 * `Cover.satori.vue` with the continent mark as a watermark where a
 * portrait would sit. Satori renderer: hex only, explicit flex,
 * weights 400/700 — see the note in Cover.satori.vue.
 */
const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: "HerStory Africa",
    description:
      "An educational archive of African women who fought for equality, rights, and social change.",
  },
);

const AFRICA_PATH =
  "M 16,1 C 20,1 24,3 25,7 C 26,10 27,14 25,18 C 27,22 26,26 24,28 C 22,30 19,31 16,31 C 13,31 10,30 8,28 C 6,26 5,22 7,18 C 5,14 6,10 7,7 C 8,3 12,1 16,1 Z";

const CREAM = "#fdf8f3";
const TAN = "#d4b89a";
const GOLD = "#c8941a";
const GOLD_LIGHT = "#edca52";

const clampedDescription = computed(() => {
  const text = (props.description || "").trim();
  if (text.length <= 150) return text;
  return `${text.slice(0, 147).trimEnd()}…`;
});

const titleSize = computed(() => {
  const len = (props.title || "").length;
  if (len <= 22) return 78;
  if (len <= 40) return 62;
  return 50;
});

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

const watermark = {
  display: "flex",
  position: "absolute" as const,
  top: "60px",
  right: "-110px",
};

const copy = {
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  flex: 1,
  maxWidth: "780px",
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

const body = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "20px",
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

const descriptionStyle = {
  display: "flex",
  fontSize: "26px",
  fontStyle: "italic" as const,
  lineHeight: 1.45,
  color: TAN,
};

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
</script>
