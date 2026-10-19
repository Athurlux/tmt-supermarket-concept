import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { branches, getBranch, type BranchId } from '../data/branches'
import { CONTACT_TOPICS, emptyContact, topicLabel, validateContact, type ContactDraft, type ContactErrors, type ContactTopic } from '../lib/contact'
import { createReference } from '../lib/checkout'
import { formatDisplayDate, kampalaToday, normalizeUgandanPhone } from '../lib/validation'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { ErrorSummary, SelectField, TextArea, TextField } from '../components/Field'
import { ConceptNote } from '../components/ConceptNote'
import { Icon } from '../components/Icon'

type Step = 'form' | 'review' | 'done'

const LABELS: Record<string, string> = {
  name: 'Name', contact: 'Contact', email: 'Email', phone: 'Phone', topic: 'Topic', productName: 'Product', eventDate: 'Date', message: 'Message',
}

export default function Contact() {
  const [draft, setDraft] = useState<ContactDraft>(emptyContact)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [attempted, setAttempted] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [reference, setReference] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const today = kampalaToday()
  useDocumentTitle(step === 'done' ? 'Demo enquiry complete' : step === 'review' ? 'Review enquiry' : 'Contact & special requests')

  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    headingRef.current?.focus()
  }, [step])

  const update = (patch: Partial<ContactDraft>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    if (attempted) setErrors(validateContact(next, today))
  }

  const onPreview = (event: FormEvent) => {
    event.preventDefault()
    const found = validateContact(draft, today)
    setAttempted(true)
    setErrors(found)
    if (Object.keys(found).length) {
      requestAnimationFrame(() => document.getElementById('error-summary')?.focus())
      return
    }
    setStep('review')
  }

  const startOver = () => {
    setDraft(emptyContact())
    setErrors({})
    setAttempted(false)
    setReference('')
    setStep('form')
  }

  const showProduct = draft.topic === 'availability'
  const showDate = draft.topic === 'occasion' || draft.topic === 'bulk'

  return (
    <div className="container contact-page">
      <div className="contact-layout">
        <aside className="contact-aside">
          <p className="eyebrow">Contact &amp; special requests</p>
          <h1 className="page-title">How can we help?</h1>
          <p className="lede">Ask about a product, plan a bulk shop or a special occasion, or tell us how we’re doing.</p>
          <ul className="contact-topics">
            <li><strong>Product availability</strong> Looking for something specific?</li>
            <li><strong>Bulk shopping</strong> Office, school or household stock-ups.</li>
            <li><strong>Special occasions</strong> Introductions, weddings, birthdays and gatherings.</li>
          </ul>
          <p className="fine-print">Enquiries in this concept are previewed in your browser only. They are not emailed, messaged or stored.</p>
        </aside>

        <section className="contact-main" aria-live="off">
          {step === 'form' && (
            <form noValidate onSubmit={onPreview} className="panel">
              <h2 className="stage-title" ref={headingRef} tabIndex={-1}>Your enquiry</h2>
              <ErrorSummary errors={errors} labels={LABELS} />
              <div className="form-grid">
                <TextField id="name" label="Name" autoComplete="name" value={draft.name} error={errors.name} onChange={event => update({ name: event.target.value })} />
                <SelectField id="topic" label="Topic" value={draft.topic} error={errors.topic} onChange={event => update({ topic: event.target.value as ContactTopic })}>
                  <option value="">Choose a topic</option>
                  {CONTACT_TOPICS.map(topic => <option key={topic.id} value={topic.id}>{topic.label}</option>)}
                </SelectField>
              </div>
              <fieldset className="contact-methods" id="contact" tabIndex={-1} aria-describedby={errors.contact ? 'contact-error' : 'contact-hint'}>
                <legend className="field__label">How should we reply?</legend>
                <p className="field__hint" id="contact-hint">Give at least one: an email address or a phone number.</p>
                <div className="form-grid">
                  <TextField id="email" label="Email" type="email" autoComplete="email" optional value={draft.email} error={errors.email} onChange={event => update({ email: event.target.value })} />
                  <TextField id="phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" optional value={draft.phone} error={errors.phone} onChange={event => update({ phone: event.target.value })} />
                </div>
                {errors.contact && <p className="field__error" id="contact-error">{errors.contact}</p>}
              </fieldset>
              {(showProduct || showDate) && (
                <div className="form-grid conditional">
                  {showProduct && <TextField id="productName" label="Which product?" placeholder="e.g. Gluten-free flour" value={draft.productName} error={errors.productName} onChange={event => update({ productName: event.target.value })} />}
                  {showDate && (
                    <TextField
                      id="eventDate" type="date" min={today} optional={draft.topic === 'bulk'}
                      label={draft.topic === 'occasion' ? 'Date of your occasion' : 'When do you need it?'}
                      value={draft.eventDate} error={errors.eventDate} onChange={event => update({ eventDate: event.target.value })}
                    />
                  )}
                </div>
              )}
              <SelectField id="branch" label="Branch" optional value={draft.branch} onChange={event => update({ branch: event.target.value as BranchId | '' })}>
                <option value="">Either branch</option>
                {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </SelectField>
              <TextArea id="message" label="Message" rows={5} maxLength={1000} value={draft.message} error={errors.message} hint={`${1000 - draft.message.length} characters left`} onChange={event => update({ message: event.target.value })} />
              <div className="form-actions">
                <button type="submit" className="button button--primary">Preview enquiry <Icon name="arrow" size={18} /></button>
              </div>
              <ConceptNote>Previewing is a demonstration — nothing is sent.</ConceptNote>
            </form>
          )}

          {step === 'review' && (
            <div className="panel">
              <h2 className="stage-title" ref={headingRef} tabIndex={-1}>Review your enquiry</h2>
              <dl className="review-list review-list--wide">
                <div><dt>Name</dt><dd>{draft.name}</dd></div>
                {draft.email && <div><dt>Email</dt><dd>{draft.email}</dd></div>}
                {draft.phone && <div><dt>Phone</dt><dd>{normalizeUgandanPhone(draft.phone)}</dd></div>}
                <div><dt>Topic</dt><dd>{topicLabel(draft.topic)}</dd></div>
                {showProduct && <div><dt>Product</dt><dd>{draft.productName}</dd></div>}
                {showDate && draft.eventDate && <div><dt>Date</dt><dd>{formatDisplayDate(draft.eventDate)}</dd></div>}
                <div><dt>Branch</dt><dd>{getBranch(draft.branch)?.name ?? 'Either branch'}</dd></div>
                <div><dt>Message</dt><dd className="preserve-lines">{draft.message}</dd></div>
              </dl>
              <div className="final-action">
                <button type="button" className="button button--primary button--large" onClick={() => { setReference(createReference()); setStep('done') }}>
                  Complete demo enquiry
                </button>
                <p className="final-action__note"><strong>Demonstration only.</strong> Your enquiry is not sent to anyone.</p>
              </div>
              <button type="button" className="text-button" onClick={() => setStep('form')}><Icon name="edit" size={16} /> Edit enquiry</button>
            </div>
          )}

          {step === 'done' && (
            <div className="panel panel--done">
              <span className="order-demo__check" aria-hidden="true"><Icon name="check" size={30} /></span>
              <p className="eyebrow">Reference {reference}</p>
              <h2 className="stage-title" ref={headingRef} tabIndex={-1}>Your demo enquiry is complete.</h2>
              <p><strong>Nothing was sent.</strong> This concept does not deliver enquiries to TMT Supermarket, and no one will reply. The reference was generated in your browser.</p>
              <p className="review-summary-line">{topicLabel(draft.topic)}{draft.branch && ` · ${getBranch(draft.branch)?.name}`} — “{draft.message.length > 120 ? `${draft.message.slice(0, 120)}…` : draft.message}”</p>
              <div className="button-row">
                <button type="button" className="button button--outline" onClick={startOver}>Start a new enquiry</button>
                <Link to="/shop" className="button button--primary">Continue shopping</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
