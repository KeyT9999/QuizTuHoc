import { useState, useEffect, useCallback, useRef } from 'react';
import type { Question } from '../utils/quizParser';
import { MLN_RESEARCH_UNCERTAIN } from '../data/mlnResearchAnswerKeys';

interface QuizProps {
  setId?: string;
  setTitle?: string;
  questions: Question[];
  onFinish: (answers: Record<number, string>) => void;
  onBack: () => void;
}

export default function Quiz({ setId, setTitle, questions, onFinish, onBack }: QuizProps) {
  const storageKeyIndex = setId ? `keyt_quiz_index_${setId}` : 'keyt_quiz_index';
  const storageKeyAnswers = setId ? `keyt_quiz_answers_${setId}` : 'keyt_quiz_answers';
  const storageKeyMastered = setId ? `keyt_quiz_mastered_${setId}` : 'keyt_quiz_mastered';
  const storageKeySubmitted = setId ? `keyt_quiz_submitted_${setId}` : 'keyt_quiz_submitted';

  // Load initial states from localStorage
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem(storageKeyIndex);
    const parsed = saved !== null ? parseInt(saved, 10) : 0;
    return !isNaN(parsed) && parsed >= 0 && parsed < questions.length ? parsed : 0;
  });

  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(storageKeyAnswers);
      if (saved) return JSON.parse(saved);
      // Fallback for legacy key
      if (setId === 'ccnc_426') {
        const legacy = localStorage.getItem('keyt_quiz_answers');
        if (legacy) return JSON.parse(legacy);
      }
      return {};
    } catch {
      return {};
    }
  });

  const [masteredIds, setMasteredIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeyMastered);
      if (saved) return JSON.parse(saved);
      // Fallback for legacy key
      if (setId === 'ccnc_426') {
        const legacy = localStorage.getItem('keyt_quiz_mastered');
        if (legacy) return JSON.parse(legacy);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [submittedIds, setSubmittedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeySubmitted);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
  const questionCardRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(storageKeyIndex, currentIndex.toString());
  }, [currentIndex, storageKeyIndex]);

  useEffect(() => {
    localStorage.setItem(storageKeyAnswers, JSON.stringify(answers));
  }, [answers, storageKeyAnswers]);

  useEffect(() => {
    localStorage.setItem(storageKeyMastered, JSON.stringify(masteredIds));
  }, [masteredIds, storageKeyMastered]);

  useEffect(() => {
    localStorage.setItem(storageKeySubmitted, JSON.stringify(submittedIds));
  }, [submittedIds, storageKeySubmitted]);

  const question = questions[currentIndex];
  const selectedAnswer = answers[question.id];
  const isUnresolved = question.correctAnswer === '?';
  const isMultipleChoice = !isUnresolved && question.correctAnswer.length > 1;
  const isAnswered = isUnresolved
    ? selectedAnswer !== undefined
    : isMultipleChoice
    ? submittedIds.includes(question.id)
    : selectedAnswer !== undefined;
  const isMastered = masteredIds.includes(question.id);
  const uncertainSet = new Set(MLN_RESEARCH_UNCERTAIN[setId ?? ''] ?? []);
  const progressPercent = Math.round((masteredIds.length / questions.length) * 100);

  const handleSelectOption = useCallback((key: string) => {
    if (isAnswered) return;
    const answer = isMultipleChoice
      ? (selectedAnswer?.includes(key)
          ? selectedAnswer.replace(key, '')
          : `${selectedAnswer ?? ''}${key}`)
          .split('')
          .sort()
          .join('')
      : key;
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    // If answer is correct, automatically mark as mastered!
    if (!isUnresolved && !isMultipleChoice && answer === question.correctAnswer && !masteredIds.includes(question.id)) {
      setMasteredIds((prev) => [...prev, question.id]);
    }
  }, [isAnswered, isMultipleChoice, selectedAnswer, answers, question, isUnresolved, masteredIds]);

  const handleCheckMultiple = useCallback(() => {
    if (!selectedAnswer || isAnswered) return;
    setSubmittedIds((prev) => [...prev, question.id]);
    if (selectedAnswer === question.correctAnswer && !masteredIds.includes(question.id)) {
      setMasteredIds((prev) => [...prev, question.id]);
    }
  }, [selectedAnswer, isAnswered, question, masteredIds]);

  const toggleMastered = (questionId: number) => {
    setMasteredIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const triggerSlide = (direction: 'next' | 'prev') => {
    setSlideDirection(direction);
    setTimeout(() => setSlideDirection(null), 280);
  };

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      triggerSlide('next');
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(answers);
    }
  }, [currentIndex, questions.length, answers, onFinish]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      triggerSlide('prev');
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleResetProgress = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ tiến trình học và bắt đầu lại từ đầu?')) {
      setCurrentIndex(0);
      setAnswers({});
      setMasteredIds([]);
      setSubmittedIds([]);
      localStorage.removeItem(storageKeyIndex);
      localStorage.removeItem(storageKeyAnswers);
      localStorage.removeItem(storageKeyMastered);
      localStorage.removeItem(storageKeySubmitted);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toLowerCase();

      // Option selection: A/B/C/D or 1/2/3/4
      const optionKeys: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D', '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      if (optionKeys[key]) {
        e.preventDefault();
        const optionKey = optionKeys[key];
        if (question.options.some((o) => o.key === optionKey)) {
          handleSelectOption(optionKey);
        }
        return;
      }

      // Navigation
      if (key === 'arrowright' || key === 'enter') {
        e.preventDefault();
        if (isMultipleChoice && !isAnswered && selectedAnswer) {
          handleCheckMultiple();
        } else {
          handleNext();
        }
        return;
      }

      if (key === 'arrowleft') {
        e.preventDefault();
        handlePrev();
        return;
      }

      // Toggle mastered
      if (key === 'm') {
        e.preventDefault();
        toggleMastered(question.id);
        return;
      }

      // Toggle question grid
      if (key === 'g') {
        e.preventDefault();
        setShowQuestionGrid((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, handleSelectOption, handleNext, handlePrev, handleCheckMultiple, isMultipleChoice, isAnswered, selectedAnswer]);

  return (
    <div className="quiz-v2-wrapper">
      {/* Top Header Bar */}
      <div className="quiz-v2-header">
        <div className="quiz-v2-header-left">
          <span className="quiz-v2-title">{setTitle ? setTitle.toUpperCase() : 'MULTIPLE CHOICE'}</span>
          <span className="quiz-v2-mastered-badge">
            ✓ Đã học: {masteredIds.length}/{questions.length} ({progressPercent}%)
          </span>
        </div>

        <div className="quiz-v2-header-right">
          <button
            type="button"
            className="quiz-v2-header-btn"
            onClick={() => setShowQuestionGrid(!showQuestionGrid)}
            title="Phím tắt: G"
          >
            📋 Danh sách câu ({currentIndex + 1}/{questions.length})
          </button>
          <button type="button" className="quiz-v2-header-btn" onClick={handleResetProgress}>
            🔄 Học lại từ đầu
          </button>
          <button type="button" className="quiz-v2-header-btn" onClick={onBack}>
            ← Đổi bộ đề
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-v2-progress-track">
        <div
          className="quiz-v2-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quick Question List Grid */}
      {showQuestionGrid && (
        <div className="quiz-v2-grid-modal">
          <div className="quiz-v2-grid-header">
            <strong>Danh sách câu hỏi & Tiến độ học:</strong>
            <button
              type="button"
              className="quiz-v2-header-btn"
              onClick={() => setShowQuestionGrid(false)}
            >
              ✕ Đóng
            </button>
          </div>
          <div className="quiz-v2-grid-items">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isQMastered = masteredIds.includes(q.id);
              const isQAnswered = q.correctAnswer.length > 1
                ? submittedIds.includes(q.id)
                : answers[q.id] !== undefined;

              let btnClass = 'quiz-v2-grid-item';
              if (isCurrent) btnClass += ' active';
              if (isQMastered) btnClass += ' mastered';
              else if (isQAnswered) btnClass += ' answered';
              if (uncertainSet.has(idx + 1)) btnClass += ' needs-review';

              return (
                <button
                  key={q.id}
                  type="button"
                  className={btnClass}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowQuestionGrid(false);
                  }}
                  title={`Câu ${idx + 1}: ${isQMastered ? 'Đã học' : isQAnswered ? 'Đã làm' : 'Chưa học'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content — Centered Card */}
      <div className="quiz-v2-content-center">
        <div
          ref={questionCardRef}
          className={`quiz-v2-question-card ${slideDirection === 'next' ? 'slide-in-right' : slideDirection === 'prev' ? 'slide-in-left' : ''}`}
          key={currentIndex}
        >
          {/* Question Header */}
          <div className="quiz-v2-q-header">
            <div className="quiz-v2-q-number">
              Câu {currentIndex + 1} <span className="quiz-v2-q-total">/ {questions.length}</span>
            </div>
            <button
              type="button"
              className={`quiz-v2-mastered-toggle ${isMastered ? 'is-mastered' : ''}`}
              onClick={() => toggleMastered(question.id)}
              title="Phím tắt: M"
            >
              {isMastered ? '✓ Đã học' : '📖 Đánh dấu đã học'}
            </button>
          </div>

          {/* Question Text */}
          <div className="quiz-v2-q-text">{question.text}</div>

          {/* Options */}
          <div className="quiz-v2-options">
            {question.options.map((opt) => {
              const isSelected = selectedAnswer?.includes(opt.key) ?? false;
              const isCorrect = question.correctAnswer.includes(opt.key);

              let optClass = 'quiz-v2-option';
              if (isSelected && !isAnswered) optClass += ' selected';
              if (isAnswered && !isUnresolved) {
                if (isCorrect) optClass += ' correct';
                else if (isSelected) optClass += ' incorrect';
                else optClass += ' dimmed';
              }

              return (
                <div
                  key={opt.key}
                  className={optClass}
                  onClick={() => handleSelectOption(opt.key)}
                >
                  <span className="quiz-v2-option-key">{opt.key}</span>
                  <span className="quiz-v2-option-text">{opt.text}</span>
                  {isAnswered && !isUnresolved && isCorrect && (
                    <span className="quiz-v2-option-icon correct-icon">✓</span>
                  )}
                  {isAnswered && !isUnresolved && isSelected && !isCorrect && (
                    <span className="quiz-v2-option-icon incorrect-icon">✗</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          {isAnswered && (
            <div className="quiz-v2-feedback">
              {isUnresolved ? (
                <span className="quiz-v2-feedback-warning">⚠ Chưa có đáp án nghiên cứu chắc chắn cho câu này.</span>
              ) : selectedAnswer === question.correctAnswer ? (
                <span className="quiz-v2-feedback-correct">✓ Đáp án chính xác!</span>
              ) : (
                <span className="quiz-v2-feedback-incorrect">✗ Sai! Đáp án đúng là {question.correctAnswer}</span>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="quiz-v2-actions">
            <button
              type="button"
              className="quiz-v2-btn secondary"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              title="Phím tắt: ←"
            >
              ← Câu trước
            </button>

            {isMultipleChoice && !isAnswered && (
              <button
                type="button"
                className="quiz-v2-btn primary"
                onClick={handleCheckMultiple}
                disabled={!selectedAnswer}
              >
                Kiểm tra đáp án
              </button>
            )}

            <button
              type="button"
              className="quiz-v2-btn primary"
              onClick={handleNext}
              title="Phím tắt: → hoặc Enter"
            >
              {currentIndex === questions.length - 1 ? 'Nộp bài & Kết quả' : 'Câu tiếp →'}
            </button>
          </div>

          {/* Keyboard Hint */}
          <div className="quiz-v2-keyboard-hint">
            💡 Phím tắt: <kbd>A</kbd><kbd>B</kbd><kbd>C</kbd><kbd>D</kbd> chọn đáp án · <kbd>←</kbd><kbd>→</kbd> chuyển câu · <kbd>M</kbd> đánh dấu · <kbd>G</kbd> danh sách
          </div>
        </div>
      </div>
    </div>
  );
}
