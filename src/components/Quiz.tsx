import { useState, useEffect } from 'react';
import type { Question } from '../utils/quizParser';

interface QuizProps {
  questions: Question[];
  onFinish: (answers: Record<number, string>) => void;
  onBack: () => void;
}

const STORAGE_KEY_INDEX = 'keyt_quiz_index';
const STORAGE_KEY_ANSWERS = 'keyt_quiz_answers';
const STORAGE_KEY_MASTERED = 'keyt_quiz_mastered';

export default function Quiz({ questions, onFinish, onBack }: QuizProps) {
  // Load initial states from localStorage
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INDEX);
    const parsed = saved !== null ? parseInt(saved, 10) : 0;
    return !isNaN(parsed) && parsed >= 0 && parsed < questions.length ? parsed : 0;
  });

  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANSWERS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [masteredIds, setMasteredIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MASTERED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showQuestionGrid, setShowQuestionGrid] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INDEX, currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MASTERED, JSON.stringify(masteredIds));
  }, [masteredIds]);

  const question = questions[currentIndex];
  const selectedAnswer = answers[question.id];
  const isAnswered = selectedAnswer !== undefined;
  const isMastered = masteredIds.includes(question.id);

  const handleSelectOption = (key: string) => {
    if (isAnswered) return;
    const newAnswers = { ...answers, [question.id]: key };
    setAnswers(newAnswers);

    // If answer is correct, automatically mark as mastered!
    if (key === question.correctAnswer && !masteredIds.includes(question.id)) {
      setMasteredIds((prev) => [...prev, question.id]);
    }
  };

  const toggleMastered = (questionId: number) => {
    setMasteredIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(answers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ tiến trình học và bắt đầu lại từ đầu?')) {
      setCurrentIndex(0);
      setAnswers({});
      setMasteredIds([]);
      localStorage.removeItem(STORAGE_KEY_INDEX);
      localStorage.removeItem(STORAGE_KEY_ANSWERS);
      localStorage.removeItem(STORAGE_KEY_MASTERED);
    }
  };

  return (
    <div className="fuo-quiz-wrapper">
      {/* Top Banner */}
      <div className="fuo-header-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="fuo-header-title">MULTIPLE CHOICE</span>
          <span className="fuo-learned-badge">
            ✓ Đã học: {masteredIds.length}/{questions.length} ({Math.round((masteredIds.length / questions.length) * 100)}%)
          </span>
        </div>

        <div className="fuo-header-controls">
          <button
            type="button"
            className="fuo-btn-text"
            onClick={() => setShowQuestionGrid(!showQuestionGrid)}
          >
            📋 Danh sách câu ({currentIndex + 1}/{questions.length})
          </button>
          <button type="button" className="fuo-btn-text" onClick={handleResetProgress}>
            🔄 Học lại từ đầu
          </button>
          <button type="button" className="fuo-btn-text" onClick={onBack}>
            Đổi đề thi
          </button>
        </div>
      </div>

      {/* Quick Question List Grid */}
      {showQuestionGrid && (
        <div className="fuo-grid-modal">
          <div className="fuo-grid-header">
            <strong>Danh sách câu hỏi & Tiến độ học:</strong>
            <button
              type="button"
              className="fuo-btn-text"
              onClick={() => setShowQuestionGrid(false)}
            >
              ✕ Đóng
            </button>
          </div>
          <div className="fuo-grid-items">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isQMastered = masteredIds.includes(q.id);
              const isQAnswered = answers[q.id] !== undefined;

              let btnClass = 'fuo-grid-item';
              if (isCurrent) btnClass += ' active';
              if (isQMastered) btnClass += ' mastered';
              else if (isQAnswered) btnClass += ' answered';

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

      {/* Main Content Area */}
      <div className="fuo-content-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div className="fuo-question-text" style={{ marginBottom: 0, flex: 1 }}>
            <strong>Câu {currentIndex + 1}:</strong> {question.text}
          </div>

          <button
            type="button"
            className={`fuo-toggle-mastered-btn ${isMastered ? 'is-mastered' : ''}`}
            onClick={() => toggleMastered(question.id)}
            title="Bấm để đánh dấu Đã học / Chưa học câu này"
          >
            {isMastered ? '✓ Đã học' : '📖 Đánh dấu đã học'}
          </button>
        </div>

        <div className="fuo-options-list">
          {question.options.map((opt) => {
            const isSelected = selectedAnswer === opt.key;
            const isCorrect = opt.key === question.correctAnswer;

            let optionStatusClass = '';
            if (isAnswered) {
              if (isCorrect) optionStatusClass = 'fuo-opt-correct';
              else if (isSelected) optionStatusClass = 'fuo-opt-incorrect';
              else optionStatusClass = 'fuo-opt-dimmed';
            }

            return (
              <div
                key={opt.key}
                className={`fuo-option-item ${isSelected ? 'selected' : ''} ${optionStatusClass}`}
                onClick={() => handleSelectOption(opt.key)}
              >
                <span className="fuo-option-label">{opt.key}.</span>
                <span className="fuo-option-content">{opt.text}</span>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="fuo-action-bar">
          <button
            type="button"
            className="fuo-nav-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            ← Câu trước
          </button>

          {isAnswered && (
            <div className="fuo-instant-result">
              {selectedAnswer === question.correctAnswer ? (
                <span className="fuo-txt-success">✓ Đáp án chính xác</span>
              ) : (
                <span className="fuo-txt-error">✗ Sai! Đáp án đúng là {question.correctAnswer}</span>
              )}
            </div>
          )}

          <button
            type="button"
            className="fuo-nav-btn fuo-primary"
            onClick={handleNext}
          >
            {currentIndex === questions.length - 1 ? 'Nộp bài & Kết quả' : 'Câu tiếp →'}
          </button>
        </div>
      </div>

      {/* Bottom Left Logo Box */}
      <div className="fuo-watermark">
        <div className="fuo-logo-main">KEYT</div>
        <div className="fuo-logo-sub">KEYT.COM</div>
      </div>
    </div>
  );
}
