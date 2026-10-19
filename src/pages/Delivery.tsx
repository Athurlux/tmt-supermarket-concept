import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { branches, getBranch, type BranchId } from '../data/branches'
import { FULFILMENT_FEES } from '../config/fulfilment'
import { formatUgx } from '../lib/money'
import { requiredText } from '../lib/validation'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { usePreferences } from '../state/PreferencesContext'
import { useBasket } from '../state/BasketContext'
import { Img } from '../components/Img'
import { Icon } from '../components/Icon'
import { Faq } from '../components/Faq'
import { SelectField, TextField } from '../components/Field'

const STEPS = [
  { title: 'Fill your basket', body: 'Browse fresh produce, bakery, pantry and household departments and add what you need.' },
  { title: 'Choose how you receive it', body: 'Pick delivery to your door or click and collect from Muyenga or Bukoto.' },
  { title: 'Pick a preferred time', body: 'Choose a date and a time window that suits you, then review everything before you finish.' },
]

export const DELIVERY_FAQ = [
  { question: 'How much does delivery cost?', answer: <p>This concept uses an illustrative flat {FULFILMENT_FEES.delivery.label.toLowerCase()} of {formatUgx(FULFILMENT_FEES.delivery.feeUgx)}, shown wherever it affects your total. It is not TMT Supermarket’s actual delivery pricing.</p> },
  { question: 'Do you deliver to my area?', answer: <p>Coverage is not verified in this concept. You can note your area as a preference, but no address is checked against a real delivery zone.</p> },
  { question: 'Is click and collect free?', answer: <p>In this demonstration, collection shows a clearly labelled {formatUgx(0)} collection fee.</p> },
  { question: 'Can I track my delivery?', answer: <p>No. This is a demonstration of the shopping journey; nothing is dispatched, so there is nothing to track.</p> },
  { question: 'Are the time windows guaranteed?', answer: <p>No. Time windows are preferences for the demo and are not checked against real store capacity.</p> },
]

export default function Delivery() {
  useDocumentTitle('Delivery & collection')
  const prefs = usePreferences()
  const { priced } = useBasket()
  const [area, setArea] = useState(prefs.deliveryArea)
  const [branch, setBranch] = useState<BranchId | ''>(prefs.branch ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<{ area: string; branch: string | null } | null>(null)
  const areaRef = useRef<HTMLInputElement>(null)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const message = requiredText(area, 'Enter your neighbourhood or area, for example Ntinda or Kansanga.')
    setError(message)
    if (message) { areaRef.current?.focus(); return }
    prefs.setDeliveryArea(area.trim())
    prefs.setMethod('delivery')
    if (branch) prefs.setBranch(branch)
    setSaved({ area: area.trim(), branch: getBranch(branch)?.name ?? null })
  }

  return (
    <div className="delivery-page">
      <section className="delivery-hero">
        <div className="container delivery-hero__inner">
          <div className="delivery-hero__copy">
            <p className="eyebrow">Delivery &amp; collection</p>
            <h1 className="page-title">Your shopping, your way.</h1>
            <p className="lede">Have your basket brought to your door, or pick it up from your neighbourhood branch on the way home.</p>
            <div className="button-row">
              <Link to="/shop" className="button button--primary">Start shopping</Link>
              <Link to="/checkout" className="button button--outline">{priced.itemCount ? 'Go to checkout' : 'See how checkout works'}</Link>
            </div>
            <p className="fine-print">Delivery availability and charges shown in this concept are illustrative.</p>
          </div>
          <div className="delivery-hero__image">
            <Img name="delivery" widths={[768, 1280, 1536]} ratio={[3, 2]} sizes="(min-width: 960px) 55vw, 100vw" alt="Concept image: a person in a green T-shirt hands a TMT paper grocery bag to a smiling customer at her door" priority />
            <p className="image-credit">Illustrative concept image, not TMT staff or premises.</p>
          </div>
        </div>
      </section>

      <section className="container compare" aria-labelledby="compare-title">
        <h2 id="compare-title" className="section-title">Delivery or collection?</h2>
        <div className="compare__grid">
          <article className="compare__card compare__card--delivery">
            <Icon name="truck" size={28} />
            <h3>Delivery</h3>
            <p>Brought to your address, with a landmark to help the rider find you. Choose a preferred date and time window.</p>
            <p className="compare__fee">{FULFILMENT_FEES.delivery.label}: <strong>{formatUgx(FULFILMENT_FEES.delivery.feeUgx)}</strong></p>
          </article>
          <article className="compare__card compare__card--collection">
            <Icon name="bag" size={28} />
            <h3>Click and collect</h3>
            <p>Pick up from Muyenga or Bukoto at a time that suits you. No address needed — just your name and phone number.</p>
            <p className="compare__fee">{FULFILMENT_FEES.collection.label}: <strong>{formatUgx(0)}</strong></p>
          </article>
        </div>
      </section>

      <section className="steps-section" aria-labelledby="steps-title">
        <div className="container">
          <h2 id="steps-title" className="section-title section-title--light">How it works</h2>
          <ol className="steps">
            {STEPS.map((step, index) => (
              <li key={step.title} className="steps__item">
                <span className="steps__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container location" aria-labelledby="location-title">
        <div className="location__copy">
          <h2 id="location-title" className="section-title">Note your delivery area</h2>
          <p>Tell us your neighbourhood and we’ll carry it into checkout as a starting point for your address. This is a preference for this visit only — coverage isn’t checked, and nothing is stored after you leave.</p>
        </div>
        <form className="location__form" noValidate onSubmit={onSubmit}>
          <TextField id="area" ref={areaRef} label="Neighbourhood or area" autoComplete="address-level3" placeholder="e.g. Ntinda, Kansanga, Kololo" value={area} error={error ?? undefined} onChange={event => { setArea(event.target.value); setSaved(null) }} />
          <SelectField id="nearest-branch" label="Preferred branch" optional value={branch} onChange={event => { setBranch(event.target.value as BranchId | ''); setSaved(null) }}>
            <option value="">No preference</option>
            {branches.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </SelectField>
          <button type="submit" className="button button--primary">Save as delivery preference</button>
          <div className="location__result" role="status" aria-live="polite">
            {saved && (
              <div className="notice notice--success">
                <p><strong>Noted: {saved.area}{saved.branch ? `, via ${saved.branch}` : ''}.</strong> We’ll use this as a starting point at checkout.</p>
                <p className="fine-print">Coverage is not verified in this concept. Delivery availability and charges are illustrative.</p>
                <div className="button-row">
                  <Link to="/shop" className="button button--small button--primary">Continue shopping</Link>
                  {priced.itemCount > 0 && <Link to="/checkout" className="button button--small button--outline">Go to checkout</Link>}
                </div>
              </div>
            )}
          </div>
        </form>
      </section>

      <section className="container faq-section" aria-labelledby="delivery-faq-title">
        <h2 id="delivery-faq-title" className="section-title">Delivery questions</h2>
        <Faq items={DELIVERY_FAQ} />
      </section>
    </div>
  )
}
