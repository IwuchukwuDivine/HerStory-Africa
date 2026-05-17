<template>
  <div
    :style="{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '80px',
      background: 'linear-gradient(135deg, #fdf8f3 0%, #f5c8ae 100%)',
      fontFamily: 'Playfair Display',
    }"
  >
    <div :style="{ display: 'flex', alignItems: 'center', gap: '16px' }">
      <div
        :style="{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: '#b5451b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '32px',
          fontWeight: 900,
        }"
      >
        H
      </div>
      <div
        :style="{
          fontSize: '28px',
          fontWeight: 700,
          color: '#1c0f07',
        }"
      >
        HerStory Africa
      </div>
    </div>

    <div :style="{ display: 'flex', flexDirection: 'column', gap: '24px' }">
      <div
        :style="{
          fontSize: '76px',
          fontWeight: 900,
          color: '#1c0f07',
          lineHeight: 1.1,
        }"
      >
        {{ title }}
      </div>
      <div
        :style="{
          fontSize: '32px',
          color: '#4a2e1a',
          lineHeight: 1.4,
        }"
      >
        {{ description }}
      </div>
    </div>

    <div
      :style="{
        fontSize: '22px',
        color: '#765a48',
        fontStyle: 'italic',
      }"
    >
      The women history forgot to teach you.
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
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
</script>
