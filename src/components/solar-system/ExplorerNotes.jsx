import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, X, MousePointer2, Hand } from 'lucide-react';
import { SCALE_NOTES } from './layout.js';
import { SUN, getBody } from '../../data/planets.js';
import { formatNumber } from '../../utils/format.js';

// Derived from the dataset rather than hard-coded.
const TRUE_SCALE_NEPTUNE = formatNumber(
  Math.round((getBody('neptune').stats.distanceMkm * 1e6) / SUN.stats.diameterKm / 100) * 100,
);
const TRUE_SCALE_EARTH = formatNumber(SUN.stats.diameterKm / getBody('earth').stats.diameterKm);

const SHORTCUTS = [
  ['0–8', 'Select the Sun or a planet'],
  ['Space', 'Pause / resume'],
  ['R', 'Reset camera'],
  ['O', 'Toggle orbital paths'],
  ['L', 'Toggle labels'],
  ['Esc', 'Close the information panel'],
  ['?', 'Show or hide this help'],
];

/** Controls + keyboard reference. */
export function ExplorerHelp({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="explorer-help"
          className="explorer-help panel"
          role="dialog"
          aria-label="Explorer controls"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
        >
          <div className="panel__title">
            <p className="eyebrow">Navigation</p>
            <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Close help">
              <X aria-hidden="true" />
            </button>
          </div>
          <ul role="list" className="explorer-help__list">
            <li>
              <MousePointer2 aria-hidden="true" /> Drag to orbit · scroll to zoom · right-drag or Shift-drag to pan
            </li>
            <li>
              <Hand aria-hidden="true" /> Touch: one finger to orbit · pinch to zoom · two fingers to pan
            </li>
          </ul>
          <dl className="explorer-help__keys">
            {SHORTCUTS.map(([key, desc]) => (
              <div key={key}>
                <dt>
                  <kbd>{key}</kbd>
                </dt>
                <dd>{desc}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** "Not to scale" disclosure with the exact compression rules. */
export function ScaleNote() {
  const [open, setOpen] = useState(false);
  return (
    <div className="scale-note">
      <button
        type="button"
        className="chip scale-note__chip"
        aria-expanded={open}
        aria-controls="scale-note-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <Info aria-hidden="true" width={14} height={14} />
        Compressed scale · not to scale
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="scale-note-panel"
            className="scale-note__panel panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            <p className="eyebrow">How this model is scaled</p>
            <ul role="list">
              <li>{SCALE_NOTES.sizes}</li>
              <li>{SCALE_NOTES.distances}</li>
              <li>{SCALE_NOTES.angles}</li>
              <li>Axial rotation is slowed for visibility; orbital motion follows the selected time scale.</li>
              <li>
                At true scale, Neptune would orbit about {TRUE_SCALE_NEPTUNE} Sun-widths from the Sun, and Earth would be a
                speck {TRUE_SCALE_EARTH}× smaller than the Sun.
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** First-visit gesture hint. */
export function ExplorerHint({ onDismiss }) {
  return (
    <motion.div
      className="explorer-hint"
      role="note"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
      exit={{ opacity: 0 }}
    >
      <MousePointer2 aria-hidden="true" />
      <span>Drag to orbit · scroll or pinch to zoom · select a planet to fly to it</span>
      <button type="button" className="btn btn--sm btn--ghost" onClick={onDismiss}>
        Got it
      </button>
    </motion.div>
  );
}
