import type { BranchId } from '../data/branches'
import { emailError, phoneError, requiredText } from './validation'

export const CONTACT_TOPICS = [
  { id: 'general', label: 'General enquiry' },
  { id: 'availability', label: 'Product availability' },
  { id: 'bulk', label: 'Bulk shopping' },
  { id: 'occasion', label: 'Special occasion request' },
  { id: 'feedback', label: 'Feedback' },
] as const

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['id']

/** In memory only — cleared when the visitor starts over or leaves the page. */
export interface ContactDraft {
  name: string
  email: string
  phone: string
  topic: ContactTopic | ''
  branch: BranchId | ''
  productName: string
  eventDate: string
  message: string
}

export const emptyContact = (): ContactDraft => ({
  name: '', email: '', phone: '', topic: '', branch: '', productName: '', eventDate: '', message: '',
})

export type ContactErrors = Partial<Record<keyof ContactDraft | 'contact', string>>

export function validateContact(draft: ContactDraft, today: string): ContactErrors {
  const errors: ContactErrors = {}
  const set = (field: keyof ContactErrors, message: string | null) => { if (message) errors[field] = message }
  set('name', requiredText(draft.name, 'Enter your name.'))
  if (!draft.email.trim() && !draft.phone.trim()) {
    errors.contact = 'Give an email address or a phone number so a reply would be possible.'
  } else {
    set('email', emailError(draft.email, false))
    set('phone', phoneError(draft.phone, false))
  }
  if (!draft.topic) errors.topic = 'Choose a topic.'
  if (draft.topic === 'availability') set('productName', requiredText(draft.productName, 'Tell us which product you are looking for.'))
  if (draft.topic === 'occasion' || draft.topic === 'bulk') {
    if (draft.eventDate && draft.eventDate < today) errors.eventDate = 'Choose today or a later date.'
    if (draft.topic === 'occasion' && !draft.eventDate) errors.eventDate = 'Choose the date of your occasion.'
  }
  set('message', requiredText(draft.message, 'Write a message of at least 10 characters.', 10))
  if (draft.message.length > 1000) errors.message = 'Keep your message under 1,000 characters.'
  return errors
}

export const topicLabel = (topic: ContactTopic | '') => CONTACT_TOPICS.find(item => item.id === topic)?.label ?? ''
