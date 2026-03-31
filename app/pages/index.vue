<template>
  <div>
    <HomeHero />
    <HomeFeaturedWomen />
    <HomeDidYouKnow />
    <HomeArticlesPreview />
    <HomeBrowseByRegion />
    <HomeBrowseByCause />
    <HomeTimelineTeaser />
    <HomeLatestAdditions />
  </div>
</template>

<script setup lang="ts">
const siteDescription =
  "An educational archive of African women who fought for equality, rights, and social change across history.";

useSeoMeta({
  title: "HerStory Africa — The women history forgot to teach you",
  description: siteDescription,
  ogTitle: "HerStory Africa — The women history forgot to teach you",
  ogDescription: siteDescription,
  ogImage: getAbsoluteUrl(),
  ogUrl: getAbsoluteUrl("/"),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "HerStory Africa — The women history forgot to teach you",
  twitterDescription: siteDescription,
  twitterImage: getAbsoluteUrl(),
});
</script>
