import { getProduct, maxQuantity, optionLabel, type Product } from '../data/catalog'
import { FULFILMENT_FEES, type FulfilmentMethod } from '../config/fulfilment'

export interface BasketLine {
  productId: string
  optionId: string | null
  quantity: number
}

export interface PricedLine {
  key: string
  line: BasketLine
  product: Product
  optionLabel: string | null
  unitPriceUgx: number
  lineTotalUgx: number
}

export type BasketAction =
  | { type: 'add'; productId: string; optionId: string | null; quantity: number }
  | { type: 'set'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }

export const lineKey = (line: Pick<BasketLine, 'productId' | 'optionId'>) => `${line.productId}::${line.optionId ?? ''}`

const clamp = (quantity: number, max: number) => Math.max(0, Math.min(Math.floor(quantity), max))

/** True when the option is valid for the product (or the product has none and none was given). */
function optionIsValid(product: Product, optionId: string | null) {
  if (!product.options) return optionId === null
  return product.options.choices.some(choice => choice.id === optionId)
}

export function basketReducer(lines: BasketLine[], action: BasketAction): BasketLine[] {
  switch (action.type) {
    case 'add': {
      const product = getProduct(action.productId)
      if (!product || !optionIsValid(product, action.optionId) || !Number.isFinite(action.quantity) || action.quantity < 1) return lines
      const max = maxQuantity(product)
      if (max === 0) return lines
      const key = lineKey(action)
      const existing = lines.find(line => lineKey(line) === key)
      if (existing) {
        // Same product and option merge into one line rather than duplicating it.
        return lines.map(line => (line === existing ? { ...line, quantity: clamp(line.quantity + action.quantity, max) } : line))
      }
      return [...lines, { productId: action.productId, optionId: action.optionId, quantity: clamp(action.quantity, max) }]
    }
    case 'set': {
      const existing = lines.find(line => lineKey(line) === action.key)
      const product = existing && getProduct(existing.productId)
      if (!existing || !product || !Number.isFinite(action.quantity)) return lines
      const quantity = clamp(action.quantity, maxQuantity(product))
      if (quantity === 0) return lines.filter(line => line !== existing)
      return lines.map(line => (line === existing ? { ...line, quantity } : line))
    }
    case 'remove':
      return lines.filter(line => lineKey(line) !== action.key)
    case 'clear':
      return []
  }
}

export function priceBasket(lines: BasketLine[]) {
  const priced: PricedLine[] = []
  for (const line of lines) {
    const product = getProduct(line.productId)
    if (!product) continue
    priced.push({
      key: lineKey(line),
      line,
      product,
      optionLabel: optionLabel(product, line.optionId),
      unitPriceUgx: product.priceUgx,
      lineTotalUgx: product.priceUgx * line.quantity,
    })
  }
  const subtotalUgx = priced.reduce((sum, line) => sum + line.lineTotalUgx, 0)
  const itemCount = priced.reduce((sum, line) => sum + line.line.quantity, 0)
  return { lines: priced, subtotalUgx, itemCount }
}

export function fulfilmentTotals(subtotalUgx: number, method: FulfilmentMethod) {
  const { feeUgx, label } = FULFILMENT_FEES[method]
  return { subtotalUgx, feeUgx, feeLabel: label, totalUgx: subtotalUgx + feeUgx }
}

// ---- Persistence -------------------------------------------------------------
// Only product ids, option ids and quantities are stored: nothing personal.

export const BASKET_STORAGE_KEY = 'tmt-concept-basket'
export const BASKET_STORAGE_VERSION = 1

export function serializeBasket(lines: BasketLine[]) {
  return JSON.stringify({ version: BASKET_STORAGE_VERSION, lines })
}

/**
 * Rebuilds a basket from stored text, dropping anything that no longer matches
 * the catalogue. Malformed or foreign data yields an empty basket, never a throw.
 */
export function parseStoredBasket(raw: string | null): BasketLine[] {
  if (!raw) return []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return []
  }
  if (!data || typeof data !== 'object') return []
  const { version, lines } = data as { version?: unknown; lines?: unknown }
  if (version !== BASKET_STORAGE_VERSION || !Array.isArray(lines)) return []
  let result: BasketLine[] = []
  for (const entry of lines) {
    if (!entry || typeof entry !== 'object') continue
    const { productId, optionId, quantity } = entry as Record<string, unknown>
    if (typeof productId !== 'string' || typeof quantity !== 'number' || !Number.isInteger(quantity)) continue
    const option = optionId === null || optionId === undefined ? null : typeof optionId === 'string' ? optionId : undefined
    if (option === undefined) continue
    // Re-adding through the reducer applies the same validation, clamping and merging as live use.
    result = basketReducer(result, { type: 'add', productId, optionId: option, quantity })
  }
  return result
}
