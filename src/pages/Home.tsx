import { useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { categories, everydayFavouriteIds, featuredProductIds, productsByIds } from '../data/catalog'
import { branches, type Branch } from '../data/branches'
import { FULFILMENT_FEES } from '../config/fulfilment'
import { formatUgx } from '../lib/money'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { usePreferences } from '../state/PreferencesContext'
import { useHomeMotion } from '../home/useHomeMotion'
import { ProductCard } from '../components/ProductCard'
import { Img } from '../components/Img'
import { Icon } from '../components/Icon'
import { Faq } from '../components/Faq'

const HERO_ITEMS = [
  { image: 'orange', className: 'hero__item--orange' },
  { image: 'avocado', className: 'hero__item--avocado' },
  { image: 'tomatoes', className: 'hero__item--tomatoes' },
  { image: 'cooking-oil', className: 'hero__item--oil' },
]

const HOME_FAQ = [
  { question: 'Can I choose delivery or collection?', answer: <p>Yes. At checkout you choose delivery to your door or click and collect from Muyenga or Bukoto, then a preferred date and time window.</p> },
  { question: 'What does delivery cost?', answer: <p>This concept shows an illustrative {FULFILMENT_FEES.delivery.label.toLowerCase()} of {formatUgx(FULFILMENT_FEES.delivery.feeUgx)}; collection is {formatUgx(0)}. These are demonstration figures, not TMT’s pricing.</p> },
  { question: 'Will my basket be saved?', answer: <p>Your basket is remembered on this device, so a refresh won’t lose it. Personal details you type at checkout are never saved.</p> },
  { question: 'Is this TMT Supermarket’s official website?', answer: <p>No — it’s an independent website concept. No payments are taken and no orders are sent. <Link to="/about#concept">Read the disclosure</Link>.</p> },
]

export default function Home() {
  useDocumentTitle(null)
  const root = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const prefs = usePreferences()
  useHomeMotion(root)

  const collectFrom = (branch: Branch) => {
    prefs.setBranch(branch.id)
    prefs.setMethod('collection')
    navigate('/shop')
  }

  return (
    <div className="home" ref={root}>
      {/* ---- Hero ---------------------------------------------------------------- */}
      <section className="hero" data-anim="hero" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow hero__eyebrow" data-hero="eyebrow">Muyenga · Bukoto · Kampala</p>
            <h1 className="hero__title" id="hero-title">
              <span className="hero__line"><span data-hero="line">Fresh</span></span>{' '}
              <span className="hero__line hero__line--indent"><span data-hero="line">finds.</span></span>{' '}
              <span className="hero__line hero__line--accent"><span data-hero="line">Full</span></span>{' '}
              <span className="hero__line hero__line--accent hero__line--indent"><span data-hero="line">baskets.</span></span>
            </h1>
            <p className="hero__lede" data-hero="lede">Your everyday favourites, brought together beautifully.</p>
            <div className="hero__ctas" data-hero="cta">
              <Link to="/shop" className="button button--primary button--large">Start shopping <Icon name="arrow" size={20} /></Link>
              <a href="#departments" className="button button--ghost button--large">Explore departments</a>
            </div>
            <ul className="hero__meta" data-hero="meta">
              <li><Icon name="truck" size={18} /> Delivery</li>
              <li><Icon name="bag" size={18} /> Click &amp; collect</li>
            </ul>
          </div>

          <div className="hero__stage">
            <div className="hero__arch" data-hero="arch" />
            <div className="hero__sun" data-hero="sun" />
            <div className="hero__bag" data-layer="bag">
              <img
                data-hero="bag"
                src="/images/bag-480.webp"
                srcSet="/images/bag-480.webp 480w, /images/bag-820.webp 820w"
                sizes="(min-width: 900px) 34vw, 62vw"
                width={820}
                height={980}
                alt="A kraft paper TMT grocery bag filled with pineapple, bananas, lettuce, a tomato, avocado, milk and a baguette"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            {HERO_ITEMS.map(item => (
              <div key={item.image} className={`hero__item ${item.className}`} data-layer="item">
                <img data-hero="item" src={`/images/product-${item.image}-320.webp`} width={320} height={320} alt="" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Departments ----------------------------------------------------------- */}
      <section className="departments" id="departments" tabIndex={-1} aria-labelledby="departments-title">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <p className="eyebrow">Departments</p>
              <h2 className="section-title section-title--xl" id="departments-title">Every aisle,<br />one basket.</h2>
            </div>
            <p className="section-head__aside">From sweet bananas and crisp spinach to washing-up liquid — the whole shop, arranged the way you actually cook and clean.</p>
          </div>
          <ul className="dept-grid">
            {categories.map((category, index) => (
              <li key={category.slug} className={`dept-card dept-card--${index + 1}`} data-anim="dept">
                <Link to={`/shop/${category.slug}`} className="dept-card__link">
                  <div className="dept-card__media">
                    <Img name={category.image} widths={[640, 1024]} ratio={[3, 2]} sizes={index === 0 ? '(min-width: 900px) 58vw, 100vw' : '(min-width: 900px) 38vw, 100vw'} alt="" />
                  </div>
                  <div className="dept-card__text">
                    <span className="dept-card__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="dept-card__name">{category.name}</h3>
                    <p>{category.blurb}</p>
                    <span className="dept-card__cta">Shop {category.shortName.toLowerCase()} <Icon name="arrow" size={18} /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Featured picks -------------------------------------------------------- */}
      <section className="featured" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Featured</p>
              <h2 className="section-title" id="featured-title">Picked for the week ahead</h2>
            </div>
            <Link to="/shop" className="text-link">Shop everything <Icon name="arrow" size={18} /></Link>
          </div>
          <ul className="product-grid product-grid--four" data-anim="reveal-grid">
            {productsByIds(featuredProductIds).map(product => <li key={product.id}><ProductCard product={product} /></li>)}
          </ul>
        </div>
      </section>

      {/* ---- Typographic transition + everyday favourites ---------------------------- */}
      <section className="favourites" aria-labelledby="favourites-title">
        <div className="kinetic" data-anim="kinetic">
          <h2 className="visually-hidden" id="favourites-title">Everyday favourites</h2>
          <p className="kinetic__row" data-anim="kinetic-row" aria-hidden="true">Everyday <em>favourites</em></p>
          <p className="kinetic__row kinetic__row--outline" data-anim="kinetic-row" aria-hidden="true">done beautifully</p>
        </div>
        <div className="container">
          <p className="favourites__intro">The things that go in almost every basket — bread, milk, bananas and the staples behind a good dinner.</p>
          <ul className="product-grid product-grid--six" data-anim="reveal-grid">
            {productsByIds(everydayFavouriteIds).map(product => <li key={product.id}><ProductCard product={product} /></li>)}
          </ul>
        </div>
      </section>

      {/* ---- Delivery story -------------------------------------------------------- */}
      <section className="story" data-anim="story" aria-labelledby="story-title">
        <div className="container story__grid">
          <div className="story__visual">
            <div className="story__items" aria-hidden="true">
              {['bananas', 'milk', 'baguette'].map(image => (
                <img key={image} data-anim="story-item" className={`story__item story__item--${image}`} src={`/images/product-${image}-320.webp`} width={320} height={320} alt="" loading="lazy" />
              ))}
            </div>
            <div className="story__image" data-anim="story-image">
              <Img name="delivery" widths={[768, 1280]} ratio={[3, 2]} sizes="(min-width: 900px) 46vw, 100vw" alt="Concept image: a TMT paper grocery bag being handed over at a customer’s front door" />
            </div>
          </div>
          <div className="story__copy" data-anim="story-copy">
            <p className="eyebrow eyebrow--light">Delivery &amp; collection</p>
            <h2 className="section-title section-title--light" id="story-title">From our shelves to your doorstep.</h2>
            <p>Fill your basket, choose delivery or click and collect, and pick a preferred time. Review everything before you finish — no surprises.</p>
            <ul className="story__facts">
              <li><strong>Delivery</strong> {FULFILMENT_FEES.delivery.label.toLowerCase()}: {formatUgx(FULFILMENT_FEES.delivery.feeUgx)}</li>
              <li><strong>Collection</strong> from Muyenga or Bukoto: {formatUgx(0)}</li>
            </ul>
            <div className="button-row">
              <Link to="/delivery" className="button button--orange">How delivery works</Link>
              <Link to="/shop" className="button button--ghost-light">Start shopping</Link>
            </div>
            <p className="fine-print fine-print--light">Delivery availability and charges shown in this concept are illustrative.</p>
          </div>
        </div>
      </section>

      {/* ---- Branches ---------------------------------------------------------------- */}
      <section className="home-branches container" aria-labelledby="home-branches-title">
        <div className="section-head">
          <div>
            <p className="eyebrow">Branches</p>
            <h2 className="section-title" id="home-branches-title">Find us in two neighbourhoods</h2>
          </div>
          <Link to="/branches" className="text-link">All branch details <Icon name="arrow" size={18} /></Link>
        </div>
        <div className="home-branches__grid">
          {branches.map((branch, index) => (
            <article key={branch.id} className={`home-branch home-branch--${index ? 'orange' : 'green'}`}>
              <p className="home-branch__type" aria-hidden="true">{branch.name}</p>
              <h3 className="home-branch__name">{branch.name}</h3>
              <p className="home-branch__location"><Icon name="pin" size={18} /> {branch.location}</p>
              <div className="button-row">
                <button type="button" className="button button--small button--light" onClick={() => collectFrom(branch)}>Shop for collection</button>
                <Link to={`/branches#${branch.id}`} className="button button--small button--ghost-light">Branch details</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---- FAQ ----------------------------------------------------------------------- */}
      <section className="container faq-section faq-section--home" aria-labelledby="home-faq-title">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="section-title" id="home-faq-title">Good to know</h2>
          <p>More about delivery on the <Link to="/delivery">delivery page</Link>, or <Link to="/contact">send a special request</Link>.</p>
        </div>
        <Faq items={HOME_FAQ} />
      </section>

      {/* ---- Closing CTA ------------------------------------------------------------- */}
      <section className="closing" aria-labelledby="closing-title">
        <div className="container closing__inner">
          <h2 className="closing__title" id="closing-title">Your basket<br />is waiting.</h2>
          <div className="closing__actions">
            <Link to="/shop" className="button button--orange button--large">Start shopping <Icon name="arrow" size={20} /></Link>
            <Link to="/delivery" className="button button--ghost-light button--large">Delivery &amp; collection</Link>
          </div>
          <img className="closing__item closing__item--orange" src="/images/product-orange-320.webp" width={320} height={320} alt="" loading="lazy" />
          <img className="closing__item closing__item--avocado" src="/images/product-avocado-320.webp" width={320} height={320} alt="" loading="lazy" />
        </div>
      </section>
    </div>
  )
}
