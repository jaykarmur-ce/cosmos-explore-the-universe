/** Formatting helpers with consistent units across the app. */

const nf = (digits = 0) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function formatNumber(value, digits = 0) {
  if (value == null || Number.isNaN(value)) return '—';
  return nf(digits).format(value);
}

/** Choose sensible precision for a ratio-like number. */
export function formatSmart(value) {
  if (value == null || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1000) return formatNumber(value, 0);
  if (abs >= 100) return formatNumber(value, 0);
  if (abs >= 10) return formatNumber(value, 1);
  if (abs >= 1) return formatNumber(value, 2);
  if (abs >= 0.01) return formatNumber(value, 2);
  return value.toPrecision(2);
}

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const toSuperscript = (n) => String(n).split('').map((c) => SUPERSCRIPT[c] ?? c).join('');

/** e.g. 5.97e24 → "5.97 × 10²⁴" */
export function formatScientific(value, digits = 3) {
  if (value == null || value === 0) return value === 0 ? '0' : '—';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / 10 ** exponent;
  return `${Number(mantissa.toPrecision(digits))} × 10${toSuperscript(exponent)}`;
}

export const DAYS_PER_YEAR = 365.25;

export const formatters = {
  diameter: (km) => ({ value: formatNumber(km), unit: 'km' }),
  mass: (e24) => (e24 == null ? { value: '—', unit: '' } : { value: formatScientific(e24 * 1e24), unit: 'kg' }),
  gravity: (ms2) => ({ value: formatNumber(ms2, 1), unit: 'm/s²' }),
  temperature: (c) => ({ value: c == null ? '—' : `${c > 0 ? '' : c < 0 ? '−' : ''}${formatNumber(Math.abs(c))}`, unit: '°C' }),
  distance: (mkm) => (mkm == null ? { value: '—', unit: '' } : { value: formatNumber(mkm, mkm >= 1000 ? 0 : 1), unit: 'million km' }),
  dayLength: (hours) => {
    if (hours == null) return { value: '—', unit: '' };
    const h = Math.abs(hours);
    if (h >= 72) return { value: formatNumber(h / 24, 1), unit: 'Earth days' };
    return { value: formatNumber(h, 1), unit: 'hours' };
  },
  orbitalPeriod: (days) => {
    if (days == null) return { value: '—', unit: '' };
    if (days >= 730) return { value: formatNumber(days / DAYS_PER_YEAR, 2), unit: 'Earth years' };
    return { value: formatNumber(days, 1), unit: 'Earth days' };
  },
  pressure: (bar) => (bar == null ? { value: '—', unit: '' } : { value: bar < 0.1 && bar > 0 ? String(bar) : formatNumber(bar, bar < 10 ? 1 : 0), unit: 'bar' }),
  density: (d) => ({ value: formatNumber(d), unit: 'kg/m³' }),
  tilt: (deg) => ({ value: formatNumber(deg, deg < 1 ? 2 : 1), unit: '°' }),
};

export function joinValue({ value, unit }) {
  return unit ? `${value} ${unit}` : value;
}

/** Signed temperature string with a proper minus sign. */
export function formatTemperature(c) {
  return joinValue(formatters.temperature(c));
}

export function celsiusToKelvin(c) {
  return c + 273.15;
}

export function auFromMkm(mkm) {
  return mkm / 149.6;
}

export function formatAU(mkm) {
  if (mkm == null) return '—';
  const au = auFromMkm(mkm);
  return `${formatNumber(au, au < 10 ? 3 : 2)} AU`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "1969-07-20" → "20 Jul 1969" (date-only strings are treated as UTC). */
export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatDateUTC(date) {
  return `${String(date.getUTCDate()).padStart(2, '0')} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
