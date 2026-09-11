<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="sheet-overlay"
        @click.self="$emit('close')"
      >
        <div
          class="sheet filter-sheet"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <span class="sheet__handle" aria-hidden="true" />

          <div class="filter-sheet__head">
            <h2 :id="titleId" class="sheet__title">{{ title }}</h2>
            <button
              type="button"
              class="filter-sheet__clear"
              :disabled="!modelValue"
              @click="$emit('update:modelValue', '')"
            >
              Clear
            </button>
          </div>

          <div class="filter-sheet__options" role="listbox" :aria-label="title">
            <button
              v-for="option in options"
              :key="option.label"
              type="button"
              role="option"
              class="filter-sheet__option"
              :class="{ 'filter-sheet__option--selected': option.label === modelValue }"
              :aria-selected="option.label === modelValue ? 'true' : 'false'"
              @click="$emit('update:modelValue', option.label)"
            >
              <span class="filter-sheet__label">{{ option.label }}</span>
              <span class="filter-sheet__right">
                <span class="filter-sheet__count">{{ option.count }}</span>
                <span class="filter-sheet__mark" aria-hidden="true">
                  <LucideCheck v-if="option.label === modelValue" :size="14" />
                </span>
              </span>
            </button>
          </div>

          <button
            type="button"
            class="pill pill--lg pill--primary filter-sheet__show"
            @click="$emit('close')"
          >
            Show {{ resultCount }} {{ noun }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * Single-select picker in the global bottom sheet. Selecting an option sets
 * the value but keeps the sheet open; the footer button closes it. Counts are
 * supplied by the page and reflect the other active filters.
 */
const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    options: { label: string; count: number }[];
    modelValue: string;
    resultCount: number;
    noun?: string;
  }>(),
  { noun: "women" },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  close: [];
}>();

const titleId = useId();

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKeydown);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (!import.meta.client) return;
  document.body.style.overflow = "";
  document.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.filter-sheet {
  gap: 6px;
}

.filter-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 4px;
}

.filter-sheet__clear {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 4px;
  border: none;
  background: none;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
}

.filter-sheet__clear:disabled {
  opacity: 0.4;
  cursor: default;
}

.filter-sheet__options {
  display: flex;
  flex-direction: column;
}

.filter-sheet__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 52px;
  padding: 0;
  border: none;
  border-top: 1px solid var(--border-light);
  background: none;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
}

.filter-sheet__option:focus-visible {
  outline: 2px solid var(--ring-default);
  outline-offset: -2px;
  border-radius: 6px;
}

.filter-sheet__label {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.filter-sheet__option--selected .filter-sheet__label {
  font-weight: 700;
  color: var(--color-primary);
}

.filter-sheet__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.filter-sheet__count {
  font-size: 14px;
  color: var(--text-muted);
}

.filter-sheet__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid var(--border-default);
  color: var(--text-on-primary);
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.filter-sheet__option--selected .filter-sheet__mark {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.filter-sheet__show {
  width: 100%;
  margin-top: 16px;
}
</style>
