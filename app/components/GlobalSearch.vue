<template>
  <Teleport to="body">
    <Transition name="search-overlay">
      <div
        v-if="open"
        class="search-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Search HerStory Africa"
        @click.self="close"
      >
        <div class="search-modal">
          <div class="search-modal__input-row">
            <LucideSearch :size="20" class="search-modal__input-icon" />
            <input
              ref="inputRef"
              v-model="query"
              type="search"
              placeholder="Search women, articles, opportunities…"
              class="search-modal__input"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="selectActive"
              @keydown.esc="close"
            >
            <kbd class="search-modal__kbd">Esc</kbd>
          </div>

          <div class="search-modal__results">
            <div v-if="!query.trim()" class="search-modal__empty">
              Start typing to search across the archive.
            </div>

            <div
              v-else-if="results.length === 0"
              class="search-modal__empty"
            >
              No matches for "{{ query }}".
            </div>

            <template v-else>
              <section
                v-for="group in groupedResults"
                :key="group.type"
                class="search-modal__group"
              >
                <div class="search-modal__group-title">
                  {{ group.label }}
                </div>
                <NuxtLink
                  v-for="item in group.items"
                  :key="`${item.type}-${item.slug}`"
                  :to="item.to"
                  class="search-modal__item"
                  :class="{
                    'search-modal__item--active': activeIndex === item.index,
                  }"
                  @mouseenter="activeIndex = item.index"
                  @click="close"
                >
                  <component :is="iconFor(item.type)" :size="16" />
                  <div class="search-modal__item-text">
                    <div class="search-modal__item-title">{{ item.title }}</div>
                    <div
                      v-if="item.subtitle"
                      class="search-modal__item-subtitle"
                    >
                      {{ item.subtitle }}
                    </div>
                  </div>
                </NuxtLink>
              </section>
            </template>
          </div>

          <div class="search-modal__footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> open</span>
            <span><kbd>Esc</kbd> close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const query = ref("");
const activeIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

type ItemType = "woman" | "article" | "opportunity";
type Item = {
  type: ItemType;
  slug: string;
  title: string;
  subtitle?: string;
  to: string;
  haystack: string;
};

const { data: women } = useLazyAsyncData(
  "global-search-women",
  () =>
    queryCollection("women")
      .select("name", "slug", "country", "region", "era", "summary", "causes")
      .all(),
  { default: () => [] },
);

const { data: articles } = useLazyAsyncData(
  "global-search-articles",
  () =>
    queryCollection("articles")
      .select("title", "slug", "description", "category")
      .all(),
  { default: () => [] },
);

const { data: opportunities } = useLazyAsyncData(
  "global-search-opportunities",
  () =>
    queryCollection("opportunities")
      .select("title", "slug", "description", "organization")
      .all(),
  { default: () => [] },
);

const items = computed<Item[]>(() => {
  const list: Item[] = [];
  for (const w of women.value ?? []) {
    list.push({
      type: "woman",
      slug: w.slug,
      title: w.name,
      subtitle: [w.country, w.era && `${w.era} era`].filter(Boolean).join(" · "),
      to: `/women/${w.slug}`,
      haystack:
        `${w.name} ${w.country} ${w.region} ${w.era} ${w.summary} ${(w.causes ?? []).join(" ")}`.toLowerCase(),
    });
  }
  for (const a of articles.value ?? []) {
    list.push({
      type: "article",
      slug: a.slug,
      title: a.title,
      subtitle: a.category,
      to: `/articles/${a.slug}`,
      haystack:
        `${a.title} ${a.description ?? ""} ${a.category ?? ""}`.toLowerCase(),
    });
  }
  for (const o of opportunities.value ?? []) {
    list.push({
      type: "opportunity",
      slug: o.slug,
      title: o.title,
      subtitle: o.organization,
      to: `/opportunities/${o.slug}`,
      haystack:
        `${o.title} ${o.description ?? ""} ${o.organization ?? ""}`.toLowerCase(),
    });
  }
  return list;
});

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return items.value
    .filter((item) => terms.every((t) => item.haystack.includes(t)))
    .slice(0, 24);
});

const groupedResults = computed(() => {
  const flat = results.value.map((r, i) => ({ ...r, index: i }));
  const groups: { type: ItemType; label: string; items: typeof flat }[] = [
    { type: "woman", label: "Women", items: [] },
    { type: "article", label: "Articles", items: [] },
    { type: "opportunity", label: "Opportunities", items: [] },
  ];
  for (const item of flat) {
    groups.find((g) => g.type === item.type)?.items.push(item);
  }
  return groups.filter((g) => g.items.length > 0);
});

function iconFor(type: ItemType) {
  if (type === "woman") return resolveComponent("LucideUser");
  if (type === "article") return resolveComponent("LucideBookOpen");
  return resolveComponent("LucideRocket");
}

function move(delta: number) {
  const max = results.value.length - 1;
  if (max < 0) return;
  let next = activeIndex.value + delta;
  if (next < 0) next = max;
  if (next > max) next = 0;
  activeIndex.value = next;
}

function selectActive() {
  const item = results.value[activeIndex.value];
  if (!item) return;
  navigateTo(item.to);
  close();
}

function close() {
  emit("close");
}

watch(query, () => {
  activeIndex.value = 0;
});

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      query.value = "";
      activeIndex.value = 0;
      await nextTick();
      inputRef.value?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: var(--overlay-default, rgba(28, 15, 7, 0.55));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(2rem, 10vh, 6rem) 1rem 1rem;
}

.search-overlay-enter-active,
.search-overlay-leave-active {
  transition: opacity 0.18s ease;
}
.search-overlay-enter-from,
.search-overlay-leave-to {
  opacity: 0;
}

.search-modal {
  width: min(40rem, 100%);
  max-height: 80vh;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 14px;
  box-shadow: 0 24px 64px rgba(28, 15, 7, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-modal__input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-light);
}

.search-modal__input-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-modal__input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
}

.search-modal__input::placeholder {
  color: var(--text-muted);
}

.search-modal__kbd,
.search-modal__footer kbd {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.4rem;
  font-size: 0.7rem;
  font-family: inherit;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--surface-muted);
  border: 1px solid var(--border-default);
  border-radius: 4px;
}

.search-modal__results {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.search-modal__empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.search-modal__group {
  margin-bottom: 0.5rem;
}

.search-modal__group-title {
  padding: 0.5rem 0.75rem 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.search-modal__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
}

.search-modal__item--active {
  background: var(--surface-muted);
}

.search-modal__item-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.search-modal__item-title {
  font-weight: 600;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-modal__item-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-modal__footer {
  display: flex;
  gap: 1rem;
  padding: 0.625rem 1rem;
  border-top: 1px solid var(--border-light);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.search-modal__footer span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

@media (max-width: 640px) {
  .search-overlay {
    padding: 0;
  }
  .search-modal {
    width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    border: none;
  }
}
</style>
