<template>
  <button
    class="favorite-btn"
    :class="{ 'favorite-btn--active': active }"
    :style="active ? { color: '#e53e3e' } : undefined"
    :aria-label="active ? 'Remove from favorites' : 'Add to favorites'"
    @click.prevent.stop="toggle"
  >
    <LucideHeart :size="size" :fill="active ? 'currentColor' : 'none'" />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type: "article" | "woman";
    slug: string;
    size?: number;
  }>(),
  { size: 18 },
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
.favorite-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.favorite-btn:hover {
  color: #e53e3e;
}

.favorite-btn--active {
  color: #e53e3e;
}

.favorite-btn:active {
  transform: scale(0.85);
}
</style>
