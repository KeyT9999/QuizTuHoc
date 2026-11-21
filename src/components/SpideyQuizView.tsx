import { useState, useEffect, useRef } from 'react';
import type { Question } from '../utils/quizParser';
import { isAnswerTextSelection } from '../utils/quizTextSelection';
import type { QuizPlayMode } from './QuizModeBar';
import AskAI from './AskAI';
import QuestionImages from './QuestionImages';
import SpideyChibiMascot, { type SpideyMood } from './SpideyChibiMascot';
import { useTheme } from '../context/ThemeContext';
import { playWebThwipSound } from '../utils/soundEffects';
import {
  getUserXP,
  calculateLevel,
  getStudyStreak,
  getFocusMode,
  setFocusMode,
} from '../utils/studyStats';
import './SpideyNightTheme.css';

interface QuizSplitPart {
  partIndex: number;
  name: string;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  startNumber: number;
  endNumber: number;
}

interface SpideyQuizViewProps {
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

export default function SpideyQuizView({
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
}: SpideyQuizViewProps) {
  const { mouseEffectsEnabled } = useTheme();
  const [isFocus, setIsFocus] = useState(() => getFocusMode());
  const [xp, setXp] = useState(() => getUserXP());
  const [streak, setStreak] = useState(() => getStudyStreak());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Spidey feedback FX states (THWIP! on correct, Spider-Sense on wrong)
  const [sessionCombo, setSessionCombo] = useState(0);
  const [fxBanner, setFxBanner] = useState<{ type: 'correct' | 'wrong'; label: string; key: number } | null>(null);
  const lastEvaluatedQRef = useRef<string>('');
  const fxTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleSync = () => {
      setXp(getUserXP());
      setStreak(getStudyStreak());
    };
    window.addEventListener('keyt-xp-changed', handleSync);
    window.addEventListener('keyt-xp-earned', handleSync);
    window.addEventListener('keyt-streak-changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('keyt-xp-changed', handleSync);
      window.removeEventListener('keyt-xp-earned', handleSync);
      window.removeEventListener('keyt-streak-changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Trigger THWIP! or Spider-Sense animation when user answers a question
  useEffect(() => {
    if (!isAnswered || isUnresolved) return;
    const token = `${question.id}:${selectedAnswer ?? ''}`;
    if (lastEvaluatedQRef.current === token) return;
    lastEvaluatedQRef.current = token;

    const isRight = selectedAnswer === question.correctAnswer;
    if (isRight) {
      playWebThwipSound(false);
      setSessionCombo((prev) => {
        const next = prev + 1;
        setFxBanner({
          type: 'correct',
          label: next >= 2 ? `COMBO x${next}!` : 'THWIP!',
          key: Date.now(),
        });
        return next;
      });
    } else {
      setSessionCombo(0);
      setFxBanner({
        type: 'wrong',
        label: 'SPIDER-SENSE!',
        key: Date.now(),
      });
    }

    if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
    fxTimerRef.current = window.setTimeout(() => {
      setFxBanner(null);
    }, 1150);
  }, [isAnswered, isUnresolved, question.id, question.correctAnswer, selectedAnswer]);

  useEffect(() => {
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
    };
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
  const isQSubmitted = (q: Question) =>
    !q.freeResponse && q.correctAnswer !== '?' && q.correctAnswer.length > 1
      ? submittedIds.includes(q.id)
      : answers[q.id] !== undefined;
  const statAnswered = activeQuestions.filter(isQSubmitted).length;
  const statCorrect = activeQuestions.filter((q) => isQSubmitted(q) && answers[q.id] === q.correctAnswer).length;
  const statWrong = activeQuestions.filter((q) => isQSubmitted(q) && answers[q.id] && answers[q.id] !== q.correctAnswer).length;
  const statUnanswered = Math.max(0, statTotal - statAnswered);

  const masteredPercent = statTotal > 0 ? Math.round((statMastered / statTotal) * 100) : 0;
  const accuracyPercent = statAnswered > 0 ? Math.round((statCorrect / statAnswered) * 100) : 100;
  const progressPercent = totalCount > 0 ? Math.min(100, Math.round(((relativeIndex + 1) / totalCount) * 100)) : 0;

  const levelData = calculateLevel(xp);
  const xpBarPercent = Math.min(100, Math.round((levelData.currentLevelXp / levelData.nextLevelXp) * 100));

  const chibiMood: SpideyMood = !isAnswered || isUnresolved
    ? sessionCombo >= 3
      ? 'streak'
      : 'idle'
    : selectedAnswer === question.correctAnswer
      ? sessionCombo >= 2
        ? 'streak'
        : 'correct'
      : 'wrong';

  return (
    <div className="spidey-night-theme">
      <main className={`spidey-body-layout ${isFocus ? 'is-focus-mode' : ''}`}>
        {/* ----------------- LEFT SIDEBAR ----------------- */}
        <aside className={`spidey-sidebar-left ${mobileDrawerOpen ? 'is-mobile-drawer-open' : 'is-mobile-drawer-closed'}`}>
          {/* Card 1: Tiến độ học Web Donut */}
          <div className="spidey-widget-card">
            <div className="spidey-widget-title-row">
              <h4 className="spidey-widget-title">
                <span>🕸️</span> Tiến Độ Tuần Tra
              </h4>
              {sessionCombo >= 2 && (
                <span className="spidey-combo-chip">⚡ x{sessionCombo}</span>
              )}
            </div>

            <div className="spidey-donut-box">
              <div className="spidey-donut-wrapper">
                <svg className="spidey-donut-svg" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="spideyDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e11d48" />
                      <stop offset="55%" stopColor="#fb7185" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
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
                    stroke="url(#spideyDonutGrad)"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - masteredPercent / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div className="spidey-donut-center-text">{masteredPercent}%</div>
              </div>
            </div>

            <div className="spidey-legend-list">
              <div className="spidey-legend-item">
                <span className="spidey-legend-label">
                  <span className="spidey-legend-dot dot-crimson" />
                  Đã thuộc
                </span>
                <span className="spidey-legend-val">
                  {statMastered}/{statTotal}
                </span>
              </div>

              <div className="spidey-legend-item">
                <span className="spidey-legend-label">
                  <span className="spidey-legend-dot dot-green" />
                  Chuẩn xác
                </span>
                <span className="spidey-legend-val">{statCorrect}</span>
              </div>

              <div className="spidey-legend-item">
                <span className="spidey-legend-label">
                  <span className="spidey-legend-dot dot-amber" />
                  Cần ôn lại
                </span>
                <span className="spidey-legend-val">{statWrong}</span>
              </div>

              <div className="spidey-legend-item">
                <span className="spidey-legend-label">
                  <span className="spidey-legend-dot dot-slate" />
                  Chưa làm
                </span>
                <span className="spidey-legend-val">{statUnanswered}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Chuỗi học tập Streak */}
          <div
            className="spidey-widget-card spidey-streak-card"
            title="Duy trì học mỗi ngày để bảo vệ Spider Streak!"
          >
            <div className="spidey-widget-title-row">
              <h4 className="spidey-widget-title">Chuỗi Đêm New York</h4>
            </div>

            <div className="spidey-streak-row">
              <div className="spidey-flame-box">
                <span>🔥</span>
              </div>
              <div className="spidey-streak-info">
                <div className="spidey-streak-count">
                  <strong>{streak > 0 ? `${streak} ngày` : '0 ngày'}</strong> {streak > 0 ? 'liên tiếp' : ''}
                </div>
                <div className="spidey-streak-sub">
                  {streak > 0 ? 'Đang giữ nhịp cực đỉnh' : 'Làm câu hỏi để mở chuỗi'}
                </div>
              </div>
              <div className="spidey-streak-chevron">›</div>
            </div>
          </div>

          {/* Card 3: Độ chính xác */}
          <div className="spidey-widget-card">
            <div className="spidey-widget-title-row">
              <h4 className="spidey-widget-title">
                <span>🎯</span> Độ Chính Xác
              </h4>
              <span className="spidey-sub-ratio">
                {statCorrect}/{Math.max(1, statAnswered)} đúng
              </span>
            </div>

            <div className="spidey-accuracy-number">{accuracyPercent}%</div>
            <div className="spidey-accuracy-stats">
              {statAnswered} câu đã trả lời · {statCorrect} câu đúng
            </div>

            <div className="spidey-accuracy-track">
              <div className="spidey-accuracy-fill" style={{ width: `${accuracyPercent}%` }} />
            </div>
          </div>
        </aside>

        {/* ----------------- CENTER COLUMN: QUIZ CARD ----------------- */}
        <section className="spidey-center-col">
          {/* Silk-Web Progress Track with gliding Spidey Mask */}
          <div className="spidey-web-progress-wrap" aria-label={`Tiến độ ${progressPercent}%`}>
            <div className="spidey-web-progress-track">
              <div
                className="spidey-web-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="spidey-web-progress-mask"
                style={{ left: `${progressPercent}%` }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 28 28" width="22" height="22">
                  <ellipse cx="14" cy="14" rx="11" ry="12.5" fill="#e11d48" stroke="#060918" strokeWidth="2" />
                  <path d="M5 10 Q10 11 12.2 15.8 Q8.2 16.5 5.4 13.5 Z" fill="#ffffff" stroke="#060918" strokeWidth="1.5" />
                  <path d="M23 10 Q18 11 15.8 15.8 Q19.8 16.5 22.6 13.5 Z" fill="#ffffff" stroke="#060918" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            <span className="spidey-web-progress-pct">{progressPercent}%</span>
          </div>

          <div
            className={`spidey-quiz-card ${
              slideDirection === 'next'
                ? 'slide-in-right'
                : slideDirection === 'prev'
                ? 'slide-in-left'
                : ''
            } ${fxBanner?.type === 'wrong' ? 'is-spider-sense-alert' : ''} ${
              fxBanner?.type === 'correct' ? 'is-thwip-hit' : ''
            }`}
            key={question.id}
          >
            {/* Subtle corner SVG spider-web filigree */}
            <svg className="spidey-card-web-corner top-right" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <path d="M120 0 L40 0 M120 0 L52 38 M120 0 L76 76 M120 0 L102 104 M120 0 L120 120" stroke="currentColor" strokeWidth="1" />
              <path d="M92 0 Q94 22 104 34 Q112 42 120 44" stroke="currentColor" strokeWidth="0.9" />
              <path d="M66 0 Q72 34 86 52 Q100 66 120 72" stroke="currentColor" strokeWidth="0.85" />
              <path d="M40 0 Q52 46 72 72 Q92 92 120 102" stroke="currentColor" strokeWidth="0.8" />
            </svg>

            {/* Spider-Sense zíc-zắc flash when wrong */}
            {fxBanner?.type === 'wrong' && (
              <svg className="spidey-sense-arc" viewBox="0 0 260 44" fill="none" aria-hidden="true">
                <path d="M26 36 L44 22 L32 14 L52 4" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M124 34 L132 18 L122 12 L134 3" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M234 36 L216 22 L228 14 L208 4" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}

            {/* Silk web shot streak + Comic Onomatopoeia Pop Badge (THWIP! / COMBO / SPIDER-SENSE!) */}
            {fxBanner && (
              <>
                {fxBanner.type === 'correct' && (
                  <div className="spidey-web-shot-beam" aria-hidden="true" />
                )}
                <div
                  key={fxBanner.key}
                  className={`spidey-comic-pop-badge is-${fxBanner.type}`}
                  aria-hidden="true"
                >
                  {fxBanner.label}
                </div>
              </>
            )}

            {/* Header: Question Number, Part Chip, Mark Mastered */}
            <div className="spidey-q-header">
              <div className="spidey-q-left-meta">
                <div className="spidey-q-num-title">
                  Câu {relativeIndex + 1}{' '}
                  <span className="spidey-q-total-count">/ {totalCount}</span>
                </div>

                {splitEnabled && currentPart && (
                  <span className="spidey-q-part-chip">
                    {currentPart.name} · Gốc: #{currentIndex + 1}/{questions.length}
                  </span>
                )}
              </div>

              <div className="spidey-q-right-actions">
                <button
                  type="button"
                  className={`spidey-mastered-btn ${isMastered ? 'is-mastered' : ''}`}
                  onClick={() => onToggleMastered(question.id)}
                  title="Đánh dấu câu này đã thuộc (Phím tắt: M)"
                >
                  <span>{isMastered ? '✓' : '🕸️'}</span>
                  <span>{isMastered ? 'Đã thuộc' : 'Đánh dấu đã học'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <h2
              className="spidey-question-text"
              data-hover-translate={question.text}
              data-hover-translate-kind="question"
            >
              {question.text}
            </h2>
            <QuestionImages images={question.images} />

            {/* AI Assistant Banner */}
            <AskAI question={question} />

            {/* Options List */}
            {isFreeResponse ? (
              <div className="quiz-v2-free-response" style={{ marginBottom: 20 }}>
                <label htmlFor={`spidey-free-${question.id}`} style={{ color: '#cbd5e1' }}>
                  Nhập câu trả lời của bạn:
                </label>
                <textarea
                  id={`spidey-free-${question.id}`}
                  value={selectedAnswer ?? ''}
                  onChange={(e) => onSelectOption(e.target.value)}
                  placeholder="Nhập đáp án..."
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(244,63,94,0.3)',
                    color: '#fff',
                    borderRadius: 12,
                    padding: 12,
                  }}
                />
              </div>
            ) : (
              <div className="spidey-options-stack">
                {question.options.map((opt) => {
                  const isSelected = selectedAnswer?.includes(opt.key) ?? false;
                  const isCorrect = question.correctAnswer.includes(opt.key);

                  let cardClass = 'spidey-option-card';
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
                      className={`${cardClass} quiz-selectable-option`}
                      onClick={(event) => {
                        if (!isAnswerTextSelection(event)) onSelectOption(opt.key);
                      }}
                      aria-label={`${opt.key}. ${opt.text}`}
                    >
                      <span className="spidey-option-key-badge">{opt.key}</span>
                      <span className="spidey-option-text" data-hover-translate={opt.text}>
                        {opt.text}
                      </span>

                      {(isAnswered || isRevealed) && !isUnresolved && isCorrect && (
                        <span className="spidey-option-status-icon correct">✓</span>
                      )}
                      {(isAnswered || isRevealed) && isSelected && !isUnresolved && !isCorrect && (
                        <span className="spidey-option-status-icon incorrect">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Feedback Alert */}
            {(isAnswered || isRevealed) && (
              <div
                className={`spidey-feedback-box ${
                  isAnswered
                    ? selectedAnswer === question.correctAnswer
                      ? 'correct'
                      : 'incorrect'
                    : 'revealed'
                }`}
              >
                {isUnresolved ? (
                  <span>⚠ Chưa có đáp án chắc chắn từ tài liệu nguồn cho câu này.</span>
                ) : isAnswered ? (
                  selectedAnswer === question.correctAnswer ? (
                    <span>🕸️ THWIP! Chính xác tuyệt đối (+35 XP).</span>
                  ) : (
                    <span>
                      ⚡ Spider-Sense cảnh báo! Đáp án chuẩn là: <strong>{question.correctAnswer}</strong>
                    </span>
                  )
                ) : (
                  <span>💡 Đáp án đúng của câu này là: <strong>{question.correctAnswer}</strong></span>
                )}
              </div>
            )}

            {/* Actions Bar: Prev, Reveal, Check Multi, Next */}
            <div className="spidey-actions-bar">
              <button
                type="button"
                className="spidey-prev-btn"
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
                className="spidey-reveal-btn"
                onClick={onToggleReveal}
                disabled={isAnswered}
                title="Xem đáp án (Phím tắt: Space)"
              >
                <span>{isAnswered ? '✓' : isRevealed ? '🙈' : '👁️'}</span>
                <span>{isAnswered ? 'Đã có đáp án' : isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
                {!isAnswered && <kbd className="spidey-reveal-kbd">Space</kbd>}
              </button>

              {isMultipleChoice && !isAnswered && (
                <button
                  type="button"
                  className="spidey-next-btn is-check-multi"
                  onClick={onCheckMultiple}
                  disabled={!selectedAnswer}
                >
                  Kiểm tra đáp án{selectedAnswer ? ` (${selectedAnswer.split('').join(', ')})` : ''}
                </button>
              )}

              <button
                type="button"
                className="spidey-next-btn"
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
            <footer className="spidey-keyboard-hints">
              <span>🕷️ Phím tắt:</span>
              <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> chọn đáp án ·
              <kbd>Space</kbd> xem đáp án ·
              <kbd>←</kbd> <kbd>→</kbd> chuyển câu ·
              <kbd>M</kbd> đánh dấu ·
              <kbd>G</kbd> danh sách
            </footer>
          </div>
        </section>

        {/* MOBILE DRAWER TOGGLE BAR */}
        <div className="spidey-mobile-drawer-bar">
          <button
            type="button"
            className="spidey-mobile-drawer-btn"
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            aria-expanded={mobileDrawerOpen}
          >
            <span>🕷️ Tiến Độ & Chibi Spidey ({masteredPercent}% · 🔥 {streak})</span>
            <span className="drawer-chevron">{mobileDrawerOpen ? '▲ Thu gọn' : '▼ Mở'}</span>
          </button>
        </div>

        {/* ----------------- RIGHT SIDEBAR ----------------- */}
        <aside className={`spidey-sidebar-right ${mobileDrawerOpen ? 'is-mobile-drawer-open' : 'is-mobile-drawer-closed'}`}>
          {/* Card 1: Chibi Spidey Đu Tơ Companion */}
          <div className="spidey-widget-card spidey-mascot-card">
            <div className="spidey-widget-title-row">
              <h4 className="spidey-widget-title">
                <span>🕷️</span> Spidey Đồng Hành
              </h4>
              <span className="spidey-level-tag">Lv.{levelData.level}</span>
            </div>

            <SpideyChibiMascot
              variant="sidebar"
              mood={chibiMood}
              combo={sessionCombo}
              mouseEffectsEnabled={mouseEffectsEnabled}
            />
          </div>

          {/* Card 2: Web XP */}
          <div className="spidey-widget-card">
            <div className="spidey-widget-title-row">
              <h4 className="spidey-widget-title">
                <span>⚡</span> Spider XP
              </h4>
              <span className="spidey-sub-ratio">{xp} XP</span>
            </div>

            <div className="spidey-xp-track" title={`${levelData.currentLevelXp}/${levelData.nextLevelXp} XP`}>
              <div className="spidey-xp-fill" style={{ width: `${xpBarPercent}%` }} />
            </div>

            <div className="spidey-xp-level-row">
              <span>Còn {levelData.remainingXp} XP để lên cấp</span>
              <span className="spidey-level-tag">Lv.{levelData.level}</span>
            </div>
          </div>

          {/* Card 3: Focus Mode Toggle */}
          <div className="spidey-widget-card">
            <div className="spidey-focus-row">
              <div>
                <h4 className="spidey-widget-title">
                  <span>🎯</span> Focus Mode
                </h4>
                <div className="spidey-focus-desc">Tắt hiệu ứng hai bên, tập trung 100%</div>
              </div>

              <div
                className={`spidey-toggle-switch ${isFocus ? 'is-on' : ''}`}
                onClick={handleToggleFocus}
                role="switch"
                aria-checked={isFocus}
                title={isFocus ? 'Tắt Focus Mode' : 'Bật Focus Mode'}
              >
                <div className="spidey-toggle-knob" />
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Floating Exit Focus Button if Focus Mode is ON */}
      {isFocus && (
        <button
          type="button"
          className="spidey-exit-focus-pill"
          onClick={handleToggleFocus}
          title="Bấm để hiển thị lại Chibi Spidey và bảng thống kê"
        >
          <span>🕷️ Thoát Focus Mode</span>
        </button>
      )}
    </div>
  );
}
