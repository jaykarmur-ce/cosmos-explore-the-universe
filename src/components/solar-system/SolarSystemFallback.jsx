import { useMemo } from 'react';
import { MonitorX } from 'lucide-react';
import PlanetThumb from '../PlanetThumb.jsx';
import { BODIES } from '../../data/planets.js';
import { LAYOUT } from './layout.js';
import { meanLongitudeRad, daysSinceJ2000 } from '../../utils/astro.js';

const VIEW = 260; // SVG half-size in scene units (Neptune orbit ≈ 113)

/**
 * 2D fallback when WebGL is unavailable: a top-down orbital map with
 * planets at today's mean longitudes. Selection still opens the info panel.
 */
export default function SolarSystemFallback({ selectedId, onSelect, showOrbits, showLabels, reason }) {
  const days = useMemo(() => daysSinceJ2000(Date.now()), []);
  const scale = VIEW / 125;

  return (
    <div className="explorer-fallback">
      <p className="explorer-fallback__notice" role="status">
        <MonitorX aria-hidden="true" />
        {reason ?? '3D rendering is unavailable on this device, so a 2D orbital map is shown instead.'}
      </p>
      <div className="explorer-fallback__map">
        <svg viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`} aria-hidden="true">
          {showOrbits &&
            BODIES.filter((b) => b.type === 'planet').map((b) => (
              <circle
                key={b.id}
                r={LAYOUT[b.id].orbit * scale}
                fill="none"
                stroke={b.id === selectedId ? b.accent : '#252d43'}
                strokeWidth={b.id === selectedId ? 1.5 : 1}
              />
            ))}
        </svg>
        {BODIES.map((b) => {
          const angle = meanLongitudeRad(b, days);
          const r = LAYOUT[b.id].orbit * scale;
          const x = b.id === 'sun' ? 0 : r * Math.cos(angle);
          const y = b.id === 'sun' ? 0 : -r * Math.sin(angle);
          const size = b.id === 'sun' ? 54 : Math.max(16, LAYOUT[b.id].radius * 14);
          return (
            <button
              key={b.id}
              type="button"
              className={`explorer-fallback__body${selectedId === b.id ? ' is-active' : ''}`}
              style={{ left: `${50 + (x / (VIEW * 2)) * 100}%`, top: `${50 + (y / (VIEW * 2)) * 100}%`, '--item-accent': b.accent }}
              onClick={() => onSelect(b.id)}
              aria-pressed={selectedId === b.id}
              aria-label={`Select ${b.name}`}
            >
              <PlanetThumb id={b.id} size={size} />
              {showLabels && <span className="scene-label">{b.name}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
