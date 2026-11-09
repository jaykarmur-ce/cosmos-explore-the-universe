import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Telescope } from 'lucide-react';

import DiscoveryCard from '../components/DiscoveryCard.jsx';
import { DISCOVERIES, DISCOVERY_CATEGORIES, getCategory } from '../data/discoveries.js';
import { matchesQuery } from '../utils/helpers.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './Discoveries.css';

import { LAST_DISCOVERY_SEARCH_KEY as LAST_SEARCH_KEY } from '../utils/storageKeys.js';

function searchFields(d) {
  const cat = getCategory(d.category);
  return [d.name, d.designation, d.summary, d.tags, cat?.label, cat?.singular];
}

export default function Discoveries() {
  useDocumentTitle('Beyond Our Solar System');
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const categoryParam = params.get('cat');
  const category = getCategory(categoryParam) ? categoryParam : 'all';
  const [draft, setDraft] = useState(query);

  // Keep the input in sync when the URL changes (back/forward navigation).
  useEffect(() => setDraft(query), [query]);

  // Remember the current filters so "Back to collection" can restore them.
  useEffect(() => {
    try {
      sessionStorage.setItem(LAST_SEARCH_KEY, params.toString() ? `?${params.toString()}` : '');
    } catch {
      /* storage unavailable */
    }
  }, [params]);

  const updateParams = (next) => {
    const merged = { q: query, cat: category, ...next };
    const clean = {};
    if (merged.q) clean.q = merged.q;
    if (merged.cat && merged.cat !== 'all') clean.cat = merged.cat;
    setParams(clean, { replace: true });
  };

  const queryMatches = useMemo(() => DISCOVERIES.filter((d) => matchesQuery(query, searchFields(d))), [query]);
  const results = useMemo(
    () => queryMatches.filter((d) => category === 'all' || d.category === category),
    [queryMatches, category],
  );
  const counts = useMemo(() => {
    const map = { all: queryMatches.length };
    DISCOVERY_CATEGORIES.forEach((c) => {
      map[c.id] = queryMatches.filter((d) => d.category === c.id).length;
    });
    return map;
  }, [queryMatches]);

  const activeCategory = getCategory(category);
  const hasFilters = Boolean(query) || category !== 'all';

  return (
    <div className="page container discoveries-page">
      <header className="page-header discoveries-header">
        <p className="eyebrow">Deep space collection</p>
        <h1 className="h1">Beyond Our Solar System</h1>
        <p className="lede">
          From the black hole at the heart of our galaxy to worlds orbiting other suns — {DISCOVERIES.length} curated
          objects across {DISCOVERY_CATEGORIES.length} categories. Images are procedural illustrations, not photographs.
        </p>
      </header>

      <div className="discovery-controls">
        <form
          className="search discovery-controls__search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ q: draft.trim() });
          }}
        >
          <Search aria-hidden="true" />
          <label htmlFor="discovery-search" className="visually-hidden">
            Search discoveries
          </label>
          <input
            id="discovery-search"
            className="input"
            type="search"
            placeholder="Search by name, type or keyword — e.g. “pulsar”, “JWST”"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              updateParams({ q: e.target.value.trim() });
            }}
            autoComplete="off"
          />
          {draft && (
            <button
              type="button"
              className="icon-btn icon-btn--sm discovery-controls__clear"
              onClick={() => {
                setDraft('');
                updateParams({ q: '' });
              }}
              aria-label="Clear search"
            >
              <X aria-hidden="true" />
            </button>
          )}
        </form>

        <div className="discovery-controls__chips" role="group" aria-label="Filter by category">
          <button type="button" className="chip" aria-pressed={category === 'all'} onClick={() => updateParams({ cat: 'all' })}>
            All <span className="chip__count">{counts.all}</span>
          </button>
          {DISCOVERY_CATEGORIES.map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={category === c.id} onClick={() => updateParams({ cat: c.id })}>
              {c.label} <span className="chip__count">{counts[c.id]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="discovery-status">
        <p className="muted" role="status" aria-live="polite">
          {results.length === 1 ? '1 object' : `${results.length} objects`}
          {activeCategory ? ` in ${activeCategory.label}` : ''}
          {query ? ` matching “${query}”` : ''}
        </p>
        {hasFilters && (
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => setParams({}, { replace: true })}>
            <X aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>

      {activeCategory && <p className="discovery-blurb">{activeCategory.blurb}</p>}

      {results.length ? (
        <motion.ul role="list" className="discovery-grid" layout>
          <AnimatePresence mode="popLayout">
            {results.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
              >
                <DiscoveryCard item={item} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="empty">
          <div className="empty__icon">
            <Telescope aria-hidden="true" />
          </div>
          <h2 className="h3">Nothing in this patch of sky</h2>
          <p>
            No objects match {query ? `“${query}”` : 'this filter'}
            {activeCategory ? ` in ${activeCategory.label}` : ''}. Try a different keyword or browse all categories.
          </p>
          <div className="empty__actions">
            <button type="button" className="btn btn--primary" onClick={() => setParams({}, { replace: true })}>
              Show all discoveries
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
