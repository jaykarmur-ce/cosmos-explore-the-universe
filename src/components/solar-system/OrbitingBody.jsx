import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import PlanetBody from '../three/PlanetBody.jsx';
import SunBody from '../three/SunBody.jsx';
import SelectionMarker from './SelectionMarker.jsx';
import { LAYOUT, MOON_LAYOUT, getBodyPosition, getMoonOffset } from './layout.js';
import { MOON } from '../../data/planets.js';
import { formatAU, formatTemperature, formatNumber } from '../../utils/format.js';

const ORIGIN = [0, 0, 0];
const MOON_BODY = { id: 'moon', name: MOON.name, accent: '#b9b4ab', stats: { rotationHours: 655.7 }, visual: { tiltDeg: 6.7 } };

function Moon({ clock, surface, pausedRef }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) getMoonOffset(clock.days, ref.current.position);
  }, -2);
  return (
    <group ref={ref}>
      <PlanetBody body={MOON_BODY} radius={MOON_LAYOUT.radius} surface={surface} segments={32} pausedRef={pausedRef} />
    </group>
  );
}

/** Rich hover card shown above a body in the scene. */
function HoverCard({ body, selected, onHover, onSelect }) {
  const s = body.stats;
  const moons = s.moons ? `${formatNumber(s.moons.count)} moon${s.moons.count === 1 ? '' : 's'}` : '8 planets';
  return (
    <div
      className="scene-tooltip"
      style={{ '--label-accent': body.accent }}
      onPointerEnter={() => onHover(body.id, true)}
      onPointerLeave={() => onHover(body.id, false)}
      onClick={() => onSelect(body.id)}
      aria-hidden="true"
    >
      <span className="scene-tooltip__name">{body.name}</span>
      <span className="scene-tooltip__meta">{body.category}</span>
      <span className="scene-tooltip__stats mono">
        {body.type === 'star' ? 'Centre' : formatAU(s.distanceMkm)} · {formatTemperature(s.meanTempC)} · {moons}
      </span>
      <span className="scene-tooltip__cta">{selected ? 'Selected · drag to orbit it' : 'Click to fly here'}</span>
    </div>
  );
}

/**
 * One body in the explorer: positions itself from the shared clock every
 * frame, renders its label, hit area, hover card and selection reticle.
 */
function OrbitingBody({
  body,
  surface,
  cloudSurface,
  moonSurface,
  clock,
  pausedRef,
  selected,
  hovered,
  showLabel,
  onSelect,
  onHover,
  reduced,
}) {
  const groupRef = useRef();
  const scaleRef = useRef();
  const { radius } = LAYOUT[body.id];
  const isSun = body.id === 'sun';
  const hitRadius = isSun ? radius * 1.05 : Math.max(radius * 1.8, 1.3);

  useFrame((_, delta) => {
    if (groupRef.current) getBodyPosition(body.id, clock.days, groupRef.current.position);
    // Swell slightly while hovered.
    if (scaleRef.current) {
      const target = hovered && !isSun ? 1.18 : hovered ? 1.04 : 1;
      const s = scaleRef.current.scale.x;
      const next = reduced ? target : s + (target - s) * (1 - Math.exp(-Math.min(delta, 0.1) * 10));
      scaleRef.current.scale.setScalar(next);
    }
  }, -2);

  const handlers = {
    onClick: (e) => {
      e.stopPropagation();
      // Ignore clicks that were really camera drags.
      if (e.delta > 6) return;
      onSelect(body.id);
    },
    onPointerOver: (e) => {
      e.stopPropagation();
      onHover(body.id, true);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      onHover(body.id, false);
      document.body.style.cursor = '';
    },
  };

  const labelY = isSun ? radius * 1.25 : radius * 1.2 + 0.6;

  return (
    <group ref={groupRef}>
      <group ref={scaleRef}>
        {isSun ? (
          <SunBody radius={radius} surface={surface} pausedRef={pausedRef} />
        ) : (
          <PlanetBody
            body={body}
            radius={radius}
            surface={surface}
            cloudSurface={cloudSurface}
            segments={reduced ? 40 : 64}
            lightPosition={ORIGIN}
            pausedRef={pausedRef}
            showAtmosphere={!reduced || body.id === 'earth'}
          />
        )}
      </group>

      {/* Generous invisible hit area so small planets are easy to pick. */}
      <mesh {...handlers}>
        <sphereGeometry args={[hitRadius, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      {body.id === 'earth' && <Moon clock={clock} surface={moonSurface} pausedRef={pausedRef} />}

      {(selected || hovered) && (
        <SelectionMarker
          radius={body.visual?.rings ? radius * body.visual.rings.outer * 0.72 : isSun ? radius * 0.8 : radius}
          color={body.accent}
          animate={!reduced}
          faint={!selected}
        />
      )}

      {hovered ? (
        <Html position={[0, labelY, 0]} center zIndexRange={[14, 0]} wrapperClass="scene-label-wrap">
          <HoverCard body={body} selected={selected} onHover={onHover} onSelect={onSelect} />
        </Html>
      ) : (
        showLabel && (
          <Html position={[0, labelY, 0]} center zIndexRange={[12, 0]} wrapperClass="scene-label-wrap">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className={`scene-label${selected ? ' is-selected' : ''}`}
              style={{ '--label-accent': body.accent }}
              onClick={() => onSelect(body.id)}
              onPointerEnter={() => onHover(body.id, true)}
              onPointerLeave={() => onHover(body.id, false)}
            >
              {body.name}
            </button>
          </Html>
        )
      )}
    </group>
  );
}

export default memo(OrbitingBody);
