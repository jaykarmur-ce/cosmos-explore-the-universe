import { Pause, Play, Orbit, Tag, RotateCcw, CalendarClock, HelpCircle } from 'lucide-react';
import { TIME_SCALES } from '../../context/PreferencesContext.jsx';

/** Simulation and view controls for the explorer. */
export default function ControlDock({
  paused,
  onTogglePause,
  timeScale,
  onTimeScale,
  onNow,
  showOrbits,
  onToggleOrbits,
  showLabels,
  onToggleLabels,
  onReset,
  helpOpen,
  onToggleHelp,
  simulationControls = true,
}) {
  return (
    <div className="control-dock panel" role="toolbar" aria-label="Explorer controls">
      {simulationControls && (
        <>
          <button
            type="button"
            className="icon-btn control-dock__play"
            onClick={onTogglePause}
            aria-label={paused ? 'Resume animation (Space)' : 'Pause animation (Space)'}
            title={paused ? 'Resume (Space)' : 'Pause (Space)'}
          >
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </button>

          {/* Compact speed control for small screens: cycles through the scales. */}
          <button
            type="button"
            className="btn btn--sm control-dock__speed-cycle"
            onClick={() => {
              const i = TIME_SCALES.findIndex((t) => t.value === timeScale);
              onTimeScale(TIME_SCALES[(i + 1) % TIME_SCALES.length].value);
            }}
            aria-label={`Simulation speed ${timeScale} days per second. Tap to change.`}
          >
            {TIME_SCALES.find((t) => t.value === timeScale)?.label}
          </button>

          <div className="segmented" role="radiogroup" aria-label="Simulation speed in days per second">
            {TIME_SCALES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={timeScale === t.value}
                className="segmented__item"
                onClick={() => onTimeScale(t.value)}
                title={`${t.value} simulated days per second`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button type="button" className="icon-btn" onClick={onNow} aria-label="Jump to today’s date" title="Jump to today">
            <CalendarClock aria-hidden="true" />
          </button>
          <span className="control-dock__sep" aria-hidden="true" />
        </>
      )}

      <button
        type="button"
        className="icon-btn"
        aria-pressed={showOrbits}
        onClick={onToggleOrbits}
        aria-label="Show orbital paths (O)"
        title="Orbital paths (O)"
      >
        <Orbit aria-hidden="true" />
      </button>
      <button
        type="button"
        className="icon-btn"
        aria-pressed={showLabels}
        onClick={onToggleLabels}
        aria-label="Show planet labels (L)"
        title="Labels (L)"
      >
        <Tag aria-hidden="true" />
      </button>

      {simulationControls && (
        <button type="button" className="icon-btn" onClick={onReset} aria-label="Reset camera to overview (R)" title="Reset view (R)">
          <RotateCcw aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        className="icon-btn"
        aria-pressed={helpOpen}
        aria-expanded={helpOpen}
        aria-controls="explorer-help"
        onClick={onToggleHelp}
        aria-label="Controls and keyboard shortcuts (?)"
        title="Help (?)"
      >
        <HelpCircle aria-hidden="true" />
      </button>
    </div>
  );
}
