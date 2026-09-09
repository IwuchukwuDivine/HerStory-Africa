export const REGIONS = [
  'West Africa',
  'East Africa',
  'Southern Africa',
  'Central Africa',
  'North Africa',
] as const

export const ERAS = [
  'Pre-Colonial',
  'Colonial',
  'Independence',
  'Modern',
  'Contemporary',
] as const

export const CAUSES = [
  'Anti-colonial activism',
  'Anti-colonial resistance',
  'Anti-apartheid activism',
  'Anti-apartheid resistance',
  'Anti-corruption',
  'Anti-pass law resistance',
  'Academic freedom',
  'Black liberation',
  'Children\'s rights',
  'Cultural diplomacy',
  'Cultural preservation',
  'Democracy',
  'Diplomacy & military strategy',
  'Economic reform',
  'Education',
  'Environmental rights',
  'Freedom of expression',
  'Gender equality',
  'Gender-based violence',
  'Global trade & development',
  'Grassroots organising',
  'Healthcare rights',
  'Human rights',
  'Journalism & free press',
  'Labour rights',
  'Nationalist politics',
  'Northern Nigeria women\'s rights',
  'Pan-Africanism',
  'Pass laws',
  'Peace activism',
  'Peace & humanitarian work',
  'Peace & reconciliation',
  'Political leadership',
  'Political rights',
  'Post-conflict reconstruction',
  'Religious & social welfare',
  'Religious leadership',
  'Scholarship & literature',
  'Social justice',
  'Sovereignty & independence',
  'Spiritual leadership',
  'Sport & empowerment',
  'Transparency & anti-corruption',
  'Women\'s education',
  'Women\'s leadership',
  'Women\'s political leadership',
  'Women\'s political participation',
  'Women\'s rights',
  'Women\'s suffrage',
] as const

export const ARTICLE_CATEGORIES = [
  'History',
  'Concepts',
  'Why It Matters',
  'Profiles',
] as const

export type Region = typeof REGIONS[number]
export type Era = typeof ERAS[number]
export type Cause = typeof CAUSES[number]
export type ArticleCategory = typeof ARTICLE_CATEGORIES[number]
