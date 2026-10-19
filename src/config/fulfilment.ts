// Illustrative fulfilment policy for the concept. Not TMT's delivery pricing or hours.
// Centralised so every total, label and test reads the same numbers.

export type FulfilmentMethod = 'delivery' | 'collection'

export const FULFILMENT_FEES: Record<FulfilmentMethod, { feeUgx: number; label: string }> = {
  delivery: { feeUgx: 5000, label: 'Demo delivery fee' },
  collection: { feeUgx: 0, label: 'Collection fee' },
}

export interface TimeWindow {
  id: string
  label: string
  startHour: number
  endHour: number
}

/** Preference windows only — they are not checked against real store capacity. */
export const TIME_WINDOWS: TimeWindow[] = [
  { id: 'morning', label: '9:00 – 12:00', startHour: 9, endHour: 12 },
  { id: 'midday', label: '12:00 – 15:00', startHour: 12, endHour: 15 },
  { id: 'afternoon', label: '15:00 – 18:00', startHour: 15, endHour: 18 },
]

export const MAX_DAYS_AHEAD = 14
export const STORE_TIME_ZONE = 'Africa/Kampala'
