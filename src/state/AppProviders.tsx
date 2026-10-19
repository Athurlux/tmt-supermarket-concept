import type { ReactNode } from 'react'
import { BasketProvider } from './BasketContext'
import { CheckoutProvider } from './CheckoutContext'
import { PreferencesProvider } from './PreferencesContext'

// Providers sit above the router so basket, preferences and in-memory checkout
// survive every navigation. Toasts live inside the router because they render links.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <BasketProvider>
        <CheckoutProvider>{children}</CheckoutProvider>
      </BasketProvider>
    </PreferencesProvider>
  )
}
