import { useState, useEffect, useRef } from 'react';
import QuizModeBar, { type QuizPlayMode } from './QuizModeBar';
import { type QuizSplitSettings } from '../utils/quizSplit';
import { useTheme } from '../context/ThemeContext';

export interface QuizSplitPart {
  partIndex: number;
  name: string;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  startNumber: number;
  endNumber: number;
}

export interface SharedQuizHeaderProps {
  // Title & Subject info
  setTitle?: string;
  questionsCount: number;

  // Progress & Split mode state
  splitSettings: QuizSplitSettings;
  currentPart: QuizSplitPart | null;
  currentPartIndex: number;
  parts: QuizSplitPart[];
  partProgressPercent: number;
  progressPercent: number;
  partMasteredCount: number;
  masteredCount: number;
  relativeIndex: number;
  currentIndex: number;
  masteredIds?: number[];
  questions?: Array<{ id: number; text: string }>;

  // Handlers
  onSwitchPart: (index: number) => void;
  onOpenSplitModal: () => void;
  onOpenQuestionGrid: () => void;
  onResetProgress: () => void;
  onOpenThemeModal: () => void;
  onBack: () => void;
  onBackLabel?: string;
  isKnowledgeGroupMode?: boolean;

  // Previous & Next handlers for non-split center navigator
  onPrev?: () => void;
  onNext?: () => void;

  // Row 2 Mode Bar Props
  activeMode: QuizPlayMode;
  onChangeMode: (mode: QuizPlayMode) => void;
  mistakeCount: number;
  onOpenKnowledgeGroups?: () => void;
  knowledgeGroupsLabel?: string;
}

export default function SharedQuizHeader({
  setTitle,
  questionsCount,
  splitSettings,
  currentPart,
  currentPartIndex,
  parts,
  partProgressPercent,
  progressPercent,
  partMasteredCount,
  masteredCount,
  relativeIndex,
  currentIndex,
  masteredIds,
  questions,
  onSwitchPart,
  onOpenSplitModal,
  onOpenQuestionGrid,
  onResetProgress,
  onOpenThemeModal,
  onBack,
  onBackLabel = '← Đổi đề',
  isKnowledgeGroupMode = false,
  onPrev,
  onNext,
  activeMode,
  onChangeMode,
  mistakeCount,
  onOpenKnowledgeGroups,
  knowledgeGroupsLabel,
}: SharedQuizHeaderProps) {
  const { mouseEffectsEnabled, toggleMouseEffects } = useTheme();
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const headerContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileToolsOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (headerContainerRef.current && !headerContainerRef.current.contains(e.target as Node)) {
        setMobileToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [mobileToolsOpen]);

  const displayTitle = setTitle ? setTitle.toUpperCase() : 'MULTIPLE CHOICE';
  const effectiveProgressPercent = splitSettings.enabled ? partProgressPercent : progressPercent;

  return (
    <header ref={headerContainerRef} className="shared-quiz-header-container">
      {/* ==================================================================
          ROW 1 — PRIMARY QUIZ HEADER
          Left: Subject Code & Circular Progress
          Center: Section / Part Navigator
          Right: Utility Actions (WoodFish, Split, Grid, Reset, Theme, Back)
          ================================================================== */}
      <div className="quiz-v2-header">
        {/* LEFT ZONE: SUBJECT CODE & PROGRESS */}
        <div className="quiz-v2-header-left">
          <button
            type="button"
            className="quiz-mobile-back-btn"
            onClick={onBack}
            title={onBackLabel}
            aria-label={onBackLabel}
          >
            ←
          </button>
          <span className="quiz-v2-title">{displayTitle}</span>

          {/* Circular Progress Ring with Percentage & Counters */}
          <div className="quiz-progress-ring-wrapper">
            <svg className="quiz-progress-ring" viewBox="0 0 36 36" aria-hidden="true">
              <defs>
                <linearGradient id="headerProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <circle className="quiz-progress-ring-bg" cx="18" cy="18" r="15.5" />
              <circle
                className="quiz-progress-ring-fill"
                cx="18"
                cy="18"
                r="15.5"
                strokeDasharray={`${2 * Math.PI * 15.5}`}
                strokeDashoffset={`${2 * Math.PI * 15.5 * (1 - effectiveProgressPercent / 100)}`}
              />
            </svg>
            <span className="quiz-progress-ring-text">
              {effectiveProgressPercent}%
            </span>

            {splitSettings.enabled && currentPart ? (
              <span className="quiz-progress-ring-label">
                <strong>{partMasteredCount}/{currentPart.totalCount}</strong> {currentPart.name}
                <span className="quiz-v2-mastered-total-tag" style={{ marginLeft: 6 }}>
                  Σ {masteredCount}/{questionsCount}
                </span>
              </span>
            ) : (
              <span className="quiz-progress-ring-label">
                <strong>{masteredCount}/{questionsCount}</strong> đã học
              </span>
            )}
          </div>
        </div>

        {/* CENTER ZONE: SECTION / PART NAVIGATION */}
        <div className="quiz-v2-header-center">
          {splitSettings.enabled && currentPart && parts.length > 0 ? (
            <div className="quiz-v2-part-selector">
              <button
                type="button"
                className="quiz-v2-part-nav-btn"
                disabled={currentPartIndex === 0}
                onClick={() => onSwitchPart(currentPartIndex - 1)}
                title="Về phần trước"
                aria-label="Về phần trước"
              >
                ◀
              </button>

              <div className="quiz-v2-part-select-wrapper">
                <select
                  className="quiz-v2-part-select"
                  value={currentPartIndex}
                  onChange={(e) => onSwitchPart(parseInt(e.target.value, 10))}
                  aria-label="Chọn phần đề thi"
                >
                  {parts.map((p) => {
                    const pQuestions = questions ? questions.slice(p.startIndex, p.endIndex + 1) : [];
                    const pMastered = masteredIds
                      ? pQuestions.filter((q) => masteredIds.includes(q.id)).length
                      : (p.partIndex === currentPartIndex ? partMasteredCount : 0);
                    return (
                      <option key={p.partIndex} value={p.partIndex}>
                        {p.name} (Câu {p.startNumber} - {p.endNumber}) · {pMastered}/{p.totalCount} đã học
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="button"
                className="quiz-v2-part-nav-btn"
                disabled={currentPartIndex === parts.length - 1}
                onClick={() => onSwitchPart(currentPartIndex + 1)}
                title="Sang phần tiếp theo"
                aria-label="Sang phần tiếp theo"
              >
                ▶
              </button>
            </div>
          ) : (
            <div className="quiz-v2-part-selector">
              <button
                type="button"
                className="quiz-v2-part-nav-btn"
                disabled={currentIndex === 0}
                onClick={onPrev}
                title="Câu trước"
                aria-label="Câu trước"
              >
                ◀
              </button>

              <button
                type="button"
                className="quiz-v2-part-select-btn"
                onClick={onOpenQuestionGrid}
                title="Bấm để xem danh sách câu hỏi"
              >
                <span>Toàn bộ đề thi (Câu {currentIndex + 1} / {questionsCount}) · {masteredCount} đã học</span>
                <span style={{ marginLeft: 6, fontSize: 10 }}>▾</span>
              </button>

              <button
                type="button"
                className="quiz-v2-part-nav-btn"
                disabled={currentIndex >= questionsCount - 1}
                onClick={onNext}
                title="Câu tiếp"
                aria-label="Câu tiếp"
              >
                ▶
              </button>
            </div>
          )}
        </div>

        {/* RIGHT ZONE: UTILITY ACTIONS (PRESERVED ORDER) */}
        <div className="quiz-v2-header-right">
          {/* Action 1: Wooden Fish (Gõ Mõ Cầu May) */}
          <button
            type="button"
            className="quiz-v2-header-icon-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('open-woodfish-modal'))}
            title="Gõ Mõ Cầu May & Tịnh Tâm (Phím tắt: W)"
            aria-label="Gõ Mõ Cầu May"
          >
            🪷
          </button>

          {/* Action 2: Split Mode Config */}
          <button
            type="button"
            className={`quiz-v2-header-icon-btn ${splitSettings.enabled ? 'is-split-active' : ''}`}
            onClick={onOpenSplitModal}
            title={
              splitSettings.enabled
                ? `Chia nhỏ: ${splitSettings.chunkSize} câu/quiz`
                : 'Chia nhỏ đề thi'
            }
            aria-label="Chia nhỏ đề thi"
          >
            ✂️
          </button>

          {/* Action 3: Question Grid with dynamic count badge */}
          <button
            type="button"
            className="quiz-v2-header-icon-btn"
            onClick={onOpenQuestionGrid}
            title={`Danh sách câu hỏi (${splitSettings.enabled && currentPart ? `${relativeIndex + 1}/${currentPart.totalCount}` : `${currentIndex + 1}/${questionsCount}`}) · Phím tắt: G`}
            aria-label="Danh sách câu hỏi"
          >
            📋
            <span className="header-btn-count">
              {splitSettings.enabled && currentPart ? `${relativeIndex + 1}` : `${currentIndex + 1}`}
            </span>
          </button>

          {/* Action 4: Reset Progress */}
          {isKnowledgeGroupMode ? (
            <button
              type="button"
              className="quiz-v2-header-btn quiz-v2-reset-group-btn"
              onClick={onResetProgress}
              title={`Làm lại từ đầu ${setTitle || 'nhóm đang học'}`}
            >
              🔄 Làm lại nhóm
            </button>
          ) : (
            <button
              type="button"
              className="quiz-v2-header-icon-btn"
              onClick={onResetProgress}
              title="Học lại từ đầu"
              aria-label="Học lại từ đầu"
            >
              🔄
            </button>
          )}

          {/* Action 4.5: Mouse Sparkle Effect Toggle */}
          <button
            type="button"
            className={`quiz-v2-header-icon-btn quiz-v2-mouse-fx-btn ${mouseEffectsEnabled ? 'is-fx-on' : 'is-fx-off'}`}
            onClick={toggleMouseEffects}
            title={
              mouseEffectsEnabled
                ? 'Đang BẬT hiệu ứng di chuột lấp lánh (Bấm để tắt chống rối mắt)'
                : 'Đang TẮT hiệu ứng di chuột lấp lánh (Bấm để bật lại)'
            }
            aria-label="Bật tắt hiệu ứng di chuột lấp lánh"
          >
            {mouseEffectsEnabled ? '✨' : '🛡️'}
          </button>

          {/* Action 5: Theme Selector */}
          <button
            type="button"
            className="quiz-v2-header-btn quiz-v2-theme-btn"
            onClick={onOpenThemeModal}
            title="Đổi giao diện học tập & Cài đặt hiệu ứng"
          >
            🎨 Giao diện
          </button>

          {/* Action 6: Change Exam / Back */}
          <button
            type="button"
            className="quiz-v2-header-btn quiz-v2-back-btn"
            onClick={onBack}
            title={onBackLabel}
          >
            {onBackLabel}
          </button>
        </div>

        {/* MOBILE COMPACT ACTION CLUSTER (Shown <= 640px) */}
        <div className="quiz-mobile-quick-actions">
          <button
            type="button"
            className="quiz-mobile-icon-btn"
            onClick={() => {
              setMobileToolsOpen(false);
              onOpenQuestionGrid();
            }}
            title="Bảng câu hỏi"
            aria-label="Mở bảng câu hỏi"
          >
            <span>📋</span>
            <span className="quiz-mobile-count-pill">
              {splitSettings.enabled && currentPart ? `${relativeIndex + 1}` : `${currentIndex + 1}`}
            </span>
          </button>

          <button
            type="button"
            className="quiz-mobile-icon-btn"
            onClick={() => {
              setMobileToolsOpen(false);
              onOpenThemeModal();
            }}
            title="Đổi giao diện"
            aria-label="Đổi giao diện học tập"
          >
            <span>🎨</span>
          </button>

          <button
            type="button"
            className={`quiz-mobile-icon-btn quiz-mobile-more-btn ${mobileToolsOpen ? 'is-open' : ''}`}
            onClick={() => setMobileToolsOpen((prev) => !prev)}
            title="Tiện ích học tập"
            aria-label="Mở tiện ích học tập"
            aria-expanded={mobileToolsOpen}
          >
            <span>{mobileToolsOpen ? '✕' : '⚙️'}</span>
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDABLE UTILITY DRAWER (<= 640px) */}
      {mobileToolsOpen && (
        <div className="quiz-mobile-tools-drawer" role="region" aria-label="Tiện ích bài thi">
          <button
            type="button"
            className="quiz-mobile-tool-chip"
            onClick={() => {
              setMobileToolsOpen(false);
              window.dispatchEvent(new CustomEvent('open-woodfish-modal'));
            }}
          >
            <span>🪷</span>
            <span>Gõ Mõ Tu Tâm</span>
          </button>

          <button
            type="button"
            className={`quiz-mobile-tool-chip ${splitSettings.enabled ? 'is-highlighted' : ''}`}
            onClick={() => {
              setMobileToolsOpen(false);
              onOpenSplitModal();
            }}
          >
            <span>✂️</span>
            <span>Chia đề ({splitSettings.enabled ? `${splitSettings.chunkSize} câu` : 'Tắt'})</span>
          </button>

          <button
            type="button"
            className="quiz-mobile-tool-chip"
            onClick={() => {
              setMobileToolsOpen(false);
              onResetProgress();
            }}
          >
            <span>🔄</span>
            <span>{isKnowledgeGroupMode ? 'Làm lại nhóm' : 'Làm lại đề'}</span>
          </button>

          <button
            type="button"
            className={`quiz-mobile-tool-chip ${mouseEffectsEnabled ? 'is-highlighted' : ''}`}
            onClick={() => {
              toggleMouseEffects();
              setMobileToolsOpen(false);
            }}
          >
            <span>{mouseEffectsEnabled ? '✨' : '🛡️'}</span>
            <span>{mouseEffectsEnabled ? 'Hiệu ứng chuột: Bật' : 'Hiệu ứng chuột: Tắt'}</span>
          </button>

          <button
            type="button"
            className="quiz-mobile-tool-chip"
            onClick={() => {
              setMobileToolsOpen(false);
              onOpenThemeModal();
            }}
          >
            <span>🎨</span>
            <span>Chọn giao diện</span>
          </button>

          <button
            type="button"
            className="quiz-mobile-tool-chip"
            onClick={() => {
              setMobileToolsOpen(false);
              onBack();
            }}
          >
            <span>🚪</span>
            <span>{onBackLabel.replace(/^←\s*/, '')}</span>
          </button>
        </div>
      )}

      {/* Thin Progress Track under Row 1 */}
      <div className="quiz-v2-progress-track">
        <div
          className="quiz-v2-progress-fill"
          style={{ width: `${effectiveProgressPercent}%` }}
        />
      </div>

      {/* ==================================================================
          ROW 2 — QUIZ MODE NAVIGATION BAR (CANONICAL ORDER)
          1. Trắc nghiệm
          2. Danh sách câu
          3. Học theo nhóm
          4. Từ hay sai (with badge)
          5. Thi thử FE (with FE badge)
          [Divider]
          6. Đấu trí 60s (HOT)
          7. Leo tháp 50 (SURVIVAL)
          8. Đúng/Sai 5s (BLITZ)
          Far Right: Speaker/Sound toggle
          ================================================================== */}
      <QuizModeBar
        activeMode={activeMode}
        onChangeMode={onChangeMode}
        mistakeCount={mistakeCount}
        onOpenQuestionGrid={onOpenQuestionGrid}
        onOpenKnowledgeGroups={onOpenKnowledgeGroups}
        knowledgeGroupsLabel={knowledgeGroupsLabel}
      />
    </header>
  );
}
