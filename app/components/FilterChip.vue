<template>
  <!-- Toggle chip (Unread): one button that flips on click. -->
  <button
    v-if="toggle"
    type="button"
    class="chip pill pill--sm"
    :class="active ? 'pill--primary' : 'pill--secondary'"
    :aria-pressed="active ? 'true' : 'false'"
    @click="$emit('toggle')"
  >
    {{ label }}
  </button>

  <!-- Active picker chip: the value re-opens the picker, the × clears it. -->
  <span
    v-else-if="value"
    class="chip chip--active pill pill--sm pill--primary"
  >
    <button
      type="button"
      class="chip__text"
      :aria-label="`${label}: ${value}. Change`"
      :aria-expanded="open ? 'true' : 'false'"
      @click="$emit('open')"
    >
      {{ value }}
    </button>
    <button
      type="button"
      class="chip__clear"
      :aria-label="`Clear ${label.toLowerCase()} filter`"
      @click="$emit('clear')"
    >
      <LucideX :size="14" />
    </button>
  </span>

  <!-- Idle picker chip. -->
  <button
    v-else
    type="button"
    class="chip pill pill--sm pill--secondary"
    :aria-expanded="open ? 'true' : 'false'"
    aria-haspopup="dialog"
    @click="$emit('open')"
  >
    {{ label }}
    <LucideChevronDown :size="14" class="chip__chevron" />
  </button>
</template>

<script setup lang="ts">
/**
 * Filter chip for the sticky listing toolbar. Idle = secondary pill with a
 * chevron (opens a picker sheet); active = primary pill showing the chosen
 * value with an × that clears it. `toggle` chips (Unread) flip on click.
 */
withDefaults(
  defineProps<{
    label: string;
    /** The chosen value; when set the chip renders active. */
    value?: string;
    /** Whether the picker this chip controls is open. */
    open?: boolean;
    /** Render as an on/off chip with no picker. */
    toggle?: boolean;
    /** On state for toggle chips. */
    active?: boolean;
  }>(),
  { value: "", open: false, toggle: false, active: false },
);

defineEmits<{
  open: [];
  clear: [];
  toggle: [];
}>();
</script>

<style scoped>
.chip {
  flex-shrink: 0;
  font-weight: 500;
}

.chip.pill--primary {
  font-weight: 600;
}

.chip:active {
  transform: scale(0.97);
}

.chip:focus-visible,
.chip__text:focus-visible,
.chip__clear:focus-visible {
  outline: 2px solid var(--ring-default);
  outline-offset: 2px;
}

.chip__chevron {
  flex-shrink: 0;
}

/* Active chip: two buttons inside one pill, so the pill itself has no padding. */
.chip--active {
  padding: 0;
  gap: 0;
  cursor: default;
}

.chip__text,
.chip__clear {
  display: inline-flex;
  align-items: center;
  height: 100%;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  border-radius: 9999px;
}

.chip__text {
  padding: 0 4px 0 14px;
}

.chip__clear {
  justify-content: center;
  width: 32px;
  padding: 0;
  margin-right: 2px;
  transition: opacity 0.15s ease;
}

.chip__clear:hover {
  opacity: 0.8;
}

.chip--active:has(.chip__clear:active) {
  transform: none;
}
</style>
