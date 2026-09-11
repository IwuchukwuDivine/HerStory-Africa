<template>
  <details class="cite-page">
    <summary class="cite-page__summary">
      <LucideQuote :size="16" />
      <span>Cite this page</span>
      <LucideChevronDown :size="16" class="cite-page__chevron" />
    </summary>

    <div class="panel cite-page__body">
      <div v-for="style in styles" :key="style.id" class="cite-page__format">
        <div class="cite-page__format-head">
          <span class="eyebrow eyebrow--muted">{{ style.label }}</span>
          <button
            type="button"
            class="pill pill--sm pill--secondary cite-page__copy"
            :aria-label="copied === style.id ? `${style.label} citation copied` : `Copy ${style.label} citation`"
            @click="copy(style.id)"
          >
            <LucideCheck v-if="copied === style.id" :size="16" />
            <LucideCopy v-else :size="16" />
            <span>{{ copied === style.id ? "Copied" : "Copy" }}</span>
          </button>
        </div>
        <p class="cite-page__citation">{{ citations[style.id] }}</p>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    url: string;
    year?: string | number;
    type?: "biography" | "article";
  }>(),
  { year: "", type: "biography" },
);

const styles = [
  { id: "apa", label: "APA" },
  { id: "mla", label: "MLA" },
  { id: "chicago", label: "Chicago" },
] as const;
type StyleId = (typeof styles)[number]["id"];

const copied = ref<StyleId | null>(null);
let timeout: ReturnType<typeof setTimeout> | null = null;

const accessDate = computed(() => {
  const d = new Date();
  return {
    apa: d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    mla: d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
});

const yearStr = computed(() => (props.year ? String(props.year) : "n.d."));

const citations = computed<Record<StyleId, string>>(() => {
  const t = props.title;
  const u = props.url;
  const y = yearStr.value;
  return {
    apa: `HerStory Africa. (${y}). ${t}. HerStory Africa. Retrieved ${accessDate.value.apa}, from ${u}`,
    mla: `"${t}." HerStory Africa, ${y === "n.d." ? "n.d." : y}, ${u}. Accessed ${accessDate.value.mla}.`,
    chicago: `HerStory Africa. "${t}." Accessed ${accessDate.value.apa}. ${u}.`,
  };
});

async function copy(id: StyleId) {
  try {
    await navigator.clipboard.writeText(citations.value[id]);
    copied.value = id;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      copied.value = null;
    }, 2000);
  } catch {
    // clipboard unavailable
  }
}

onBeforeUnmount(() => {
  if (timeout) clearTimeout(timeout);
});
</script>

<style scoped>
.cite-page {
  margin: 32px 0;
}

/* A quiet 44px row, no card chrome. */
.cite-page__summary {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  list-style: none;
  user-select: none;
  border-radius: 8px;
}

.cite-page__summary::-webkit-details-marker {
  display: none;
}

.cite-page__chevron {
  transition: transform 0.2s ease;
}

.cite-page[open] .cite-page__chevron {
  transform: rotate(180deg);
}

.cite-page__body {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cite-page__format {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cite-page__format-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cite-page__copy {
  height: 44px;
}

.cite-page__citation {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  word-break: break-word;
}

@media (prefers-reduced-motion: reduce) {
  .cite-page__chevron {
    transition: none;
  }
}
</style>
