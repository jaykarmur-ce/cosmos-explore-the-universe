import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getGlowCanvas } from '../../lib/textures/canvasTextures.js';
import { useSurfaceTextures, useCanvasTexture } from './useCanvasTexture.js';

/**
 * The Sun: an unlit, emissive sphere with layered additive glow sprites and
 * the point light that illuminates the planets.
 */
export default function SunBody({ radius = 4, surface, pausedRef, withLight = true, lightIntensity = 2.6, meshProps }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const { map } = useSurfaceTextures(surface);
  const glowCanvas = useMemo(() => getGlowCanvas('#ffb35c', 256), []);
  const coronaCanvas = useMemo(() => getGlowCanvas('#ff7a2e', 256), []);
  const glow = useCanvasTexture(glowCanvas, { repeat: false });
  const corona = useCanvasTexture(coronaCanvas, { repeat: false });

  useFrame(({ clock }, delta) => {
    if (pausedRef?.current) return;
    if (meshRef.current) meshRef.current.rotation.y += Math.min(delta, 0.1) * 0.05;
    if (glowRef.current) {
      const s = radius * 5.2 * (1 + Math.sin(clock.elapsedTime * 0.8) * 0.02);
      glowRef.current.scale.set(s, s, 1);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} {...meshProps}>
        <sphereGeometry args={[radius, 64, 48]} />
        <meshBasicMaterial key={map ? 'tex' : 'flat'} map={map} color={map ? '#ffffff' : '#ffb35c'} toneMapped={false} />
      </mesh>
      {glow && (
        <sprite ref={glowRef} scale={[radius * 5.2, radius * 5.2, 1]} raycast={() => null}>
          <spriteMaterial
            map={glow}
            color="#ffc27a"
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      )}
      {corona && (
        <sprite scale={[radius * 13, radius * 13, 1]} raycast={() => null}>
          <spriteMaterial
            map={corona}
            color="#ff9a4a"
            transparent
            opacity={0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      )}
      {withLight && <pointLight intensity={lightIntensity} decay={0} distance={0} color="#fff3e2" />}
    </group>
  );
}
