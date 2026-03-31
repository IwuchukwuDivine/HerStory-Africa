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
  date: string
  slug: string
  category: string
  path?: string
}

export interface Collection {
  title: string
  slug: string
  description: string
  theme: string
  women: string[]
  image?: string
  path?: string
}
