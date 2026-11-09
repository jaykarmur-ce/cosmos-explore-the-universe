import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { getRingCanvas } from '../../lib/textures/canvasTextures.js';
import { useCanvasTexture } from './useCanvasTexture.js';

/** Planetary ring with a radial texture (u = inner → outer edge). */
export default function Rings({ type = 'saturn', inner, outer, radius }) {
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(inner * radius, outer * radius, 192, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() - inner * radius) / ((outer - inner) * radius), 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }, [inner, outer, radius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const canvas = useMemo(() => getRingCanvas(type), [type]);
  const texture = useCanvasTexture(canvas, { repeat: false });

  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2} renderOrder={3} raycast={() => null}>
      <meshStandardMaterial
        map={texture}
        emissiveMap={texture}
        emissive="#ffffff"
        emissiveIntensity={type === 'saturn' ? 0.22 : 0.3}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
