import { useEffect } from 'react'

const SITE = 'TMT Supermarket concept'

export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `Fresh finds. Full baskets. · ${SITE}`
  }, [title])
}
