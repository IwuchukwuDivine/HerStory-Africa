<template>
  <div class="search-bar" :class="{ 'search-bar--lg': size === 'lg' }">
    <LucideSearch class="search-bar__icon" :size="20" />
    <input
      ref="inputRef"
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      :aria-label="placeholder"
      class="search-bar__input"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      @keydown.enter="$emit('submit')"
    >
    <button
      v-show="modelValue"
      type="button"
      class="search-bar__clear"
      aria-label="Clear search"
      @click="$emit('update:modelValue', '')"
    >
      <LucideX :size="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    /** 48px by default; `lg` is the 52px hero variant. */
    size?: "md" | "lg";
  }>(),
  {
    placeholder: "Search women, causes, countries…",
    size: "md",
  },
);

defineEmits<{
  "update:modelValue": [value: string];
  submit: [];
}>();

const inputRef = ref<HTMLInputElement>();

defineExpose({ focus: () => inputRef.value?.focus() });
</script>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 36rem;
  height: 48px;
  padding: 0 4px 0 18px;
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-default);
  border-radius: 9999px;
  transition: border-color 0.15s ease;
}

.search-bar--lg {
  height: 52px;
}

.search-bar:focus-within {
  border-color: var(--ring-default);
  outline: 2px solid var(--ring-default);
  outline-offset: 2px;
}

.search-bar__icon {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: color 0.15s ease;
}

.search-bar:focus-within .search-bar__icon {
  color: var(--ring-default);
}

.search-bar__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  font-size: 16px;
  font-family: var(--font-body);
  color: var(--text-primary);
  background: transparent;
  border: none;
}

/* The wrapper draws the ring for the whole control. */
.search-bar__input:focus-visible {
  outline: none;
}

.search-bar__input::placeholder {
  color: var(--text-muted);
}

.search-bar__clear {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  color: var(--text-muted);
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

@media (hover: hover) {
  .search-bar__clear:hover {
    background: var(--surface-muted);
    color: var(--text-primary);
  }
}
</style>
