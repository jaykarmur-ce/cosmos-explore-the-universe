# COSMOS — Explore the Universe

An immersive, frontend-only universe exploration site built with **React**,
**Vite**, **Three.js / React Three Fiber**, **Drei** and **Framer Motion**.

Fly through a live 3D model of the solar system, open a discovery page for
every planet, compare worlds side by side, browse black holes, nebulae and
exoplanets, follow the history of spaceflight and test yourself with a quiz.
No backend, accounts or paid APIs: all content is local, and personal data
(favourites, progress, quiz scores, preferences) stays in `localStorage`.

---

## Quick start

Requirements: **Node.js 18+** (tested with Node 24) and npm.

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build and local preview:

```bash
npm run build      # outputs to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

Deep links such as `/planets/mars` or `/compare?a=earth&b=jupiter` work in both
`dev` and `preview`.

### Deploying

- **Netlify:** run `npm run build` and drag the `dist/` folder onto
  app.netlify.com/drop, or use `npx netlify deploy --prod --dir=dist`. The
  included `public/_redirects` makes deep links work.
- **Vercel:** import the project, or run `npx vercel --prod`. `vercel.json`
  sets the build command, the output folder and the SPA rewrite.
- **Any other static host:** upload `dist/` and configure a fallback that
  serves `index.html` for unknown paths.
- **claude.ai Artifact:** `npm run build:artifact` produces `dist-artifact/`
  with relative asset paths, hash-based routing (`#/planets/mars`), embedded
  Latin font subsets and an `index.html` without the document wrapper, ready to
  publish as a multi-file artifact.

---

## Features

| Area | What it does |
| --- | --- |
| **Home** | Cinematic hero with a procedurally textured 3D Earth and Moon, mouse parallax, a live UTC clock, real coordinates of the galactic centre, and links into every module. |
| **Solar System Explorer** (`/explore`) | Sun + 8 planets + Moon + asteroid belt. Orbit, zoom and pan with mouse or touch. Planets sit at their **real mean longitudes for today's date** and orbit at an adjustable time scale (2–200 days/second) with a live simulated date. Pause/resume, jump to today, toggle orbits and labels, reset the camera. Selecting a body flies the camera to it, follows it along its orbit and opens a data panel. Keyboard: `0–8` select, `Space` pause, `R` reset, `O` orbits, `L` labels, `Esc` close, `?` help. |
| **Planet pages** (`/planets/:id`) | Interactive 3D model, overview, 8 key statistics with units, profile, facts, Earth comparison bars, a weight calculator, computed rankings among the planets, sources and previous/next navigation. Also available for the Sun. |
| **Compare** (`/compare?a=&b=`) | Any two planets: relative-size discs drawn to scale, bars for diameter, mass, gravity, day, year, distance and surface pressure, a shared temperature axis, "larger" badges, generated summary sentences, swap and reset. All values are calculated from the dataset. |
| **Beyond Our Solar System** (`/discoveries`) | 18 curated objects in 6 categories with search, category filters (kept in the URL), procedural illustrations, detail pages with facts and related discoveries. "Back to collection" restores your filters. |
| **Mission Control** (`/mission-control`) | Tabbed console: exploration log (real progress from `localStorage`), quick compare, planet quick access, a random quick-challenge question, favourites preview, a searchable directory of all 27 objects, and an interactive timeline of 29 milestones (completed and planned clearly marked) with a detail dialog. |
| **Quiz** (`/quiz`) | 45 curated questions across planets, stars, galaxies, black holes and missions; Easy / Medium / Hard / Mixed; 5 or 10 questions; randomised question and option order; instant feedback with explanations; optional 25-second timer that pauses when the tab is hidden; answer review; best scores saved per level. |
| **Favorites** (`/favorites`) | Save planets and deep-space objects; filter, sort, remove with undo, clear all. Synced across tabs and persisted after reload. |

### Mouse-over interactivity

- **3D explorer** — hovering a planet enlarges it, lights up its orbit, shows a
  reticle and a live info card (category, distance, temperature, moons).
  Hovering an item in the planet list highlights the planet in 3D and the
  reverse, and spins the list thumbnail.
- **Cards** (planets, modules, discoveries, timeline, favourites, quiz levels)
  tilt toward the cursor, with a spotlight and a glowing border that follow the
  pointer. Discovery illustrations drift with parallax, and planet thumbnails
  spin and reveal extra data while hovered.
- **Hero** — Earth leans toward the cursor, spins faster while the pointer is
  over it, and the camera drifts with mouse movement.

All hover effects are disabled for touch input and in reduced-effects mode.

### Accessibility and performance

- Visible focus styles, skip link, labelled controls, `aria-pressed` /
  `aria-live` states, a keyboard-operable tab list and a focus-trapped dialog.
- **Reduced-effects mode** (button in the navigation bar or footer). It follows
  `prefers-reduced-motion` by default and turns off animations, parallax,
  twinkling and tilt, lowers the render resolution and uses smaller textures.
- Pages are lazy-loaded. Three.js is split into its own chunk, and only pages
  with 3D scenes load it.
- Surface maps are generated in a pool of **Web Workers** with real progress
  reporting. They are cached for the session and fall back to the main thread
  if workers are unavailable.
- The explorer scene is memoised, so unrelated UI state (favourites, panel
  content) doesn't re-render it. Simulation time lives outside React.
- GPU textures, geometries and materials are disposed on unmount.
- Without WebGL, the explorer shows a 2D orbital map with the same selection
  and info panel, and planet pages show 2D renders.

---

## Project structure

```
src/
  App.jsx, main.jsx, routes.js      Routes, providers, lazy pages
  pages/                            Home, SolarSystem, PlanetDetail, Discoveries,
                                    DiscoveryDetail, Compare, MissionControl,
                                    Quiz, Favorites, NotFound (+ page CSS)
  components/                       Nav, Footer, TiltCard, PlanetThumb,
                                    CosmicIllustration, DiscoveryCard, Dialog,
                                    SceneLoader, ErrorBoundary, …
  components/three/                 PlanetBody, Atmosphere (shader), Rings,
                                    SunBody, Starfield (shader), HeroScene,
                                    PlanetViewer
  components/solar-system/          SolarSystemScene, OrbitingBody, CameraRig,
                                    OrbitPath, AsteroidBelt, SelectionMarker,
                                    PlanetRail, ControlDock, InfoPanel,
                                    SimReadout, layout.js (scaling), simClock.js
  components/mission/               Timeline, Directory, ProgressLog,
                                    QuickChallenge
  context/                          Favorites, Preferences, Progress providers
  data/                             planets, discoveries, timeline, quiz,
                                    sources, textureManifest
  hooks/                            useLocalStorage, useMediaQuery, useInView, …
  lib/noise.js                      Seeded 3D simplex noise + fBm
  lib/textures/                     Procedural surface generators, worker
                                    pool/cache, ring/glow canvases
  lib/illustrations/                Procedural deep-space illustrations
  utils/                            format, compare, astro, bodyStats, helpers
  styles/                           tokens.css, global.css, layout.css
public/textures/README.md           How to add real texture images
```

---

## Adding or replacing planet textures

See [`public/textures/README.md`](public/textures/README.md). In short, drop
2:1 equirectangular images into `public/textures/` and list them in
`src/data/textureManifest.js`. Missing or broken images fall back to the
procedural surfaces automatically.

---

## Scientific data and sources

- Planet statistics: **NASA NSSDCA Planetary Fact Sheet** (metric) and **Sun
  Fact Sheet**. Units are fixed per field and documented at the top of
  `src/data/planets.js`.
- Moon counts are **dated (Nov 2025)**, from IAU Minor Planet Center
  announcements as compiled by Sky & Telescope. Counts for the giant planets
  change often.
- Planet positions use mean longitudes from **JPL "Approximate Positions of the
  Planets"** (J2000 elements).
- Exoplanet milestone: NASA Exoplanet Archive (6,000 confirmed, Sept 2025).
- Timeline dates come from NASA, ESA and ISRO mission records. Artemis II
  (April 2026) is listed as completed. Dragonfly's launch (2028) and Europa
  Clipper's arrival (2030) are marked **planned**.

Ratios, rankings, light-travel times and comparison sentences are computed from
these values at runtime, not hard-coded.

---

## Limitations and simplified visualisations

- **The explorer is not to scale.** Planet radii use a square-root scale, the
  Sun is drawn far smaller than it really is, and orbital distances are
  compressed with a power law (≈ distance^0.55). The UI labels this ("Compressed
  scale · not to scale") and explains the rules.
- Orbits are drawn as **circular and coplanar**. Positions use mean (not true)
  longitudes, so eccentric orbits such as Mercury's and Mars's can be off by
  several degrees. Orbital inclinations are ignored.
- **Axial rotation is slowed** for visibility and doesn't follow the simulation
  time scale. The Moon's orbit distance is compressed. The asteroid belt is
  illustrative and rotates as a single body.
- Planet surfaces are **procedural approximations**: their continents, storms
  and craters are artistic, not maps of real features. Deep-space images are
  **illustrations, not photographs**, and are labelled as such.
- Gravity and temperature for the giant planets are given at the 1-bar
  pressure level, as in NASA's fact sheet.
- Progress, favourites and scores live in one browser's `localStorage`. They
  don't sync across devices and are lost if site data is cleared.
- Ambient audio isn't included, so there is no mute control.
