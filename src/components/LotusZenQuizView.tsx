import { useState, useEffect, useMemo } from 'react';
import type { Question } from '../utils/quizParser';
import type { QuizPlayMode } from './QuizModeBar';
import AskAI from './AskAI';
import {
  getUserXP,
  getStudyStreak,
} from '../utils/studyStats';
import LotusFlowerSvg from './LotusFlowerSvg';
import ZenTempleWatermark from './ZenTempleWatermark';
import ZenCornerFiligree from './ZenCornerFiligree';
import ZenHangingLantern from './ZenHangingLantern';
import ZenMalaBeads from './ZenMalaBeads';
import ZenTempleSeal from './ZenTempleSeal';
import ZenDharmaWheel from './ZenDharmaWheel';
import zenWoodenFishImg from '../assets/zen_wooden_fish.jpg';
import { playWoodFishSound, playClickSound } from '../utils/soundEffects';

interface QuizSplitPart {
  partIndex: number;
  name: string;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  startNumber: number;
  endNumber: number;
}

interface LotusZenQuizViewProps {
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

export default function LotusZenQuizView({
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
  masteredIds,
  answers,
  submittedIds,
  onSelectOption,
  onCheckMultiple,
  onToggleReveal,
  onToggleMastered,
  onPrev,
  onNext,
  setTitle,
  onOpenQuestionGrid,
  mistakeCount = 0,
}: LotusZenQuizViewProps) {
  const [xp, setXp] = useState(() => getUserXP());
  const [streak] = useState(() => getStudyStreak());
  const [isZenFocusMode, setIsZenFocusMode] = useState(false);
  const [isStriking, setIsStriking] = useState(false);

  // Merit counter for Wooden Fish widget
  const [merits, setMerits] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('keyt_woodfish_merits');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [floatingBlessing, setFloatingBlessing] = useState<string | null>(null);

  // Sync user XP
  useEffect(() => {
    setXp(getUserXP());
  }, [answers, submittedIds]);

  // Handle quick wooden fish strike
  const handleQuickStrike = () => {
    playWoodFishSound('warm');
    setIsStriking(true);
    setTimeout(() => setIsStriking(false), 260);

    const newMerits = merits + 1;
    setMerits(newMerits);
    try {
      localStorage.setItem('keyt_woodfish_merits', newMerits.toString());
    } catch {
      // ignore
    }

    const blessings = [
      '+1 Công Đức Vô Lượng ✨',
      '+1 Trí Tuệ Khai Sáng 🪷',
      '+1 Định Tâm Nhập Thiền 🧘',
      '+1 Vía Đậu Bảng Vàng FE 🏆',
      '+1 Thấu Triệt Nghĩa Lý 📜',
      '+1 Tâm An Vạn Sự An 🕊️',
      '+1 Vượt Qua Khảo Nghiệm ⚡',
      '+1 Tinh Tấn Không Ngừng ☸️',
    ];
    const picked = blessings[Math.floor(Math.random() * blessings.length)];
    setFloatingBlessing(picked);
    setTimeout(() => setFloatingBlessing(null), 1500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key) && !isAnswered) {
        onSelectOption(key);
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        if (!isMultipleChoice || isAnswered) {
          e.preventDefault();
          onNext();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (key === 'M') {
        onToggleMastered(question.id);
      } else if (key === 'G') {
        onOpenQuestionGrid();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, onSelectOption, onNext, onPrev, isMultipleChoice, question.id, onToggleMastered, onOpenQuestionGrid]);

  const progressPercent = useMemo(() => {
    return totalCount > 0 ? Math.round((masteredIds.length / questions.length) * 100) : 0;
  }, [masteredIds.length, questions.length, totalCount]);

  return (
    <div className={`quiz-zen-sanctuary-view ${isZenFocusMode ? 'is-focus-mode' : ''}`}>
      {/* Background Watermark */}
      <div className="zen-view-watermark-wrap" style={{ position: 'fixed', top: '20%', right: '5%', pointerEvents: 'none', zIndex: 0, opacity: 0.04 }}>
        <ZenTempleWatermark size={650} color="#D8B36A" opacity={0.06} />
      </div>

      {/* Flanking Temple Lanterns */}
      {!isZenFocusMode && (
        <>
          <div className="zen-flank-lantern left" style={{ position: 'fixed', top: 120, left: 16, zIndex: 10, pointerEvents: 'none' }}>
            <ZenHangingLantern size={52} />
          </div>
          <div className="zen-flank-lantern right" style={{ position: 'fixed', top: 120, right: 16, zIndex: 10, pointerEvents: 'none' }}>
            <ZenHangingLantern size={52} />
          </div>
        </>
      )}

      <div className="zen-quiz-columns-grid">
        {/* ==================================================================
            LEFT COLUMN: LỘ TRÌNH TU HỌC & MÕ GỖ CHÁNH NIỆM
            ================================================================== */}
        {!isZenFocusMode && (
          <aside className="zen-left-column">
            {/* Roadmap / Parts Panel */}
            <div className="zen-side-card has-corners">
              <ZenCornerFiligree position="top-left" size={28} />
              <ZenCornerFiligree position="top-right" size={28} />
              <div className="zen-side-header">
                <LotusFlowerSvg size={22} color="#D8B36A" />
                <h3 className="zen-side-title">Lộ Trình Tu Học</h3>
              </div>

              {splitEnabled && parts.length > 0 ? (
                <div className="zen-parts-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {parts.map((p, idx) => {
                    const isPartCurrent = idx === currentPartIndex;
                    return (
                      <button
                        key={p.partIndex}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          onSwitchPart(idx);
                        }}
                        style={{
                          background: isPartCurrent ? 'linear-gradient(135deg, rgba(167, 118, 54, 0.35) 0%, rgba(123, 48, 38, 0.45) 100%)' : 'rgba(255, 255, 255, 0.04)',
                          border: isPartCurrent ? '1.5px solid #D8B36A' : '1px solid rgba(167, 118, 54, 0.25)',
                          borderRadius: 12,
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: isPartCurrent ? '#FFF8EC' : '#E7DDD0',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: isPartCurrent ? 800 : 600 }}>
                          {isPartCurrent ? '🪷 ' : ''}{p.name}
                        </span>
                        <span style={{ fontSize: 11, opacity: 0.75 }}>
                          {p.startNumber} - {p.endNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="zen-parts-simple" style={{ fontSize: 13.5, color: '#E7DDD0', lineHeight: 1.6 }}>
                  <p>Toàn bộ <strong>{questions.length}</strong> câu hỏi trong pho sách <strong>{setTitle || 'Đề thi'}</strong>.</p>
                  <button
                    type="button"
                    className="zen-btn-action secondary"
                    onClick={() => {
                      if (onJumpToQuestion) onJumpToQuestion(currentIndex);
                      onOpenQuestionGrid();
                    }}
                    style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
                  >
                    📑 Mở danh sách câu (Phím G)
                  </button>
                </div>
              )}
            </div>

            {/* Quick Wooden Fish Mindfulness Widget with Authentic 3D Carved Mõ Gỗ */}
            <div className="zen-woodenfish-card has-corners">
              <ZenCornerFiligree position="top-left" size={24} />
              <ZenCornerFiligree position="top-right" size={24} />

              <div
                className={`zen-woodenfish-avatar-wrap ${isStriking ? 'is-striking' : ''}`}
                onClick={handleQuickStrike}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleQuickStrike();
                  }
                }}
                title="Nhấn chuột để gõ mõ tích công đức tu học"
                style={{
                  position: 'relative',
                  width: 112,
                  height: 112,
                  margin: '0 auto 8px',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(216, 179, 106, 0.3) 0%, rgba(59, 32, 20, 0.8) 65%, transparent 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(216, 179, 106, 0.25)',
                  transition: 'transform 0.12s ease',
                  transform: isStriking ? 'scale(0.92) rotate(-3deg)' : 'scale(1)',
                }}
              >
                <img
                  src={zenWoodenFishImg}
                  alt="Mõ Gỗ Tu Tâm"
                  style={{
                    width: 98,
                    height: 98,
                    objectFit: 'contain',
                    borderRadius: 18,
                    filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.6))',
                  }}
                />
                {/* Floating incense smoke wisp */}
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: 8,
                    fontSize: 16,
                    opacity: 0.85,
                    pointerEvents: 'none',
                    animation: 'zenSmokeFloat 2.6s infinite ease-out',
                  }}
                >
                  💨
                </span>
              </div>

              <div style={{ fontSize: 15, fontWeight: 800, color: '#D8B36A', fontFamily: 'var(--theme-font-heading)' }}>
                Mõ Gỗ Tu Tâm
              </div>
              <div style={{ fontSize: 12, color: '#E7DDD0', marginTop: 4 }}>
                Công đức tích lũy: <strong style={{ color: '#FDE68A', fontSize: 14 }}>{merits.toLocaleString()}</strong>
              </div>

              {floatingBlessing && (
                <div style={{
                  color: '#FDE047',
                  fontSize: 13,
                  fontWeight: 800,
                  margin: '8px 0',
                  animation: 'themeSlideUp 0.3s ease-out',
                  textShadow: '0 0 8px rgba(245, 158, 11, 0.6)',
                }}>
                  {floatingBlessing}
                </div>
              )}

              <button
                type="button"
                className="zen-woodenfish-btn"
                onClick={handleQuickStrike}
              >
                🔔 Gõ Mõ Tích Đức (+1)
              </button>
            </div>

            {/* Zen Inspiring Reflection */}
            <div className="zen-side-card" style={{ marginTop: 16, background: 'rgba(59, 32, 20, 0.7)' }}>
              <div style={{ fontSize: 12.5, color: '#F7ECD6', fontStyle: 'italic', lineHeight: 1.7, textAlign: 'center' }}>
                "Tâm an vạn sự an — Từng bước thong dong trên con đường trí tuệ."
              </div>
            </div>
          </aside>
        )}

        {/* ==================================================================
            CENTER COLUMN: GIẤY THI LIÊN HOA (PARCHMENT QUESTION PAPER)
            ================================================================== */}
        <main className="zen-center-column">
          <div className="zen-question-paper has-deckled-corners">
            {/* 4 Sacred Pagoda Eave Corner Brackets */}
            <ZenCornerFiligree position="top-left" size={44} className="zen-card-corner top-left" />
            <ZenCornerFiligree position="top-right" size={44} className="zen-card-corner top-right" />
            <ZenCornerFiligree position="bottom-left" size={44} className="zen-card-corner bottom-left" />
            <ZenCornerFiligree position="bottom-right" size={44} className="zen-card-corner bottom-right" />

            {/* Top Row: Tag + Question Number + Mastered Action */}
            <div className="zen-q-badge-row">
              <div className="zen-q-badge">
                <LotusFlowerSvg size={18} color="#A77636" />
                <span>CÂU #{relativeIndex + 1} / {totalCount}</span>
                {splitEnabled && currentPart && (
                  <span style={{ opacity: 0.7, marginLeft: 4 }}>· {currentPart.name}</span>
                )}
                {isUnresolved && (
                  <span style={{ fontSize: 11, background: 'rgba(239, 68, 68, 0.15)', color: '#B91C1C', padding: '2px 8px', borderRadius: 999, fontWeight: 700, marginLeft: 6 }}>
                    Chưa giải
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <ZenTempleSeal size={36} text="TU TÂM KHAI TRÍ" />
                <button
                  type="button"
                  onClick={() => onToggleMastered(question.id)}
                  style={{
                    background: isMastered ? '#FEF3C7' : '#F7ECD6',
                    border: isMastered ? '1.5px solid #A77636' : '1px solid rgba(167, 118, 54, 0.4)',
                    color: isMastered ? '#78350F' : '#6B5B4D',
                    borderRadius: 10,
                    padding: '5px 12px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.2s ease',
                  }}
                  title="Đánh dấu câu đã thuộc thành thạo (Phím M)"
                >
                  {isMastered ? '🌟 Đã thuộc' : '◯ Chưa thuộc'}
                </button>
              </div>
            </div>

            {/* Sacred Bodhi Mala Beads Progress Divider */}
            <ZenMalaBeads count={12} activeIndex={relativeIndex % 12} className="zen-mala-divider" />

            {/* Question Text */}
            <div className="zen-q-text">
              {question.text}
            </div>

            {/* Ask AI Assistant */}
            <div style={{ marginBottom: 20 }}>
              <AskAI question={question} />
            </div>

            {/* Answer Options */}
            <div className="zen-options-list">
              {question.options.map((opt) => {
                const optKey = opt.key.toUpperCase();
                const isSelected = selectedAnswer?.includes(optKey);
                const isCorrect = isAnswered && optKey === question.correctAnswer.trim().toUpperCase();
                const isWrong = isAnswered && isSelected && !isCorrect;

                let btnClass = 'zen-option-btn';
                if (isCorrect) btnClass += ' is-correct';
                else if (isWrong) btnClass += ' is-wrong';
                else if (isSelected) btnClass += ' is-selected';

                return (
                  <button
                    key={opt.key}
                    type="button"
                    className={btnClass}
                    disabled={isAnswered}
                    onClick={() => {
                      playClickSound();
                      onSelectOption(opt.key);
                    }}
                  >
                    <span className="zen-opt-key">
                      {isCorrect ? '✓' : isWrong ? '✗' : opt.key}
                    </span>
                    <span style={{ flex: 1 }}>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Multiple Choice Submit Action */}
            {isMultipleChoice && !isAnswered && (
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <button
                  type="button"
                  className="zen-btn-action primary"
                  disabled={!selectedAnswer}
                  onClick={onCheckMultiple}
                >
                  Kiểm tra đáp án đã chọn 🎯
                </button>
              </div>
            )}

            {/* Revealed Answer Box */}
            {isRevealed && (
              <div style={{
                marginTop: 20,
                padding: '14px 18px',
                background: '#FEF3C7',
                border: '1.5px solid #F59E0B',
                borderRadius: 14,
                color: '#78350F',
                fontSize: 14,
                lineHeight: 1.6,
              }}>
                <strong>ĐÁP ÁN ĐÚNG:</strong> {question.correctAnswer}
                {(question as any).explanation && (
                  <div style={{ marginTop: 6, fontSize: 13.5, color: '#92400E' }}>
                    {(question as any).explanation}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Bottom Row */}
            <div className="zen-nav-bottom-row">
              <button
                type="button"
                className="zen-btn-action secondary"
                onClick={onPrev}
                disabled={currentIndex === 0}
              >
                ← Câu trước
              </button>

              <button
                type="button"
                className="zen-btn-action secondary"
                onClick={onToggleReveal}
              >
                {isRevealed ? 'Ẩn đáp án 🙈' : 'Xem đáp án 👁️'}
              </button>

              <button
                type="button"
                className="zen-btn-action primary"
                onClick={onNext}
              >
                {currentIndex >= questions.length - 1 ? 'Xem kết quả 🏆' : 'Câu tiếp theo →'}
              </button>
            </div>
          </div>
        </main>

        {/* ==================================================================
            RIGHT COLUMN: THỐNG KÊ TIẾN ĐỘ & ZEN FOCUS
            ================================================================== */}
        {!isZenFocusMode && (
          <aside className="zen-right-column">
            {/* Progress Circular Card */}
            <div className="zen-side-card has-corners">
              <ZenCornerFiligree position="top-left" size={28} />
              <ZenCornerFiligree position="top-right" size={28} />
              <div className="zen-side-header">
                <LotusFlowerSvg size={22} color="#D8B36A" />
                <h3 className="zen-side-title">Tiến Độ Tu Học</h3>
              </div>

              <div style={{ textAlign: 'center', margin: '14px 0' }}>
                <ZenDharmaWheel progress={progressPercent} size={94} />
                <div style={{ fontSize: 13, color: '#E7DDD0', marginTop: 10 }}>
                  Đã tinh thông <strong style={{ color: '#FDE68A' }}>{masteredIds.length}</strong> / {questions.length} câu
                </div>
              </div>

              {/* Stats Rack */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(167, 118, 54, 0.3)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#FDE047' }}>🔥 {streak}</div>
                  <div style={{ fontSize: 11, color: '#E7DDD0', marginTop: 2 }}>Chuỗi ngày</div>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(167, 118, 54, 0.3)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#38BDF8' }}>⭐ {xp}</div>
                  <div style={{ fontSize: 11, color: '#E7DDD0', marginTop: 2 }}>Điểm XP</div>
                </div>
              </div>

              {/* Mistakes summary pill */}
              {mistakeCount > 0 && (
                <div style={{
                  marginTop: 14,
                  padding: '8px 12px',
                  background: 'rgba(123, 48, 38, 0.4)',
                  border: '1px solid #7B3026',
                  borderRadius: 12,
                  fontSize: 12.5,
                  color: '#FCA5A5',
                  textAlign: 'center',
                }}>
                  ⚠️ Có <strong>{mistakeCount}</strong> câu cần phục thù
                </div>
              )}
            </div>

            {/* Zen Focus Mode Toggle Card */}
            <div className="zen-side-card" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#D8B36A' }}>Chế Độ Thiền Định</div>
                  <div style={{ fontSize: 11.5, color: '#E7DDD0', marginTop: 2 }}>Ẩn bớt thanh bên để tập trung</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsZenFocusMode(!isZenFocusMode)}
                  style={{
                    background: isZenFocusMode ? '#D8B36A' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid #D8B36A',
                    color: isZenFocusMode ? '#1E120D' : '#D8B36A',
                    borderRadius: 999,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {isZenFocusMode ? 'BẬT' : 'TẮT'}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Floating Focus Mode Exit button when active */}
      {isZenFocusMode && (
        <button
          type="button"
          onClick={() => setIsZenFocusMode(false)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #7B3026 0%, #A77636 100%)',
            border: '1.5px solid #D8B36A',
            color: '#FFF8EC',
            padding: '10px 18px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            zIndex: 100,
          }}
        >
          ✕ Thoát Chế Độ Thiền Định
        </button>
      )}
    </div>
  );
}
