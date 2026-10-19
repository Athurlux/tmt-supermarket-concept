import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { useBasket } from '../state/BasketContext'
import { formatUgx } from '../lib/money'
import { useFocusTrap, useScrollLock } from '../lib/useFocusTrap'
import { BasketLineItem } from './BasketLineItem'
import { Icon } from './Icon'

/** Quick view of the same basket state the /cart page uses. */
export function BasketDrawer() {
  const { priced, drawerOpen, closeDrawer } = useBasket()
  const panelRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useFocusTrap(panelRef, drawerOpen, closeDrawer)
  useScrollLock(drawerOpen)
  useEffect(() => closeDrawer(), [location.pathname, closeDrawer])

  if (!drawerOpen) return null

  return (
    <div className="drawer-layer">
      <div className="drawer-backdrop" onClick={closeDrawer} aria-hidden="true" />
      <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" ref={panelRef}>
        <div className="drawer__head">
          <h2 id="drawer-title" className="drawer__title">Your basket <span>{priced.itemCount} {priced.itemCount === 1 ? 'item' : 'items'}</span></h2>
          <button type="button" className="icon-button" onClick={closeDrawer} aria-label="Close basket" data-autofocus>
            <Icon name="close" />
          </button>
        </div>
        {priced.lines.length === 0 ? (
          <div className="drawer__empty">
            <p className="drawer__empty-title">Your basket is empty.</p>
            <p>Fresh produce, bakery favourites and pantry staples are a few taps away.</p>
            <Link to="/shop" className="button button--primary">Start shopping</Link>
          </div>
        ) : (
          <>
            <ul className="drawer__lines">
              {priced.lines.map(line => <BasketLineItem key={line.key} line={line} compact onNavigate={closeDrawer} />)}
            </ul>
            <div className="drawer__foot">
              <div className="summary-row summary-row--strong">
                <span>Subtotal</span>
                <span>{formatUgx(priced.subtotalUgx)}</span>
              </div>
              <p className="fine-print">Illustrative demo prices. Delivery or collection is chosen at checkout.</p>
              <div className="drawer__actions">
                <Link to="/cart" className="button button--outline">View basket</Link>
                <Link to="/checkout" className="button button--primary">Checkout <Icon name="arrow" size={18} /></Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
