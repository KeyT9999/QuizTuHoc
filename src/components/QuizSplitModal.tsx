import { useState, useMemo } from 'react';
import type { Question } from '../utils/quizParser';
import { calculateQuizParts, type QuizSplitSettings } from '../utils/quizSplit';

interface QuizSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalQuestions: number;
  settings: QuizSplitSettings;
  masteredIds: number[];
  questions: Question[];
  onApply: (newSettings: QuizSplitSettings, targetPartIndex?: number) => void;
}

const PRESET_CHUNKS = [20, 30, 50, 100];

export default function QuizSplitModal({
  isOpen,
  onClose,
  totalQuestions,
  settings,
  masteredIds,
  questions,
  onApply,
}: QuizSplitModalProps) {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [chunkSize, setChunkSize] = useState(settings.chunkSize || 50);
  const [selectedPart, setSelectedPart] = useState(settings.currentPart || 0);

  // Sync state if modal is reopened with new settings
  useMemo(() => {
    if (isOpen) {
      setEnabled(settings.enabled);
      setChunkSize(settings.chunkSize || 50);
      setSelectedPart(settings.currentPart || 0);
    }
  }, [isOpen, settings]);

  const sanitizedChunkSize = useMemo(() => {
    if (!chunkSize || isNaN(chunkSize) || chunkSize < 5) return 5;
    if (chunkSize > totalQuestions) return Math.max(5, totalQuestions);
    return Math.floor(chunkSize);
  }, [chunkSize, totalQuestions]);

  const calculatedParts = useMemo(() => {
    return calculateQuizParts(totalQuestions, sanitizedChunkSize);
  }, [totalQuestions, sanitizedChunkSize]);

  // Ensure selectedPart is valid
  const safeSelectedPart = useMemo(() => {
    if (selectedPart >= calculatedParts.length) {
      return Math.max(0, calculatedParts.length - 1);
    }
    return Math.max(0, selectedPart);
  }, [selectedPart, calculatedParts]);

  if (!isOpen) return null;

  const handleApply = (targetPart?: number) => {
    const finalPart = targetPart !== undefined ? targetPart : safeSelectedPart;
    onApply(
      {
        enabled,
        chunkSize: sanitizedChunkSize,
        currentPart: finalPart,
      },
      finalPart
    );
    onClose();
  };

  const handleSelectPartAndApply = (partIndex: number) => {
    setSelectedPart(partIndex);
    handleApply(partIndex);
  };

  return (
    <div className="quiz-split-modal-overlay" onClick={onClose}>
      <div className="quiz-split-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="quiz-split-modal-header">
          <div className="quiz-split-modal-title-box">
            <span className="quiz-split-modal-icon">⚙️</span>
            <div>
              <h3 className="quiz-split-modal-title">Cấu hình chia nhỏ Quiz</h3>
              <p className="quiz-split-modal-subtitle">
                Tự setup làm 1 mạch toàn bộ hoặc chia thành nhiều phần nhỏ để làm theo lộ trình
              </p>
            </div>
          </div>
          <button
            type="button"
            className="quiz-split-modal-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector */}
        <div className="quiz-split-mode-selector">
          <button
            type="button"
            className={`quiz-split-mode-card ${!enabled ? 'active' : ''}`}
            onClick={() => setEnabled(false)}
          >
            <div className="quiz-split-mode-card-header">
              <span className="quiz-split-mode-emoji">📜</span>
              <span className="quiz-split-mode-name">Làm toàn bộ (Full)</span>
              {!enabled && <span className="quiz-split-badge-active">Đang chọn</span>}
            </div>
            <p className="quiz-split-mode-desc">
              Làm liên tục một mạch toàn bộ {totalQuestions} câu hỏi mà không phân chia.
            </p>
          </button>

          <button
            type="button"
            className={`quiz-split-mode-card ${enabled ? 'active' : ''}`}
            onClick={() => setEnabled(true)}
          >
            <div className="quiz-split-mode-card-header">
              <span className="quiz-split-mode-emoji">✂️</span>
              <span className="quiz-split-mode-name">Chia thành nhiều quiz nhỏ</span>
              {enabled && <span className="quiz-split-badge-active">Đang chọn</span>}
            </div>
            <p className="quiz-split-mode-desc">
              Chia bộ đề ra thành từng phần nhỏ (ví dụ 30, 50, 100 câu) để học tập trung hơn.
            </p>
          </button>
        </div>

        {/* Split Options when enabled */}
        {enabled && (
          <div className="quiz-split-config-body">
            <div className="quiz-split-input-section">
              <label className="quiz-split-input-label" htmlFor="chunkSizeInput">
                Số câu hỏi trong 1 quiz nhỏ:
              </label>

              <div className="quiz-split-input-row">
                <input
                  id="chunkSizeInput"
                  type="number"
                  min={5}
                  max={totalQuestions}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value, 10) || 0)}
                  className="quiz-split-number-input"
                  placeholder="Ví dụ: 50"
                />
                <span className="quiz-split-unit">câu / quiz</span>

                <div className="quiz-split-presets">
                  {PRESET_CHUNKS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`quiz-split-preset-btn ${sanitizedChunkSize === preset ? 'active' : ''}`}
                      onClick={() => setChunkSize(preset)}
                    >
                      {preset} câu
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary info */}
            <div className="quiz-split-summary-box">
              <div className="quiz-split-summary-icon">💡</div>
              <div className="quiz-split-summary-text">
                Tổng <strong>{totalQuestions}</strong> câu được chia thành{' '}
                <strong>{calculatedParts.length} phần</strong>.
                {calculatedParts.length > 1 && (
                  <span>
                    {' '}
                    Mỗi phần gồm <strong>{sanitizedChunkSize} câu</strong>
                    {totalQuestions % sanitizedChunkSize !== 0
                      ? ` (phần cuối gồm ${calculatedParts[calculatedParts.length - 1].totalCount} câu).`
                      : '.'}
                  </span>
                )}
              </div>
            </div>

            {/* Parts List / Direct selection */}
            <div className="quiz-split-parts-container">
              <div className="quiz-split-parts-title-row">
                <span className="quiz-split-parts-title">
                  Chọn phần để bắt đầu học ngay ({calculatedParts.length} phần):
                </span>
                <span className="quiz-split-parts-hint">Bấm vào phần bất kỳ để chuyển tới</span>
              </div>

              <div className="quiz-split-parts-grid">
                {calculatedParts.map((part) => {
                  const isCurrent = safeSelectedPart === part.partIndex;
                  const partQuestionIds = questions
                    .slice(part.startIndex, part.endIndex + 1)
                    .map((q) => q.id);
                  const masteredCount = partQuestionIds.filter((id) =>
                    masteredIds.includes(id)
                  ).length;
                  const percent = Math.round((masteredCount / part.totalCount) * 100);

                  return (
                    <div
                      key={part.partIndex}
                      className={`quiz-split-part-card ${isCurrent ? 'selected' : ''}`}
                      onClick={() => handleSelectPartAndApply(part.partIndex)}
                    >
                      <div className="quiz-split-part-top">
                        <div className="quiz-split-part-name">
                          <strong>{part.name}</strong>
                          <span className="quiz-split-part-range">
                            (Câu {part.startNumber} - {part.endNumber})
                          </span>
                        </div>
                        {isCurrent && <span className="quiz-split-part-tag">Đang làm</span>}
                      </div>

                      <div className="quiz-split-part-progress-info">
                        <span className="quiz-split-part-progress-text">
                          ✓ Đã học: {masteredCount}/{part.totalCount} ({percent}%)
                        </span>
                        <div className="quiz-split-part-progress-bar">
                          <div
                            className="quiz-split-part-progress-fill"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`quiz-split-part-btn ${isCurrent ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPartAndApply(part.partIndex);
                        }}
                      >
                        {isCurrent ? 'Đang làm phần này' : 'Làm phần này →'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="quiz-split-modal-footer">
          <button type="button" className="quiz-split-btn-cancel" onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className="quiz-split-btn-apply"
            onClick={() => handleApply()}
          >
            Lưu & Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
