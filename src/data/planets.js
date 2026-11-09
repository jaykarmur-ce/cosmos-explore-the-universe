/**
 * Solar system dataset.
 *
 * Physical values follow the NASA NSSDCA Planetary Fact Sheet (metric) and
 * Sun Fact Sheet. Units are fixed per field (see comments) so every page and
 * calculation can rely on them.
 *
 *  diameterKm          equatorial diameter, km
 *  massE24Kg           mass, 10^24 kg
 *  gravityMs2          equatorial surface gravity, m/s²
 *  meanTempC           mean temperature, °C (giant planets: at the 1-bar level)
 *  dayLengthHours      length of a solar day (sunrise to sunrise), hours
 *  rotationHours       sidereal rotation period, hours (negative = retrograde)
 *  orbitalPeriodDays   sidereal orbital period, Earth days
 *  distanceMkm         mean distance from the Sun, million km
 *  axialTiltDeg        obliquity to orbit, degrees
 *  densityKgM3         mean density, kg/m³
 *  surfacePressureBar  surface pressure, bar (null where there is no solid surface)
 *  moons               { count, asOf } — counts change as discoveries are confirmed
 *
 * Mean longitudes (meanLongitudeJ2000Deg, meanMotionDegPerCentury) come from the
 * JPL "Approximate Positions of the Planets" table and are used only to place
 * planets at approximately the right angle around the Sun for the current date.
 */
import { SOURCES } from './sources.js';

const MOON_COUNT_DATE = 'Nov 2025';

export const SUN = {
  id: 'sun',
  name: 'Sun',
  type: 'star',
  category: 'G-type main-sequence star (G2V)',
  tagline: 'The star at the centre of everything',
  accent: '#FFB35C',
  summary:
    'A 4.6-billion-year-old star whose gravity holds the solar system together and whose light powers nearly all life on Earth.',
  overview:
    'The Sun is a nearly perfect sphere of hot plasma. In its core, about 600 million tonnes of hydrogen fuse into helium every second, releasing the energy that eventually escapes as sunlight. It contains about 99.8% of all the mass in the solar system and is roughly halfway through its life on the main sequence.',
  atmosphere: 'Photosphere, chromosphere and corona — mostly hydrogen (~73%) and helium (~25%) by mass',
  surface: 'No solid surface; the visible "surface" is the photosphere',
  stats: {
    diameterKm: 1391400,
    massE24Kg: 1988500,
    gravityMs2: 274,
    meanTempC: 5500,
    dayLengthHours: 609.12,
    rotationHours: 609.12,
    orbitalPeriodDays: null,
    distanceMkm: null,
    axialTiltDeg: 7.25,
    densityKgM3: 1408,
    surfacePressureBar: null,
    moons: null,
  },
  statNotes: {
    meanTempC: 'Effective temperature of the photosphere (≈5,772 K). The core reaches about 15 million °C.',
    dayLengthHours: 'Sidereal rotation at the equator (~25.4 days); the poles rotate more slowly.',
    orbitalPeriodDays: 'The Sun orbits the centre of the Milky Way roughly once every 230 million years.',
  },
  facts: [
    'Light leaving the Sun takes about 8 minutes and 20 seconds to reach Earth.',
    'About 109 Earths would fit across the Sun’s diameter.',
    'The corona, the Sun’s outer atmosphere, is more than a million degrees Celsius — far hotter than the visible surface.',
    'The Sun’s magnetic activity rises and falls in a cycle of roughly 11 years, visible as changing numbers of sunspots.',
  ],
  visual: { tiltDeg: 7.25, atmosphere: null, rings: null },
  sources: [SOURCES.nasaSunFactSheet, SOURCES.nasaScience],
};

export const PLANETS = [
  {
    id: 'mercury',
    name: 'Mercury',
    order: 1,
    type: 'planet',
    category: 'Terrestrial planet',
    tagline: 'The swift innermost world',
    accent: '#B7AFA6',
    summary:
      'The smallest planet and the closest to the Sun — a cratered, airless world with the most extreme temperature swings in the solar system.',
    overview:
      'Mercury races around the Sun every 88 days. With almost no atmosphere to hold heat, its surface bakes at about 430 °C in daylight and plunges to around −180 °C at night. Its large iron core makes up a remarkable share of its volume, and its ancient, heavily cratered surface resembles Earth’s Moon.',
    atmosphere: 'Extremely thin exosphere of oxygen, sodium, hydrogen, helium and potassium',
    surface: 'Rocky, heavily cratered, with long cliffs (lobate scarps) formed as the planet cooled and shrank',
    stats: {
      diameterKm: 4879,
      massE24Kg: 0.33,
      gravityMs2: 3.7,
      meanTempC: 167,
      dayLengthHours: 4222.6,
      rotationHours: 1407.6,
      orbitalPeriodDays: 88.0,
      distanceMkm: 57.9,
      axialTiltDeg: 0.034,
      densityKgM3: 5429,
      surfacePressureBar: 0,
      moons: { count: 0, asOf: MOON_COUNT_DATE },
    },
    statNotes: {
      meanTempC: 'Average only — daytime highs reach about 430 °C and night-time lows about −180 °C.',
    },
    facts: [
      'Mercury spins exactly three times for every two orbits around the Sun (a 3:2 spin–orbit resonance).',
      'One solar day on Mercury — sunrise to sunrise — lasts about 176 Earth days, or two Mercury years.',
      'Despite being closest to the Sun, Mercury is not the hottest planet; Venus is.',
      'NASA’s MESSENGER spacecraft found evidence of water ice in permanently shadowed craters near Mercury’s poles.',
    ],
    meanLongitudeJ2000Deg: 252.2503235,
    meanMotionDegPerCentury: 149472.67411175,
    visual: { tiltDeg: 0.034, atmosphere: null, rings: null },
    sources: [SOURCES.nasaFactSheet, SOURCES.nasaScience],
  },
  {
    id: 'venus',
    name: 'Venus',
    order: 2,
    type: 'planet',
    category: 'Terrestrial planet',
    tagline: 'The veiled furnace',
    accent: '#E8C58A',
    summary:
      'Earth’s similar-sized neighbour, wrapped in crushing clouds and a runaway greenhouse effect that makes it the hottest planet.',
    overview:
      'Venus is almost the same size as Earth, but the two planets took very different paths. A thick carbon dioxide atmosphere traps heat so effectively that the surface averages about 464 °C — hot enough to melt lead. Clouds of sulfuric acid hide a landscape of volcanic plains, and the planet spins slowly backwards compared with most other planets.',
    atmosphere: 'Very dense — about 96.5% carbon dioxide with clouds of sulfuric acid',
    surface: 'Volcanic plains, highland regions and thousands of volcanoes',
    stats: {
      diameterKm: 12104,
      massE24Kg: 4.87,
      gravityMs2: 8.9,
      meanTempC: 464,
      dayLengthHours: 2802.0,
      rotationHours: -5832.5,
      orbitalPeriodDays: 224.7,
      distanceMkm: 108.2,
      axialTiltDeg: 177.4,
      densityKgM3: 5243,
      surfacePressureBar: 92,
      moons: { count: 0, asOf: MOON_COUNT_DATE },
    },
    statNotes: {
      dayLengthHours: 'Venus rotates retrograde. Its sidereal rotation (243 Earth days) is longer than its year.',
    },
    facts: [
      'The pressure at the surface of Venus is about 92 times Earth’s — similar to being roughly 900 metres deep in the ocean.',
      'Venus rotates backwards (retrograde), so the Sun would rise in the west and set in the east.',
      'After the Moon, Venus is the brightest natural object in the night sky.',
      'In 1970 the Soviet Venera 7 lander became the first spacecraft to transmit data from the surface of another planet.',
    ],
    meanLongitudeJ2000Deg: 181.9790995,
    meanMotionDegPerCentury: 58517.81538729,
    visual: {
      tiltDeg: 177.4,
      atmosphere: { color: '#F2D29B', intensity: 1.1, power: 2.6, scale: 1.035 },
      rings: null,
    },
    sources: [SOURCES.nasaFactSheet, SOURCES.nasaScience],
  },
  {
    id: 'earth',
    name: 'Earth',
    order: 3,
    type: 'planet',
    category: 'Terrestrial planet',
    tagline: 'The ocean world we call home',
    accent: '#5FA8FF',
    summary:
      'The only world known to host life — a dynamic planet of oceans, continents and a protective, oxygen-rich atmosphere.',
    overview:
      'Earth is the largest of the four rocky planets and the only place known to support life. Liquid water covers about 71% of its surface, a magnetic field shields it from much of the solar wind, and its atmosphere of nitrogen and oxygen moderates the climate. Plate tectonics continually reshapes its continents and ocean floors.',
    atmosphere: 'About 78% nitrogen and 21% oxygen, with argon, carbon dioxide and water vapour',
    surface: 'Liquid-water oceans, continents, ice caps — reshaped by plate tectonics',
    stats: {
      diameterKm: 12756,
      massE24Kg: 5.97,
      gravityMs2: 9.8,
      meanTempC: 15,
      dayLengthHours: 24.0,
      rotationHours: 23.9,
      orbitalPeriodDays: 365.2,
      distanceMkm: 149.6,
      axialTiltDeg: 23.4,
      densityKgM3: 5514,
      surfacePressureBar: 1,
      moons: { count: 1, asOf: MOON_COUNT_DATE },
    },
    statNotes: {},
    facts: [
      'Earth is the densest planet in the solar system.',
      'Its 23.4° axial tilt — not its changing distance from the Sun — is what causes the seasons.',
      'The Moon is slowly drifting away from Earth by about 3.8 centimetres per year.',
      'Earth’s rotation is gradually slowing because of tidal interaction with the Moon.',
    ],
    meanLongitudeJ2000Deg: 100.46457166,
    meanMotionDegPerCentury: 35999.37244981,
    visual: {
      tiltDeg: 23.44,
      atmosphere: { color: '#6FB6FF', intensity: 1.35, power: 2.4, scale: 1.03 },
      clouds: true,
      rings: null,
    },
    sources: [SOURCES.nasaFactSheet, SOURCES.nasaScience],
  },
  {
    id: 'mars',
    name: 'Mars',
    order: 4,
    type: 'planet',
    category: 'Terrestrial planet',
    tagline: 'The rust-red frontier',
    accent: '#E07A4F',
    summary:
      'A cold desert world with giant volcanoes, a vast canyon system and clear evidence of an ancient, wetter past.',
    overview:
      'Mars is about half the width of Earth. Iron oxide in its dusty soil gives it a reddish hue. Today its thin carbon dioxide atmosphere and freezing temperatures leave water mostly locked in ice, but dried river valleys, lakebeds and minerals that form in water reveal that liquid water once flowed on its surface. Mars is the most explored planet beyond Earth, with rovers and orbiters studying it continuously.',
    atmosphere: 'Thin — about 95% carbon dioxide, with nitrogen and argon',
    surface: 'Iron-rich dust and rock, polar ice caps, giant volcanoes and canyons',
    stats: {
      diameterKm: 6792,
      massE24Kg: 0.642,
      gravityMs2: 3.7,
      meanTempC: -65,
      dayLengthHours: 24.7,
      rotationHours: 24.6,
      orbitalPeriodDays: 687.0,
      distanceMkm: 228.0,
      axialTiltDeg: 25.2,
      densityKgM3: 3934,
      surfacePressureBar: 0.01,
      moons: { count: 2, asOf: MOON_COUNT_DATE },
    },
    statNotes: {},
    facts: [
      'Olympus Mons, a shield volcano on Mars, rises roughly 22 km — about two and a half times the height of Mount Everest.',
      'The Valles Marineris canyon system stretches about 4,000 km across the planet.',
      'Mars has two small, irregular moons, Phobos and Deimos.',
      'In April 2021 NASA’s Ingenuity helicopter made the first powered, controlled flight on another planet.',
    ],
    meanLongitudeJ2000Deg: -4.55343205,
    meanMotionDegPerCentury: 19140.30268499,
    visual: {
      tiltDeg: 25.19,
      atmosphere: { color: '#E29A72', intensity: 0.55, power: 3.2, scale: 1.025 },
      rings: null,
    },
    sources: [SOURCES.nasaFactSheet, SOURCES.nasaScience],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    order: 5,
    type: 'planet',
    category: 'Gas giant',
    tagline: 'King of the planets',
    accent: '#D9A877',
    summary:
      'The largest planet — a banded giant of hydrogen and helium with a storm wider than Earth and a miniature system of moons.',
    overview:
      'Jupiter is more than twice as massive as all the other planets combined. Its colourful bands are clouds of ammonia and water drifting in an atmosphere of hydrogen and helium, stretched into belts and zones by powerful jet streams. The Great Red Spot, a storm larger than Earth, has been observed for more than 150 years. Its moon Ganymede is the largest in the solar system.',
    atmosphere: 'Mostly hydrogen and helium; clouds of ammonia, ammonium hydrosulfide and water',
    surface: 'No solid surface — the atmosphere grades into a deep interior of liquid metallic hydrogen',
    stats: {
      diameterKm: 142984,
      massE24Kg: 1898,
      gravityMs2: 23.1,
      meanTempC: -110,
      dayLengthHours: 9.9,
      rotationHours: 9.9,
      orbitalPeriodDays: 4331,
      distanceMkm: 778.5,
      axialTiltDeg: 3.1,
      densityKgM3: 1326,
      surfacePressureBar: null,
      moons: { count: 97, asOf: MOON_COUNT_DATE },
    },
    statNotes: {
      gravityMs2: 'Measured at the 1-bar pressure level, since Jupiter has no solid surface.',
      moons: 'Jupiter’s moon count changes often as small outer moons are confirmed.',
    },
    facts: [
      'Jupiter has the shortest day of any planet — it spins once in under 10 hours.',
      'Ganymede, one of Jupiter’s moons, is larger than the planet Mercury.',
      'Jupiter has faint rings made mostly of dust, discovered by Voyager 1 in 1979.',
      'NASA’s Juno spacecraft has orbited Jupiter since 2016, studying its interior and polar storms.',
    ],
    meanLongitudeJ2000Deg: 34.39644051,
    meanMotionDegPerCentury: 3034.74612775,
    visual: {
      tiltDeg: 3.13,
      atmosphere: { color: '#E9C79E', intensity: 0.5, power: 3, scale: 1.02 },
      rings: null,
    },
    sources: [SOURCES.nasaFactSheet, SOURCES.moonCounts, SOURCES.nasaScience],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    order: 6,
    type: 'planet',
    category: 'Gas giant',
    tagline: 'The ringed jewel',
    accent: '#E6CF95',
    summary:
      'A golden gas giant crowned by the most spectacular ring system in the solar system — and the planet with the most known moons.',
    overview:
      'Saturn is the second-largest planet and the least dense: its average density is lower than that of water. Its rings are made of countless pieces of water ice and rock, from grains of dust to chunks as large as houses. Although they extend hundreds of thousands of kilometres from the planet, the main rings are typically only about ten metres thick. Its moon Titan has a thick atmosphere and lakes of liquid methane.',
    atmosphere: 'Mostly hydrogen and helium, with ammonia-ice clouds',
    surface: 'No solid surface — layered atmosphere above a dense, hot interior',
    stats: {
      diameterKm: 120536,
      massE24Kg: 568,
      gravityMs2: 9.0,
      meanTempC: -140,
      dayLengthHours: 10.7,
      rotationHours: 10.7,
      orbitalPeriodDays: 10747,
      distanceMkm: 1432.0,
      axialTiltDeg: 26.7,
      densityKgM3: 687,
      surfacePressureBar: null,
      moons: { count: 274, asOf: MOON_COUNT_DATE },
    },
    statNotes: {
      gravityMs2: 'Measured at the 1-bar pressure level, since Saturn has no solid surface.',
    },
    facts: [
      'Saturn is the only planet less dense than water.',
      'The main rings can extend up to about 282,000 km from the planet yet are typically only about 10 metres thick.',
      'A six-sided jet stream — the hexagon — circles Saturn’s north pole.',
      'NASA–ESA’s Cassini–Huygens mission orbited Saturn from 2004 to 2017 and landed a probe on Titan in 2005.',
    ],
    meanLongitudeJ2000Deg: 49.95424423,
    meanMotionDegPerCentury: 1222.49362201,
    visual: {
      tiltDeg: 26.73,
      atmosphere: { color: '#F0DCA8', intensity: 0.45, power: 3, scale: 1.02 },
      rings: { type: 'saturn', inner: 1.24, outer: 2.33 },
    },
    sources: [SOURCES.nasaFactSheet, SOURCES.moonCounts, SOURCES.nasaScience],
  },
  {
    id: 'uranus',
    name: 'Uranus',
    order: 7,
    type: 'planet',
    category: 'Ice giant',
    tagline: 'The tilted ice giant',
    accent: '#8FE3E8',
    summary:
      'A pale cyan ice giant that rolls around the Sun on its side, with the coldest atmosphere of any planet.',
    overview:
      'Uranus is tipped over by about 98°, so it orbits the Sun almost on its side — likely the result of a giant collision long ago. Each pole gets around 42 years of continuous sunlight followed by 42 years of darkness. Methane in its atmosphere absorbs red light, giving the planet its soft blue-green colour. It was the first planet discovered with a telescope, by William Herschel in 1781.',
    atmosphere: 'Hydrogen, helium and methane',
    surface: 'No solid surface — a thick mantle of water, ammonia and methane ices surrounds a small rocky core',
    stats: {
      diameterKm: 51118,
      massE24Kg: 86.8,
      gravityMs2: 8.7,
      meanTempC: -195,
      dayLengthHours: 17.2,
      rotationHours: -17.2,
      orbitalPeriodDays: 30589,
      distanceMkm: 2867.0,
      axialTiltDeg: 97.8,
      densityKgM3: 1270,
      surfacePressureBar: null,
      moons: { count: 29, asOf: MOON_COUNT_DATE },
    },
    statNotes: {
      gravityMs2: 'Measured at the 1-bar pressure level, since Uranus has no solid surface.',
      moons: 'The 29th moon, S/2025 U1, was announced in August 2025 from James Webb Space Telescope images.',
    },
    facts: [
      'Uranus’s atmosphere has recorded the lowest temperatures of any planet, around −224 °C.',
      'Voyager 2 is the only spacecraft to have visited Uranus, flying past in January 1986.',
      'Uranus has 13 known rings — narrow and dark, unlike Saturn’s bright ones.',
      'Its moons are named after characters from the works of William Shakespeare and Alexander Pope.',
    ],
    meanLongitudeJ2000Deg: 313.23810451,
    meanMotionDegPerCentury: 428.48202785,
    visual: {
      tiltDeg: 97.77,
      atmosphere: { color: '#A8EEF0', intensity: 0.85, power: 2.6, scale: 1.03 },
      rings: { type: 'uranus', inner: 1.6, outer: 2.05 },
    },
    sources: [SOURCES.nasaFactSheet, SOURCES.moonCounts, SOURCES.nasaScience],
  },
  {
    id: 'neptune',
    name: 'Neptune',
    order: 8,
    type: 'planet',
    category: 'Ice giant',
    tagline: 'The windswept blue frontier',
    accent: '#5B7CFF',
    summary:
      'The most distant planet — a deep-blue ice giant with the fastest winds in the solar system.',
    overview:
      'Neptune was the first planet found by mathematical prediction rather than by sky survey: irregularities in the orbit of Uranus led Urbain Le Verrier to calculate its position, and Johann Galle observed it in 1846. Its winds exceed 2,000 km/h, driving dark storms across a vivid blue atmosphere. Its largest moon, Triton, orbits backwards and is probably a captured object from the Kuiper Belt.',
    atmosphere: 'Hydrogen, helium and methane',
    surface: 'No solid surface — icy mantle of water, ammonia and methane around a rocky core',
    stats: {
      diameterKm: 49528,
      massE24Kg: 102,
      gravityMs2: 11.0,
      meanTempC: -200,
      dayLengthHours: 16.1,
      rotationHours: 16.1,
      orbitalPeriodDays: 59800,
      distanceMkm: 4515.0,
      axialTiltDeg: 28.3,
      densityKgM3: 1638,
      surfacePressureBar: null,
      moons: { count: 16, asOf: MOON_COUNT_DATE },
    },
    statNotes: {
      gravityMs2: 'Measured at the 1-bar pressure level, since Neptune has no solid surface.',
    },
    facts: [
      'A year on Neptune lasts about 165 Earth years; it completed its first full orbit since discovery in 2011.',
      'Neptune’s winds are the fastest measured on any planet, exceeding 2,000 km/h.',
      'Voyager 2 flew past Neptune in 1989 and remains the only spacecraft to have visited it.',
      'Triton, Neptune’s largest moon, has active geysers that vent nitrogen gas.',
    ],
    meanLongitudeJ2000Deg: -55.12002969,
    meanMotionDegPerCentury: 218.45945325,
    visual: {
      tiltDeg: 28.32,
      atmosphere: { color: '#6F8DFF', intensity: 0.95, power: 2.5, scale: 1.03 },
      rings: null,
    },
    sources: [SOURCES.nasaFactSheet, SOURCES.moonCounts, SOURCES.nasaScience],
  },
];

/** Earth's Moon — rendered in the explorer and hero for context. */
export const MOON = {
  id: 'moon',
  name: 'Moon',
  diameterKm: 3474.8,
  orbitalPeriodDays: 27.32,
};

/** All bodies in display order: Sun first, then planets outward. */
export const BODIES = [SUN, ...PLANETS];

const BODY_MAP = new Map(BODIES.map((b) => [b.id, b]));

export function getBody(id) {
  return BODY_MAP.get(id) ?? null;
}

export function getPlanet(id) {
  const body = BODY_MAP.get(id);
  return body && body.type === 'planet' ? body : null;
}

export const EARTH = getBody('earth');
