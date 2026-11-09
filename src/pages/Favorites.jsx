import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Trash2, Undo2, Orbit, Telescope, ArrowUpRight } from 'lucide-react';

import PlanetThumb from '../components/PlanetThumb.jsx';
import CosmicIllustration from '../components/CosmicIllustration.jsx';
import TiltCard from '../components/TiltCard.jsx';
import { getBody } from '../data/planets.js';
import { getCategory, getDiscovery } from '../data/discoveries.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './Favorites.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'planet', label: 'Solar system' },
  { id: 'discovery', label: 'Deep space' },
];

const SORTS = [
  { id: 'recent', label: 'Recently saved' },
  { id: 'name', label: 'Name (A–Z)' },
];

function resolve(fav) {
  if (fav.type === 'planet') {
    const body = getBody(fav.id);
    return body && { name: body.name, kind: body.category, to: `/planets/${body.id}`, accent: body.accent, body };
  }
  const item = getDiscovery(fav.id);
  return item && { name: item.name, kind: getCategory(item.category)?.singular, to: `/discoveries/${item.id}`, accent: '#9a83ff', item };
}

function FavoriteCard({ fav, onRemove, spin }) {
  const [hover, setHover] = useState(false);
  const info = resolve(fav);
  if (!info) return null;
  return (
    <TiltCard as="article" className="fav-card" style={{ '--fav-accent': info.accent }} onHoverChange={setHover} tilt={6}>
      <div className="fav-card__media">
        {fav.type === 'planet' ? (
          <PlanetThumb id={fav.id} size={120} spinning={spin && hover} />
        ) : (
          <CosmicIllustration art={info.item.art} width={480} height={300} />
        )}
      </div>
      <div className="fav-card__body">
        <p className="label">{info.kind}</p>
        <h2 className="fav-card__name">
          <Link to={info.to} className="fav-card__link">
            {info.name}
          </Link>
        </h2>
        <p className="fav-card__date dim mono">Saved {new Date(fav.addedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
      <div className="fav-card__actions">
        <span className="link-arrow fav-card__open" aria-hidden="true">
          Open <ArrowUpRight />
        </span>
        <button type="button" className="icon-btn icon-btn--sm fav-card__remove" onClick={() => onRemove(fav)} aria-label={`Remove ${info.name} from favorites`} title="Remove">
          <Trash2 aria-hidden="true" />
        </button>
      </div>
    </TiltCard>
  );
}

export default function Favorites() {
  useDocumentTitle('Favorites');
  const { favorites, removeFavorite, restoreFavorite, clearFavorites } = useFavorites();
  const { reducedEffects } = usePreferences();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [removed, setRemoved] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // The undo offer expires after a few seconds.
  useEffect(() => {
    if (!removed) return undefined;
    const id = setTimeout(() => setRemoved(null), 6000);
    return () => clearTimeout(id);
  }, [removed]);

  const counts = useMemo(
    () => ({
      all: favorites.length,
      planet: favorites.filter((f) => f.type === 'planet').length,
      discovery: favorites.filter((f) => f.type === 'discovery').length,
    }),
    [favorites],
  );

  const items = useMemo(() => {
    const list = favorites.filter((f) => filter === 'all' || f.type === filter);
    return [...list].sort((a, b) =>
      sort === 'name' ? (resolve(a)?.name ?? '').localeCompare(resolve(b)?.name ?? '') : b.addedAt - a.addedAt,
    );
  }, [favorites, filter, sort]);

  const remove = (fav) => {
    removeFavorite(fav.type, fav.id);
    setRemoved(fav);
  };

  return (
    <div className="page container favorites-page">
      <header className="page-header">
        <p className="eyebrow">
          <Heart aria-hidden="true" className="inline-icon" /> Personal collection
        </p>
        <h1 className="h1">Your discoveries</h1>
        <p className="lede">
          Planets and deep-space objects you’ve saved. Your collection is stored in this browser — no account needed —
          and stays after you reload or come back later.
        </p>
      </header>

      {favorites.length > 0 && (
        <div className="fav-toolbar">
          <div className="fav-toolbar__filters" role="group" aria-label="Filter favorites">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label} <span className="chip__count">{counts[f.id]}</span>
              </button>
            ))}
          </div>
          <div className="fav-toolbar__right">
            <label className="visually-hidden" htmlFor="fav-sort">
              Sort favorites
            </label>
            <select id="fav-sort" className="select fav-toolbar__sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            {confirmClear ? (
              <span className="fav-toolbar__confirm">
                <span className="muted">Remove all {favorites.length}?</span>
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  onClick={() => {
                    clearFavorites();
                    setConfirmClear(false);
                    setRemoved(null);
                  }}
                >
                  Yes, clear
                </button>
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => setConfirmClear(false)}>
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => setConfirmClear(true)}>
                <Trash2 aria-hidden="true" /> Clear all
              </button>
            )}
          </div>
        </div>
      )}

      <div aria-live="polite">
        <AnimatePresence>
          {removed && (
            <motion.div className="fav-undo panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <span>Removed {resolve(removed)?.name} from your collection.</span>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => {
                  restoreFavorite(removed);
                  setRemoved(null);
                }}
              >
                <Undo2 aria-hidden="true" /> Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {favorites.length === 0 ? (
        <div className="empty">
          <div className="empty__icon">
            <Heart aria-hidden="true" />
          </div>
          <h2 className="h3">Your collection is empty</h2>
          <p>
            Tap the heart on any planet or deep-space object to save it here. Try starting with your favourite planet in
            the 3D explorer.
          </p>
          <div className="empty__actions">
            <Link to="/explore" className="btn btn--primary">
              <Orbit aria-hidden="true" /> Explore the solar system
            </Link>
            <Link to="/discoveries" className="btn">
              <Telescope aria-hidden="true" /> Browse discoveries
            </Link>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <p>No saved items in this category yet.</p>
          <button type="button" className="btn btn--sm" onClick={() => setFilter('all')}>
            Show all
          </button>
        </div>
      ) : (
        <motion.ul role="list" className="fav-grid" layout>
          <AnimatePresence mode="popLayout">
            {items.map((fav) => (
              <motion.li
                key={`${fav.type}:${fav.id}`}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
              >
                <FavoriteCard fav={fav} onRemove={remove} spin={!reducedEffects} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
