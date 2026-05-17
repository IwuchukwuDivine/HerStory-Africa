<template>
  <details class="cite-page">
    <summary class="cite-page__summary">
      <LucideQuote :size="16" />
      <span>Cite this page</span>
      <LucideChevronDown :size="16" class="cite-page__chevron" />
    </summary>

    <div class="cite-page__body">
      <div class="cite-page__tabs" role="tablist">
        <button
          v-for="style in styles"
          :key="style.id"
          type="button"
          role="tab"
          :aria-selected="active === style.id"
          class="cite-page__tab"
          :class="{ 'cite-page__tab--active': active === style.id }"
          @click="active = style.id"
        >
          {{ style.label }}
        </button>
      </div>

      <p class="cite-page__citation">{{ activeCitation }}</p>

      <button
        type="button"
        class="cite-page__copy"
        :aria-label="copied ? 'Citation copied' : 'Copy citation'"
        @click="copy"
      >
        <LucideCheck v-if="copied" :size="14" />
        <LucideCopy v-else :size="14" />
        <span>{{ copied ? "Copied" : "Copy" }}</span>
      </button>
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

const active = ref<StyleId>("apa");
const copied = ref(false);
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

const activeCitation = computed(() => citations.value[active.value]);

async function copy() {
  try {
    await navigator.clipboard.writeText(activeCitation.value);
    copied.value = true;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      copied.value = false;
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
  margin: 2.5rem 0;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--surface-muted);
  overflow: hidden;
}

.cite-page__summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-secondary);
  list-style: none;
  user-select: none;
}

.cite-page__summary::-webkit-details-marker {
  display: none;
}

.cite-page__chevron {
  margin-left: auto;
  transition: transform 0.2s ease;
}

.cite-page[open] .cite-page__chevron {
  transform: rotate(180deg);
}

.cite-page__body {
  padding: 0 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.cite-page__tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.25rem;
}

.cite-page__tab {
  padding: 0.4rem 0.85rem;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 6px;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.cite-page__tab:hover {
  color: var(--text-primary);
}

.cite-page__tab--active {
  color: var(--color-primary);
  background: var(--surface-elevated);
}

.cite-page__citation {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--surface-elevated);
  padding: 0.85rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  word-break: break-word;
}

.cite-page__copy {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border-default);
  border-radius: 6px;
  background: var(--surface-elevated);
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.cite-page__copy:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
