import { useNavigate } from 'react-router'
import { branches, mapSearchUrl, type Branch } from '../data/branches'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { usePreferences } from '../state/PreferencesContext'
import { useToast } from '../state/ToastContext'
import { Icon } from '../components/Icon'

export default function Branches() {
  useDocumentTitle('Branches')
  const prefs = usePreferences()
  const { notify } = useToast()
  const navigate = useNavigate()

  const choose = (branch: Branch) => {
    prefs.setBranch(branch.id)
    notify(`${branch.name} is now your preferred branch.`)
  }

  const shopFor = (branch: Branch, method: 'collection' | 'delivery') => {
    prefs.setBranch(branch.id)
    prefs.setMethod(method)
    navigate('/shop')
  }

  return (
    <div className="branches-page">
      <section className="container page-intro">
        <p className="eyebrow">Branches</p>
        <h1 className="page-title">Two neighbourhoods. One basket.</h1>
        <p className="lede">Choose the branch you shop from. Your choice carries into the shop and checkout for delivery or click and collect.</p>
      </section>

      <section className="container branch-list" aria-label="Branches">
        {branches.map((branch, index) => {
          const selected = prefs.branch === branch.id
          return (
            <article key={branch.id} id={branch.id} tabIndex={-1} className={`branch-panel branch-panel--${index % 2 ? 'orange' : 'green'} ${selected ? 'is-selected' : ''}`} aria-labelledby={`${branch.id}-name`}>
              <div className="branch-panel__type" aria-hidden="true">{branch.name}</div>
              <div className="branch-panel__body">
                <p className="eyebrow">{branch.area}</p>
                <h2 className="branch-panel__name" id={`${branch.id}-name`}>{branch.name}</h2>
                <p className="branch-panel__location"><Icon name="pin" size={18} /> {branch.location}</p>
                <p>{branch.note}</p>
                {selected && <p className="branch-panel__selected"><Icon name="check" size={16} /> Your preferred branch</p>}
                <div className="button-row">
                  <button type="button" className="button button--primary" onClick={() => shopFor(branch, 'collection')}>
                    Shop for collection here
                  </button>
                  <button type="button" className="button button--outline" onClick={() => shopFor(branch, 'delivery')}>
                    Shop for delivery
                  </button>
                </div>
                <div className="branch-panel__links">
                  {!selected && <button type="button" className="text-button" onClick={() => choose(branch)}>Set as preferred branch</button>}
                  <a className="text-link" href={mapSearchUrl(branch)} target="_blank" rel="noopener noreferrer">
                    Search directions on Google Maps <span className="visually-hidden">(opens in a new tab)</span> <Icon name="arrow" size={16} />
                  </a>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="container branch-note">
        <p className="fine-print">
          Locations are taken from TMT Supermarket’s public social posts. Opening hours, phone numbers and in-store services are not
          listed because they could not be verified for this concept. Branch selection is a shopping preference; branch stock is not checked.
        </p>
      </section>
    </div>
  )
}
