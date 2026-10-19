import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router'
import { useCheckout } from '../state/CheckoutContext'
import { getBranch } from '../data/branches'
import { TIME_WINDOWS } from '../config/fulfilment'
import { formatDisplayDate, normalizeUgandanPhone } from '../lib/validation'
import { formatUgx } from '../lib/money'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { Icon } from '../components/Icon'

export default function OrderDemo() {
  const { reference = '' } = useParams()
  const { summaries } = useCheckout()
  const summary = summaries.get(reference)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useDocumentTitle(summary ? 'Demo checkout complete' : 'Demo summary unavailable')

  useEffect(() => { headingRef.current?.focus() }, [])

  if (!summary) {
    return (
      <section className="container page-intro order-fallback">
        <p className="eyebrow">Demo checkout</p>
        <h1 className="page-title" ref={headingRef} tabIndex={-1}>This demo summary isn’t available.</h1>
        <p className="lede">
          Demo summaries are kept in memory for the current visit only, so they disappear after a refresh or when opened from a link.
          Nothing was sent anywhere, so there is nothing to look up.
        </p>
        <div className="button-row">
          <Link to="/shop" className="button button--primary">Continue shopping</Link>
          <Link to="/cart" className="button button--outline">View basket</Link>
        </div>
      </section>
    )
  }

  const { draft } = summary
  const branch = getBranch(draft.branch)
  const window = TIME_WINDOWS.find(item => item.id === draft.timeWindow)

  return (
    <div className="container order-demo">
      <section className="order-demo__hero">
        <span className="order-demo__check" aria-hidden="true"><Icon name="check" size={34} /></span>
        <p className="eyebrow">Reference {summary.reference}</p>
        <h1 className="page-title" ref={headingRef} tabIndex={-1}>Your demo checkout is complete.</h1>
        <p className="order-demo__notice">
          <strong>This is not a real order.</strong> No payment was collected, nothing was sent to TMT Supermarket, and no delivery,
          collection or stock has been arranged. The reference was generated in your browser for this demonstration.
        </p>
        <div className="button-row no-print">
          <button type="button" className="button button--outline" onClick={() => globalThis.print()}><Icon name="print" size={18} /> Print summary</button>
          <Link to="/shop" className="button button--primary">Continue shopping</Link>
        </div>
      </section>

      <section className="order-demo__summary" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="section-title">Request summary</h2>
        <div className="review-grid">
          <div className="review-block">
            <h3>{draft.method === 'delivery' ? 'Delivery preference' : 'Collection preference'}</h3>
            <dl className="review-list">
              <div><dt>Branch</dt><dd>{branch?.name} — {branch?.location}</dd></div>
              {draft.method === 'delivery' && <div><dt>Address</dt><dd>{draft.address}</dd></div>}
              {draft.method === 'delivery' && <div><dt>Landmark</dt><dd>{draft.landmark}</dd></div>}
              <div><dt>Preferred</dt><dd>{formatDisplayDate(draft.date)}, {window?.label}</dd></div>
            </dl>
          </div>
          <div className="review-block">
            <h3>Contact details</h3>
            <dl className="review-list">
              <div><dt>Name</dt><dd>{draft.fullName}</dd></div>
              <div><dt>Phone</dt><dd>{normalizeUgandanPhone(draft.phone)}</dd></div>
              {draft.email && <div><dt>Email</dt><dd>{draft.email}</dd></div>}
              {draft.instructions && <div><dt>Instructions</dt><dd>{draft.instructions}</dd></div>}
            </dl>
          </div>
        </div>
        <div className="review-block">
          <h3>Items</h3>
          <table className="review-table">
            <caption className="visually-hidden">Items in this demo checkout</caption>
            <thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Unit price</th><th scope="col">Total</th></tr></thead>
            <tbody>
              {summary.lines.map(line => (
                <tr key={line.key}>
                  <th scope="row">{line.name}<span>{line.unit}{line.optionLabel && ` · ${line.optionLabel}`}</span></th>
                  <td>{line.quantity}</td>
                  <td>{formatUgx(line.unitPriceUgx)}</td>
                  <td>{formatUgx(line.lineTotalUgx)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="review-totals">
            <div className="summary-row"><span>Subtotal</span><span>{formatUgx(summary.subtotalUgx)}</span></div>
            <div className="summary-row"><span>{summary.feeLabel}</span><span>{formatUgx(summary.feeUgx)}</span></div>
            <div className="summary-row summary-row--strong"><span>Demo total</span><span>{formatUgx(summary.totalUgx)}</span></div>
          </div>
        </div>
        <p className="fine-print">Prices, fees and time windows are illustrative demonstration data. Independent website concept — not affiliated with TMT Supermarket.</p>
      </section>
    </div>
  )
}
