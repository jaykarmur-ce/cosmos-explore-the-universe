import { daysSinceJ2000, dateFromJ2000Days } from '../../utils/astro.js';

/**
 * Mutable simulation clock shared by the scene and the HUD.
 * It lives outside React state so advancing time never re-renders React;
 * the scene reads it inside useFrame and the HUD polls it.
 */
export function createSimClock({ daysPerSecond = 10, paused = false } = {}) {
  return {
    baseDays: daysSinceJ2000(Date.now()),
    elapsedDays: 0,
    daysPerSecond,
    paused,
    get days() {
      return this.baseDays + this.elapsedDays;
    },
    get date() {
      return dateFromJ2000Days(this.days);
    },
    advance(seconds) {
      if (!this.paused) this.elapsedDays += seconds * this.daysPerSecond;
    },
    resetToNow() {
      this.baseDays = daysSinceJ2000(Date.now());
      this.elapsedDays = 0;
    },
  };
}
