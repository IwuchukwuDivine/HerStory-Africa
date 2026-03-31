<template>
  <div v-if="collection" class="collection-detail">
    <header class="collection-detail__header">
      <div class="flex items-center gap-2 mb-6">
        <button
          style="margin-bottom: 0"
          class="go-back"
          @click="$router.back()"
        >
          <LucideArrowLeft :size="16" />
          Back
        </button>

        <span class="collection-detail__theme">{{ collection.theme }}</span>
      </div>
      <h1 class="collection-detail__title">{{ collection.title }}</h1>
      <p class="collection-detail__description">{{ collection.description }}</p>

      <div class="collection-detail__actions">
        <span class="collection-detail__count">
          <LucideUsers :size="16" />
          {{ collection.women.length }} women in this collection
        </span>
        <button class="collection-detail__share-btn" @click="shareCollection">
          <LucideShare2 :size="16" />
          Share this collection
        </button>
      </div>
    </header>

    <div v-if="women.length" class="collection-detail__grid">
      <WomanCard
        v-for="woman in women"
        :key="woman.slug"
        :name="woman.name"
        :slug="woman.slug"
        :image="woman.image"
        :country="woman.country"
        :born="woman.born"
        :died="woman.died"
        :era="woman.era"
        :summary="woman.summary"
        :causes="woman.causes"
      />
    </div>

    <Transition name="toast">
      <div v-if="showToast" class="collection-detail__toast">
        <LucideCheck :size="16" />
        Link copied to clipboard
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

const { data: collection } = await useAsyncData(`collection-${slug}`, () =>
  queryCollection("collections").where("slug", "=", slug).first(),
);

if (!collection.value) {
  throw createError({ statusCode: 404, statusMessage: "Collection not found" });
}

const { data: allWomen } = await useAsyncData("all-women-for-detail", () =>
  queryCollection("women").order("name", "ASC").all(),
);

const women = computed(() => {
  if (!allWomen.value || !collection.value) return [];
  const slugOrder = collection.value.women;
  const womenMap = new Map(allWomen.value.map((w) => [w.slug, w]));
  return slugOrder.flatMap((s) => {
    const w = womenMap.get(s);
    return w ? [w] : [];
  });
});

const showToast = ref(false);

async function shareCollection() {
  const url = `${window.location.origin}/collections/${slug}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${collection.value!.title} — HerStory Africa`,
        text: collection.value!.description,
        url,
      });
      return;
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 2500);
  } catch {
    // Clipboard not available
  }
}

const pageTitle = computed(() => collection.value?.title ?? "Collection");
const pageDescription = computed(
  () =>
    collection.value?.description ??
    "A curated collection of African women from HerStory Africa.",
);

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage: getAbsoluteUrl(),
  ogUrl: getAbsoluteUrl(`/collections/${slug}`),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: getAbsoluteUrl(),
});
</script>

<style scoped>
.collection-detail {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .collection-detail {
    padding: 2.5rem 2rem 4rem;
  }
}

.collection-detail__header {
  margin-bottom: 2.5rem;
}

.collection-detail__theme {
  /* display: inline-block; */
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: var(--color-primary-50);
  color: var(--color-primary);
  /* margin-bottom: 0.75rem; */
}

.dark .collection-detail__theme {
  background: var(--color-primary-950);
}

.collection-detail__title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
  line-height: 1.2;
}

.collection-detail__description {
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--text-secondary);
  margin: 0;
  max-width: 44rem;
}

.collection-detail__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.collection-detail__count {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}

.collection-detail__share-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.125rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.collection-detail__share-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.collection-detail__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 480px) {
  .collection-detail__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .collection-detail__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

.collection-detail__toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-on-primary);
  box-shadow: var(--shadow-elevated);
  z-index: 1000;
}

.toast-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(0.5rem);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-0.25rem);
}
</style>
