/**
 * Procedural surface maps for every body in COSMOS.
 *
 * Each generator samples 3D noise on the unit sphere, so the resulting
 * equirectangular maps wrap seamlessly and do not pinch at the poles.
 * Pure functions only: this module runs inside Web Workers.
 *
 * Output layout: row 0 = north pole (standard image orientation), RGBA bytes.
 */
import { createNoise3D, fbm3, ridged3, clamp, lerp, smoothstep } from '../noise.js';

const HALF_PI = Math.PI / 2;

// ── helpers ──────────────────────────────────────────────────────────────

function mix3(out, a, b, t) {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
  return out;
}

/** Sample a list of [position, [r,g,b]] stops (positions ascending). */
function sampleStops(stops, x, out) {
  if (x <= stops[0][0]) {
    out[0] = stops[0][1][0]; out[1] = stops[0][1][1]; out[2] = stops[0][1][2];
    return out;
  }
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i][0]) {
      const [p0, c0] = stops[i - 1];
      const [p1, c1] = stops[i];
      const t = (x - p0) / (p1 - p0);
      const s = t * t * (3 - 2 * t);
      return mix3(out, c0, c1, s);
    }
  }
  const last = stops[stops.length - 1][1];
  out[0] = last[0]; out[1] = last[1]; out[2] = last[2];
  return out;
}

function hash3(ix, iy, iz, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(iz, 2147483647) ^ Math.imul(seed, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Crater field built from 3D cellular noise. Returns a height offset:
 * negative in bowls, positive on rims.
 */
function craters(px, py, pz, scale, seed, density = 0.55, minR = 0.12, maxR = 0.42) {
  const sx = px * scale;
  const sy = py * scale;
  const sz = pz * scale;
  const ix = Math.floor(sx);
  const iy = Math.floor(sy);
  const iz = Math.floor(sz);
  let total = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        const cx = ix + dx;
        const cy = iy + dy;
        const cz = iz + dz;
        const h = hash3(cx, cy, cz, seed);
        if ((h & 1023) / 1023 > density) continue;
        const fx = cx + ((h >>> 10) & 255) / 255;
        const fy = cy + ((h >>> 18) & 255) / 255;
        const fz = cz + (hash3(cz, cx, cy, seed + 7) & 255) / 255;
        const r = minR + (((h >>> 26) & 63) / 63) ** 2 * (maxR - minR);
        const ddx = sx - fx;
        const ddy = sy - fy;
        const ddz = sz - fz;
        const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);
        const t = d / r;
        if (t > 1.8) continue;
        const bowl = t < 1 ? -(1 - t * t) * 0.85 : 0;
        const rimT = (t - 1) / 0.17;
        const rim = 0.42 * Math.exp(-rimT * rimT);
        total += (bowl + rim) * (0.6 + r);
      }
    }
  }
  return total;
}

function warpVec(noise, px, py, pz, freq, octaves) {
  return [
    fbm3(noise, px * freq + 5.2, py * freq + 1.3, pz * freq, octaves),
    fbm3(noise, px * freq + 1.7, py * freq + 9.2, pz * freq + 3.1, octaves),
    fbm3(noise, px * freq - 4.1, py * freq + 2.8, pz * freq + 7.7, octaves),
  ];
}

function angularDistance(lat1, lon1, lat2, lon2) {
  let dLon = lon1 - lon2;
  if (dLon > Math.PI) dLon -= 2 * Math.PI;
  if (dLon < -Math.PI) dLon += 2 * Math.PI;
  return [dLon * Math.cos(lat2), lat1 - lat2];
}

// ── generators ───────────────────────────────────────────────────────────
// sample(px, py, pz, lat, lon, out) writes out[0..2] = rgb (0..255),
// out[3] = alpha (0..255), out[4] = height (0..1, for bump maps).

const GENERATORS = {
  sun: {
    bump: false,
    create(seed) {
      const n = createNoise3D(seed);
      const n2 = createNoise3D(seed + 3);
      const deep = [196, 64, 6];
      const mid = [255, 150, 36];
      const hot = [255, 236, 170];
      const tmp = [0, 0, 0];
      return (px, py, pz, lat, lon, out) => {
        const large = fbm3(n, px * 3, py * 3, pz * 3, 4);
        const cell = 1 - Math.abs(n2(px * 46, py * 46, pz * 46));
        const fine = 1 - Math.abs(n2(px * 110 + 3, py * 110, pz * 110));
        let v = 0.55 + large * 0.28 + (cell * cell - 0.5) * 0.26 + (fine - 0.5) * 0.1;
        // Sunspots in the active latitudes.
        const activeBand = smoothstep(0.75, 0.25, Math.abs(Math.abs(lat) - 0.3) / 0.35);
        const spot = fbm3(n, px * 7 + 11, py * 7, pz * 7 - 4, 3);
        const umbra = smoothstep(0.58, 0.64, spot) * activeBand;
        const penumbra = smoothstep(0.5, 0.58, spot) * activeBand;
        v = clamp(v - penumbra * 0.25);
        if (v < 0.5) mix3(tmp, deep, mid, v / 0.5);
        else mix3(tmp, mid, hot, (v - 0.5) / 0.5);
        mix3(out, tmp, [70, 20, 4], umbra * 0.85);
        out[3] = 255;
        out[4] = v;
      };
    },
  },

  mercury: {
    bump: true,
    create(seed) {
      const n = createNoise3D(seed);
      const n2 = createNoise3D(seed + 9);
      return (px, py, pz, lat, lon, out) => {
        const base = fbm3(n, px * 2.2, py * 2.2, pz * 2.2, 5);
        const detail = fbm3(n2, px * 12, py * 12, pz * 12, 3);
        const c1 = craters(px, py, pz, 5, seed + 1, 0.5, 0.15, 0.45);
        const c2 = craters(px, py, pz, 14, seed + 2, 0.55, 0.12, 0.4);
        const c3 = craters(px, py, pz, 34, seed + 3, 0.6, 0.1, 0.38);
        const h = clamp(0.5 + base * 0.18 + c1 * 0.22 + c2 * 0.12 + c3 * 0.06 + detail * 0.05);
        const g = 118 + base * 46 + detail * 18 + (c1 + c2 * 0.6) * 22;
        out[0] = g * 1.04 + 4;
        out[1] = g * 0.99;
        out[2] = g * 0.93;
        out[3] = 255;
        out[4] = h;
      };
    },
  },

  venus: {
    bump: false,
    create(seed) {
      const n = createNoise3D(seed);
      const n2 = createNoise3D(seed + 5);
      const stops = [
        [0, [150, 98, 48]],
        [0.35, [196, 146, 82]],
        [0.6, [226, 190, 128]],
        [0.85, [242, 220, 168]],
        [1, [250, 236, 200]],
      ];
      return (px, py, pz, lat, lon, out) => {
        const w = warpVec(n2, px, py, pz, 1.4, 3);
        const swirl = fbm3(n, px * 1.6 + w[0] * 1.2, py * 4.5 + w[1] * 0.8, pz * 1.6 + w[2] * 1.2, 6);
        const band = Math.sin(lat * 7 + swirl * 4) * 0.12;
        const v = clamp(0.58 + swirl * 0.45 + band);
        sampleStops(stops, v, out);
        out[3] = 255;
        out[4] = v;
      };
    },
  },

  earth: {
    bump: true,
    create(seed) {
      const n = createNoise3D(seed);
      const nw = createNoise3D(seed + 1);
      const nm = createNoise3D(seed + 2);
      const deep = [5, 20, 48];
      const ocean = [10, 40, 86];
      const shallow = [26, 96, 132];
      const forest = [34, 66, 34];
      const grass = [78, 98, 50];
      const savanna = [140, 126, 80];
      const desert = [196, 166, 118];
      const tundra = [112, 108, 92];
      const rock = [104, 92, 80];
      const ice = [234, 240, 246];
      const tmp = [0, 0, 0];
      const tmp2 = [0, 0, 0];
      const SEA = 0.1;
      return (px, py, pz, lat, lon, out) => {
        const w = warpVec(nw, px, py, pz, 1.0, 3);
        const h = fbm3(n, px * 0.95 + w[0] * 0.42, py * 0.95 + w[1] * 0.42, pz * 0.95 + w[2] * 0.42, 7);
        const absLat = Math.abs(lat) / HALF_PI;
        const iceEdge = 0.835 + fbm3(nm, px * 4, py * 4, pz * 4, 3) * 0.08;
        let height;
        if (h < SEA) {
          const coast = smoothstep(SEA, SEA - 0.06, h);
          const depth = smoothstep(SEA - 0.04, SEA - 0.45, h);
          mix3(out, shallow, ocean, coast);
          mix3(out, out, deep, depth * 0.85);
          height = 0.42 - depth * 0.08;
        } else {
          const e = clamp((h - SEA) / 0.4);
          const moisture = fbm3(nm, px * 1.8, py * 1.8, pz * 1.8, 4) * 0.5 + 0.5;
          const dryBand = Math.exp(-(((absLat - 0.26) / 0.1) ** 2));
          const aridity = clamp(dryBand * 0.95 + (0.5 - moisture) * 1.3 - 0.12);
          // Vegetation from wet → dry
          if (aridity < 0.33) mix3(tmp, forest, grass, aridity / 0.33);
          else if (aridity < 0.66) mix3(tmp, grass, savanna, (aridity - 0.33) / 0.33);
          else mix3(tmp, savanna, desert, (aridity - 0.66) / 0.34);
          // Colder lands become tundra
          const cold = smoothstep(0.55, 0.78, absLat + e * 0.15);
          mix3(tmp2, tmp, tundra, cold);
          // Mountains
          const ridge = ridged3(n, px * 4.5, py * 4.5, pz * 4.5, 4);
          const mountain = smoothstep(0.25, 0.75, e) * ridge;
          mix3(out, tmp2, rock, clamp(mountain * 1.1));
          // Snow on high peaks
          const snow = smoothstep(0.72, 0.9, mountain + absLat * 0.25);
          mix3(out, out, ice, snow * 0.85);
          height = 0.5 + e * 0.35 + mountain * 0.25;
        }
        // Polar ice
        const polar = smoothstep(iceEdge - 0.03, iceEdge + 0.02, absLat);
        if (polar > 0) {
          mix3(out, out, ice, polar);
          height = Math.max(height, 0.5 + polar * 0.1);
        }
        out[3] = 255;
        out[4] = clamp(height);
      };
    },
  },

  'earth-clouds': {
    bump: false,
    alpha: true,
    create(seed) {
      const n = createNoise3D(seed);
      const nw = createNoise3D(seed + 4);
      return (px, py, pz, lat, lon, out) => {
        const w = warpVec(nw, px, py, pz, 1.2, 3);
        const c = fbm3(n, px * 1.7 + w[0] * 0.7, py * 2.8 + w[1] * 0.5, pz * 1.7 + w[2] * 0.7, 6);
        const fine = fbm3(n, px * 4, py * 18, pz * 4, 3);
        const absLatDeg = (Math.abs(lat) * 180) / Math.PI;
        // Cloud belts: ITCZ near the equator and mid-latitude storm tracks;
        // clearer skies over the subtropics.
        const belt =
          0.55 * Math.exp(-(((absLatDeg - 4) / 9) ** 2)) +
          0.6 * Math.exp(-(((absLatDeg - 55) / 14) ** 2)) -
          0.35 * Math.exp(-(((absLatDeg - 25) / 9) ** 2));
        const cover = smoothstep(0.1, 0.5, c + belt * 0.28 + fine * 0.14);
        out[0] = 255;
        out[1] = 255;
        out[2] = 255;
        out[3] = cover * cover * 225;
        out[4] = cover;
      };
    },
  },

  moon: {
    bump: true,
    create(seed) {
      const n = createNoise3D(seed);
      return (px, py, pz, lat, lon, out) => {
        const maria = smoothstep(0.05, 0.3, fbm3(n, px * 1.4, py * 1.4, pz * 1.4, 5));
        const detail = fbm3(n, px * 10, py * 10, pz * 10, 3);
        const c1 = craters(px, py, pz, 6, seed + 3, 0.45, 0.15, 0.45);
        const c2 = craters(px, py, pz, 18, seed + 4, 0.55, 0.12, 0.38);
        const g = lerp(168, 112, maria) + detail * 14 + c1 * 16 + c2 * 9;
        out[0] = g;
        out[1] = g * 0.99;
        out[2] = g * 0.96;
        out[3] = 255;
        out[4] = clamp(0.5 - maria * 0.1 + c1 * 0.25 + c2 * 0.12 + detail * 0.04);
      };
    },
  },

  mars: {
    bump: true,
    create(seed) {
      const n = createNoise3D(seed);
      const nw = createNoise3D(seed + 6);
      const nd = createNoise3D(seed + 8);
      const dark = [116, 62, 42];
      const base = [182, 104, 66];
      const light = [204, 136, 92];
      const dust = [218, 162, 120];
      const cap = [238, 232, 226];
      const tmp = [0, 0, 0];
      return (px, py, pz, lat, lon, out) => {
        const w = warpVec(nw, px, py, pz, 1.1, 3);
        const albedo = fbm3(n, px * 1.4 + w[0] * 0.3, py * 1.4 + w[1] * 0.3, pz * 1.4 + w[2] * 0.3, 6);
        const detail = fbm3(nd, px * 9, py * 9, pz * 9, 3);
        if (albedo > 0.1) mix3(tmp, base, dark, smoothstep(0.1, 0.45, albedo) * 0.85);
        else mix3(tmp, light, base, smoothstep(-0.4, 0.1, albedo));
        mix3(out, tmp, dust, smoothstep(-0.25, -0.6, albedo + detail * 0.2) * 0.5);
        const c1 = craters(px, py, pz, 7, seed + 2, 0.4, 0.14, 0.4);
        const c2 = craters(px, py, pz, 20, seed + 5, 0.5, 0.12, 0.35);
        const shade = 1 + c1 * 0.08 + c2 * 0.05 + detail * 0.06;
        out[0] *= shade; out[1] *= shade; out[2] *= shade;
        // Polar caps (larger in the south, as seen in summer imagery)
        const absLat = Math.abs(lat) / HALF_PI;
        const edge = (lat > 0 ? 0.86 : 0.83) + fbm3(nd, px * 5, py * 5, pz * 5, 3) * 0.05;
        const polar = smoothstep(edge - 0.02, edge + 0.02, absLat);
        mix3(out, out, cap, polar);
        out[3] = 255;
        out[4] = clamp(0.5 + albedo * 0.15 + c1 * 0.2 + c2 * 0.1 + detail * 0.06 + polar * 0.05);
      };
    },
  },

  jupiter: {
    bump: false,
    create(seed) {
      const n = createNoise3D(seed);
      const n2 = createNoise3D(seed + 2);
      const n3 = createNoise3D(seed + 4);
      const stops = [
        [-90, [112, 104, 98]],
        [-62, [146, 132, 114]],
        [-48, [188, 168, 140]],
        [-38, [214, 196, 166]],
        [-30, [176, 136, 98]],
        [-24, [226, 212, 186]],
        [-18, [160, 104, 70]],
        [-10, [196, 146, 102]],
        [-4, [236, 222, 196]],
        [3, [232, 214, 184]],
        [8, [170, 110, 72]],
        [15, [154, 100, 66]],
        [20, [226, 212, 188]],
        [27, [182, 142, 104]],
        [34, [216, 198, 168]],
        [46, [180, 160, 132]],
        [62, [142, 128, 112]],
        [90, [110, 102, 96]],
      ];
      const grsLat = (-22 * Math.PI) / 180;
      const grsLon = 1.1;
      const grsColor = [196, 96, 64];
      const grsCore = [214, 132, 92];
      return (px, py, pz, lat, lon, out) => {
        const turb = fbm3(n, px * 3.2, py * 9, pz * 3.2, 5);
        const eddy = fbm3(n2, px * 7 + turb * 2.2, py * 20, pz * 7 + turb * 2.2, 4);
        const latDeg = (lat * 180) / Math.PI + turb * 3.4 + eddy * 1.8;
        sampleStops(stops, latDeg, out);
        const streak = fbm3(n3, px * 2.5, py * 55, pz * 2.5, 3);
        const k = 1 + streak * 0.1 + eddy * 0.08;
        out[0] *= k; out[1] *= k; out[2] *= k;
        // Great Red Spot
        const [dx, dy] = angularDistance(lat, lon, grsLat, grsLon);
        const e = (dx / 0.19) ** 2 + (dy / 0.085) ** 2;
        if (e < 1.6) {
          const ring = 0.5 + 0.5 * Math.sin(Math.sqrt(e) * 14 + eddy * 4);
          const core = smoothstep(1.0, 0.0, e);
          const tmp = [0, 0, 0];
          mix3(tmp, grsColor, grsCore, ring * 0.6);
          mix3(out, out, tmp, smoothstep(1.6, 0.85, e) * (0.75 + core * 0.25));
        }
        out[3] = 255;
        out[4] = 0.5;
      };
    },
  },

  saturn: {
    bump: false,
    create(seed) {
      const n = createNoise3D(seed);
      const n2 = createNoise3D(seed + 3);
      const stops = [
        [-90, [150, 140, 118]],
        [-70, [176, 160, 126]],
        [-55, [206, 186, 142]],
        [-40, [196, 170, 124]],
        [-28, [222, 202, 156]],
        [-18, [200, 172, 122]],
        [-8, [232, 214, 170]],
        [0, [238, 222, 180]],
        [8, [230, 210, 164]],
        [18, [204, 176, 126]],
        [28, [224, 204, 158]],
        [40, [194, 168, 124]],
        [55, [190, 176, 146]],
        [72, [150, 158, 160]],
        [90, [120, 132, 140]],
      ];
      return (px, py, pz, lat, lon, out) => {
        const turb = fbm3(n, px * 3, py * 12, pz * 3, 4);
        const latDeg = (lat * 180) / Math.PI + turb * 1.6;
        sampleStops(stops, latDeg, out);
        const streak = fbm3(n2, px * 2, py * 60, pz * 2, 3);
        const k = 1 + streak * 0.06;
        out[0] *= k; out[1] *= k; out[2] *= k;
        out[3] = 255;
        out[4] = 0.5;
      };
    },
  },

  uranus: {
    bump: false,
    create(seed) {
      const n = createNoise3D(seed);
      return (px, py, pz, lat, lon, out) => {
        const latDeg = (lat * 180) / Math.PI;
        const band = Math.sin(latDeg * 0.22 + fbm3(n, px * 3, py * 10, pz * 3, 3) * 0.6) * 0.5 + 0.5;
        const polar = smoothstep(45, 85, Math.abs(latDeg));
        const v = 0.5 + band * 0.08 + polar * 0.18;
        out[0] = 150 + v * 42;
        out[1] = 205 + v * 30;
        out[2] = 212 + v * 26;
        out[3] = 255;
        out[4] = 0.5;
      };
    },
  },

  neptune: {
    bump: false,
    create(seed) {
      const n = createNoise3D(seed);
      const n2 = createNoise3D(seed + 7);
      const stops = [
        [-90, [36, 62, 160]],
        [-60, [44, 76, 186]],
        [-40, [38, 66, 172]],
        [-25, [52, 92, 206]],
        [-10, [62, 108, 222]],
        [0, [70, 118, 228]],
        [12, [60, 104, 218]],
        [28, [46, 82, 194]],
        [50, [40, 70, 178]],
        [90, [34, 60, 156]],
      ];
      const gdsLat = (-20 * Math.PI) / 180;
      const gdsLon = -0.8;
      return (px, py, pz, lat, lon, out) => {
        const turb = fbm3(n, px * 3, py * 10, pz * 3, 4);
        const latDeg = (lat * 180) / Math.PI + turb * 3;
        sampleStops(stops, latDeg, out);
        // Bright methane-ice cirrus streaks
        const cirrus = fbm3(n2, px * 2 + turb, py * 16, pz * 2 + turb, 4);
        const streak = smoothstep(0.36, 0.62, cirrus);
        mix3(out, out, [214, 228, 255], streak * 0.6);
        // Great Dark Spot (as imaged by Voyager 2 in 1989)
        const [dx, dy] = angularDistance(lat, lon, gdsLat, gdsLon);
        const e = (dx / 0.2) ** 2 + (dy / 0.09) ** 2;
        if (e < 1.4) mix3(out, out, [22, 34, 104], smoothstep(1.4, 0.6, e) * 0.85);
        const e2 = ((dx + 0.02) / 0.12) ** 2 + ((dy + 0.1) / 0.03) ** 2;
        if (e2 < 1) mix3(out, out, [236, 242, 255], smoothstep(1, 0.2, e2) * 0.8);
        out[3] = 255;
        out[4] = 0.5;
      };
    },
  },
};

const SEEDS = {
  sun: 1361, mercury: 4879, venus: 12104, earth: 1975, 'earth-clouds': 2024,
  moon: 3474, mars: 6792, jupiter: 1430, saturn: 1205, uranus: 511, neptune: 495,
};

export const SURFACE_IDS = Object.keys(GENERATORS);

export function surfaceHasBump(id) {
  return Boolean(GENERATORS[id]?.bump);
}

/**
 * Generate an equirectangular surface map.
 * @returns {{ width:number, height:number, color:Uint8ClampedArray, bump:Uint8ClampedArray|null }}
 */
export function generateSurface(id, width = 1024) {
  const gen = GENERATORS[id];
  if (!gen) throw new Error(`Unknown surface "${id}"`);
  const height = Math.max(2, Math.round(width / 2));
  const sample = gen.create(SEEDS[id] ?? 1);
  const color = new Uint8ClampedArray(width * height * 4);
  const bump = gen.bump ? new Uint8ClampedArray(width * height * 4) : null;
  const out = [0, 0, 0, 255, 0.5];
  const cosLon = new Float32Array(width);
  const sinLon = new Float32Array(width);
  const lons = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    const lon = ((x + 0.5) / width) * Math.PI * 2 - Math.PI;
    lons[x] = lon;
    cosLon[x] = Math.cos(lon);
    sinLon[x] = Math.sin(lon);
  }
  for (let y = 0; y < height; y++) {
    const lat = HALF_PI - ((y + 0.5) / height) * Math.PI;
    const cosLat = Math.cos(lat);
    const py = Math.sin(lat);
    for (let x = 0; x < width; x++) {
      const px = cosLat * cosLon[x];
      const pz = -cosLat * sinLon[x];
      out[3] = 255;
      sample(px, py, pz, lat, lons[x], out);
      const i = (y * width + x) * 4;
      color[i] = out[0];
      color[i + 1] = out[1];
      color[i + 2] = out[2];
      color[i + 3] = out[3];
      if (bump) {
        const b = clamp(out[4]) * 255;
        bump[i] = b;
        bump[i + 1] = b;
        bump[i + 2] = b;
        bump[i + 3] = 255;
      }
    }
  }
  return { width, height, color, bump };
}
