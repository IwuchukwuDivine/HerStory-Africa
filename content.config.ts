import { resolve } from 'node:path'
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const contentDir = resolve(__dirname, 'app/content')

export default defineContentConfig({
  collections: {
    women: defineCollection({
      type: 'page',
      source: {
        include: 'women/*.md',
        cwd: contentDir,
        prefix: '/women',
      },
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        country: z.string(),
        region: z.string(),
        born: z.number(),
        died: z.number().nullable(),
        era: z.string(),
        causes: z.array(z.string()),
        image: z.string(),
        imageCredit: z.string(),
        featured: z.boolean(),
        summary: z.string(),
        funFact: z.string().optional(),
        dateAdded: z.string(),
        sameAs: z.array(z.string()).optional(),
        /** One-sentence italic line under the name on the profile. */
        hook: z.string().optional(),
        /** CSS object-position for the portrait crop, e.g. "50% 10%". Defaults to "50% 20%". */
        ogFocal: z.string().optional(),
        /** Minutes, set at build by the content:file:afterParse hook in nuxt.config.ts. */
        readingTime: z.number().optional(),
        /** Body word count, set at build. Content-health signal for /admin/health. */
        wordCount: z.number().optional(),
        /** Citations on the trailing `*Sources: …*` line, set at build. */
        sourceCount: z.number().optional(),
        /** False when the profile is still on the shared placeholder. Set at build. */
        hasPortrait: z.boolean().optional(),
      }),
    }),
    articles: defineCollection({
      type: 'page',
      source: {
        include: 'articles/*.md',
        cwd: contentDir,
        prefix: '/articles',
      },
      schema: z.object({
        title: z.string(),
        description: z.string(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        date: z.string(),
        slug: z.string(),
        category: z.string(),
        image: z.string().optional(),
        imageCredit: z.string().optional(),
        reflectionPrompt: z.string().optional(),
        updated: z.string().optional(),
        featured: z.boolean().optional(),
        women: z.array(z.string()).optional(),
        ogFocal: z.string().optional(),
        readingTime: z.number().optional(),
      }),
    }),
    paths: defineCollection({
      type: 'page',
      source: {
        include: 'paths/*.md',
        cwd: contentDir,
        prefix: '/women/path',
      },
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        /** "Start here", "One event", "One era", "One cause", "One region". */
        kicker: z.string(),
        description: z.string(),
        /** Slug of the woman whose portrait fronts the card. */
        cover: z.string(),
        steps: z.array(
          z.object({
            slug: z.string(),
            /** One sentence, under 120 characters, naming the link to the previous step. */
            why: z.string(),
          }),
        ),
        /** Article slugs for the "Go deeper" panel. */
        further: z.array(z.string()).optional(),
      }),
    }),
    opportunities: defineCollection({
      type: 'page',
      source: {
        include: 'opportunities/*.md',
        cwd: contentDir,
        prefix: '/opportunities',
      },
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        category: z.enum(['scholarship', 'job', 'grant', 'fellowship']),
        organization: z.string(),
        description: z.string(),
        deadline: z.string().nullable(),
        link: z.string(),
        featured: z.boolean(),
      }),
    }),
  },
})
