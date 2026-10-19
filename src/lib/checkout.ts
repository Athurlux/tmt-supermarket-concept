import type { BranchId } from '../data/branches'
import type { FulfilmentMethod } from '../config/fulfilment'
import { dateError, emailError, phoneError, requiredText, timeWindowError } from './validation'

export type CheckoutStage = 'fulfilment' | 'details' | 'review'
export const CHECKOUT_STAGES: CheckoutStage[] = ['fulfilment', 'details', 'review']

/** Held in memory only. Never persisted, never placed in a URL. */
export interface CheckoutDraft {
  method: FulfilmentMethod | null
  branch: BranchId | null
  fullName: string
  phone: string
  email: string
  address: string
  landmark: string
  date: string
  timeWindow: string
  instructions: string
}

export const emptyDraft = (): CheckoutDraft => ({
  method: null, branch: null, fullName: '', phone: '', email: '', address: '', landmark: '', date: '', timeWindow: '', instructions: '',
})

export type DraftErrors = Partial<Record<keyof CheckoutDraft, string>>

export function validateFulfilment(draft: CheckoutDraft): DraftErrors {
  const errors: DraftErrors = {}
  if (!draft.method) errors.method = 'Choose delivery or click and collect.'
  if (!draft.branch) errors.branch = draft.method === 'collection' ? 'Choose the branch you would collect from.' : 'Choose the branch you would like to shop from.'
  return errors
}

export function validateDetails(draft: CheckoutDraft, now = new Date()): DraftErrors {
  const errors: DraftErrors = {}
  const set = (field: keyof CheckoutDraft, message: string | null) => { if (message) errors[field] = message }
  set('fullName', requiredText(draft.fullName, 'Enter your full name.'))
  set('phone', phoneError(draft.phone, true))
  set('email', emailError(draft.email, false))
  if (draft.method === 'delivery') {
    set('address', requiredText(draft.address, 'Enter a delivery address.', 5))
    set('landmark', requiredText(draft.landmark, 'Add a nearby landmark to help find you.'))
  }
  const dateMessage = dateError(draft.date, now)
  set('date', dateMessage)
  if (!dateMessage) set('timeWindow', timeWindowError(draft.timeWindow, draft.date, now))
  else if (!draft.timeWindow) set('timeWindow', 'Choose a preferred time window.')
  if (draft.instructions.length > 300) errors.instructions = 'Keep instructions under 300 characters.'
  return errors
}

/** The furthest stage a visitor may open, so a direct visit to review cannot skip validation. */
export function firstIncompleteStage(draft: CheckoutDraft, now = new Date()): CheckoutStage {
  if (Object.keys(validateFulfilment(draft)).length) return 'fulfilment'
  if (Object.keys(validateDetails(draft, now)).length) return 'details'
  return 'review'
}

export function canOpenStage(stage: CheckoutStage, draft: CheckoutDraft, now = new Date()) {
  return CHECKOUT_STAGES.indexOf(stage) <= CHECKOUT_STAGES.indexOf(firstIncompleteStage(draft, now))
}

/** Clearly fictional details for demonstrations: placeholder name, example.com email and zero-padded digits. */
export function sampleDetails(method: FulfilmentMethod | null, tomorrow: string): Partial<CheckoutDraft> {
  return {
    fullName: 'Amara Demo',
    phone: '0700 000 001',
    email: 'amara.demo@example.com',
    ...(method === 'delivery' ? { address: 'Plot 0, Example Close, Kampala', landmark: 'Beside the sample blue gate' } : {}),
    date: tomorrow,
    timeWindow: 'midday',
    instructions: 'Sample instruction: please call on arrival.',
  }
}

export function createReference(random: (bytes: Uint8Array) => Uint8Array = bytes => crypto.getRandomValues(bytes)) {
  // No 0/O or 1/I so a reference read aloud is unambiguous.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = random(new Uint8Array(6))
  return `DEMO-${Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('')}`
}
