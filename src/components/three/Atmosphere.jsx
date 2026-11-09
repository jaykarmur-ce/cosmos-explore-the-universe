import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

// Shared vertex shader: world-space normal/position plus how directly this
// point on the shell faces the light (vLit, -1..1).
const vertexShader = /* glsl */ `
  uniform vec3 uLightPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying float vLit;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 center = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vWorldPos = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vLit = dot(normalize(world.xyz - center), normalize(uLightPos - center));
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Inner rim: fresnel glow across the planet's limb, brighter on the day side.
const rimFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying float vLit;
  void main() {
    vec3 n = normalize(vWorldNormal);
    vec3 v = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), uPower);
    float lit = smoothstep(-0.25, 0.6, vLit);
    float a = fresnel * uIntensity * (0.06 + 0.94 * lit);
    gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));
  }
`;

// Outer halo: back faces of a larger shell, fading outward from the limb.
const haloFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uEdge;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying float vLit;
  void main() {
    vec3 n = normalize(vWorldNormal);
    vec3 v = normalize(cameraPosition - vWorldPos);
    float d = clamp(-dot(n, v) / uEdge, 0.0, 1.0);
    float glow = pow(d, 2.6);
    float lit = smoothstep(-0.3, 0.55, vLit);
    float a = glow * uIntensity * (0.04 + 0.96 * lit) * 0.5;
    gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));
  }
`;

const HALO_FACTOR = 1.12;

/**
 * Two-layer atmospheric glow. `lightPosition` is a world-space point:
 * the Sun's position in the explorer, or a distant point for directional light.
 */
export default function Atmosphere({ radius, color = '#6fb6ff', intensity = 1, power = 2.5, scale = 1.03, lightPosition = [0, 0, 0] }) {
  const [rim, halo] = useMemo(() => {
    const common = {
      vertexShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    };
    const rimMat = new THREE.ShaderMaterial({
      ...common,
      fragmentShader: rimFragment,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uPower: { value: power },
        uLightPos: { value: new THREE.Vector3() },
      },
    });
    const outer = scale * HALO_FACTOR;
    const haloMat = new THREE.ShaderMaterial({
      ...common,
      side: THREE.BackSide,
      fragmentShader: haloFragment,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uLightPos: { value: new THREE.Vector3() },
        // -n·v where the planet's limb meets the halo shell.
        uEdge: { value: Math.sqrt(1 - 1 / (outer * outer)) },
      },
    });
    return [rimMat, haloMat];
  }, [color, intensity, power, scale]);

  const [lx, ly, lz] = lightPosition;
  useEffect(() => {
    rim.uniforms.uLightPos.value.set(lx, ly, lz);
    halo.uniforms.uLightPos.value.set(lx, ly, lz);
  }, [rim, halo, lx, ly, lz]);

  useEffect(
    () => () => {
      rim.dispose();
      halo.dispose();
    },
    [rim, halo],
  );

  return (
    <>
      <mesh scale={radius * scale} material={rim} renderOrder={2} raycast={() => null}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      <mesh scale={radius * scale * HALO_FACTOR} material={halo} renderOrder={1} raycast={() => null}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
    </>
  );
}
