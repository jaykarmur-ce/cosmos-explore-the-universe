import { useCallback, useMemo, useRef, useState } from 'react';
import { Satellite, Rocket, Flag, Building2, Send, Telescope, Bot, ShieldCheck, ArrowLeft, ArrowRight, Check, CalendarClock } from 'lucide-react';
import Dialog from '../Dialog.jsx';
import TiltCard from '../TiltCard.jsx';
import { TIMELINE } from '../../data/timeline.js';
import { useProgress } from '../../context/ProgressContext.jsx';
import { formatDate } from '../../utils/format.js';

const KIND_ICONS = {
  satellite: Satellite,
  crewed: Rocket,
  lander: Flag,
  station: Building2,
  flyby: Send,
  telescope: Telescope,
  robotic: Bot,
  defense: ShieldCheck,
};

const KIND_LABELS = {
  satellite: 'Satellite',
  crewed: 'Crewed flight',
  lander: 'Landing',
  station: 'Space station',
  flyby: 'Deep-space probe',
  telescope: 'Observatory',
  robotic: 'Robotic mission',
  defense: 'Planetary defence',
};

const year = (m) => Number(m.date.slice(0, 4));
const dateLabel = (m) => m.dateLabel ?? formatDate(m.date);

function StatusTag({ status }) {
  return status === 'planned' ? (
    <span className="tag tag--warning">
      <CalendarClock aria-hidden="true" width={12} height={12} /> Planned
    </span>
  ) : (
    <span className="tag tag--success">Completed</span>
  );
}

/**
 * Chronological exploration timeline with decade navigation and a detail
 * dialog (with previous/next) for each milestone.
 */
export default function Timeline() {
  const { progress, markMilestoneRead } = useProgress();
  const [openIndex, setOpenIndex] = useState(-1);
  const itemRefs = useRef({});

  const decades = useMemo(() => {
    const groups = new Map();
    TIMELINE.forEach((m, i) => {
      const key = m.status === 'planned' ? 'planned' : `${Math.floor(year(m) / 10) * 10}s`;
      if (!groups.has(key)) groups.set(key, i);
    });
    return Array.from(groups, ([key, firstIndex]) => ({ key, firstIndex }));
  }, []);

  const open = useCallback(
    (index) => {
      setOpenIndex(index);
      markMilestoneRead(TIMELINE[index].id);
    },
    [markMilestoneRead],
  );
  const close = useCallback(() => setOpenIndex(-1), []);

  const jumpTo = (index) => {
    const el = itemRefs.current[TIMELINE[index].id];
    el?.scrollIntoView({ behavior: document.documentElement.dataset.effects === 'reduced' ? 'auto' : 'smooth', block: 'center' });
    el?.querySelector('button')?.focus({ preventScroll: true });
  };

  const current = openIndex >= 0 ? TIMELINE[openIndex] : null;
  const CurrentIcon = current ? KIND_ICONS[current.kind] ?? Rocket : null;
  const readCount = progress.readMilestones.length;

  return (
    <div className="timeline">
      <div className="timeline__toolbar">
        <nav className="timeline__decades" aria-label="Jump to decade">
          {decades.map((d) => (
            <button key={d.key} type="button" className="chip" onClick={() => jumpTo(d.firstIndex)}>
              {d.key === 'planned' ? 'Planned' : d.key}
            </button>
          ))}
        </nav>
        <p className="label">
          {readCount}/{TIMELINE.length} milestones read
        </p>
      </div>

      <ol className="timeline__list" role="list">
        {TIMELINE.flatMap((m, i) => {
          const Icon = KIND_ICONS[m.kind] ?? Rocket;
          const read = progress.readMilestones.includes(m.id);
          const prevItem = TIMELINE[i - 1];
          const newDecade =
            i === 0 ||
            (m.status === 'planned' ? prevItem.status !== 'planned' : Math.floor(year(m) / 10) !== Math.floor(year(prevItem) / 10));
          const rows = [];
          if (newDecade) {
            rows.push(
              <li key={`sep-${m.id}`} className="timeline__separator" aria-hidden="true">
                <span className="timeline__decade mono">{m.status === 'planned' ? 'Ahead' : `${Math.floor(year(m) / 10) * 10}s`}</span>
              </li>,
            );
          }
          rows.push(
            <li
              key={m.id}
              ref={(el) => {
                itemRefs.current[m.id] = el;
              }}
              className={`timeline__item${m.status === 'planned' ? ' is-planned' : ''}${i % 2 ? ' is-right' : ''}`}
            >
              <span className="timeline__node" aria-hidden="true">
                <Icon />
              </span>
              <TiltCard className="timeline__card" tilt={4}>
                <button type="button" className="timeline__button" onClick={() => open(i)} aria-haspopup="dialog">
                  <span className="timeline__meta">
                    <span className="mono timeline__date">{dateLabel(m)}</span>
                    <StatusTag status={m.status} />
                    {read && (
                      <span className="timeline__read" title="Read">
                        <Check aria-hidden="true" />
                        <span className="visually-hidden">Read</span>
                      </span>
                    )}
                  </span>
                  <span className="timeline__title">{m.title}</span>
                  <span className="timeline__mission">
                    {m.mission} · {m.agency}
                  </span>
                  <span className="timeline__summary">{m.summary}</span>
                  <span className="link-arrow timeline__more">
                    Read more <ArrowRight aria-hidden="true" />
                  </span>
                </button>
              </TiltCard>
            </li>,
          );
          return rows;
        })}
      </ol>

      <Dialog open={Boolean(current)} onClose={close} labelledBy="milestone-title" className="milestone-dialog">
        {current && (
          <div className="milestone">
            <div className="milestone__icon" aria-hidden="true">
              <CurrentIcon />
            </div>
            <p className="eyebrow">
              {KIND_LABELS[current.kind] ?? 'Mission'} · {dateLabel(current)}
            </p>
            <h2 id="milestone-title" className="h2">
              {current.title}
            </h2>
            <p className="milestone__mission">
              {current.mission} · {current.agency} · <StatusTag status={current.status} />
            </p>
            <p className="lede milestone__summary">{current.summary}</p>
            <p className="milestone__details">{current.details}</p>
            {current.status === 'planned' && (
              <p className="milestone__planned dim">This is a planned mission; dates reflect published targets and may change.</p>
            )}
            <div className="milestone__nav">
              <button type="button" className="btn btn--sm" disabled={openIndex <= 0} onClick={() => open(openIndex - 1)}>
                <ArrowLeft aria-hidden="true" /> Earlier
              </button>
              <span className="mono dim">
                {openIndex + 1} / {TIMELINE.length}
              </span>
              <button
                type="button"
                className="btn btn--sm"
                disabled={openIndex >= TIMELINE.length - 1}
                onClick={() => open(openIndex + 1)}
                data-autofocus
              >
                Later <ArrowRight aria-hidden="true" />
              </button>
            </div>
            <button type="button" className="btn btn--ghost btn--sm milestone__back" onClick={close}>
              Back to timeline
            </button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
