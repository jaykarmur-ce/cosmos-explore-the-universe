import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftRight, RotateCcw, ArrowUpRight, BookOpen, Crown } from 'lucide-react';

import PlanetThumb from '../components/PlanetThumb.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import { PLANETS, getPlanet } from '../data/planets.js';
import { SOURCES } from '../data/sources.js';
import { METRICS, TEMP_AXIS, compareMetric, weightOn } from '../utils/compare.js';
import { formatNumber, formatSmart } from '../utils/format.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './Compare.css';

const DEFAULT_A = 'earth';
const DEFAULT_B = 'mars';

function resolvePair(params) {
  let a = getPlanet(params.get('a')) ?? getPlanet(DEFAULT_A);
  let b = getPlanet(params.get('b')) ?? getPlanet(a.id === DEFAULT_B ? DEFAULT_A : DEFAULT_B);
  if (a.id === b.id) b = PLANETS.find((p) => p.id !== a.id);
  return [a, b];
}

function PlanetSlot({ slot, planet, other, onChange }) {
  const selectId = `planet-select-${slot}`;
  return (
    <div className="compare-slot panel" style={{ '--slot-accent': planet.accent }}>
      <PlanetThumb id={planet.id} size={84} />
      <div className="compare-slot__body">
        <label className="label" htmlFor={selectId}>
          Planet {slot.toUpperCase()}
        </label>
        <select id={selectId} className="select compare-slot__select" value={planet.id} onChange={(e) => onChange(e.target.value)}>
          {PLANETS.map((p) => (
            <option key={p.id} value={p.id} disabled={p.id === other.id}>
              {p.name}
              {p.id === other.id ? ' (selected)' : ''}
            </option>
          ))}
        </select>
        <p className="compare-slot__meta">{planet.category}</p>
      </div>
      <FavoriteButton type="planet" id={planet.id} name={planet.name} variant="icon" size="sm" />
    </div>
  );
}

function RatioBars({ result, a, b }) {
  return (
    <div className="metric-bars" aria-hidden="true">
      {[
        ['a', a, result.aFraction, result.a],
        ['b', b, result.bFraction, result.b],
      ].map(([side, planet, fraction, value]) => (
        <div key={side} className="metric-bars__row">
          <span className="metric-bars__track">
            {value != null ? (
              <motion.span
                className="metric-bars__fill"
                style={{ background: planet.accent }}
                initial={false}
                animate={{ width: `${Math.max(1, fraction * 100)}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : (
              <span className="metric-bars__na">n/a</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function RangeAxis({ result, a, b }) {
  const zero = (0 - TEMP_AXIS.min) / (TEMP_AXIS.max - TEMP_AXIS.min);
  return (
    <div className="metric-range" aria-hidden="true">
      <div className="metric-range__track">
        <span className="metric-range__zero" style={{ left: `${zero * 100}%` }}>
          <span className="metric-range__zero-label mono">0 °C</span>
        </span>
        {[
          ['a', a, result.aFraction],
          ['b', b, result.bFraction],
        ].map(([side, planet, f]) => (
          <motion.span
            key={side}
            className={`metric-range__marker metric-range__marker--${side}`}
            style={{ background: planet.accent }}
            initial={false}
            animate={{ left: `${f * 100}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="metric-range__marker-label mono">{side.toUpperCase()}</span>
          </motion.span>
        ))}
      </div>
      <div className="metric-range__scale mono">
        <span>{formatNumber(TEMP_AXIS.min)} °C</span>
        <span>+{formatNumber(TEMP_AXIS.max)} °C</span>
      </div>
    </div>
  );
}

export default function Compare() {
  useDocumentTitle('Compare Planets');
  const [params, setParams] = useSearchParams();
  const [a, b] = resolvePair(params);
  const [weight, setWeight] = useState(70);

  const results = useMemo(() => METRICS.map((m) => compareMetric(m, a, b)), [a, b]);
  const diameterRatio = b.stats.diameterKm / a.stats.diameterKm;
  const maxDisc = 220;
  const aSize = diameterRatio > 1 ? maxDisc / diameterRatio : maxDisc;
  const bSize = diameterRatio > 1 ? maxDisc : maxDisc * diameterRatio;
  const safeWeight = Number.isFinite(weight) && weight > 0 ? Math.min(weight, 500) : 0;

  const setPair = (nextA, nextB) => setParams({ a: nextA, b: nextB }, { replace: true });
  const winsA = results.filter((r) => r.winner === 'a').length;
  const winsB = results.filter((r) => r.winner === 'b').length;

  return (
    <div className="page container compare-page">
      <header className="page-header">
        <p className="eyebrow">Comparison tool</p>
        <h1 className="h1">Compare planets</h1>
        <p className="lede">
          Choose any two planets. Every bar, ratio and sentence below is calculated from the local NASA-based dataset —
          change a selection and the whole comparison recalculates.
        </p>
      </header>

      <section className="compare-select" aria-label="Choose planets">
        <PlanetSlot slot="a" planet={a} other={b} onChange={(id) => setPair(id, b.id)} />
        <div className="compare-select__actions">
          <button type="button" className="icon-btn" onClick={() => setPair(b.id, a.id)} aria-label="Swap planets A and B" title="Swap">
            <ArrowLeftRight aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--sm"
            onClick={() => setPair(DEFAULT_A, DEFAULT_B)}
            aria-label="Reset to Earth and Mars"
            title="Reset"
          >
            <RotateCcw aria-hidden="true" />
          </button>
        </div>
        <PlanetSlot slot="b" planet={b} other={a} onChange={(id) => setPair(a.id, id)} />
      </section>

      <section className="compare-scale panel" aria-labelledby="scale-title">
        <div className="compare-scale__text">
          <p className="eyebrow">Relative size</p>
          <h2 id="scale-title" className="h3">
            {diameterRatio === 1
              ? `${a.name} and ${b.name} are the same size`
              : `${diameterRatio > 1 ? b.name : a.name} is ${formatSmart(Math.max(diameterRatio, 1 / diameterRatio))}× wider`}
          </h2>
          <p className="muted">Discs are drawn to scale relative to each other (not to scale with their distances).</p>
          <p className="compare-scale__tally mono">
            Larger value in {winsA} of {results.length} metrics: {a.name} · {winsB}: {b.name}
          </p>
        </div>
        <div className="compare-scale__discs" aria-hidden="true">
          <figure>
            <PlanetThumb id={a.id} size={Math.max(6, aSize)} />
            <figcaption className="label">A · {a.name}</figcaption>
          </figure>
          <figure>
            <PlanetThumb id={b.id} size={Math.max(6, bSize)} />
            <figcaption className="label">B · {b.name}</figcaption>
          </figure>
        </div>
      </section>

      <section className="compare-metrics" aria-label="Metric comparison">
        <div className="compare-metrics__legend" aria-hidden="true">
          <span>
            <i style={{ background: a.accent }} /> A · {a.name}
          </span>
          <span>
            <i style={{ background: b.accent }} /> B · {b.name}
          </span>
        </div>
        <ul role="list" className="metric-list">
          {results.map((r) => (
            <li key={r.metric.key} className="metric">
              <div className="metric__head">
                <h3 className="metric__label">{r.metric.label}</h3>
                <span className="label">{r.metric.unitLabel}</span>
              </div>
              <div className="metric__values">
                <span className={`metric__value${r.winner === 'a' ? ' is-larger' : ''}${r.a == null ? ' is-na' : ''}`}>
                  <span className="label">A</span> {r.aText}
                  {r.winner === 'a' && (
                    <span className="metric__badge">
                      <Crown aria-hidden="true" /> {r.metric.higher}
                    </span>
                  )}
                </span>
                <span className={`metric__value${r.winner === 'b' ? ' is-larger' : ''}${r.b == null ? ' is-na' : ''}`}>
                  <span className="label">B</span> {r.bText}
                  {r.winner === 'b' && (
                    <span className="metric__badge">
                      <Crown aria-hidden="true" /> {r.metric.higher}
                    </span>
                  )}
                </span>
              </div>
              {r.metric.mode === 'range' ? <RangeAxis result={r} a={a} b={b} /> : <RatioBars result={r} a={a} b={b} />}
              <p className="metric__summary">{r.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="compare-extra">
        <div className="panel panel--pad weight-compare">
          <p className="eyebrow">Weight check</p>
          <label className="field" htmlFor="compare-weight">
            <span className="muted">Your weight on Earth (kg)</span>
            <input
              id="compare-weight"
              className="input"
              type="number"
              inputMode="decimal"
              min="1"
              max="500"
              value={Number.isFinite(weight) ? weight : ''}
              onChange={(e) => setWeight(e.target.value === '' ? NaN : Number(e.target.value))}
            />
          </label>
          <div className="weight-compare__grid">
            {[a, b].map((p) => (
              <div key={p.id}>
                <span className="label">{p.name}</span>
                <span className="weight-compare__value">{safeWeight ? formatNumber(weightOn(p, safeWeight), 1) : '—'}</span>
                <span className="dim"> kg-equivalent</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel panel--pad compare-links">
          <p className="eyebrow">Go deeper</p>
          {[a, b].map((p) => (
            <Link key={p.id} to={`/planets/${p.id}`} className="link-arrow">
              {p.name} discovery page <ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
          <Link to={`/explore?focus=${a.id}`} className="link-arrow">
            Find {a.name} in the 3D explorer <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="source-note">
        <BookOpen aria-hidden="true" />
        <p>
          Values from the{' '}
          <a href={SOURCES.nasaFactSheet.url} target="_blank" rel="noreferrer noopener">
            {SOURCES.nasaFactSheet.label}
          </a>
          . Gravity for giant planets is given at the 1-bar level; mean temperatures for giant planets are at the same
          level. Temperature bars share one axis from {formatNumber(TEMP_AXIS.min)} °C to {formatNumber(TEMP_AXIS.max)} °C;
          other bars are scaled to the larger of the two values.
        </p>
      </div>
    </div>
  );
}
