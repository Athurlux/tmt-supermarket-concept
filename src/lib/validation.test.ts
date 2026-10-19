import { describe, expect, it } from 'vitest'
import { dateError, kampalaToday, normalizeUgandanPhone, phoneError, timeWindowError } from './validation'
import {
  canOpenStage, createReference, emptyDraft, firstIncompleteStage, sampleDetails, validateDetails, type CheckoutDraft,
} from './checkout'
import { emptyContact, validateContact } from './contact'

// 21:30 UTC on 19 Oct is already 00:30 on 20 Oct in Kampala (UTC+3).
const lateUtc = new Date('2026-10-19T21:30:00Z')
// 10:00 Kampala time on 19 Oct.
const morning = new Date('2026-10-19T07:00:00Z')

describe('Ugandan phone numbers', () => {
  it.each([
    ['0772 123456', '+256772123456'],
    ['+256 772 123 456', '+256772123456'],
    ['256-701-234-567', '+256701234567'],
    ['(0414) 123 456', '+256414123456'],
  ])('accepts %s', (input, expected) => expect(normalizeUgandanPhone(input)).toBe(expected))

  it.each(['12345', '0872 123456', '+254 712 345 678', '07721234567', 'phone'])('rejects %s', input => {
    expect(normalizeUgandanPhone(input)).toBeNull()
  })

  it('treats an empty optional phone as valid and an empty required one as an error', () => {
    expect(phoneError('', false)).toBeNull()
    expect(phoneError('  ', true)).toMatch(/Enter a phone number/)
  })
})

describe('Kampala dates', () => {
  it('uses the Kampala calendar day, not the browser zone', () => {
    expect(kampalaToday(lateUtc)).toBe('2026-10-20')
    expect(dateError('2026-10-19', lateUtc)).toMatch(/Kampala time/)
    expect(dateError('2026-10-20', lateUtc)).toBeNull()
  })

  it('rejects dates beyond the booking horizon and malformed dates', () => {
    expect(dateError('2026-12-01', morning)).toMatch(/within the next/)
    expect(dateError('2026-13-45', morning)).toMatch(/valid date/)
    expect(dateError('', morning)).toMatch(/Choose a preferred date/)
  })

  it('rejects a time window that has already ended today', () => {
    const afternoon = new Date('2026-10-19T13:00:00Z') // 16:00 Kampala
    expect(timeWindowError('morning', '2026-10-19', afternoon)).toMatch(/already passed/)
    expect(timeWindowError('afternoon', '2026-10-19', afternoon)).toBeNull()
    expect(timeWindowError('morning', '2026-10-20', afternoon)).toBeNull()
    expect(timeWindowError('', '2026-10-20', afternoon)).toMatch(/Choose a preferred time window/)
  })
})

describe('checkout transitions', () => {
  const withFulfilment = (method: CheckoutDraft['method']): CheckoutDraft => ({ ...emptyDraft(), method, branch: 'muyenga' })

  it('starts at fulfilment and will not open later stages early', () => {
    expect(firstIncompleteStage(emptyDraft(), morning)).toBe('fulfilment')
    expect(canOpenStage('review', emptyDraft(), morning)).toBe(false)
    expect(canOpenStage('details', withFulfilment('delivery'), morning)).toBe(true)
    expect(canOpenStage('review', withFulfilment('delivery'), morning)).toBe(false)
  })

  it('requires address and landmark for delivery but not for collection', () => {
    const base = { fullName: 'Amara Demo', phone: '0772 123456', date: '2026-10-20', timeWindow: 'morning' }
    const delivery = validateDetails({ ...withFulfilment('delivery'), ...base }, morning)
    expect(Object.keys(delivery).sort()).toEqual(['address', 'landmark'])
    expect(validateDetails({ ...withFulfilment('collection'), ...base }, morning)).toEqual({})
  })

  it('reaches review with the sample details for either method', () => {
    for (const method of ['delivery', 'collection'] as const) {
      const draft = { ...withFulfilment(method), ...sampleDetails(method, '2026-10-20') }
      expect(firstIncompleteStage(draft, morning)).toBe('review')
    }
  })

  it('creates readable demo references', () => {
    expect(createReference(bytes => bytes.fill(0))).toBe('DEMO-AAAAAA')
    expect(createReference()).toMatch(/^DEMO-[A-HJ-NP-Z2-9]{6}$/)
  })
})

describe('contact enquiry validation', () => {
  it('needs an email or a phone number', () => {
    const errors = validateContact({ ...emptyContact(), name: 'Amara', topic: 'general', message: 'Hello there, a question.' }, '2026-10-19')
    expect(errors).toEqual({ contact: expect.stringMatching(/email address or a phone number/) })
  })

  it('asks for topic-specific details only where relevant', () => {
    const base = { ...emptyContact(), name: 'Amara', phone: '0772 123456', message: 'Planning ahead for a family event.' }
    expect(validateContact({ ...base, topic: 'availability' }, '2026-10-19')).toHaveProperty('productName')
    expect(validateContact({ ...base, topic: 'occasion' }, '2026-10-19')).toHaveProperty('eventDate')
    expect(validateContact({ ...base, topic: 'occasion', eventDate: '2026-10-01' }, '2026-10-19').eventDate).toMatch(/later date/)
    expect(validateContact({ ...base, topic: 'feedback' }, '2026-10-19')).toEqual({})
  })
})
