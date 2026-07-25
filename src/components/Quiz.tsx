import { useState } from 'react';
import type { Question } from '../utils/quizParser';

interface QuizProps {
  questions: Question[];
  onFinish: (answers: Record<number, string>) => void;
  onBack: () => void;
}

export default function Quiz({ questions, onFinish, onBack }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const question = questions[currentIndex];
  const selectedAnswer = answers[question.id];
  const isAnswered = selectedAnswer !== undefined;

  const handleSelectOption = (key: string) => {
    if (isAnswered) return;
    setAnswers((prev) => ({ ...prev, [question.id]: key }));
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

  return (
    <div className="fuo-quiz-wrapper">
      {/* Top Banner */}
      <div className="fuo-header-banner">
        <span className="fuo-header-title">MULTIPLE CHOICE</span>
        <div className="fuo-header-controls">
          <span className="fuo-question-count">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <button type="button" className="fuo-btn-text" onClick={onBack}>
            Đổi đề thi
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="fuo-content-area">
        <div className="fuo-question-text">
          {question.text}
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
