import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import PlanetBody from './PlanetBody.jsx';
import Starfield from './Starfield.jsx';
import { EARTH, MOON } from '../../data/planets.js';

const LIGHT_DIR = new THREE.Vector3(-0.86, 0.32, 0.3).normalize();
const LIGHT_POS = LIGHT_DIR.clone().multiplyScalar(1000).toArray();
const MOON_BODY = { id: 'moon', name: 'Moon', accent: '#b9b4ab', stats: { rotationHours: 655.7 }, visual: { tiltDeg: 6.7 } };

/** Places Earth for the viewport: right-hand side on wide screens, low and centred on narrow ones. */
function useHeroLayout() {
  const viewport = useThree((s) => s.viewport);
  const size = useThree((s) => s.size);
  return useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    if (aspect > 1.05) {
      const radius = Math.min(viewport.height * 0.34, viewport.width * 0.19);
      return { radius, position: [viewport.width * 0.245, -viewport.height * 0.02, 0] };
    }
    const radius = Math.min(viewport.width * 0.46, viewport.height * 0.28);
    return { radius, position: [viewport.width * 0.08, -viewport.height * 0.36, 0] };
  }, [viewport.width, viewport.height, size.width, size.height]);
}

/**
 * Earth + Moon. The globe leans toward the cursor and spins a little faster
 * while the pointer is over it, so the hero responds to mouse movement.
 */
function EarthSystem({ surfaces, reduced, ready, pointer }) {
  const groupRef = useRef();
  const leanRef = useRef();
  const spinRef = useRef();
  const moonRef = useRef();
  const intro = useRef(0);
  const hover = useRef(0);
  const { radius, position } = useHeroLayout();
  const camera = useThree((s) => s.camera);
  const viewportHeight = useThree((s) => s.viewport.height);
  const projected = useRef(new THREE.Vector3());

  useFrame(({ clock }, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const dt = Math.min(delta, 0.1);
    if (ready && intro.current < 1) intro.current = Math.min(1, intro.current + dt / (reduced ? 0.01 : 2.2));
    const e = 1 - (1 - intro.current) ** 3;

    // Is the cursor over the globe? (screen-space distance to Earth's centre)
    const p = pointer.current;
    projected.current.set(...position).project(camera);
    const dx = p.x - projected.current.x;
    const dy = -p.y - projected.current.y;
    const ndcRadius = radius / (viewportHeight / 2);
    const near = p.active && Math.hypot(dx * camera.aspect, dy) < ndcRadius * 1.1 ? 1 : 0;
    hover.current += (near - hover.current) * (1 - Math.exp(-dt * 4));

    g.scale.setScalar((0.86 + 0.14 * e) * (1 + hover.current * 0.035));
    g.rotation.y = (1 - e) * -0.6;

    if (!reduced && leanRef.current && spinRef.current) {
      const k = 1 - Math.exp(-dt * 3);
      leanRef.current.rotation.x += (p.y * 0.18 - leanRef.current.rotation.x) * k;
      leanRef.current.rotation.y += (p.x * 0.32 - leanRef.current.rotation.y) * k;
      // Spin faster while hovered.
      spinRef.current.rotation.y += dt * hover.current * 0.35;
    }
    if (moonRef.current) {
      const t = reduced ? 1.2 : clock.elapsedTime * 0.06 + 1.2;
      moonRef.current.position.set(Math.cos(t) * radius * 2.5, Math.sin(t) * radius * 0.35, -Math.sin(t) * radius * 1.6);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group ref={leanRef}>
        <group ref={spinRef}>
          <PlanetBody
            body={EARTH}
            radius={radius}
            surface={surfaces.earth}
            cloudSurface={surfaces['earth-clouds']}
            segments={96}
            lightPosition={LIGHT_POS}
            spinMultiplier={reduced ? 0 : 0.18}
          />
        </group>
      </group>
      <group ref={moonRef}>
        <PlanetBody body={MOON_BODY} radius={radius * (MOON.diameterKm / 12756)} surface={surfaces.moon} segments={48} lightPosition={LIGHT_POS} spinMultiplier={0} />
      </group>
    </group>
  );
}

/** Subtle mouse-responsive camera drift. */
function ParallaxCamera({ enabled, pointer }) {
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    const p = pointer.current;
    const tx = enabled ? p.x * 0.35 : 0;
    const ty = enabled ? -p.y * 0.22 : 0;
    camera.position.x += (tx - camera.position.x) * 0.035;
    camera.position.y += (ty - camera.position.y) * 0.035;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene({ surfaces, ready, reduced }) {
  // Normalised pointer (-1..1), shared by the camera drift and the globe lean.
  const pointer = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (reduced) return undefined;
    const onMove = (e) => {
      if (e.pointerType === 'touch') return;
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      pointer.current.active = true;
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return (
    <Canvas
      className="hero__canvas"
      dpr={reduced ? [1, 1] : [1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 35, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <Starfield count={reduced ? 700 : 1400} radius={260} twinkle={!reduced} seed={42} />
      <directionalLight position={LIGHT_POS} intensity={2.6} color="#fff5ea" />
      <ambientLight intensity={0.035} color="#8fa2ff" />
      <EarthSystem surfaces={surfaces} reduced={reduced} ready={ready} pointer={pointer} />
      <ParallaxCamera enabled={!reduced} pointer={pointer} />
    </Canvas>
  );
}
