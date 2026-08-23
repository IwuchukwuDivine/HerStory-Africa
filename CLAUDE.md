# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

HerStory Africa — a static, Markdown-driven educational archive of African women in history. Nuxt 4 + Nuxt Content v3 + Tailwind CSS v4 + Pinia, deployed to Vercel as a fully static site (`nuxt generate`). There is no database; all content is Markdown with zod-validated frontmatter.

## Commands

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run generate     # Static production build → .output/public/
npm run build        # Nuxt build (SSR mode; generate is what deploys)
npm run lint         # ESLint (@nuxt/eslint flat config)
npm run typecheck    # nuxi typecheck (vue-tsc)
npm run newsletter:draft  # Draft newsletter via Buttondown (needs .env keys)
npm run ai:generate       # Regenerate public/ai-content.json via Anthropic API
```

There is no test suite. `typescript.typeCheck` is enabled in `nuxt.config.ts`, so type errors surface during dev/build too.

## Content system (the core of the site)

- Content lives in `app/content/` (non-default location — collections in `content.config.ts` set `cwd` to it explicitly): `women/`, `articles/`, `opportunities/`. Each collection has a zod frontmatter schema in `content.config.ts`; a file with invalid frontmatter silently drops out of the collection.
- **Adding a woman**: create `app/content/women/[slug].md` + image at `public/women/[slug].jpg|png`. Frontmatter fields and the required body sections (`## Biography`, `## Historical Context`, `## What She Fought For`, `## Major Achievements`, `## Her Impact Today`, ending with a `*Sources: ...*` line) are documented in `CONTRIBUTING.md`; copy an existing profile as a template.
- Valid `region` (5 African regions), `era` (Pre-Colonial → Contemporary), and `causes` values are defined in `app/utils/constants/content.ts`. A new region/cause must be added there or filters won't show it.
- **Writing style for content `.md` files**: profiles and articles must read like they were written by a human storyteller, not an AI. The goal is prose so captivating the reader doesn't notice they just finished a long article. Concretely:
  - No em dashes (—) anywhere in the body text. Restructure the sentence or use commas, periods, or parentheses instead.
  - Avoid AI tell-tale patterns: "It's not just X, it's Y", "played a pivotal role", "left an indelible mark", "a testament to", "In a world where...", rule-of-three sentence stacking, and summary paragraphs that open with "Ultimately" or "In conclusion".
  - Vary sentence length and rhythm. Open sections with a concrete scene, fact, or tension rather than a thesis statement. Let the story carry the reader; don't announce its significance, show it.
- **Prerendering**: a `nitro:config` hook in `nuxt.config.ts` reads the content directories at build time and appends every `/women/*`, `/articles/*`, `/opportunities/*` route to the prerender list. New content requires no code changes.

## Architecture notes

- **Search**: `app/composables/useArchiveSearch.ts` builds a client-side MiniSearch index lazily on first use, from `queryCollection(...)` + `queryCollectionSearchSections(...)` across all three collections. Index data is shared via `useState`; consumed by `GlobalSearch.vue` and the home search.
- **State**: single Pinia store `app/store/app.ts` (favourites, read tracking, reflection responses, newsletter/TTS prefs) persisted to localStorage via `pinia-plugin-persistedstate`. Components access it through the `useApp()` composable wrapper, not the store directly.
- **Server**: the only runtime endpoints are `server/api/subscribe.post.ts` (Buttondown, `runtimeConfig.buttondownApiKey`), `server/api/suggest.post.ts` (GitHub issue creation, `runtimeConfig.githubToken`), and `server/routes/rss.xml.get.ts`. No env vars are needed for local dev.
- **AI assistant content**: `AiAssistant.vue` reads pre-computed `public/ai-content.json`, generated offline by `scripts/generate-ai-content.mjs` (Claude Haiku, content-hash cached in `data/ai-content-log.json`). It is not a live API call.
- **OG images**: `nuxt-og-image` with satori templates in `app/components/OgImage/` (`*.satori.vue`); Playfair Display font files in `app/assets/fonts/` are used both for the site and OG rendering.
- **Styling**: Tailwind v4 via the Vite plugin (no tailwind.config); theme tokens, dark-mode variables, and base styles live in `app/assets/css/main.css`. Components use scoped BEM-style class names rather than inline utility soup.

## Automation

GitHub Actions crons drive content ops (don't hand-edit their logs in `data/` casually):
- `.github/workflows/newsletter.yml` — drafts a Buttondown newsletter on the 1st and 15th (Gemini-assisted), commits `data/newsletter-log.json`.
- `.github/workflows/opportunities.yml` — Mondays: deletes expired opportunity `.md` files, sources new ones via Gemini, and opens a PR.
