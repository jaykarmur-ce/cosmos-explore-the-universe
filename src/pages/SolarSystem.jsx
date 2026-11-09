import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import SolarSystemScene from '../components/solar-system/SolarSystemScene.jsx';
import SolarSystemFallback from '../components/solar-system/SolarSystemFallback.jsx';
import PlanetRail from '../components/solar-system/PlanetRail.jsx';
import ControlDock from '../components/solar-system/ControlDock.jsx';
import InfoPanel from '../components/solar-system/InfoPanel.jsx';
import SimReadout from '../components/solar-system/SimReadout.jsx';
import { ExplorerHelp, ExplorerHint, ScaleNote } from '../components/solar-system/ExplorerNotes.jsx';
import { createSimClock } from '../components/solar-system/simClock.js';
import { BODY_IDS } from '../components/solar-system/layout.js';
import SceneLoader from '../components/SceneLoader.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

import { getBody } from '../data/planets.js';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { useSurfaceSet } from '../lib/textures/surfaceService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { hasWebGL, isTypingTarget } from '../utils/helpers.js';
import '../components/solar-system/explorer.css';

// Earth and the Sun first so the most-viewed bodies finish earliest.
const SURFACE_IDS = ['sun', 'earth', 'earth-clouds', 'moon', 'mars', 'jupiter', 'saturn', 'venus', 'mercury', 'uranus', 'neptune'];

export default function SolarSystem() {
  useDocumentTitle('Solar System Explorer');
  const [params, setParams] = useSearchParams();
  const initialFocus = getBody(params.get('focus')) ? params.get('focus') : null;

  const { prefs, setPreference, reducedEffects } = usePreferences();
  const { markBodyVisited } = useProgress();

  const [selectedId, setSelectedId] = useState(initialFocus);
  const [focusToken, setFocusToken] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const [paused, setPaused] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sceneError, setSceneError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const hoverTimer = useRef(0);
  const webgl = useMemo(() => hasWebGL(), []);
  const clock = useMemo(() => createSimClock({ daysPerSecond: prefs.timeScale }), []); // eslint-disable-line react-hooks/exhaustive-deps

  const surfaceSize = reducedEffects ? 512 : 1024;
  const surfaceSet = useSurfaceSet(SURFACE_IDS, surfaceSize);
  const use3D = webgl && !sceneError;

  // ── actions ────────────────────────────────────────────────────
  const select = useCallback(
    (id) => {
      if (!getBody(id)) return;
      setSelectedId(id);
      setFocusToken((t) => t + 1);
      setParams({ focus: id }, { replace: true });
      markBodyVisited(id);
    },
    [setParams, markBodyVisited],
  );

  const closePanel = useCallback(() => {
    setSelectedId(null);
    setParams({}, { replace: true });
  }, [setParams]);

  const resetView = useCallback(() => {
    setSelectedId(null);
    setResetToken((t) => t + 1);
    setParams({}, { replace: true });
  }, [setParams]);

  // Shared hover state between the 3D scene and the planet list. Leaving is
  // slightly delayed so moving from a planet onto its hover card doesn't flicker.
  const handleHover = useCallback((id, over) => {
    clearTimeout(hoverTimer.current);
    if (over) setHoveredId(id);
    else hoverTimer.current = setTimeout(() => setHoveredId((cur) => (cur === id ? null : cur)), 110);
  }, []);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const togglePause = useCallback(() => setPaused((p) => !p), []);
  const jumpToNow = useCallback(() => clock.resetToNow(), [clock]);

  useEffect(() => {
    if (initialFocus) markBodyVisited(initialFocus);
    // The explorer is a fixed, full-viewport experience: no page scrolling.
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => {
      root.style.overflow = previousOverflow;
      document.body.style.cursor = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── keyboard shortcuts ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();
      if (/^[0-8]$/.test(key)) {
        select(BODY_IDS[Number(key)]);
      } else if (key === ' ' && use3D) {
        if (e.target.closest?.('button, a')) return; // let focused buttons handle Space
        e.preventDefault();
        togglePause();
      } else if (key === 'r' && use3D) {
        resetView();
      } else if (key === 'o') {
        setPreference('showOrbits', !prefs.showOrbits);
      } else if (key === 'l') {
        setPreference('showLabels', !prefs.showLabels);
      } else if (key === 'escape') {
        if (helpOpen) setHelpOpen(false);
        else if (selectedId) closePanel();
      } else if (key === '?' || (key === '/' && e.shiftKey)) {
        setHelpOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [select, togglePause, resetView, closePanel, setPreference, prefs.showOrbits, prefs.showLabels, helpOpen, selectedId, use3D]);

  const selectedBody = selectedId ? getBody(selectedId) : null;

  return (
    <div className="explorer" data-panel-open={selectedBody ? 'true' : 'false'}>
      <h1 className="visually-hidden">Solar System Explorer</h1>

      <div className="explorer__stage">
        {use3D ? (
          <ErrorBoundary
            onError={(err) => setSceneError(err)}
            fallback={null}
          >
            <SolarSystemScene
              surfaces={surfaceSet.surfaces}
              clock={clock}
              paused={paused}
              timeScale={prefs.timeScale}
              selectedId={selectedId}
              hoveredId={hoveredId}
              focusToken={focusToken}
              resetToken={resetToken}
              showOrbits={prefs.showOrbits}
              showLabels={prefs.showLabels}
              onSelect={select}
              onHover={handleHover}
              reduced={reducedEffects}
            />
          </ErrorBoundary>
        ) : (
          <SolarSystemFallback
            selectedId={selectedId}
            onSelect={select}
            showOrbits={prefs.showOrbits}
            showLabels={prefs.showLabels}
            reason={sceneError ? 'The 3D scene could not start on this device, so a 2D orbital map is shown instead.' : undefined}
          />
        )}
        {use3D && <SceneLoader {...surfaceSet} />}
      </div>

      <div className="explorer__hud">
        <p className="eyebrow">Interactive model</p>
        <p className="explorer__title">Solar System</p>
        {use3D && <SimReadout clock={clock} paused={paused} />}
      </div>

      <PlanetRail
        selectedId={selectedId}
        hoveredId={hoveredId}
        onSelect={select}
        onHover={handleHover}
        surfaces={surfaceSet.surfaces}
      />

      <ScaleNote />

      <div className="explorer__bottom">
        <ControlDock
          paused={paused}
          onTogglePause={togglePause}
          timeScale={prefs.timeScale}
          onTimeScale={(v) => setPreference('timeScale', v)}
          onNow={jumpToNow}
          showOrbits={prefs.showOrbits}
          onToggleOrbits={() => setPreference('showOrbits', !prefs.showOrbits)}
          showLabels={prefs.showLabels}
          onToggleLabels={() => setPreference('showLabels', !prefs.showLabels)}
          onReset={resetView}
          helpOpen={helpOpen}
          onToggleHelp={() => setHelpOpen((v) => !v)}
          simulationControls={use3D}
        />
      </div>

      <ExplorerHelp open={helpOpen} onClose={() => setHelpOpen(false)} />

      <AnimatePresence>
        {!prefs.explorerHintDismissed && surfaceSet.done && !selectedId && (
          <ExplorerHint onDismiss={() => setPreference('explorerHintDismissed', true)} />
        )}
      </AnimatePresence>

      <InfoPanel body={selectedBody} onClose={closePanel} />
    </div>
  );
}
