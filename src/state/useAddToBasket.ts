import { useCallback } from 'react'
import type { Product } from '../data/catalog'
import { useBasket } from './BasketContext'
import { useToast } from './ToastContext'

export const BASKET_BUMP_EVENT = 'tmt:basket-bump'

/** Adds to the shared basket and gives one accurate announcement of what happened. */
export function useAddToBasket() {
  const { add } = useBasket()
  const { notify } = useToast()

  return useCallback((product: Product, optionId: string | null, quantity: number) => {
    const result = add(product.id, optionId, quantity)
    const option = optionId && product.options?.choices.find(choice => choice.id === optionId)?.label
    const name = option ? `${product.name} (${option})` : product.name
    if (result.status === 'unavailable') {
      notify(`${product.name} is unavailable in this demo.`)
    } else if (result.status === 'capped') {
      notify(`${name} is limited to ${result.max} per order in this demo. Your basket has ${result.quantity}.`, { label: 'View basket', to: '/cart' })
      window.dispatchEvent(new Event(BASKET_BUMP_EVENT))
    } else {
      notify(`Added ${quantity} × ${name}. ${result.quantity} in your basket.`, { label: 'View basket', to: '/cart' })
      window.dispatchEvent(new Event(BASKET_BUMP_EVENT))
    }
    return result
  }, [add, notify])
}
