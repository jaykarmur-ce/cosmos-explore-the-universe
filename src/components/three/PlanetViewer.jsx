import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PlanetBody from './PlanetBody.jsx';
import SunBody from './SunBody.jsx';
import Starfield from './Starfield.jsx';

const LIGHT_POS = [-700, 260, 520];

/** Gentle entrance: the body grows in and settles when it changes. */
function Entrance({ children, bodyId, reduced }) {
  const ref = useRef();
  const state = useRef({ id: null, t: 1 });
  useFrame((_, delta) => {
    const s = state.current;
    if (s.id !== bodyId) {
      s.id = bodyId;
      s.t = reduced ? 1 : 0;
    }
    if (s.t < 1) s.t = Math.min(1, s.t + delta / 1.1);
    const e = 1 - (1 - s.t) ** 3;
    if (ref.current) {
      ref.current.scale.setScalar(0.82 + 0.18 * e);
      ref.current.rotation.y = (1 - e) * -0.8;
    }
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * Single-body 3D viewer for the discovery pages. Drag to rotate; zoom is
 * limited to a comfortable range. Remounting is avoided when switching
 * bodies — only the body inside the canvas changes.
 */
export default function PlanetViewer({ body, surface, cloudSurface, reduced }) {
  const isSun = body.id === 'sun';
  const rings = body.visual?.rings;
  const radius = rings ? 0.98 : isSun ? 1.45 : 1.65;
  const cameraZ = rings ? 7.6 : 6.2;

  return (
    <Canvas
      className="planet-viewer__canvas"
      dpr={reduced ? [1, 1] : [1, 1.75]}
      camera={{ position: [0, rings ? 1.6 : 0.4, cameraZ], fov: 38, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-label={`3D model of ${body.name}. Drag to rotate.`}
      role="img"
    >
      <Starfield count={reduced ? 500 : 1100} radius={240} twinkle={!reduced} seed={body.name.length * 13} />
      <directionalLight position={LIGHT_POS} intensity={isSun ? 0 : 2.7} color="#fff5ea" />
      <ambientLight intensity={0.05} color="#8fa2ff" />
      <Entrance bodyId={body.id} reduced={reduced}>
        {isSun ? (
          <SunBody key="sun" radius={radius} surface={surface} withLight={false} />
        ) : (
          <PlanetBody
            key={body.id}
            body={body}
            radius={radius}
            surface={surface}
            cloudSurface={cloudSurface}
            segments={reduced ? 64 : 112}
            lightPosition={LIGHT_POS}
            spinMultiplier={reduced ? 0 : 0.6}
          />
        )}
      </Entrance>
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={cameraZ * 0.62}
        maxDistance={cameraZ * 1.5}
        rotateSpeed={0.55}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
