<template>
  <NuxtLink :to="`/articles/${slug}`" class="article-row" :class="[`article-row--${size}`, { 'article-row--read': read }]">
    <div class="article-row__body">
      <span class="article-row__eyebrow">{{ category }}<template v-if="readingTime"> · {{ minutesLabel(readingTime) }}</template></span>
      <span class="article-row__title">{{ title }}</span>
    </div>
    <div v-if="image" class="article-row__thumb">
      <NuxtImg :src="image" :alt='`Illustration for "${title}"`' :width="thumbW * 2" :height="thumbH * 2" format="webp" loading="lazy" />
    </div>
    <div v-else class="article-row__thumb article-row__thumb--icon">
      <LucideBookOpen :size="20" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { minutesLabel } from "~/utils/format";

/**
 * Article as a row: eyebrow (category · read time), title, thumbnail on the
 * right, 1px top rule. `sm` = 64px thumb, `md` = 72px, `lg` = 120×80 desktop.
 */
const props = withDefaults(
  defineProps<{
    title: string;
    slug: string;
    category?: string;
    image?: string;
    readingTime?: number | null;
    size?: "sm" | "md" | "lg";
  }>(),
  { category: "", image: "", readingTime: null, size: "md" },
);

const thumbW = computed(() => (props.size === "lg" ? 120 : props.size === "sm" ? 64 : 72));
const thumbH = computed(() => (props.size === "lg" ? 80 : props.size === "sm" ? 64 : 72));

const { isRead } = useApp();
const read = computed(() => isRead("article", props.slug));
</script>

<style scoped>
.article-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px 0;
  border-top: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
}

.article-row--sm {
  align-items: center;
  padding: 14px 0;
}

.article-row__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.article-row__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.article-row__title {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
  transition: color 0.15s ease;
}

.article-row--sm .article-row__title {
  font-size: 16px;
}

.article-row--read .article-row__title {
  color: var(--text-secondary);
}

@media (hover: hover) {
  .article-row:hover .article-row__title {
    color: var(--color-primary);
  }
}

.article-row__thumb {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-muted);
}

.article-row--sm .article-row__thumb {
  width: 64px;
  height: 64px;
}

.article-row__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.article-row__thumb--icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

@media (min-width: 768px) {
  .article-row--lg {
    gap: 20px;
    align-items: center;
    padding: 18px 0;
  }

  .article-row--lg .article-row__title {
    font-size: 20px;
  }

  .article-row--lg .article-row__thumb {
    width: 120px;
    height: 80px;
  }
}
</style>
