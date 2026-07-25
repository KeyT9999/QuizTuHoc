import { useState, useEffect } from 'react';
import type { Question } from '../utils/quizParser';

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

  const [showQuestionGrid, setShowQuestionGrid] = useState(false);

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
      localStorage.removeItem(storageKeyIndex);
      localStorage.removeItem(storageKeyAnswers);
      localStorage.removeItem(storageKeyMastered);
    }
  };

  return (
    <div className="fuo-quiz-wrapper">
      {/* Top Banner */}
      <div className="fuo-header-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="fuo-header-title">{setTitle ? setTitle.toUpperCase() : 'MULTIPLE CHOICE'}</span>
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
            ← Đổi bộ đề
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
