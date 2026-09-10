// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

// ── Content discovery (build-time) ──────────────────────────────────
// Reads the Markdown collections once at config time so both the
// prerender route list and the sitemap can be derived from the files
// without any runtime queries.
const contentDir = resolve(__dirname, "app/content");

interface ContentEntry {
  slug: string;
  frontmatter: string;
}

function readContentEntries(collection: string): ContentEntry[] {
  const dir = resolve(contentDir, collection);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = readFileSync(resolve(dir, f), "utf8");
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      return { slug: f.replace(/\.md$/, ""), frontmatter: match?.[1] ?? "" };
    });
}

function frontmatterDate(frontmatter: string, key: string): string | undefined {
  const match = frontmatter.match(
    new RegExp(`^${key}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})`, "m"),
  );
  return match?.[1];
}

const womenEntries = readContentEntries("women");
const articleEntries = readContentEntries("articles");
const opportunityEntries = readContentEntries("opportunities");

const contentRoutes = [
  ...womenEntries.map((e) => `/women/${e.slug}`),
  ...articleEntries.map((e) => `/articles/${e.slug}`),
  ...opportunityEntries.map((e) => `/opportunities/${e.slug}`),
];

const contentSitemapUrls = [
  ...womenEntries.map((e) => ({
    loc: `/women/${e.slug}`,
    lastmod: frontmatterDate(e.frontmatter, "dateAdded"),
  })),
  ...articleEntries.map((e) => ({
    loc: `/articles/${e.slug}`,
    lastmod:
      frontmatterDate(e.frontmatter, "updated") ??
      frontmatterDate(e.frontmatter, "date"),
  })),
  ...opportunityEntries.map((e) => ({ loc: `/opportunities/${e.slug}` })),
];

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
    "nuxt-gtag",
    "nuxt-og-image",
  ],

  // ── Static Site Generation ──────────────────────────────────────────
  ssr: true,
  nitro: {
    prerender: {
      routes: ["/", "/sitemap.xml", "/rss.xml", "/opportunities"],
      crawlLinks: true,
    },
  },
  gtag: {
    id: "G-V5FFHGH864",
    enabled: process.env.NODE_ENV === "production",
    initCommands: [
      [
        "consent",
        "default",
        {
          ad_user_data: "denied",
          ad_personalization: "denied",
          ad_storage: "denied",
          analytics_storage: "denied",
          wait_for_update: 500,
        },
      ],
    ],
  },
  hooks: {
    "nitro:config"(nitroConfig) {
      if (nitroConfig.dev) return;

      // Hub pages (/women/region|era|cause/<slug>) and the A-Z index, derived
      // from women frontmatter. Mirrors app/utils/slugify.ts and the
      // CAUSE_HUB_MIN_WOMEN threshold in app/utils/constants/content.ts.
      const slugify = (value: string) =>
        value
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/['\u2019]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      const CAUSE_HUB_MIN_WOMEN = 3;
      const REGIONS = [
        "West Africa",
        "East Africa",
        "Southern Africa",
        "Central Africa",
        "North Africa",
      ];
      const ERAS = [
        "Pre-Colonial",
        "Colonial",
        "Independence",
        "Modern",
        "Contemporary",
      ];

      const scalar = (fm: string, key: string) =>
        fm.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+?)["']?\\s*$`, "m"))?.[1];
      const causeCounts = new Map<string, number>();
      const regionsSeen = new Set<string>();
      const erasSeen = new Set<string>();
      for (const { frontmatter } of womenEntries) {
        const region = scalar(frontmatter, "region");
        const era = scalar(frontmatter, "era");
        if (region) regionsSeen.add(region.toLowerCase());
        if (era) erasSeen.add(era.toLowerCase());
        const list = frontmatter.match(/^causes:\s*\n((?:[ \t]+-[^\n]*\n?)+)/m)?.[1];
        for (const line of list?.split("\n") ?? []) {
          const cause = line
            .replace(/^\s*-\s*/, "")
            .trim()
            .replace(/^["']|["']$/g, "");
          if (cause) causeCounts.set(cause, (causeCounts.get(cause) ?? 0) + 1);
        }
      }

      const hubRoutes = [
        "/women/all",
        ...REGIONS.filter((r) => regionsSeen.has(r.toLowerCase())).map(
          (r) => `/women/region/${slugify(r)}`,
        ),
        ...ERAS.filter((e) => erasSeen.has(e.toLowerCase())).map(
          (e) => `/women/era/${slugify(e)}`,
        ),
        ...[...causeCounts.entries()]
          .filter(([, n]) => n >= CAUSE_HUB_MIN_WOMEN)
          .map(([cause]) => `/women/cause/${slugify(cause)}`),
      ];

      nitroConfig.prerender = nitroConfig.prerender || {};
      nitroConfig.prerender.routes = [
        ...(nitroConfig.prerender.routes || []),
        ...contentRoutes,
        ...hubRoutes,
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
        global: true,
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
    // Generate every image variant at build time as static files. The
    // default on Vercel is its on-demand optimizer, which is metered and
    // returns 402 once the Hobby quota is used up.
    provider: "ipxStatic",
    // Registered so components can opt SVG sources out of optimisation
    // (see app/utils/imageProvider.ts).
    providers: { none: {} },
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
    url: "https://herstoryafrica.com.ng",
  },

  // ── Sitemap ─────────────────────────────────────────────────────────
  sitemap: {
    defaults: {
      changefreq: "weekly",
      priority: 0.7,
    },
    // Per-URL lastmod from content frontmatter; merged by loc with the
    // routes the module discovers from the prerender list.
    urls: contentSitemapUrls,
    exclude: ["/favorites", "/newsletter/confirmed", "/newsletter", "/suggest"],
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
          content: "width=device-width, initial-scale=1",
        },
        // Open Graph
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "HerStory Africa" },
        {
          property: "og:title",
          content: "HerStory Africa: The women history forgot to teach you.",
        },
        {
          property: "og:description",
          content:
            "An educational archive of African women who fought for equality, rights, and social change across history.",
        },
        {
          property: "og:image",
          content: "https://herstoryafrica.com.ng/og-image.png",
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },

        // Twitter / X Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@_DeeVyn" },
        {
          name: "twitter:title",
          content: "HerStory Africa: The women history forgot to teach you.",
        },
        {
          name: "twitter:description",
          content:
            "An educational archive of African women who fought for equality, rights, and social change across history.",
        },
        {
          name: "twitter:image",
          content: "https://herstoryafrica.com.ng/og-image.png",
        },
      ],

      // Apply the saved colour scheme before first paint so a dark-mode
      // reload never flashes light. Mirrors @vueuse/core useDark storage.
      script: [
        {
          key: "theme-init",
          tagPosition: "head",
          innerHTML:
            "(function(){try{var s=localStorage.getItem('vueuse-color-scheme');if(s==='dark'||(s==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');}catch(e){}})();",
        },
      ],

      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/herstory-africa-favicon.svg",
        },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "HerStory Africa — Articles",
          href: "/rss.xml",
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
