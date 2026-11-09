import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Orbit, Telescope, Scale, Radar, BrainCircuit, ChevronDown } from 'lucide-react';

import HeroScene from '../components/three/HeroScene.jsx';
import PlanetThumb from '../components/PlanetThumb.jsx';
import TiltCard from '../components/TiltCard.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { PLANETS } from '../data/planets.js';
import { DISCOVERIES } from '../data/discoveries.js';
import { TIMELINE } from '../data/timeline.js';
import { QUESTIONS } from '../data/quiz.js';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useSurfaceSet } from '../lib/textures/surfaceService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { hasWebGL } from '../utils/helpers.js';
import { formatAU, formatNumber, formatters, joinValue } from '../utils/format.js';
import { preloadPath } from '../routes.js';
import './Home.css';

const HERO_SURFACES = ['earth', 'earth-clouds', 'moon'];

const MODULES = [
  {
    to: '/explore',
    icon: Orbit,
    index: '01',
    title: 'Solar System Explorer',
    text: 'Fly through a live 3D model of the Sun and eight planets, positioned for today’s date.',
  },
  {
    to: '/discoveries',
    icon: Telescope,
    index: '02',
    title: 'Beyond Our Solar System',
    text: 'Black holes, nebulae, galaxies, exoplanets, supernovae and neutron stars.',
  },
  {
    to: '/compare',
    icon: Scale,
    index: '03',
    title: 'Compare Planets',
    text: 'Put any two worlds side by side — size, gravity, temperature, days and years.',
  },
  {
    to: '/mission-control',
    icon: Radar,
    index: '04',
    title: 'Mission Control',
    text: 'Your directory, collection, progress log and a timeline of exploration milestones.',
  },
  {
    to: '/quiz',
    icon: BrainCircuit,
    index: '05',
    title: 'Space Knowledge Quiz',
    text: 'Three difficulty levels, instant feedback and personal best scores.',
  },
];

function UtcClock() {
  const ref = useRef(null);
  useEffect(() => {
    const update = () => {
      if (ref.current) ref.current.textContent = new Date().toISOString().slice(11, 19);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span ref={ref} className="mono" />;
}

/** Planet card: tilts toward the cursor, spins its globe and reveals key numbers on hover. */
function PlanetRibbonCard({ planet: p, spin }) {
  const [hover, setHover] = useState(false);
  const day = formatters.dayLength(p.stats.dayLengthHours);
  const year = formatters.orbitalPeriod(p.stats.orbitalPeriodDays);
  return (
    <TiltCard
      as={Link}
      to={`/planets/${p.id}`}
      className="planet-card"
      style={{ '--card-accent': p.accent }}
      onHoverChange={setHover}
      onMouseEnter={() => preloadPath('/planets')}
    >
      <span className="planet-card__index mono">{String(p.order).padStart(2, '0')}</span>
      <PlanetThumb id={p.id} size={112} rotation={0.4 + p.order} spinning={spin && hover} />
      <span className="planet-card__name">{p.name}</span>
      <span className="planet-card__meta">
        {p.category} · {formatAU(p.stats.distanceMkm)}
      </span>
      <span className="planet-card__reveal mono" aria-hidden="true">
        Day {joinValue(day)} · Year {joinValue(year)}
      </span>
      <ArrowUpRight className="planet-card__arrow" aria-hidden="true" />
    </TiltCard>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] } },
});

export default function Home() {
  useDocumentTitle(null);
  const navigate = useNavigate();
  const { reducedEffects } = usePreferences();
  const webgl = useMemo(() => hasWebGL(), []);
  const [sceneFailed, setSceneFailed] = useState(false);
  const heroSurfaces = useSurfaceSet(HERO_SURFACES, reducedEffects ? 512 : 1024);

  const totalMoons = PLANETS.reduce((sum, p) => sum + (p.stats.moons?.count ?? 0), 0);
  const stats = [
    { value: PLANETS.length, label: 'Planets in 3D' },
    { value: totalMoons, label: 'Known moons (Nov 2025)' },
    { value: DISCOVERIES.length, label: 'Deep-space objects' },
    { value: TIMELINE.length, label: 'Mission milestones' },
    { value: QUESTIONS.length, label: 'Quiz questions' },
  ];

  useEffect(() => {
    preloadPath('/explore');
  }, []);

  const scrollToOverview = () => {
    document.getElementById('overview')?.scrollIntoView({ behavior: reducedEffects ? 'auto' : 'smooth' });
  };

  const showScene = webgl && !sceneFailed;

  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero" aria-labelledby="hero-title">
        <div className={`hero__scene${heroSurfaces.done ? ' is-ready' : ''}`}>
          {showScene ? (
            <ErrorBoundary fallback={null} onError={() => setSceneFailed(true)}>
              <HeroScene surfaces={heroSurfaces.surfaces} ready={heroSurfaces.done} reduced={reducedEffects} />
            </ErrorBoundary>
          ) : (
            <div className="hero__fallback">
              <PlanetThumb id="earth" size={420} rotation={1.6} label="Illustration of Earth" />
            </div>
          )}
        </div>
        <div className="hero__vignette" aria-hidden="true" />

        <div className="hero__hud hero__hud--top" aria-hidden="true">
          <span>Galactic centre · Sgr A*</span>
          <span className="mono">RA 17h 45m 40.0s · Dec −29° 00′ 28″</span>
        </div>
        <div className="hero__hud hero__hud--side" aria-hidden="true">
          <span>Earth · 1.000 AU</span>
          <span>Axial tilt 23.44°</span>
          <span>
            UTC <UtcClock />
          </span>
        </div>

        <div className="container hero__content">
          <motion.p className="eyebrow" {...fadeUp(0.1)}>
            Cosmos · An interactive universe
          </motion.p>
          <motion.h1 id="hero-title" className="display hero__title" {...fadeUp(0.2)}>
            Explore
            <br />
            the <span className="hero__title-accent">Infinite</span>
          </motion.h1>
          <motion.p className="lede hero__lede" {...fadeUp(0.35)}>
            Navigate a living model of our solar system, step beyond it to black holes and distant galaxies, and
            measure every world against home — all from your browser.
          </motion.p>
          <motion.div className="hero__actions" {...fadeUp(0.5)}>
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={() => navigate('/explore')}
              onMouseEnter={() => preloadPath('/explore')}
            >
              Begin Exploration <ArrowRight aria-hidden="true" />
            </button>
            <Link to="/discoveries" className="btn btn--lg" onMouseEnter={() => preloadPath('/discoveries')}>
              Discover the Universe
            </Link>
          </motion.div>
          {!heroSurfaces.done && showScene && (
            <p className="label hero__status" role="status">
              Rendering Earth · {heroSurfaces.loaded}/{heroSurfaces.total} surface maps
            </p>
          )}
        </div>

        <button type="button" className="hero__scroll" onClick={scrollToOverview} aria-label="Scroll to overview">
          <span className="label">Scroll</span>
          <ChevronDown aria-hidden="true" />
        </button>
      </section>

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="overview" className="section home-overview" aria-labelledby="overview-title">
        <div className="container">
          <div className="home-overview__grid">
            <div>
              <p className="eyebrow">Mission brief</p>
              <h2 id="overview-title" className="h1 home-overview__title">
                A planetarium, a starship console and a field guide — in one place.
              </h2>
            </div>
            <p className="lede">
              Every number here is calculated from a local, referenced dataset: NASA fact sheets for the planets, dated
              moon counts, and approximate orbital elements that place each planet where it really is in its orbit
              today. Visualisations that compress reality are labelled as such.
            </p>
          </div>
          <dl className="home-stats">
            {stats.map((s) => (
              <div key={s.label} className="home-stats__item">
                <dt className="label">{s.label}</dt>
                <dd className="home-stats__value">{formatNumber(s.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Planet ribbon ────────────────────────────────────── */}
      <section className="section home-planets" aria-labelledby="planets-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">The eight planets</p>
              <h2 id="planets-title" className="h2">
                Choose a world
              </h2>
            </div>
            <Link to="/explore" className="link-arrow">
              Open the explorer <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <ul role="list" className="planet-ribbon">
            {PLANETS.map((p) => (
              <li key={p.id}>
                <PlanetRibbonCard planet={p} spin={!reducedEffects} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Modules ──────────────────────────────────────────── */}
      <section className="section home-modules" aria-labelledby="modules-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Flight plan</p>
              <h2 id="modules-title" className="h2">
                Five ways to explore
              </h2>
            </div>
          </div>
          <ul role="list" className="module-grid">
            {MODULES.map(({ to, icon: Icon, index, title, text }) => (
              <li key={to}>
                <TiltCard as={Link} to={to} tilt={5} className="module-card" onMouseEnter={() => preloadPath(to)}>
                  <span className="module-card__top">
                    <span className="module-card__icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="mono dim">{index}</span>
                  </span>
                  <span className="module-card__title">{title}</span>
                  <span className="module-card__text">{text}</span>
                  <span className="link-arrow module-card__cta">
                    Launch <ArrowRight aria-hidden="true" />
                  </span>
                </TiltCard>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="section home-cta">
        <div className="container home-cta__inner">
          <p className="eyebrow">T-minus zero</p>
          <h2 className="display home-cta__title">Ready for launch?</h2>
          <div className="hero__actions">
            <Link to="/explore" className="btn btn--primary btn--lg">
              Enter the solar system <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/quiz" className="btn btn--lg">
              Test your knowledge
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
