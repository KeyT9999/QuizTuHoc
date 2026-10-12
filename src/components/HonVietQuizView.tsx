import { useState, useEffect, useMemo } from 'react';
import type { Question } from '../utils/quizParser';
import type { QuizPlayMode } from './QuizModeBar';
import AskAI from './AskAI';
import {
  getUserXP,
  getStudyStreak,
} from '../utils/studyStats';
import DongSonDrumSvg from './DongSonDrumSvg';
import { playWoodFishSound } from '../utils/soundEffects';
import './HonVietTheme.css';

interface QuizSplitPart {
  partIndex: number;
  name: string;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  startNumber: number;
  endNumber: number;
}

interface HonVietQuizViewProps {
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
  onJumpToQuestion?: (index: number) => void;
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
  mistakeCount?: number;
  onOpenKnowledgeGroups?: () => void;
}

const ACTIVE_STUDY_SECONDS_KEY = 'keyt_active_study_seconds';

function formatStudyTime(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, seconds)} giây`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} phút`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

export default function HonVietQuizView({
  question,
  questions,
  currentIndex,
  relativeIndex,
  totalCount,
  currentPart,
  parts,
  currentPartIndex,
  splitEnabled,
  onSwitchPart,
  onJumpToQuestion,
  selectedAnswer,
  isAnswered,
  isMastered,
  isRevealed,
  isUnresolved,
  isMultipleChoice,
  isFreeResponse,
  masteredIds,
  answers,
  submittedIds: _submittedIds,
  onSelectOption,
  onCheckMultiple,
  onToggleReveal,
  onToggleMastered,
  onPrev,
  onNext,
  onBack,
  onBackLabel: _onBackLabel = '← Quay lại',
  setTitle,
  setId: _setId,
  activeMode: _activeMode,
  onChangeMode: _onChangeMode,
  onOpenQuestionGrid,
  onOpenThemeModal,
  slideDirection: _slideDirection,
  mistakeCount: _mistakeCount = 0,
  onOpenKnowledgeGroups: _onOpenKnowledgeGroups,
}: HonVietQuizViewProps) {
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('keyt_focus_mode_hon_viet') === 'true';
    } catch {
      return false;
    }
  });

  const [activeMenuTab, setActiveMenuTab] = useState<'study' | 'stats' | 'rank' | 'docs'>('study');
  const [xp, setXp] = useState<number>(() => getUserXP());
  const [streakDays, setStreakDays] = useState<number>(() => getStudyStreak());
  const [studySeconds, setStudySeconds] = useState<number>(() => {
    try {
      const saved = Number(sessionStorage.getItem(ACTIVE_STUDY_SECONDS_KEY));
      return Number.isFinite(saved) && saved > 0 ? Math.floor(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Woodfish merits counter in right widget
  const [woodFishCount, setWoodFishCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('keyt_woodfish_merits');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [isWoodFishAnimated, setIsWoodFishAnimated] = useState(false);

  // Listen to XP, Streak & Study Timer updates
  useEffect(() => {
    const handleStorage = () => {
      setXp(getUserXP());
      setStreakDays(getStudyStreak());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('keyt-xp-earned', handleStorage);

    const timer = setInterval(() => {
      try {
        const saved = Number(sessionStorage.getItem(ACTIVE_STUDY_SECONDS_KEY));
        if (Number.isFinite(saved) && saved > 0) {
          setStudySeconds(Math.floor(saved));
        } else {
          setStudySeconds((prev) => prev + 1);
        }
      } catch {
        setStudySeconds((prev) => prev + 1);
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('keyt-xp-earned', handleStorage);
      clearInterval(timer);
    };
  }, []);

  const toggleFocusMode = () => {
    const nextVal = !isFocusMode;
    setIsFocusMode(nextVal);
    try {
      localStorage.setItem('keyt_focus_mode_hon_viet', nextVal ? 'true' : 'false');
    } catch {
      // ignore
    }
  };

  const handleTapWoodFish = () => {
    playWoodFishSound('warm');
    const nextCount = woodFishCount + 1;
    setWoodFishCount(nextCount);
    try {
      localStorage.setItem('keyt_woodfish_merits', String(nextCount));
    } catch {
      // ignore
    }
    setIsWoodFishAnimated(true);
    setTimeout(() => setIsWoodFishAnimated(false), 250);
  };

  const statTotal = splitEnabled && currentPart ? currentPart.totalCount : totalCount;
  const statMastered = splitEnabled && currentPart
    ? questions.slice(currentPart.startIndex, currentPart.endIndex + 1).filter((q) => masteredIds.includes(q.id)).length
    : masteredIds.length;

  const progressPercent = statTotal > 0 ? Math.min(100, Math.round((statMastered / statTotal) * 100)) : 0;
  const displayTitle = setTitle || 'MLN111';

  // Compute question groups/chunks inside the active section/part (e.g. chunks of 10 questions)
  const questionGroups = useMemo(() => {
    const start = splitEnabled && currentPart ? currentPart.startIndex : 0;
    const end = splitEnabled && currentPart ? currentPart.endIndex : questions.length - 1;
    const chunkSize = 10;
    const groups: {
      startIndex: number;
      endIndex: number;
      label: string;
      isActive: boolean;
      masteredCount: number;
      total: number;
    }[] = [];

    for (let i = start; i <= end; i += chunkSize) {
      const groupEnd = Math.min(i + chunkSize - 1, end);
      const isCurrentInGroup = currentIndex >= i && currentIndex <= groupEnd;
      const groupQuestions = questions.slice(i, groupEnd + 1);
      const masteredInGroup = groupQuestions.filter((q) => masteredIds.includes(q.id)).length;

      groups.push({
        startIndex: i,
        endIndex: groupEnd,
        label: `Câu ${i + 1} - ${groupEnd + 1}`,
        isActive: isCurrentInGroup,
        masteredCount: masteredInGroup,
        total: groupQuestions.length,
      });
    }

    return groups;
  }, [splitEnabled, currentPart, questions, currentIndex, masteredIds]);

  const handleGroupClick = (groupStartIndex: number) => {
    if (onJumpToQuestion) {
      onJumpToQuestion(groupStartIndex);
    }
  };

  const rankTitle = xp >= 2000 ? 'Tiến sĩ' : xp >= 1200 ? 'Cử nhân' : xp >= 600 ? 'Tú tài' : 'Tân binh';
  const badgesCount = Math.max(1, Math.floor(statMastered / 10));

  return (
    <div className={`hon-viet-theme ${isFocusMode ? 'is-focus-mode' : ''}`}>
      {/* Subtle Vector Dong Son Drum Watermark in Background (Pure SVG - NO FAKE UI) */}
      <div className="hon-viet-bg-watermark-wrap" aria-hidden="true">
        <DongSonDrumSvg size={760} opacity={0.042} color="#f59e0b" />
      </div>


      {/* Floating Exit Focus Button when in Focus Mode */}
      {isFocusMode && (
        <button
          type="button"
          className="hon-viet-floating-focus-exit"
          onClick={toggleFocusMode}
          title="Thoát chế độ tập trung"
        >
          ✕ Thoát chế độ tập trung
        </button>
      )}

      {/* ==================================================================
          REAL THREE-COLUMN DASHBOARD LAYOUT
          ================================================================== */}
      <div className="hon-viet-body-container">
        {/* ================================================================
            COLUMN 1: REAL LEFT SIDEBAR (NAVIGATION + STUDY ROADMAP)
            ================================================================ */}
        <aside className="hon-viet-left-sidebar" aria-label="Thanh điều hướng và lộ trình">
          {/* Sub-strip A: Real Navigation Strip */}
          <div className="hon-viet-menu-strip">
            <nav className="hon-viet-nav-list" aria-label="Danh mục chức năng">
              <button
                type="button"
                className="hon-viet-nav-item"
                onClick={onBack}
                title="Quay lại Trang chủ / Thư viện môn học"
              >
                <span className="hon-viet-nav-icon">🏠</span>
                <span>Trang chủ</span>
              </button>

              <button
                type="button"
                className={`hon-viet-nav-item ${activeMenuTab === 'study' ? 'is-active' : ''}`}
                onClick={() => setActiveMenuTab('study')}
                title="Khu vực luyện thi trắc nghiệm"
              >
                <span className="hon-viet-nav-icon">📖</span>
                <span>Học tập</span>
              </button>

              <button
                type="button"
                className={`hon-viet-nav-item ${activeMenuTab === 'stats' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveMenuTab('stats');
                  onOpenQuestionGrid();
                }}
                title="Xem bảng thống kê toàn bộ câu hỏi"
              >
                <span className="hon-viet-nav-icon">📊</span>
                <span>Thống kê</span>
              </button>

              <button
                type="button"
                className={`hon-viet-nav-item ${activeMenuTab === 'rank' ? 'is-active' : ''}`}
                onClick={() => setActiveMenuTab('rank')}
                title="Bảng thành tích và cấp bậc học tập"
              >
                <span className="hon-viet-nav-icon">🏆</span>
                <span>Thành tích</span>
              </button>

              <button
                type="button"
                className={`hon-viet-nav-item ${activeMenuTab === 'docs' ? 'is-active' : ''}`}
                onClick={() => setActiveMenuTab('docs')}
                title="Tài liệu môn học"
              >
                <span className="hon-viet-nav-icon">📜</span>
                <span>Tài liệu</span>
              </button>

              <button
                type="button"
                className="hon-viet-nav-item"
                onClick={onOpenThemeModal}
                title="Cài đặt giao diện"
              >
                <span className="hon-viet-nav-icon">⚙️</span>
                <span>Cài đặt</span>
              </button>
            </nav>

            {/* Vietnam Map Silhouette, Sovereignty & Patriotic Quote */}
            <div className="hon-viet-map-widget">
              <svg
                className="hon-viet-map-silhouette"
                viewBox="0 0 100 180"
                aria-label="Bản đồ Việt Nam chữ S"
              >
                <path
                  d="M48,10 Q58,15 62,28 Q65,40 54,55 Q42,70 50,85 Q58,100 52,118 Q44,135 38,150 Q32,162 40,172 Q46,165 48,152 Q56,132 64,115 Q72,95 62,75 Q55,60 68,42 Q75,25 60,10 Z"
                  fill="#f59e0b"
                />
                <circle cx="82" cy="78" r="3.5" fill="#f59e0b" />
                <circle cx="86" cy="85" r="2.5" fill="#f59e0b" />
                <circle cx="75" cy="130" r="3" fill="#f59e0b" />
                <circle cx="82" cy="138" r="3.5" fill="#f59e0b" />
              </svg>
              <p className="hon-viet-patriotic-quote">
                “Việt Nam không chỉ là một quê hương, mà còn là một khát vọng.”
              </p>
              <span className="hon-viet-quote-author">— Thủ tướng Phạm Minh Chính</span>

              <div className="hon-viet-books-emblem">
                <div className="hon-viet-book-spine">TRI THỨC KIẾN TẠO TƯƠNG LAI</div>
                <div className="hon-viet-book-spine sub">VÌ MỘT VIỆT NAM HÙNG CƯỜNG</div>
              </div>
            </div>
          </div>

          {/* Sub-strip B: Real Interactive Study Roadmap (Lộ Trình Học Tập) */}
          <div className="hon-viet-roadmap-col">
            <div className="hon-viet-roadmap-header">
              <div className="hon-viet-roadmap-title">
                <span className="hon-viet-roadmap-icon">🧭</span>
                <span>LỘ TRÌNH HỌC TẬP</span>
              </div>
              <button
                type="button"
                className="hon-viet-matrix-btn"
                onClick={onOpenQuestionGrid}
                title="Xem ma trận câu hỏi"
              >
                📋 Ma trận
              </button>
            </div>

            <div className="hon-viet-part-list">
              {splitEnabled && parts.length > 0 ? (
                parts.map((p, idx) => {
                  const isActive = idx === currentPartIndex;
                  const pQuestions = questions.slice(p.startIndex, p.endIndex + 1);
                  const pMastered = pQuestions.filter((q) => masteredIds.includes(q.id)).length;
                  const isDone = pMastered === p.totalCount && p.totalCount > 0;

                  return (
                    <div key={p.partIndex} className="hon-viet-part-wrapper">
                      <button
                        type="button"
                        className={`hon-viet-part-item ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
                        onClick={() => onSwitchPart(idx)}
                      >
                        <div className="hon-viet-part-info">
                          <span className="hon-viet-part-status-icon">
                            {isDone ? '✓' : isActive ? '📖' : '📜'}
                          </span>
                          <span className="hon-viet-part-name">{p.name}</span>
                        </div>
                        <span className="hon-viet-part-badge">
                          {pMastered}/{p.totalCount}
                        </span>
                      </button>

                      {/* Active Section Question Groups (Sub-chunks) */}
                      {isActive && (
                        <div className="hon-viet-subq-groups-list">
                          {questionGroups.map((g) => (
                            <button
                              key={g.startIndex}
                              type="button"
                              className={`hon-viet-subq-chunk-btn ${g.isActive ? 'is-active-chunk' : ''}`}
                              onClick={() => handleGroupClick(g.startIndex)}
                              title={`Xem ${g.label}`}
                            >
                              <div className="hon-viet-chunk-left">
                                <span className="hon-viet-chunk-radio">
                                  {g.isActive ? '◉' : '◯'}
                                </span>
                                <span className="hon-viet-chunk-label">{g.label}</span>
                              </div>
                              <span className="hon-viet-chunk-badge">
                                {g.masteredCount === g.total ? '✓' : `${g.masteredCount}/${g.total}`}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="hon-viet-part-wrapper">
                  <div className="hon-viet-part-item is-active">
                    <div className="hon-viet-part-info">
                      <span className="hon-viet-part-status-icon">📖</span>
                      <span className="hon-viet-part-name">Toàn bộ câu hỏi</span>
                    </div>
                    <span className="hon-viet-part-badge">
                      {statMastered}/{questions.length}
                    </span>
                  </div>

                  {/* Chunks of questions for full quiz */}
                  <div className="hon-viet-subq-groups-list">
                    {questionGroups.map((g) => (
                      <button
                        key={g.startIndex}
                        type="button"
                        className={`hon-viet-subq-chunk-btn ${g.isActive ? 'is-active-chunk' : ''}`}
                        onClick={() => handleGroupClick(g.startIndex)}
                      >
                        <div className="hon-viet-chunk-left">
                          <span className="hon-viet-chunk-radio">
                            {g.isActive ? '◉' : '◯'}
                          </span>
                          <span className="hon-viet-chunk-label">{g.label}</span>
                        </div>
                        <span className="hon-viet-chunk-badge">
                          {g.masteredCount === g.total ? '✓' : `${g.masteredCount}/${g.total}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ================================================================
            COLUMN 2: REAL MAIN QUIZ CONTENT (CENTER QUESTION CARD)
            ================================================================ */}
        <main className="hon-viet-center-col" aria-label="Nội dung câu hỏi">
          <div className="hon-viet-card">
            {/* Subtle Bronze Drum Watermark Inside Card */}
            <div className="hon-viet-card-drum-corner" aria-hidden="true">
              <DongSonDrumSvg size={260} opacity={0.05} color="#78350f" />
            </div>

            {/* Question Card Header */}
            <div className="hon-viet-q-header">
              <div className="hon-viet-q-meta">
                <span className="hon-viet-q-badge">
                  📖 Câu {relativeIndex + 1} / {statTotal}
                </span>
                <span className="hon-viet-q-subtag">
                  {splitEnabled && currentPart ? `${currentPart.name} · ` : ''}Gốc: #{question.id}
                </span>
              </div>

              <button
                type="button"
                className={`hon-viet-bookmark-btn ${isMastered ? 'is-mastered' : ''}`}
                onClick={() => onToggleMastered(question.id)}
                title="Đánh dấu câu đã thuộc (Phím tắt: M)"
              >
                <span>{isMastered ? '✓' : '📌'}</span>
                <span>{isMastered ? 'Đã thuộc câu này' : 'Lưu câu hỏi'}</span>
              </button>
            </div>

            {/* Question Statement */}
            <h2 className="hon-viet-q-statement">
              {question.text}
            </h2>

            {/* AI Assistant Banner */}
            <div className="hon-viet-ai-section">
              <AskAI question={question} />
            </div>

            {/* Free response mode */}
            {isFreeResponse && (
              <div className="hon-viet-free-response-wrap">
                {isRevealed ? (
                  <div className="hon-viet-feedback-banner revealed">
                    <strong>Đáp án / Hướng dẫn:</strong> {question.correctAnswer}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="hon-viet-reveal-btn"
                    onClick={onToggleReveal}
                  >
                    👁 Xem đáp án tự luận
                  </button>
                )}
              </div>
            )}

            {/* Multiple Choice Options List */}
            {question.options && question.options.length > 0 && (
              <div className="hon-viet-options-list">
                {question.options.map((opt) => {
                  const isSelected = isMultipleChoice
                    ? selectedAnswer?.split(',').includes(opt.key)
                    : selectedAnswer === opt.key;
                  const isCorrect = opt.key === question.correctAnswer;

                  let optClass = 'hon-viet-opt-card';
                  if (isSelected) optClass += ' is-selected';
                  if ((isAnswered || isRevealed) && !isUnresolved) {
                    if (isCorrect) optClass += ' is-correct';
                    else if (isSelected) optClass += ' is-incorrect';
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      className={optClass}
                      onClick={() => onSelectOption(opt.key)}
                      aria-label={`${opt.key}. ${opt.text}`}
                    >
                      <span className="hon-viet-opt-badge">{opt.key}</span>
                      <span className="hon-viet-opt-text">{opt.text}</span>
                      {(isAnswered || isRevealed) && !isUnresolved && isCorrect && (
                        <span className="hon-viet-opt-status-correct">✓</span>
                      )}
                      {(isAnswered || (isRevealed && isSelected)) && !isUnresolved && !isCorrect && (
                        <span className="hon-viet-opt-status-incorrect">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Feedback Banner */}
            {(isAnswered || isRevealed) && (
              <div
                className={`hon-viet-feedback-banner ${
                  isAnswered
                    ? selectedAnswer === question.correctAnswer
                      ? 'correct'
                      : 'incorrect'
                    : 'revealed'
                }`}
              >
                {isUnresolved ? (
                  <span>⚠ Chưa có đáp án chính thức cho câu này.</span>
                ) : isAnswered ? (
                  selectedAnswer === question.correctAnswer ? (
                    <span>✓ Rất chính xác! Tinh thần hiếu học đáng khen ngợi (+35 XP).</span>
                  ) : (
                    <span>✗ Chưa đúng! Đáp án chính xác theo tài liệu là: <strong>{question.correctAnswer}</strong></span>
                  )
                ) : (
                  <span>💡 Đáp án câu hỏi: <strong>{question.correctAnswer}</strong></span>
                )}
              </div>
            )}

            {/* Multiple Choice Confirm Button */}
            {isMultipleChoice && !isAnswered && (
              <div style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className="hon-viet-reveal-btn"
                  onClick={onCheckMultiple}
                >
                  Kiểm tra đáp án
                </button>
              </div>
            )}

            {/* Action Buttons Bar */}
            <div className="hon-viet-actions">
              <button
                type="button"
                className="hon-viet-prev-btn"
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
                className="hon-viet-reveal-btn"
                onClick={onToggleReveal}
                disabled={isAnswered}
                title="Xem đáp án (Phím tắt: Space)"
              >
                <span>{isAnswered ? '✓' : isRevealed ? '🙈' : '👁️'}</span>
                <span>{isAnswered ? 'Đã có đáp án' : isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
              </button>

              <button
                type="button"
                className="hon-viet-next-btn"
                onClick={onNext}
                disabled={
                  splitEnabled && currentPart
                    ? currentIndex >= currentPart.endIndex
                    : currentIndex === questions.length - 1
                }
                title="Phím tắt: →"
              >
                Câu tiếp →
              </button>
            </div>

            {/* Keyboard Hint */}
            <div className="hon-viet-key-hints">
              💡 Phím tắt: <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> chọn đáp án · <kbd>Space</kbd> xem đáp án · <kbd>←</kbd> <kbd>→</kbd> chuyển câu · <kbd>M</kbd> lưu câu · <kbd>G</kbd> danh sách
            </div>
          </div>
        </main>

        {/* ================================================================
            COLUMN 3: REAL RIGHT SIDEBAR (STATISTICS, PROGRESS, FOCUS MODE)
            ================================================================ */}
        <aside className="hon-viet-right-sidebar" aria-label="Thống kê học tập">
          {/* Card 1: Real Study Progress (Tiến độ học tập) */}
          <div className="hon-viet-stat-card">
            <div className="hon-viet-card-title">
              <span>📊 TIẾN ĐỘ HỌC TẬP</span>
              <button
                type="button"
                className="hon-viet-card-link-btn"
                onClick={onOpenQuestionGrid}
              >
                Chi tiết ›
              </button>
            </div>
            <div className="hon-viet-circle-row">
              <div className="hon-viet-circle-wrap">
                <svg className="hon-viet-circle-svg" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#fee2e2"
                    strokeWidth="3.2"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#b91c1c"
                    strokeWidth="3.2"
                    strokeDasharray="94.2"
                    strokeDashoffset={`${94.2 - (progressPercent / 100) * 94.2}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="hon-viet-circle-val">{progressPercent}%</span>
              </div>
              <div className="hon-viet-circle-legend">
                <span>Đã làm: <strong>{statMastered}/{statTotal} câu</strong></span>
                <span>Đã trả lời: <strong>{Object.keys(answers).length} câu</strong></span>
                <span>Thời gian: <strong>{formatStudyTime(studySeconds)}</strong></span>
                <span>Phần: <strong>{splitEnabled && currentPart ? currentPart.name : displayTitle}</strong></span>
              </div>
            </div>
          </div>

          {/* Card 2: Real Learning Streak (Chuỗi học tập) */}
          <div className="hon-viet-stat-card">
            <div className="hon-viet-card-title">
              <span>🔥 CHUỖI HỌC TẬP</span>
            </div>
            <div className="hon-viet-streak-row">
              <span className="hon-viet-flame-icon">🔥</span>
              <div className="hon-viet-streak-text">
                <h4>{streakDays} ngày</h4>
                <p>Kiên trì hôm nay — Vững vàng ngày mai!</p>
              </div>
            </div>
          </div>

          {/* Card 3: Real Quick Achievements (Thành tích nhanh) */}
          <div className="hon-viet-stat-card">
            <div className="hon-viet-card-title">
              <span>🎖️ THÀNH TÍCH NHANH</span>
              <button
                type="button"
                className="hon-viet-card-link-btn"
                onClick={onOpenQuestionGrid}
              >
                Xem tất cả ›
              </button>
            </div>
            <div className="hon-viet-stats-3col">
              <div className="hon-viet-mini-stat">
                <div className="hon-viet-mini-val">{xp}</div>
                <div className="hon-viet-mini-lbl">Điểm XP</div>
              </div>
              <div className="hon-viet-mini-stat">
                <div className="hon-viet-mini-val">{rankTitle}</div>
                <div className="hon-viet-mini-lbl">Hạng bậc</div>
              </div>
              <div className="hon-viet-mini-stat">
                <div className="hon-viet-mini-val">{badgesCount}</div>
                <div className="hon-viet-mini-lbl">Huy hiệu</div>
              </div>
            </div>
          </div>

          {/* Card 4: Patriotic Inspirational Banner */}
          <div className="hon-viet-patriotic-banner">
            <p className="hon-viet-banner-slogan">
              “Học tập hôm nay – dựng xây ngày mai.”
            </p>
            <span className="hon-viet-banner-flag">🇻🇳 🪷 🇻🇳</span>
          </div>

          {/* Card 5: Real Focus Mode Toggle (Chế độ tập trung) */}
          <div className="hon-viet-stat-card">
            <div className="hon-viet-focus-row">
              <div className="hon-viet-focus-label">
                <span className="hon-viet-focus-title">🪷 Chế Độ Tập Trung</span>
                <span className="hon-viet-focus-sub">Ẩn các thanh bên để tập trung</span>
              </div>
              <label className="hon-viet-toggle-switch">
                <input
                  type="checkbox"
                  checked={isFocusMode}
                  onChange={toggleFocusMode}
                  aria-label="Bật tắt chế độ tập trung"
                />
                <span className="hon-viet-toggle-slider" />
              </label>
            </div>
          </div>

          {/* Card 6: Interactive Mindfulness WoodenFish (Mõ Gỗ Tu Tâm) */}
          <div className="hon-viet-stat-card hon-viet-woodfish-card">
            <div className="hon-viet-card-title">
              <span>🔔 MÕ GỖ TU TÂM</span>
              <span className="hon-viet-merit-count">Công đức: {woodFishCount}</span>
            </div>
            <div className="hon-viet-woodfish-content">
              <button
                type="button"
                className={`hon-viet-woodfish-btn ${isWoodFishAnimated ? 'is-struck' : ''}`}
                onClick={handleTapWoodFish}
                title="Gõ mõ xả stress, tĩnh tâm ôn bài"
              >
                <span className="hon-viet-woodfish-icon">🪵🪷</span>
                <span className="hon-viet-woodfish-txt">Gõ mõ tĩnh tâm (+1 Pass môn)</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
