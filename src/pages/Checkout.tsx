import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useBasket } from '../state/BasketContext'
import { useCheckout, type DemoSummary } from '../state/CheckoutContext'
import { usePreferences } from '../state/PreferencesContext'
import { branches, getBranch, type BranchId } from '../data/branches'
import { FULFILMENT_FEES, MAX_DAYS_AHEAD, TIME_WINDOWS, type FulfilmentMethod } from '../config/fulfilment'
import {
  canOpenStage, CHECKOUT_STAGES, createReference, firstIncompleteStage, sampleDetails, validateDetails, validateFulfilment,
  type CheckoutDraft, type CheckoutStage, type DraftErrors,
} from '../lib/checkout'
import { fulfilmentTotals } from '../lib/basket'
import { addDays, formatDisplayDate, kampalaToday, normalizeUgandanPhone } from '../lib/validation'
import { formatUgx } from '../lib/money'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { ChoiceGroup, ErrorSummary, TextArea, TextField } from '../components/Field'
import { ConceptNote } from '../components/ConceptNote'
import { Icon } from '../components/Icon'

const STAGE_LABELS: Record<CheckoutStage, string> = { fulfilment: 'Fulfilment', details: 'Your details', review: 'Review' }

const FIELD_LABELS: Record<string, string> = {
  method: 'Fulfilment', branch: 'Branch', fullName: 'Full name', phone: 'Phone number', email: 'Email',
  address: 'Delivery address', landmark: 'Landmark', date: 'Preferred date', timeWindow: 'Time window', instructions: 'Instructions',
}

const parseStage = (value: string | null): CheckoutStage => (CHECKOUT_STAGES.includes(value as CheckoutStage) ? (value as CheckoutStage) : 'fulfilment')

export default function Checkout() {
  const { priced, clear } = useBasket()
  const { draft, updateDraft, resetDraft, saveSummary } = useCheckout()
  const prefs = usePreferences()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<DraftErrors>({})
  const [attempted, setAttempted] = useState<Partial<Record<CheckoutStage, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const requested = parseStage(params.get('step'))
  const stage = canOpenStage(requested, draft) ? requested : firstIncompleteStage(draft)
  useDocumentTitle(`Checkout · ${STAGE_LABELS[stage]}`)

  // Carry shopping preferences into a fresh checkout.
  useEffect(() => {
    const patch: Partial<CheckoutDraft> = {}
    if (!draft.method && prefs.method) patch.method = prefs.method
    if (!draft.branch && prefs.branch) patch.branch = prefs.branch
    if (!draft.address && prefs.deliveryArea) patch.address = prefs.deliveryArea
    if (Object.keys(patch).length) updateDraft(patch)
    // Mount only: later preference changes must not overwrite what the customer typed.
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A direct visit to a later stage falls back to the first incomplete one.
  useEffect(() => {
    if (submittingRef.current) return
    if (requested !== stage) setParams({ step: stage }, { replace: true })
  }, [requested, stage, setParams])

  // Fetch the confirmation route while the customer reads the review, so completion is instant.
  useEffect(() => { if (stage === 'review') void import('./OrderDemo') }, [stage])

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    setErrors({})
    headingRef.current?.focus()
    window.scrollTo({ top: 0 })
  }, [stage])

  const update = (patch: Partial<CheckoutDraft>) => {
    const next = { ...draft, ...patch }
    updateDraft(patch)
    if (attempted[stage]) setErrors(stage === 'fulfilment' ? validateFulfilment(next) : validateDetails(next))
  }

  const goTo = (next: CheckoutStage) => setParams({ step: next })

  const submitStage = (current: CheckoutStage, validate: () => DraftErrors, next: CheckoutStage) => {
    const found = validate()
    setAttempted(value => ({ ...value, [current]: true }))
    setErrors(found)
    if (Object.keys(found).length) {
      requestAnimationFrame(() => document.getElementById('error-summary')?.focus())
      return
    }
    goTo(next)
  }

  const completeDemo = () => {
    if (submittingRef.current) return
    if (firstIncompleteStage(draft) !== 'review' || !priced.lines.length || !draft.method) return goTo(firstIncompleteStage(draft))
    submittingRef.current = true
    setSubmitting(true)
    const totals = fulfilmentTotals(priced.subtotalUgx, draft.method)
    const summary: DemoSummary = {
      reference: createReference(),
      createdAt: new Date().toISOString(),
      draft: { ...draft },
      lines: priced.lines.map(line => ({
        key: line.key, name: line.product.name, unit: line.product.unit, optionLabel: line.optionLabel,
        quantity: line.line.quantity, unitPriceUgx: line.unitPriceUgx, lineTotalUgx: line.lineTotalUgx,
      })),
      ...totals,
    }
    saveSummary(summary)
    // Cleared only after the confirmation route has rendered: clearing first would
    // re-render this page as empty and its stage redirect could cancel the navigation.
    void Promise.resolve(navigate(`/order-demo/${summary.reference}`, { replace: true })).then(() => {
      clear()
      resetDraft()
    })
  }

  if (!priced.lines.length && !submitting) {
    return (
      <div className="container checkout-page">
        <section className="empty-state empty-state--page">
          <p className="eyebrow">Checkout</p>
          <h1 className="page-title">Your basket is empty.</h1>
          <p className="lede">Add a few items first, then come back to choose delivery or collection.</p>
          <div className="button-row"><Link to="/shop" className="button button--primary">Start shopping</Link></div>
        </section>
      </div>
    )
  }

  const totals = draft.method ? fulfilmentTotals(priced.subtotalUgx, draft.method) : null
  const today = kampalaToday()
  const branch = getBranch(draft.branch)

  return (
    <div className="container checkout-page">
      <div className="page-intro page-intro--tight">
        <p className="eyebrow">Demo checkout</p>
        <h1 className="page-title">Checkout</h1>
      </div>

      <ol className="stepper-progress" aria-label="Checkout progress">
        {CHECKOUT_STAGES.map((item, index) => {
          const state = item === stage ? 'current' : CHECKOUT_STAGES.indexOf(item) < CHECKOUT_STAGES.indexOf(stage) ? 'done' : 'todo'
          return (
            <li key={item} className={`stepper-progress__item is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              {state === 'done' ? (
                <button type="button" onClick={() => goTo(item)}><span className="stepper-progress__num"><Icon name="check" size={14} /></span>{STAGE_LABELS[item]}<span className="visually-hidden"> (completed, edit)</span></button>
              ) : (
                <span><span className="stepper-progress__num">{index + 1}</span>{STAGE_LABELS[item]}</span>
              )}
            </li>
          )
        })}
      </ol>

      <div className="checkout-layout">
        <div className="checkout-main">
          <ErrorSummary errors={errors} labels={FIELD_LABELS} />

          {stage === 'fulfilment' && (
            <form noValidate onSubmit={event => { event.preventDefault(); submitStage('fulfilment', () => validateFulfilment(draft), 'details') }}>
              <h2 className="stage-title" ref={headingRef} tabIndex={-1}>How would you like your shopping?</h2>
              <ChoiceGroup<FulfilmentMethod>
                name="method"
                legend="Delivery or collection"
                value={draft.method}
                error={errors.method}
                onChange={method => { update({ method }); prefs.setMethod(method) }}
                options={[
                  { value: 'delivery', label: 'Delivery', description: `Brought to your door · ${FULFILMENT_FEES.delivery.label.toLowerCase()} ${formatUgx(FULFILMENT_FEES.delivery.feeUgx)}` },
                  { value: 'collection', label: 'Click and collect', description: `Pick up at the branch · ${formatUgx(0)} collection fee` },
                ]}
              />
              <ChoiceGroup<BranchId>
                name="branch"
                legend={draft.method === 'collection' ? 'Collect from' : 'Shop from branch'}
                hint="A preference for this demo — branch stock is not checked."
                value={draft.branch}
                error={errors.branch}
                onChange={value => { update({ branch: value }); prefs.setBranch(value) }}
                options={branches.map(item => ({ value: item.id, label: item.name, description: item.location }))}
              />
              <div className="form-actions">
                <Link to="/cart" className="button button--outline"><Icon name="back" size={18} /> Back to basket</Link>
                <button type="submit" className="button button--primary">Continue to details <Icon name="arrow" size={18} /></button>
              </div>
            </form>
          )}

          {stage === 'details' && (
            <form noValidate onSubmit={event => { event.preventDefault(); submitStage('details', () => validateDetails(draft), 'review') }}>
              <div className="stage-head">
                <h2 className="stage-title" ref={headingRef} tabIndex={-1}>
                  {draft.method === 'delivery' ? 'Delivery details' : 'Collection details'}
                </h2>
                <button type="button" className="button button--small button--outline" onClick={() => update(sampleDetails(draft.method, addDays(today, 1)))}>
                  Use sample details
                </button>
              </div>
              <p className="stage-note">
                {draft.method === 'delivery' ? 'Delivering' : 'Collecting'} via <strong>{branch?.name}</strong> ·{' '}
                <button type="button" className="text-button" onClick={() => goTo('fulfilment')}>Change</button>
              </p>
              <p className="fine-print">Your details stay in this browser tab only. They are not saved or sent anywhere.</p>

              <div className="form-grid">
                <TextField id="fullName" label="Full name" autoComplete="name" value={draft.fullName} error={errors.fullName} onChange={event => update({ fullName: event.target.value })} />
                <TextField id="phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" hint="Ugandan number, e.g. 0772 123 456 or +256 772 123 456" value={draft.phone} error={errors.phone} onChange={event => update({ phone: event.target.value })} />
                <TextField id="email" label="Email" type="email" autoComplete="email" optional value={draft.email} error={errors.email} onChange={event => update({ email: event.target.value })} />
                {draft.method === 'delivery' && (
                  <>
                    <TextField id="address" label="Delivery address" autoComplete="street-address" hint="Street, plot or building and area" value={draft.address} error={errors.address} onChange={event => update({ address: event.target.value })} />
                    <TextField id="landmark" label="Nearby landmark" hint="A gate colour, shop or church that helps a rider find you" value={draft.landmark} error={errors.landmark} onChange={event => update({ landmark: event.target.value })} />
                  </>
                )}
                <TextField
                  id="date" label={draft.method === 'delivery' ? 'Preferred delivery date' : 'Preferred collection date'} type="date"
                  min={today} max={addDays(today, MAX_DAYS_AHEAD)} hint="Dates follow Kampala time."
                  value={draft.date} error={errors.date} onChange={event => update({ date: event.target.value })}
                />
              </div>
              <ChoiceGroup
                name="timeWindow"
                legend="Preferred time window"
                hint="A preference only — time windows in this concept are not confirmed availability."
                value={draft.timeWindow}
                error={errors.timeWindow}
                onChange={timeWindow => update({ timeWindow })}
                options={TIME_WINDOWS.map(window => ({ value: window.id, label: window.label }))}
              />
              <TextArea id="instructions" label="Instructions" optional rows={3} maxLength={300} value={draft.instructions} error={errors.instructions} onChange={event => update({ instructions: event.target.value })} hint={`${300 - draft.instructions.length} characters left`} />
              <div className="form-actions">
                <button type="button" className="button button--outline" onClick={() => goTo('fulfilment')}><Icon name="back" size={18} /> Back</button>
                <button type="submit" className="button button--primary">Review checkout <Icon name="arrow" size={18} /></button>
              </div>
            </form>
          )}

          {stage === 'review' && totals && (
            <section aria-labelledby="review-title">
              <h2 className="stage-title" id="review-title" ref={headingRef} tabIndex={-1}>Review your demo checkout</h2>

              <div className="review-block">
                <div className="review-block__head">
                  <h3>Items</h3>
                  <Link to="/cart" className="text-button"><Icon name="edit" size={16} /> Edit basket</Link>
                </div>
                <table className="review-table">
                  <caption className="visually-hidden">Items in your basket</caption>
                  <thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Unit price</th><th scope="col">Total</th></tr></thead>
                  <tbody>
                    {priced.lines.map(line => (
                      <tr key={line.key}>
                        <th scope="row">{line.product.name}<span>{line.product.unit}{line.optionLabel && ` · ${line.optionLabel}`}</span></th>
                        <td>{line.line.quantity}</td>
                        <td>{formatUgx(line.unitPriceUgx)}</td>
                        <td>{formatUgx(line.lineTotalUgx)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="review-grid">
                <div className="review-block">
                  <div className="review-block__head">
                    <h3>{draft.method === 'delivery' ? 'Delivery' : 'Click and collect'}</h3>
                    <button type="button" className="text-button" onClick={() => goTo('fulfilment')}><Icon name="edit" size={16} /> Edit</button>
                  </div>
                  <dl className="review-list">
                    <div><dt>Branch</dt><dd>{branch?.name} — {branch?.location}</dd></div>
                    {draft.method === 'delivery' && <div><dt>Address</dt><dd>{draft.address}</dd></div>}
                    {draft.method === 'delivery' && <div><dt>Landmark</dt><dd>{draft.landmark}</dd></div>}
                    <div><dt>Preferred</dt><dd>{formatDisplayDate(draft.date)}, {TIME_WINDOWS.find(window => window.id === draft.timeWindow)?.label}</dd></div>
                  </dl>
                </div>
                <div className="review-block">
                  <div className="review-block__head">
                    <h3>Your details</h3>
                    <button type="button" className="text-button" onClick={() => goTo('details')}><Icon name="edit" size={16} /> Edit</button>
                  </div>
                  <dl className="review-list">
                    <div><dt>Name</dt><dd>{draft.fullName}</dd></div>
                    <div><dt>Phone</dt><dd>{normalizeUgandanPhone(draft.phone)}</dd></div>
                    {draft.email && <div><dt>Email</dt><dd>{draft.email}</dd></div>}
                    {draft.instructions && <div><dt>Instructions</dt><dd>{draft.instructions}</dd></div>}
                  </dl>
                </div>
              </div>

              <div className="review-totals">
                <div className="summary-row"><span>Subtotal</span><span>{formatUgx(totals.subtotalUgx)}</span></div>
                <div className="summary-row"><span>{totals.feeLabel}</span><span>{formatUgx(totals.feeUgx)}</span></div>
                <div className="summary-row summary-row--strong"><span>Demo total</span><span>{formatUgx(totals.totalUgx)}</span></div>
              </div>

              <div className="final-action">
                <button type="button" className="button button--primary button--large" onClick={completeDemo} disabled={submitting} aria-describedby="final-note">
                  {submitting ? 'Completing…' : 'Complete demo checkout'}
                </button>
                <p className="final-action__note" id="final-note"><strong>Demonstration only.</strong> No payment is collected and no order is sent.</p>
              </div>
              <ConceptNote>This is an independent portfolio concept, not TMT Supermarket’s ordering service.</ConceptNote>
              <button type="button" className="text-button" onClick={() => goTo('details')}><Icon name="back" size={18} /> Back to details</button>
            </section>
          )}
        </div>

        <aside className="order-summary order-summary--checkout" aria-labelledby="checkout-summary-title">
          <h2 id="checkout-summary-title" className="order-summary__title">Basket</h2>
          <ul className="mini-lines">
            {priced.lines.map(line => (
              <li key={line.key}><span>{line.line.quantity} × {line.product.name}{line.optionLabel && ` (${line.optionLabel})`}</span><span>{formatUgx(line.lineTotalUgx)}</span></li>
            ))}
          </ul>
          <div className="summary-row"><span>Subtotal</span><span>{formatUgx(priced.subtotalUgx)}</span></div>
          <div className="summary-row">
            <span>{totals ? totals.feeLabel : 'Delivery or collection'}</span>
            <span>{totals ? formatUgx(totals.feeUgx) : '—'}</span>
          </div>
          {totals && <div className="summary-row summary-row--strong"><span>Demo total</span><span>{formatUgx(totals.totalUgx)}</span></div>}
          <Link to="/cart" className="text-button">Edit basket</Link>
        </aside>
      </div>
    </div>
  )
}
