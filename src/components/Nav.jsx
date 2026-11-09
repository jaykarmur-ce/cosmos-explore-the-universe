import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Sparkles, Feather } from 'lucide-react';

import Logo from './Logo.jsx';
import { NAV_ITEMS, preloadPath } from '../routes.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

function EffectsToggle({ withLabel = false }) {
  const { reducedEffects, toggleEffects } = usePreferences();
  const Icon = reducedEffects ? Feather : Sparkles;
  const label = reducedEffects ? 'Reduced effects on' : 'Full effects on';
  return (
    <button
      type="button"
      className={withLabel ? 'btn btn--sm' : 'icon-btn icon-btn--sm'}
      onClick={toggleEffects}
      aria-pressed={reducedEffects}
      aria-label={withLabel ? undefined : `${label}. Toggle reduced effects mode`}
      title="Toggle reduced effects (fewer animations, lighter 3D)"
    >
      <Icon aria-hidden="true" />
      {withLabel && <span>{reducedEffects ? 'Reduced effects' : 'Full effects'}</span>}
    </button>
  );
}

export default function Nav({ immersive = false }) {
  const { count } = useFavorites();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef(null);
  const sheetRef = useRef(null);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape to close, focus management and scroll lock for the mobile sheet.
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => sheetRef.current?.querySelectorAll('a, button') ?? [];
    focusables()[0]?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
      if (e.key === 'Tab') {
        const items = Array.from(focusables());
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const navClass = ['nav', scrolled && !immersive ? 'nav--solid' : '', immersive ? 'nav--immersive' : '']
    .filter(Boolean)
    .join(' ');

  const renderLink = (item, variant) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) => `${variant}${isActive ? ' is-active' : ''}`}
      onMouseEnter={() => preloadPath(item.to)}
      onFocus={() => preloadPath(item.to)}
    >
      <span>{item.label}</span>
      {item.favorites && count > 0 && (
        <span className="nav__badge" aria-label={`${count} saved`}>
          {count}
        </span>
      )}
    </NavLink>
  );

  return (
    <header className={navClass}>
      <div className="nav__inner">
        <Link to="/" className="nav__brand" aria-label="COSMOS home">
          <Logo />
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {NAV_ITEMS.map((item) => renderLink(item, 'nav__link'))}
        </nav>

        <div className="nav__actions">
          <EffectsToggle />
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-btn nav__menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.nav
              ref={sheetRef}
              className="mobile-menu__sheet"
              aria-label="Mobile"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <ol className="mobile-menu__list" role="list">
                {NAV_ITEMS.map((item, i) => (
                  <li key={item.to}>
                    <span className="mobile-menu__index mono" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {renderLink(item, 'mobile-menu__link')}
                  </li>
                ))}
              </ol>
              <div className="mobile-menu__footer">
                <EffectsToggle withLabel />
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
