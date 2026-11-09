import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Orbit, Scale, BookOpen, Sparkles, Trophy } from 'lucide-react';

import PlanetViewer from '../components/three/PlanetViewer.jsx';
import PlanetThumb from '../components/PlanetThumb.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import SceneLoader from '../components/SceneLoader.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import NotFound from './NotFound.jsx';

import { BODIES, EARTH, getBody } from '../data/planets.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useSurfaceSet } from '../lib/textures/surfaceService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { bodyStatItems } from '../utils/bodyStats.js';
import { earthComparisons, rankAmongPlanets, ordinal, weightOn } from '../utils/compare.js';
import { lightTravelMinutes } from '../utils/astro.js';
import { formatNumber, formatSmart, formatters, joinValue, formatAU } from '../utils/format.js';
import { hasWebGL } from '../utils/helpers.js';
import './PlanetDetail.css';

const RANKINGS = [
  { key: 'diameterKm', label: 'Size', phrase: (r) => `${ordinal(r)} largest` },
  { key: 'massE24Kg', label: 'Mass', phrase: (r) => `${ordinal(r)} most massive` },
  { key: 'gravityMs2', label: 'Surface gravity', phrase: (r) => `${ordinal(r)} strongest` },
  { key: 'meanTempC', label: 'Temperature', phrase: (r) => `${ordinal(r)} hottest` },
  { key: 'distanceMkm', label: 'Distance', phrase: (r) => `${ordinal(r)} from the Sun`, ascending: true },
  { key: 'dayLengthHours', label: 'Day length', phrase: (r) => `${ordinal(r)} longest day` },
];

function surfaceIdsFor(id) {
  return id === 'earth' ? ['earth', 'earth-clouds'] : [id];
}

function ComparisonRow({ row, body }) {
  const ratio = row.ratio;
  const max = Math.max(ratio, 1);
  return (
    <div className="earth-row">
      <div className="earth-row__head">
        <span className="earth-row__label">{row.label}</span>
        <span className="earth-row__ratio mono">×{formatSmart(ratio)}</span>
      </div>
      <div className="earth-row__bars" aria-hidden="true">
        <span className="earth-row__bar earth-row__bar--planet" style={{ width: `${Math.max(0.6, (ratio / max) * 100)}%` }} />
        <span className="earth-row__bar earth-row__bar--earth" style={{ width: `${Math.max(0.6, (1 / max) * 100)}%` }} />
      </div>
      <p className="visually-hidden">
        {body.name}’s {row.label.toLowerCase()} is {formatSmart(ratio)} times Earth’s.
      </p>
    </div>
  );
}

export default function PlanetDetail() {
  const { id } = useParams();
  const body = getBody(id);
  const { markBodyVisited } = useProgress();
  const { reducedEffects } = usePreferences();
  const webgl = useMemo(() => hasWebGL(), []);
  const [viewerFailed, setViewerFailed] = useState(false);
  const [weight, setWeight] = useState(70);
  useDocumentTitle(body ? body.name : 'Not found');

  const surfaceIds = useMemo(() => surfaceIdsFor(id), [id]);
  const surfaceSet = useSurfaceSet(surfaceIds, reducedEffects ? 512 : 1024);

  useEffect(() => {
    if (body) markBodyVisited(body.id);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [body, markBodyVisited]);

  if (!body) return <NotFound />;

  const index = BODIES.findIndex((b) => b.id === body.id);
  const prev = BODIES[(index - 1 + BODIES.length) % BODIES.length];
  const next = BODIES[(index + 1) % BODIES.length];
  const isPlanet = body.type === 'planet';
  const isEarth = body.id === 'earth';
  const stats = bodyStatItems(body);
  const comparisons = earthComparisons(body);
  const lightMinutes = lightTravelMinutes(body.stats.distanceMkm);
  const year = body.stats.orbitalPeriodDays != null ? formatters.orbitalPeriod(body.stats.orbitalPeriodDays) : null;
  const safeWeight = Number.isFinite(weight) && weight > 0 ? Math.min(weight, 500) : 0;

  return (
    <div className="planet-page" style={{ '--accent': body.accent }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="planet-hero" aria-labelledby="planet-title">
        <div className="planet-hero__glow" aria-hidden="true" />
        <div className="container planet-hero__grid">
          <AnimatePresence mode="wait">
            <motion.div
              key={body.id}
              className="planet-hero__content"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            >
              <nav className="breadcrumb label" aria-label="Breadcrumb">
                <Link to="/explore">Solar System</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{body.name}</span>
              </nav>
              <p className="eyebrow planet-hero__eyebrow">
                {isPlanet ? `Planet ${String(body.order).padStart(2, '0')}` : 'Star'} · {body.category}
              </p>
              <h1 id="planet-title" className="display planet-hero__title">
                {body.name}
              </h1>
              <p className="planet-hero__tagline">{body.tagline}</p>
              <p className="lede">{body.overview}</p>

              <div className="planet-hero__actions">
                <Link to={`/explore?focus=${body.id}`} className="btn btn--primary">
                  <Orbit aria-hidden="true" /> View in solar system
                </Link>
                <FavoriteButton type="planet" id={body.id} name={body.name} />
                {isPlanet && (
                  <Link to={`/compare?a=${body.id}&b=${isEarth ? 'mars' : 'earth'}`} className="btn">
                    <Scale aria-hidden="true" /> Compare with {isEarth ? 'Mars' : 'Earth'}
                  </Link>
                )}
              </div>

              <dl className="planet-hero__quick">
                <div>
                  <dt className="label">From the Sun</dt>
                  <dd className="mono">{isPlanet ? formatAU(body.stats.distanceMkm) : '0 AU'}</dd>
                </div>
                <div>
                  <dt className="label">Sunlight arrives in</dt>
                  <dd className="mono">{lightMinutes != null ? `${formatNumber(lightMinutes, lightMinutes < 60 ? 1 : 0)} min` : '—'}</dd>
                </div>
                <div>
                  <dt className="label">One year</dt>
                  <dd className="mono">{year ? joinValue(year) : '≈230 Myr (galactic)'}</dd>
                </div>
              </dl>
            </motion.div>
          </AnimatePresence>

          <div className="planet-hero__visual">
            {webgl && !viewerFailed ? (
              <ErrorBoundary fallback={null} onError={() => setViewerFailed(true)}>
                <PlanetViewer
                  body={body}
                  surface={surfaceSet.surfaces[body.id]}
                  cloudSurface={surfaceSet.surfaces['earth-clouds']}
                  reduced={reducedEffects}
                />
              </ErrorBoundary>
            ) : (
              <div className="planet-hero__fallback">
                <PlanetThumb id={body.id} size={320} label={`Illustration of ${body.name}`} />
              </div>
            )}
            {webgl && !viewerFailed && <SceneLoader {...surfaceSet} compact />}
            <p className="planet-hero__hint label" aria-hidden="true">
              Drag to rotate · procedural surface
            </p>
          </div>
        </div>
      </section>

      {/* ── Key data ─────────────────────────────────────────── */}
      <section className="container planet-section" aria-labelledby="data-title">
        <div className="planet-section__head">
          <p className="eyebrow">Scientific data</p>
          <h2 id="data-title" className="h2">
            {body.name} by the numbers
          </h2>
        </div>
        <dl className="planet-stats">
          {stats.map((s) => (
            <div key={s.key} className="stat">
              <dt className="label">{s.label}</dt>
              <dd>
                <span className="stat__value">{s.value}</span>
                {s.unit && <span className="stat__unit">{s.unit}</span>}
              </dd>
              <dd className="stat__sub">{s.sub}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Profile & facts ──────────────────────────────────── */}
      <section className="container planet-section planet-split" aria-label={`${body.name} profile and facts`}>
        <div className="panel panel--pad">
          <p className="eyebrow">Profile</p>
          <dl className="profile-list">
            <div>
              <dt className="label">Atmosphere</dt>
              <dd>{body.atmosphere}</dd>
            </div>
            <div>
              <dt className="label">Surface</dt>
              <dd>{body.surface}</dd>
            </div>
            <div>
              <dt className="label">Axial tilt</dt>
              <dd>{joinValue(formatters.tilt(body.stats.axialTiltDeg))}</dd>
            </div>
            <div>
              <dt className="label">Mean density</dt>
              <dd>{joinValue(formatters.density(body.stats.densityKgM3))}</dd>
            </div>
            {isPlanet && (
              <div>
                <dt className="label">Surface pressure</dt>
                <dd>
                  {body.stats.surfacePressureBar == null
                    ? 'Not applicable — no solid surface'
                    : `${joinValue(formatters.pressure(body.stats.surfacePressureBar))}${body.stats.surfacePressureBar === 0 ? ' (essentially none)' : ''}`}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div>
          <p className="eyebrow">
            <Sparkles aria-hidden="true" className="inline-icon" /> Interesting facts
          </p>
          <ol className="fact-list">
            {body.facts.map((fact, i) => (
              <li key={fact}>
                <span className="fact-list__num mono" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p>{fact}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Earth comparison ─────────────────────────────────── */}
      <section className="container planet-section" aria-labelledby="earth-title">
        <div className="planet-section__head">
          <p className="eyebrow">Relative to home</p>
          <h2 id="earth-title" className="h2">
            {isEarth ? 'Earth — the reference world' : `${body.name} compared with Earth`}
          </h2>
        </div>

        <div className="earth-compare">
          {isEarth ? (
            <div className="panel panel--pad earth-compare__note">
              <p>
                Every “× Earth” figure in COSMOS uses Earth as the baseline of 1.00. Use the rankings below to see where
                our planet sits among its neighbours, or compare it with another world.
              </p>
              <Link to="/compare?a=earth&b=mars" className="link-arrow">
                Compare Earth with another planet <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="panel panel--pad earth-compare__bars">
              <div className="earth-compare__legend label" aria-hidden="true">
                <span className="legend-dot legend-dot--planet" /> {body.name}
                <span className="legend-dot legend-dot--earth" /> Earth
              </div>
              {comparisons.map((row) => (
                <ComparisonRow key={row.key} row={row} body={body} />
              ))}
            </div>
          )}

          <div className="panel panel--pad weight-calc">
            <p className="eyebrow">Weight check</p>
            <label className="field" htmlFor="weight-input">
              <span className="muted">Your weight on Earth (kg)</span>
              <input
                id="weight-input"
                className="input"
                type="number"
                inputMode="decimal"
                min="1"
                max="500"
                value={Number.isFinite(weight) ? weight : ''}
                onChange={(e) => setWeight(e.target.value === '' ? NaN : Number(e.target.value))}
              />
            </label>
            <p className="weight-calc__result">
              <span className="weight-calc__value">{safeWeight ? formatNumber(weightOn(body, safeWeight), 1) : '—'}</span>
              <span className="muted"> kg-equivalent on {body.name}</span>
            </p>
            <p className="dim weight-calc__note">
              Your mass stays the same; a scale would read {formatSmart(body.stats.gravityMs2 / EARTH.stats.gravityMs2)}× its
              Earth value
              {body.category.includes('giant') || body.type === 'star' ? ' (at the cloud tops — there is nowhere to stand)' : ''}.
            </p>
          </div>
        </div>

        {isPlanet && (
          <div className="rankings">
            <p className="label rankings__title">
              <Trophy aria-hidden="true" className="inline-icon" /> Among the eight planets
            </p>
            <ul role="list" className="rankings__list">
              {RANKINGS.map((r) => {
                const rank = rankAmongPlanets(body, r.key, { ascending: r.ascending });
                return (
                  <li key={r.key}>
                    <span className="label">{r.label}</span>
                    <span className="rankings__value">{rank ? r.phrase(rank.rank) : '—'}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* ── Sources ──────────────────────────────────────────── */}
      <section className="container planet-section">
        <div className="source-note">
          <BookOpen aria-hidden="true" />
          <div>
            Values from{' '}
            {body.sources.map((s, i) => (
              <span key={s.id}>
                {i > 0 && (i === body.sources.length - 1 ? ' and ' : ', ')}
                <a href={s.url} target="_blank" rel="noreferrer noopener">
                  {s.label}
                </a>
              </span>
            ))}
            .{' '}
            {body.stats.moons && `Moon count dated ${body.stats.moons.asOf}; counts change as new moons are confirmed. `}
            Rankings, ratios and light-travel times are calculated from these values. The 3D surface is a procedural
            illustration, not a photograph.
          </div>
        </div>
      </section>

      {/* ── Prev / next ──────────────────────────────────────── */}
      <nav className="container planet-pager" aria-label="Browse bodies">
        <Link to={`/planets/${prev.id}`} className="planet-pager__link">
          <ArrowLeft aria-hidden="true" />
          <PlanetThumb id={prev.id} size={44} />
          <span>
            <span className="label">Previous</span>
            <span className="planet-pager__name">{prev.name}</span>
          </span>
        </Link>
        <Link to="/explore" className="btn btn--sm planet-pager__back">
          <Orbit aria-hidden="true" /> Back to explorer
        </Link>
        <Link to={`/planets/${next.id}`} className="planet-pager__link planet-pager__link--next">
          <span>
            <span className="label">Next</span>
            <span className="planet-pager__name">{next.name}</span>
          </span>
          <PlanetThumb id={next.id} size={44} />
          <ArrowRight aria-hidden="true" />
        </Link>
      </nav>
    </div>
  );
}
