<template>
  <div
    :style="{
      width: '100%',
      height: '100%',
      display: 'flex',
      position: 'relative',
      background:
        'linear-gradient(135deg, #fdf8f3 0%, #f7ead9 55%, #f3c9ae 100%)',
      fontFamily: 'Playfair Display',
      overflow: 'hidden',
    }"
  >
    <div
      :style="{
        position: 'absolute',
        top: '-280px',
        right: '-280px',
        width: '500px',
        height: '500px',
        borderRadius: '999px',
        background: '#e89968',
        display: 'flex',
      }"
    />
    <div
      :style="{
        position: 'absolute',
        bottom: '-320px',
        left: '880px',
        width: '460px',
        height: '460px',
        borderRadius: '999px',
        background: '#e89968',
        display: 'flex',
      }"
    />

    <div
      :style="{
        width: '500px',
        height: '630px',
        display: 'flex',
        background: '#f0e6d8',
      }"
    >
      <img
        v-if="image"
        :src="image"
        :style="{
          width: '500px',
          height: '630px',
          objectFit: 'cover',
        }"
      />
    </div>

    <div
      :style="{
        width: '8px',
        height: '630px',
        background: '#b5451b',
        display: 'flex',
      }"
    />

    <div
      :style="{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '52px 64px',
      }"
    >
      <div :style="{ display: 'flex', alignItems: 'center', gap: '14px' }">
        <div
          :style="{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#b5451b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: 900,
          }"
        >
          H
        </div>
        <div
          :style="{
            fontSize: '22px',
            fontWeight: 700,
            color: '#1c0f07',
            letterSpacing: '-0.5px',
          }"
        >
          HerStory Africa
        </div>
      </div>

      <div :style="{ display: 'flex', flexDirection: 'column', gap: '18px' }">
        <div
          v-if="pill"
          :style="{
            display: 'flex',
            alignSelf: 'flex-start',
            padding: '6px 18px',
            background: '#b5451b',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 700,
            borderRadius: '999px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }"
        >
          {{ pillText }}
        </div>

        <div
          :style="{
            fontSize: titleFontSize,
            fontWeight: 900,
            color: '#1c0f07',
            lineHeight: 1.05,
            letterSpacing: '-1.5px',
          }"
        >
          {{ title }}
        </div>

        <div
          :style="{
            display: 'flex',
            width: '72px',
            height: '4px',
            background: '#b5451b',
            borderRadius: '999px',
          }"
        />

        <div
          v-if="subtitle"
          :style="{
            fontSize: '24px',
            color: '#4a2e1a',
            lineHeight: 1.35,
            fontStyle: variant === 'woman' ? 'italic' : 'normal',
          }"
        >
          {{ subtitle }}
        </div>

        <div
          v-if="meta"
          :style="{
            fontSize: '20px',
            color: '#765a48',
            fontWeight: 500,
          }"
        >
          {{ meta }}
        </div>
      </div>

      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '18px',
          color: '#765a48',
          fontStyle: 'italic',
        }"
      >
        <div
          :style="{
            width: '8px',
            height: '8px',
            borderRadius: '999px',
            background: '#b5451b',
            display: 'flex',
          }"
        />
        <div :style="{ display: 'flex' }">
          The women history forgot to teach you.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    pill?: string;
    subtitle?: string;
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

const pillText = computed(() =>
  props.variant === "woman" && props.pill ? `${props.pill} era` : props.pill,
);

const titleFontSize = computed(() => {
  const len = (props.title || "").length;
  if (len > 60) return "44px";
  if (len > 42) return "52px";
  if (len > 26) return "60px";
  return "68px";
});
</script>
