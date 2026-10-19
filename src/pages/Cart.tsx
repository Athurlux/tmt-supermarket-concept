import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useBasket } from '../state/BasketContext'
import { useToast } from '../state/ToastContext'
import { usePreferences } from '../state/PreferencesContext'
import { FULFILMENT_FEES } from '../config/fulfilment'
import { formatUgx } from '../lib/money'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { productsByIds, everydayFavouriteIds } from '../data/catalog'
import { BasketLineItem } from '../components/BasketLineItem'
import { ProductCard } from '../components/ProductCard'
import { Icon } from '../components/Icon'

export default function Cart() {
  const { priced, clear } = useBasket()
  const { notify } = useToast()
  const { method } = usePreferences()
  const [confirmingClear, setConfirmingClear] = useState(false)
  const confirmRef = useRef<HTMLButtonElement>(null)
  useDocumentTitle('Your basket')

  useEffect(() => { if (confirmingClear) confirmRef.current?.focus() }, [confirmingClear])

  if (!priced.lines.length) {
    return (
      <div className="container cart-page">
        <section className="empty-state empty-state--page">
          <p className="eyebrow">Your basket</p>
          <h1 className="page-title">Your basket is empty.</h1>
          <p className="lede">Start with a few everyday favourites, or browse every department.</p>
          <div className="button-row">
            <Link to="/shop" className="button button--primary">Start shopping</Link>
            <Link to="/#departments" className="button button--outline">Explore departments</Link>
          </div>
        </section>
        <section aria-labelledby="suggest-title" className="related">
          <h2 id="suggest-title" className="section-title">Everyday favourites</h2>
          <ul className="product-grid product-grid--four">
            {productsByIds(everydayFavouriteIds).slice(0, 4).map(product => <li key={product.id}><ProductCard product={product} /></li>)}
          </ul>
        </section>
      </div>
    )
  }

  const fee = method ? FULFILMENT_FEES[method] : null

  return (
    <div className="container cart-page">
      <div className="page-intro page-intro--tight">
        <p className="eyebrow">Your basket</p>
        <h1 className="page-title">Review your basket</h1>
        <p className="lede">{priced.itemCount} {priced.itemCount === 1 ? 'item' : 'items'} across {priced.lines.length} {priced.lines.length === 1 ? 'product' : 'products'}.</p>
      </div>

      <div className="cart-layout">
        <section aria-label="Basket items">
          <ul className="basket-lines">
            {priced.lines.map(line => <BasketLineItem key={line.key} line={line} />)}
          </ul>
          <div className="cart-actions">
            <Link to="/shop" className="text-link"><Icon name="back" size={18} /> Continue shopping</Link>
            {confirmingClear ? (
              <div className="confirm-inline" role="group" aria-label="Confirm clearing basket">
                <span>Remove every item?</span>
                <button ref={confirmRef} type="button" className="button button--small button--danger" onClick={() => { clear(); setConfirmingClear(false); notify('Your basket has been cleared.') }}>
                  Yes, clear basket
                </button>
                <button type="button" className="button button--small button--outline" onClick={() => setConfirmingClear(false)}>Keep items</button>
              </div>
            ) : (
              <button type="button" className="text-button" onClick={() => setConfirmingClear(true)}><Icon name="trash" size={16} /> Clear basket</button>
            )}
          </div>
        </section>

        <aside className="order-summary" aria-labelledby="summary-title">
          <h2 id="summary-title" className="order-summary__title">Summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>{formatUgx(priced.subtotalUgx)}</span></div>
          <div className="summary-row summary-row--muted">
            <span>{fee ? fee.label : 'Delivery or collection'}</span>
            <span>{fee ? formatUgx(fee.feeUgx) : 'Chosen at checkout'}</span>
          </div>
          {fee && (
            <div className="summary-row summary-row--strong"><span>Estimated total</span><span>{formatUgx(priced.subtotalUgx + fee.feeUgx)}</span></div>
          )}
          <Link to="/checkout" className="button button--primary button--block button--large">Continue to checkout <Icon name="arrow" size={18} /></Link>
          <p className="fine-print">Illustrative demo prices. Delivery uses a {formatUgx(FULFILMENT_FEES.delivery.feeUgx)} demo fee; collection is free in this concept. No payment is collected.</p>
        </aside>
      </div>
    </div>
  )
}
