# AGENTS.md

This file provides guidance to Codex (claude.ai/code) when working with code in this repository.

## Project

HerStory Africa — a static, Markdown-driven educational archive of African women in history. Nuxt 4 + Nuxt Content v3 + Tailwind CSS v4 + Pinia, deployed to Vercel as a fully static site (`nuxt generate`). There is no database; all content is Markdown with zod-validated frontmatter.

## Commands

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run generate     # Static production build → .output/public/
npm run build        # Nuxt build (SSR mode; generate is what deploys)
npm run lint         # ESLint (@nuxt/eslint flat config)
npm run typecheck    # nuxi typecheck (vue-tsc)
npm run newsletter:build -- <slug>   # Build an edition (see emails/README.md); --list shows layouts
npm run newsletter:test -- <slug> <address>  # Send one built edition to one address
npm run resend:setup      # Push contact property + email templates to Resend (needs .env keys)
npm run ai:generate       # Regenerate public/ai-content.json via Anthropic API
```

There is no test suite. `typescript.typeCheck` is enabled in `nuxt.config.ts`, so type errors surface during dev/build too.

## Content system (the core of the site)

- Content lives in `app/content/` (non-default location — collections in `content.config.ts` set `cwd` to it explicitly): `women/`, `articles/`, `opportunities/`, `newsletter/` (editions, see below), `paths/` (editor-curated reading paths, see `CONTRIBUTING.md`). Each collection has a zod frontmatter schema in `content.config.ts`; a file with invalid frontmatter silently drops out of the collection.
- **Adding a woman**: create `app/content/women/[slug].md` + image at `public/women/[slug].jpg|png`. Frontmatter fields and the required body sections (`## Biography`, `## Historical Context`, `## What She Fought For`, `## Major Achievements`, `## Her Impact Today`, ending with a `*Sources: ...*` line) are documented in `CONTRIBUTING.md`; copy an existing profile as a template. Every profile also carries a `hook` (the one-sentence italic line under the name) and may set `ogFocal` (portrait crop focal point used by the hero, the share card and the OG image). `readingTime` is computed at build by the `content:file:afterParse` hook in `nuxt.config.ts`; never write it by hand.
- Valid `region` (5 African regions), `era` (Pre-Colonial → Contemporary), and `causes` values are defined in `app/utils/constants/content.ts`. A new region/cause must be added there or filters won't show it.
- **Writing style for content `.md` files**: profiles and articles must read like they were written by a human storyteller, not an AI. The goal is prose so captivating the reader doesn't notice they just finished a long article. Concretely:
  - No em dashes (—) anywhere in the body text. Restructure the sentence or use commas, periods, or parentheses instead.
  - Avoid AI tell-tale patterns: "It's not just X, it's Y", "played a pivotal role", "left an indelible mark", "a testament to", "In a world where...", rule-of-three sentence stacking, and summary paragraphs that open with "Ultimately" or "In conclusion".
  - Vary sentence length and rhythm. Open sections with a concrete scene, fact, or tension rather than a thesis statement. Let the story carry the reader; don't announce its significance, show it.
- **Prerendering**: a `nitro:config` hook in `nuxt.config.ts` reads the content directories at build time and appends every `/women/*`, `/articles/*`, `/opportunities/*`, `/women/path/*` and `/newsletter/*` route to the prerender list. New content requires no code changes.
- **OG images**: one Satori template, `app/components/OgImage/Card.satori.vue`, renders every route (full-bleed portrait under a dark veil, or a terracotta ground with the continent watermark). Each page calls `defineOgImage("Card", …)`; the module fills `description` from the page meta unless the page passes one. Satori cannot read WOFF2, so the template uses its own family, `Playfair Display OG`, a second global `fonts.families` entry backed only by TTF files in `public/fonts/og/`; the site never uses that family, so browsers never download them. The template's `fontWeight` binding must stay props-dependent so the module keeps the 800/900 and italic faces.
- **Site fonts**: Playfair Display ships as subset WOFF2 in `public/fonts/v1/`, with metric-matched `Playfair Fallback` faces in `main.css` so the swap does not move layout. `vercel.json` caches `/fonts/` for a year (`immutable`), which is what stops returning visitors seeing a font flash; the flip side is that browsers never re-check those files, so if a font file changes, move the whole set to `/fonts/v2/` rather than overwriting in place.

## Architecture notes

- **Search**: `app/composables/useArchiveSearch.ts` builds a client-side MiniSearch index lazily on first use, from `queryCollection(...)` + `queryCollectionSearchSections(...)` across all three collections. Index data is shared via `useState`; consumed by `GlobalSearch.vue` and the home search.
- **State**: single Pinia store `app/store/app.ts` (favourites, read tracking, reflection responses, newsletter/TTS prefs) persisted to localStorage via `pinia-plugin-persistedstate`. Components access it through the `useApp()` composable wrapper, not the store directly.
- **Server**: public runtime endpoints are `server/api/subscribe.post.ts` (Resend contact in the General segment + welcome email), `server/api/newsletter/unsubscribe.post.ts` (signed token from `/newsletter/unsubscribe`), `server/api/resend/webhook.post.ts` (deletes hard-bounced contacts, unsubscribes complaints), `server/api/suggest.post.ts` (GitHub issue creation, `runtimeConfig.githubToken`), and `server/routes/rss.xml.get.ts`. Everything under `server/api/admin/` calls `requireAdmin`. No env vars are needed to browse the site locally; `/admin` needs `NUXT_ADMIN_PASSPHRASE` and `NUXT_SESSION_PASSWORD`.
- **Newsletter (Resend Broadcasts)**: plan and rules in `docs/newsletter/`; email kit in `emails/` (see `emails/README.md`). Editions are `app/content/newsletter/<slug>.md` (`_*` files are samples and never ship). `npm run newsletter:build -- <slug>` writes the sendable copy to `server/assets/newsletter/<slug>/` (commit it; Nitro bundles it, so `/admin/newsletter` reads it without a database) and the images plus the site's web copy (`web.html`) to `public/newsletter/<slug>/`. `/admin/newsletter` previews, sends a test to `NUXT_NEWSLETTER_TEST_ADDRESS` only, saves a Resend draft, and "Approve and schedule" is the only path that reaches subscribers. Helpers: `server/utils/newsletter.ts` (editions, broadcasts, counts) and `server/utils/subscribers.ts` (contacts, unsubscribe tokens, welcome). The site shows editions at `/newsletter/archive` and `/newsletter/[slug]` (the built letter in a frame); future-dated editions are prerendered but noindex and unlisted. Transactional templates (welcome, suggestion replies) are Resend-hosted, defined in `emails/templates/` and pushed with `npm run resend:setup`.
- **AI assistant content**: `AiAssistant.vue` reads pre-computed `public/ai-content.json`, generated offline by `scripts/generate-ai-content.mjs` (Codex Haiku, content-hash cached in `data/ai-content-log.json`). It is not a live API call.
- **Styling**: Tailwind v4 via the Vite plugin (no tailwind.config); theme tokens, dark-mode variables, and base styles live in `app/assets/css/main.css`. Components use scoped BEM-style class names rather than inline utility soup.
- **Design system (Sept 2026 redesign)**: the "museum label" is the signature: a 32×2 gold rule over a 12px spaced-caps eyebrow above every heading (`MuseumLabel.vue`, `.label`/`.eyebrow`/`.rule`), and a ruled italic caption under every photograph (`ImageCaption.vue`). Shared primitives in `main.css`: `.pill*` (every control is at least 44px), `.panel` (one muted panel type, no gradient bars), `.prose` (long reads: 18/1.7 ink, 42rem measure, gold-ruled h2, drop cap), `.list-row*`, `.sheet*` (bottom sheets), `.compact-grid`, `color-mix` tints instead of the `-50` palette steps (they do not flip in dark mode). Minimum type size is 12px. Copy is sentence case except nav labels and proper nouns. Mobile lists use `WomanCardCompact`/`WomanRow`/`ArticleRow`; the full `WomanCard` is for desktop grids only.

## Automation

GitHub Actions crons drive content ops (don't hand-edit their logs in `data/` casually):
- `.github/workflows/newsletter.yml`: reminder only. Daily, it checks whether an edition is due in three days (the 1st or 15th) and sends an ntfy notification saying whether it is written. It never drafts or sends.
- `.github/workflows/opportunities.yml` — Mondays: deletes expired opportunity `.md` files, sources new ones via Gemini, and opens a PR.
