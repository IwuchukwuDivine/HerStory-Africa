# HerStory Africa

> **The women history forgot to teach you.**

HerStory Africa is an open-source educational archive documenting African women who fought for equality, rights, and social change across history. Built for students, teenagers, and young adults who want to understand the real, full story of African history — told through the women who shaped it.

Currently featuring **137 women** and **24 articles**.

---

## What It Is

A fast, static, searchable digital archive and learning platform. No fluff. No paywalls. Just history that deserves to be told.

Users can:

- Search for historical figures by name, country, or cause
- Browse women by region (West, East, Southern, Central, North Africa)
- Filter by era (Pre-Colonial, Colonial, Independence, Modern, Contemporary)
- Explore an interactive timeline of key moments in African women's history
- Read educational articles providing context for younger audiences
- Listen to any profile or article with built-in text-to-speech (voice selection, speed control, seekable progress)
- Save favourites and track reading progress (persisted locally)
- Subscribe to the newsletter
- Toggle between light and dark mode

---

## Tech Stack

| Tool                                        | Purpose                               |
| ------------------------------------------- | ------------------------------------- |
| [Nuxt 4](https://nuxt.com)                 | Framework (Vue 3, file-based routing) |
| [Nuxt Content v3](https://content.nuxt.com) | Markdown-based content layer          |
| [@nuxt/image](https://image.nuxt.com)      | Optimised image handling              |
| [Tailwind CSS v4](https://tailwindcss.com)  | Utility-first CSS + custom tokens     |
| [Pinia](https://pinia.vuejs.org)            | State management (persisted to localStorage) |
| [Lucide Icons](https://lucide.dev)          | Icon library                          |
| [VueUse](https://vueuse.org)               | Composables (dark mode, focus trap)   |
| [@nuxtjs/sitemap](https://sitemap.nuxt.com) | Auto-generated sitemap               |
| [Vercel](https://vercel.com)               | Hosting & deployment                  |

Static site generation. No backend. No database. Content lives in Markdown files.

---

## Project Structure

```
herstory-africa/
├── app/
│   ├── assets/
│   │   ├── css/main.css              # Theme tokens, base styles, accessibility helpers
│   │   └── fonts/                    # Playfair Display font files
│   ├── components/
│   │   ├── Home/
│   │   │   ├── Hero.vue              # Tagline, search bar, live results
│   │   │   ├── FeaturedWomen.vue     # 6 featured profile cards
│   │   │   ├── BrowseByRegion.vue    # Region grid with counts
│   │   │   ├── BrowseByCause.vue     # Cause tag pills
│   │   │   ├── TimelineTeaser.vue    # 4-event vertical timeline
│   │   │   ├── LatestAdditions.vue   # Recent women + articles
│   │   │   └── SearchResults.vue     # Live search dropdown
│   │   ├── ArticleCard.vue
│   │   ├── BackToTop.vue
│   │   ├── FavoriteButton.vue        # Toggle favourite on any profile/article
│   │   ├── FilterBy.vue
│   │   ├── Footer.vue
│   │   ├── ListenButton.vue          # Text-to-speech UI (voice, speed, seek)
│   │   ├── Logo.vue                  # Inline SVG, theme-reactive
│   │   ├── Navbar.vue                # Desktop nav + mobile drawer
│   │   ├── NewsletterCta.vue         # Inline newsletter call-to-action
│   │   ├── NewsletterForm.vue        # Email input + subscription logic
│   │   ├── NewsletterModal.vue       # Timed newsletter prompt
│   │   ├── Pagination.vue
│   │   ├── SearchBar.vue
│   │   └── WomanCard.vue
│   ├── composables/
│   │   ├── useApp.ts                 # Convenience wrapper around the Pinia store
│   │   ├── useReadTracker.ts         # Marks content as read on visit
│   │   └── useTextToSpeech.ts        # Web Speech API logic (chunking, progress, seek)
│   ├── content/
│   │   ├── women/                    # 137 profiles (one .md file each)
│   │   └── articles/                 # 24 educational explainers
│   ├── layouts/
│   │   └── default.vue               # Skip-to-content link, Navbar, slot, Footer
│   ├── pages/
│   │   ├── index.vue                 # Home page
│   │   ├── about.vue                 # About the project + creator
│   │   ├── favorites.vue             # User's saved favourites
│   │   ├── timeline.vue              # Full interactive timeline
│   │   ├── women/
│   │   │   ├── index.vue             # Listing with search, filters, pagination
│   │   │   └── [name].vue            # Individual profile page
│   │   ├── articles/
│   │   │   ├── index.vue             # Paginated article listing
│   │   │   └── [id].vue              # Individual article page
│   │   └── newsletter/
│   │       ├── index.vue             # Newsletter landing page
│   │       └── confirmed.vue         # Post-subscription confirmation
│   ├── store/
│   │   └── app.ts                    # Pinia store (favourites, read list, TTS prefs)
│   ├── utils/
│   │   ├── constants/content.ts      # Regions, eras, causes
│   │   ├── types/content.ts          # TypeScript interfaces
│   │   └── scrollToTop.ts            # Smooth scroll utility
│   ├── app.vue
│   └── error.vue                     # Branded error page (404/500)
├── content.config.ts                 # Nuxt Content collection schemas
├── nuxt.config.ts
├── public/
│   ├── women/                        # Profile images (JPG/PNG)
│   ├── herstory-africa-logo.svg
│   ├── herstory-africa-favicon.svg
│   └── robots.txt
├── package.json
└── tsconfig.json
```

---

## Content Schema

Each woman's profile is a Markdown file with structured frontmatter:

```yaml
---
name: "Funmilayo Ransome-Kuti"
slug: "funmilayo-ransome-kuti"
country: "Nigeria"
region: "West Africa"
born: 1900          # null if unknown
died: 1978          # null if still alive
era: "Colonial"
causes:
  - "Political rights"
  - "Anti-colonial activism"
  - "Women's education"
  - "Labour rights"
image: "/women/funmilayo-ransome-kuti.png"
imageCredit: "Wikimedia Commons / Public Domain"
featured: true
summary: "Nigerian activist who led the Abeokuta Women's Union..."
---
## Biography
...
## Historical Context
...
## What She Fought For
...
## Major Achievements
...
## Her Impact Today
...
```

Valid values for key fields:

- **region**: West Africa, East Africa, Southern Africa, Central Africa, North Africa
- **era**: Pre-Colonial, Colonial, Independence, Modern, Contemporary
- **causes**: See `app/utils/constants/content.ts` for the full list
- **born / died**: Year as a number, or `null` if unknown / still alive

---

## Accessibility

- Skip-to-content link for keyboard navigation
- Semantic HTML throughout (`<article>`, `<nav>`, `<main>`, `<header>`, `<footer>`)
- ARIA labels on interactive controls (search, filters, text-to-speech, newsletter)
- `aria-live` regions for dynamic status messages
- `prefers-reduced-motion` respected for animations
- Light and dark mode with sufficient contrast

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/IwuchukwuDivine/herstory-africa.git
cd herstory-africa

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Script              | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start development server       |
| `npm run build`     | Build for production           |
| `npm run generate`  | Generate static site           |
| `npm run preview`   | Preview production build       |
| `npm run lint`      | Run ESLint                     |
| `npm run typecheck` | Run TypeScript type checking   |

### Build for Production

```bash
npm run generate
```

Outputs a fully static site to `.output/public/` — ready to deploy to Vercel.

---

## Adding a New Profile

1. Create a new file in `app/content/women/[slug].md`
2. Fill in the frontmatter schema (see above)
3. Write the biography sections in Markdown
4. Add a profile image to `public/women/[slug].jpg`
5. If the profile uses a new region or cause, add it to `app/utils/constants/content.ts`
6. Commit and push — Vercel deploys automatically

No code changes required to add new women to the archive.

---

## Contributing

Contributions are welcome — especially from people who know their country's history well.

**How to contribute a profile:**

1. Fork the repo
2. Add a new Markdown file in `app/content/women/`
3. Source your information (Wikipedia, Britannica, BlackPast.org, primary sources preferred)
4. Submit a pull request with your sources listed

Please do not submit profiles without verifiable sources.

**Contributing an article:**
Same process — add a Markdown file to `app/content/articles/` and open a PR.

---

## Image Licensing

All images used in this project are sourced from Wikimedia Commons under Creative Commons or public domain licenses. Image credits are noted in each profile's frontmatter. Where no freely licensed image of a woman exists, the profile shows a placeholder and the credit line says so; we do not use fair-use or unlicensed photographs.

If you find a licensing issue, please open an issue immediately.

---

## Roadmap

- [x] Project scaffold
- [x] 137 women's profiles
- [x] 24 educational articles
- [x] Home page with featured women
- [x] Profile and article pages
- [x] Live search functionality
- [x] Browse by region and cause
- [x] Interactive full timeline page
- [x] Mobile-responsive design
- [x] Dark mode
- [x] Pagination
- [x] Navbar and mobile drawer
- [x] SEO and sitemap
- [x] Text-to-speech (voice selection, speed control, seekable progress)
- [x] Favourites system (persisted locally)
- [x] Newsletter subscription
- [x] About page
- [x] Accessibility (skip-link, ARIA labels, screen reader support)
- [ ] Multilingual support (French, Swahili, Arabic)
- [ ] OG image generation
- [ ] Community contributions portal

---

## Why This Exists

African women have been at the forefront of resistance, nation-building, and social change for centuries. Most of their names never made it into school textbooks.

HerStory Africa exists to change that — one profile at a time.

---

## License

MIT License. Free to use, share, and build on.

---

## Built By

[Divine Iwuchukwu](https://deevyn-portfolio.vercel.app/) — Full Stack Developer

---

_HerStory Africa — The women history forgot to teach you._
