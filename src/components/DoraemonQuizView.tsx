import { useState, useEffect, useRef, useCallback } from 'react';
import type { Question } from '../utils/quizParser';
import { isAnswerTextSelection } from '../utils/quizTextSelection';
import {
  getFocusMode,
  setFocusMode,
  getStudyStreak,
  getUserXP,
  calculateLevel,
  getUserDorayaki,
  addUserDorayaki,
  type DoraemonSceneId,
} from '../utils/studyStats';
import {
  playDoraemonGadgetSound,
  playDoraemonBellSound,
} from '../utils/soundEffects';
import { useTheme } from '../context/ThemeContext';
import type { QuizPlayMode } from './QuizModeBar';
import AskAI from './AskAI';
import QuestionImages from './QuestionImages';
import DoraemonMascot, { type DoraemonMood } from './DoraemonMascot';
import { useQuizSwipe } from '../utils/useQuizSwipe';
import doraemonBgStarry from '../assets/doraemon_bg_starry.jpg';
import doraemonBgSky from '../assets/doraemon_bg_sky.jpg';
import doraemonBgRoom from '../assets/doraemon_bg_room.jpg';
import './DoraemonTheme.css';

interface QuizSplitPart {
  partIndex: number;
  name: string;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  startNumber: number;
  endNumber: number;
}

export interface DoraemonQuizViewProps {
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
  selectedAnswer: string | undefined;
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
  onToggleMastered: (qId: number) => void;
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

interface SceneMeta {
  id: DoraemonSceneId;
  icon: string;
  label: string;
  bg: string;
  isDark: boolean;
}

const DORAEMON_SCENES: SceneMeta[] = [
  { id: 'starry', icon: '🌌', label: 'Đồi Sao', bg: doraemonBgStarry, isDark: true },
  { id: 'sky', icon: '☁️', label: 'Bầu Trời', bg: doraemonBgSky, isDark: false },
  { id: 'room', icon: '🚪', label: 'Phòng Nobita', bg: doraemonBgRoom, isDark: false },
];

interface GadgetItem {
  id: string;
  icon: string;
  name: string;
  effect: string;
}

const GADGETS_22C: GadgetItem[] = [
  { id: 'bread', icon: '🍞', name: 'Bánh Mì Ghi Nhớ', effect: 'Ghi nhớ 100% đáp án vào trí nhớ dài hạn!' },
  { id: 'copter', icon: '🚁', name: 'Chong Chóng Tre', effect: 'Tăng tốc bay thẳng tới GPA 4.0 xuất sắc!' },
  { id: 'door', icon: '🚪', name: 'Cánh Cửa Thần Kỳ', effect: 'Mở lối tắt đi thẳng vào phòng thi trúng tủ!' },
  { id: 'dorayaki', icon: '🥞', name: 'Bánh Rán Dorayaki', effect: 'Hồi phục +100% tinh thần học tập cực chill!' },
  { id: 'light', icon: '🔦', name: 'Đèn Pin Thu Nhỏ', effect: 'Thu nhỏ mọi áp lực & câu hỏi khó thành tí hon!' },
  { id: 'clock', icon: '🕰️', name: 'Cỗ Máy Thời Gian', effect: 'Du hành tương lai xem trước kết quả Pass Môn!' },
];

const CELEBRATION_FLOATERS = Array.from({ length: 12 }, (_, idx) => ({
  id: idx,
  icon: idx % 3 === 0 ? '🥞' : idx % 3 === 1 ? '⭐' : '🔔',
  left: 8 + ((idx * 7.8) % 84),
  delay: (idx % 5) * 0.1,
  duration: 1.9 + (idx % 3) * 0.3,
}));

export default function DoraemonQuizView({
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
}: DoraemonQuizViewProps) {
  const { mouseEffectsEnabled, doraemonScene, setDoraemonScene } = useTheme();
  const [isFocus, setIsFocus] = useState(() => getFocusMode());
  const [xp, setXp] = useState(() => getUserXP());
  const [streak, setStreak] = useState(() => getStudyStreak());
  const [dorayaki, setDorayaki] = useState(() => getUserDorayaki());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Interactive 4D Pocket Gadget Pull & Anywhere Door Celebration
  const [activeGadgetIdx, setActiveGadgetIdx] = useState(0);
  const [pocketBeamKey, setPocketBeamKey] = useState(0);
  const [sessionCombo, setSessionCombo] = useState(0);
  const [fxBanner, setFxBanner] = useState<{ type: 'correct' | 'wrong'; label: string; key: number } | null>(null);
  const [doorCelebration, setDoorCelebration] = useState<{ title: string; subtitle: string; key: number } | null>(null);

  const lastEvaluatedQRef = useRef<string>('');
  const celebratedMilestonesRef = useRef<Set<string>>(new Set());
  const fxTimerRef = useRef<number | null>(null);
  const doorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleSync = () => {
      setXp(getUserXP());
      setStreak(getStudyStreak());
      setDorayaki(getUserDorayaki());
    };
    window.addEventListener('keyt-xp-changed', handleSync);
    window.addEventListener('keyt-xp-earned', handleSync);
    window.addEventListener('keyt-streak-changed', handleSync);
    window.addEventListener('keyt-dorayaki-changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('keyt-xp-changed', handleSync);
      window.removeEventListener('keyt-xp-earned', handleSync);
      window.removeEventListener('keyt-streak-changed', handleSync);
      window.removeEventListener('keyt-dorayaki-changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const launchAnywhereDoor = useCallback((title: string, subtitle: string) => {
    playDoraemonGadgetSound(false);
    setDoorCelebration({ title, subtitle, key: Date.now() });
    if (doorTimerRef.current) clearTimeout(doorTimerRef.current);
    doorTimerRef.current = window.setTimeout(() => {
      setDoorCelebration(null);
    }, 2700);
  }, []);

  const pullRandomGadget = useCallback((withSound = true) => {
    if (withSound) playDoraemonGadgetSound(true);
    setActiveGadgetIdx((prev) => (prev + 1) % GADGETS_22C.length);
    setPocketBeamKey((k) => k + 1);
    const nextCount = addUserDorayaki(1);
    setDorayaki(nextCount);
    window.dispatchEvent(new CustomEvent('theme-particle-burst'));
  }, []);

  // Compute live stats for active set/part
  const activeQuestions =
    splitEnabled && currentPart
      ? questions.slice(currentPart.startIndex, currentPart.endIndex + 1)
      : questions;

  const statTotal = activeQuestions.length;
  const statMastered = activeQuestions.filter((q) => masteredIds.includes(q.id)).length;
  const isQSubmitted = (q: Question) =>
    !q.freeResponse && q.correctAnswer !== '?' && q.correctAnswer.length > 1
      ? submittedIds.includes(q.id)
      : answers[q.id] !== undefined;
  const statAnswered = activeQuestions.filter(isQSubmitted).length;
  const statCorrect = activeQuestions.filter(
    (q) => isQSubmitted(q) && answers[q.id] === q.correctAnswer
  ).length;
  const statWrong = activeQuestions.filter(
    (q) => isQSubmitted(q) && answers[q.id] && answers[q.id] !== q.correctAnswer
  ).length;
  const statUnanswered = Math.max(0, statTotal - statAnswered);

  const masteredPercent = statTotal > 0 ? Math.round((statMastered / statTotal) * 100) : 0;
  const accuracyPercent = statAnswered > 0 ? Math.round((statCorrect / statAnswered) * 100) : 0;
  const levelInfo = calculateLevel(xp);
  const xpProgressPercent = Math.min(100, Math.round((levelInfo.currentLevelXp / levelInfo.nextLevelXp) * 100));

  // React to answer submission with Dorayaki reward, 4D gadget pop, and Anywhere Door milestone
  useEffect(() => {
    if (!isAnswered || isUnresolved || isFreeResponse) return;
    const evalKey = `${question.id}:${selectedAnswer ?? ''}`;
    if (lastEvaluatedQRef.current === evalKey) return;
    lastEvaluatedQRef.current = evalKey;

    const isRight = selectedAnswer === question.correctAnswer;

    if (fxTimerRef.current) clearTimeout(fxTimerRef.current);

    if (isRight) {
      const nextCombo = sessionCombo + 1;
      setSessionCombo(nextCombo);

      const bonusDorayaki = nextCombo >= 5 ? 3 : nextCombo >= 3 ? 2 : 1;
      const updated = addUserDorayaki(bonusDorayaki);
      setDorayaki(updated);
      setActiveGadgetIdx((prev) => (prev + 1) % GADGETS_22C.length);
      setPocketBeamKey((k) => k + 1);

      setFxBanner({
        type: 'correct',
        label:
          nextCombo >= 3
            ? `TÈN TÉN TEN! COMBO x${nextCombo} (+${bonusDorayaki} 🥞)`
            : `+1 Bánh Rán Dorayaki 🥞`,
        key: Date.now(),
      });

      if (nextCombo === 3 || nextCombo === 5 || nextCombo === 10) {
        launchAnywhereDoor(
          `COMBO x${nextCombo} · BÁNH MÌ GHI NHỚ!`,
          `Thưởng +${bonusDorayaki} Bánh Rán Dorayaki · Trí nhớ đạt chuẩn thế kỷ 22!`
        );
      } else {
        playDoraemonBellSound(false);
      }
    } else {
      setSessionCombo(0);
      setFxBanner({
        type: 'wrong',
        label: 'Úi! Đọc lại đáp án cùng Doraemon nhé 👀',
        key: Date.now(),
      });
    }

    fxTimerRef.current = window.setTimeout(() => setFxBanner(null), 1650);
  }, [isAnswered, isUnresolved, isFreeResponse, question.id, question.correctAnswer, selectedAnswer, sessionCombo, launchAnywhereDoor]);

  // 50% and 100% progress Anywhere Door celebrations
  useEffect(() => {
    if (masteredPercent >= 100 && statTotal > 0 && !celebratedMilestonesRef.current.has('100')) {
      celebratedMilestonesRef.current.add('100');
      addUserDorayaki(10);
      launchAnywhereDoor('HOÀN THÀNH 100% BỘ ĐỀ!', 'Cánh Cửa Thần Kỳ mở thẳng tới điểm A+ (+10 🥞)');
    } else if (masteredPercent >= 50 && statTotal > 4 && !celebratedMilestonesRef.current.has('50')) {
      celebratedMilestonesRef.current.add('50');
      addUserDorayaki(5);
      launchAnywhereDoor('ĐẠT 50% CHẶNG ĐƯỜNG!', 'Thưởng nóng +5 Bánh Rán Dorayaki tiếp sức!');
    }
  }, [masteredPercent, statTotal, launchAnywhereDoor]);

  useEffect(() => {
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
      if (doorTimerRef.current) clearTimeout(doorTimerRef.current);
    };
  }, []);

  const toggleFocus = () => {
    const next = !isFocus;
    setIsFocus(next);
    setFocusMode(next);
  };

  const activeSceneMeta = DORAEMON_SCENES.find((s) => s.id === doraemonScene) || DORAEMON_SCENES[0];
  const currentGadget = GADGETS_22C[activeGadgetIdx];

  // Progress donut SVG
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (masteredPercent / 100) * circumference;

  const progressRatio = totalCount > 0 ? Math.min(100, Math.round(((relativeIndex + 1) / totalCount) * 100)) : 0;

  let mascotMood: DoraemonMood = 'idle';
  if (doorCelebration || sessionCombo >= 3) mascotMood = 'excited';
  else if (isAnswered && !isUnresolved && selectedAnswer === question.correctAnswer) mascotMood = 'happy';
  else if (isAnswered && !isUnresolved && selectedAnswer !== question.correctAnswer) mascotMood = 'wrong';

  const swipeHandlers = useQuizSwipe({
    onSwipeLeft: onNext,
    onSwipeRight: onPrev,
    enabled: !isFreeResponse,
  });

  return (
    <div
      className={`doraemon-theme-root scene-${doraemonScene} ${
        activeSceneMeta.isDark ? 'is-dark-scene' : 'is-bright-scene'
      } ${isFocus ? 'is-focus-active' : ''} ${mouseEffectsEnabled ? 'fx-enabled' : 'fx-disabled'}`}
    >
      {/* 1. 3-Scene Nostalgic Anime Parallax Backdrop + Shooting Stars / Clouds */}
      <div className="doraemon-stage-backdrop" aria-hidden="true">
        <div
          className="doraemon-stage-wallpaper"
          style={{ backgroundImage: `url(${activeSceneMeta.bg})` }}
        />
        <div className="doraemon-stage-scrim" />

        {/* Animated Sky Layer: Shooting Stars on Starry Hill, Drifting Clouds & Take-copters on Bright Scenes */}
        {mouseEffectsEnabled && doraemonScene === 'starry' && (
          <div className="doraemon-starry-fx">
            <span className="doraemon-shooting-star s1" />
            <span className="doraemon-shooting-star s2" />
            <span className="doraemon-shooting-star s3" />
            <span className="doraemon-shooting-star s4" />
            <span className="doraemon-firefly f1" />
            <span className="doraemon-firefly f2" />
            <span className="doraemon-firefly f3" />
            <span className="doraemon-firefly f4" />
            <span className="doraemon-firefly f5" />
          </div>
        )}

        {mouseEffectsEnabled && doraemonScene !== 'starry' && (
          <div className="doraemon-day-fx">
            <span className="doraemon-drift-cloud c1" />
            <span className="doraemon-drift-cloud c2" />
            <span className="doraemon-ambient-bell ab1">🔔</span>
            <span className="doraemon-ambient-bell ab2">🥞</span>
            <span className="doraemon-ambient-bell ab3">✨</span>
          </div>
        )}
      </div>

      {/* 2. Anywhere Door (Cánh Cửa Thần Kỳ) 3D Swing-Open Celebration Overlay */}
      {doorCelebration && (
        <div key={doorCelebration.key} className="doraemon-door-overlay" aria-hidden="true">
          {CELEBRATION_FLOATERS.map((fl) => (
            <span
              key={fl.id}
              className="doraemon-celebration-floater"
              style={{
                left: `${fl.left}%`,
                animationDelay: `${fl.delay}s`,
                animationDuration: `${fl.duration}s`,
              }}
            >
              {fl.icon}
            </span>
          ))}

          <div className="doraemon-door-banner">
            {/* Animated Pink Anywhere Door Miniature */}
            <div className="doraemon-mini-door-frame">
              <div className="doraemon-mini-door-portal" />
              <div className="doraemon-mini-door-leaf">
                <span className="doraemon-mini-door-knob" />
              </div>
            </div>
            <div className="doraemon-door-copy">
              <div className="doraemon-door-eyebrow">🚪 CÁNH CỬA THẦN KỲ · THẾ KỶ 22</div>
              <div className="doraemon-door-title">{doorCelebration.title}</div>
              <div className="doraemon-door-sub">{doorCelebration.subtitle}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main 3-Column Study Grid */}
      <div className="doraemon-body-layout">
        {/* LEFT SIDEBAR: Tiến độ Đồi Sao, Chuỗi Học & Tỷ Lệ Chuẩn */}
        <aside className="doraemon-sidebar-left">
          <div className="doraemon-widget-card">
            <div className="doraemon-widget-head">
              <span className="doraemon-widget-title">🌌 Tiến Độ Ôn Thi</span>
              <span className="doraemon-pill-badge">{masteredPercent}%</span>
            </div>

            <div className="doraemon-donut-wrap">
              <svg viewBox="0 0 96 96" className="doraemon-donut-svg">
                <circle cx="48" cy="48" r={radius} className="doraemon-donut-bg" />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="doraemon-donut-fill"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="doraemon-donut-center">
                <span className="doraemon-donut-num">{masteredPercent}%</span>
                <span className="doraemon-donut-sub">thuộc bài</span>
              </div>
            </div>

            <div className="doraemon-stat-list">
              <div className="doraemon-stat-row">
                <span className="d-dot dot-sky" />
                <span>Đã thuộc</span>
                <strong>{statMastered}/{statTotal}</strong>
              </div>
              <div className="doraemon-stat-row">
                <span className="d-dot dot-green" />
                <span>Trả lời đúng</span>
                <strong>{statCorrect}</strong>
              </div>
              <div className="doraemon-stat-row">
                <span className="d-dot dot-red" />
                <span>Cần ôn lại</span>
                <strong>{statWrong}</strong>
              </div>
              <div className="doraemon-stat-row">
                <span className="d-dot dot-muted" />
                <span>Chưa làm</span>
                <strong>{statUnanswered}</strong>
              </div>
            </div>
          </div>

          <div className="doraemon-widget-card">
            <div className="doraemon-widget-head">
              <span className="doraemon-widget-title">🥞 Kho Bánh Rán</span>
              <span className="doraemon-dorayaki-chip">{dorayaki} chiếc</span>
            </div>
            <div className="doraemon-streak-row">
              <div className="doraemon-streak-icon">🔥</div>
              <div>
                <div className="doraemon-streak-days">
                  {streak > 0 ? `${streak} ngày chăm chỉ` : 'Bắt đầu hành trình'}
                </div>
                <div className="doraemon-streak-sub">
                  {sessionCombo >= 2
                    ? `Combo x${sessionCombo} đang bay cao! 🚁`
                    : 'Đúng 3 câu liền mở Cánh Cửa Thần Kỳ!'}
                </div>
              </div>
            </div>
          </div>

          <div className="doraemon-widget-card">
            <div className="doraemon-widget-head">
              <span className="doraemon-widget-title">🎯 Độ Chính Xác</span>
              <span className="doraemon-muted-val">{statCorrect}/{statAnswered}</span>
            </div>
            <div className="doraemon-acc-num">{accuracyPercent}%</div>
            <div className="doraemon-acc-bar">
              <div className="doraemon-acc-fill" style={{ width: `${accuracyPercent}%` }} />
            </div>
            <div className="doraemon-xp-foot">
              <span>Lv.{levelInfo.level} · {xp} XP</span>
              <span>Còn {levelInfo.remainingXp} XP</span>
            </div>
            <div className="doraemon-xp-mini-bar">
              <div className="doraemon-xp-mini-fill" style={{ width: `${xpProgressPercent}%` }} />
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Take-copter Progress Track + Doraemon 4D Question Card */}
        <section className="doraemon-center-column">
          {/* Spinning Take-copter Glider Progress Bar */}
          <div className="doraemon-progress-bar-wrap">
            <div className="doraemon-progress-track">
              <div className="doraemon-progress-fill" style={{ width: `${progressRatio}%` }}>
                <span className="doraemon-progress-glider" title={`Câu ${relativeIndex + 1}/${totalCount}`}>
                  🔔
                </span>
              </div>
            </div>
            <span className="doraemon-progress-pct">{progressRatio}%</span>
          </div>

          {/* Mobile Compact Quick Bar */}
          <div className="doraemon-mobile-bar">
            <button
              type="button"
              className="doraemon-mobile-stat-btn"
              onClick={() => setMobileDrawerOpen((v) => !v)}
            >
              <span>🔔 {dorayaki} 🥞 · {masteredPercent}% · Lv.{levelInfo.level}</span>
              <span>{mobileDrawerOpen ? '▲' : '▼'}</span>
            </button>
          </div>

          {mobileDrawerOpen && (
            <div className="doraemon-mobile-drawer">
              <div className="doraemon-scene-pills">
                {DORAEMON_SCENES.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    className={`doraemon-scene-pill ${doraemonScene === sc.id ? 'is-active' : ''}`}
                    onClick={() => setDoraemonScene(sc.id)}
                  >
                    <span>{sc.icon}</span>
                    <span>{sc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Doraemon Quiz Card */}
          <article
            key={currentIndex}
            className={`doraemon-question-card ${
              slideDirection === 'next'
                ? 'slide-in-next'
                : slideDirection === 'prev'
                ? 'slide-in-prev'
                : ''
            } ${fxBanner?.type === 'wrong' ? 'is-wobble-shake' : ''}`}
            {...swipeHandlers}
          >
            {/* Signature Doraemon Red Collar Top Ribbon with Tiny Golden Bell */}
            <div className="doraemon-card-collar-ribbon" aria-hidden="true">
              <span className="doraemon-collar-bell" />
            </div>

            {/* Pop Feedback Badge */}
            {fxBanner && (
              <div
                key={fxBanner.key}
                className={`doraemon-fx-pop-badge is-${fxBanner.type}`}
                aria-hidden="true"
              >
                {fxBanner.label}
              </div>
            )}

            {/* Question Header */}
            <div className="doraemon-q-header">
              <div className="doraemon-q-left-meta">
                <div className="doraemon-q-num-pill">
                  CÂU {relativeIndex + 1} <span className="doraemon-q-total">/ {totalCount}</span>
                </div>
                {splitEnabled && currentPart && (
                  <span className="doraemon-q-part-chip">
                    {currentPart.name} · #{currentIndex + 1}/{questions.length}
                  </span>
                )}
              </div>

              <button
                type="button"
                className={`doraemon-mastered-btn ${isMastered ? 'is-mastered' : ''}`}
                onClick={() => onToggleMastered(question.id)}
                title="Đánh dấu câu này đã thuộc (Phím tắt: M)"
              >
                <span>{isMastered ? '⭐' : '☆'}</span>
                <span>{isMastered ? 'Đã thuộc làu' : 'Đánh dấu đã học'}</span>
              </button>
            </div>

            {/* Question Text */}
            <h2
              className="doraemon-question-text"
              data-hover-translate={question.text}
              data-hover-translate-kind="question"
            >
              {question.text}
            </h2>
            <QuestionImages images={question.images} />

            {/* Options / Free Response */}
            {isFreeResponse ? (
              <div className="doraemon-free-wrap">
                <label htmlFor={`doraemon-free-${question.id}`} className="doraemon-free-label">
                  Nhập câu trả lời của bạn:
                </label>
                <textarea
                  id={`doraemon-free-${question.id}`}
                  value={selectedAnswer ?? ''}
                  onChange={(e) => onSelectOption(e.target.value)}
                  placeholder="Nhập đáp án..."
                  rows={3}
                  className="doraemon-free-textarea"
                />
              </div>
            ) : (
              <div className="doraemon-options-stack">
                {question.options.map((opt) => {
                  const isSelected = selectedAnswer?.includes(opt.key) ?? false;
                  const isCorrect = question.correctAnswer.includes(opt.key);

                  let cardClass = 'doraemon-option-card';
                  if (isSelected && !isAnswered) cardClass += ' is-selected';
                  if ((isAnswered || isRevealed) && !isUnresolved) {
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
                      <span className="doraemon-option-key">{opt.key}</span>
                      <span className="doraemon-option-text" data-hover-translate={opt.text}>
                        {opt.text}
                      </span>

                      {(isAnswered || isRevealed) && !isUnresolved && isCorrect && (
                        <span className="doraemon-option-status correct">✓</span>
                      )}
                      {(isAnswered || isRevealed) && isSelected && !isUnresolved && !isCorrect && (
                        <span className="doraemon-option-status incorrect">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Feedback Box */}
            {(isAnswered || isRevealed) && (
              <div
                className={`doraemon-feedback-box ${
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
                    <span>
                      🥞 Tèn tén ten! Chính xác tuyệt đối — thưởng ngay Bánh Rán Dorayaki &amp; +35 XP!
                    </span>
                  ) : (
                    <span>
                      👀 Úi chưa đúng rồi! Đáp án chuẩn là: <strong>{question.correctAnswer}</strong> — lưu vào Trí Nhớ nhé!
                    </span>
                  )
                ) : (
                  <span>
                    🍞 Bánh Mì Ghi Nhớ tiết lộ đáp án đúng: <strong>{question.correctAnswer}</strong>
                  </span>
                )}
              </div>
            )}

            {/* Bottom Controls */}
            <div className="doraemon-card-actions">
              <button
                type="button"
                className="doraemon-nav-btn"
                onClick={onPrev}
                disabled={relativeIndex === 0}
              >
                ← Câu trước
              </button>

              <button
                type="button"
                className="doraemon-reveal-btn"
                onClick={onToggleReveal}
                disabled={isAnswered || isUnresolved}
              >
                <span>{isRevealed ? '🙈 Ẩn đáp án' : '🍞 Xem đáp án'}</span>
                <kbd>Space</kbd>
              </button>

              {isMultipleChoice && !isAnswered ? (
                <button
                  type="button"
                  className="doraemon-next-btn is-check-multi"
                  onClick={onCheckMultiple}
                  disabled={!selectedAnswer || selectedAnswer.length === 0}
                >
                  Kiểm tra ✓
                </button>
              ) : (
                <button
                  type="button"
                  className="doraemon-next-btn"
                  onClick={onNext}
                >
                  {relativeIndex >= totalCount - 1 && (!splitEnabled || currentPartIndex >= parts.length - 1)
                    ? 'Hoàn thành 🏆'
                    : 'Câu tiếp →'}
                </button>
              )}
            </div>

            {/* Ask AI — Túi Thần Kỳ AI · Bánh Mì Ghi Nhớ */}
            <div className="doraemon-ask-ai-wrap">
              <AskAI question={question} />
            </div>

            {/* Keyboard Hints */}
            <div className="doraemon-keyboard-hints">
              <span>🔔 Phím tắt:</span>
              <kbd>A</kbd><kbd>B</kbd><kbd>C</kbd><kbd>D</kbd> chọn ·
              <kbd>Space</kbd> xem đáp án ·
              <kbd>←</kbd><kbd>→</kbd> chuyển câu ·
              <kbd>M</kbd> đã thuộc
            </div>
          </article>
        </section>

        {/* RIGHT SIDEBAR: Interactive 4D Pocket + 3 World Switcher + Doraemon Mascot + Focus */}
        <aside className="doraemon-sidebar-right">
          {/* Interactive 4D Pocket Gadget Pull + 3-Scene Switcher */}
          <div className="doraemon-widget-card doraemon-pocket-card">
            <div className="doraemon-widget-head">
              <span className="doraemon-widget-title">🎒 Túi Thần Kỳ 4D</span>
              <button
                type="button"
                className="doraemon-door-quick-btn"
                onClick={() =>
                  launchAnywhereDoor(
                    'CÁNH CỬA THẦN KỲ MỞ RA!',
                    'Chúc cậu học nhanh nhớ lâu, bách chiến bách thắng mọi kỳ thi!'
                  )
                }
                title="Mở Cánh Cửa Thần Kỳ ngay!"
              >
                🚪 Mở Cửa
              </button>
            </div>

            {/* Glowing Interactive 4D Pocket Stage */}
            <button
              type="button"
              className="doraemon-4d-pocket-stage"
              onClick={() => pullRandomGadget(true)}
              title="Bấm để rút bảo bối thế kỷ 22 & nhận +1 Bánh Rán Dorayaki!"
            >
              {pocketBeamKey > 0 && (
                <span key={pocketBeamKey} className="doraemon-pocket-beam" aria-hidden="true" />
              )}
              <div className="doraemon-pocket-gadget-pop" key={currentGadget.id}>
                <span className="doraemon-gadget-emoji">{currentGadget.icon}</span>
                <div className="doraemon-gadget-info">
                  <strong>{currentGadget.name}</strong>
                  <span>{currentGadget.effect}</span>
                </div>
              </div>
              <div className="doraemon-pocket-arc">
                <span>✨ Bấm rút bảo bối (+1 🥞)</span>
              </div>
            </button>

            {/* 3-Scene World Switcher */}
            <div className="doraemon-scene-pills" role="group" aria-label="Đổi bối cảnh Doraemon">
              {DORAEMON_SCENES.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  className={`doraemon-scene-pill ${doraemonScene === sc.id ? 'is-active' : ''}`}
                  onClick={() => setDoraemonScene(sc.id)}
                  aria-pressed={doraemonScene === sc.id}
                >
                  <span>{sc.icon}</span>
                  <span>{sc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dual-Pose Animated Doraemon Companion */}
          <div className="doraemon-widget-card doraemon-mascot-card">
            <div className="doraemon-widget-head">
              <span className="doraemon-widget-title">💙 Doraemon Đồng Hành</span>
              <span className="doraemon-pill-badge">22C</span>
            </div>

            <DoraemonMascot
              variant="sidebar"
              scene={doraemonScene}
              mood={mascotMood}
              combo={sessionCombo}
              mouseEffectsEnabled={mouseEffectsEnabled}
              onTriggerPortal={() =>
                launchAnywhereDoor(
                  'BẢO BỐI TỪ DORAEMON!',
                  'Bạn vừa kích hoạt sức mạnh Cánh Cửa Thần Kỳ & Bánh Mì Ghi Nhớ!'
                )
              }
            />
          </div>

          {/* Focus Mode Card */}
          <div className="doraemon-widget-card doraemon-focus-card">
            <div className="doraemon-focus-row">
              <div>
                <div className="doraemon-widget-title">🎯 Chế Độ Tập Trung</div>
                <p className="doraemon-focus-desc">Ẩn widget hai bên để tập trung 100%</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isFocus}
                className={`doraemon-toggle-pill ${isFocus ? 'is-on' : ''}`}
                onClick={toggleFocus}
                aria-label="Bật tắt chế độ tập trung"
              >
                <span className="doraemon-toggle-knob" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
