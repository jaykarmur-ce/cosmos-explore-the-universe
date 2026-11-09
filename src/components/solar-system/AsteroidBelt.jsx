import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32 } from '../../lib/noise.js';
import { ASTEROID_BELT } from './layout.js';

/**
 * Illustrative main asteroid belt (2.2–3.2 AU, compressed like the orbits).
 * It rotates as a whole with a ~4.6-year period — typical of the belt's
 * middle — rather than simulating individual asteroids.
 */
export default function AsteroidBelt({ count = 1600, clock }) {
  const ref = useRef();

  const geometry = useMemo(() => {
    const rand = mulberry32(2026);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = rand();
      const r = ASTEROID_BELT.inner + (ASTEROID_BELT.outer - ASTEROID_BELT.inner) * (0.5 + (t - 0.5) * (0.6 + rand() * 0.4));
      const a = rand() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (rand() - 0.5) * 0.9;
      positions[i * 3 + 2] = Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y = (clock.days / (4.6 * 365.25)) * Math.PI * 2;
  });

  return (
    <points ref={ref} geometry={geometry} raycast={() => null}>
      <pointsMaterial size={0.16} sizeAttenuation color="#9c9283" transparent opacity={0.6} depthWrite={false} />
    </points>
  );
}
