// Only details confirmed in TMT Supermarket's own public posts are listed.
// Opening hours, phone numbers and services were not verified, so they are omitted.

export type BranchId = 'muyenga' | 'bukoto'

export interface Branch {
  id: BranchId
  name: string
  area: string
  location: string
  /** Search query for a map link; a search, not a pinned coordinate we cannot verify. */
  mapQuery: string
  note: string
}

export const branches: Branch[] = [
  {
    id: 'muyenga',
    name: 'Muyenga',
    area: 'South-east Kampala',
    location: 'Tank Hill Road, Muyenga, Kampala',
    mapQuery: 'TMT Supermarket Tank Hill Road Muyenga Kampala',
    note: 'On the climb up Tank Hill — a neighbourhood stop for the Muyenga, Kansanga and Bukasa side of town.',
  },
  {
    id: 'bukoto',
    name: 'Bukoto',
    area: 'North-east Kampala',
    location: 'Old Kira Road area, Bukoto, Kampala',
    mapQuery: 'TMT Supermarket Old Kira Road Bukoto Kampala',
    note: 'Along the Kira Road corridor — convenient for Bukoto, Ntinda, Kamwokya and Naguru.',
  },
]

export const getBranch = (id: string | null | undefined) => branches.find(branch => branch.id === id)

export const mapSearchUrl = (branch: Branch) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapQuery)}`
