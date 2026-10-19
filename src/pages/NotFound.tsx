import { Link } from 'react-router'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { categories } from '../data/catalog'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <section className="container not-found">
      <p className="not-found__code" aria-hidden="true">404</p>
      <h1 className="page-title">This aisle doesn’t exist.</h1>
      <p className="lede">The page may have moved, or the link may be mistyped. Here are some good places to start.</p>
      <div className="button-row">
        <Link to="/" className="button button--primary">Go to the homepage</Link>
        <Link to="/shop" className="button button--outline">Browse the shop</Link>
      </div>
      <ul className="dept-links">
        {categories.map(category => <li key={category.slug}><Link to={`/shop/${category.slug}`}>{category.name}</Link></li>)}
      </ul>
    </section>
  )
}
