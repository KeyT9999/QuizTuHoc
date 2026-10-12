import { useState, useEffect } from 'react';
import type { Question } from '../utils/quizParser';
import type { QuizPlayMode } from './QuizModeBar';
import AskAI from './AskAI';
import mascotCatImg from '../assets/mascot_cat.png';
import {
  getUserXP,
  calculateLevel,
  getStudyStreak,
  getFocusMode,
  setFocusMode,
} from '../utils/studyStats';
import './CozyNightTheme.css';

interface QuizSplitPart {
  partIndex: number;
  name: string;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  startNumber: number;
  endNumber: number;
}

interface CozyNightQuizViewProps {
  question: Question;
  questions: Question[];
  currentIndex: number;
  relativeIndex: number;
  totalCount: number;
  currentPart: QuizSplitPart | null;
  parts: QuizSplitPart[];
  currentPartIndex: number;
  splitEnabled: boolean;
  onSwitchPart: (index: number) => void;
  selectedAnswer?: string;
  isAnswered: boolean;
  isMastered: boolean;
  isRevealed: boolean;
  isUnresolved: boolean;
  isMultipleChoice: boolean;
  isFreeResponse: boolean;
  masteredIds: number[];
  answers: Record<number, string>;
  submittedIds: number[];
  onSelectOption: (key: string) => void;
  onCheckMultiple: () => void;
  onToggleReveal: () => void;
  onToggleMastered: (id: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
  onBackLabel?: string;
  setTitle?: string;
  setId?: string;
  activeMode: QuizPlayMode;
  onChangeMode: (mode: QuizPlayMode) => void;
  onOpenQuestionGrid: () => void;
  onOpenThemeModal: () => void;
  slideDirection: 'next' | 'prev' | null;
}

export default function CozyNightQuizView({
  question,
  questions,
  currentIndex,
  relativeIndex,
  totalCount,
  currentPart,
  parts,
  currentPartIndex,
  splitEnabled,
  onSwitchPart: _onSwitchPart,
  selectedAnswer,
  isAnswered,
  isMastered,
  isRevealed,
  isUnresolved,
  isMultipleChoice,
  isFreeResponse,
  masteredIds,
  answers,
  submittedIds,
  onSelectOption,
  onCheckMultiple,
  onToggleReveal,
  onToggleMastered,
  onPrev,
  onNext,
  onBack: _onBack,
  onBackLabel: _onBackLabel = '← Quay lại',
  setTitle: _setTitle,
  setId: _setId,
  activeMode: _activeMode,
  onChangeMode: _onChangeMode,
  onOpenQuestionGrid: _onOpenQuestionGrid,
  onOpenThemeModal: _onOpenThemeModal,
  slideDirection,
}: CozyNightQuizViewProps) {
  // Focus Mode state
  const [isFocus, setIsFocus] = useState(() => getFocusMode());
  // Live XP state
  const [xp, setXp] = useState(() => getUserXP());
  // Streak state
  const [streak] = useState(() => getStudyStreak());

  useEffect(() => {
    const handleXpChanged = (e: Event) => {
      const custom = e as CustomEvent<number>;
      if (custom.detail !== undefined) setXp(custom.detail);
    };
    window.addEventListener('keyt-xp-changed', handleXpChanged);
    return () => window.removeEventListener('keyt-xp-changed', handleXpChanged);
  }, []);

  const handleToggleFocus = () => {
    const next = !isFocus;
    setIsFocus(next);
    setFocusMode(next);
  };

  // Compute stats for current active context (part or whole set)
  const activeQuestions = splitEnabled && currentPart
    ? questions.slice(currentPart.startIndex, currentPart.endIndex + 1)
    : questions;

  const statTotal = activeQuestions.length;
  const statMastered = activeQuestions.filter((q) => masteredIds.includes(q.id)).length;
  const statAnswered = activeQuestions.filter((q) =>
    q.correctAnswer.length > 1 ? submittedIds.includes(q.id) : answers[q.id] !== undefined
  ).length;
  const statCorrect = activeQuestions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const statWrong = activeQuestions.filter((q) => answers[q.id] && answers[q.id] !== q.correctAnswer).length;
  const statUnanswered = Math.max(0, statTotal - statAnswered);

  const masteredPercent = statTotal > 0 ? Math.round((statMastered / statTotal) * 100) : 0;
  const accuracyPercent = statAnswered > 0 ? Math.round((statCorrect / statAnswered) * 100) : 100;

  // Level calculations
  const levelData = calculateLevel(xp);
  const xpBarPercent = Math.min(100, Math.round((levelData.currentLevelXp / levelData.nextLevelXp) * 100));


  return (
    <div className="cozy-night-theme">
      {/* 3-COLUMN MAIN BODY LAYOUT */}

      {/* ==================================================================
          3-COLUMN MAIN BODY LAYOUT
          ================================================================== */}
      <main className={`cozy-body-layout ${isFocus ? 'is-focus-mode' : ''}`}>
        {/* ----------------- LEFT SIDEBAR ----------------- */}
        <aside className="cozy-sidebar-left">
          {/* Card 1: Tiến độ học Donut Chart */}
          <div className="cozy-widget-card">
            <div className="cozy-widget-title-row">
              <h4 className="cozy-widget-title">
                <span>📊</span> Tiến độ học
              </h4>
            </div>

            <div className="cozy-donut-box">
              <div className="cozy-donut-wrapper">
                <svg className="cozy-donut-svg" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - masteredPercent / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div className="cozy-donut-center-text">{masteredPercent}%</div>
              </div>
            </div>

            <div className="cozy-legend-list">
              <div className="cozy-legend-item">
                <span className="cozy-legend-label">
                  <span className="cozy-legend-dot dot-purple" />
                  Đã học
                </span>
                <span className="cozy-legend-val">
                  {statMastered}/{statTotal}
                </span>
              </div>

              <div className="cozy-legend-item">
                <span className="cozy-legend-label">
                  <span className="cozy-legend-dot dot-green" />
                  Đúng
                </span>
                <span className="cozy-legend-val">{statCorrect}</span>
              </div>

              <div className="cozy-legend-item">
                <span className="cozy-legend-label">
                  <span className="cozy-legend-dot dot-red" />
                  Sai
                </span>
                <span className="cozy-legend-val">{statWrong}</span>
              </div>

              <div className="cozy-legend-item">
                <span className="cozy-legend-label">
                  <span className="cozy-legend-dot dot-gray" />
                  Chưa làm
                </span>
                <span className="cozy-legend-val">{statUnanswered}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Chuỗi học tập Streak */}
          <div
            className="cozy-widget-card cozy-streak-card"
            title="Duy trì học mỗi ngày để bảo vệ streak!"
          >
            <div className="cozy-widget-title-row">
              <h4 className="cozy-widget-title">Chuỗi học tập</h4>
            </div>

            <div className="cozy-streak-row">
              <div className="cozy-flame-box">
                <span>🔥</span>
              </div>
              <div className="cozy-streak-info">
                <div className="cozy-streak-count">
                  <strong>{streak} ngày</strong> liên tiếp
                </div>
                <div className="cozy-streak-sub">Đang cày chăm chỉ</div>
              </div>
              <div className="cozy-streak-chevron">›</div>
            </div>
          </div>
        </aside>

        {/* ----------------- CENTER COLUMN: QUIZ CARD ----------------- */}
        <section className="cozy-center-col">
          <div
            className={`cozy-quiz-card ${
              slideDirection === 'next'
                ? 'slide-in-right'
                : slideDirection === 'prev'
                ? 'slide-in-left'
                : ''
            }`}
            key={question.id}
          >
            {/* Header: Question Number, Origin Tag, Mark Mastered */}
            <div className="cozy-q-header">
              <div className="cozy-q-left-meta">
                <div className="cozy-q-num-title">
                  Câu {relativeIndex + 1}{' '}
                  <span className="cozy-q-total-count">/ {totalCount}</span>
                </div>

                {splitEnabled && currentPart && (
                  <span className="cozy-q-part-chip">
                    {currentPart.name} · Gốc: #{currentIndex + 1}/{questions.length}
                  </span>
                )}
              </div>

              <div className="cozy-q-right-actions">
                <button
                  type="button"
                  className={`cozy-mastered-btn ${isMastered ? 'is-mastered' : ''}`}
                  onClick={() => onToggleMastered(question.id)}
                  title="Đánh dấu câu này đã thuộc (Phím tắt: M)"
                >
                  <span>{isMastered ? '✓' : '📖'}</span>
                  <span>{isMastered ? 'Đã thuộc' : 'Đánh dấu đã học'}</span>
                </button>

                <button
                  type="button"
                  className="cozy-bookmark-btn"
                  onClick={() => onToggleMastered(question.id)}
                  title="Bookmark câu hỏi"
                  aria-label="Bookmark câu hỏi"
                >
                  🔖
                </button>
              </div>
            </div>

            {/* Question Text */}
            <h2 className="cozy-question-text">{question.text}</h2>

            {/* AI Assistant Banner */}
            <AskAI question={question} />

            {/* Options List */}
            {isFreeResponse ? (
              <div className="quiz-v2-free-response" style={{ marginBottom: 20 }}>
                <label htmlFor={`cozy-free-${question.id}`} style={{ color: '#94a3b8' }}>
                  Nhập câu trả lời của bạn:
                </label>
                <textarea
                  id={`cozy-free-${question.id}`}
                  value={selectedAnswer ?? ''}
                  onChange={(e) => onSelectOption(e.target.value)}
                  placeholder="Nhập đáp án..."
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    borderRadius: 12,
                    padding: 12,
                  }}
                />
              </div>
            ) : (
              <div className="cozy-options-stack">
                {question.options.map((opt) => {
                  const isSelected = selectedAnswer?.includes(opt.key) ?? false;
                  const isCorrect = question.correctAnswer.includes(opt.key);

                  let cardClass = 'cozy-option-card';
                  if (isSelected && !isAnswered) cardClass += ' is-selected';
                  if (isAnswered && !isUnresolved) {
                    if (isCorrect) cardClass += ' is-correct';
                    else if (isSelected) cardClass += ' is-incorrect';
                    else cardClass += ' is-dimmed';
                  } else if (isRevealed && !isUnresolved) {
                    if (isCorrect) cardClass += ' is-correct';
                    else if (isSelected) cardClass += ' is-incorrect';
                    else cardClass += ' is-dimmed';
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      className={cardClass}
                      onClick={() => onSelectOption(opt.key)}
                      aria-label={`${opt.key}. ${opt.text}`}
                    >
                      <span className="cozy-option-key-badge">{opt.key}</span>
                      <span className="cozy-option-text">{opt.text}</span>

                      {(isAnswered || isRevealed) && !isUnresolved && isCorrect && (
                        <span className="cozy-option-status-icon correct">✓</span>
                      )}
                      {(isAnswered || (isRevealed && isSelected)) && !isUnresolved && !isCorrect && (
                        <span className="cozy-option-status-icon incorrect">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Feedback Alert */}
            {(isAnswered || isRevealed) && (
              <div
                className={`cozy-feedback-box ${
                  isAnswered
                    ? selectedAnswer === question.correctAnswer
                      ? 'correct'
                      : 'incorrect'
                    : 'revealed'
                }`}
              >
                {isUnresolved ? (
                  <span>⚠ Chưa có đáp án nghiên cứu chắc chắn cho câu này.</span>
                ) : isAnswered ? (
                  selectedAnswer === question.correctAnswer ? (
                    <span>✓ Tuyệt vời! Bạn đã chọn chính xác (+35 XP).</span>
                  ) : (
                    <span>✗ Chưa đúng! Đáp án chính xác là: <strong>{question.correctAnswer}</strong></span>
                  )
                ) : (
                  <span>💡 Đáp án đúng của câu này là: <strong>{question.correctAnswer}</strong></span>
                )}
              </div>
            )}

            {/* Actions Bar: Prev, Reveal, Next */}
            <div className="cozy-actions-bar">
              <button
                type="button"
                className="cozy-prev-btn"
                onClick={onPrev}
                disabled={
                  splitEnabled && currentPart
                    ? currentIndex <= currentPart.startIndex
                    : currentIndex === 0
                }
                title="Phím tắt: ←"
              >
                ← Câu trước
              </button>

              <button
                type="button"
                className="cozy-reveal-btn"
                onClick={onToggleReveal}
                disabled={isAnswered}
                title="Xem đáp án (Phím tắt: Space)"
              >
                <span>{isAnswered ? '✓' : isRevealed ? '🙈' : '👁️'}</span>
                <span>{isAnswered ? 'Đã có đáp án' : isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
                {!isAnswered && <kbd className="cozy-reveal-kbd">Space</kbd>}
              </button>

              {isMultipleChoice && !isAnswered && (
                <button
                  type="button"
                  className="cozy-next-btn"
                  onClick={onCheckMultiple}
                  disabled={!selectedAnswer}
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                >
                  Kiểm tra đáp án
                </button>
              )}

              <button
                type="button"
                className="cozy-next-btn"
                onClick={onNext}
                title="Phím tắt: → hoặc Enter"
              >
                {splitEnabled && currentPart
                  ? currentIndex === currentPart.endIndex
                    ? currentPartIndex === parts.length - 1
                      ? 'Nộp bài & Kết quả'
                      : `Hoàn thành ${currentPart.name} →`
                    : 'Câu tiếp →'
                  : currentIndex === questions.length - 1
                  ? 'Nộp bài & Kết quả'
                  : 'Câu tiếp →'}
              </button>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <footer className="cozy-keyboard-hints">
              <span>💡 Phím tắt:</span>
              <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> chọn đáp án ·
              <kbd>Space</kbd> xem đáp án ·
              <kbd>←</kbd> <kbd>→</kbd> chuyển câu ·
              <kbd>M</kbd> đánh dấu ·
              <kbd>G</kbd> danh sách
            </footer>
          </div>
        </section>

        {/* ----------------- RIGHT SIDEBAR ----------------- */}
        <aside className="cozy-sidebar-right">
          {/* Card 1: XP hôm nay */}
          <div className="cozy-widget-card">
            <div className="cozy-widget-title-row">
              <h4 className="cozy-widget-title">
                <span>💎</span> XP hôm nay
              </h4>
            </div>

            <div className="cozy-xp-row">
              <div className="cozy-xp-number">
                <span className="cozy-xp-gem">💎</span>
                <span>{xp}</span>
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>XP</span>
              </div>
              <img
                src={mascotCatImg}
                alt="Scholar Cat Mascot"
                className="cozy-xp-mascot-img"
                title="Mascot Mèo chăm chỉ"
              />
            </div>

            <div className="cozy-xp-track" title={`${levelData.currentLevelXp}/${levelData.nextLevelXp} XP`}>
              <div className="cozy-xp-fill" style={{ width: `${xpBarPercent}%` }} />
            </div>

            <div className="cozy-xp-level-row">
              <span>Còn {levelData.remainingXp} XP để lên cấp</span>
              <span className="cozy-level-tag">Lv.{levelData.level}</span>
            </div>
          </div>

          {/* Card 2: Độ chính xác */}
          <div className="cozy-widget-card">
            <div className="cozy-widget-title-row">
              <h4 className="cozy-widget-title">
                <span>🎯</span> Độ chính xác
              </h4>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                {statCorrect}/{Math.max(1, statAnswered)} đúng
              </span>
            </div>

            <div className="cozy-accuracy-number">{accuracyPercent}%</div>
            <div className="cozy-accuracy-stats">
              {statAnswered} câu đã trả lời · {statCorrect} câu đúng
            </div>

            <div className="cozy-accuracy-track">
              <div className="cozy-accuracy-fill" style={{ width: `${accuracyPercent}%` }} />
            </div>
          </div>

          {/* Card 3: Focus Mode Toggle */}
          <div className="cozy-widget-card">
            <div className="cozy-focus-row">
              <div>
                <h4 className="cozy-widget-title">
                  <span>🍃</span> Focus Mode
                </h4>
                <div className="cozy-focus-desc">Không xao nhãng, chỉ có học tập</div>
              </div>

              <div
                className={`cozy-toggle-switch ${isFocus ? 'is-on' : ''}`}
                onClick={handleToggleFocus}
                role="switch"
                aria-checked={isFocus}
                title={isFocus ? 'Tắt Focus Mode' : 'Bật Focus Mode'}
              >
                <div className="cozy-toggle-knob" />
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Floating Exit Focus Button if Focus Mode is ON */}
      {isFocus && (
        <button
          type="button"
          className="cozy-exit-focus-pill"
          onClick={handleToggleFocus}
          title="Bấm để hiển thị lại các widget hai bên"
        >
          <span>🍃 Thoát Focus Mode</span>
        </button>
      )}
    </div>
  );
}
