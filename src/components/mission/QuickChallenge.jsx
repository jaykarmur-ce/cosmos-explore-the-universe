import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Shuffle, ArrowRight } from 'lucide-react';
import { QUESTIONS, QUIZ_CATEGORIES } from '../../data/quiz.js';
import { useProgress } from '../../context/ProgressContext.jsx';
import { shuffle } from '../../utils/helpers.js';

function drawQuestion(excludeId) {
  const pool = QUESTIONS.filter((q) => q.id !== excludeId);
  const q = pool[Math.floor(Math.random() * pool.length)];
  const correct = q.choices[q.answer];
  return { ...q, options: shuffle(q.choices), correct };
}

/** A single random question answered inline, with immediate feedback. */
export default function QuickChallenge() {
  const { recordAnswer } = useProgress();
  const [question, setQuestion] = useState(() => drawQuestion());
  const [picked, setPicked] = useState(null);

  const answer = (option) => {
    if (picked) return;
    setPicked(option);
    recordAnswer(option === question.correct);
  };

  const next = useCallback(() => {
    setQuestion((q) => drawQuestion(q.id));
    setPicked(null);
  }, []);

  const isCorrect = picked === question.correct;

  return (
    <div className="quick-challenge">
      <div className="quick-challenge__meta">
        <span className="tag">{QUIZ_CATEGORIES[question.category]}</span>
        <span className="tag tag--violet">{question.difficulty}</span>
      </div>
      <p className="quick-challenge__prompt" id="quick-challenge-prompt">
        {question.prompt}
      </p>
      <div className="quick-challenge__options" role="group" aria-labelledby="quick-challenge-prompt">
        {question.options.map((option) => {
          const state = picked ? (option === question.correct ? 'correct' : option === picked ? 'wrong' : 'idle') : 'idle';
          return (
            <button
              key={option}
              type="button"
              className={`answer answer--${state}`}
              onClick={() => answer(option)}
              disabled={Boolean(picked) && state === 'idle'}
              aria-pressed={picked === option}
            >
              <span>{option}</span>
              {state === 'correct' && <Check aria-hidden="true" />}
              {state === 'wrong' && <X aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {picked && (
          <p className={`quick-challenge__feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
            <strong>{isCorrect ? 'Correct. ' : `Not quite — it’s ${question.correct}. `}</strong>
            {question.explanation}
          </p>
        )}
      </div>
      <div className="quick-challenge__actions">
        <button type="button" className="btn btn--sm" onClick={next}>
          <Shuffle aria-hidden="true" /> {picked ? 'Next question' : 'Skip'}
        </button>
        <Link to="/quiz" className="link-arrow">
          Full quiz <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
