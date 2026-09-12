<template>
  <section class="hero wash" :class="{ 'hero--compact': compact }">
    <div class="hero__inner">
      <div class="hero__copy">
        <div v-if="!compact" class="label">
          <span class="rule" aria-hidden="true" />
          <span class="eyebrow">
            A free history archive<span class="hero__desktop-only">
              · {{ counts.women }} women · {{ counts.articles }} articles</span
            >
          </span>
        </div>

        <h1 class="hero__title">
          The women history <em class="hero__accent">forgot</em> to teach you.
        </h1>

        <p v-if="!compact" class="hero__deck">
          <span class="hero__mobile-only">{{ `${counts.women} ` }}</span>African
          women who ruled, fought, built and wrote, and were left out of the
          textbooks. Every profile sourced, free, no paywall.
        </p>

        <div ref="searchWrapperRef" class="hero__search-wrapper">
          <SearchBar
            v-model="searchQuery"
            size="lg"
            placeholder="Search women, causes, countries…"
            class="hero__search"
            @submit="handleSearch"
          />
          <HomeSearchResults
            v-if="searchQuery.trim().length >= 2"
            :query="searchQuery"
            class="hero__results"
            @select="searchQuery = ''"
          />
        </div>

        <div v-if="!compact" class="hero__pills">
          <Pill to="/women" variant="primary" class="hero__pill">
            Browse all {{ counts.women }} women
          </Pill>
          <Pill to="/timeline" variant="secondary" class="hero__pill">
            Timeline
          </Pill>
          <Pill to="/articles" variant="secondary" class="hero__pill">
            <span class="hero__mobile-only">{{ counts.articles }} articles</span>
            <span class="hero__desktop-only">Articles</span>
          </Pill>
        </div>
      </div>

      <div v-if="newest" class="hero__plate">
  
        <FeatureCard
          :name="newest.name"
          :slug="newest.slug"
          :image="newest.image"
          :country="newest.country"
          :eyebrow="`Newest · ${newest.era} · ${newest.country}`"
          :summary="clip(newest.summary, 110)"
          :focal="newest.ogFocal"
          aspect="4 / 4.6"
          captioned
          priority
        />

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { clip } from "~/utils/format";

const router = useRouter();
const searchQuery = ref("");
const searchWrapperRef = ref<HTMLElement>();

const { counts } = await useArchiveCounts();

/* Desktop plate: the newest woman with a real photograph. */
const { data: newest } = await useAsyncData("hero-newest-woman", () =>
  queryCollection("women")
    .select("name", "slug", "image", "country", "era", "summary", "ogFocal", "dateAdded")
    .where("image", "<>", "/women/placeholder.svg")
    .where("image", "<>", "")
    .order("dateAdded", "DESC")
    .limit(1)
    .first(),
);

/*
 * Returning visitors with an unfinished profile get the short hero: the
 * archive is what they came back for. Decided after mount so the server
 * markup and the first client render agree.
 */
const { lastOpened } = useReadingSession();
const { isRead } = useApp();
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
const compact = computed(
  () =>
    mounted.value &&
    !!lastOpened.value &&
    !isRead(lastOpened.value.type, lastOpened.value.slug),
);

onClickOutside(searchWrapperRef, () => {
  searchQuery.value = "";
});

function handleSearch() {
  if (!searchQuery.value.trim()) return;
  router.push({ path: "/women", query: { q: searchQuery.value.trim() } });
  searchQuery.value = "";
}
</script>

<style scoped>
.hero__inner {
  max-width: 70rem;
  margin: 0 auto;
  padding: 36px 24px 28px;
}

.hero--compact .hero__inner {
  padding: 32px 24px 24px;
}

.hero__copy {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero--compact .hero__copy {
  gap: 16px;
}

.hero__title {
  font-size: 38px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  margin: 0;
}

.hero--compact .hero__title {
  font-size: 32px;
}

.hero__accent {
  font-style: italic;
  font-weight: 800;
  color: var(--color-primary);
}

.hero__deck {
  font-size: 17px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
}

.hero__search-wrapper {
  position: relative;
  width: 100%;
}

/* 52px search field; the dropdown hangs off the wrapper. */
.hero .hero__search {
  height: 52px;
  padding: 0 18px;
  max-width: none;
}

.hero__results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  max-width: none;
}

.hero__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero__plate {
  display: none;
}

.hero__desktop-only {
  display: none;
}

@media (min-width: 1024px) {
  .hero__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 440px;
    gap: 64px;
    align-items: center;
    padding: 64px 32px 56px;
  }

  .hero--compact .hero__inner {
    padding: 48px 32px 40px;
  }

  .hero__copy {
    gap: 22px;
  }

  .hero__title {
    font-size: 64px;
    line-height: 1;
    letter-spacing: -1.5px;
    max-width: 620px;
  }

  .hero--compact .hero__title {
    font-size: 44px;
    letter-spacing: -1px;
  }

  .hero__deck {
    font-size: 19px;
    max-width: 560px;
  }

  .hero__search-wrapper {
    max-width: 560px;
  }

  .hero .hero__search {
    height: 56px;
    padding: 0 20px;
  }

  .hero .hero__search :deep(.search-bar__input) {
    font-size: 17px;
  }

  .hero__pill {
    padding: 0 18px;
    font-size: 15px;
  }

  .hero__plate {
    display: flex;
  }

  .hero__mobile-only {
    display: none;
  }

  .hero__desktop-only {
    display: inline;
  }
}
</style>
