/** Builds display-ready statistic rows for a body (planet or Sun). */
import { formatters, formatAU, formatNumber } from './format.js';
import { relativeGravity } from './astro.js';

export function bodyStatItems(body) {
  const s = body.stats;
  const notes = body.statNotes ?? {};
  const isSun = body.type === 'star';
  const day = formatters.dayLength(s.dayLengthHours);
  const items = [
    {
      key: 'diameter',
      label: 'Diameter',
      ...formatters.diameter(s.diameterKm),
      sub: isSun ? 'About 109 times Earth’s diameter' : 'Equatorial',
    },
    {
      key: 'distance',
      label: 'Distance from Sun',
      ...(isSun ? { value: '—', unit: '' } : formatters.distance(s.distanceMkm)),
      sub: isSun ? 'Centre of the solar system' : `Mean · ${formatAU(s.distanceMkm)}`,
    },
    {
      key: 'day',
      label: isSun ? 'Rotation (equator)' : 'Length of day',
      ...day,
      sub:
        notes.dayLengthHours ??
        (day.unit === 'Earth days' ? `${formatNumber(Math.abs(s.dayLengthHours))} hours, sunrise to sunrise` : 'Solar day, sunrise to sunrise'),
    },
    {
      key: 'year',
      label: 'Orbital period',
      ...(s.orbitalPeriodDays == null ? { value: '—', unit: '' } : formatters.orbitalPeriod(s.orbitalPeriodDays)),
      sub:
        notes.orbitalPeriodDays ??
        (s.orbitalPeriodDays >= 730 ? `${formatNumber(s.orbitalPeriodDays)} Earth days` : 'One trip around the Sun'),
    },
    {
      key: 'temperature',
      label: isSun ? 'Surface temperature' : 'Mean temperature',
      ...formatters.temperature(s.meanTempC),
      sub: notes.meanTempC ?? (body.category.includes('giant') ? 'At the 1-bar pressure level' : 'Average at the surface'),
    },
    {
      key: 'gravity',
      label: 'Gravity',
      value: formatNumber(relativeGravity(s.gravityMs2), 2),
      unit: '× Earth',
      sub: notes.gravityMs2 ?? `${formatNumber(s.gravityMs2, 1)} m/s² at the surface`,
    },
    {
      key: 'mass',
      label: 'Mass',
      ...formatters.mass(s.massE24Kg),
      sub: `${formatNumber(s.massE24Kg / 5.97, s.massE24Kg / 5.97 < 10 ? 3 : 0)} × Earth`,
    },
    {
      key: 'moons',
      label: 'Known moons',
      value: s.moons ? formatNumber(s.moons.count) : '—',
      unit: '',
      sub: s.moons ? notes.moons ?? `Confirmed count as of ${s.moons.asOf}` : 'Not applicable — orbited by 8 planets',
    },
  ];
  return items;
}

/** Compact subset for the explorer info panel. */
export function quickStatItems(body) {
  const keep = ['diameter', 'distance', 'day', 'year', 'temperature', 'gravity', 'moons'];
  return bodyStatItems(body).filter((i) => keep.includes(i.key));
}
