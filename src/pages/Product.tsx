import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getCategory, getProductBySlug, maxQuantity, products } from '../data/catalog'
import { formatUgx } from '../lib/money'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useAddToBasket } from '../state/useAddToBasket'
import { useBasket } from '../state/BasketContext'
import { lineKey } from '../lib/basket'
import { ProductImage } from '../components/ProductImage'
import { ProductCard } from '../components/ProductCard'
import { QuantityStepper } from '../components/QuantityStepper'
import { Icon } from '../components/Icon'

export default function Product() {
  const { productSlug } = useParams()
  const product = getProductBySlug(productSlug ?? '')
  const navigate = useNavigate()
  const addToBasket = useAddToBasket()
  const { lines, openDrawer } = useBasket()
  const [quantity, setQuantity] = useState(1)
  const [optionId, setOptionId] = useState<string | null>(product?.options?.choices[0].id ?? null)
  useDocumentTitle(product ? product.name : 'Product not found')

  if (!product) {
    return (
      <section className="page-intro container">
        <p className="eyebrow">Product</p>
        <h1 className="page-title">We couldn’t find that product.</h1>
        <p className="lede">It may not be part of this demo catalogue, or the link may be mistyped.</p>
        <div className="button-row">
          <Link to="/shop" className="button button--primary">Browse the shop</Link>
          <Link to="/shop?q=fresh" className="button button--outline">Search fresh produce</Link>
        </div>
      </section>
    )
  }

  const category = getCategory(product.category)!
  const max = maxQuantity(product)
  const inBasket = lines.find(line => lineKey(line) === lineKey({ productId: product.id, optionId }))?.quantity ?? 0
  const related = products.filter(item => item.category === product.category && item.id !== product.id && item.availability !== 'unavailable').slice(0, 4)

  // Back returns to the filtered shop view the customer came from, when there is one.
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate(`/shop/${category.slug}`))

  return (
    <div className="product-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to={`/shop/${category.slug}`}>{category.name}</Link></li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>
      </div>

      <section className="container product-detail">
        <ProductImage product={product} sizes="(min-width: 900px) 46vw, 100vw" priority className="product-detail__image" />
        <div className="product-detail__info">
          <p className="eyebrow">{category.name}</p>
          <h1 className="product-detail__name">{product.name}</h1>
          <p className="product-detail__unit">{product.unit}</p>
          <p className="product-detail__price">{formatUgx(product.priceUgx)} <span className="badge">Illustrative price</span></p>
          <p className="product-detail__description">{product.description}</p>

          <p className={`stock stock--${product.availability}`}>
            <span className="stock__dot" aria-hidden="true" />
            {product.availability === 'available' && 'Available in this demo'}
            {product.availability === 'limited' && `Limited in this demo — up to ${max} per order`}
            {product.availability === 'unavailable' && 'Unavailable in this demo'}
          </p>

          {product.availability !== 'unavailable' && (
            <div className="purchase">
              {product.options && (
                <fieldset className="option-group">
                  <legend className="field__label">{product.options.label}</legend>
                  <div className="option-group__choices">
                    {product.options.choices.map(choice => (
                      <label key={choice.id} className={`option-pill ${optionId === choice.id ? 'is-selected' : ''}`}>
                        <input type="radio" name="product-option" value={choice.id} checked={optionId === choice.id} onChange={() => setOptionId(choice.id)} />
                        {choice.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <div className="purchase__row">
                <QuantityStepper value={quantity} max={max} onChange={setQuantity} label={`Quantity of ${product.name}`} />
                <button type="button" className="button button--primary button--large" onClick={() => addToBasket(product, optionId, quantity)}>
                  <Icon name="basket" size={20} /> Add to basket · {formatUgx(product.priceUgx * quantity)}
                </button>
              </div>
              {inBasket > 0 && (
                <p className="purchase__in-basket">
                  <Icon name="check" size={16} /> {inBasket} in your basket ·{' '}
                  <button type="button" className="text-button" onClick={openDrawer}>Review basket</button>
                </p>
              )}
            </div>
          )}

          <button type="button" className="text-button product-detail__back" onClick={goBack}>
            <Icon name="back" size={18} /> Back to shopping
          </button>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container related" aria-labelledby="related-title">
          <div className="section-head">
            <h2 id="related-title" className="section-title">More from {category.name}</h2>
            <Link to={`/shop/${category.slug}`} className="text-link">See all <Icon name="arrow" size={18} /></Link>
          </div>
          <ul className="product-grid product-grid--four">
            {related.map(item => <li key={item.id}><ProductCard product={item} /></li>)}
          </ul>
        </section>
      )}
    </div>
  )
}
