import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorageState } from '../hooks/useLocalStorage.js';
import { getBody } from '../data/planets.js';
import { getDiscovery } from '../data/discoveries.js';
import { getMilestone } from '../data/timeline.js';
import { QUIZ_LEVELS } from '../data/quiz.js';

const STORAGE_KEY = 'cosmos:progress:v1';
const ProgressContext = createContext(null);
const LEVEL_IDS = QUIZ_LEVELS.map((l) => l.id);

const EMPTY = {
  visitedBodies: [],
  viewedDiscoveries: [],
  readMilestones: [],
  quizzesCompleted: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  bestScores: {},
};

const uniqueValid = (list, resolve) =>
  Array.isArray(list) ? [...new Set(list.filter((id) => typeof id === 'string' && resolve(id)))] : [];
const nonNegativeInt = (n) => (Number.isInteger(n) && n >= 0 ? n : 0);

function sanitizeProgress(value) {
  const v = value && typeof value === 'object' ? value : {};
  const bestScores = {};
  if (v.bestScores && typeof v.bestScores === 'object') {
    for (const level of LEVEL_IDS) {
      const s = v.bestScores[level];
      if (s && Number.isInteger(s.score) && Number.isInteger(s.total) && s.total > 0 && s.score >= 0 && s.score <= s.total) {
        bestScores[level] = { score: s.score, total: s.total, date: typeof s.date === 'string' ? s.date : null };
      }
    }
  }
  return {
    visitedBodies: uniqueValid(v.visitedBodies, getBody),
    viewedDiscoveries: uniqueValid(v.viewedDiscoveries, getDiscovery),
    readMilestones: uniqueValid(v.readMilestones, getMilestone),
    quizzesCompleted: nonNegativeInt(v.quizzesCompleted),
    questionsAnswered: nonNegativeInt(v.questionsAnswered),
    correctAnswers: Math.min(nonNegativeInt(v.correctAnswers), nonNegativeInt(v.questionsAnswered)),
    bestScores,
  };
}

const pct = (s) => (s ? s.score / s.total : -1);

/** Higher percentage wins; on a tie, the longer quiz wins. */
const beats = (previous, score, total) =>
  total > 0 && (!previous || score / total > pct(previous) || (score / total === pct(previous) && total > previous.total));

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useLocalStorageState(STORAGE_KEY, EMPTY, sanitizeProgress);

  const addUnique = useCallback(
    (field, id) =>
      setProgress((prev) => (prev[field].includes(id) ? prev : { ...prev, [field]: [...prev[field], id] })),
    [setProgress],
  );

  const markBodyVisited = useCallback((id) => getBody(id) && addUnique('visitedBodies', id), [addUnique]);
  const markDiscoveryViewed = useCallback((id) => getDiscovery(id) && addUnique('viewedDiscoveries', id), [addUnique]);
  const markMilestoneRead = useCallback((id) => getMilestone(id) && addUnique('readMilestones', id), [addUnique]);

  /** Record a finished quiz. Returns true when it set a new best for that level. */
  const recordQuiz = useCallback(
    ({ level, score, total }) => {
      const isBest = beats(progress.bestScores[level], score, total);
      setProgress((prev) => {
        const better = beats(prev.bestScores[level], score, total);
        return {
          ...prev,
          quizzesCompleted: prev.quizzesCompleted + 1,
          questionsAnswered: prev.questionsAnswered + total,
          correctAnswers: prev.correctAnswers + score,
          bestScores: better
            ? { ...prev.bestScores, [level]: { score, total, date: new Date().toISOString() } }
            : prev.bestScores,
        };
      });
      return isBest;
    },
    [progress.bestScores, setProgress],
  );

  /** Count a single answer from the Mission Control quick challenge. */
  const recordAnswer = useCallback(
    (correct) =>
      setProgress((prev) => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      })),
    [setProgress],
  );

  const resetProgress = useCallback(() => setProgress(EMPTY), [setProgress]);

  const value = useMemo(
    () => ({
      progress,
      markBodyVisited,
      markDiscoveryViewed,
      markMilestoneRead,
      recordQuiz,
      recordAnswer,
      resetProgress,
    }),
    [progress, markBodyVisited, markDiscoveryViewed, markMilestoneRead, recordQuiz, recordAnswer, resetProgress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
