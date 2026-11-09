import { memo } from 'react';
import PlanetThumb from '../PlanetThumb.jsx';
import { BODIES } from '../../data/planets.js';
import { formatAU } from '../../utils/format.js';

/**
 * Planet selection list: vertical rail on desktop, scrolling chips on mobile.
 * Hovering an item highlights the body in 3D (and vice versa) and spins its
 * thumbnail.
 */
function PlanetRail({ selectedId, hoveredId, onSelect, onHover, surfaces }) {
  return (
    <nav className="planet-rail" aria-label="Select a body">
      <p className="label planet-rail__title">Bodies · {BODIES.length}</p>
      <ul role="list" className="planet-rail__list">
        {BODIES.map((body, index) => {
          const hovered = hoveredId === body.id;
          return (
            <li key={body.id}>
              <button
                type="button"
                className={`planet-rail__item${selectedId === body.id ? ' is-active' : ''}${hovered ? ' is-hovered' : ''}`}
                aria-pressed={selectedId === body.id}
                onClick={() => onSelect(body.id)}
                onPointerEnter={(e) => e.pointerType !== 'touch' && onHover?.(body.id, true)}
                onPointerLeave={() => onHover?.(body.id, false)}
                style={{ '--item-accent': body.accent }}
                title={`${body.name} — press ${index} to select`}
              >
                <PlanetThumb id={body.id} size={30} surface={surfaces?.[body.id]} spinning={hovered} />
                <span className="planet-rail__text">
                  <span className="planet-rail__name">{body.name}</span>
                  <span className="planet-rail__meta mono">
                    {body.type === 'star' ? 'Star · 0 AU' : formatAU(body.stats.distanceMkm)}
                  </span>
                </span>
                <kbd className="planet-rail__key" aria-hidden="true">
                  {index}
                </kbd>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default memo(PlanetRail);
