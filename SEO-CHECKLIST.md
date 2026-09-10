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
