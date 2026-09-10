<template>
  <div>
    <HomeHero />
    <HomeFeaturedWomen />
    <HomeDidYouKnow />
    <HomeArticlesPreview />
    <HomeBrowseByRegion />
    <HomeBrowseByCause />
    <HomeTimelineTeaser />
  </div>
</template>

<script setup lang="ts">
const siteDescription =
  "An educational archive of African women who fought for equality, rights, and social change across history.";

useSeoMeta({
  title: "HerStory Africa: The women history forgot to teach you",
  description: siteDescription,
  ogTitle: "HerStory Africa: The women history forgot to teach you",
  ogDescription: siteDescription,
  ogImage: getAbsoluteUrl(),
  ogUrl: getAbsoluteUrl("/"),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "HerStory Africa: The women history forgot to teach you",
  twitterDescription: siteDescription,
  twitterImage: getAbsoluteUrl(),
});

useHead({
  titleTemplate: "%s",
  link: [{ rel: "canonical", href: getAbsoluteUrl("/") }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": getAbsoluteUrl("/#organization"),
            name: "HerStory Africa",
            url: getAbsoluteUrl("/"),
            logo: getAbsoluteUrl("/herstory-africa-logo.svg"),
            email: "hello.herstoryafrica@gmail.com",
            sameAs: [
              "https://x.com/_DeeVyn",
              "https://github.com/IwuchukwuDivine/herstory-africa",
            ],
          },
          {
            "@type": "WebSite",
            "@id": getAbsoluteUrl("/#website"),
            name: "HerStory Africa",
            url: getAbsoluteUrl("/"),
            description: siteDescription,
            publisher: { "@id": getAbsoluteUrl("/#organization") },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: getAbsoluteUrl("/women?q={search_term_string}"),
              },
              "query-input": "required name=search_term_string",
            },
          },
        ],
      }),
    },
  ],
});
</script>
