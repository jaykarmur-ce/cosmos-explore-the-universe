/**
 * Space knowledge question bank.
 *
 * Each question lists its choices with the correct one at `answer` (index).
 * Choice order is shuffled at runtime, so the correct answer is tracked by
 * value rather than by position.
 */

export const QUIZ_LEVELS = [
  { id: 'easy', label: 'Cadet', difficulty: 'Easy', description: 'Core facts about the planets, the Sun and famous missions.' },
  { id: 'medium', label: 'Navigator', difficulty: 'Medium', description: 'Planet quirks, telescopes and landmark discoveries.' },
  { id: 'hard', label: 'Commander', difficulty: 'Hard', description: 'Deep-space physics, precise numbers and mission history.' },
  { id: 'mixed', label: 'Mission Mix', difficulty: 'Mixed', description: 'A random blend drawn from every level.' },
];

export const QUIZ_CATEGORIES = {
  planets: 'Planets',
  stars: 'Stars',
  galaxies: 'Galaxies',
  'black-holes': 'Black holes',
  missions: 'Missions',
};

export const QUESTIONS = [
  // ── Easy ───────────────────────────────────────────────────────
  {
    id: 'e1', difficulty: 'easy', category: 'planets',
    prompt: 'Which planet orbits closest to the Sun?',
    choices: ['Mercury', 'Venus', 'Mars', 'Earth'], answer: 0,
    explanation: 'Mercury orbits at an average of about 57.9 million km from the Sun, completing a lap every 88 days.',
  },
  {
    id: 'e2', difficulty: 'easy', category: 'planets',
    prompt: 'What is the largest planet in our solar system?',
    choices: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'], answer: 1,
    explanation: 'Jupiter is about 143,000 km wide — roughly 11 times the diameter of Earth.',
  },
  {
    id: 'e3', difficulty: 'easy', category: 'planets',
    prompt: 'Which planet is known as the Red Planet?',
    choices: ['Venus', 'Jupiter', 'Mars', 'Mercury'], answer: 2,
    explanation: 'Iron oxide — essentially rust — in Martian dust and rock gives Mars its reddish colour.',
  },
  {
    id: 'e4', difficulty: 'easy', category: 'stars',
    prompt: 'What kind of object is the Sun?',
    choices: ['A planet', 'A star', 'A nebula', 'A comet'], answer: 1,
    explanation: 'The Sun is a G-type main-sequence star that generates energy by fusing hydrogen into helium in its core.',
  },
  {
    id: 'e5', difficulty: 'easy', category: 'planets',
    prompt: 'Which planet is famous for its bright, wide ring system?',
    choices: ['Saturn', 'Mars', 'Mercury', 'Venus'], answer: 0,
    explanation: 'All four giant planets have rings, but Saturn’s icy rings are by far the brightest and most extensive.',
  },
  {
    id: 'e6', difficulty: 'easy', category: 'missions',
    prompt: 'Who was the first human to travel into space?',
    choices: ['Neil Armstrong', 'Yuri Gagarin', 'Alan Shepard', 'John Glenn'], answer: 1,
    explanation: 'Yuri Gagarin orbited Earth aboard Vostok 1 on 12 April 1961.',
  },
  {
    id: 'e7', difficulty: 'easy', category: 'missions',
    prompt: 'Which mission first landed humans on the Moon?',
    choices: ['Apollo 8', 'Apollo 13', 'Apollo 11', 'Gemini 4'], answer: 2,
    explanation: 'Apollo 11 landed on 20 July 1969; Neil Armstrong and Buzz Aldrin walked on the Moon.',
  },
  {
    id: 'e8', difficulty: 'easy', category: 'galaxies',
    prompt: 'What is the name of the galaxy that contains our solar system?',
    choices: ['Andromeda', 'The Milky Way', 'The Whirlpool', 'Triangulum'], answer: 1,
    explanation: 'The Milky Way is a barred spiral galaxy about 100,000 light-years across.',
  },
  {
    id: 'e9', difficulty: 'easy', category: 'planets',
    prompt: 'How many planets are in our solar system?',
    choices: ['7', '8', '9', '10'], answer: 1,
    explanation: 'There are eight planets. Pluto was reclassified as a dwarf planet by the International Astronomical Union in 2006.',
  },
  {
    id: 'e10', difficulty: 'easy', category: 'stars',
    prompt: 'A light-year is a measure of…',
    choices: ['Time', 'Distance', 'Brightness', 'Speed'], answer: 1,
    explanation: 'A light-year is the distance light travels in one year — about 9.46 trillion kilometres.',
  },
  {
    id: 'e11', difficulty: 'easy', category: 'planets',
    prompt: 'Which planet has the hottest average surface temperature?',
    choices: ['Mercury', 'Venus', 'Mars', 'Jupiter'], answer: 1,
    explanation: 'Venus averages about 464 °C because its thick carbon dioxide atmosphere traps heat — hotter than Mercury, which is closer to the Sun.',
  },
  {
    id: 'e12', difficulty: 'easy', category: 'black-holes',
    prompt: 'What is the boundary around a black hole beyond which nothing can escape called?',
    choices: ['The photon sphere', 'The event horizon', 'The corona', 'The accretion disk'], answer: 1,
    explanation: 'Once anything — even light — crosses the event horizon, it cannot escape the black hole’s gravity.',
  },
  {
    id: 'e13', difficulty: 'easy', category: 'stars',
    prompt: 'What are nebulae mainly made of?',
    choices: ['Rock and metal', 'Gas and dust', 'Liquid water', 'Ice and rock only'], answer: 1,
    explanation: 'Nebulae are clouds of gas (mostly hydrogen and helium) and dust — some are stellar nurseries, others are remains of dying stars.',
  },
  {
    id: 'e14', difficulty: 'easy', category: 'planets',
    prompt: 'Which planet has the shortest year?',
    choices: ['Mercury', 'Venus', 'Earth', 'Mars'], answer: 0,
    explanation: 'Mercury completes an orbit around the Sun every 88 Earth days.',
  },

  // ── Medium ─────────────────────────────────────────────────────
  {
    id: 'm1', difficulty: 'medium', category: 'planets',
    prompt: 'Which planet has the shortest day (fastest rotation)?',
    choices: ['Saturn', 'Earth', 'Jupiter', 'Neptune'], answer: 2,
    explanation: 'Jupiter rotates once in about 9.9 hours — the fastest of any planet.',
  },
  {
    id: 'm2', difficulty: 'medium', category: 'planets',
    prompt: 'Which planet rotates almost on its side, with an axial tilt of about 98°?',
    choices: ['Neptune', 'Saturn', 'Uranus', 'Venus'], answer: 2,
    explanation: 'Uranus is tipped by about 98°, probably the result of a giant impact early in its history.',
  },
  {
    id: 'm3', difficulty: 'medium', category: 'planets',
    prompt: 'On which planet does one rotation take longer than one orbit around the Sun?',
    choices: ['Mercury', 'Venus', 'Mars', 'Neptune'], answer: 1,
    explanation: 'Venus takes about 243 Earth days to rotate once (retrograde) but only 225 days to orbit the Sun.',
  },
  {
    id: 'm4', difficulty: 'medium', category: 'planets',
    prompt: 'What is the largest moon in the solar system?',
    choices: ['Titan', 'Ganymede', 'Callisto', 'Earth’s Moon'], answer: 1,
    explanation: 'Jupiter’s moon Ganymede is about 5,268 km across — larger than the planet Mercury.',
  },
  {
    id: 'm5', difficulty: 'medium', category: 'stars',
    prompt: 'Roughly how long does sunlight take to reach Earth?',
    choices: ['About 8 seconds', 'About 8 minutes', 'About 8 hours', 'About 1 day'], answer: 1,
    explanation: 'At an average distance of 149.6 million km, sunlight takes about 8 minutes and 20 seconds to arrive.',
  },
  {
    id: 'm6', difficulty: 'medium', category: 'missions',
    prompt: 'Which space telescope launched on 25 December 2021?',
    choices: ['Hubble', 'Spitzer', 'Kepler', 'James Webb'], answer: 3,
    explanation: 'The James Webb Space Telescope observes mainly in infrared from near the Sun–Earth L2 point.',
  },
  {
    id: 'm7', difficulty: 'medium', category: 'missions',
    prompt: 'Which spacecraft was the first to reach interstellar space, in 2012?',
    choices: ['Voyager 1', 'Voyager 2', 'Pioneer 10', 'New Horizons'], answer: 0,
    explanation: 'Voyager 1 crossed the heliopause in August 2012; Voyager 2 followed in November 2018.',
  },
  {
    id: 'm8', difficulty: 'medium', category: 'galaxies',
    prompt: 'What is the nearest large spiral galaxy to the Milky Way?',
    choices: ['The Whirlpool Galaxy', 'The Andromeda Galaxy', 'The Large Magellanic Cloud', 'The Sombrero Galaxy'], answer: 1,
    explanation: 'Andromeda is about 2.5 million light-years away. The Large Magellanic Cloud is closer, but it is a dwarf galaxy, not a large spiral.',
  },
  {
    id: 'm9', difficulty: 'medium', category: 'planets',
    prompt: 'Which planet was found through mathematical prediction before it was observed?',
    choices: ['Uranus', 'Neptune', 'Saturn', 'Mars'], answer: 1,
    explanation: 'Urbain Le Verrier predicted Neptune’s position from irregularities in Uranus’s orbit; Johann Galle observed it in 1846.',
  },
  {
    id: 'm10', difficulty: 'medium', category: 'missions',
    prompt: 'What was the first artificial satellite to orbit Earth?',
    choices: ['Explorer 1', 'Vanguard 1', 'Sputnik 1', 'Telstar 1'], answer: 2,
    explanation: 'The Soviet Union launched Sputnik 1 on 4 October 1957.',
  },
  {
    id: 'm11', difficulty: 'medium', category: 'planets',
    prompt: 'Which planet has an average density lower than that of water?',
    choices: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], answer: 1,
    explanation: 'Saturn’s mean density is about 687 kg/m³, compared with 1,000 kg/m³ for water.',
  },
  {
    id: 'm12', difficulty: 'medium', category: 'stars',
    prompt: 'A neutron star usually forms from…',
    choices: [
      'The collapsed core of a massive star after a supernova',
      'A white dwarf that slowly cools',
      'A gas giant that collapses under its own weight',
      'The merger of two galaxies',
    ],
    answer: 0,
    explanation: 'When a massive star’s core collapses, protons and electrons are crushed together into neutrons, leaving an ultra-dense remnant about 20 km across.',
  },
  {
    id: 'm13', difficulty: 'medium', category: 'black-holes',
    prompt: 'In 2019 the Event Horizon Telescope released the first image of which black hole?',
    choices: ['Sagittarius A*', 'Cygnus X-1', 'M87*', 'TON 618'], answer: 2,
    explanation: 'The image of M87*, in the galaxy Messier 87, was released on 10 April 2019. Sagittarius A* followed in 2022.',
  },
  {
    id: 'm14', difficulty: 'medium', category: 'planets',
    prompt: 'What causes Earth’s seasons?',
    choices: [
      'Changes in Earth’s distance from the Sun',
      'The tilt of Earth’s rotation axis',
      'The 11-year solar cycle',
      'The Moon’s gravitational pull',
    ],
    answer: 1,
    explanation: 'Earth’s 23.4° axial tilt changes how directly sunlight strikes each hemisphere over the year.',
  },
  {
    id: 'm15', difficulty: 'medium', category: 'missions',
    prompt: 'Which mission placed the first lander on a comet, in 2014?',
    choices: ['Deep Impact', 'Rosetta', 'Stardust', 'Giotto'], answer: 1,
    explanation: 'ESA’s Rosetta delivered the Philae lander to comet 67P/Churyumov–Gerasimenko on 12 November 2014.',
  },
  {
    id: 'm16', difficulty: 'medium', category: 'planets',
    prompt: 'Olympus Mons, the tallest volcano known in the solar system, is on which world?',
    choices: ['Venus', 'Io', 'Mars', 'Mercury'], answer: 2,
    explanation: 'Olympus Mons on Mars rises roughly 22 km — about two and a half times the height of Mount Everest.',
  },

  // ── Hard ───────────────────────────────────────────────────────
  {
    id: 'h1', difficulty: 'hard', category: 'stars',
    prompt: 'In which year was 51 Pegasi b — the first exoplanet found around a Sun-like star — announced?',
    choices: ['1989', '1995', '2001', '2009'], answer: 1,
    explanation: 'Michel Mayor and Didier Queloz announced 51 Pegasi b in 1995 and shared the 2019 Nobel Prize in Physics.',
  },
  {
    id: 'h2', difficulty: 'hard', category: 'stars',
    prompt: 'Who discovered the first pulsar in 1967 while a graduate student?',
    choices: ['Vera Rubin', 'Jocelyn Bell Burnell', 'Henrietta Swan Leavitt', 'Cecilia Payne-Gaposchkin'], answer: 1,
    explanation: 'Jocelyn Bell Burnell noticed the regular radio pulses of PSR B1919+21, repeating every 1.337 seconds.',
  },
  {
    id: 'h3', difficulty: 'hard', category: 'planets',
    prompt: 'Mercury is locked in which spin–orbit resonance?',
    choices: ['1:1', '2:1', '3:2', '5:3'], answer: 2,
    explanation: 'Mercury rotates three times for every two orbits of the Sun.',
  },
  {
    id: 'h4', difficulty: 'hard', category: 'stars',
    prompt: 'Why was the 2017 event GW170817 historic?',
    choices: [
      'It was the first gravitational-wave detection of any kind',
      'It was the first neutron-star merger seen in both gravitational waves and light',
      'It produced the first image of a black hole',
      'It was the first supernova seen in the Milky Way since 1604',
    ],
    answer: 1,
    explanation: 'The first gravitational-wave detection was GW150914 (two black holes) in 2015. GW170817 was the first merger also observed across the electromagnetic spectrum.',
  },
  {
    id: 'h5', difficulty: 'hard', category: 'stars',
    prompt: 'About how many Earths would fit across the diameter of the Sun?',
    choices: ['About 11', 'About 50', 'About 109', 'About 1,000'], answer: 2,
    explanation: 'The Sun is about 1.39 million km across, roughly 109 times Earth’s diameter.',
  },
  {
    id: 'h6', difficulty: 'hard', category: 'galaxies',
    prompt: 'Supernova 1987A exploded in which galaxy?',
    choices: ['The Andromeda Galaxy', 'The Large Magellanic Cloud', 'The Milky Way', 'The Triangulum Galaxy'], answer: 1,
    explanation: 'SN 1987A occurred in the Large Magellanic Cloud, a satellite galaxy of the Milky Way about 168,000 light-years away.',
  },
  {
    id: 'h7', difficulty: 'hard', category: 'missions',
    prompt: 'By how much did NASA’s DART impact shorten the orbit of Dimorphos around Didymos?',
    choices: ['About 32 seconds', 'About 32 minutes', 'About 3 hours', 'About 12 days'], answer: 1,
    explanation: 'The September 2022 impact shortened the orbit from 11 hours 55 minutes by about 32 minutes.',
  },
  {
    id: 'h8', difficulty: 'hard', category: 'black-holes',
    prompt: 'Approximately how massive is Sagittarius A*, the black hole at the centre of the Milky Way?',
    choices: ['About 400 Suns', 'About 4 million Suns', 'About 6.5 billion Suns', 'About 40 billion Suns'], answer: 1,
    explanation: 'Orbits of stars near the galactic centre reveal a mass of about four million Suns. 6.5 billion is the mass of M87*.',
  },
  {
    id: 'h9', difficulty: 'hard', category: 'missions',
    prompt: 'Which is the only spacecraft to have visited both Uranus and Neptune?',
    choices: ['Voyager 1', 'Voyager 2', 'Cassini', 'New Horizons'], answer: 1,
    explanation: 'Voyager 2 flew past Uranus in 1986 and Neptune in 1989.',
  },
  {
    id: 'h10', difficulty: 'hard', category: 'stars',
    prompt: 'The Chandrasekhar limit, about 1.4 solar masses, is the maximum mass of a stable…',
    choices: ['White dwarf', 'Red dwarf', 'Black hole', 'Brown dwarf'], answer: 0,
    explanation: 'Above about 1.4 solar masses, electron degeneracy pressure can no longer support a white dwarf against gravity.',
  },
  {
    id: 'h11', difficulty: 'hard', category: 'planets',
    prompt: 'Which planet has the fastest winds measured in the solar system?',
    choices: ['Jupiter', 'Saturn', 'Neptune', 'Venus'], answer: 2,
    explanation: 'Winds on Neptune exceed 2,000 km/h, driven by internal heat and very little friction.',
  },
  {
    id: 'h12', difficulty: 'hard', category: 'missions',
    prompt: 'Which mission made the first soft landing near the Moon’s south polar region, in 2023?',
    choices: ['Chang’e 4', 'Luna 25', 'Chandrayaan-3', 'SLIM'], answer: 2,
    explanation: 'India’s Chandrayaan-3 landed at about 69° south on 23 August 2023. Russia’s Luna 25 crashed days earlier.',
  },
  {
    id: 'h13', difficulty: 'hard', category: 'galaxies',
    prompt: 'Roughly how long does the Sun take to orbit the centre of the Milky Way?',
    choices: ['About 230 thousand years', 'About 23 million years', 'About 230 million years', 'About 23 billion years'], answer: 2,
    explanation: 'One “galactic year” lasts roughly 230 million years. The universe is only about 13.8 billion years old, which rules out 23 billion.',
  },
  {
    id: 'h14', difficulty: 'hard', category: 'planets',
    prompt: 'What is the Cassini Division?',
    choices: [
      'A gap between Saturn’s A and B rings',
      'A canyon on Saturn’s moon Titan',
      'A storm in Saturn’s northern hemisphere',
      'The boundary of Saturn’s magnetosphere',
    ],
    answer: 0,
    explanation: 'The roughly 4,800 km-wide gap was discovered by Giovanni Cassini in 1675.',
  },
  {
    id: 'h15', difficulty: 'hard', category: 'black-holes',
    prompt: 'Cygnus X-1 was the subject of a famous scientific bet between Stephen Hawking and…',
    choices: ['Roger Penrose', 'Kip Thorne', 'Carl Sagan', 'John Wheeler'], answer: 1,
    explanation: 'Hawking bet Kip Thorne in 1974 that Cygnus X-1 was not a black hole, and conceded in 1990.',
  },
];

export function questionsForLevel(level) {
  if (level === 'mixed') return QUESTIONS;
  return QUESTIONS.filter((q) => q.difficulty === level);
}
