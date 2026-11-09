import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { BODIES } from '../../data/planets.js';
import { DISCOVERIES } from '../../data/discoveries.js';
import { TIMELINE } from '../../data/timeline.js';
import { QUIZ_LEVELS } from '../../data/quiz.js';
import { useProgress } from '../../context/ProgressContext.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { formatNumber } from '../../utils/format.js';

function Meter({ label, value, total }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="progress-meter">
      <div className="progress-meter__head">
        <span className="label">{label}</span>
        <span className="mono">
          {value}/{total}
        </span>
      </div>
      <div className="meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}>
        <div className="meter__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Overview of the exploration progress stored in this browser. */
export default function ProgressLog() {
  const { progress, resetProgress } = useProgress();
  const { count: favoriteCount } = useFavorites();
  const [confirming, setConfirming] = useState(false);

  const explored = progress.visitedBodies.length + progress.viewedDiscoveries.length + progress.readMilestones.length;
  const total = BODIES.length + DISCOVERIES.length + TIMELINE.length;
  const overall = total ? Math.round((explored / total) * 100) : 0;
  const accuracy = progress.questionsAnswered ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100) : null;
  const bestLevels = QUIZ_LEVELS.filter((l) => progress.bestScores[l.id]);
  const best = bestLevels.reduce((acc, l) => {
    const s = progress.bestScores[l.id];
    const pct = s.score / s.total;
    return !acc || pct > acc.pct ? { pct, label: l.label, ...s } : acc;
  }, null);

  return (
    <div className="progress-log">
      <div className="progress-log__ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="52" className="ring-track" />
          <circle
            cx="60"
            cy="60"
            r="52"
            className="ring-fill"
            strokeDasharray={`${(overall / 100) * 326.7} 326.7`}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="progress-log__ring-label">
          <span className="progress-log__pct">{overall}%</span>
          <span className="label">explored</span>
        </div>
      </div>

      <div className="progress-log__meters">
        <Meter label="Solar system bodies" value={progress.visitedBodies.length} total={BODIES.length} />
        <Meter label="Deep-space objects" value={progress.viewedDiscoveries.length} total={DISCOVERIES.length} />
        <Meter label="Timeline milestones" value={progress.readMilestones.length} total={TIMELINE.length} />
      </div>

      <dl className="progress-log__stats">
        <div>
          <dt className="label">Quizzes completed</dt>
          <dd>{formatNumber(progress.quizzesCompleted)}</dd>
        </div>
        <div>
          <dt className="label">Answer accuracy</dt>
          <dd>{accuracy == null ? '—' : `${accuracy}%`}</dd>
        </div>
        <div>
          <dt className="label">Best quiz</dt>
          <dd>{best ? `${best.score}/${best.total} · ${best.label}` : '—'}</dd>
        </div>
        <div>
          <dt className="label">Favourites</dt>
          <dd>{favoriteCount}</dd>
        </div>
      </dl>

      <div className="progress-log__reset">
        {confirming ? (
          <>
            <span className="muted">Clear your exploration log and quiz records?</span>
            <button
              type="button"
              className="btn btn--sm btn--danger"
              onClick={() => {
                resetProgress();
                setConfirming(false);
              }}
            >
              Yes, reset
            </button>
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => setConfirming(true)}>
            <RotateCcw aria-hidden="true" /> Reset log
          </button>
        )}
      </div>
    </div>
  );
}
