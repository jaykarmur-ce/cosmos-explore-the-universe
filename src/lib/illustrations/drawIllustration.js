/**
 * Procedural 2D illustrations for deep-space objects.
 *
 * These are artistic representations generated on a canvas — not
 * photographs — so the app ships no image files and every card still has a
 * distinctive visual. Output is deterministic for a given `art.seed`.
 */
import { createNoise3D, mulberry32, fbm3 } from '../noise.js';

const TAU = Math.PI * 2;

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgba = (hex, a) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

function gaussian(rand) {
  return (rand() + rand() + rand() + rand() - 2) / 2;
}

// ── shared layers ───────────────────────────────────────────────────────

function background(ctx, w, h, rand, tint = '#0b1020') {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, Math.max(w, h) * 0.8);
  g.addColorStop(0, tint);
  g.addColorStop(1, '#03040c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const count = Math.round((w * h) / 900);
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = rand() ** 4 * 1.3 + 0.25;
    ctx.fillStyle = `rgba(${220 + rand() * 35},${225 + rand() * 30},255,${0.25 + rand() * 0.6})`;
    ctx.fillRect(x, y, r, r);
  }
}

function brightStar(ctx, x, y, size, color = '#ffffff', spikes = true) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.15, rgba(color, 0.8));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, size * 4, 0, TAU);
  ctx.fill();
  if (spikes) {
    ctx.strokeStyle = rgba(color, 0.45);
    ctx.lineWidth = Math.max(0.6, size * 0.18);
    ctx.beginPath();
    ctx.moveTo(x - size * 7, y);
    ctx.lineTo(x + size * 7, y);
    ctx.moveTo(x, y - size * 7);
    ctx.lineTo(x, y + size * 7);
    ctx.stroke();
  }
}

/** Low-resolution noise cloud drawn into an offscreen canvas and upscaled. */
function noiseCloud(w, h, { seed, scale = 2.2, palette, density = 0.5, mask, warp = 0.8 }) {
  const sw = Math.max(32, Math.round(w / 3));
  const sh = Math.max(20, Math.round(h / 3));
  const off = document.createElement('canvas');
  off.width = sw;
  off.height = sh;
  const octx = off.getContext('2d');
  const img = octx.createImageData(sw, sh);
  const n = createNoise3D(seed);
  const n2 = createNoise3D(seed + 11);
  const cols = palette.map(hexToRgb);
  const aspect = sw / sh;
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const u = (x / sw) * aspect;
      const v = y / sh;
      const wx = fbm3(n2, u * 1.5, v * 1.5, 0.3, 3) * warp;
      const wy = fbm3(n2, u * 1.5 + 4, v * 1.5, 0.7, 3) * warp;
      let d = fbm3(n, u * scale + wx, v * scale + wy, 0.5, 6) * 0.5 + 0.5;
      const m = mask ? mask(x / sw, y / sh) : 1;
      d = Math.max(0, d - (1 - density)) / density;
      d *= m;
      const hue = fbm3(n2, u * 1.2, v * 1.2, 2.1, 3) * 0.5 + 0.5;
      const ci = Math.min(cols.length - 1.001, hue * (cols.length - 1));
      const c0 = cols[Math.floor(ci)];
      const c1 = cols[Math.ceil(ci)];
      const t = ci - Math.floor(ci);
      const i = (y * sw + x) * 4;
      img.data[i] = c0[0] + (c1[0] - c0[0]) * t;
      img.data[i + 1] = c0[1] + (c1[1] - c0[1]) * t;
      img.data[i + 2] = c0[2] + (c1[2] - c0[2]) * t;
      img.data[i + 3] = Math.min(255, d ** 1.4 * 470);
    }
  }
  octx.putImageData(img, 0, 0);
  return off;
}

// ── kinds ───────────────────────────────────────────────────────────────

const BH_PALETTES = {
  amber: ['#fff3d1', '#ffb347', '#c2410c'],
  fire: ['#fff0cf', '#ff8a3d', '#8f1d0a'],
  blue: ['#eef6ff', '#8fc8ff', '#4b3bb5'],
};

function blackHole(ctx, w, h, art, rand) {
  background(ctx, w, h, rand, '#0a0d1d');
  const [hot, mid, cool] = BH_PALETTES[art.hue] ?? BH_PALETTES.amber;
  const cx = w * (art.variant === 'binary' ? 0.6 : 0.5);
  const cy = h * 0.54;
  const R = Math.min(w, h) * 0.13;

  if (art.variant === 'jet') {
    for (const dir of [-1, 1]) {
      const g = ctx.createLinearGradient(cx, cy, cx + dir * w * 0.05, cy + dir * -h * 0.6);
      g.addColorStop(0, rgba('#9fd3ff', 0.55));
      g.addColorStop(1, rgba('#9fd3ff', 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.15, cy);
      ctx.lineTo(cx + dir * w * 0.05 - R * 0.5, cy - dir * h * 0.62);
      ctx.lineTo(cx + dir * w * 0.05 + R * 0.5, cy - dir * h * 0.62);
      ctx.lineTo(cx + R * 0.15, cy);
      ctx.fill();
    }
  }

  if (art.variant === 'binary') {
    const sx = w * 0.2;
    const sy = h * 0.32;
    const sr = R * 1.1;
    // Gas stream from the companion to the disk.
    ctx.strokeStyle = rgba('#8fc8ff', 0.35);
    ctx.lineWidth = R * 0.18;
    ctx.beginPath();
    ctx.moveTo(sx + sr * 0.8, sy + sr * 0.3);
    ctx.quadraticCurveTo(w * 0.42, h * 0.35, cx - R * 2.2, cy - R * 0.3);
    ctx.stroke();
    const sg = ctx.createRadialGradient(sx - sr * 0.3, sy - sr * 0.3, 0, sx, sy, sr * 2.4);
    sg.addColorStop(0, '#ffffff');
    sg.addColorStop(0.3, '#bfe0ff');
    sg.addColorStop(0.42, rgba('#6fa8ff', 0.5));
    sg.addColorStop(1, rgba('#6fa8ff', 0));
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 2.4, 0, TAU);
    ctx.fill();
  }

  // The accretion disk is painted on its own layer so the Doppler-beaming
  // tint (source-atop) only affects the disk, not the background.
  const diskLayer = document.createElement('canvas');
  diskLayer.width = w;
  diskLayer.height = h;
  const dctx = diskLayer.getContext('2d');
  dctx.translate(cx, cy);
  dctx.scale(1, 0.24);
  const dg = dctx.createRadialGradient(0, 0, R * 1.2, 0, 0, R * 3.9);
  dg.addColorStop(0, rgba(hot, 1));
  dg.addColorStop(0.3, rgba(mid, 0.9));
  dg.addColorStop(0.7, rgba(cool, 0.45));
  dg.addColorStop(1, rgba(cool, 0));
  dctx.fillStyle = dg;
  dctx.beginPath();
  dctx.arc(0, 0, R * 3.9, 0, TAU);
  dctx.arc(0, 0, R * 1.15, 0, TAU, true);
  dctx.fill('evenodd');
  // Doppler beaming: the approaching (left) side is brighter.
  const beam = dctx.createLinearGradient(-R * 4, 0, R * 4, 0);
  beam.addColorStop(0, 'rgba(255,255,255,0.4)');
  beam.addColorStop(0.5, 'rgba(255,255,255,0)');
  beam.addColorStop(1, 'rgba(0,0,0,0.4)');
  dctx.globalCompositeOperation = 'source-atop';
  dctx.fillStyle = beam;
  dctx.fillRect(-R * 4, -R * 20, R * 8, R * 40);

  const drawDisk = (half) => {
    ctx.save();
    ctx.beginPath();
    if (half === 'back') ctx.rect(0, 0, w, cy);
    else ctx.rect(0, cy, w, h - cy);
    ctx.clip();
    ctx.drawImage(diskLayer, 0, 0);
    ctx.restore();
  };

  drawDisk('back');

  // Lensed image of the far side of the disk arching over the shadow.
  ctx.save();
  ctx.translate(cx, cy);
  const arc = ctx.createRadialGradient(0, 0, R * 1.05, 0, 0, R * 1.9);
  arc.addColorStop(0, rgba(hot, 0.95));
  arc.addColorStop(0.35, rgba(mid, 0.6));
  arc.addColorStop(1, rgba(cool, 0));
  ctx.fillStyle = arc;
  ctx.beginPath();
  ctx.ellipse(0, 0, R * 1.9, R * 1.75, 0, Math.PI, TAU);
  ctx.ellipse(0, 0, R * 1.05, R * 1.05, 0, TAU, Math.PI, true);
  ctx.fill();
  ctx.restore();

  // Photon ring
  ctx.save();
  ctx.shadowColor = hot;
  ctx.shadowBlur = R * 0.6;
  ctx.strokeStyle = rgba(hot, 0.95);
  ctx.lineWidth = Math.max(1.2, R * 0.07);
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.04, 0, TAU);
  ctx.stroke();
  ctx.restore();

  // Shadow
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fill();

  drawDisk('front');
}

function nebula(ctx, w, h, art, rand) {
  background(ctx, w, h, rand, '#080b1a');
  const [c1, c2, c3] = art.palette;
  ctx.globalCompositeOperation = 'lighter';

  let mask;
  if (art.variant === 'ring') {
    mask = (u, v) => {
      const dx = (u - 0.5) * (w / h);
      const dy = v - 0.52;
      const r = Math.sqrt(dx * dx + dy * dy);
      return Math.exp(-(((r - 0.27) / 0.11) ** 2)) * 1.4 + Math.exp(-((r / 0.16) ** 2)) * 0.5;
    };
  } else if (art.variant === 'pillars') {
    mask = (u, v) => 0.65 + 0.5 * v;
  } else {
    mask = (u, v) => {
      const dx = (u - 0.55) * 1.4;
      const dy = v - 0.5;
      return Math.max(0.15, 1.3 - Math.sqrt(dx * dx + dy * dy) * 1.6);
    };
  }

  const layers = [
    noiseCloud(w, h, { seed: art.seed, palette: [c2, c1], density: 0.62, mask, scale: 2 }),
    noiseCloud(w, h, { seed: art.seed + 5, palette: [c1, c3], density: 0.5, mask, scale: 3.2, warp: 1.1 }),
  ];
  ctx.imageSmoothingQuality = 'high';
  layers.forEach((layer, i) => {
    ctx.globalAlpha = i === 0 ? 0.95 : 0.75;
    ctx.drawImage(layer, 0, 0, w, h);
  });
  ctx.globalAlpha = 1;

  if (art.variant === 'ring') {
    const g = ctx.createRadialGradient(w / 2, h * 0.52, 0, w / 2, h * 0.52, h * 0.2);
    g.addColorStop(0, rgba(c1, 0.45));
    g.addColorStop(1, rgba(c1, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    brightStar(ctx, w / 2, h * 0.52, Math.max(1.4, h * 0.006), '#cfe6ff', false);
  }

  ctx.globalCompositeOperation = 'source-over';

  if (art.variant === 'pillars') {
    const n = createNoise3D(art.seed + 3);
    // Three columns of dense gas, wide at the base and tapering upward,
    // with ragged edges and sunlit tops.
    const pillars = [
      [0.3, 1.02, 0.22, 0.17],
      [0.55, 1.02, 0.4, 0.12],
      [0.76, 1.02, 0.55, 0.1],
    ];
    pillars.forEach(([x0, yb, yt, width], pi) => {
      const top = h * yt;
      const bottom = h * yb;
      const steps = 48;
      const edge = (t, side) => {
        const lean = (t * t) * width * w * 0.25 * (pi % 2 ? -1 : 1);
        const ragged = n(t * 6, pi * 3 + side, 0.5) * width * w * 0.12;
        const half = width * w * 0.5 * (1 - t * 0.6) * (t > 0.88 ? Math.sqrt(Math.max(0, (1 - t) / 0.12)) : 1);
        return x0 * w + lean + side * half + ragged;
      };
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const y = bottom - (bottom - top) * t;
        if (s === 0) ctx.moveTo(edge(t, -1), y);
        else ctx.lineTo(edge(t, -1), y);
      }
      for (let s = steps; s >= 0; s--) {
        const t = s / steps;
        ctx.lineTo(edge(t, 1), bottom - (bottom - top) * t);
      }
      ctx.closePath();
      const g = ctx.createLinearGradient(0, top, 0, bottom);
      g.addColorStop(0, '#8a5a30');
      g.addColorStop(0.07, '#3d2614');
      g.addColorStop(0.5, '#1c120a');
      g.addColorStop(1, '#0c0805');
      ctx.fillStyle = g;
      ctx.shadowColor = rgba(c1, 0.95);
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  for (let i = 0; i < 7; i++) {
    brightStar(ctx, rand() * w, rand() * h, 0.8 + rand() * 1.6, rand() > 0.5 ? '#cfe6ff' : '#fff1d6');
  }
}

function galaxy(ctx, w, h, art, rand) {
  background(ctx, w, h, rand, '#070a18');
  const [core, arm, knot] = art.palette;
  const cx = w * (art.variant === 'companion' ? 0.46 : 0.5);
  const cy = h * 0.52;
  const R = Math.min(w, h) * (art.variant === 'inclined' ? 0.62 : 0.46);
  const tiltY = art.variant === 'inclined' ? 0.32 : art.variant === 'barred' ? 0.78 : 0.86;
  const rot = art.variant === 'inclined' ? -0.42 : 0.3;
  const arms = art.variant === 'barred' ? 2 : 2;
  const [cr, cg, cb] = hexToRgb(core);
  const [ar, ag, ab] = hexToRgb(arm);
  const [kr, kg, kb] = hexToRgb(knot);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(1, tiltY);
  ctx.globalCompositeOperation = 'lighter';

  // Diffuse disk glow
  const disk = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  disk.addColorStop(0, rgba(arm, 0.22));
  disk.addColorStop(1, rgba(arm, 0));
  ctx.fillStyle = disk;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.fill();

  const stars = Math.round(Math.min(14000, w * h * 0.04));
  const b = 0.3;
  const turns = 2.6 * Math.PI;
  for (let i = 0; i < stars; i++) {
    const armIndex = i % arms;
    let x;
    let y;
    let t = 0;
    if (rand() < 0.4) {
      // Smooth exponential disk population between the arms.
      const r = Math.min(R, -Math.log(1 - rand() * 0.98) * R * 0.22);
      const a = rand() * TAU;
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
    } else {
      t = rand() ** 1.15;
      const theta = t * turns + (armIndex * TAU) / arms;
      const r = Math.min(R * 0.09 * Math.exp(b * theta), R * 1.02);
      const spread = (0.1 + t * 0.14) * r + R * 0.015;
      x = Math.cos(theta) * r + gaussian(rand) * spread;
      y = Math.sin(theta) * r + gaussian(rand) * spread;
      if (art.variant === 'barred' && t < 0.22) {
        x = gaussian(rand) * R * 0.34;
        y = gaussian(rand) * R * 0.07;
      }
    }
    const dist = Math.sqrt(x * x + y * y) / R;
    const isKnot = rand() > 0.985 && dist > 0.25;
    const coreMix = Math.max(0, 1 - dist * 2.2);
    const cR = isKnot ? kr : ar + (cr - ar) * coreMix;
    const cG = isKnot ? kg : ag + (cg - ag) * coreMix;
    const cB = isKnot ? kb : ab + (cb - ab) * coreMix;
    const a = isKnot ? 0.8 : 0.18 + rand() * 0.3;
    const s = isKnot ? 2.2 : rand() * 1.4 + 0.5;
    ctx.fillStyle = `rgba(${cR | 0},${cG | 0},${cB | 0},${a})`;
    ctx.fillRect(x, y, s, s);
  }

  // Dust lanes (subtle dark arcs)
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(5,6,14,0.35)';
  ctx.lineWidth = R * 0.03;
  for (let a = 0; a < arms; a++) {
    ctx.beginPath();
    for (let t = 0.15; t < 0.9; t += 0.01) {
      const theta = t * turns + (a * TAU) / arms - 0.25;
      const r = Math.min(R * 0.09 * Math.exp(b * theta), R);
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      if (t === 0.15) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Bright core
  ctx.globalCompositeOperation = 'lighter';
  const cg2 = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.35);
  cg2.addColorStop(0, 'rgba(255,255,255,0.95)');
  cg2.addColorStop(0.25, rgba(core, 0.7));
  cg2.addColorStop(1, rgba(core, 0));
  ctx.fillStyle = cg2;
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.35, 0, TAU);
  ctx.fill();
  ctx.restore();

  if (art.variant === 'companion') {
    const x = cx + R * 0.95;
    const y = cy - R * 0.35;
    const g = ctx.createRadialGradient(x, y, 0, x, y, R * 0.3);
    g.addColorStop(0, 'rgba(255,240,215,0.95)');
    g.addColorStop(0.3, 'rgba(255,214,170,0.45)');
    g.addColorStop(1, 'rgba(255,214,170,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, R * 0.3, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalCompositeOperation = 'source-over';
}

function sphere(ctx, x, y, r, base, lightDir, { bands = 0, rand, atmosphere, noiseSeed } = {}) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.clip();
  ctx.fillStyle = base;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  if (bands) {
    for (let i = 0; i < bands; i++) {
      const by = y - r + (i / bands) * r * 2 + (rand() - 0.5) * 4;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(255,230,190,0.18)' : 'rgba(80,30,10,0.22)';
      ctx.fillRect(x - r, by, r * 2, (r * 2) / bands * (0.4 + rand() * 0.6));
    }
  }
  if (noiseSeed) {
    const n = createNoise3D(noiseSeed);
    for (let i = 0; i < 260; i++) {
      const a = rand() * TAU;
      const d = Math.sqrt(rand()) * r;
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d;
      const v = n(px * 0.02, py * 0.02, 0.5);
      ctx.fillStyle = v > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.arc(px, py, r * (0.04 + rand() * 0.1), 0, TAU);
      ctx.fill();
    }
  }
  // Day/night terminator along the light direction, plus limb darkening.
  const shade = ctx.createLinearGradient(
    x + lightDir[0] * r,
    y + lightDir[1] * r,
    x - lightDir[0] * r,
    y - lightDir[1] * r,
  );
  shade.addColorStop(0, 'rgba(255,255,255,0.14)');
  shade.addColorStop(0.42, 'rgba(0,0,0,0)');
  shade.addColorStop(0.62, 'rgba(0,0,0,0.65)');
  shade.addColorStop(1, 'rgba(0,0,0,0.96)');
  ctx.fillStyle = shade;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  const limb = ctx.createRadialGradient(x, y, r * 0.55, x, y, r);
  limb.addColorStop(0, 'rgba(0,0,0,0)');
  limb.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = limb;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  if (atmosphere) {
    ctx.save();
    ctx.strokeStyle = rgba(atmosphere, 0.55);
    ctx.lineWidth = Math.max(1, r * 0.05);
    ctx.shadowColor = atmosphere;
    ctx.shadowBlur = r * 0.25;
    ctx.beginPath();
    const start = Math.atan2(lightDir[1], lightDir[0]);
    ctx.arc(x, y, r, start - 1.3, start + 1.3);
    ctx.stroke();
    ctx.restore();
  }
}

function exoplanet(ctx, w, h, art, rand) {
  background(ctx, w, h, rand, '#0a0b18');
  const [starColor, planetColor, accent] = art.palette;

  if (art.variant === 'system') {
    const sx = -w * 0.04;
    const sy = h * 0.5;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.75);
    g.addColorStop(0, '#fff3e6');
    g.addColorStop(0.12, rgba(starColor, 0.95));
    g.addColorStop(0.4, rgba(starColor, 0.25));
    g.addColorStop(1, rgba(starColor, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const sizes = [0.075, 0.08, 0.055, 0.064, 0.074, 0.082, 0.052];
    sizes.forEach((s, i) => {
      const x = w * (0.2 + i * 0.118);
      const y = h * (0.5 + Math.sin(i * 1.7) * 0.1);
      const colors = [planetColor, accent, '#9c8b7a', '#7f95a8', '#a68f7c', '#8aa0b5', '#b9a48e'];
      sphere(ctx, x, y, h * s, colors[i], [-1, 0], { rand, noiseSeed: art.seed + i });
    });
    return;
  }

  // Star glow in the corner
  const sx = w * 0.88;
  const sy = h * 0.16;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.9);
  sg.addColorStop(0, '#ffffff');
  sg.addColorStop(0.05, rgba(starColor, 1));
  sg.addColorStop(0.25, rgba(starColor, 0.3));
  sg.addColorStop(1, rgba(starColor, 0));
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, w, h);

  const px = w * 0.38;
  const py = h * 0.62;
  const pr = Math.min(w, h) * (art.variant === 'hot-jupiter' ? 0.32 : 0.28);
  const dx = sx - px;
  const dy = sy - py;
  const d = Math.hypot(dx, dy);
  const light = [dx / d, dy / d];
  if (art.variant === 'hot-jupiter') {
    sphere(ctx, px, py, pr, planetColor, light, { bands: 14, rand, atmosphere: starColor });
    // Glowing heated day side
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const hg = ctx.createRadialGradient(px + light[0] * pr * 0.6, py + light[1] * pr * 0.6, 0, px, py, pr);
    hg.addColorStop(0, rgba(accent, 0.35));
    hg.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, TAU);
    ctx.fill();
    ctx.restore();
  } else {
    sphere(ctx, px, py, pr, planetColor, light, { rand, atmosphere: accent, noiseSeed: art.seed });
  }
}

function supernova(ctx, w, h, art, rand) {
  background(ctx, w, h, rand, '#090a17');
  const [c1, c2, c3] = art.palette;
  const cx = w * 0.5;
  const cy = h * 0.52;
  const R = Math.min(w, h) * 0.36;
  const n = createNoise3D(art.seed);
  ctx.globalCompositeOperation = 'lighter';

  if (art.variant === 'ring') {
    // SN 1987A: inner ring with bright hotspots plus two faint outer rings.
    const drawRing = (rx, ry, oy, alpha, color, width) => {
      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.ellipse(cx, cy + oy, rx, ry, -0.2, 0, TAU);
      ctx.stroke();
    };
    drawRing(R * 1.05, R * 0.48, -R * 0.42, 0.25, c3, 2);
    drawRing(R * 1.05, R * 0.48, R * 0.42, 0.25, c3, 2);
    drawRing(R * 0.6, R * 0.32, 0, 0.5, c2, R * 0.05);
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU + rand() * 0.1;
      const x = cx + Math.cos(a) * R * 0.6 * Math.cos(-0.2) - Math.sin(a) * R * 0.32 * Math.sin(-0.2);
      const y = cy + Math.cos(a) * R * 0.6 * Math.sin(-0.2) + Math.sin(a) * R * 0.32 * Math.cos(-0.2);
      brightStar(ctx, x, y, 1 + rand() * 1.4, c1, false);
    }
    const ej = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.22);
    ej.addColorStop(0, rgba(c2, 0.8));
    ej.addColorStop(1, rgba(c2, 0));
    ctx.fillStyle = ej;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 0.22, R * 0.16, 0.6, 0, TAU);
    ctx.fill();
  } else {
    // Filamentary expanding shell
    const filaments = Math.round(Math.min(5200, w * h * 0.016));
    const colors = [c1, c2, c3];
    for (let i = 0; i < filaments; i++) {
      const a = rand() * TAU;
      const shellNoise = n(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0.3);
      let r;
      if (art.variant === 'filaments') r = R * Math.sqrt(rand()) * (0.75 + shellNoise * 0.3);
      else r = R * (0.68 + shellNoise * 0.16 + gaussian(rand) * 0.13);
      const x = cx + Math.cos(a) * r * 1.12;
      const y = cy + Math.sin(a) * r * 0.92;
      const len = 2 + rand() * 7;
      const ang = a + (rand() - 0.5) * 1.2;
      const color = colors[Math.floor(rand() * 3)];
      ctx.strokeStyle = rgba(color, 0.12 + rand() * 0.25);
      ctx.lineWidth = 0.6 + rand();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    if (art.variant === 'filaments') {
      const sync = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.8);
      sync.addColorStop(0, rgba(c1, 0.35));
      sync.addColorStop(1, rgba(c1, 0));
      ctx.fillStyle = sync;
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 0.9, R * 0.7, 0.2, 0, TAU);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  brightStar(ctx, cx, cy, Math.max(1.6, R * 0.03), c1, true);
}

function neutronStar(ctx, w, h, art, rand) {
  background(ctx, w, h, rand, '#080a18');
  const [c1, c2, c3] = art.palette;
  const cx = w * 0.5;
  const cy = h * 0.52;
  const S = Math.min(w, h);

  if (art.variant === 'merger') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i <= 9; i++) {
      ctx.strokeStyle = rgba(c2, 0.32 - i * 0.03);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(cx, cy, S * 0.06 * i, S * 0.03 * i, 0, 0, TAU);
      ctx.stroke();
    }
    const kn = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.22);
    kn.addColorStop(0, rgba(c1, 0.75));
    kn.addColorStop(0.4, rgba(c3, 0.25));
    kn.addColorStop(1, rgba(c3, 0));
    ctx.fillStyle = kn;
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.22, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    brightStar(ctx, cx - S * 0.045, cy + S * 0.01, S * 0.012, c2, true);
    brightStar(ctx, cx + S * 0.045, cy - S * 0.01, S * 0.012, c2, true);
    return;
  }

  const tilt = art.variant === 'magnetar' ? 0.25 : -0.45;
  // Radiation beams along the magnetic axis
  if (art.variant === 'pulsar') {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.globalCompositeOperation = 'lighter';
    for (const dir of [-1, 1]) {
      const g = ctx.createLinearGradient(0, 0, 0, dir * -h);
      g.addColorStop(0, rgba(c2, 0.75));
      g.addColorStop(1, rgba(c2, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-S * 0.12, dir * -h);
      ctx.lineTo(S * 0.12, dir * -h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Dipole magnetic field lines
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt + Math.PI / 2);
  ctx.globalCompositeOperation = 'lighter';
  const loops = art.variant === 'magnetar' ? 9 : 6;
  for (let i = 1; i <= loops; i++) {
    const L = S * 0.07 * i;
    ctx.strokeStyle = rgba(art.variant === 'magnetar' ? c2 : c3, 0.5 - i * 0.04);
    ctx.lineWidth = art.variant === 'magnetar' ? 1.6 : 1.1;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let t = -Math.PI / 2 + 0.15; t <= Math.PI / 2 - 0.15; t += 0.05) {
        // r = L cos²(latitude) for a dipole field line
        const r = L * Math.cos(t) ** 2;
        const x = side * r * Math.cos(t);
        const y = r * Math.sin(t);
        if (t === -Math.PI / 2 + 0.15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  ctx.restore();

  if (art.variant === 'magnetar') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const a = rand() * TAU;
      const len = S * (0.15 + rand() * 0.3);
      ctx.strokeStyle = rgba(c1, 0.12 + rand() * 0.2);
      ctx.lineWidth = 1 + rand() * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  brightStar(ctx, cx, cy, S * 0.016, c1, true);
}

const KINDS = { blackhole: blackHole, nebula, galaxy, exoplanet, supernova, neutron: neutronStar };

const cache = new Map();

/** Returns a cached canvas with the illustration rendered at w×h. */
export function renderIllustration(art, w, h) {
  const key = `${art.kind}:${art.seed}:${art.variant}:${w}x${h}`;
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const draw = KINDS[art.kind];
  const rand = mulberry32(art.seed * 7919 + 13);
  if (draw) draw(ctx, w, h, art, rand);
  else background(ctx, w, h, rand);
  cache.set(key, canvas);
  return canvas;
}
