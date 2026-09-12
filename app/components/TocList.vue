<template>
  <nav v-if="links.length" class="toc panel" :aria-label="label">
    <span class="eyebrow eyebrow--muted toc__label">{{ label }}</span>
    <a v-for="link in links" :key="link.id" :href="`#${link.id}`" class="toc__link">{{ link.text }}</a>
  </nav>
</template>

<script setup lang="ts">
/** "In this profile": jump list built from the document's table of contents. */
withDefaults(defineProps<{ links: { id: string; text: string }[]; label?: string }>(), { label: "In this profile" });
</script>

<style scoped>
.toc {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px;
  border-radius: 12px;
}

.toc__label {
  margin-bottom: 4px;
}

.toc__link {
  display: flex;
  align-items: center;
  min-height: 36px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
}

.toc__link:hover {
  color: var(--color-primary);
}
</style>
