export interface Woman {
  name: string
  slug: string
  country: string
  region: string
  born: number
  died: number | null
  era: string
  causes: string[]
  image: string
  imageCredit: string
  featured: boolean
  summary: string
  hook?: string
  ogFocal?: string
  readingTime?: number
  dateAdded?: string
  path?: string
}

export interface Article {
  title: string
  description: string
  seoTitle?: string
  seoDescription?: string
  date: string
  slug: string
  category: string
  image?: string
  updated?: string
  featured?: boolean
  women?: string[]
  ogFocal?: string
  readingTime?: number
  path?: string
}

export interface ReadingPathStep {
  slug: string
  why: string
}

export interface ReadingPath {
  title: string
  slug: string
  kicker: string
  description: string
  cover: string
  steps: ReadingPathStep[]
  further?: string[]
  path?: string
}
