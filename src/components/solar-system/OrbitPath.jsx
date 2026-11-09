import { useMemo } from 'react';
import { Line } from '@react-three/drei';

/** Circular orbit guide in the ecliptic plane. */
export default function OrbitPath({ radius, color = '#a5aec4', opacity = 0.22, lineWidth = 1, segments = 256 }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return pts;
  }, [radius, segments]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      depthWrite={false}
      raycast={() => null}
    />
  );
}
