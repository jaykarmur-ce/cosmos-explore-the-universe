/**
 * Comparison calculations. Every result is derived from the local dataset in
 * data/planets.js — nothing here is hard-coded per planet.
 */
import { PLANETS, EARTH } from '../data/planets.js';
import { formatters, joinValue, formatSmart, celsiusToKelvin, DAYS_PER_YEAR } from './format.js';
import { relativeGravity } from './astro.js';

/**
 * mode:
 *   'ratio' – bars scaled relative to the larger of the two values
 *   'range' – both values placed on a shared axis (used for temperature,
 *             which can be negative)
 */
export const METRICS = [
  {
    key: 'diameterKm',
    label: 'Diameter',
    unitLabel: 'km',
    mode: 'ratio',
    format: formatters.diameter,
    higher: 'wider',
    lower: 'narrower',
    noun: 'diameter',
  },
  {
    key: 'massE24Kg',
    label: 'Mass',
    unitLabel: 'kg',
    mode: 'ratio',
    format: formatters.mass,
    higher: 'more massive',
    lower: 'less massive',
    noun: 'mass',
  },
  {
    key: 'gravityMs2',
    label: 'Surface gravity',
    unitLabel: 'm/s²',
    mode: 'ratio',
    format: formatters.gravity,
    higher: 'stronger',
    lower: 'weaker',
    noun: 'gravity',
  },
  {
    key: 'meanTempC',
    label: 'Mean temperature',
    unitLabel: '°C',
    mode: 'range',
    format: formatters.temperature,
    higher: 'hotter',
    lower: 'colder',
    noun: 'temperature',
  },
  {
    key: 'dayLengthHours',
    label: 'Length of day',
    unitLabel: 'solar day',
    mode: 'ratio',
    format: formatters.dayLength,
    higher: 'longer',
    lower: 'shorter',
    noun: 'day',
  },
  {
    key: 'orbitalPeriodDays',
    label: 'Orbital period',
    unitLabel: 'one year',
    mode: 'ratio',
    format: formatters.orbitalPeriod,
    higher: 'longer',
    lower: 'shorter',
    noun: 'year',
  },
  {
    key: 'distanceMkm',
    label: 'Distance from the Sun',
    unitLabel: 'mean',
    mode: 'ratio',
    format: formatters.distance,
    higher: 'farther',
    lower: 'closer',
    noun: 'distance',
  },
  {
    key: 'surfacePressureBar',
    label: 'Surface pressure',
    unitLabel: 'bar',
    mode: 'ratio',
    format: formatters.pressure,
    higher: 'higher',
    lower: 'lower',
    noun: 'pressure',
    unavailableReason: 'No solid surface — not applicable for giant planets',
  },
];

export const METRIC_MAP = Object.fromEntries(METRICS.map((m) => [m.key, m]));

export function metricValue(body, key) {
  const v = body?.stats?.[key];
  return typeof v === 'number' && !Number.isNaN(v) ? v : null;
}

/** Temperature axis bounds across the planets (used for 'range' bars). */
const TEMP_VALUES = PLANETS.map((p) => p.stats.meanTempC);
export const TEMP_AXIS = {
  min: Math.min(...TEMP_VALUES) - 20,
  max: Math.max(...TEMP_VALUES) + 20,
};

/**
 * Compare a metric between bodies a and b.
 * Returns bar fractions, the larger side and a human-readable summary.
 */
export function compareMetric(metric, a, b) {
  const va = metricValue(a, metric.key);
  const vb = metricValue(b, metric.key);
  const result = {
    metric,
    a: va,
    b: vb,
    aText: va == null ? 'Unavailable' : joinValue(metric.format(va)),
    bText: vb == null ? 'Unavailable' : joinValue(metric.format(vb)),
    available: va != null && vb != null,
    winner: null,
    ratio: null,
    aFraction: 0,
    bFraction: 0,
    summary: '',
  };

  if (metric.mode === 'range') {
    const span = TEMP_AXIS.max - TEMP_AXIS.min;
    if (va != null) result.aFraction = (va - TEMP_AXIS.min) / span;
    if (vb != null) result.bFraction = (vb - TEMP_AXIS.min) / span;
  } else {
    const max = Math.max(va ?? 0, vb ?? 0);
    if (max > 0) {
      result.aFraction = va != null ? va / max : 0;
      result.bFraction = vb != null ? vb / max : 0;
    }
  }

  if (!result.available) {
    const missing = va == null ? a : b;
    result.summary = `${missing.name}: ${metric.unavailableReason ?? 'value unavailable in the dataset'}.`;
    return result;
  }

  if (va === vb) {
    result.winner = 'tie';
    result.summary = `${a.name} and ${b.name} have the same ${metric.noun} in this dataset.`;
    return result;
  }

  const [hi, lo, hiVal, loVal] = va > vb ? [a, b, va, vb] : [b, a, vb, va];
  result.winner = va > vb ? 'a' : 'b';

  if (metric.mode === 'range') {
    const diff = hiVal - loVal;
    const kelvinRatio = celsiusToKelvin(hiVal) / celsiusToKelvin(loVal);
    result.ratio = kelvinRatio;
    result.summary = `${hi.name} is ${formatSmart(diff)} °C ${metric.higher} than ${lo.name} on average.`;
  } else if (loVal === 0) {
    result.summary = `${hi.name} has a ${metric.noun} of ${joinValue(metric.format(hiVal))}; ${lo.name}’s is effectively zero.`;
  } else {
    result.ratio = hiVal / loVal;
    result.summary = RATIO_SENTENCES[metric.key](hi.name, lo.name, `${formatSmart(result.ratio)}×`);
  }
  return result;
}

const RATIO_SENTENCES = {
  diameterKm: (hi, lo, r) => `${hi} is ${r} wider than ${lo}.`,
  massE24Kg: (hi, lo, r) => `${hi} is ${r} more massive than ${lo}.`,
  gravityMs2: (hi, lo, r) => `Gravity on ${hi} is ${r} stronger than on ${lo}.`,
  dayLengthHours: (hi, lo, r) => `A day on ${hi} lasts ${r} longer than a day on ${lo}.`,
  orbitalPeriodDays: (hi, lo, r) => `A year on ${hi} lasts ${r} longer than a year on ${lo}.`,
  distanceMkm: (hi, lo, r) => `${hi} orbits ${r} farther from the Sun than ${lo}.`,
  surfacePressureBar: (hi, lo, r) => `Surface pressure on ${hi} is ${r} higher than on ${lo}.`,
};

/** Rank (1 = highest) of a planet among the eight for a metric. */
export function rankAmongPlanets(planet, key, { ascending = false } = {}) {
  const values = PLANETS.map((p) => ({ id: p.id, v: metricValue(p, key) })).filter((x) => x.v != null);
  values.sort((x, y) => (ascending ? x.v - y.v : y.v - x.v));
  const index = values.findIndex((x) => x.id === planet.id);
  return index >= 0 ? { rank: index + 1, of: values.length } : null;
}

export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Planet-vs-Earth ratios for the detail page. */
export function earthComparisons(planet) {
  if (!planet || planet.id === 'earth') return [];
  const s = planet.stats;
  const e = EARTH.stats;
  const rows = [
    { key: 'diameterKm', label: 'Diameter', ratio: s.diameterKm / e.diameterKm },
    { key: 'massE24Kg', label: 'Mass', ratio: s.massE24Kg / e.massE24Kg },
    { key: 'gravityMs2', label: 'Surface gravity', ratio: relativeGravity(s.gravityMs2) },
    { key: 'dayLengthHours', label: 'Length of day', ratio: Math.abs(s.dayLengthHours) / e.dayLengthHours },
  ];
  if (s.orbitalPeriodDays != null) rows.push({ key: 'orbitalPeriodDays', label: 'Length of year', ratio: s.orbitalPeriodDays / e.orbitalPeriodDays });
  if (s.distanceMkm != null) rows.push({ key: 'distanceMkm', label: 'Distance from Sun', ratio: s.distanceMkm / e.distanceMkm });
  return rows;
}

/** Equivalent "scale reading" for a person on another world. */
export function weightOn(body, earthKg) {
  return earthKg * relativeGravity(body.stats.gravityMs2);
}

export function yearsInEarthYears(days) {
  return days / DAYS_PER_YEAR;
}
