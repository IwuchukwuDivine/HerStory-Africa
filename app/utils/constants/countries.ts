export interface CountryData {
  name: string
  id: string
  region: string
}

/**
 * African countries with their SVG path IDs and region classification.
 * The `id` corresponds to the ISO 3166-1 alpha-2 code used in the SVG map.
 */
export const AFRICAN_COUNTRIES: CountryData[] = [
  // North Africa
  { name: 'Algeria', id: 'DZ', region: 'North Africa' },
  { name: 'Egypt', id: 'EG', region: 'North Africa' },
  { name: 'Libya', id: 'LY', region: 'North Africa' },
  { name: 'Morocco', id: 'MA', region: 'North Africa' },
  { name: 'Sudan', id: 'SD', region: 'North Africa' },
  { name: 'Tunisia', id: 'TN', region: 'North Africa' },

  // West Africa
  { name: 'Benin', id: 'BJ', region: 'West Africa' },
  { name: 'Burkina Faso', id: 'BF', region: 'West Africa' },
  { name: 'Cape Verde', id: 'CV', region: 'West Africa' },
  { name: 'Côte d\'Ivoire', id: 'CI', region: 'West Africa' },
  { name: 'Gambia', id: 'GM', region: 'West Africa' },
  { name: 'Ghana', id: 'GH', region: 'West Africa' },
  { name: 'Guinea', id: 'GN', region: 'West Africa' },
  { name: 'Guinea-Bissau', id: 'GW', region: 'West Africa' },
  { name: 'Liberia', id: 'LR', region: 'West Africa' },
  { name: 'Mali', id: 'ML', region: 'West Africa' },
  { name: 'Mauritania', id: 'MR', region: 'West Africa' },
  { name: 'Niger', id: 'NE', region: 'West Africa' },
  { name: 'Nigeria', id: 'NG', region: 'West Africa' },
  { name: 'Senegal', id: 'SN', region: 'West Africa' },
  { name: 'Sierra Leone', id: 'SL', region: 'West Africa' },
  { name: 'Togo', id: 'TG', region: 'West Africa' },

  // East Africa
  { name: 'Burundi', id: 'BI', region: 'East Africa' },
  { name: 'Comoros', id: 'KM', region: 'East Africa' },
  { name: 'Djibouti', id: 'DJ', region: 'East Africa' },
  { name: 'Eritrea', id: 'ER', region: 'East Africa' },
  { name: 'Ethiopia', id: 'ET', region: 'East Africa' },
  { name: 'Kenya', id: 'KE', region: 'East Africa' },
  { name: 'Madagascar', id: 'MG', region: 'East Africa' },
  { name: 'Mauritius', id: 'MU', region: 'East Africa' },
  { name: 'Rwanda', id: 'RW', region: 'East Africa' },
  { name: 'Seychelles', id: 'SC', region: 'East Africa' },
  { name: 'Somalia', id: 'SO', region: 'East Africa' },
  { name: 'South Sudan', id: 'SS', region: 'East Africa' },
  { name: 'Tanzania', id: 'TZ', region: 'East Africa' },
  { name: 'Uganda', id: 'UG', region: 'East Africa' },

  // Central Africa
  { name: 'Cameroon', id: 'CM', region: 'Central Africa' },
  { name: 'Central African Republic', id: 'CF', region: 'Central Africa' },
  { name: 'Chad', id: 'TD', region: 'Central Africa' },
  { name: 'Democratic Republic of the Congo', id: 'CD', region: 'Central Africa' },
  { name: 'Equatorial Guinea', id: 'GQ', region: 'Central Africa' },
  { name: 'Gabon', id: 'GA', region: 'Central Africa' },
  { name: 'Republic of the Congo', id: 'CG', region: 'Central Africa' },
  { name: 'São Tomé and Príncipe', id: 'ST', region: 'Central Africa' },

  // Southern Africa
  { name: 'Angola', id: 'AO', region: 'Southern Africa' },
  { name: 'Botswana', id: 'BW', region: 'Southern Africa' },
  { name: 'Eswatini', id: 'SZ', region: 'Southern Africa' },
  { name: 'Lesotho', id: 'LS', region: 'Southern Africa' },
  { name: 'Malawi', id: 'MW', region: 'Southern Africa' },
  { name: 'Mozambique', id: 'MZ', region: 'Southern Africa' },
  { name: 'Namibia', id: 'NA', region: 'Southern Africa' },
  { name: 'South Africa', id: 'ZA', region: 'Southern Africa' },
  { name: 'Zambia', id: 'ZM', region: 'Southern Africa' },
  { name: 'Zimbabwe', id: 'ZW', region: 'Southern Africa' },
]

/** Lookup map: country name → CountryData */
export const COUNTRY_BY_NAME = Object.fromEntries(
  AFRICAN_COUNTRIES.map(c => [c.name, c])
) as Record<string, CountryData>

/** Lookup map: SVG path ID → CountryData */
export const COUNTRY_BY_ID = Object.fromEntries(
  AFRICAN_COUNTRIES.map(c => [c.id, c])
) as Record<string, CountryData>

/**
 * Normalize country name variants found in profile data.
 * E.g. "The Gambia" → "Gambia"
 */
export function normalizeCountryName(name: string): string {
  const aliases: Record<string, string> = {
    'The Gambia': 'Gambia',
    'Ivory Coast': 'Côte d\'Ivoire',
    'DR Congo': 'Democratic Republic of the Congo',
    'DRC': 'Democratic Republic of the Congo',
    'Congo-Kinshasa': 'Democratic Republic of the Congo',
    'Congo-Brazzaville': 'Republic of the Congo',
    'Swaziland': 'Eswatini',
  }
  return aliases[name] ?? name
}
