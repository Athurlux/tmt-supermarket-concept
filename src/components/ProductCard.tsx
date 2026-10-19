import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { getCategory, type Product } from '../data/catalog'
import { formatUgx } from '../lib/money'
import { useAddToBasket } from '../state/useAddToBasket'
import { Icon } from './Icon'
import { ProductImage } from './ProductImage'

const CARD_SIZES = '(min-width: 1100px) 300px, (min-width: 700px) 30vw, 46vw'

export function ProductCard({ product, headingLevel = 3 }: { product: Product; headingLevel?: 2 | 3 }) {
  const addToBasket = useAddToBasket()
  const [justAdded, setJustAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const Heading = `h${headingLevel}` as const
  const href = `/product/${product.slug}`

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onAdd = () => {
    const result = addToBasket(product, null, 1)
    if (result.status === 'unavailable') return
    setJustAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <article className="product-card" data-anim="product-card">
      <Link to={href} className="product-card__media" tabIndex={-1} aria-hidden="true">
        <ProductImage product={product} sizes={CARD_SIZES} />
        {product.availability !== 'available' && (
          <span className={`stock-tag stock-tag--${product.availability}`}>
            {product.availability === 'limited' ? 'Limited' : 'Unavailable'}
          </span>
        )}
      </Link>
      <div className="product-card__body">
        <p className="product-card__category">{getCategory(product.category)?.shortName}</p>
        <Heading className="product-card__name"><Link to={href}>{product.name}</Link></Heading>
        <p className="product-card__unit">{product.unit}</p>
        <div className="product-card__footer">
          <p className="price"><span className="visually-hidden">Illustrative price </span>{formatUgx(product.priceUgx)}</p>
          {product.availability === 'unavailable' ? (
            <span className="product-card__note">Unavailable in demo</span>
          ) : product.options ? (
            <Link to={href} className="button button--small button--outline" aria-label={`Choose ${product.options.label.toLowerCase()} for ${product.name}`}>
              Choose
            </Link>
          ) : (
            <button type="button" className={`button button--small ${justAdded ? 'button--added' : 'button--primary'}`} onClick={onAdd} aria-label={`Add ${product.name} to basket`}>
              <Icon name={justAdded ? 'check' : 'plus'} size={16} />
              <span aria-hidden="true">{justAdded ? 'Added' : 'Add'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
