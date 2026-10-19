import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useBasket } from '../state/BasketContext'
import { usePreferences } from '../state/PreferencesContext'
import { BASKET_BUMP_EVENT } from '../state/useAddToBasket'
import { getBranch } from '../data/branches'
import { useFocusTrap, useScrollLock } from '../lib/useFocusTrap'
import { Icon } from './Icon'
import { Logo } from './Logo'

export const NAV_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/delivery', label: 'Delivery' },
  { to: '/branches', label: 'Branches' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const { priced, openDrawer } = useBasket()
  const { branch } = usePreferences()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const location = useLocation()
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // The whole header is the trap so the close button stays reachable by keyboard.
  useFocusTrap(headerRef, menuOpen, closeMenu)
  useScrollLock(menuOpen)

  useEffect(() => setMenuOpen(false), [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // A small pulse on the count confirms an add without moving the controls the
  // customer is using. Web Animations is enough here; GSAP stays out of the shell.
  useEffect(() => {
    const onBump = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      countRef.current?.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
        { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' },
      )
    }
    window.addEventListener(BASKET_BUMP_EVENT, onBump)
    return () => window.removeEventListener(BASKET_BUMP_EVENT, onBump)
  }, [])

  const count = priced.itemCount
  const branchName = getBranch(branch)?.name

  return (
    <header ref={headerRef} className={`site-header ${scrolled ? 'site-header--scrolled' : ''} ${menuOpen ? 'site-header--menu' : ''}`} data-anim="header">
      <div className="site-header__inner container">
        <Link to="/" className="site-header__logo" aria-label="TMT Supermarket concept, home">
          <Logo />
        </Link>

        <nav className="site-nav" aria-label="Main">
          <ul>
            {NAV_LINKS.map(link => (
              <li key={link.to}><NavLink to={link.to}>{link.label}</NavLink></li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Link to="/branches" className="branch-chip" aria-label={branchName ? `Preferred branch: ${branchName}. Change branch` : 'Choose a branch'}>
            <Icon name="pin" size={16} />
            <span>{branchName ?? 'Choose branch'}</span>
          </Link>
          <button type="button" className="basket-button" onClick={openDrawer} aria-label={`Basket, ${count} ${count === 1 ? 'item' : 'items'}`}>
            <Icon name="basket" size={22} />
            <span className="basket-button__label" aria-hidden="true">Basket</span>
            <span className={`basket-button__count ${count ? '' : 'is-empty'}`} ref={countRef} aria-hidden="true">{count}</span>
          </button>
          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(open => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} hidden={!menuOpen}>
        <nav aria-label="Mobile">
          <ul>
            <li><NavLink to="/" end data-autofocus>Home</NavLink></li>
            {NAV_LINKS.map(link => (
              <li key={link.to}><NavLink to={link.to}>{link.label}</NavLink></li>
            ))}
            <li><NavLink to="/cart">Basket ({count})</NavLink></li>
          </ul>
        </nav>
        <Link to="/branches" className="mobile-menu__branch">
          <Icon name="pin" size={18} /> {branchName ? `Shopping from ${branchName}` : 'Choose your branch'}
        </Link>
        <p className="mobile-menu__note">Independent concept. Demo prices; no real orders.</p>
      </div>
    </header>
  )
}
