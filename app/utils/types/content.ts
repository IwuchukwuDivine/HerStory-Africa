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
  path?: string
}
