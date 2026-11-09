import { AnimatePresence, motion } from 'framer-motion';
import { getBody } from '../data/planets.js';

const NAMES = { 'earth-clouds': 'Earth clouds', moon: 'Moon' };

/**
 * Overlay reporting real progress while surface maps are generated.
 * Disappears as soon as every requested map has loaded (or failed).
 */
export default function SceneLoader({ progress, loaded, total, pendingId, done, title = 'Preparing the solar system', compact = false }) {
  const pendingName = pendingId ? NAMES[pendingId] ?? getBody(pendingId)?.name ?? pendingId : null;
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className={`scene-loader${compact ? ' scene-loader--compact' : ''}`}
          role="status"
          aria-live="polite"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          <div className="scene-loader__inner">
            <span className="orbit-spinner" aria-hidden="true" />
            {!compact && <p className="scene-loader__title">{title}</p>}
            <div className="meter scene-loader__meter" aria-hidden="true">
              <div className="meter__fill" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p className="label">
              Generating surface maps · {loaded}/{total}
              {pendingName ? ` · ${pendingName}` : ''}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
