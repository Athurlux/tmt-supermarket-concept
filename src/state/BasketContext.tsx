import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { getProduct, maxQuantity } from '../data/catalog'
import {
  BASKET_STORAGE_KEY, basketReducer, lineKey, parseStoredBasket, priceBasket, serializeBasket, type BasketLine,
} from '../lib/basket'

export type AddResult =
  | { status: 'added'; quantity: number }
  | { status: 'capped'; quantity: number; max: number }
  | { status: 'unavailable' }

interface BasketValue {
  lines: BasketLine[]
  priced: ReturnType<typeof priceBasket>
  add: (productId: string, optionId: string | null, quantity: number) => AddResult
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const BasketContext = createContext<BasketValue | null>(null)

// Storage can be missing (privacy modes) or throw (quota); the basket then simply
// lives in memory for the visit.
function readStored(): BasketLine[] {
  try {
    return parseStoredBasket(window.localStorage.getItem(BASKET_STORAGE_KEY))
  } catch {
    return []
  }
}

function writeStored(lines: BasketLine[]) {
  try {
    if (lines.length) window.localStorage.setItem(BASKET_STORAGE_KEY, serializeBasket(lines))
    else window.localStorage.removeItem(BASKET_STORAGE_KEY)
  } catch {
    // Persisting is a convenience; failing to persist must not break shopping.
  }
}

type Action = Parameters<typeof basketReducer>[1] | { type: 'replace'; lines: BasketLine[] }

function reducer(lines: BasketLine[], action: Action) {
  return action.type === 'replace' ? action.lines : basketReducer(lines, action)
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, undefined, readStored)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => writeStored(lines), [lines])

  // Keep two open tabs in step instead of letting the last write silently win.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === BASKET_STORAGE_KEY) dispatch({ type: 'replace', lines: parseStoredBasket(event.newValue) })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((productId: string, optionId: string | null, quantity: number): AddResult => {
    const product = getProduct(productId)
    if (!product || maxQuantity(product) === 0) return { status: 'unavailable' }
    const max = maxQuantity(product)
    const existing = lines.find(line => lineKey(line) === lineKey({ productId, optionId }))?.quantity ?? 0
    dispatch({ type: 'add', productId, optionId, quantity })
    const next = Math.min(existing + quantity, max)
    return existing + quantity > max ? { status: 'capped', quantity: next, max } : { status: 'added', quantity: next }
  }, [lines])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const value = useMemo<BasketValue>(() => ({
    lines,
    priced: priceBasket(lines),
    add,
    setQuantity: (key, quantity) => dispatch({ type: 'set', key, quantity }),
    remove: key => dispatch({ type: 'remove', key }),
    clear: () => dispatch({ type: 'clear' }),
    drawerOpen,
    openDrawer,
    closeDrawer,
  }), [lines, add, drawerOpen, openDrawer, closeDrawer])

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
}

export function useBasket() {
  const value = useContext(BasketContext)
  if (!value) throw new Error('useBasket must be used inside BasketProvider')
  return value
}
