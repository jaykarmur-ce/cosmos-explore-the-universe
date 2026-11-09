import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32 } from '../../lib/noise.js';

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uTwinkle;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vAlpha = 1.0 - uTwinkle * (0.5 + 0.5 * sin(uTime * (0.6 + aPhase) + aPhase * 6.2831));
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const STAR_TINTS = [
  [0.75, 0.83, 1.0],
  [0.9, 0.93, 1.0],
  [1.0, 1.0, 1.0],
  [1.0, 0.95, 0.85],
  [1.0, 0.85, 0.7],
];

/**
 * Background stars on a large sphere. About 40% are concentrated along a
 * tilted band to suggest the plane of the Milky Way.
 */
export default function Starfield({ count = 3500, radius = 900, twinkle = true, seed = 7 }) {
  const gl = useThree((s) => s.gl);

  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(seed);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const bandTilt = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(1.05, 0.4, 0.2));
    const v = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      if (rand() < 0.4) {
        const theta = rand() * Math.PI * 2;
        const spread = (rand() + rand() + rand() - 1.5) * 0.22;
        v.set(Math.cos(theta), spread, Math.sin(theta)).normalize().applyMatrix4(bandTilt);
      } else {
        const u = rand() * 2 - 1;
        const t = rand() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        v.set(s * Math.cos(t), u, s * Math.sin(t));
      }
      const r = radius * (0.85 + rand() * 0.3);
      positions.set([v.x * r, v.y * r, v.z * r], i * 3);
      const big = rand();
      sizes[i] = big > 0.985 ? 3.2 + rand() * 1.6 : big > 0.9 ? 2 + rand() : 0.8 + rand() * 1.1;
      phases[i] = rand();
      const tint = STAR_TINTS[Math.floor(rand() * STAR_TINTS.length)];
      const brightness = 0.55 + rand() * 0.45;
      colors.set([tint[0] * brightness, tint[1] * brightness, tint[2] * brightness], i * 3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uTwinkle: { value: twinkle ? 0.35 : 0 },
      },
    });
    return { geometry: geo, material: mat };
  }, [count, radius, seed, twinkle]);

  useEffect(() => {
    material.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 2);
  }, [gl, material]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock }) => {
    if (twinkle) material.uniforms.uTime.value = clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} raycast={() => null} />;
}
