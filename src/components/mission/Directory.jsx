import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpRight, Orbit } from 'lucide-react';
import PlanetThumb from '../PlanetThumb.jsx';
import { BODIES } from '../../data/planets.js';
import { DISCOVERIES, getCategory } from '../../data/discoveries.js';
import { matchesQuery } from '../../utils/helpers.js';
import { formatAU } from '../../utils/format.js';

const ENTRIES = [
  ...BODIES.map((b) => ({
    key: `planet:${b.id}`,
    id: b.id,
    group: b.type === 'star' ? 'star' : 'planet',
    name: b.name,
    kind: b.category,
    detail: b.type === 'star' ? 'Centre of the solar system' : `${formatAU(b.stats.distanceMkm)} from the Sun`,
    to: `/planets/${b.id}`,
    explore: `/explore?focus=${b.id}`,
    search: [b.name, b.category, b.tagline, b.summary],
  })),
  ...DISCOVERIES.map((d) => {
    const cat = getCategory(d.category);
    return {
      key: `discovery:${d.id}`,
      id: d.id,
      group: 'deep',
      name: d.name,
      kind: cat?.singular ?? 'Deep-space object',
      detail: d.stats.find((s) => s.label === 'Distance')?.value ?? d.designation,
      to: `/discoveries/${d.id}`,
      accent: '#9a83ff',
      search: [d.name, d.designation, d.summary, d.tags, cat?.label],
    };
  }),
];

const GROUPS = [
  { id: 'all', label: 'All objects' },
  { id: 'planet', label: 'Planets' },
  { id: 'star', label: 'The Sun' },
  { id: 'deep', label: 'Deep space' },
];

/** Searchable directory of every celestial object in COSMOS. */
export default function Directory({ autoFocus = false }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');

  const results = useMemo(
    () => ENTRIES.filter((e) => (group === 'all' || e.group === group) && matchesQuery(query, e.search)),
    [query, group],
  );

  return (
    <div className="directory">
      <div className="directory__controls">
        <div className="search">
          <Search aria-hidden="true" />
          <label className="visually-hidden" htmlFor="directory-search">
            Search the directory
          </label>
          <input
            id="directory-search"
            className="input"
            type="search"
            placeholder={`Search ${ENTRIES.length} objects — planets, black holes, nebulae…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={autoFocus}
            autoComplete="off"
          />
        </div>
        <div className="directory__groups" role="group" aria-label="Filter by type">
          {GROUPS.map((g) => (
            <button key={g.id} type="button" className="chip" aria-pressed={group === g.id} onClick={() => setGroup(g.id)}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <p className="label directory__count" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? 'result' : 'results'}
      </p>

      {results.length ? (
        <ul role="list" className="directory__list">
          {results.map((e) => (
            <li key={e.key} className="directory__row">
              <Link to={e.to} className="directory__link">
                {e.group === 'deep' ? (
                  <span className="directory__glyph" aria-hidden="true" />
                ) : (
                  <PlanetThumb id={e.id} size={34} />
                )}
                <span className="directory__text">
                  <span className="directory__name">{e.name}</span>
                  <span className="directory__kind">{e.kind}</span>
                </span>
                <span className="directory__detail mono">{e.detail}</span>
                <ArrowUpRight className="directory__arrow" aria-hidden="true" />
              </Link>
              {e.explore && (
                <Link to={e.explore} className="icon-btn icon-btn--sm directory__explore" aria-label={`Show ${e.name} in the 3D explorer`} title="Show in 3D explorer">
                  <Orbit aria-hidden="true" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <p>No objects match “{query}”. Try another name or keyword.</p>
          <button type="button" className="btn btn--sm" onClick={() => setQuery('')}>
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
