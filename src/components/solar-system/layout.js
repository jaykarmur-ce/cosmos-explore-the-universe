/**
 * Scene scaling for the compact solar-system model.
 *
 * Real proportions are impossible to show on one screen (Neptune orbits
 * ~4.5 billion km out, while Earth is 12,756 km wide), so the explorer uses
 * two explicit, clearly-labelled compressions:
 *
 *   Planet radius   r = 0.18 · √(diameter in thousands of km)   (square-root scale)
 *   Orbit radius    d = 9 + 16 · (distance in AU)^0.55           (power-law compression)
 *   Sun radius      fixed at 4.6 units (shown far smaller than true scale)
 *   Moon            true size ratio to Earth (0.27), orbit distance compressed
 *
 * Angular positions are real: each planet sits at its approximate mean
 * heliocentric longitude for the simulated date (circular, coplanar orbits).
 */
import * as THREE from 'three';
import { PLANETS, SUN, MOON, getBody } from '../../data/planets.js';
import { meanLongitudeRad } from '../../utils/astro.js';

export const SUN_RADIUS = 4.6;

export const SCALE_NOTES = {
  sizes: 'Planet sizes use a square-root scale; the Sun is shown much smaller than its true size.',
  distances: 'Orbital distances are compressed with a power law (≈ distance^0.55).',
  angles: 'Planet positions follow their mean longitudes for the simulated date, on circular, coplanar orbits.',
};

export function planetRadius(diameterKm) {
  return 0.18 * Math.sqrt(diameterKm / 1000);
}

export function orbitRadius(distanceMkm) {
  const au = distanceMkm / 149.6;
  return 9 + 16 * au ** 0.55;
}

export const LAYOUT = Object.fromEntries([
  [SUN.id, { radius: SUN_RADIUS, orbit: 0 }],
  ...PLANETS.map((p) => [p.id, { radius: planetRadius(p.stats.diameterKm), orbit: orbitRadius(p.stats.distanceMkm) }]),
]);

const EARTH_LAYOUT = LAYOUT.earth;
export const MOON_LAYOUT = {
  radius: EARTH_LAYOUT.radius * (MOON.diameterKm / 12756),
  orbit: EARTH_LAYOUT.radius * 2.3,
};

export const ASTEROID_BELT = { inner: orbitRadius(2.2 * 149.6), outer: orbitRadius(3.2 * 149.6) };

/** Writes the body's scene position for `days` (since J2000) into `out`. */
export function getBodyPosition(id, days, out = new THREE.Vector3()) {
  if (id === 'sun') return out.set(0, 0, 0);
  const body = getBody(id);
  if (!body) return out.set(0, 0, 0);
  const r = LAYOUT[id].orbit;
  const angle = meanLongitudeRad(body, days);
  // Counter-clockwise when viewed from the north ecliptic pole (+Y).
  return out.set(r * Math.cos(angle), 0, -r * Math.sin(angle));
}

/** Moon offset from Earth (visual only). */
export function getMoonOffset(days, out = new THREE.Vector3()) {
  const angle = (days / MOON.orbitalPeriodDays) * Math.PI * 2;
  return out.set(MOON_LAYOUT.orbit * Math.cos(angle), 0, -MOON_LAYOUT.orbit * Math.sin(angle));
}

/** Camera distance used when focusing a body. */
export function focusDistance(id) {
  const { radius } = LAYOUT[id] ?? { radius: 1 };
  if (id === 'sun') return 34;
  const visual = getBody(id)?.visual;
  const extent = visual?.rings ? radius * visual.rings.outer : radius;
  return Math.max(4.2, extent * 6 + 2);
}

/** Planet ids in display order (Sun first). */
export const BODY_IDS = [SUN.id, ...PLANETS.map((p) => p.id)];
