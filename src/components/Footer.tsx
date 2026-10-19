import { Link } from 'react-router'
import { categories } from '../data/catalog'
import { branches } from '../data/branches'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo />
          <p>Fresh finds and everyday favourites from your neighbourhood supermarket in Kampala.</p>
        </div>
        <nav aria-label="Departments">
          <h2 className="site-footer__heading">Shop</h2>
          <ul>
            <li><Link to="/shop">All products</Link></li>
            {categories.map(category => <li key={category.slug}><Link to={`/shop/${category.slug}`}>{category.name}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Services">
          <h2 className="site-footer__heading">Services</h2>
          <ul>
            <li><Link to="/delivery">Delivery &amp; collection</Link></li>
            <li><Link to="/cart">Your basket</Link></li>
            <li><Link to="/contact">Special requests</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="site-footer__heading">Branches</h2>
          <ul>
            {branches.map(branch => <li key={branch.id}><Link to={`/branches#${branch.id}`}>{branch.name}</Link><span className="site-footer__sub">{branch.location}</span></li>)}
          </ul>
        </div>
      </div>
      <div className="container site-footer__legal" id="concept-disclosure">
        <p>
          <strong>Independent website concept.</strong> Designed and built as a developer portfolio piece; not affiliated with,
          endorsed by or operated for TMT Supermarket. Prices, availability, fees and time windows are demonstration data.
          No payments are taken and no orders or enquiries are sent. Product and lifestyle imagery is AI-generated concept art.
        </p>
        <p className="site-footer__copy">© {new Date().getFullYear()} Portfolio concept · <Link to="/about#concept">Read the full disclosure</Link></p>
      </div>
    </footer>
  )
}
