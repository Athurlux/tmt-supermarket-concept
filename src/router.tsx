import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout'
import { ToastProvider } from './state/ToastContext'
import { RouteError } from './pages/RouteError'

// Every page is its own chunk; GSAP is only pulled in by the pages that animate.
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default })

export const router = createBrowserRouter([
  {
    element: <ToastProvider><Layout /></ToastProvider>,
    errorElement: <RouteError />,
    hydrateFallbackElement: <div className="route-loading" aria-busy="true" />,
    children: [
      { index: true, lazy: page(() => import('./pages/Home')) },
      { path: 'shop', lazy: page(() => import('./pages/Shop')) },
      { path: 'shop/:categorySlug', lazy: page(() => import('./pages/Shop')) },
      { path: 'product/:productSlug', lazy: page(() => import('./pages/Product')) },
      { path: 'cart', lazy: page(() => import('./pages/Cart')) },
      { path: 'checkout', lazy: page(() => import('./pages/Checkout')) },
      { path: 'order-demo/:reference', lazy: page(() => import('./pages/OrderDemo')) },
      { path: 'delivery', lazy: page(() => import('./pages/Delivery')) },
      { path: 'branches', lazy: page(() => import('./pages/Branches')) },
      { path: 'contact', lazy: page(() => import('./pages/Contact')) },
      { path: 'about', lazy: page(() => import('./pages/About')) },
      { path: '*', lazy: page(() => import('./pages/NotFound')) },
    ],
  },
])
