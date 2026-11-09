/** Lightweight astronomy helpers. */

export const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
export const MS_PER_DAY = 86_400_000;
export const SPEED_OF_LIGHT_KMS = 299_792.458;
export const EARTH_GRAVITY = 9.8; // m/s², NASA fact-sheet value used for ratios

export function daysSinceJ2000(ms = Date.now()) {
  return (ms - J2000_MS) / MS_PER_DAY;
}

export function dateFromJ2000Days(days) {
  return new Date(J2000_MS + days * MS_PER_DAY);
}

/**
 * Mean heliocentric longitude (radians) for a planet at `days` after J2000,
 * from the JPL approximate-elements table. Treats the orbit as circular, so
 * the actual position can differ by several degrees for eccentric orbits.
 */
export function meanLongitudeRad(planet, days) {
  if (planet.meanLongitudeJ2000Deg == null) return 0;
  const centuries = days / 36525;
  const deg = planet.meanLongitudeJ2000Deg + planet.meanMotionDegPerCentury * centuries;
  return ((deg % 360) * Math.PI) / 180;
}

/** Minutes for light to travel the given distance in million km. */
export function lightTravelMinutes(distanceMkm) {
  if (distanceMkm == null) return null;
  return (distanceMkm * 1e6) / SPEED_OF_LIGHT_KMS / 60;
}

export function relativeGravity(gravityMs2) {
  return gravityMs2 / EARTH_GRAVITY;
}
