import { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Atmosphere from './Atmosphere.jsx';
import Rings from './Rings.jsx';
import { useSurfaceTextures, useCanvasTexture } from './useCanvasTexture.js';

const DEG = Math.PI / 180;

const BUMP_SCALE = {
  mercury: 2.4,
  moon: 2.4,
  mars: 1.6,
  earth: 1.1,
};

/**
 * Visual spin rate (radians per second). Real rotation periods range from
 * ~10 hours to ~243 days, so the rate is compressed to stay readable.
 */
function visualSpinRate(rotationHours) {
  const h = Math.abs(rotationHours || 24);
  return 0.32 * (24 / h) ** 0.35;
}

/**
 * A textured planet with optional clouds, atmosphere and rings.
 * The mesh sits inside a group tilted by the body's axial tilt; spin happens
 * around the tilted axis. `pausedRef` (a ref to a boolean) freezes rotation.
 */
const PlanetBody = forwardRef(function PlanetBody(
  {
    body,
    radius = 1,
    surface,
    cloudSurface,
    segments = 64,
    lightPosition = [0, 0, 0],
    spinMultiplier = 1,
    pausedRef,
    showAtmosphere = true,
    meshProps,
  },
  ref,
) {
  const spinRef = useRef();
  const cloudRef = useRef();
  const { map, bumpMap } = useSurfaceTextures(surface);
  const cloudMap = useCanvasTexture(cloudSurface?.color ?? null);
  const visual = body.visual ?? {};
  const spin = visualSpinRate(body.stats?.rotationHours) * spinMultiplier;

  useFrame((_, delta) => {
    if (pausedRef?.current) return;
    const dt = Math.min(delta, 0.1);
    if (spinRef.current) spinRef.current.rotation.y += dt * spin;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * spin * 1.18;
  });

  const isEarth = body.id === 'earth';

  return (
    <group ref={ref} rotation-z={(visual.tiltDeg ?? 0) * DEG}>
      <mesh ref={spinRef} {...meshProps}>
        <sphereGeometry args={[radius, segments, Math.round(segments * 0.75)]} />
        <meshStandardMaterial
          key={map ? 'textured' : 'flat'}
          map={map}
          color={map ? '#ffffff' : body.accent}
          bumpMap={bumpMap}
          bumpScale={bumpMap ? BUMP_SCALE[body.id] ?? 1 : 0}
          roughnessMap={isEarth ? bumpMap : null}
          roughness={isEarth ? 1 : 0.92}
          metalness={0}
        />
      </mesh>

      {cloudMap && (
        <mesh ref={cloudRef} scale={1.012} raycast={() => null}>
          <sphereGeometry args={[radius, segments, Math.round(segments * 0.75)]} />
          <meshStandardMaterial
            map={cloudMap}
            transparent
            opacity={0.8}
            depthWrite={false}
            roughness={1}
            metalness={0}
            side={THREE.FrontSide}
          />
        </mesh>
      )}

      {showAtmosphere && visual.atmosphere && (
        <Atmosphere radius={radius} lightPosition={lightPosition} {...visual.atmosphere} />
      )}

      {visual.rings && <Rings type={visual.rings.type} inner={visual.rings.inner} outer={visual.rings.outer} radius={radius} />}
    </group>
  );
});

export default PlanetBody;
