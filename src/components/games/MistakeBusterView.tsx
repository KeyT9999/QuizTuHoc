import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Question } from '../../utils/quizParser';
import AskAI from '../AskAI';
import {
  getMistakeQuestionIds,
  removeMistakeQuestion,
  clearMistakes,
} from '../../utils/gameStorage';
import { playClickSound, playCorrectSound, playWrongSound } from '../../utils/soundEffects';
import { useTheme } from '../../context/ThemeContext';
import DongSonDrumSvg from '../DongSonDrumSvg';
import ZenTempleWatermark from '../ZenTempleWatermark';

const normalizeAnswer = (answer: string) =>
  answer.trim().toUpperCase().replace(/[^A-F]/g, '').split('').sort().join('');

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
  const { theme } = useTheme();
  const [mistakeIds, setMistakeIds] = useState<number[]>(() => getMistakeQuestionIds(setId));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  // Filter questions that are in mistakeIds
  const mistakeQuestions = useMemo(() => {
    return allQuestions.filter((q) => mistakeIds.includes(q.id));
  }, [allQuestions, mistakeIds]);

  const currentQ = mistakeQuestions[currentIndex] || null;
  const isMultipleChoice = Boolean(
    currentQ && currentQ.correctAnswer.trim() !== '?' && normalizeAnswer(currentQ.correctAnswer).length > 1
  );

  // Handle Answer
  const handleSelectOption = useCallback(
    (key: string) => {
      if (!currentQ || showExplanation) return;

      if (isMultipleChoice) {
        const normalizedKey = key.toUpperCase();
        setSelectedAnswer((previous) =>
          previous.includes(normalizedKey)
            ? previous.replace(normalizedKey, '')
            : [...previous, normalizedKey].sort().join('')
        );
        playClickSound();
        return;
      }

      setSelectedAnswer(key.toUpperCase());
      setShowExplanation(true);

      const isCorrect = normalizeAnswer(key) === normalizeAnswer(currentQ.correctAnswer);

      if (isCorrect) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    },
    [currentQ, isMultipleChoice, showExplanation]
  );

  const handleCheckAnswer = useCallback(() => {
    if (!currentQ || !isMultipleChoice || !selectedAnswer || showExplanation) return;

    setShowExplanation(true);
    if (normalizeAnswer(selectedAnswer) === normalizeAnswer(currentQ.correctAnswer)) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  }, [currentQ, isMultipleChoice, selectedAnswer, showExplanation]);

  const handleNext = useCallback(() => {
    if (!currentQ || !selectedAnswer || !showExplanation) return;

    const isCorrect = normalizeAnswer(selectedAnswer) === normalizeAnswer(currentQ.correctAnswer);
    setSelectedAnswer('');
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
  }, [currentQ, selectedAnswer, showExplanation, mistakeIds, setId, onMistakesUpdated, currentIndex, mistakeQuestions.length]);

  const handlePrev = useCallback(() => {
    setSelectedAnswer('');
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
    const emptyTitles = {
      'hon-viet': {
        icon: '📜',
        title: 'Bí Kíp Đã Sạch Lỗi Sai!',
        desc: 'Hào khí bảng vàng đã trọn vẹn! Hiện tại bạn không còn câu hỏi nào bị đánh dấu sai trong bộ đề này.',
      },
      'fantasy-academy': {
        icon: '✨',
        title: 'Phong Ấn Đã Được Thanh Tẩy!',
        desc: 'Tuyệt đỉnh pháp sư! Toàn bộ câu hỏi sai đã được thanh tẩy hoàn toàn khỏi Cổ Thư Viện.',
      },
      'cozy-night': {
        icon: '🌟',
        title: 'Sổ Tay Đêm Đã Hoàn Toàn Sạch Lỗi!',
        desc: 'Bạn đã hoàn thành phục thù tất cả câu hỏi sai rồi. Hãy thư giãn một chút nhé!',
      },
      'lotus-zen-sanctuary': {
        icon: '🪷',
        title: 'Tâm Trí Sáng Trong — Sạch Mọi Nghi Vấn!',
        desc: 'Công đức viên mãn! Toàn bộ câu hỏi sai sót đã được quán chiếu và khắc phục hoàn toàn trong bộ kinh thư này.',
      },
      default: {
        icon: '🛡️',
        title: 'Bộ Đề Đã Sạch Lỗi!',
        desc: 'Tuyệt vời! Hiện tại bạn không còn câu hỏi nào bị sai trong bộ đề này.',
      },
    };
    const emptyState = emptyTitles[theme] || emptyTitles.default;

    return (
      <div className={`game-card-surface game-splash-box theme-${theme}`}>
        {theme === 'lotus-zen-sanctuary' && (
          <div className="theme-bg-watermark-small" aria-hidden="true">
            <ZenTempleWatermark size={520} opacity={0.045} color="#A77636" />
          </div>
        )}
        <div className="game-splash-header">
          <div className="game-icon-orb orb-green">{emptyState.icon}</div>
          <h2 className="game-splash-title">{emptyState.title}</h2>
          <p className="game-splash-subtitle">{emptyState.desc}</p>
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
  const normalizedCorrectAnswer = normalizeAnswer(currentQ.correctAnswer);
  const isCorrect = normalizeAnswer(selectedAnswer) === normalizedCorrectAnswer;

  return (
    <div className={`game-gameplay-container theme-${theme}`}>
      {theme === 'hon-viet' && (
        <div className="theme-bg-watermark-small" aria-hidden="true">
          <DongSonDrumSvg size={520} opacity={0.035} color="#d97706" />
        </div>
      )}
      {theme === 'lotus-zen-sanctuary' && (
        <div className="theme-bg-watermark-small" aria-hidden="true">
          <ZenTempleWatermark size={520} opacity={0.045} color="#A77636" />
        </div>
      )}

      {/* Header Info */}
      <div className="game-hud-bar game-hud-mistakes">
        <div className="mistake-counter-pill">
          <span>{theme === 'fantasy-academy' ? '🔮 THANH TẨY:' : theme === 'hon-viet' ? '📜 PHỤC THÙ:' : theme === 'lotus-zen-sanctuary' ? '🪷 QUÁN CHIẾU:' : '🛡️ SỬA LỖI:'}</span>
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
          <span className="game-q-hint-key">
            {isMultipleChoice
              ? 'Câu này có nhiều đáp án đúng. Chọn tất cả đáp án rồi kiểm tra.'
              : 'Chọn đúng sẽ tự động xóa câu này khỏi danh sách sai!'}
          </span>
        </div>

        <div className="game-q-text">{currentQ.text}</div>

        <AskAI question={currentQ} />

        <div className="game-q-options">
          {currentQ.options.map((opt) => {
            const normalizedKey = opt.key.toUpperCase();
            const isSelected = selectedAnswer.includes(normalizedKey);
            const isCorrectAnswer = normalizedCorrectAnswer.includes(normalizedKey);

            let optClass = 'game-q-opt-btn';
            if (isAnswered) {
              if (isCorrectAnswer) {
                optClass += ' opt-flash-correct';
              } else if (isSelected) {
                optClass += ' opt-flash-wrong';
              }
            } else if (isSelected) {
              optClass += ' selected';
            }

            return (
              <button
                key={opt.key}
                type="button"
                className={optClass}
                aria-pressed={isSelected}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt.key)}
              >
                <span className="opt-key-circle">{opt.key}</span>
                <span className="opt-label-text">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {isMultipleChoice && !isAnswered && (
          <div className="mistake-check-actions">
            <span aria-live="polite">
              Đã chọn: <strong>{selectedAnswer ? selectedAnswer.split('').join(', ') : 'chưa có đáp án'}</strong>
            </span>
            <button
              type="button"
              className="game-btn-primary"
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer}
            >
              Kiểm tra đáp án
            </button>
          </div>
        )}

        {/* Feedback & Explanation */}
        {showExplanation && (
          <div className={`mistake-feedback-box ${isCorrect ? 'fb-correct' : 'fb-wrong'}`}>
            <div className="fb-headline">
              {isCorrect ? '🎉 Chính xác! Bấm “Câu tiếp theo” để loại bỏ câu này khỏi sổ lỗi.' : '❌ Vẫn chưa đúng! Hãy ghi nhớ đáp án.'}
            </div>
            <div className="fb-details">
              {isMultipleChoice ? 'Các đáp án chuẩn: ' : 'Đáp án chuẩn: '}
              <strong>{currentQ.correctAnswer}</strong>
              {currentQ.options
                .filter((option) => normalizedCorrectAnswer.includes(option.key.toUpperCase()))
                .map((option) => (
                  <div className="fb-explanation-text" key={option.key}>
                    💡 <em>{option.key}: {option.text}</em>
                  </div>
                ))}
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
