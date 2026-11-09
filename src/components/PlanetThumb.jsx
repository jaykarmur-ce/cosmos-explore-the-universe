import { memo, useEffect, useRef } from 'react';
import { useSurface } from '../lib/textures/surfaceService.js';
import { getRingCanvas } from '../lib/textures/canvasTextures.js';
import { getBody } from '../data/planets.js';

const THUMB_WIDTH = 256;
let ringPixelsCache = null;

function ringPixels() {
  if (!ringPixelsCache) {
    const canvas = getRingCanvas('saturn');
    ringPixelsCache = {
      width: canvas.width,
      data: canvas.getContext('2d').getImageData(0, 0, canvas.width, 1).data,
    };
  }
  return ringPixelsCache;
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Renders a lit sphere from a surface map on a 2D canvas — no WebGL needed.
 * Used for planet chips, cards and as the 3D fallback.
 */
function drawPlanet(canvas, { body, surface, size, rotation, dpr }) {
  const px = Math.round(size * dpr);
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(px, px);
  const out = img.data;

  const isSun = body.id === 'sun';
  const hasRings = body.visual?.rings?.type === 'saturn';
  const R = (px / 2) * (hasRings ? 0.44 : isSun ? 0.62 : 0.92);
  const cx = px / 2;
  const cy = px / 2;
  const accent = hexToRgb(body.accent);
  const atmo = body.visual?.atmosphere ? hexToRgb(body.visual.atmosphere.color) : null;
  const L = [-0.62, 0.38, 0.69];
  const tex = surface?.pixels;
  const tw = surface?.width ?? 1;
  const th = surface?.height ?? 1;
  const ring = hasRings ? ringPixels() : null;
  const ringInner = body.visual?.rings?.inner ?? 1.24;
  const ringOuter = body.visual?.rings?.outer ?? 2.33;
  const ringTilt = 0.32; // apparent opening of the ring ellipse
  const TWO_PI = Math.PI * 2;

  for (let y = 0; y < px; y++) {
    for (let x = 0; x < px; x++) {
      const dx = (x + 0.5 - cx) / R;
      const dy = (y + 0.5 - cy) / R;
      const d2 = dx * dx + dy * dy;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      // Sphere
      if (d2 <= 1.02) {
        const edge = Math.min(1, Math.max(0, (1 - Math.sqrt(d2)) * R + 0.5));
        const nx = dx;
        const ny = -dy;
        const nz = Math.sqrt(Math.max(0, 1 - d2));
        let cr = accent[0];
        let cg = accent[1];
        let cb = accent[2];
        if (tex) {
          const lon = Math.atan2(nx, nz) + rotation;
          const lat = Math.asin(Math.max(-1, Math.min(1, ny)));
          let u = (lon + Math.PI) / TWO_PI;
          u -= Math.floor(u);
          const v = 0.5 - lat / Math.PI;
          const ti = (Math.min(th - 1, Math.floor(v * th)) * tw + Math.min(tw - 1, Math.floor(u * tw))) * 4;
          cr = tex[ti];
          cg = tex[ti + 1];
          cb = tex[ti + 2];
        }
        let shade;
        if (isSun) {
          shade = 0.72 + 0.4 * nz ** 0.5; // limb darkening
        } else {
          const lambert = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
          shade = 0.035 + 0.98 * lambert ** 0.85;
        }
        r = cr * shade;
        g = cg * shade;
        b = cb * shade;
        if (atmo) {
          const rim = (1 - nz) ** 2.4 * Math.max(0.1, nx * L[0] + ny * L[1] + 0.5);
          r += atmo[0] * rim * 0.55;
          g += atmo[1] * rim * 0.55;
          b += atmo[2] * rim * 0.55;
        }
        a = edge;
      } else if (isSun) {
        const glow = Math.exp(-(Math.sqrt(d2) - 1) * 3.2) * 0.85;
        r = 255;
        g = 170;
        b = 80;
        a = glow;
      }

      // Rings (Saturn): front half drawn over the planet, back half behind it.
      if (ring) {
        const ry = dy / ringTilt;
        const rr = Math.sqrt(dx * dx + ry * ry);
        if (rr >= ringInner && rr <= ringOuter) {
          const front = dy > 0;
          const hiddenByPlanet = !front && d2 <= 1;
          if (!hiddenByPlanet) {
            const ri = Math.floor(((rr - ringInner) / (ringOuter - ringInner)) * (ring.width - 1)) * 4;
            const ra = (ring.data[ri + 3] / 255) * 0.95;
            const lit = 0.55 + 0.45 * (dx < 0 ? 1 : 0.7);
            r = r * (1 - ra) + ring.data[ri] * lit * ra;
            g = g * (1 - ra) + ring.data[ri + 1] * lit * ra;
            b = b * (1 - ra) + ring.data[ri + 2] * lit * ra;
            a = Math.max(a, ra);
          }
        }
      }

      const i = (y * px + x) * 4;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * `spinning` animates the globe (used for hover feedback); it renders a
 * single static frame otherwise, so idle thumbnails cost nothing.
 */
function PlanetThumb({ id, size = 64, surface: providedSurface, rotation = 0.9, spinning = false, className = '', label }) {
  const canvasRef = useRef(null);
  const angle = useRef(rotation);
  const body = getBody(id);
  const { surface: fetched } = useSurface(providedSurface ? null : id, THUMB_WIDTH, 8);
  const surface = providedSurface ?? fetched;

  useEffect(() => {
    angle.current = rotation;
  }, [rotation]);

  useEffect(() => {
    if (!canvasRef.current || !body) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const draw = () => drawPlanet(canvasRef.current, { body, surface, size, rotation: angle.current, dpr });
    draw();
    if (!spinning || !surface) return undefined;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      angle.current += ((now - last) / 1000) * 1.1;
      last = now;
      if (canvasRef.current) draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [body, surface, size, spinning]);

  if (!body) return null;
  return (
    <canvas
      ref={canvasRef}
      className={`planet-thumb ${className}`}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

export default memo(PlanetThumb);
