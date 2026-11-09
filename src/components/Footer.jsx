import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import Logo from './Logo.jsx';
import { SOURCES } from '../data/sources.js';
import { usePreferences } from '../context/PreferencesContext.jsx';

const EXPLORE_LINKS = [
  { to: '/explore', label: 'Solar System Explorer' },
  { to: '/discoveries', label: 'Beyond Our Solar System' },
  { to: '/compare', label: 'Compare Planets' },
  { to: '/quiz', label: 'Space Quiz' },
];

const CONTROL_LINKS = [
  { to: '/mission-control', label: 'Mission Control' },
  { to: '/mission-control#timeline', label: 'Exploration Timeline' },
  { to: '/mission-control#directory', label: 'Object Directory' },
  { to: '/favorites', label: 'Your Collection' },
];

const REFERENCES = [
  SOURCES.nasaFactSheet,
  SOURCES.nasaScience,
  SOURCES.moonCounts,
  SOURCES.jplApproxPositions,
  SOURCES.exoplanetArchive,
  SOURCES.eht,
];

export default function Footer() {
  const { reducedEffects, toggleEffects } = usePreferences();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p className="muted">
            An interactive journey through the solar system and beyond. Built entirely in the browser with React,
            Three.js and React Three Fiber — no accounts, no tracking. Your favourites and progress stay in this
            browser’s local storage.
          </p>
          <button
            type="button"
            className="switch"
            role="switch"
            aria-checked={reducedEffects}
            onClick={toggleEffects}
          >
            <span className="switch__track" aria-hidden="true" />
            Reduced effects mode
          </button>
        </div>

        <nav aria-label="Explore" className="footer__col">
          <h2 className="label">Explore</h2>
          <ul role="list">
            {EXPLORE_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Mission" className="footer__col">
          <h2 className="label">Mission</h2>
          <ul role="list">
            {CONTROL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col footer__refs">
          <h2 className="label">Scientific references</h2>
          <ul role="list">
            {REFERENCES.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer noopener">
                  {s.label}
                  <ExternalLink aria-hidden="true" />
                  <span className="visually-hidden">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p className="dim">
          Planet visuals are procedurally generated illustrations; the 3D solar system uses compressed, clearly
          labelled scales. Moon counts are dated (Nov 2025) and change as new moons are confirmed.
        </p>
        <p className="dim mono">COSMOS · v1.0 · Frontend-only</p>
      </div>
    </footer>
  );
}
