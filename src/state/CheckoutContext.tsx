import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { emptyDraft, type CheckoutDraft } from '../lib/checkout'

export interface DemoSummary {
  reference: string
  createdAt: string
  draft: CheckoutDraft
  lines: SummaryLine[]
  subtotalUgx: number
  feeUgx: number
  feeLabel: string
  totalUgx: number
}

export interface SummaryLine {
  key: string
  name: string
  unit: string
  optionLabel: string | null
  quantity: number
  unitPriceUgx: number
  lineTotalUgx: number
}

interface CheckoutValue {
  draft: CheckoutDraft
  updateDraft: (patch: Partial<CheckoutDraft>) => void
  resetDraft: () => void
  summaries: Map<string, DemoSummary>
  saveSummary: (summary: DemoSummary) => void
}

const CheckoutContext = createContext<CheckoutValue | null>(null)

/**
 * Checkout details and completed demo summaries live only in React memory: they
 * survive moving between routes, and are gone on refresh by design.
 */
export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<CheckoutDraft>(emptyDraft)
  const [summaries, setSummaries] = useState(() => new Map<string, DemoSummary>())

  const updateDraft = useCallback((patch: Partial<CheckoutDraft>) => setDraft(current => ({ ...current, ...patch })), [])
  const resetDraft = useCallback(() => setDraft(emptyDraft()), [])
  const saveSummary = useCallback((summary: DemoSummary) => {
    setSummaries(current => new Map(current).set(summary.reference, summary))
  }, [])

  const value = useMemo(() => ({ draft, updateDraft, resetDraft, summaries, saveSummary }), [draft, updateDraft, resetDraft, summaries, saveSummary])
  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

export function useCheckout() {
  const value = useContext(CheckoutContext)
  if (!value) throw new Error('useCheckout must be used inside CheckoutProvider')
  return value
}
