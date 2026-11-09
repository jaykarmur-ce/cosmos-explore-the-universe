import { memo, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { BODIES } from '../../data/planets.js';
import Starfield from '../three/Starfield.jsx';
import OrbitingBody from './OrbitingBody.jsx';
import OrbitPath from './OrbitPath.jsx';
import AsteroidBelt from './AsteroidBelt.jsx';
import CameraRig, { overviewPosition } from './CameraRig.jsx';
import { LAYOUT } from './layout.js';

/** Advances the shared simulation clock before anything reads it. */
function ClockDriver({ clock }) {
  useFrame((_, delta) => clock.advance(Math.min(delta, 0.1)), -3);
  return null;
}

/** Places the camera at the overview position once, sized to the viewport. */
function InitialCamera() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !size.width) return;
    overviewPosition(size.width / size.height, camera.position);
    camera.lookAt(0, 0, 0);
    done.current = true;
  }, [camera, size]);
  return null;
}

function SceneContents({
  surfaces,
  clock,
  pausedRef,
  selectedId,
  hoveredId,
  focusToken,
  resetToken,
  showOrbits,
  showLabels,
  onSelect,
  onHover,
  reduced,
}) {
  return (
    <>
      <ClockDriver clock={clock} />
      <InitialCamera />
      <ambientLight intensity={0.07} color="#9aa8ff" />
      <Starfield count={reduced ? 1800 : 3600} twinkle={!reduced} />

      {BODIES.filter((b) => b.type === 'planet').map((b) => {
        const active = b.id === selectedId || b.id === hoveredId;
        // A hovered planet's orbit lights up even when orbits are hidden.
        if (!showOrbits && !active) return null;
        return (
          <OrbitPath
            key={b.id}
            radius={LAYOUT[b.id].orbit}
            color={active ? b.accent : '#a5aec4'}
            opacity={b.id === selectedId ? 0.85 : b.id === hoveredId ? 0.6 : 0.2}
            lineWidth={active ? 1.6 : 1}
          />
        );
      })}

      <AsteroidBelt clock={clock} count={reduced ? 700 : 1600} />

      {BODIES.map((body) => (
        <OrbitingBody
          key={body.id}
          body={body}
          surface={surfaces[body.id]}
          cloudSurface={body.id === 'earth' ? surfaces['earth-clouds'] : undefined}
          moonSurface={body.id === 'earth' ? surfaces.moon : undefined}
          clock={clock}
          pausedRef={pausedRef}
          selected={body.id === selectedId}
          hovered={body.id === hoveredId}
          showLabel={showLabels}
          onSelect={onSelect}
          onHover={onHover}
          reduced={reduced}
        />
      ))}

      <CameraRig
        selectedId={selectedId}
        focusToken={focusToken}
        resetToken={resetToken}
        clock={clock}
        reduced={reduced}
        panelOpen={Boolean(selectedId)}
      />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.9}
        panSpeed={0.8}
        minDistance={2}
        maxDistance={620}
        maxPolarAngle={Math.PI * 0.94}
      />
    </>
  );
}

/**
 * The interactive 3D solar system. Memoised: it re-renders only when its
 * own props change, never for unrelated UI state such as favourites or the
 * info panel content.
 */
function SolarSystemScene({ paused, timeScale, clock, ...rest }) {
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
    clock.paused = paused;
  }, [paused, clock]);

  useEffect(() => {
    clock.daysPerSecond = timeScale;
  }, [timeScale, clock]);

  const dpr = useMemo(() => (rest.reduced ? [1, 1] : [1, 1.75]), [rest.reduced]);

  return (
    <Canvas
      className="explorer__canvas"
      dpr={dpr}
      camera={{ fov: 45, near: 0.1, far: 4000, position: [0, 90, 150] }}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      onPointerMissed={() => {
        document.body.style.cursor = '';
      }}
      aria-label="Interactive 3D model of the solar system. Use the planet list to select a body; drag to rotate, scroll or pinch to zoom."
      role="img"
    >
      <color attach="background" args={['#050713']} />
      <SceneContents clock={clock} pausedRef={pausedRef} {...rest} />
    </Canvas>
  );
}

export default memo(SolarSystemScene);
