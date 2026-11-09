import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Wraps a cached canvas in a THREE.CanvasTexture owned by the calling
 * component. The GPU texture is disposed on unmount or when the canvas
 * changes; the canvas itself stays cached for reuse by other scenes.
 */
export function useCanvasTexture(canvas, { srgb = true, repeat = true } = {}) {
  const gl = useThree((s) => s.gl);

  const texture = useMemo(() => {
    if (!canvas) return null;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    if (repeat) tex.wrapS = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }, [canvas, srgb, repeat, gl]);

  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

export function useSurfaceTextures(surface) {
  const map = useCanvasTexture(surface?.color ?? null);
  const bumpMap = useCanvasTexture(surface?.bump ?? null, { srgb: false });
  return { map, bumpMap };
}
