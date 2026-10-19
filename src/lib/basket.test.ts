import { describe, expect, it } from 'vitest'
import {
  BASKET_STORAGE_VERSION, basketReducer, fulfilmentTotals, lineKey, parseStoredBasket, priceBasket, serializeBasket,
  type BasketLine,
} from './basket'
import { FULFILMENT_FEES } from '../config/fulfilment'

const add = (lines: BasketLine[], productId: string, quantity = 1, optionId: string | null = null) =>
  basketReducer(lines, { type: 'add', productId, optionId, quantity })

describe('basket quantities', () => {
  it('merges the same product and option into one line', () => {
    let lines = add([], 'p-oranges', 2)
    lines = add(lines, 'p-oranges', 3)
    expect(lines).toEqual([{ productId: 'p-oranges', optionId: null, quantity: 5 }])
  })

  it('keeps different options of one product as separate lines', () => {
    let lines = add([], 'p-avocados', 1, 'ready')
    lines = add(lines, 'p-avocados', 2, 'firm')
    lines = add(lines, 'p-avocados', 1, 'ready')
    expect(lines.map(line => [line.optionId, line.quantity])).toEqual([['ready', 2], ['firm', 2]])
  })

  it('rejects unknown products, invalid options and unavailable stock', () => {
    expect(add([], 'p-missing')).toEqual([])
    expect(add([], 'p-avocados', 1, null)).toEqual([])
    expect(add([], 'p-oranges', 1, 'ready')).toEqual([])
    expect(add([], 'p-oats')).toEqual([])
    expect(add([], 'p-oranges', 0)).toEqual([])
  })

  it('caps quantities at the demo limit, lower for limited stock', () => {
    expect(add([], 'p-oranges', 50)[0].quantity).toBe(20)
    expect(add(add([], 'p-milk', 3), 'p-milk', 3)[0].quantity).toBe(4)
  })

  it('sets, floors and removes quantities', () => {
    const lines = add([], 'p-bananas', 2)
    const key = lineKey(lines[0])
    expect(basketReducer(lines, { type: 'set', key, quantity: 7.8 })[0].quantity).toBe(7)
    expect(basketReducer(lines, { type: 'set', key, quantity: 0 })).toEqual([])
    expect(basketReducer(lines, { type: 'set', key, quantity: Number.NaN })).toBe(lines)
    expect(basketReducer(lines, { type: 'remove', key })).toEqual([])
    expect(basketReducer(add(lines, 'p-milk'), { type: 'clear' })).toEqual([])
  })
})

describe('basket totals', () => {
  it('computes line totals, subtotal and item count in integer UGX', () => {
    let lines = add([], 'p-oranges', 2) // 2 × 6,000
    lines = add(lines, 'p-cooking-oil', 1) // 1 × 12,500
    const priced = priceBasket(lines)
    expect(priced.lines.map(line => line.lineTotalUgx)).toEqual([12000, 12500])
    expect(priced.subtotalUgx).toBe(24500)
    expect(priced.itemCount).toBe(3)
  })

  it('adds the configured demo fee for delivery and none for collection', () => {
    expect(fulfilmentTotals(24500, 'delivery')).toMatchObject({ feeUgx: FULFILMENT_FEES.delivery.feeUgx, totalUgx: 24500 + FULFILMENT_FEES.delivery.feeUgx })
    expect(fulfilmentTotals(24500, 'collection')).toMatchObject({ feeUgx: 0, totalUgx: 24500 })
  })
})

describe('persisted basket recovery', () => {
  it('round-trips a valid basket', () => {
    const lines = add(add([], 'p-oranges', 2), 'p-avocados', 1, 'firm')
    expect(parseStoredBasket(serializeBasket(lines))).toEqual(lines)
  })

  it('returns an empty basket for missing, malformed or wrong-version data', () => {
    expect(parseStoredBasket(null)).toEqual([])
    expect(parseStoredBasket('{not json')).toEqual([])
    expect(parseStoredBasket('"text"')).toEqual([])
    expect(parseStoredBasket(JSON.stringify({ version: 99, lines: [] }))).toEqual([])
    expect(parseStoredBasket(JSON.stringify({ version: BASKET_STORAGE_VERSION, lines: 'nope' }))).toEqual([])
  })

  it('drops invalid entries, clamps quantities and merges duplicates', () => {
    const raw = JSON.stringify({
      version: BASKET_STORAGE_VERSION,
      lines: [
        { productId: 'p-oranges', optionId: null, quantity: 2 },
        { productId: 'p-oranges', quantity: 1 },
        { productId: 'p-gone', optionId: null, quantity: 1 },
        { productId: 'p-milk', optionId: null, quantity: 99 },
        { productId: 'p-bananas', optionId: null, quantity: 1.5 },
        { productId: 'p-bananas', optionId: 3, quantity: 1 },
        null,
      ],
    })
    expect(parseStoredBasket(raw)).toEqual([
      { productId: 'p-oranges', optionId: null, quantity: 3 },
      { productId: 'p-milk', optionId: null, quantity: 4 },
    ])
  })
})
