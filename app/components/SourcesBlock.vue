<template>
  <section class="sources-block" aria-label="Sources and citation">
    <span v-if="sources" class="eyebrow eyebrow--muted">Sources</span>
    <p v-if="sources" class="sources-block__text">{{ sources }}</p>
    <CiteThisPage :title="title" :url="url" :year="year" :type="type" />
  </section>
</template>

<script setup lang="ts">
/** Sources and "Cite this page" merged into one quiet block under the body. */
withDefaults(
  defineProps<{
    sources?: string;
    title: string;
    url: string;
    year?: string | number;
    type?: "biography" | "article";
  }>(),
  { sources: "", year: "", type: "biography" },
);
</script>

<style scoped>
.sources-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}

.sources-block__text {
  font-size: 14px;
  line-height: 1.6;
  font-style: italic;
  color: var(--text-secondary);
  margin: 0;
}
</style>
