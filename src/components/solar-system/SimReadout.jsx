import { useEffect, useRef } from 'react';
import { formatDateUTC, formatNumber } from '../../utils/format.js';

/**
 * Simulated date readout. Polls the mutable clock a few times per second and
 * writes straight to the DOM so time passing never re-renders React.
 */
export default function SimReadout({ clock, paused }) {
  const dateRef = useRef(null);
  const elapsedRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = (t) => {
      if (t - last > 150) {
        last = t;
        if (dateRef.current) dateRef.current.textContent = formatDateUTC(clock.date);
        if (elapsedRef.current) {
          const e = clock.elapsedDays;
          elapsedRef.current.textContent = `T${e >= 0 ? '+' : '−'}${formatNumber(Math.abs(e), 1)} days`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clock]);

  return (
    <div className="sim-readout" aria-label="Simulated date">
      <span className="label">
        Sim date · UTC <span className={`sim-readout__status${paused ? ' is-paused' : ''}`}>{paused ? 'Paused' : 'Live'}</span>
      </span>
      <span ref={dateRef} className="sim-readout__date mono" />
      <span ref={elapsedRef} className="sim-readout__elapsed mono dim" />
    </div>
  );
}
