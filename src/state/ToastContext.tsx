import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'

interface Toast {
  id: number
  message: string
  action?: { label: string; to: string }
}

interface ToastValue {
  notify: (message: string, action?: Toast['action']) => void
}

const ToastContext = createContext<ToastValue | null>(null)

/**
 * One polite live region. A new message replaces the old one instead of queueing,
 * so quick repeated adds produce one announcement rather than a backlog.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const counter = useRef(0)
  const hovered = useRef(false)
  const { pathname } = useLocation()

  // A message about the previous page ("1 in your basket") can be false on the next one.
  useEffect(() => setToast(null), [pathname])

  const notify = useCallback((message: string, action?: Toast['action']) => {
    counter.current += 1
    setToast({ id: counter.current, message, action })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(function dismiss() {
      if (hovered.current) return void window.setTimeout(dismiss, 1000)
      setToast(current => (current?.id === toast.id ? null : current))
    }, 4500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
        {toast && (
          <div
            className="toast"
            key={toast.id}
            onMouseEnter={() => { hovered.current = true }}
            onMouseLeave={() => { hovered.current = false }}
          >
            <span className="toast__dot" aria-hidden="true" />
            <span className="toast__message">{toast.message}</span>
            {toast.action && (
              <Link className="toast__action" to={toast.action.to} onClick={() => setToast(null)}>
                {toast.action.label}
              </Link>
            )}
            <button type="button" className="toast__close" aria-label="Dismiss notification" onClick={() => setToast(null)}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside ToastProvider')
  return value
}
