import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowUpRight, Scale } from 'lucide-react';
import FavoriteButton from '../FavoriteButton.jsx';
import { quickStatItems } from '../../utils/bodyStats.js';

/** Slide-in scientific summary for the selected body. */
export default function InfoPanel({ body, onClose }) {
  const headingRef = useRef(null);

  // Move focus to the panel heading when a new body is opened via keyboard.
  useEffect(() => {
    if (body && document.activeElement?.closest?.('.planet-rail')) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [body]);

  const compareTarget = body?.id === 'earth' ? 'mars' : 'earth';

  return (
    <AnimatePresence mode="wait">
      {body && (
        <motion.aside
          key={body.id}
          className="info-panel panel"
          aria-labelledby="info-panel-title"
          style={{ '--panel-accent': body.accent }}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, x: 16, transition: { duration: 0.18 } }}
        >
          <div className="info-panel__head">
            <div>
              <p className="eyebrow" style={{ color: body.accent }}>
                {body.category}
              </p>
              <h2 id="info-panel-title" className="h2 info-panel__title" tabIndex={-1} ref={headingRef}>
                {body.name}
              </h2>
              <p className="info-panel__tagline">{body.tagline}</p>
            </div>
            <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Close information panel (Esc)">
              <X aria-hidden="true" />
            </button>
          </div>

          <div className="info-panel__body">
            <p className="info-panel__summary">{body.summary}</p>

            <dl className="info-panel__stats">
              {quickStatItems(body).map((item) => (
                <div key={item.key} className="info-panel__stat">
                  <dt className="label">{item.label}</dt>
                  <dd>
                    <span className="info-panel__value">{item.value}</span>
                    {item.unit && <span className="stat__unit">{item.unit}</span>}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="info-panel__source dim">
              Data: NASA fact sheets
              {body.stats.moons ? ` · moon count as of ${body.stats.moons.asOf}` : ''}
            </p>
          </div>

          <div className="info-panel__actions">
            <Link to={`/planets/${body.id}`} className="btn btn--primary">
              Open discovery page <ArrowUpRight aria-hidden="true" />
            </Link>
            <div className="info-panel__row">
              <FavoriteButton type="planet" id={body.id} name={body.name} size="sm" />
              {body.type === 'planet' && (
                <Link to={`/compare?a=${body.id}&b=${compareTarget}`} className="btn btn--sm">
                  <Scale aria-hidden="true" /> Compare
                </Link>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
