import { useMemo, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { categories, getCategory } from '../data/catalog'
import { getBranch } from '../data/branches'
import { parseSort, searchProducts, SORT_OPTIONS } from '../lib/search'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { usePreferences } from '../state/PreferencesContext'
import { ProductCard } from '../components/ProductCard'
import { Icon } from '../components/Icon'
import { Img } from '../components/Img'

export default function Shop() {
  const { categorySlug } = useParams()
  const [params, setParams] = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)
  const { branch, method } = usePreferences()
  const category = getCategory(categorySlug)
  const unknownCategory = Boolean(categorySlug) && !category
  const query = params.get('q') ?? ''
  const sort = parseSort(params.get('sort'))

  useDocumentTitle(unknownCategory ? 'Department not found' : category ? category.name : 'Shop')

  const results = useMemo(() => searchProducts({ query, category: category?.slug, sort }), [query, category, sort])

  // Search and sort live in the URL so a filtered view can be refreshed, shared or
  // returned to with Back. Typing replaces the entry rather than flooding history.
  const update = (key: 'q' | 'sort', value: string) => {
    setParams(current => {
      const next = new URLSearchParams(current)
      if (value && !(key === 'sort' && value === 'featured')) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: key === 'q', preventScrollReset: true })
  }

  const keepParams = params.toString() ? `?${params.toString()}` : ''
  const hasFilters = Boolean(query || category || sort !== 'featured')
  const branchName = getBranch(branch)?.name

  if (unknownCategory) {
    return (
      <section className="page-intro container">
        <p className="eyebrow">Shop</p>
        <h1 className="page-title">We couldn’t find that department.</h1>
        <p className="lede">It may have moved, or the link may be mistyped.</p>
        <div className="button-row">
          <Link to="/shop" className="button button--primary">Browse all products</Link>
        </div>
        <ul className="dept-links">
          {categories.map(item => <li key={item.slug}><Link to={`/shop/${item.slug}`}>{item.name}</Link></li>)}
        </ul>
      </section>
    )
  }

  return (
    <div className="shop">
      <section className={`shop-hero ${category ? 'shop-hero--category' : ''}`}>
        <div className="container shop-hero__inner">
          <div>
            <p className="eyebrow">{category ? 'Department' : 'Shop'}</p>
            <h1 className="page-title">{category ? category.name : 'Everything in store'}</h1>
            <p className="lede">{category ? category.blurb : 'Fresh produce, bakery, pantry staples and household essentials — all in one basket.'}</p>
            <p className="shop-hero__pref">
              <Icon name="pin" size={16} />
              {branchName
                ? <>{method === 'collection' ? 'Collecting from' : 'Shopping from'} <strong>{branchName}</strong> · <Link to="/branches">Change</Link></>
                : <><Link to="/branches">Choose a branch</Link> for delivery or collection</>}
            </p>
          </div>
          {category && (
            <div className="shop-hero__image">
              <Img name={category.image} widths={[640, 1024]} ratio={[3, 2]} sizes="(min-width: 900px) 40vw, 100vw" alt={category.imageAlt} priority />
            </div>
          )}
        </div>
      </section>

      <section className="container shop-tools" aria-label="Search and filters">
        <form className="search-box" role="search" onSubmit={event => { event.preventDefault(); searchRef.current?.blur() }}>
          <label htmlFor="shop-search" className="visually-hidden">Search products</label>
          <Icon name="search" size={20} />
          <input
            id="shop-search"
            ref={searchRef}
            type="search"
            placeholder="Search bananas, bread, rice…"
            autoComplete="off"
            enterKeyHint="search"
            value={query}
            onChange={event => update('q', event.target.value)}
          />
          {query && (
            <button type="button" className="search-box__clear" onClick={() => { update('q', ''); searchRef.current?.focus() }} aria-label="Clear search">
              <Icon name="close" size={16} />
            </button>
          )}
        </form>

        <nav className="category-pills" aria-label="Filter by department">
          <ul>
            <li><Link to={`/shop${keepParams}`} className={!category ? 'is-active' : ''} aria-current={!category ? 'page' : undefined}>All</Link></li>
            {categories.map(item => (
              <li key={item.slug}>
                <Link to={`/shop/${item.slug}${keepParams}`} className={category?.slug === item.slug ? 'is-active' : ''} aria-current={category?.slug === item.slug ? 'page' : undefined}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shop-tools__row">
          <p className="results-count" aria-live="polite" aria-atomic="true">
            {results.length} {results.length === 1 ? 'product' : 'products'}
            {query && <> for “{query}”</>}
          </p>
          <div className="sort">
            <label htmlFor="shop-sort">Sort</label>
            <select id="shop-sort" className="input input--select input--small" value={sort} onChange={event => update('sort', event.target.value)}>
              {SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="active-filters" aria-label="Active filters">
            {category && (
              <Link to={`/shop${keepParams}`} className="filter-chip" aria-label={`Remove department filter: ${category.name}`}>
                {category.name} <Icon name="close" size={14} />
              </Link>
            )}
            {query && (
              <button type="button" className="filter-chip" onClick={() => update('q', '')} aria-label={`Remove search: ${query}`}>
                “{query}” <Icon name="close" size={14} />
              </button>
            )}
            {sort !== 'featured' && (
              <button type="button" className="filter-chip" onClick={() => update('sort', 'featured')} aria-label="Reset sort order">
                {SORT_OPTIONS.find(option => option.value === sort)?.label} <Icon name="close" size={14} />
              </button>
            )}
            <Link to="/shop" className="text-button">Reset all</Link>
          </div>
        )}
      </section>

      <section className="container shop-results" aria-label="Products">
        {results.length ? (
          <ul className="product-grid">
            {results.map(product => <li key={product.id}><ProductCard product={product} headingLevel={2} /></li>)}
          </ul>
        ) : (
          <div className="empty-state">
            <h2 className="empty-state__title">No products match{query ? ` “${query}”` : ''}{category ? ` in ${category.name}` : ''}.</h2>
            <p>Try a simpler word like “bread”, “fruit” or “soap”{category ? ', or search every department' : ''}.</p>
            <div className="button-row">
              {category && query && <Link to={`/shop?q=${encodeURIComponent(query)}`} className="button button--primary">Search all departments</Link>}
              <Link to="/shop" className="button button--outline">Reset filters</Link>
            </div>
          </div>
        )}
        <p className="fine-print shop-results__note">Prices and availability shown are demonstration data, not TMT pricing or stock.</p>
      </section>
    </div>
  )
}
