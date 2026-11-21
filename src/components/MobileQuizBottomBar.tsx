import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  AI_PERSONAS,
  MOBILE_ASK_AI_STATE_EVENT,
  MOBILE_ASK_AI_TOGGLE_EVENT,
} from '../utils/askAIConfig';

interface MobileQuizBottomBarProps {
  canPrev: boolean;
  isAnswered: boolean;
  isRevealed: boolean;
  isMultipleChoice: boolean;
  selectedAnswer?: string;
  nextLabel: string;
  onPrev: () => void;
  onToggleReveal: () => void;
  onCheckMultiple: () => void;
  onNext: () => void;
}

export default function MobileQuizBottomBar({
  canPrev,
  isAnswered,
  isRevealed,
  isMultipleChoice,
  selectedAnswer,
  nextLabel,
  onPrev,
  onToggleReveal,
  onCheckMultiple,
  onNext,
}: MobileQuizBottomBarProps) {
  const { theme } = useTheme();
  const persona = AI_PERSONAS[theme] || AI_PERSONAS.default;
  const [aiState, setAiState] = useState({ isOpen: false, isLoading: false, hasAnswer: false });

  useEffect(() => {
    const handleState = (event: Event) => {
      const detail = (event as CustomEvent<{ isOpen: boolean; isLoading: boolean; hasAnswer: boolean }>).detail;
      if (detail) {
        setAiState(detail);
      }
    };
    window.addEventListener(MOBILE_ASK_AI_STATE_EVENT, handleState);
    return () => window.removeEventListener(MOBILE_ASK_AI_STATE_EVENT, handleState);
  }, []);

  const showCheckMulti = isMultipleChoice && !isAnswered && Boolean(selectedAnswer);

  return (
    <nav
      className={`mobile-quiz-dock mobile-quiz-dock-${theme}`}
      aria-label="Điều hướng câu hỏi nhanh"
    >
      <button
        type="button"
        className="mobile-dock-btn mobile-dock-prev"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Câu trước"
        title="Câu trước"
      >
        ←
      </button>

      <button
        type="button"
        className={`mobile-dock-btn mobile-dock-reveal ${isRevealed ? 'is-active' : ''} ${isAnswered ? 'is-answered' : ''}`}
        onClick={onToggleReveal}
        disabled={isAnswered}
        aria-label={isAnswered ? 'Đã có đáp án' : isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
      >
        <span aria-hidden="true">{isAnswered ? '✓' : isRevealed ? '🙈' : '👁️'}</span>
        <span>{isAnswered ? 'Đã rõ' : isRevealed ? 'Ẩn' : 'Đáp án'}</span>
      </button>

      <button
        type="button"
        className={`mobile-dock-btn mobile-dock-ai ${aiState.isOpen ? 'is-open' : ''} ${aiState.isLoading ? 'is-loading' : ''} ${aiState.hasAnswer ? 'has-answer' : ''}`}
        onClick={() => window.dispatchEvent(new CustomEvent(MOBILE_ASK_AI_TOGGLE_EVENT))}
        aria-expanded={aiState.isOpen}
        aria-label="Hỏi AI giải thích câu này"
      >
        <span aria-hidden="true">{aiState.isLoading ? '⏳' : persona.btnIcon}</span>
        <span>AI</span>
      </button>

      {showCheckMulti ? (
        <button
          type="button"
          className="mobile-dock-btn mobile-dock-next is-check-multi"
          onClick={onCheckMultiple}
        >
          Kiểm tra ({selectedAnswer?.split('').join(', ')})
        </button>
      ) : (
        <button
          type="button"
          className="mobile-dock-btn mobile-dock-next"
          onClick={onNext}
        >
          {nextLabel}
        </button>
      )}
    </nav>
  );
}
