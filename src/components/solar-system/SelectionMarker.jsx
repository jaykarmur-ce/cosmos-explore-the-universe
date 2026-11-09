import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

/** Camera-facing reticle ring that pulses around the selected body. */
export default function SelectionMarker({ radius, color = '#72cfff', animate = true, faint = false }) {
  const ringRef = useRef();
  const matRef = useRef();
  const base = faint ? 0.3 : 0.55;

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    if (!animate) {
      if (matRef.current) matRef.current.opacity = base + 0.1;
      return;
    }
    const t = clock.elapsedTime;
    const s = 1 + Math.sin(t * 2.2) * 0.04;
    ringRef.current.scale.setScalar(s);
    ringRef.current.rotation.z = t * (faint ? 0.8 : 0.25);
    if (matRef.current) matRef.current.opacity = base + Math.sin(t * 2.2) * 0.15;
  });

  const inner = radius * 1.4;
  return (
    <Billboard>
      <group ref={ringRef}>
        <mesh raycast={() => null}>
          <ringGeometry args={[inner, inner + Math.max(0.02, radius * 0.022), 128, 1, 0, Math.PI * 1.75]} />
          <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </Billboard>
  );
}
