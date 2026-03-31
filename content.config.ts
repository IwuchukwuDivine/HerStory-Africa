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
        date: z.string(),
        slug: z.string(),
        category: z.string(),
        image: z.string().optional(),
        imageCredit: z.string().optional(),
      }),
    }),
  },
})
