import { getCategory, products, type CategorySlug, type Product } from '../data/catalog'

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
]

export const parseSort = (value: string | null): SortKey =>
  SORT_OPTIONS.some(option => option.value === value) ? (value as SortKey) : 'featured'

const haystack = (product: Product) =>
  [product.name, product.unit, getCategory(product.category)?.name ?? '', ...product.keywords].join(' ').toLowerCase()

/** Every word typed must appear somewhere in the product's name, unit, department or keywords. */
export function searchProducts({ query, category, sort }: { query: string; category?: CategorySlug; sort: SortKey }) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const matches = products.filter(product =>
    (!category || product.category === category) && terms.every(term => haystack(product).includes(term)),
  )
  const sorted = [...matches]
  if (sort === 'price-asc') sorted.sort((a, b) => a.priceUgx - b.priceUgx || a.name.localeCompare(b.name))
  if (sort === 'price-desc') sorted.sort((a, b) => b.priceUgx - a.priceUgx || a.name.localeCompare(b.name))
  if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
  // Unavailable items stay visible (honest) but sink below what can be bought.
  if (sort === 'featured') sorted.sort((a, b) => Number(a.availability === 'unavailable') - Number(b.availability === 'unavailable'))
  return sorted
}
