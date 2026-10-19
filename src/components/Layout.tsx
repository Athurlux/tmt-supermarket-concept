import { Suspense } from 'react'
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { BasketDrawer } from './BasketDrawer'
import { useRouteFocus } from '../lib/useRouteFocus'

export function Layout() {
  const location = useLocation()
  const navigation = useNavigation()
  useRouteFocus()

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="concept-bar">
        <p className="container">Independent website concept — demo prices, no real orders or payments.</p>
      </div>
      <Header />
      <main id="main" tabIndex={-1} className={navigation.state === 'loading' ? 'is-loading' : undefined}>
        <Suspense fallback={<div className="route-loading" aria-busy="true" />}>
          <Outlet key={location.pathname.startsWith('/shop') ? '/shop' : location.pathname} />
        </Suspense>
      </main>
      <Footer />
      <BasketDrawer />
      {/* Shop filters share one position per department; first-loaded pages all carry the key
          "default", so they are keyed by path to stop one page restoring another's scroll. */}
      <ScrollRestoration getKey={loc => (loc.pathname.startsWith('/shop') || loc.key === 'default' ? loc.pathname : loc.key)} />
    </>
  )
}
