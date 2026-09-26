import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Question } from '../../utils/quizParser';
import AskAI from '../AskAI';
import {
  getMistakeQuestionIds,
  removeMistakeQuestion,
  clearMistakes,
} from '../../utils/gameStorage';
import { playClickSound, playCorrectSound, playWrongSound } from '../../utils/soundEffects';

interface MistakeBusterViewProps {
  setId: string;
  setTitle?: string;
  allQuestions: Question[];
  onBackToStudy: () => void;
  onMistakesUpdated: () => void;
}

export default function MistakeBusterView({
  setId,
  allQuestions,
  onBackToStudy,
  onMistakesUpdated,
}: MistakeBusterViewProps) {
  const [mistakeIds, setMistakeIds] = useState<number[]>(() => getMistakeQuestionIds(setId));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Filter questions that are in mistakeIds
  const mistakeQuestions = useMemo(() => {
    return allQuestions.filter((q) => mistakeIds.includes(q.id));
  }, [allQuestions, mistakeIds]);

  const currentQ = mistakeQuestions[currentIndex] || null;

  // Handle Answer
  const handleSelectOption = useCallback(
    (key: string) => {
      if (!currentQ || showExplanation) return;

      setSelectedKey(key);
      setShowExplanation(true);

      const isCorrect = key.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase();

      if (isCorrect) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    },
    [currentQ, showExplanation]
  );

  const handleNext = useCallback(() => {
    if (!currentQ || !selectedKey) return;

    const isCorrect = selectedKey.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase();
    setSelectedKey(null);
    setShowExplanation(false);

    if (isCorrect) {
      // Keep the answered question visible until the user explicitly continues.
      const updated = mistakeIds.filter((id) => id !== currentQ.id);
      removeMistakeQuestion(setId, currentQ.id);
      setMistakeIds(updated);
      onMistakesUpdated();
      setCurrentIndex((prev) => (updated.length === 0 ? 0 : Math.min(prev, updated.length - 1)));
      return;
    }

    if (currentIndex < mistakeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  }, [currentQ, selectedKey, mistakeIds, setId, onMistakesUpdated, currentIndex, mistakeQuestions.length]);

  const handlePrev = useCallback(() => {
    setSelectedKey(null);
    setShowExplanation(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm sạch toàn bộ danh sách câu sai của đề này?')) {
      clearMistakes(setId);
      setMistakeIds([]);
      onMistakesUpdated();
      playClickSound();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        if (!showExplanation) {
          e.preventDefault();
          handleSelectOption(key);
        }
      } else if (e.key === 'ArrowRight' || e.code === 'Space') {
        if (showExplanation) {
          e.preventDefault();
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (showExplanation) {
          e.preventDefault();
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showExplanation, handleSelectOption, handleNext, handlePrev]);

  // Clean state (no mistakes left!)
  if (mistakeQuestions.length === 0) {
    return (
      <div className="game-card-surface game-splash-box">
        <div className="game-splash-header">
          <div className="game-icon-orb orb-green">🛡️</div>
          <h2 className="game-splash-title">Bộ Đề Đã Sạch Lỗi!</h2>
          <p className="game-splash-subtitle">
            Tuyệt vời! Hiện tại bạn không còn câu hỏi nào bị sai trong bộ đề này. Mọi sai sót trong các ván chơi game hoặc trắc nghiệm sẽ được tự động gom vào đây để bạn phục thù.
          </p>
        </div>

        <div className="game-splash-actions">
          <button type="button" className="game-btn-primary game-btn-large" onClick={onBackToStudy}>
            ← Quay lại ôn luyện trắc nghiệm
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const isAnswered = showExplanation;
  const isCorrect = selectedKey?.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase();

  return (
    <div className="game-gameplay-container">
      {/* Header Info */}
      <div className="game-hud-bar game-hud-mistakes">
        <div className="mistake-counter-pill">
          <span>🛡️ SỬA LỖI:</span>
          <strong> Câu {currentIndex + 1} / {mistakeQuestions.length} câu sai</strong>
        </div>

        <button type="button" className="game-btn-tiny" onClick={handleClearAll} title="Xóa toàn bộ câu sai khỏi danh sách">
          🗑️ Xóa sạch danh sách sai
        </button>
      </div>

      {/* Question Card */}
      <div className="game-question-card">
        <div className="game-q-counter">
          <span>Câu hỏi gốc #{currentQ.id}</span>
          <span className="game-q-hint-key">Chọn đúng sẽ tự động xóa câu này khỏi danh sách sai!</span>
        </div>

        <div className="game-q-text">{currentQ.text}</div>

        <AskAI question={currentQ} />

        <div className="game-q-options">
          {currentQ.options.map((opt) => {
            const isSelected = selectedKey === opt.key;
            const isCorrectAnswer = opt.key.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase();

            let optClass = 'game-q-opt-btn';
            if (isAnswered) {
              if (isCorrectAnswer) {
                optClass += ' opt-flash-correct';
              } else if (isSelected) {
                optClass += ' opt-flash-wrong';
              }
            }

            return (
              <button
                key={opt.key}
                type="button"
                className={optClass}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt.key)}
              >
                <span className="opt-key-circle">{opt.key}</span>
                <span className="opt-label-text">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback & Explanation */}
        {showExplanation && (
          <div className={`mistake-feedback-box ${isCorrect ? 'fb-correct' : 'fb-wrong'}`}>
            <div className="fb-headline">
              {isCorrect ? '🎉 Chính xác! Bấm “Câu tiếp theo” để loại bỏ câu này khỏi sổ lỗi.' : '❌ Vẫn chưa đúng! Hãy ghi nhớ đáp án.'}
            </div>
            <div className="fb-details">
              Đáp án chuẩn: <strong>{currentQ.correctAnswer}</strong>
              {currentQ.options.find((o) => o.key.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase()) && (
                <div className="fb-explanation-text">
                  💡 <em>Chi tiết: {currentQ.options.find((o) => o.key.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase())?.text}</em>
                </div>
              )}
            </div>

            <div className="fb-actions">
              <button type="button" className="game-btn-primary" onClick={handleNext}>
                Câu tiếp theo (Space hoặc →)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
