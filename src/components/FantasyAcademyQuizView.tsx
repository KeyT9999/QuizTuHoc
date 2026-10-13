import { useState, useEffect, useMemo, useRef } from 'react';
import type { Question } from '../utils/quizParser';
import type { QuizPlayMode } from './QuizModeBar';
import AskAI from './AskAI';
import {
  getUserXP,
  calculateLevel,
  getStudyStreak,
  addStudyXP,
} from '../utils/studyStats';
import './FantasyAcademyTheme.css';

interface QuizSplitPart {
  partIndex: number;
  name: string;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  startNumber: number;
  endNumber: number;
}

interface FantasyAcademyQuizViewProps {
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

export default function FantasyAcademyQuizView({
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
  submittedIds,
  onSelectOption,
  onCheckMultiple,
  onToggleReveal,
  onToggleMastered,
  onPrev,
  onNext,
  onBack: _onBack,
  onBackLabel: _onBackLabel = '← Quay lại',
  setTitle,
  setId: _setId,
  activeMode: _activeMode,
  onChangeMode: _onChangeMode,
  onOpenQuestionGrid,
  onOpenThemeModal: _onOpenThemeModal,
  slideDirection,
  mistakeCount: _mistakeCount = 0,
  onOpenKnowledgeGroups: _onOpenKnowledgeGroups,
}: FantasyAcademyQuizViewProps) {
  const [xp, setXp] = useState(() => getUserXP());
  const [streak, setStreak] = useState(() => getStudyStreak());
  const [claimedChest, setClaimedChest] = useState<string | null>(null);
  const [claimedChests, setClaimedChests] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('keyt_fantasy_claimed_chests');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [owlTip, setOwlTip] = useState<string | null>(null);
  const activeChunkRef = useRef<HTMLButtonElement | null>(null);

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

  // Compute question groups / chunks (10 questions each)
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

  // Smooth scroll active chunk into view
  useEffect(() => {
    if (activeChunkRef.current) {
      activeChunkRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  const handleGroupClick = (groupStartIndex: number) => {
    if (onJumpToQuestion) {
      onJumpToQuestion(groupStartIndex);
    }
  };

  const activeQuestions = splitEnabled && currentPart
    ? questions.slice(currentPart.startIndex, currentPart.endIndex + 1)
    : questions;

  const statTotal = activeQuestions.length;
  const statMastered = activeQuestions.filter((q) => masteredIds.includes(q.id)).length;
  const statAnswered = activeQuestions.filter((q) =>
    q.correctAnswer.length > 1 ? submittedIds.includes(q.id) : answers[q.id] !== undefined
  ).length;
  const statCorrect = activeQuestions.filter((q) => answers[q.id] === q.correctAnswer).length;

  const accuracyPercent = statAnswered > 0 ? Math.round((statCorrect / statAnswered) * 100) : 100;
  const levelData = calculateLevel(xp);
  const expProgressPercent = Math.min(100, Math.round((levelData.currentLevelXp / levelData.nextLevelXp) * 100));
  const displayTitle = setTitle || 'MLN111';
  const rankPercent = xp >= 3000 ? 'Top 1%' : xp >= 1800 ? 'Top 3%' : xp >= 800 ? 'Top 5%' : 'Top 10%';

  const handleClaimChest = (id: string, name: string, rewardXp: number, isEligible: boolean) => {
    if (claimedChests[id]) {
      setClaimedChest(`Bạn đã mở ${name} trước đó rồi!`);
      setTimeout(() => setClaimedChest(null), 3000);
      return;
    }
    if (!isEligible) {
      setClaimedChest(`Chưa hoàn thành nhiệm vụ để mở ${name}!`);
      setTimeout(() => setClaimedChest(null), 3000);
      return;
    }
    addStudyXP(rewardXp);
    const updated = { ...claimedChests, [id]: true };
    setClaimedChests(updated);
    try {
      localStorage.setItem('keyt_fantasy_claimed_chests', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setClaimedChest(`🎉 Mở ${name} thành công! Nhận được +${rewardXp} EXP!`);
    setTimeout(() => setClaimedChest(null), 3500);
  };

  const getOwlMessage = () => {
    if (owlTip) return owlTip;
    if (isAnswered && !isUnresolved) {
      if (selectedAnswer === question.correctAnswer) {
        return '✨ Xuất sắc! Pháp lực của bạn ngày càng tinh thâm!';
      } else {
        return '🦉 Đừng nản lòng! Hãy nghiền ngẫm bí kíp cổ thư và thử lại nhé!';
      }
    }
    if (streak >= 7) {
      return `🔥 Chuỗi ${streak} ngày bất bại! Trí tuệ của bạn sáng rực như bảo ngọc ma pháp!`;
    }
    if (statMastered > 0 && statMastered % 10 === 0) {
      return `📜 Bạn đã tinh thông ${statMastered} câu thần chú! Tiến lên nào pháp sư!`;
    }
    return 'Cố lên! Mỗi câu hỏi là một bước tiến trên hành trình chinh phục tri thức!';
  };

  const handlePokeOwl = () => {
    const magicTips = [
      '🦉 Gu gù! Nhớ nhấn phím Space để xem bí quyết cổ thư khi gặp câu khó nhé!',
      '⚡ Phím tắt A, B, C, D giúp bạn thi triển câu trả lời với tốc độ thần tốc!',
      '🧙 Thuộc càng nhiều câu, kho tri thức ma pháp của bạn càng uyên bác!',
      '🌟 Kiên trì mỗi ngày là chìa khóa mở cánh cổng Đại Pháp Sư!',
      '📖 Bấm vào "📋 Ma trận" để có cái nhìn bao quát toàn bộ bản đồ cổ thư!',
    ];
    const picked = magicTips[Math.floor(Math.random() * magicTips.length)];
    setOwlTip(picked);
    setTimeout(() => setOwlTip(null), 4500);
  };

  return (
    <div className="fantasy-academy-theme">
      {/* Fantasy RPG Level & EXP Strip */}
      <div className="fantasy-hero-status-strip">
        <div className="fantasy-hero-status-left">
          <span className="fantasy-crest-icon">🛡️</span>
          <span className="fantasy-course-title">{displayTitle}</span>
          <span className="fantasy-level-badge">Lv.{levelData.level}</span>
          <div className="fantasy-exp-bar-wrap" title={`EXP: ${levelData.currentLevelXp} / ${levelData.nextLevelXp}`}>
            <span>EXP</span>
            <div className="fantasy-exp-track">
              <div className="fantasy-exp-fill" style={{ width: `${expProgressPercent}%` }} />
            </div>
            <span>{levelData.currentLevelXp}/{levelData.nextLevelXp}</span>
          </div>
        </div>
        <div className="fantasy-hero-status-right">
          <div className="fantasy-streak-pill" title="Chuỗi học liên tục">
            <span>🔥</span>
            <span>Chuỗi <strong>{streak} ngày</strong></span>
          </div>
          <div className="fantasy-rank-pill" title="Xếp hạng học viên">
            <span>👑</span>
            <span>Hạng <strong>{rankPercent}</strong></span>
          </div>
        </div>
      </div>

      {/* 3-COLUMN MAIN LAYOUT */}
      <main className="fantasy-body-layout">
        {/* ----------------- LEFT SIDEBAR: BẢN ĐỒ HỌC TẬP ----------------- */}
        <aside className="fantasy-sidebar-left">
          <div className="fantasy-card-box">
            <div className="fantasy-roadmap-header">
              <h4 className="fantasy-box-title" style={{ margin: 0, padding: 0, border: 'none' }}>
                <span>🧭</span> BẢN ĐỒ HỌC TẬP
              </h4>
              <button
                type="button"
                className="fantasy-matrix-btn"
                onClick={onOpenQuestionGrid}
                title="Mở ma trận toàn bộ câu hỏi (Phím tắt: G)"
              >
                📋 Ma trận
              </button>
            </div>

            <div className="fantasy-quest-map-list">
              {splitEnabled && parts.length > 0 ? (
                parts.map((p, idx) => {
                  const isActive = idx === currentPartIndex;
                  const pQuestions = questions.slice(p.startIndex, p.endIndex + 1);
                  const pMastered = pQuestions.filter((q) => masteredIds.includes(q.id)).length;
                  const isDone = pMastered === p.totalCount && p.totalCount > 0;
                  const isLocked = !isDone && !isActive && idx > currentPartIndex;

                  return (
                    <div key={p.partIndex} className="fantasy-part-wrapper">
                      <div
                        className={`fantasy-quest-node ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}
                        onClick={() => onSwitchPart(idx)}
                        title={`Chuyển tới ${p.name}`}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="fantasy-node-circle">
                          {isDone ? '✓' : isActive ? '📖' : isLocked ? '🔒' : String(idx + 1)}
                        </div>
                        <div className="fantasy-node-info">
                          <div className="fantasy-node-title">{p.name}</div>
                          <div className="fantasy-node-sub">
                            {isActive
                              ? `${pMastered}/${p.totalCount} đã học`
                              : isDone
                              ? 'Hoàn thành'
                              : `${p.totalCount} câu`}
                          </div>
                        </div>
                        {isActive && <span className="fantasy-node-arrow">›</span>}
                      </div>

                      {/* Active Section Question Groups (Sub-chunks of 10) */}
                      {isActive && (
                        <div className="fantasy-subq-groups-list">
                          {questionGroups.map((g) => (
                            <button
                              key={g.startIndex}
                              ref={g.isActive ? activeChunkRef : null}
                              type="button"
                              className={`fantasy-subq-chunk-btn ${g.isActive ? 'is-active-chunk' : ''} ${
                                g.masteredCount === g.total && g.total > 0 ? 'is-mastered-chunk' : ''
                              }`}
                              onClick={() => handleGroupClick(g.startIndex)}
                              title={`Nhảy tới ${g.label}`}
                            >
                              <div className="fantasy-chunk-left">
                                <span className="fantasy-chunk-radio">
                                  {g.masteredCount === g.total && g.total > 0 ? '✓' : g.isActive ? '◉' : '◯'}
                                </span>
                                <span className="fantasy-chunk-label">{g.label}</span>
                              </div>
                              <span className="fantasy-chunk-badge">
                                {g.masteredCount === g.total && g.total > 0 ? '✓' : `${g.masteredCount}/${g.total}`}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="fantasy-part-wrapper">
                  <div className="fantasy-quest-node is-active" style={{ cursor: 'default' }}>
                    <div className="fantasy-node-circle">📖</div>
                    <div className="fantasy-node-info">
                      <div className="fantasy-node-title">Toàn bộ câu hỏi</div>
                      <div className="fantasy-node-sub">
                        {statMastered}/{questions.length} đã thuộc ({statTotal > 0 ? Math.round((statMastered / statTotal) * 100) : 0}%)
                      </div>
                    </div>
                  </div>

                  {/* Chunks of 10 questions for full quiz */}
                  <div className="fantasy-subq-groups-list">
                    {questionGroups.map((g) => (
                      <button
                        key={g.startIndex}
                        ref={g.isActive ? activeChunkRef : null}
                        type="button"
                        className={`fantasy-subq-chunk-btn ${g.isActive ? 'is-active-chunk' : ''} ${
                          g.masteredCount === g.total && g.total > 0 ? 'is-mastered-chunk' : ''
                        }`}
                        onClick={() => handleGroupClick(g.startIndex)}
                        title={`Nhảy tới ${g.label}`}
                      >
                        <div className="fantasy-chunk-left">
                          <span className="fantasy-chunk-radio">
                            {g.masteredCount === g.total && g.total > 0 ? '✓' : g.isActive ? '◉' : '◯'}
                          </span>
                          <span className="fantasy-chunk-label">{g.label}</span>
                        </div>
                        <span className="fantasy-chunk-badge">
                          {g.masteredCount === g.total && g.total > 0 ? '✓' : `${g.masteredCount}/${g.total}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ----------------- CENTER COLUMN: BÍ KÍP CỔ THƯ ----------------- */}
        <section className="fantasy-center-col">
          <div
            className={`fantasy-parchment-card ${
              slideDirection === 'next'
                ? 'slide-in-right'
                : slideDirection === 'prev'
                ? 'slide-in-left'
                : ''
            }`}
            key={question.id}
          >
            {/* Header: Swords, Question Num, Origin Tag, Mastered */}
            <div className="fantasy-q-header">
              <div className="fantasy-q-left-meta">
                <span className="fantasy-swords-icon">⚔️</span>
                <span className="fantasy-q-title">
                  Câu {relativeIndex + 1}{' '}
                  <span className="fantasy-q-total">/ {totalCount}</span>
                </span>

                {splitEnabled && currentPart && (
                  <span className="fantasy-q-part-chip">
                    {currentPart.name} · Gốc: #{currentIndex + 1}/{questions.length}
                  </span>
                )}
              </div>

              <button
                type="button"
                className={`fantasy-mastered-btn ${isMastered ? 'is-mastered' : ''}`}
                onClick={() => onToggleMastered(question.id)}
                title="Đánh dấu câu đã thuộc (Phím tắt: M)"
              >
                <span>{isMastered ? '✓' : '🔖'}</span>
                <span>{isMastered ? 'Đã thuộc' : 'Đánh dấu đã học'}</span>
              </button>
            </div>

            {/* Question Text */}
            <h2 className="fantasy-question-text">{question.text}</h2>

            {/* AI Assistant Banner */}
            <AskAI question={question} />

            {/* Options Stack */}
            {isFreeResponse ? (
              <div className="quiz-v2-free-response" style={{ marginBottom: 20 }}>
                <label htmlFor={`fantasy-free-${question.id}`} style={{ color: '#78350f', fontWeight: 700 }}>
                  Nhập câu trả lời vào các ô trống:
                </label>
                <textarea
                  id={`fantasy-free-${question.id}`}
                  value={selectedAnswer ?? ''}
                  onChange={(e) => onSelectOption(e.target.value)}
                  placeholder="Nhập đáp án..."
                  rows={3}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1.5px solid #d97706',
                    color: '#1c150c',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 15,
                  }}
                />
              </div>
            ) : (
              <div className="fantasy-options-stack">
                {question.options.map((opt) => {
                  const isSelected = selectedAnswer?.includes(opt.key) ?? false;
                  const isCorrect = question.correctAnswer.includes(opt.key);

                  let optClass = 'fantasy-option-card';
                  if (isSelected && !isAnswered) optClass += ' is-selected';
                  if (isAnswered && !isUnresolved) {
                    if (isCorrect) optClass += ' is-correct';
                    else if (isSelected) optClass += ' is-incorrect';
                    else optClass += ' is-dimmed';
                  } else if (isRevealed && !isUnresolved) {
                    if (isCorrect) optClass += ' is-correct';
                    else if (isSelected) optClass += ' is-incorrect';
                    else optClass += ' is-dimmed';
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      className={optClass}
                      onClick={() => onSelectOption(opt.key)}
                      aria-label={`${opt.key}. ${opt.text}`}
                    >
                      <span className="fantasy-option-key-badge">{opt.key}</span>
                      <span className="fantasy-option-text">{opt.text}</span>

                      {(isAnswered || isRevealed) && !isUnresolved && isCorrect && (
                        <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                      )}
                      {(isAnswered || (isRevealed && isSelected)) && !isUnresolved && !isCorrect && (
                        <span style={{ color: '#dc2626', fontWeight: 800 }}>✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Feedback Alert */}
            {(isAnswered || isRevealed) && (
              <div
                className={`fantasy-feedback-box ${
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
                    <span>✓ Đáp án chính xác! Bạn nhận được +35 EXP tri thức.</span>
                  ) : (
                    <span>✗ Chưa chính xác! Đáp án đúng của cổ thư là: <strong>{question.correctAnswer}</strong></span>
                  )
                ) : (
                  <span>💡 Đáp án đúng là: <strong>{question.correctAnswer}</strong></span>
                )}
              </div>
            )}

            {/* Actions Bar */}
            <div className="fantasy-actions-bar">
              <button
                type="button"
                className="fantasy-prev-btn"
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
                className="fantasy-reveal-btn"
                onClick={onToggleReveal}
                disabled={isAnswered}
                title="Xem đáp án (Phím tắt: Space)"
              >
                <span>{isAnswered ? '✓' : isRevealed ? '🙈' : '👁️'}</span>
                <span>{isAnswered ? 'Đã có đáp án' : isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
                {!isAnswered && (
                  <kbd style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: 4, fontSize: 11 }}>
                    Space
                  </kbd>
                )}
              </button>

              {isMultipleChoice && !isAnswered && (
                <button
                  type="button"
                  className="fantasy-next-btn"
                  onClick={onCheckMultiple}
                  disabled={!selectedAnswer}
                  style={{ background: '#059669' }}
                >
                  Kiểm tra đáp án
                </button>
              )}

              <button
                type="button"
                className="fantasy-next-btn"
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
            <footer className="fantasy-keyboard-hints">
              <span>💡 Phím tắt:</span>
              <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> chọn đáp án ·
              <kbd>Space</kbd> xem đáp án ·
              <kbd>←</kbd> <kbd>→</kbd> chuyển câu ·
              <kbd>M</kbd> đánh dấu ·
              <kbd>G</kbd> danh sách
            </footer>
          </div>
        </section>

        {/* ----------------- RIGHT SIDEBAR: NHIỆM VỤ & THÀNH TÍCH ----------------- */}
        <aside className="fantasy-sidebar-right">
          {/* Card 1: Nhiệm vụ học tập */}
          <div className="fantasy-card-box">
            <h4 className="fantasy-box-title">
              <span>📜</span> Nhiệm Vụ Học Tập
            </h4>

            {claimedChest && (
              <div style={{ background: '#065f46', padding: 8, borderRadius: 8, fontSize: 11, marginBottom: 10, textAlign: 'center' }}>
                🎉 Mở rương thành công: {claimedChest}!
              </div>
            )}

            {/* Quest 1 */}
            <div className="fantasy-quest-item">
              <div className="fantasy-quest-row">
                <span className="fantasy-quest-title">
                  <span>🎯</span> Hoàn thành 20 câu hỏi
                </span>
                <button
                  type="button"
                  className={`fantasy-chest-btn ${claimedChests['chest1'] ? 'is-claimed' : statAnswered >= 20 ? 'is-ready' : ''}`}
                  onClick={() => handleClaimChest('chest1', 'Rương Gỗ Tri Thức', 50, statAnswered >= 20)}
                  title={claimedChests['chest1'] ? 'Đã mở nhận 50 EXP' : statAnswered >= 20 ? 'Sẵn sàng mở nhận 50 EXP!' : 'Hoàn thành 20 câu để mở khóa'}
                >
                  {claimedChests['chest1'] ? '✨' : statAnswered >= 20 ? '🎁' : '📦'}
                </button>
              </div>
              <div className="fantasy-quest-track">
                <div className="fantasy-quest-fill" style={{ width: `${Math.min(100, Math.round((statAnswered / 20) * 100))}%` }} />
              </div>
              <div className="fantasy-quest-stats">
                {Math.min(20, statAnswered)}/20 {claimedChests['chest1'] ? '· Đã nhận +50 EXP' : ''}
              </div>
            </div>

            {/* Quest 2 */}
            <div className="fantasy-quest-item">
              <div className="fantasy-quest-row">
                <span className="fantasy-quest-title">
                  <span>📅</span> Duy trì chuỗi 7 ngày
                </span>
                <button
                  type="button"
                  className={`fantasy-chest-btn ${claimedChests['chest2'] ? 'is-claimed' : streak >= 7 ? 'is-ready' : ''}`}
                  onClick={() => handleClaimChest('chest2', 'Rương Tím Hiếm', 100, streak >= 7)}
                  title={claimedChests['chest2'] ? 'Đã mở nhận 100 EXP' : streak >= 7 ? 'Sẵn sàng mở nhận 100 EXP!' : 'Chuỗi 7 ngày để mở khóa'}
                >
                  {claimedChests['chest2'] ? '✨' : streak >= 7 ? '🎁' : '🔒'}
                </button>
              </div>
              <div className="fantasy-quest-track">
                <div className="fantasy-quest-fill" style={{ width: `${Math.min(100, Math.round((streak / 7) * 100))}%` }} />
              </div>
              <div className="fantasy-quest-stats">
                {Math.min(7, streak)}/7 {claimedChests['chest2'] ? '· Đã nhận +100 EXP' : ''}
              </div>
            </div>

            {/* Quest 3 */}
            <div className="fantasy-quest-item">
              <div className="fantasy-quest-row">
                <span className="fantasy-quest-title">
                  <span>🎯</span> Đạt 80% độ chính xác
                </span>
                <button
                  type="button"
                  className={`fantasy-chest-btn ${claimedChests['chest3'] ? 'is-claimed' : (accuracyPercent >= 80 && statAnswered >= 5) ? 'is-ready' : ''}`}
                  onClick={() => handleClaimChest('chest3', 'Rương Vàng Huyền Thoại', 150, accuracyPercent >= 80 && statAnswered >= 5)}
                  title={claimedChests['chest3'] ? 'Đã mở nhận 150 EXP' : (accuracyPercent >= 80 && statAnswered >= 5) ? 'Sẵn sàng mở nhận 150 EXP!' : 'Cần trả lời ≥5 câu và đạt 80%'}
                >
                  {claimedChests['chest3'] ? '✨' : (accuracyPercent >= 80 && statAnswered >= 5) ? '🏆' : '🔒'}
                </button>
              </div>
              <div className="fantasy-quest-track">
                <div className="fantasy-quest-fill" style={{ width: `${Math.min(100, accuracyPercent)}%` }} />
              </div>
              <div className="fantasy-quest-stats">
                {accuracyPercent}/80% {claimedChests['chest3'] ? '· Đã nhận +150 EXP' : ''}
              </div>
            </div>
          </div>

          {/* Card 2: Thành tích nhanh */}
          <div className="fantasy-card-box">
            <h4 className="fantasy-box-title">
              <span>🧭</span> Thành Tích Nhanh
            </h4>

            <div className="fantasy-stats-grid">
              <div className="fantasy-stat-col">
                <span className="fantasy-stat-icon">🔥</span>
                <span className="fantasy-stat-val">{streak}</span>
                <span className="fantasy-stat-label">Chuỗi ngày</span>
              </div>

              <div className="fantasy-stat-col">
                <span className="fantasy-stat-icon">⭐</span>
                <span className="fantasy-stat-val">{xp}</span>
                <span className="fantasy-stat-label">Điểm EXP</span>
              </div>

              <div className="fantasy-stat-col">
                <span className="fantasy-stat-icon">📊</span>
                <span className="fantasy-stat-val">{rankPercent}</span>
                <span className="fantasy-stat-label">Xếp hạng</span>
              </div>
            </div>
          </div>

          {/* Card 3: Wizard Owl Companion Speech */}
          <div className="fantasy-owl-speech-card">
            <div className="fantasy-speech-bubble">
              {getOwlMessage()}
            </div>

            <div
              className="fantasy-owl-svg-wrap"
              onClick={handlePokeOwl}
              style={{ cursor: 'pointer' }}
              title="Bấm vào Cú Pháp Sư để nghe lời khuyên!"
              role="button"
              tabIndex={0}
            >
              <svg viewBox="0 0 100 100" width="76" height="76">
                {/* Book base */}
                <rect x="20" y="76" width="60" height="12" rx="4" fill="#78350f" stroke="#d97706" strokeWidth="2" />
                <rect x="24" y="80" width="52" height="4" fill="#fef3c7" />

                {/* Owl body */}
                <ellipse cx="50" cy="54" rx="24" ry="24" fill="#fed7aa" stroke="#c2410c" strokeWidth="2.5" />
                <ellipse cx="50" cy="56" rx="16" ry="17" fill="#ffedd5" />

                {/* Big cute eyes */}
                <circle cx="40" cy="48" r="8.5" fill="#ffffff" stroke="#78350f" strokeWidth="2" />
                <circle cx="60" cy="48" r="8.5" fill="#ffffff" stroke="#78350f" strokeWidth="2" />
                <circle cx="41.5" cy="48" r="4.5" fill="#1c1917" />
                <circle cx="61.5" cy="48" r="4.5" fill="#1c1917" />
                <circle cx="43" cy="46" r="1.5" fill="#ffffff" />
                <circle cx="63" cy="46" r="1.5" fill="#ffffff" />

                {/* Beak */}
                <polygon points="50,53 47,59 53,59" fill="#f59e0b" />

                {/* Wizard Hat */}
                <ellipse cx="50" cy="34" rx="28" ry="7" fill="#065f46" stroke="#d97706" strokeWidth="2" />
                <polygon points="50,8 32,33 68,33" fill="#047857" stroke="#d97706" strokeWidth="2" />
                <rect x="36" y="30" width="28" height="3" fill="#d97706" />
                <circle cx="50" cy="8" r="3" fill="#fef08a" />

                {/* Little wand with star glow */}
                <line x1="72" y1="62" x2="88" y2="38" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
                <circle cx="89" cy="36" r="4" fill="#fef08a" filter="drop-shadow(0 0 3px #f59e0b)" />
              </svg>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
