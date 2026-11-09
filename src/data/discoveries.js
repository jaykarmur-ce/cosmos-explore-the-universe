/**
 * Deep-space discoveries ("Beyond Our Solar System").
 *
 * All text is local. Each item has an `art` descriptor used by the procedural
 * illustration renderer — these are artistic representations, not photographs.
 */

export const DISCOVERY_CATEGORIES = [
  {
    id: 'black-holes',
    label: 'Black Holes',
    singular: 'Black hole',
    blurb: 'Regions where gravity is so intense that nothing — not even light — escapes once it crosses the event horizon.',
  },
  {
    id: 'nebulae',
    label: 'Nebulae',
    singular: 'Nebula',
    blurb: 'Clouds of gas and dust: the birthplaces of stars and the shrouds they leave behind.',
  },
  {
    id: 'galaxies',
    label: 'Galaxies',
    singular: 'Galaxy',
    blurb: 'Vast systems of stars, gas, dust and dark matter bound together by gravity.',
  },
  {
    id: 'exoplanets',
    label: 'Exoplanets',
    singular: 'Exoplanet',
    blurb: 'Planets orbiting stars other than the Sun — more than 6,000 had been confirmed by late 2025.',
  },
  {
    id: 'supernovae',
    label: 'Supernovae',
    singular: 'Supernova',
    blurb: 'Stellar explosions that can briefly outshine entire galaxies and seed space with heavy elements.',
  },
  {
    id: 'neutron-stars',
    label: 'Neutron Stars',
    singular: 'Neutron star',
    blurb: 'The ultra-dense collapsed cores of massive stars — a city-sized ball heavier than the Sun.',
  },
];

export const DISCOVERIES = [
  // ── Black holes ──────────────────────────────────────────────
  {
    id: 'sagittarius-a-star',
    name: 'Sagittarius A*',
    category: 'black-holes',
    designation: 'Sgr A*',
    summary:
      'The supermassive black hole at the heart of our own galaxy — about four million times the mass of the Sun.',
    description: [
      'Sagittarius A* (pronounced “Sagittarius A-star”) sits at the centre of the Milky Way, roughly 27,000 light-years from Earth. For decades astronomers tracked stars whipping around an invisible point at thousands of kilometres per second. Their orbits revealed a compact object of about four million solar masses packed into a region smaller than our solar system.',
      'In May 2022 the Event Horizon Telescope collaboration released the first image of Sagittarius A*: a ring of glowing gas surrounding the black hole’s dark shadow. Because gas circles this relatively small black hole in minutes rather than days, capturing a sharp image was even harder than for M87*.',
      'Compared with the most active galactic nuclei, Sagittarius A* is quiet — it currently swallows only a trickle of material, which is why it shines faintly despite its enormous mass.',
    ],
    facts: [
      'The 2020 Nobel Prize in Physics was shared by Reinhard Genzel and Andrea Ghez for discovering this compact object, and by Roger Penrose for black-hole theory.',
      'The star S2 orbits Sagittarius A* about every 16 years, swinging within roughly 120 astronomical units of it.',
      'Its event horizon would fit comfortably inside the orbit of Mercury.',
    ],
    stats: [
      { label: 'Distance', value: '≈27,000 light-years' },
      { label: 'Mass', value: '≈4 million Suns' },
      { label: 'Constellation', value: 'Sagittarius' },
      { label: 'First image', value: '2022 (EHT)' },
    ],
    tags: ['milky way', 'supermassive', 'event horizon telescope', 'galactic centre'],
    related: ['m87-star', 'milky-way', 'cygnus-x-1'],
    art: { kind: 'blackhole', seed: 11, hue: 'amber', variant: 'quiet' },
  },
  {
    id: 'm87-star',
    name: 'M87*',
    category: 'black-holes',
    designation: 'Messier 87 core',
    summary:
      'The first black hole ever imaged — a giant about 6.5 billion times the mass of the Sun at the core of galaxy Messier 87.',
    description: [
      'M87* lies at the centre of the giant elliptical galaxy Messier 87 in the Virgo Cluster, about 55 million light-years away. On 10 April 2019 the Event Horizon Telescope — a planet-sized network of radio observatories — released the first image of a black hole’s shadow: a dark centre surrounded by a lopsided ring of light.',
      'The ring is brighter on one side because gas moving towards us at close to the speed of light is boosted by relativistic beaming. Far beyond the shadow, M87* drives a jet of particles that stretches about 5,000 light-years out of the galaxy.',
    ],
    facts: [
      'The Event Horizon Telescope links radio dishes across the globe, creating a virtual telescope as wide as Earth.',
      'Its event horizon is several times wider than the orbit of Neptune.',
      'Follow-up observations released in 2021 mapped the polarised light around the ring, tracing magnetic fields near the event horizon.',
    ],
    stats: [
      { label: 'Distance', value: '≈55 million light-years' },
      { label: 'Mass', value: '≈6.5 billion Suns' },
      { label: 'Host galaxy', value: 'Messier 87 (Virgo Cluster)' },
      { label: 'First image', value: '2019 (EHT)' },
    ],
    tags: ['supermassive', 'jet', 'event horizon telescope', 'virgo'],
    related: ['sagittarius-a-star', 'whirlpool-galaxy', 'cygnus-x-1'],
    art: { kind: 'blackhole', seed: 23, hue: 'fire', variant: 'jet' },
  },
  {
    id: 'cygnus-x-1',
    name: 'Cygnus X-1',
    category: 'black-holes',
    designation: 'Stellar-mass black hole',
    summary:
      'One of the first objects widely accepted as a black hole — a stellar-mass black hole feeding on a blue supergiant companion.',
    description: [
      'Discovered as a powerful X-ray source in 1964, Cygnus X-1 is a binary system about 7,200 light-years away. The X-rays come from gas pulled off its companion, the blue supergiant HDE 226868, and heated to millions of degrees as it spirals towards the black hole.',
      'Cygnus X-1 was the subject of a famous 1974 wager between Stephen Hawking and Kip Thorne. Hawking bet it was not a black hole — as insurance in case his work on black holes turned out to be wrong — and conceded in 1990. Measurements published in 2021 put its mass at about 21 times that of the Sun.',
    ],
    facts: [
      'The black hole and its companion orbit each other every 5.6 days.',
      'Stellar-mass black holes like this form when the core of a very massive star collapses.',
      'Cygnus X-1 is one of the brightest persistent X-ray sources in the sky.',
    ],
    stats: [
      { label: 'Distance', value: '≈7,200 light-years' },
      { label: 'Mass', value: '≈21 Suns' },
      { label: 'Companion', value: 'HDE 226868 (blue supergiant)' },
      { label: 'Discovered', value: '1964 (X-ray)' },
    ],
    tags: ['stellar-mass', 'x-ray binary', 'hawking', 'accretion'],
    related: ['sagittarius-a-star', 'm87-star', 'sgr-1806-20'],
    art: { kind: 'blackhole', seed: 37, hue: 'blue', variant: 'binary' },
  },

  // ── Nebulae ──────────────────────────────────────────────────
  {
    id: 'orion-nebula',
    name: 'Orion Nebula',
    category: 'nebulae',
    designation: 'M42',
    summary:
      'The closest large stellar nursery to Earth, visible to the naked eye as a soft glow in the sword of Orion.',
    description: [
      'About 1,350 light-years away, the Orion Nebula is a vast cloud of gas and dust in which thousands of stars are forming. Its glow comes from hydrogen gas energised by ultraviolet light from the hot young stars of the Trapezium cluster at its heart.',
      'Hubble and the James Webb Space Telescope have revealed dozens of protoplanetary disks — nicknamed “proplyds” — around young stars here: planetary systems in the making, some being evaporated by the intense radiation around them.',
    ],
    facts: [
      'The nebula spans roughly 24 light-years.',
      'It is visible without a telescope as the middle “star” of Orion’s sword.',
      'The four bright stars of the Trapezium provide most of the light that makes the nebula glow.',
    ],
    stats: [
      { label: 'Distance', value: '≈1,350 light-years' },
      { label: 'Type', value: 'Emission / reflection nebula' },
      { label: 'Constellation', value: 'Orion' },
      { label: 'Size', value: '≈24 light-years across' },
    ],
    tags: ['star formation', 'stellar nursery', 'trapezium', 'messier'],
    related: ['eagle-nebula', 'helix-nebula', 'trappist-1'],
    art: { kind: 'nebula', seed: 42, palette: ['#ff6fa3', '#5fd6e6', '#f6c08a'], variant: 'diffuse' },
  },
  {
    id: 'eagle-nebula',
    name: 'Eagle Nebula',
    category: 'nebulae',
    designation: 'M16 · Pillars of Creation',
    summary:
      'A star-forming region famous for the Pillars of Creation — towering columns of gas and dust sculpted by young stars.',
    description: [
      'The Eagle Nebula lies about 6,500 light-years away in the constellation Serpens. Inside it, the Pillars of Creation are columns of cold gas and dust where new stars are forming, while intense ultraviolet light from nearby massive stars slowly erodes them.',
      'Hubble’s 1995 image of the pillars became one of the most famous astronomical photographs ever taken. Hubble revisited them in 2014, and in 2022 the James Webb Space Telescope captured them in near-infrared light, peering through the dust to reveal newborn stars glowing inside.',
    ],
    facts: [
      'The tallest pillar is about 4 light-years long.',
      'The nebula surrounds the young star cluster NGC 6611, whose radiation shapes the pillars.',
      'Infrared light passes through dust that blocks visible light, which is why JWST sees stars hidden from Hubble.',
    ],
    stats: [
      { label: 'Distance', value: '≈6,500 light-years' },
      { label: 'Type', value: 'Emission nebula + open cluster' },
      { label: 'Constellation', value: 'Serpens' },
      { label: 'Catalogue', value: 'M16 / NGC 6611' },
    ],
    tags: ['pillars of creation', 'jwst', 'hubble', 'star formation'],
    related: ['orion-nebula', 'helix-nebula', 'sn-1054'],
    art: { kind: 'nebula', seed: 16, palette: ['#e2a35b', '#3fb8a8', '#8b5a2b'], variant: 'pillars' },
  },
  {
    id: 'helix-nebula',
    name: 'Helix Nebula',
    category: 'nebulae',
    designation: 'NGC 7293',
    summary:
      'A planetary nebula — the glowing, expanding shell cast off by a dying Sun-like star.',
    description: [
      'Despite the name, planetary nebulae have nothing to do with planets. Eighteenth-century astronomers, including William Herschel, used the term because these objects looked like small round discs through their telescopes. The Helix, about 650 light-years away in Aquarius, is one of the nearest examples.',
      'At its centre is a white dwarf — the exposed, still-hot core of the original star. Its ultraviolet light makes the shed layers of gas glow. Our own Sun is expected to produce a similar nebula in roughly five billion years.',
    ],
    facts: [
      'The Helix spans about 2.5 light-years.',
      'It contains thousands of comet-shaped clumps of gas known as cometary knots.',
      'Planetary nebulae typically glow for only a few tens of thousands of years before fading.',
    ],
    stats: [
      { label: 'Distance', value: '≈650 light-years' },
      { label: 'Type', value: 'Planetary nebula' },
      { label: 'Constellation', value: 'Aquarius' },
      { label: 'Central star', value: 'White dwarf' },
    ],
    tags: ['planetary nebula', 'white dwarf', 'stellar death', 'aquarius'],
    related: ['orion-nebula', 'eagle-nebula', 'cassiopeia-a'],
    art: { kind: 'nebula', seed: 72, palette: ['#4fa3ff', '#ff5c5c', '#ffd27a'], variant: 'ring' },
  },

  // ── Galaxies ─────────────────────────────────────────────────
  {
    id: 'milky-way',
    name: 'The Milky Way',
    category: 'galaxies',
    designation: 'Our home galaxy',
    summary:
      'Our home galaxy — a barred spiral of hundreds of billions of stars, seen from inside as a river of light across the night sky.',
    description: [
      'The Milky Way is a barred spiral galaxy roughly 100,000 light-years across. Our Sun lies in a minor spiral arm about 26,000 light-years from the centre and takes roughly 230 million years to complete one orbit — a span sometimes called a galactic year.',
      'Because we live inside its disk, we see the Milky Way edge-on, as a glowing band crossing the sky. Most of its mass is not stars at all but dark matter, detectable only through its gravitational pull.',
    ],
    facts: [
      'It contains an estimated 100–400 billion stars.',
      'The supermassive black hole Sagittarius A* lies at its centre.',
      'It belongs to the Local Group, alongside the Andromeda and Triangulum galaxies and dozens of dwarf galaxies.',
    ],
    stats: [
      { label: 'Diameter', value: '≈100,000 light-years' },
      { label: 'Stars', value: '100–400 billion' },
      { label: 'Type', value: 'Barred spiral' },
      { label: 'Sun’s orbit', value: '≈230 million years' },
    ],
    tags: ['home', 'barred spiral', 'local group', 'dark matter'],
    related: ['sagittarius-a-star', 'andromeda', 'whirlpool-galaxy'],
    art: { kind: 'galaxy', seed: 5, variant: 'barred', palette: ['#ffe2b0', '#9fc3ff', '#ff9ec7'] },
  },
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy',
    category: 'galaxies',
    designation: 'M31',
    summary:
      'The nearest large spiral galaxy, and the most distant object most people can see with the naked eye.',
    description: [
      'The Andromeda Galaxy lies about 2.5 million light-years away and contains roughly a trillion stars. In the 1920s Edwin Hubble identified Cepheid variable stars in Andromeda and used them to measure its distance, proving it lies far beyond the Milky Way — and that the universe contains other galaxies.',
      'Andromeda is approaching the Milky Way at about 110 kilometres per second. A future merger between the two galaxies has long been predicted, although recent studies using updated measurements suggest the outcome is less certain than once thought.',
    ],
    facts: [
      'The light we see from Andromeda tonight left it about 2.5 million years ago.',
      'Andromeda is larger in diameter than the Milky Way.',
      'It has its own retinue of satellite galaxies, including M32 and M110.',
    ],
    stats: [
      { label: 'Distance', value: '≈2.5 million light-years' },
      { label: 'Stars', value: '≈1 trillion' },
      { label: 'Type', value: 'Spiral' },
      { label: 'Constellation', value: 'Andromeda' },
    ],
    tags: ['local group', 'spiral', 'hubble', 'naked eye'],
    related: ['milky-way', 'whirlpool-galaxy', 'm87-star'],
    art: { kind: 'galaxy', seed: 31, variant: 'inclined', palette: ['#ffe9c6', '#c7d7ff', '#ffb38a'] },
  },
  {
    id: 'whirlpool-galaxy',
    name: 'Whirlpool Galaxy',
    category: 'galaxies',
    designation: 'M51',
    summary:
      'A classic “grand design” spiral galaxy locked in a gravitational dance with a smaller companion.',
    description: [
      'The Whirlpool Galaxy lies about 31 million light-years away in Canes Venatici. Its sharply defined spiral arms are thought to be enhanced by its gravitational interaction with NGC 5195, the dwarf galaxy at the tip of one arm.',
      'In 1845 the astronomer Lord Rosse sketched its spiral structure using his giant telescope at Birr Castle in Ireland, making it the first object recognised as having a spiral shape.',
    ],
    facts: [
      'Pink knots along its arms are regions of intense star formation.',
      'Dark dust lanes trace where gas is compressed as it passes through the spiral arms.',
      'Its companion, NGC 5195, appears to be passing behind the Whirlpool’s disk.',
    ],
    stats: [
      { label: 'Distance', value: '≈31 million light-years' },
      { label: 'Type', value: 'Interacting spiral' },
      { label: 'Constellation', value: 'Canes Venatici' },
      { label: 'Companion', value: 'NGC 5195' },
    ],
    tags: ['grand design', 'interacting', 'spiral', 'messier'],
    related: ['andromeda', 'milky-way', 'orion-nebula'],
    art: { kind: 'galaxy', seed: 51, variant: 'companion', palette: ['#fff1d6', '#8fb7ff', '#ff7fb0'] },
  },

  // ── Exoplanets ───────────────────────────────────────────────
  {
    id: '51-pegasi-b',
    name: '51 Pegasi b',
    category: 'exoplanets',
    designation: 'The first “hot Jupiter”',
    summary:
      'The first planet found orbiting a Sun-like star — a scorching “hot Jupiter” that rewrote ideas about how planetary systems form.',
    description: [
      'Announced in 1995 by Michel Mayor and Didier Queloz, 51 Pegasi b orbits its star every 4.2 days. It was detected by the radial-velocity method: the planet’s gravity makes its star wobble slightly, shifting the star’s light back and forth in a regular rhythm.',
      'A giant planet that close to its star was a shock — no such world exists in our solar system. It suggested that planets can migrate far from where they formed. Mayor and Queloz shared the 2019 Nobel Prize in Physics for the discovery.',
    ],
    facts: [
      'The system is about 50 light-years from Earth.',
      'It orbits at about 0.05 astronomical units — far closer than Mercury is to the Sun.',
      'Its minimum mass is about half that of Jupiter.',
    ],
    stats: [
      { label: 'Distance', value: '≈50 light-years' },
      { label: 'Orbital period', value: '4.2 days' },
      { label: 'Mass (minimum)', value: '≈0.46 Jupiter masses' },
      { label: 'Discovered', value: '1995 (radial velocity)' },
    ],
    tags: ['hot jupiter', 'radial velocity', 'nobel', 'pegasus'],
    related: ['proxima-b', 'trappist-1', 'orion-nebula'],
    art: { kind: 'exoplanet', seed: 95, variant: 'hot-jupiter', palette: ['#ffb36b', '#c4472c', '#fff1c1'] },
  },
  {
    id: 'proxima-b',
    name: 'Proxima Centauri b',
    category: 'exoplanets',
    designation: 'Nearest known exoplanet',
    summary:
      'A planet at least as massive as Earth orbiting the closest star to the Sun, inside its star’s habitable zone.',
    description: [
      'Proxima Centauri, a small red dwarf 4.24 light-years away, is the nearest star to the Sun. In 2016 astronomers announced Proxima b, a planet with a minimum mass about 1.07 times Earth’s that orbits every 11.2 days within the zone where liquid water could, in principle, exist.',
      'Whether Proxima b could actually be habitable is uncertain. Red dwarfs like Proxima unleash powerful flares that could strip away a planet’s atmosphere, and the planet is probably tidally locked, with one side in permanent daylight.',
    ],
    facts: [
      'It is the closest known exoplanet to Earth.',
      'A year on Proxima b lasts just 11.2 Earth days.',
      'It was found through the radial-velocity method during the “Pale Red Dot” observing campaign.',
    ],
    stats: [
      { label: 'Distance', value: '4.24 light-years' },
      { label: 'Orbital period', value: '11.2 days' },
      { label: 'Mass (minimum)', value: '≈1.07 Earths' },
      { label: 'Discovered', value: '2016' },
    ],
    tags: ['habitable zone', 'red dwarf', 'nearest', 'alpha centauri'],
    related: ['trappist-1', '51-pegasi-b', 'sgr-1806-20'],
    art: { kind: 'exoplanet', seed: 4, variant: 'red-dwarf', palette: ['#ff6a3d', '#7a8c9e', '#c9b8a6'] },
  },
  {
    id: 'trappist-1',
    name: 'TRAPPIST-1 System',
    category: 'exoplanets',
    designation: 'Seven Earth-sized worlds',
    summary:
      'Seven Earth-sized planets packed around a small, cool red dwarf — a natural laboratory for studying rocky worlds.',
    description: [
      'TRAPPIST-1 is an ultracool red dwarf about 40 light-years away, only slightly larger than Jupiter. Between 2016 and 2017, the TRAPPIST telescope and NASA’s Spitzer Space Telescope revealed seven planets crossing in front of it, each dimming the star slightly.',
      'All seven orbit closer to their star than Mercury does to the Sun. Several of them, including TRAPPIST-1e, f and g, lie in the zone where liquid water could exist. The James Webb Space Telescope is now testing whether any of them hold on to atmospheres.',
    ],
    facts: [
      'The outermost planet completes an orbit in about 19 days.',
      'The planets’ orbits form a resonant chain, with their periods linked by simple ratios.',
      'From the surface of one planet, its neighbours could appear larger in the sky than the Moon does from Earth.',
    ],
    stats: [
      { label: 'Distance', value: '≈40 light-years' },
      { label: 'Planets', value: '7 (Earth-sized)' },
      { label: 'Star', value: 'Ultracool red dwarf' },
      { label: 'Announced', value: '2017 (all seven)' },
    ],
    tags: ['transit', 'habitable zone', 'jwst', 'red dwarf'],
    related: ['proxima-b', '51-pegasi-b', 'orion-nebula'],
    art: { kind: 'exoplanet', seed: 7, variant: 'system', palette: ['#ff5a36', '#b7a08a', '#6f8aa6'] },
  },

  // ── Supernovae ───────────────────────────────────────────────
  {
    id: 'sn-1987a',
    name: 'Supernova 1987A',
    category: 'supernovae',
    designation: 'SN 1987A',
    summary:
      'The closest supernova seen since the invention of the telescope — and the first detected through its neutrinos.',
    description: [
      'On 23 February 1987, a blue supergiant star in the Large Magellanic Cloud, about 168,000 light-years away, exploded. The supernova was visible to the naked eye from the Southern Hemisphere and became the most studied stellar explosion in history.',
      'Hours before its light arrived, detectors in Japan, the United States and Russia recorded a burst of about two dozen neutrinos — direct evidence of a collapsing stellar core. In 2024, James Webb Space Telescope observations provided strong evidence for a neutron star hidden at its centre.',
    ],
    facts: [
      'The star that exploded was catalogued as Sanduleak −69° 202.',
      'A ring of gas shed by the star thousands of years earlier lights up like a “string of pearls” as the blast wave hits it.',
      'It was the first supernova since 1604 visible to the naked eye.',
    ],
    stats: [
      { label: 'Distance', value: '≈168,000 light-years' },
      { label: 'Host', value: 'Large Magellanic Cloud' },
      { label: 'Type', value: 'Core-collapse (Type II)' },
      { label: 'Observed', value: '1987' },
    ],
    tags: ['neutrinos', 'magellanic cloud', 'core collapse', 'jwst'],
    related: ['sn-1054', 'cassiopeia-a', 'gw170817'],
    art: { kind: 'supernova', seed: 87, variant: 'ring', palette: ['#ffe9b8', '#ff8a5c', '#7fb6ff'] },
  },
  {
    id: 'sn-1054',
    name: 'SN 1054 & the Crab Nebula',
    category: 'supernovae',
    designation: 'M1',
    summary:
      'A “guest star” recorded by astronomers in 1054 whose debris still expands today as the Crab Nebula.',
    description: [
      'In July 1054, Chinese astronomers recorded a new star in the constellation Taurus, bright enough to be seen in daylight for about three weeks. The remnant of that explosion is the Crab Nebula, about 6,500 light-years away, which is still expanding at around 1,500 kilometres per second.',
      'At the heart of the nebula spins the Crab Pulsar — a neutron star rotating about 30 times per second. Its energy powers the nebula’s eerie blue-white glow.',
    ],
    facts: [
      'Records describe the star as visible in daylight for 23 days.',
      'The Crab Nebula is the first entry, M1, in Charles Messier’s 18th-century catalogue.',
      'The nebula now spans about 11 light-years.',
    ],
    stats: [
      { label: 'Distance', value: '≈6,500 light-years' },
      { label: 'Remnant', value: 'Crab Nebula (M1)' },
      { label: 'Constellation', value: 'Taurus' },
      { label: 'Recorded', value: '1054 CE' },
    ],
    tags: ['crab nebula', 'historical', 'pulsar', 'remnant'],
    related: ['psr-b1919', 'cassiopeia-a', 'eagle-nebula'],
    art: { kind: 'supernova', seed: 54, variant: 'filaments', palette: ['#9fd3ff', '#ff7b54', '#ffd27a'] },
  },
  {
    id: 'cassiopeia-a',
    name: 'Cassiopeia A',
    category: 'supernovae',
    designation: 'Cas A',
    summary:
      'The remains of a star whose light reached Earth around 1680 — now one of the brightest radio sources in the sky.',
    description: [
      'Cassiopeia A is a supernova remnant about 11,000 light-years away. Light from the explosion should have reached Earth around 1680, yet there is no definitive record of anyone seeing it — perhaps because dust dimmed the outburst.',
      'Its expanding shell, about 10 light-years across, is rich in silicon, sulfur, calcium and iron forged inside the star. The Chandra X-ray Observatory’s first-light image in 1999 revealed a compact object at the centre: the collapsed core left behind.',
    ],
    facts: [
      'It is among the youngest known supernova remnants in the Milky Way.',
      'Cassiopeia A is one of the brightest radio sources beyond the solar system.',
      'Its debris is expanding at thousands of kilometres per second.',
    ],
    stats: [
      { label: 'Distance', value: '≈11,000 light-years' },
      { label: 'Type', value: 'Core-collapse remnant' },
      { label: 'Constellation', value: 'Cassiopeia' },
      { label: 'Light arrived', value: 'c. 1680' },
    ],
    tags: ['remnant', 'chandra', 'radio', 'heavy elements'],
    related: ['sn-1987a', 'sn-1054', 'helix-nebula'],
    art: { kind: 'supernova', seed: 168, variant: 'shell', palette: ['#7cffb2', '#ff6b8b', '#6fa8ff'] },
  },

  // ── Neutron stars ────────────────────────────────────────────
  {
    id: 'psr-b1919',
    name: 'PSR B1919+21',
    category: 'neutron-stars',
    designation: 'The first pulsar',
    summary:
      'The first pulsar ever discovered — a spinning neutron star whose clockwork radio pulses were once nicknamed “LGM-1”.',
    description: [
      'In 1967 Jocelyn Bell Burnell, a graduate student at Cambridge, noticed an odd signal in radio telescope data: pulses arriving every 1.337 seconds. The signal was so regular that the team half-jokingly labelled it LGM-1, for “Little Green Men”.',
      'More pulsars soon revealed the natural explanation: a rapidly rotating neutron star sweeping beams of radio waves across Earth like a lighthouse. Antony Hewish shared the 1974 Nobel Prize in Physics for the discovery, while Bell Burnell’s exclusion became a widely discussed omission.',
    ],
    facts: [
      'Its pulses repeat every 1.337 seconds.',
      'In 2018 Bell Burnell received a Special Breakthrough Prize and donated the award to help under-represented students become physics researchers.',
      'A plot of its pulses inspired the cover of Joy Division’s 1979 album “Unknown Pleasures”.',
    ],
    stats: [
      { label: 'Pulse period', value: '1.337 s' },
      { label: 'Discovered', value: '1967' },
      { label: 'Constellation', value: 'Vulpecula' },
      { label: 'Type', value: 'Radio pulsar' },
    ],
    tags: ['pulsar', 'radio', 'bell burnell', 'lighthouse'],
    related: ['sn-1054', 'gw170817', 'sgr-1806-20'],
    art: { kind: 'neutron', seed: 19, variant: 'pulsar', palette: ['#bfe6ff', '#72cfff', '#9a83ff'] },
  },
  {
    id: 'gw170817',
    name: 'GW170817',
    category: 'neutron-stars',
    designation: 'Neutron-star merger',
    summary:
      'The first neutron-star collision observed in both gravitational waves and light — a cosmic forge of gold and platinum.',
    description: [
      'On 17 August 2017, the LIGO and Virgo detectors recorded gravitational waves from two neutron stars spiralling together about 130 million light-years away, in the galaxy NGC 4993. About 1.7 seconds later, space telescopes detected a short burst of gamma rays, and observatories around the world turned to watch the afterglow.',
      'That afterglow — a kilonova — showed the signatures of freshly made heavy elements, supporting the idea that such mergers produce much of the universe’s gold and platinum. The event also confirmed that gravitational waves travel at the speed of light.',
    ],
    facts: [
      'It launched “multi-messenger” astronomy using gravitational waves together with light.',
      'Dozens of observatories, on the ground and in space, followed the event across the electromagnetic spectrum.',
      'The gravitational-wave signal lasted about 100 seconds as the neutron stars spiralled inwards.',
    ],
    stats: [
      { label: 'Distance', value: '≈130 million light-years' },
      { label: 'Host galaxy', value: 'NGC 4993' },
      { label: 'Detected', value: '17 Aug 2017' },
      { label: 'Messengers', value: 'Gravitational waves + light' },
    ],
    tags: ['gravitational waves', 'kilonova', 'ligo', 'gold'],
    related: ['psr-b1919', 'sn-1987a', 'sgr-1806-20'],
    art: { kind: 'neutron', seed: 17, variant: 'merger', palette: ['#ffe0a3', '#72cfff', '#ff8fd1'] },
  },
  {
    id: 'sgr-1806-20',
    name: 'SGR 1806−20',
    category: 'neutron-stars',
    designation: 'Magnetar',
    summary:
      'A magnetar — a neutron star with an extreme magnetic field whose 2004 giant flare was detected across the galaxy.',
    description: [
      'Magnetars are neutron stars with magnetic fields up to a thousand times stronger than those of ordinary neutron stars — around a thousand trillion times Earth’s. On 27 December 2004, SGR 1806−20, on the far side of the Milky Way, unleashed a giant flare that in a fraction of a second released more energy than the Sun emits in about 100,000 years.',
      'The flash of gamma rays was strong enough to measurably disturb Earth’s upper atmosphere, despite the magnetar lying tens of thousands of light-years away.',
    ],
    facts: [
      'A typical neutron star packs about 1.4 times the Sun’s mass into a sphere roughly 20 km across.',
      'A teaspoon of neutron-star material would weigh on the order of a billion tonnes on Earth.',
      'Magnetars are thought to power some of the brief, intense radio flashes known as fast radio bursts.',
    ],
    stats: [
      { label: 'Distance', value: '≈30,000–50,000 ly (uncertain)' },
      { label: 'Type', value: 'Magnetar (soft gamma repeater)' },
      { label: 'Constellation', value: 'Sagittarius' },
      { label: 'Giant flare', value: '27 Dec 2004' },
    ],
    tags: ['magnetar', 'gamma rays', 'magnetic field', 'flare'],
    related: ['psr-b1919', 'gw170817', 'cygnus-x-1'],
    art: { kind: 'neutron', seed: 18, variant: 'magnetar', palette: ['#d9c2ff', '#9a83ff', '#72cfff'] },
  },
];

const DISCOVERY_MAP = new Map(DISCOVERIES.map((d) => [d.id, d]));
const CATEGORY_MAP = new Map(DISCOVERY_CATEGORIES.map((c) => [c.id, c]));

export function getDiscovery(id) {
  return DISCOVERY_MAP.get(id) ?? null;
}

export function getCategory(id) {
  return CATEGORY_MAP.get(id) ?? null;
}
