# Contributing to HerStory Africa

Thank you for wanting to help tell the stories of African women who shaped history. This project is built on research, accuracy, and respect — and contributions that share those values are always welcome.

## Ways to Contribute

### 1. Add a woman's profile

This is the most impactful contribution. If you know an African woman whose story deserves to be here:

1. Fork the repository
2. Create a new file: `app/content/women/[slug].md` (use lowercase, hyphenated slug)
3. Follow the profile schema below
4. Add a profile image to `public/women/[slug].jpg` or `.png`
5. Submit a pull request with your sources listed

### 2. Add an article

Articles provide context, analysis, or explainers for a general audience. Same process — add a Markdown file to `app/content/articles/` and open a PR.

### 3. Fix an error

If you spot a factual error, a broken link, or a typo, open an issue or submit a PR directly.

### 4. Improve the code

Bug fixes, performance improvements, and accessibility enhancements are welcome. For larger changes, open an issue first to discuss the approach.

## Profile Schema

Every woman's profile must include this frontmatter:

```yaml
---
name: "Full Name"
slug: "full-name"
country: "Country"
region: "West Africa"        # West Africa | East Africa | Southern Africa | Central Africa | North Africa
born: 1900                   # Year as number, or null if unknown
died: 1978                   # Year as number, or null if still alive
era: "Colonial"              # Pre-Colonial | Colonial | Independence | Modern | Contemporary
causes:
  - "Political rights"
  - "Women's education"
image: "/women/full-name.png"
imageCredit: "Source / License"
featured: false
summary: "One or two sentences summarising who she was and what she did."
hook: "One sentence, under 90 characters, on the thing she is remembered for."
ogFocal: "50% 20%"           # optional: object-position for the portrait crop (share card, OG image, hero)
dateAdded: "2026-03-15"
---
```

`hook` is the italic line under her name on the profile, written like a museum wall label: one concrete sentence drawn from the body (a place, a number, a date, a thing she did), no dashes, no quotation marks, and never a repeat of the summary. `ogFocal` only needs setting when the default crop cuts the face (tall head-and-shoulders portraits want `"50% 10%"`, faces that sit low want `"50% 40%"`). Reading time is computed at build from the word count; do not add it by hand.

The body should include these sections in order:

- `## Biography`
- `## Historical Context`
- `## What She Fought For`
- `## Major Achievements`
- `## Her Impact Today`

End with a sources line: `*Sources: Wikipedia (Name), Encyclopædia Britannica, etc.*`

See any existing profile in `app/content/women/` for reference.

## Article Schema

```yaml
---
title: "Article Title"
description: "A one-sentence summary."
date: 2026-03-15
slug: article-slug
category: "History"          # History | Concepts | Why It Matters
image: "/articles/article-slug.jpg"      # optional
imageCredit: "Source / License"           # optional
ogFocal: "50% 30%"                        # optional crop focal point for the hero and OG image
women:                                    # optional: profile slugs mentioned in the story
  - "full-name"
reflectionPrompt: "A question for the reader."   # optional
---
```

## Reading Path Schema

A reading path is four to six profiles in an editor's order, with one sentence on why each is next. Files live in `app/content/paths/` and appear at `/women/path/<slug>`, on the home page, and as a banner inside the profiles they contain.

```yaml
---
title: "The Aba Women's War, in five lives"
slug: "aba-womens-war"
kicker: "One event"          # Start here | One event | One era | One cause | One region
description: "Two or three sentences on what the path shows."
cover: "funmilayo-ransome-kuti"   # slug of a step whose portrait fronts the card (needs a real photo)
steps:
  - slug: "omu-okwei"
    why: "One sentence under 120 characters that names the link to the previous step."
further:                     # optional article slugs for the "Go deeper" panel
  - "the-aba-womens-war"
---
A short editor's note (two or three sentences) on why the path exists.
```

## Sourcing Requirements

- Every profile must cite verifiable sources: Wikipedia, Encyclopædia Britannica, national archives, academic publications, or primary historical documents.
- Do not submit profiles based solely on social media posts, blog articles, or unverified claims.
- Image sources must be public domain, Creative Commons, or explicitly licensed for use. Note the license in `imageCredit`.

## Development Setup

```bash
git clone https://github.com/IwuchukwuDivine/herstory-africa.git
cd herstory-africa
cp .env.example .env
npm install
npm run dev
```

The site runs at `http://localhost:3000`.

## Code Style

- Vue components use `<script setup lang="ts">`
- BEM-style class naming with component prefix (e.g. `suggest__field`)
- CSS custom properties from the theme — never hardcode colours
- No unnecessary comments — code should be self-explanatory

Run `npm run lint` before submitting a PR.

## Pull Request Guidelines

- Keep PRs focused — one profile, one fix, or one feature per PR.
- Write a clear description of what changed and why.
- For new profiles, list your sources in the PR description.
- For code changes, explain the reasoning.

## Questions?

Open an issue or reach out. We would rather you ask than guess.
