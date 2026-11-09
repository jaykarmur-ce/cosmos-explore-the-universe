/**
 * Small canvas-based textures created on the main thread: planetary rings,
 * soft glows and round star sprites. Results are cached per key.
 */
import { createNoise3D, smoothstep } from '../noise.js';

const cache = new Map();

function memo(key, build) {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
}

/**
 * Ring texture laid out radially along x (inner edge → outer edge).
 * Saturn's structure follows the main ring regions (C, B, Cassini Division,
 * A ring with the Encke Gap, and the narrow F ring), scaled to the planet's
 * ring radii in planets.js (inner 1.24 R, outer 2.33 R).
 */
export function getRingCanvas(type = 'saturn') {
  return memo(`ring:${type}`, () => {
    const width = 1024;
    const height = 4;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(width, height);
    const noise = createNoise3D(type === 'saturn' ? 74 : 98);

    for (let x = 0; x < width; x++) {
      const u = x / (width - 1);
      let r;
      let g;
      let b;
      let a;
      if (type === 'saturn') {
        const R = 1.24 + u * (2.33 - 1.24); // radius in planet radii
        const ringlets = 0.75 + 0.25 * noise(R * 60, 0.5, 0.5) + 0.12 * noise(R * 240, 1.5, 0.5);
        let density = 0;
        if (R < 1.53) density = 0.12 + 0.1 * smoothstep(1.24, 1.53, R); // C ring
        else if (R < 1.95) density = 0.7 + 0.25 * smoothstep(1.53, 1.75, R); // B ring
        else if (R < 2.03) density = 0.04; // Cassini Division
        else if (R < 2.27) density = 0.55 - (R > 2.205 && R < 2.215 ? 0.5 : 0); // A ring + Encke gap
        else if (R > 2.315 && R < 2.33) density = 0.35; // F ring
        density *= ringlets;
        const warm = R < 1.95 && R > 1.53 ? 1 : 0.85;
        r = 222 * warm;
        g = 200 * warm;
        b = 160 * warm;
        a = Math.min(1, density) * 255;
      } else {
        // Uranus: a handful of narrow, dark rings (epsilon ring outermost).
        const rings = [0.08, 0.18, 0.27, 0.35, 0.47, 0.58, 0.66, 0.92];
        let d = 0;
        rings.forEach((pos, i) => {
          const w = i === rings.length - 1 ? 0.022 : 0.007;
          d = Math.max(d, Math.exp(-(((u - pos) / w) ** 2)));
        });
        r = 170;
        g = 186;
        b = 196;
        a = d * 150;
      }
      for (let y = 0; y < height; y++) {
        const i = (y * width + x) * 4;
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
        img.data[i + 3] = a;
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  });
}

/** Soft radial glow (white core fading to transparent). */
export function getGlowCanvas(color = '#ffb35c', size = 256) {
  return memo(`glow:${color}:${size}`, () => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.12, hexToRgba(color, 0.9));
    grad.addColorStop(0.35, hexToRgba(color, 0.32));
    grad.addColorStop(0.65, hexToRgba(color, 0.08));
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return canvas;
  });
}

export function hexToRgba(hex, alpha = 1) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
