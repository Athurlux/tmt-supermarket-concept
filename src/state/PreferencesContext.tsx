import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getBranch, type BranchId } from '../data/branches'
import type { FulfilmentMethod } from '../config/fulfilment'

// Branch and method are shopping preferences, not personal data, so they persist.
// The delivery area a visitor types stays in memory for the visit only.
const STORAGE_KEY = 'tmt-concept-preferences'

interface Preferences {
  branch: BranchId | null
  method: FulfilmentMethod | null
}

interface PreferencesValue extends Preferences {
  deliveryArea: string
  setBranch: (branch: BranchId | null) => void
  setMethod: (method: FulfilmentMethod | null) => void
  setDeliveryArea: (area: string) => void
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

function readStored(): Preferences {
  try {
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Preferences> | null
    return {
      branch: getBranch(data?.branch)?.id ?? null,
      method: data?.method === 'delivery' || data?.method === 'collection' ? data.method : null,
    }
  } catch {
    return { branch: null, method: null }
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(readStored)
  const [deliveryArea, setDeliveryArea] = useState('')

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // Preference is a convenience only.
    }
  }, [prefs])

  const value = useMemo<PreferencesValue>(() => ({
    ...prefs,
    deliveryArea,
    setBranch: branch => setPrefs(current => ({ ...current, branch })),
    setMethod: method => setPrefs(current => ({ ...current, method })),
    setDeliveryArea,
  }), [prefs, deliveryArea])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences must be used inside PreferencesProvider')
  return value
}
