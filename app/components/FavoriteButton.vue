<template>
  <button
    type="button"
    class="favorite-btn"
    :class="[
      label ? 'pill pill--secondary favorite-btn--label' : 'favorite-btn--icon',
      { 'favorite-btn--active': active },
    ]"
    :aria-label="label ? undefined : active ? 'Remove from favourites' : 'Add to favourites'"
    :aria-pressed="active"
    @click.prevent.stop="toggle"
  >
    <LucideHeart :size="label ? 16 : size" :fill="active ? 'currentColor' : 'none'" />
    <span v-if="label">{{ active ? "Saved" : label }}</span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type: "article" | "woman";
    slug: string;
    /** Glyph size in icon-only mode; the hit box is always 44px. */
    size?: number;
    /** Renders a labelled secondary pill ("Save" / "Saved") instead of the bare heart. */
    label?: string;
  }>(),
  { size: 18, label: undefined },
);

const { toggleFavorite, isFavorite } = useApp();
const { track } = useTag();

const active = computed(() => isFavorite(props.type, props.slug));

function toggle() {
  const action = active.value ? "remove" : "add";
  toggleFavorite(props.type, props.slug);
  track("favorite_toggle", {
    content_type: props.type,
    slug: props.slug,
    action,
  });
}
</script>

<style scoped>
.favorite-btn--icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    color 0.15s ease,
    transform 0.25s ease;
}

@media (hover: hover) {
  .favorite-btn--icon:hover {
    color: #e53e3e;
  }
}

.favorite-btn--icon:active {
  transform: scale(0.9);
}

.favorite-btn--icon.favorite-btn--active {
  color: #e53e3e;
}

.favorite-btn--label.favorite-btn--active {
  border-color: #e53e3e;
  color: #e53e3e;
}

@media (hover: hover) {
  .favorite-btn--label.favorite-btn--active:hover {
    border-color: #e53e3e;
    color: #e53e3e;
  }
}

@media (prefers-reduced-motion: reduce) {
  .favorite-btn--icon {
    transition: none;
  }
}
</style>
