// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  runtimeConfig: {
    buttondownApiKey: "",
    githubToken: "",
  },

  modules: [
    "@nuxt/image",
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "nuxt-lucide-icons",
    "@nuxtjs/sitemap",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@vercel/speed-insights",
    "@vite-pwa/nuxt",
  ],

  // ── Static Site Generation ──────────────────────────────────────────
  ssr: true,
  nitro: {
    prerender: {
      routes: ["/", "/sitemap.xml"],
      crawlLinks: true,
    },
  },

  hooks: {
    async "nitro:config"(nitroConfig) {
      if (nitroConfig.dev) return;
      const { resolve } = await import("node:path");
      const { readdirSync } = await import("node:fs");
      const contentDir = resolve(__dirname, "app/content");

      const women = readdirSync(resolve(contentDir, "women"))
        .filter((f: string) => f.endsWith(".md"))
        .map((f: string) => `/women/${f.replace(".md", "")}`);

      const articles = readdirSync(resolve(contentDir, "articles"))
        .filter((f: string) => f.endsWith(".md"))
        .map((f: string) => `/articles/${f.replace(".md", "")}`);

      nitroConfig.prerender = nitroConfig.prerender || {};
      nitroConfig.prerender.routes = [
        ...(nitroConfig.prerender.routes || []),
        ...women,
        ...articles,
      ];
    },
  },

  // ── Vite ────────────────────────────────────────────────────────────
  vite: {
    // @ts-expect-error - type mismatch between @tailwindcss/vite and Nuxt's bundled Vite types
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@vueuse/core"],
    },
  },

  // ── Fonts ───────────────────────────────────────────────────────────
  fonts: {
    families: [
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-Regular.ttf",
        weight: 400,
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-Italic.ttf",
        weight: 400,
        style: "italic",
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-Medium.ttf",
        weight: 500,
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-MediumItalic.ttf",
        weight: 500,
        style: "italic",
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-SemiBold.ttf",
        weight: 600,
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-SemiBoldItalic.ttf",
        weight: 600,
        style: "italic",
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-Bold.ttf",
        weight: 700,
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-BoldItalic.ttf",
        weight: 700,
        style: "italic",
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-ExtraBold.ttf",
        weight: 800,
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-ExtraBoldItalic.ttf",
        weight: 800,
        style: "italic",
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-Black.ttf",
        weight: 900,
      },
      {
        name: "Playfair Display",
        src: "~/assets/fonts/PlayfairDisplay-BlackItalic.ttf",
        weight: 900,
        style: "italic",
      },
    ],
  },

  // ── Nuxt Content ────────────────────────────────────────────────────
  content: {
    // Enables the document-driven mode (optional but useful)
    // documentDriven: true,

    build: {
      markdown: {
        // Syntax highlighting for code blocks (ProsePre / ProseCode)
        highlight: {
          theme: "github-light",
          langs: ["markdown", "json"],
        },
      },
    },
  },

  // ── TypeScript ──────────────────────────────────────────────────────
  typescript: {
    typeCheck: true,
  },

  // ── Image Optimisation ──────────────────────────────────────────────
  image: {
    quality: 80,
    format: ["webp", "jpg"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },

  // ── Site URL (required by sitemap + SEO modules) ───────────────────
  site: {
    url: "https://her-story-africa-seven.vercel.app",
  },

  // ── Sitemap ─────────────────────────────────────────────────────────
  sitemap: {
    defaults: {
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date().toISOString(),
    },
    sitemaps: false,
  },

  // ── App Head (SEO + Social) ─────────────────────────────────────────
  app: {
    head: {
      title: "HerStory Africa",
      titleTemplate: "%s | HerStory Africa",

      htmlAttrs: {
        lang: "en",
      },

      meta: [
        {
          name: "description",
          content:
            "The women history forgot to teach you. An educational archive of African women who fought for equality, rights, and social change.",
        },
        { name: "theme-color", content: "#b5451b" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        // Open Graph
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "HerStory Africa" },
        {
          property: "og:title",
          content: "HerStory Africa — The women history forgot to teach you.",
        },
        {
          property: "og:description",
          content:
            "An educational archive of African women who fought for equality, rights, and social change across history.",
        },
        {
          property: "og:image",
          content: "https://her-story-africa-seven.vercel.app/og-image.png",
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },

        // Twitter / X Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@_DeeVyn" },
        {
          name: "twitter:title",
          content: "HerStory Africa — The women history forgot to teach you.",
        },
        {
          name: "twitter:description",
          content:
            "An educational archive of African women who fought for equality, rights, and social change across history.",
        },
        {
          name: "twitter:image",
          content: "https://her-story-africa-seven.vercel.app/og-image.png",
        },
      ],

      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/herstory-africa-favicon.svg",
        },
        {
          rel: "apple-touch-icon",
          href: "/icons/apple-icon-180.png",
        },
        {
          rel: "manifest",
          href: "/manifest.webmanifest",
        },
      ],
    },
  },
  pwa: {
    registerType: "prompt",
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      type: "module",
    },
    manifest: {
      name: "HerStory Africa",
      lang: "en",
      short_name: "HerStory Africa",
      description: "The women history forgot to teach you.",
      theme_color: "#b5451b",
      background_color: "#fdf8f3",
      display: "standalone",
      scope: "/",
      start_url: "/?source=pwa",
      icons: [
        {
          src: "/icons/manifest-icon-192.maskable.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/manifest-icon-192.maskable.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "/icons/manifest-icon-512.maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/manifest-icon-512.maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{html,js,css,svg,png,ico,woff2}"],
      ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^source/],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: /\.(?:jpg|jpeg|webp|gif)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60,
            },
          },
        },
      ],
    },
  },
  devServer: {
    host: "0.0.0.0",
  },
  components: true,
  css: ["~/assets/css/main.css"],
});
