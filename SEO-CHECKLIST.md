# SEO Build Checklist

Source: audit against Google's SEO Starter Guide (10 Sep 2026). Twelve findings,
grouped into phases so that no two parallel tasks edited the same file.

Status as of 10 Sep 2026: **all twelve items done and verified in a full
`nuxt generate` build.** Nothing committed yet. Items needing the user are at
the bottom.

Legend: `[x]` done · `[~]` needs user input

---

## Phase 1

### Task A — Page-level SEO on dynamic pages
- [x] **#1 Soft 404s.** Unknown `/women/*`, `/articles/*`, `/opportunities/*`
      now throw a fatal 404 (`createError`). Inline "not found" markup removed.
- [x] **#1 Error page.** `noindex, nofollow`, title "Page not found" / "Something went wrong".
- [x] **#7 Titles ≤ 60 chars** on profiles and articles (`app/utils/seoText.ts`,
      `titleTemplate: '%s'`). Verified across all built pages.
- [x] **#8 Descriptions ≤ 160** on profiles, articles, opportunities.
- [x] Schema: `seoTitle`, `seoDescription` optional on articles.
- [x] Trailing-slash URLs no longer break hydration (path normalised in the
      three dynamic pages) and `vercel.json` sets `trailingSlash: false`.

### Task B — Crawl control, sitemap, homepage schema
- [x] **#2 robots.txt** with Sitemap directive and utility-page disallows.
- [x] **#5 Sitemap.** Per-URL `lastmod` from frontmatter (20 distinct values
      instead of 1); `/favorites`, `/newsletter`, `/newsletter/confirmed`,
      `/suggest` excluded; 306 URLs including all hub pages.
- [x] `noindex, follow` on `/favorites` and `/newsletter/confirmed`.
- [x] **#10 Homepage.** Title no longer doubles the brand; `Organization` +
      `WebSite` (with SearchAction) JSON-LD added.

### Task C — Article SEO frontmatter
- [x] `seoTitle` (35–55 chars) and `seoDescription` (120–155) on all 33 articles.

---

## Phase 2

### Task D — Topic hub pages and crawlable listing
- [x] **#6 Hub pages.** 5 regions, 5 eras, 58 causes (≥ 3 women each), all
      server-rendered with unique h1/intro/title/description/canonical and
      `CollectionPage` + `ItemList` JSON-LD. Prerendered and in the sitemap.
- [x] **#4 Crawlable /women.** 24 profile links in the HTML (was 9), hub
      links block, `/women/all` A–Z index with all 197 profiles.
- [x] **#3 Footer + home** link to hub pages; zero `/women?region=` /
      `/women?cause=` links remain in the built HTML.
- [x] Profile cause tags link to hub pages where one exists.
- [x] 3 profiles with `era: "Pre-colonial"` normalised to `Pre-Colonial`.

### Task E — Images, alt text, interstitial
- [x] **#11 Alt text** on every card, timeline, search result and profile hero.
- [x] **#11 Oversized images.** 37 JPEGs resized to ≤ 1600 px: ~188 MB → ~13.5 MB.
- [x] **#12 Interstitial.** Newsletter popup is now a bottom-right slide-in
      card, no backdrop, no scroll lock, scroll-triggered only (verified by
      code review; the hidden browser pane could not scroll to trigger it).

### Task F — In-body internal links for profiles
- [x] **#9.** 75 profiles gained 108 contextual links to other profiles and
      articles. `node scripts/check-internal-links.mjs`: 246 links, 0 broken,
      0 self-links.

---

## Phase 3 — Review
- [x] `npm run lint`: only the 4 pre-existing multi-word component-name errors.
- [x] `npm run typecheck`: passes.
- [x] `npm run generate`: 2,026 routes, exit 0.
- [x] Audit greps on `.output/public`: titles ≤ 60 chars, descriptions ≤ 160,
      sitemap clean, hubs built, robots.txt present, homepage schema present,
      404 route throws (verified on dev server).

---

## PageSpeed pass (10 Sep 2026, mobile homepage scored 66 / 96 / 96 / 100)

- [x] **LCP 6.8 s.** The LCP element was a lazy-loaded card image. The first
      two "Newest in the Archive" cards now load eagerly with
      `fetchpriority="high"` (`WomanCard` `priority` prop).
- [x] **1.8 MB network payload.** Home and listing pages shipped every
      profile's full Markdown body in `_payload.json`. Queries now `select()`
      card fields only: home 1,072 KB → 146 KB, `/women` 964 KB → 97 KB,
      `/timeline` similar.
- [x] **167 KB Google Tag script, 215 ms main thread, 70 KB unused JS.**
      `nuxt-gtag` is now `initMode: "manual"`; the script loads only after a
      visitor grants consent (or on return visits with stored consent).
- [x] **CSS shipped twice.** Nuxt inlined component styles and linked the
      same files. `features.inlineStyles: false`: home HTML 86 KB → 59 KB.
- [x] **Contrast.** "Did you know?" badge text darkened (secondary-700).
- [x] **Security headers** (HSTS with includeSubDomains + preload,
      X-Frame-Options, `frame-ancestors`, COOP, nosniff, Referrer-Policy,
      Permissions-Policy) via `vercel.json`.
- [x] **Hydration mismatch** reported on production could not be reproduced
      in dev or in the current production build (desktop or mobile). Likely
      from the older deploy; re-check after this one ships.
- [ ] Not addressed: a full Content-Security-Policy with `script-src` and
      Trusted Types (would need nonces for gtag and Vercel analytics);
      `_ipx` WebP variants keep `.jpg`/`.png` names so Lighthouse reads them
      as JPEG/PNG (cosmetic; browsers sniff the bytes).

## Post-redesign sweep (11 Sep 2026)

Re-audited every item after the 320-file redesign (reading paths, new OG
cards, museum-label components, shared format helpers).

**Held up, no action needed:** soft 404s on all six dynamic routes;
`robots.txt`; sitemap (310 URLs, 20 distinct `lastmod`, utility pages
excluded, the 4 new reading-path pages picked up by `crawlLinks`); every
page has one `<h1>`, a canonical, a title ≤ 60 and a description ≤ 160,
all unique; `noindex` on `/favorites` and `/newsletter/confirmed`;
24 crawlable profile links on `/women` and 197 on `/women/all`; zero
`/women?region=` style links anywhere in the built HTML; 246 in-body
content links, none broken; alt text on every meaningful image (the
72px face stacks in `ReadingPathCard` use empty alt, which is correct for
decorative thumbnails); Person and Article JSON-LD intact, with hub and
path pages gaining `CollectionPage` + `ItemList`; `ipxStatic` images,
manual-init gtag, `inlineStyles: false`, and the `vercel.json` security
headers all still in place.

**Two things were broken, both now fixed:**

- [x] **Timezone regression.** The redesign consolidated date formatting into
      `longDate()` in `app/utils/format.ts` and dropped `timeZone: "UTC"`.
      Content dates are date-only strings that parse as UTC midnight, so
      every visitor west of UTC saw the previous day and Vue logged
      "Hydration completed but contains mismatches". The opportunity
      countdowns and the expiry filter also went back to reading `Date.now()`
      during render. Re-pinned to UTC in `format.ts`, the article citation
      year, and `opportunities/[slug].vue`; countdowns and the expiry filter
      are client-only again in `OpportunityCard.vue`,
      `opportunities/[slug].vue` and `opportunities/index.vue`.
      Verified clean on four page types under `TZ=America/Los_Angeles`.
- [x] **Duplicate hub titles** (pre-existing, missed in the first review).
      `Spiritual leadership` and `Religious leadership` both rendered
      "African women who led in faith"; `Science` and `Women in science` both
      rendered "African women in science". Headings made distinct, and
      `hubs.ts` now throws at build time if two causes ever share a heading.

**Open recommendation, needs a content decision:** the cause taxonomy splits
several topics across competing thin hubs. Anti-colonial activism (14),
Anti-colonial resistance (9) and Anti-colonialism (4) are three pages for one
subject; Anti-apartheid resistance (8), Anti-apartheid activism (7) and
Anti-apartheid (4) likewise; also Healthcare (3) / Healthcare rights (3) /
Public health (6), and Literature (6) / Scholarship & literature (4).
24 of the 58 cause hubs have fewer than 5 women. Merging the synonyms in
profile frontmatter would retire the thin pages and concentrate the ranking
signal. Listing pages (`/women`, `/articles`, `/timeline`, `/about`,
`/opportunities`) also still carry no JSON-LD.

## Performance sweep (11 Sep 2026)

Live mobile scores after the redesign were 92 / 94 / 100 / 100 with a CLS of
0.136 and a 1,462 KB page. Three regressions, all fixed:

- [x] **CLS 0.136 → 0.001.** The redesign moved the fonts to raw TTF in
      `public/fonts` and they load with `font-display: swap`, so every heading
      and card grew when Playfair replaced the fallback. Added two
      metric-matched `@font-face` rules (`--font-heading`/`--font-body` now
      list `"Playfair Fallback"` before Georgia). The numbers come from
      measuring both typefaces in a browser rather than the OS/2 table, which
      was wrong by 16%: Georgia already matches Playfair's width almost
      exactly, and the shift was entirely vertical.
- [x] **Fonts 1.6 MB → 378 KB on the homepage.** They shipped as uncompressed
      TTF. Converted all twelve to WOFF2 (2,179 KB → 743 KB) and subset them
      to the Latin blocks the archive actually uses (743 KB → 494 KB). All 132
      characters used across content and UI verified present; the naira sign
      was already missing from the typeface before subsetting.
- [x] **Accessibility 94 → 100.** `--color-secondary-600` was used as text in
      ten places and only reaches 3.99:1 on a light surface (and 4.20:1 on the
      muted dark one). Added a theme-aware `--text-gold` token: secondary-700
      in light, secondary-400 in dark, both comfortably past 4.5:1. Footer
      column headings moved from `h4` to `h2` so the heading order never skips.
- [x] **Two hub pages lost their inbound links.** Three profiles spelled their
      causes "Arts and culture" and "Peace and reconciliation" while the hubs
      were built from the "&" spelling, so those tags fell back to a
      `/women?cause=` query URL. Normalised; every cause that has a hub now
      links to it.
- [x] One article description was 162 characters. Trimmed to 138.

Page weight is now 1,052 KB with CLS 0.001 and a11y 100. The remaining
`/women?cause=` links are the intended fallback for the 275 causes with fewer
than three women, and they canonicalise to `/women`.

## Needs the user

- [~] Real, licensed images for the 19 placeholder profiles: abla-pokou,
      adelaide-tambo, ameyo-stella-adadevoh, assia-djebar, brenda-fassie,
      chioma-ajunwa-opara, efua-sutherland, fatima-meer, folake-solanke,
      manthatisi, maryam-uwais, mekatilili-wa-menza, muthoni-kirima,
      phumzile-mlambo-ngcuka, rose-lokissim, sarraounia-mangou, stella-okoli,
      victoria-mxenge, wambui-otieno.
- [~] After deploy: in Search Console resubmit the sitemap, check the Pages
      report for soft-404s clearing, and check Core Web Vitals.
- [~] Swap `twitter:site` (`@_DeeVyn`) to a HerStory account when one exists.
- [~] `404.html` (the static fallback, rarely served on Vercel) still carries
      the default title; the live 404 route renders the proper error page.
