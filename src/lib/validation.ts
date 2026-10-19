import { MAX_DAYS_AHEAD, STORE_TIME_ZONE, TIME_WINDOWS } from '../config/fulfilment'

const DIGITS_ONLY = /[\s\-().]/g

/**
 * Accepts Ugandan numbers in local (0772 123456) or international (+256 772 123456,
 * 256772123456) form. The national number is nine digits starting 2, 3, 4 or 7.
 */
export function normalizeUgandanPhone(input: string): string | null {
  const compact = input.trim().replace(DIGITS_ONLY, '')
  const match = /^(?:\+256|256|0)([2347]\d{8})$/.exec(compact)
  return match ? `+256${match[1]}` : null
}

export function phoneError(input: string, required: boolean): string | null {
  if (!input.trim()) return required ? 'Enter a phone number.' : null
  return normalizeUgandanPhone(input) ? null : 'Enter a Ugandan number, such as 0772 123 456 or +256 772 123 456.'
}

export function emailError(input: string, required: boolean): string | null {
  const value = input.trim()
  if (!value) return required ? 'Enter an email address.' : null
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? null : 'Enter an email address in the format name@example.com.'
}

export function requiredText(input: string, message: string, minLength = 2): string | null {
  return input.trim().length >= minLength ? null : message
}

// ---- Kampala dates ------------------------------------------------------------
// Dates are compared as YYYY-MM-DD strings in the store's time zone, so a visitor
// browsing from another zone still cannot choose a day already gone in Kampala.

function kampalaParts(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: STORE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? ''
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) }
}

export const kampalaToday = (now = new Date()) => kampalaParts(now).date

export function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function dateError(input: string, now = new Date()): string | null {
  if (!input) return 'Choose a preferred date.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input) || Number.isNaN(Date.parse(`${input}T00:00:00Z`))) return 'Enter a valid date.'
  const today = kampalaToday(now)
  if (input < today) return 'Choose today or a later date (Kampala time).'
  if (input > addDays(today, MAX_DAYS_AHEAD)) return `Choose a date within the next ${MAX_DAYS_AHEAD} days.`
  return null
}

export function timeWindowError(windowId: string, date: string, now = new Date()): string | null {
  const window = TIME_WINDOWS.find(item => item.id === windowId)
  if (!window) return 'Choose a preferred time window.'
  const { date: today, hour } = kampalaParts(now)
  if (date === today && hour >= window.endHour) return 'That window has already passed today. Choose a later window or another day.'
  return null
}

export function formatDisplayDate(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00Z`)
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(date)
}
