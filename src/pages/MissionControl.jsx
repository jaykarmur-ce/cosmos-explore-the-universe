import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radar, LayoutGrid, Search, History, BrainCircuit, Heart, Scale, ArrowRight, Orbit, HardDrive } from 'lucide-react';

import ProgressLog from '../components/mission/ProgressLog.jsx';
import Directory from '../components/mission/Directory.jsx';
import Timeline from '../components/mission/Timeline.jsx';
import QuickChallenge from '../components/mission/QuickChallenge.jsx';
import PlanetThumb from '../components/PlanetThumb.jsx';
import CosmicIllustration from '../components/CosmicIllustration.jsx';
import TiltCard from '../components/TiltCard.jsx';
import { PLANETS, getBody } from '../data/planets.js';
import { getDiscovery } from '../data/discoveries.js';
import { QUIZ_LEVELS, questionsForLevel } from '../data/quiz.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { readStorage, removeStorage, writeStorage } from '../hooks/useLocalStorage.js';
import './MissionControl.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'directory', label: 'Directory', icon: Search },
  { id: 'timeline', label: 'Timeline', icon: History },
  { id: 'challenge', label: 'Challenge', icon: BrainCircuit },
];

function storageAvailable() {
  const ok = writeStorage('cosmos:probe', 1) && readStorage('cosmos:probe', 0) === 1;
  removeStorage('cosmos:probe');
  return ok;
}

function UtcClock() {
  const ref = useRef(null);
  useEffect(() => {
    const tick = () => {
      if (ref.current) ref.current.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span ref={ref} className="mono" />;
}

function Module({ title, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`mc-module panel ${className}`} aria-label={title}>
      <header className="mc-module__head">
        <h2 className="mc-module__title">
          <Icon aria-hidden="true" /> {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function PlanetTile({ planet, spin }) {
  const [hover, setHover] = useState(false);
  return (
    <li className="mc-planets__item">
      <TiltCard as={Link} to={`/planets/${planet.id}`} className="mc-planet" tilt={10} onHoverChange={setHover} style={{ '--tile-accent': planet.accent }}>
        <PlanetThumb id={planet.id} size={58} spinning={spin && hover} />
        <span className="mc-planet__name">{planet.name}</span>
      </TiltCard>
      <Link to={`/explore?focus=${planet.id}`} className="mc-planet__3d" aria-label={`Show ${planet.name} in the 3D explorer`} title="Show in 3D">
        <Orbit aria-hidden="true" />
      </Link>
    </li>
  );
}

function QuickCompare() {
  const navigate = useNavigate();
  const [a, setA] = useState('earth');
  const [b, setB] = useState('jupiter');
  return (
    <form
      className="quick-compare"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(`/compare?a=${a}&b=${b}`);
      }}
    >
      <div className="quick-compare__row">
        <label className="field">
          <span className="label">Planet A</span>
          <select className="select" value={a} onChange={(e) => setA(e.target.value)}>
            {PLANETS.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === b}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <span className="quick-compare__vs mono" aria-hidden="true">
          vs
        </span>
        <label className="field">
          <span className="label">Planet B</span>
          <select className="select" value={b} onChange={(e) => setB(e.target.value)}>
            {PLANETS.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === a}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" className="btn btn--primary btn--sm">
        <Scale aria-hidden="true" /> Compare {getBody(a)?.name} and {getBody(b)?.name}
      </button>
    </form>
  );
}

function FavoritesPreview() {
  const { favorites } = useFavorites();
  const recent = [...favorites].sort((x, y) => y.addedAt - x.addedAt).slice(0, 4);
  if (!recent.length) {
    return (
      <div className="mc-empty">
        <p className="muted">Nothing saved yet. Use the heart button on any planet or deep-space object to build your collection.</p>
        <Link to="/discoveries" className="link-arrow">
          Browse discoveries <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  }
  return (
    <ul role="list" className="mc-favs">
      {recent.map((f) => {
        const item = f.type === 'planet' ? getBody(f.id) : getDiscovery(f.id);
        const to = f.type === 'planet' ? `/planets/${f.id}` : `/discoveries/${f.id}`;
        return (
          <li key={`${f.type}:${f.id}`}>
            <Link to={to} className="mc-fav">
              <span className="mc-fav__media">
                {f.type === 'planet' ? (
                  <PlanetThumb id={f.id} size={44} />
                ) : (
                  <CosmicIllustration art={item.art} width={176} height={176} showBadge={false} />
                )}
              </span>
              <span className="mc-fav__name">{item.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ChallengeLauncher() {
  const { progress } = useProgress();
  return (
    <ul role="list" className="mc-levels">
      {QUIZ_LEVELS.map((level) => {
        const best = progress.bestScores[level.id];
        return (
          <li key={level.id}>
            <TiltCard as={Link} to={`/quiz?level=${level.id}&start=1`} className="mc-level" tilt={6}>
              <span className="label">{level.difficulty}</span>
              <span className="mc-level__name">{level.label}</span>
              <span className="mc-level__desc">{level.description}</span>
              <span className="mc-level__foot mono">
                {questionsForLevel(level.id).length} questions · best {best ? `${best.score}/${best.total}` : '—'}
              </span>
            </TiltCard>
          </li>
        );
      })}
    </ul>
  );
}

export default function MissionControl() {
  useDocumentTitle('Mission Control');
  const location = useLocation();
  const navigate = useNavigate();
  const { reducedEffects } = usePreferences();
  const hashTab = location.hash.replace('#', '');
  const tab = TABS.some((t) => t.id === hashTab) ? hashTab : 'overview';
  const storageOk = useMemo(() => storageAvailable(), []);
  const tabRefs = useRef({});

  const selectTab = (id) => navigate({ hash: id === 'overview' ? '' : id }, { replace: true });

  const onTabKey = (e) => {
    const index = TABS.findIndex((t) => t.id === tab);
    let next = null;
    if (e.key === 'ArrowRight') next = TABS[(index + 1) % TABS.length];
    if (e.key === 'ArrowLeft') next = TABS[(index - 1 + TABS.length) % TABS.length];
    if (e.key === 'Home') next = TABS[0];
    if (e.key === 'End') next = TABS[TABS.length - 1];
    if (next) {
      e.preventDefault();
      selectTab(next.id);
      tabRefs.current[next.id]?.focus();
    }
  };

  return (
    <div className="page container mission-control">
      <header className="mc-header">
        <div>
          <p className="eyebrow">
            <Radar aria-hidden="true" className="inline-icon" /> Console
          </p>
          <h1 className="h1">Mission Control</h1>
        </div>
        <dl className="mc-status">
          <div>
            <dt className="label">UTC</dt>
            <dd>
              <UtcClock />
            </dd>
          </div>
          <div>
            <dt className="label">Local storage</dt>
            <dd className={storageOk ? 'mc-status__ok' : 'mc-status__warn'}>
              <HardDrive aria-hidden="true" /> {storageOk ? 'Available' : 'Unavailable — progress won’t persist'}
            </dd>
          </div>
        </dl>
      </header>

      <div className="mc-tabs" role="tablist" aria-label="Mission Control sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            className="mc-tab"
            onClick={() => selectTab(id)}
            onKeyDown={onTabKey}
          >
            <Icon aria-hidden="true" /> {label}
            {tab === id && <motion.span layoutId="mc-tab-indicator" className="mc-tab__indicator" />}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        id={`panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="mc-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {tab === 'overview' && (
          <div className="mc-grid">
            <Module title="Exploration log" icon={Radar} className="mc-grid__log">
              <ProgressLog />
            </Module>
            <Module title="Quick compare" icon={Scale} className="mc-grid__compare">
              <QuickCompare />
            </Module>
            <Module
              title="Planets"
              icon={Orbit}
              className="mc-grid__planets"
              action={
                <Link to="/explore" className="link-arrow">
                  3D explorer <ArrowRight aria-hidden="true" />
                </Link>
              }
            >
              <ul role="list" className="mc-planets">
                {PLANETS.map((p) => (
                  <PlanetTile key={p.id} planet={p} spin={!reducedEffects} />
                ))}
              </ul>
            </Module>
            <Module
              title="Knowledge challenge"
              icon={BrainCircuit}
              className="mc-grid__challenge"
              action={
                <button type="button" className="link-arrow" onClick={() => selectTab('challenge')}>
                  All levels <ArrowRight aria-hidden="true" />
                </button>
              }
            >
              <QuickChallenge />
            </Module>
            <Module
              title="Your collection"
              icon={Heart}
              className="mc-grid__favs"
              action={
                <Link to="/favorites" className="link-arrow">
                  View all <ArrowRight aria-hidden="true" />
                </Link>
              }
            >
              <FavoritesPreview />
            </Module>
            <Module
              title="Exploration timeline"
              icon={History}
              className="mc-grid__timeline"
              action={
                <button type="button" className="link-arrow" onClick={() => selectTab('timeline')}>
                  Open timeline <ArrowRight aria-hidden="true" />
                </button>
              }
            >
              <p className="muted">
                From Sputnik 1 to Artemis II and the missions planned next — explore the milestones of spaceflight in
                order, with completed and planned missions clearly marked.
              </p>
            </Module>
          </div>
        )}

        {tab === 'directory' && (
          <Module title="Celestial object directory" icon={Search}>
            <Directory autoFocus={false} />
          </Module>
        )}

        {tab === 'timeline' && (
          <div className="mc-timeline">
            <div className="mc-timeline__intro">
              <h2 className="h2">Space exploration timeline</h2>
              <p className="muted">Select any milestone for the full story. Planned missions are marked and may change.</p>
            </div>
            <Timeline />
          </div>
        )}

        {tab === 'challenge' && (
          <div className="mc-challenge">
            <Module title="Quick question" icon={BrainCircuit}>
              <QuickChallenge />
            </Module>
            <Module title="Launch a full quiz" icon={Radar}>
              <ChallengeLauncher />
            </Module>
          </div>
        )}
      </motion.div>
    </div>
  );
}
