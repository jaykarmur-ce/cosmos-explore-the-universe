import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, ArrowRight, RotateCcw, Timer, Pause, Play, Trophy, ListChecks, Sparkles } from 'lucide-react';

import TiltCard from '../components/TiltCard.jsx';
import { QUIZ_LEVELS, QUIZ_CATEGORIES, questionsForLevel } from '../data/quiz.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { shuffle } from '../utils/helpers.js';
import './Quiz.css';

const LENGTHS = [5, 10];
const SECONDS_PER_QUESTION = 25;

/** Build a run: random question order and shuffled options (tracked by value). */
function buildRun(level, length) {
  return shuffle(questionsForLevel(level))
    .slice(0, length)
    .map((q) => ({ ...q, options: shuffle(q.choices), correct: q.choices[q.answer] }));
}

/**
 * Countdown that pauses while `running` is false (feedback shown, user pause,
 * or tab hidden) and cleans up its interval on every change.
 */
function useCountdown({ seconds, running, resetKey, onExpire }) {
  // Remaining time is stored with the key it belongs to, so a new question
  // never inherits the previous question's expired timer.
  const [state, setState] = useState({ key: resetKey, remaining: seconds });
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;
  const remaining = state.key === resetKey ? state.remaining : seconds;

  useEffect(() => {
    if (!running) return undefined;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      setState((s) => ({ key: resetKey, remaining: Math.max(0, (s.key === resetKey ? s.remaining : seconds) - dt) }));
    }, 100);
    return () => clearInterval(id);
  }, [running, resetKey, seconds]);

  useEffect(() => {
    if (running && state.key === resetKey && state.remaining <= 0) expireRef.current?.();
  }, [state, running, resetKey]);

  return remaining;
}

function usePageVisible() {
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return visible;
}

// ── Setup ────────────────────────────────────────────────────────────────

function Setup({ level, setLevel, length, setLength, timed, setTimed, onStart }) {
  const { progress } = useProgress();
  return (
    <div className="quiz-setup">
      <fieldset className="quiz-levels">
        <legend className="label">Choose a difficulty</legend>
        {QUIZ_LEVELS.map((l) => {
          const best = progress.bestScores[l.id];
          const count = questionsForLevel(l.id).length;
          return (
            <TiltCard
              key={l.id}
              as="label"
              className={`quiz-level${level === l.id ? ' is-selected' : ''}`}
              tilt={6}
            >
              <input type="radio" name="level" value={l.id} checked={level === l.id} onChange={() => setLevel(l.id)} className="visually-hidden" />
              <span className="label">{l.difficulty}</span>
              <span className="quiz-level__name">{l.label}</span>
              <span className="quiz-level__desc">{l.description}</span>
              <span className="quiz-level__foot mono">
                {count} questions · Best {best ? `${best.score}/${best.total}` : '—'}
              </span>
            </TiltCard>
          );
        })}
      </fieldset>

      <div className="quiz-options">
        <div className="quiz-option">
          <span className="label" id="length-label">
            Questions per run
          </span>
          <div className="segmented" role="radiogroup" aria-labelledby="length-label">
            {LENGTHS.map((n) => (
              <button key={n} type="button" role="radio" aria-checked={length === n} className="segmented__item" onClick={() => setLength(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <button type="button" role="switch" aria-checked={timed} className="switch" onClick={() => setTimed(!timed)}>
          <span className="switch__track" aria-hidden="true" />
          <Timer aria-hidden="true" width={16} height={16} /> Timed mode · {SECONDS_PER_QUESTION}s per question
        </button>
        <button type="button" className="btn btn--primary btn--lg" onClick={onStart}>
          Start quiz <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ── Question ─────────────────────────────────────────────────────────────

function QuestionView({ run, index, answers, onAnswer, onNext, timed, paused, setPaused }) {
  const q = run[index];
  const answered = answers[index];
  const visible = usePageVisible();
  const nextRef = useRef(null);
  const running = timed && !answered && !paused && visible;

  const remaining = useCountdown({
    seconds: SECONDS_PER_QUESTION,
    running,
    resetKey: index,
    onExpire: () => onAnswer(null),
  });

  useEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);

  // Number keys 1–4 answer; Enter continues.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!answered && !paused && /^[1-4]$/.test(e.key)) {
        const option = q.options[Number(e.key) - 1];
        if (option) onAnswer(option);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, paused, q, onAnswer]);

  const correctCount = answers.filter((a) => a && a.correct).length;
  const pct = (remaining / SECONDS_PER_QUESTION) * 100;

  return (
    <div className="quiz-question">
      <div className="quiz-progress">
        <div className="quiz-progress__top">
          <span className="label">
            Question {index + 1} of {run.length}
          </span>
          <span className="label">
            Score <span className="text-accent">{correctCount}</span>
          </span>
        </div>
        <div className="quiz-progress__steps" aria-hidden="true">
          {run.map((item, i) => {
            const a = answers[i];
            const state = a ? (a.correct ? 'correct' : 'wrong') : i === index ? 'current' : 'todo';
            return <span key={item.id} className={`quiz-step quiz-step--${state}`} />;
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          className="quiz-card panel"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
        >
          <div className="quiz-card__meta">
            <span className="tag">{QUIZ_CATEGORIES[q.category]}</span>
            <span className="tag tag--violet">{q.difficulty}</span>
            {timed && (
              <span className={`quiz-timer${remaining < 6 && !answered ? ' is-low' : ''}`}>
                <span className="quiz-timer__bar" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </span>
                <span className="mono" aria-label={`${Math.ceil(remaining)} seconds remaining`}>
                  {Math.ceil(remaining)}s
                </span>
                {!answered && (
                  <button
                    type="button"
                    className="icon-btn icon-btn--sm"
                    onClick={() => setPaused(!paused)}
                    aria-label={paused ? 'Resume timer' : 'Pause timer'}
                  >
                    {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
                  </button>
                )}
              </span>
            )}
          </div>

          <h2 className="quiz-card__prompt" id="quiz-prompt">
            {q.prompt}
          </h2>

          {paused && !answered ? (
            <div className="quiz-paused">
              <p className="muted">Timer paused. Answers are hidden while paused.</p>
              <button type="button" className="btn btn--primary" onClick={() => setPaused(false)}>
                <Play aria-hidden="true" /> Resume
              </button>
            </div>
          ) : (
            <div className="quiz-card__options" role="group" aria-labelledby="quiz-prompt">
              {q.options.map((option, i) => {
                const state = answered
                  ? option === q.correct
                    ? 'correct'
                    : option === answered.choice
                      ? 'wrong'
                      : 'idle'
                  : 'idle';
                return (
                  <button
                    key={option}
                    type="button"
                    className={`answer answer--${state}`}
                    onClick={() => onAnswer(option)}
                    disabled={Boolean(answered)}
                    aria-pressed={answered?.choice === option}
                  >
                    <span className="answer__key mono" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="answer__text">{option}</span>
                    {state === 'correct' && <Check aria-hidden="true" />}
                    {state === 'wrong' && <X aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}

          <div aria-live="polite">
            {answered && (
              <motion.div
                className={`quiz-feedback ${answered.correct ? 'is-correct' : 'is-wrong'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="quiz-feedback__title">
                  {answered.correct ? 'Correct!' : answered.choice == null ? `Time’s up — the answer is ${q.correct}.` : `Not quite — the answer is ${q.correct}.`}
                </p>
                <p className="quiz-feedback__text">{q.explanation}</p>
              </motion.div>
            )}
          </div>

          {answered && (
            <button ref={nextRef} type="button" className="btn btn--primary quiz-card__next" onClick={onNext}>
              {index + 1 < run.length ? 'Next question' : 'See results'} <ArrowRight aria-hidden="true" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
      <p className="quiz-hint dim">Tip: press 1–4 to answer and Enter to continue.</p>
    </div>
  );
}

// ── Summary ──────────────────────────────────────────────────────────────

function Summary({ run, answers, levelId, isBest, onReplay, onChangeLevel }) {
  const score = answers.filter((a) => a?.correct).length;
  const pct = Math.round((score / run.length) * 100);
  const level = QUIZ_LEVELS.find((l) => l.id === levelId);
  const verdict = pct === 100 ? 'Flawless navigation.' : pct >= 80 ? 'Mission commander material.' : pct >= 50 ? 'Solid orbit — keep exploring.' : 'Every astronaut starts as a cadet.';

  return (
    <div className="quiz-summary">
      <div className="quiz-summary__hero panel">
        <div className="quiz-summary__ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" className="ring-track" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              className="ring-fill"
              transform="rotate(-90 60 60)"
              initial={{ strokeDasharray: '0 326.7' }}
              animate={{ strokeDasharray: `${(pct / 100) * 326.7} 326.7` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="quiz-summary__score">
            <span className="quiz-summary__num">
              {score}/{run.length}
            </span>
            <span className="label">{pct}%</span>
          </div>
        </div>
        <div className="quiz-summary__text">
          <p className="eyebrow">
            {level?.label} · {level?.difficulty}
          </p>
          <h2 className="h2">{verdict}</h2>
          {isBest && (
            <p className="quiz-summary__best">
              <Trophy aria-hidden="true" /> New personal best for this level — saved on this device.
            </p>
          )}
          <div className="quiz-summary__actions">
            <button type="button" className="btn btn--primary" onClick={onReplay}>
              <RotateCcw aria-hidden="true" /> Play again
            </button>
            <button type="button" className="btn" onClick={onChangeLevel}>
              Change difficulty
            </button>
            <Link to="/mission-control" className="btn btn--ghost">
              Mission Control
            </Link>
          </div>
        </div>
      </div>

      <section aria-labelledby="review-title" className="quiz-review">
        <h3 id="review-title" className="label">
          <ListChecks aria-hidden="true" className="inline-icon" /> Review your answers
        </h3>
        <ol className="quiz-review__list">
          {run.map((q, i) => {
            const a = answers[i];
            return (
              <li key={q.id} className={a?.correct ? 'is-correct' : 'is-wrong'}>
                <span className="quiz-review__icon" aria-hidden="true">
                  {a?.correct ? <Check /> : <X />}
                </span>
                <div>
                  <p className="quiz-review__q">{q.prompt}</p>
                  <p className="quiz-review__a">
                    {a?.correct ? (
                      <>
                        Your answer: <strong>{a.choice}</strong>
                      </>
                    ) : (
                      <>
                        Your answer: <strong>{a?.choice ?? 'No answer (time ran out)'}</strong> · Correct: <strong>{q.correct}</strong>
                      </>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function Quiz() {
  useDocumentTitle('Space Quiz');
  const [params, setParams] = useSearchParams();
  const { recordQuiz } = useProgress();
  const initialLevel = QUIZ_LEVELS.some((l) => l.id === params.get('level')) ? params.get('level') : 'easy';

  const [phase, setPhase] = useState('setup'); // setup | playing | done
  const [level, setLevel] = useState(initialLevel);
  const [length, setLength] = useState(10);
  const [timed, setTimed] = useState(false);
  const [run, setRun] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [paused, setPaused] = useState(false);
  const [isBest, setIsBest] = useState(false);

  const start = useCallback(
    (lvl = level) => {
      const questions = buildRun(lvl, length);
      setRun(questions);
      setAnswers(new Array(questions.length).fill(null));
      setIndex(0);
      setPaused(false);
      setIsBest(false);
      setPhase('playing');
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [level, length],
  );

  // Deep link from Mission Control: /quiz?level=hard&start=1
  useEffect(() => {
    if (params.get('start') === '1') {
      start(initialLevel);
      setParams({ level: initialLevel }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answer = useCallback(
    (choice) => {
      setAnswers((prev) => {
        if (prev[index]) return prev;
        const next = [...prev];
        next[index] = { choice, correct: choice != null && choice === run[index].correct };
        return next;
      });
    },
    [index, run],
  );

  const next = useCallback(() => {
    if (index + 1 < run.length) {
      setIndex(index + 1);
      setPaused(false);
      return;
    }
    const score = answers.filter((a) => a?.correct).length;
    setIsBest(recordQuiz({ level, score, total: run.length }));
    setPhase('done');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [index, run, answers, level, recordQuiz]);

  // Enter advances once an answer is shown.
  useEffect(() => {
    if (phase !== 'playing' || !answers[index]) return undefined;
    const onKey = (e) => {
      if (e.key === 'Enter' && !e.target.closest?.('button, a')) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, answers, index, next]);

  const levelMeta = useMemo(() => QUIZ_LEVELS.find((l) => l.id === level), [level]);

  return (
    <div className="page container quiz-page">
      <header className="page-header">
        <p className="eyebrow">
          <Sparkles aria-hidden="true" className="inline-icon" /> Space knowledge challenge
        </p>
        <h1 className="h1">{phase === 'setup' ? 'How well do you know the cosmos?' : `${levelMeta?.label} challenge`}</h1>
        {phase === 'setup' && (
          <p className="lede">
            Questions on planets, stars, galaxies, black holes and missions — drawn at random from a curated bank of{' '}
            {questionsForLevel('mixed').length}. Your best score for each level is saved in this browser.
          </p>
        )}
      </header>

      {phase === 'setup' && (
        <Setup
          level={level}
          setLevel={setLevel}
          length={length}
          setLength={setLength}
          timed={timed}
          setTimed={setTimed}
          onStart={() => start()}
        />
      )}

      {phase === 'playing' && run.length > 0 && (
        <>
          <QuestionView
            run={run}
            index={index}
            answers={answers}
            onAnswer={answer}
            onNext={next}
            timed={timed}
            paused={paused}
            setPaused={setPaused}
          />
          <button type="button" className="btn btn--ghost btn--sm quiz-quit" onClick={() => setPhase('setup')}>
            Quit quiz
          </button>
        </>
      )}

      {phase === 'done' && (
        <Summary
          run={run}
          answers={answers}
          levelId={level}
          isBest={isBest}
          onReplay={() => start()}
          onChangeLevel={() => setPhase('setup')}
        />
      )}
    </div>
  );
}
