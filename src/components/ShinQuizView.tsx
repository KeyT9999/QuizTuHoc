import { useState, useEffect, useRef, useCallback } from 'react';
import type { Question } from '../utils/quizParser';
import { isAnswerTextSelection } from '../utils/quizTextSelection';
import type { QuizPlayMode } from './QuizModeBar';
import AskAI from './AskAI';
import QuestionImages from './QuestionImages';
import ShinMascot, { type ShinMood } from './ShinMascot';
import shinJumpImg from '../assets/shin_sticker_jump.png';
import shinBgRoom from '../assets/shin_bg_room.jpg';
import shinBgMeadow from '../assets/shin_bg_meadow.jpg';
import shinBgHills from '../assets/shin_bg_hills.jpg';
import shinBgRain from '../assets/shin_bg_rain.jpg';
import { useTheme } from '../context/ThemeContext';
import { playShinBoingSound, playActionBeamSound } from '../utils/soundEffects';
import {
  getUserXP,
  calculateLevel,
  getStudyStreak,
  getFocusMode,
  setFocusMode,
  type ShinSceneId,
} from '../utils/studyStats';
import './ShinKasukabeTheme.css';

interface QuizSplitPart {
  partIndex: number;
  name: string;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  startNumber: number;
  endNumber: number;
}

interface ShinQuizViewProps {
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

interface ShinSceneMeta {
  id: ShinSceneId;
  icon: string;
  name: string;
  tag: string;
  bg: string;
}

const SHIN_SCENES: ShinSceneMeta[] = [
  { id: 'room', icon: '📚', name: 'Phòng Học', tag: 'Khinh khí cầu', bg: shinBgRoom },
  { id: 'meadow', icon: '🌿', name: 'Bãi Cỏ', tag: 'Nắng & Bướm', bg: shinBgMeadow },
  { id: 'hills', icon: '☁️', name: 'Đồi Cừu', tag: 'Mây chiều', bg: shinBgHills },
  { id: 'rain', icon: '🌧️', name: 'Phố Mưa', tag: 'Dark Lofi', bg: shinBgRain },
];

export default function ShinQuizView({
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
}: ShinQuizViewProps) {
  const { mouseEffectsEnabled, shinScene, setShinScene } = useTheme();
  const [isFocus, setIsFocus] = useState(() => getFocusMode());
  const [xp, setXp] = useState(() => getUserXP());
  const [streak, setStreak] = useState(() => getStudyStreak());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Subtle 3D parallax coordinates for backdrop (-1..1)
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Playful Motion Graphic FX states
  const [sessionCombo, setSessionCombo] = useState(0);
  const [fxBanner, setFxBanner] = useState<{ type: 'correct' | 'wrong'; label: string; key: number } | null>(null);
  const [beamCelebration, setBeamCelebration] = useState<{ label: string; key: number } | null>(null);

  const lastEvaluatedQRef = useRef<string>('');
  const celebratedMilestonesRef = useRef<Set<string>>(new Set());
  const fxTimerRef = useRef<number | null>(null);
  const beamTimerRef = useRef<number | null>(null);

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

  // 3D pointer parallax for Kasukabe backdrop (smooth, disabled when mouse FX off)
  useEffect(() => {
    if (!mouseEffectsEnabled) {
      setParallax({ x: 0, y: 0 });
      return;
    }
    let rafId = 0;
    const handleMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setParallax({ x: nx, y: ny });
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove);
    };
  }, [mouseEffectsEnabled]);

  const launchActionBeam = useCallback((label: string) => {
    playActionBeamSound(false);
    setBeamCelebration({ label, key: Date.now() });
    if (beamTimerRef.current) clearTimeout(beamTimerRef.current);
    beamTimerRef.current = window.setTimeout(() => {
      setBeamCelebration(null);
    }, 2300);
  }, []);

  // Compute stats for current active context
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
  const accuracyPercent = statAnswered > 0 ? Math.round((statCorrect / statAnswered) * 100) : 100;
  const progressPercent =
    totalCount > 0 ? Math.min(100, Math.round(((relativeIndex + 1) / totalCount) * 100)) : 0;
  const answeredPercent = statTotal > 0 ? Math.round((statAnswered / statTotal) * 100) : 0;

  // Trigger ChocoBi Pop / Green Pepper Panic + Action Beam milestone celebrations
  useEffect(() => {
    if (!isAnswered || isUnresolved) return;
    const token = `${question.id}:${selectedAnswer ?? ''}`;
    if (lastEvaluatedQRef.current === token) return;
    lastEvaluatedQRef.current = token;

    const isRight = selectedAnswer === question.correctAnswer;
    if (isRight) {
      playShinBoingSound(false);
      setSessionCombo((prev) => {
        const next = prev + 1;
        setFxBanner({
          type: 'correct',
          label:
            next >= 7
              ? `⚡ ACTION BEAM x${next}!`
              : next >= 3
              ? `🍪 CHOCOBI FEVER x${next}!`
              : next === 2
              ? '⭐ SUGOI x2!'
              : '⭐ QUÁ ĐỈNH!',
          key: Date.now(),
        });

        if (next === 3 || (next >= 5 && next % 5 === 0)) {
          const beamTag =
            next >= 10
              ? `⚡ SIÊU NHÂN HÀNH ĐỘNG · COMBO x${next}!`
              : next >= 5
              ? `🍪 CHOCOBI JACKPOT · COMBO x${next}!`
              : '⚡ ACTION BEAM · COMBO x3!';
          launchActionBeam(beamTag);
        }
        return next;
      });
    } else {
      setSessionCombo(0);
      setFxBanner({
        type: 'wrong',
        label: '🫑 ỚT CHUÔNG XANH!',
        key: Date.now(),
      });
    }

    if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
    fxTimerRef.current = window.setTimeout(() => {
      setFxBanner(null);
    }, 1250);
  }, [isAnswered, isUnresolved, question.id, question.correctAnswer, selectedAnswer, launchActionBeam]);

  // Celebrate 50% & 100% milestones
  useEffect(() => {
    if (statTotal < 4) return;
    if (answeredPercent >= 100 && !celebratedMilestonesRef.current.has('100')) {
      celebratedMilestonesRef.current.add('100');
      launchActionBeam('🏆 HOÀN THÀNH 100% · THƯỞNG 10 HỘP CHOCOBI!');
    } else if (answeredPercent >= 50 && answeredPercent < 100 && !celebratedMilestonesRef.current.has('50')) {
      celebratedMilestonesRef.current.add('50');
      launchActionBeam('⚡ NỬA CHẶNG ĐƯỜNG KASUKABE · 50%!');
    }
  }, [answeredPercent, statTotal, launchActionBeam]);

  useEffect(() => {
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
      if (beamTimerRef.current) clearTimeout(beamTimerRef.current);
    };
  }, []);

  const handleToggleFocus = () => {
    const next = !isFocus;
    setIsFocus(next);
    setFocusMode(next);
  };

  const handleSelectScene = (sceneId: ShinSceneId) => {
    if (sceneId === shinScene) return;
    playShinBoingSound(false);
    setShinScene(sceneId);
  };

  const levelData = calculateLevel(xp);
  const xpBarPercent = Math.min(100, Math.round((levelData.currentLevelXp / levelData.nextLevelXp) * 100));

  const energyTier: 'chill' | 'chocobi' | 'beam' =
    sessionCombo >= 7 ? 'beam' : sessionCombo >= 3 ? 'chocobi' : 'chill';

  const tierLabel =
    energyTier === 'beam'
      ? `⚡ ACTION BEAM x${sessionCombo}`
      : energyTier === 'chocobi'
      ? `🍪 CHOCOBI FEVER x${sessionCombo}`
      : sessionCombo >= 2
      ? `⭐ COMBO x${sessionCombo}`
      : null;

  const shinMood: ShinMood = isFocus
    ? 'focus'
    : !isAnswered || isUnresolved
    ? sessionCombo >= 3
      ? 'streak'
      : 'idle'
    : selectedAnswer === question.correctAnswer
    ? sessionCombo >= 2
      ? 'streak'
      : 'correct'
    : 'wrong';

  const activeSceneMeta = SHIN_SCENES.find((s) => s.id === shinScene) ?? SHIN_SCENES[0];
  const isRainScene = shinScene === 'rain';

  return (
    <div
      className={`shin-kasukabe-theme scene-${shinScene} tier-${energyTier} ${
        isRainScene ? 'is-dark-scene' : 'is-bright-scene'
      } ${isFocus ? 'is-focus-active' : ''} ${
        mouseEffectsEnabled ? 'fx-enabled' : 'fx-disabled'
      }`}
    >
      {/* ==================================================================
          FULL-VIEWPORT 4-SCENE 3D PARALLAX BACKDROP + WEATHER MOTION GRAPHICS
          ================================================================== */}
      <div className="shin-stage-backdrop" aria-hidden="true">
        {/* Parallax Wallpaper Layer */}
        <div
          className="shin-stage-wallpaper"
          style={{
            backgroundImage: `url(${activeSceneMeta.bg})`,
            transform: mouseEffectsEnabled
              ? `scale(1.06) translate3d(${(-parallax.x * 14).toFixed(1)}px, ${(-parallax.y * 10).toFixed(1)}px, 0)`
              : 'scale(1.02)',
          }}
        />
        <div className="shin-stage-scrim" />

        {/* Scene 1: Kasukabe Study Room — Floating Shin Blimp / Airship + Pastel Stars */}
        {shinScene === 'room' && (
          <div className="shin-weather-layer is-room">
            <div className="shin-airship-glider">
              <svg viewBox="0 0 140 76" className="shin-airship-svg" fill="none">
                <ellipse cx="72" cy="36" rx="52" ry="24" fill="#ffe4e6" stroke="#fb7185" strokeWidth="2.5" />
                <path d="M22 36 Q72 24 122 36" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 5" />
                {/* Cute Shin Face Decal on Airship */}
                <circle cx="55" cy="34" r="11" fill="#fed7aa" stroke="#1e293b" strokeWidth="1.8" />
                <path d="M47 26 Q51 22 55 25" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M56 25 Q60 22 63 26" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="51" cy="32" r="2.2" fill="#0f172a" />
                <circle cx="59" cy="32" r="2.2" fill="#0f172a" />
                <circle cx="55" cy="38" r="2.4" fill="#ef4444" />
                {/* Tail fins & Gondola */}
                <path d="M118 24 L135 16 L130 36 L135 54 L118 48 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                <rect x="60" y="58" width="26" height="11" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                <line x1="66" y1="54" x2="66" y2="58" stroke="#475569" strokeWidth="2" />
                <line x1="80" y1="54" x2="80" y2="58" stroke="#475569" strokeWidth="2" />
              </svg>
            </div>
            <span className="shin-float-doodle d1">★</span>
            <span className="shin-float-doodle d2">✦</span>
            <span className="shin-float-doodle d3">★</span>
          </div>
        )}

        {/* Scene 2: Sunny Meadow — Flapping Butterflies & Floating Sunbeams */}
        {shinScene === 'meadow' && (
          <div className="shin-weather-layer is-meadow">
            <div className="shin-sunbeam-glow" />
            <div className="shin-butterfly b1">
              <svg viewBox="0 0 40 32" fill="none">
                <ellipse cx="13" cy="14" rx="10" ry="8" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
                <ellipse cx="27" cy="14" rx="10" ry="8" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
                <ellipse cx="15" cy="23" rx="6" ry="5" fill="#fde047" />
                <ellipse cx="25" cy="23" rx="6" ry="5" fill="#fde047" />
                <line x1="20" y1="8" x2="20" y2="26" stroke="#713f12" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="shin-butterfly b2">
              <svg viewBox="0 0 40 32" fill="none">
                <ellipse cx="13" cy="14" rx="10" ry="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <ellipse cx="27" cy="14" rx="10" ry="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <ellipse cx="15" cy="23" rx="6" ry="5" fill="#e0f2fe" />
                <ellipse cx="25" cy="23" rx="6" ry="5" fill="#e0f2fe" />
                <line x1="20" y1="8" x2="20" y2="26" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="shin-butterfly b3">
              <svg viewBox="0 0 40 32" fill="none">
                <ellipse cx="13" cy="14" rx="9" ry="7" fill="#fbcfe8" stroke="#f472b6" strokeWidth="1.5" />
                <ellipse cx="27" cy="14" rx="9" ry="7" fill="#fbcfe8" stroke="#f472b6" strokeWidth="1.5" />
                <line x1="20" y1="9" x2="20" y2="24" stroke="#831843" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}

        {/* Scene 3: Golden Sheep Hills — Drifting 3D Fluffy Clouds & Warm Rays */}
        {shinScene === 'hills' && (
          <div className="shin-weather-layer is-hills">
            <div className="shin-cloud-layer c1" />
            <div className="shin-cloud-layer c2" />
            <div className="shin-golden-halo" />
          </div>
        )}

        {/* Scene 4: Kasukabe Rainy Evening — Slanted Raindrops & Puddle Ripples */}
        {shinScene === 'rain' && (
          <div className="shin-weather-layer is-rain">
            <div className="shin-rain-sheet layer-near" />
            <div className="shin-rain-sheet layer-far" />
            <div className="shin-puddle-ripples">
              <span className="shin-ripple r1" />
              <span className="shin-ripple r2" />
              <span className="shin-ripple r3" />
              <span className="shin-ripple r4" />
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================
          ACTION KAMEN BEAM! KINETIC MOTION GRAPHIC CELEBRATION CUT-IN
          ================================================================== */}
      {beamCelebration && (
        <div key={beamCelebration.key} className="shin-action-beam-overlay" aria-hidden="true">
          <div className="shin-beam-speedlines" />
          <div className="shin-beam-runner">
            <div className="shin-beam-star-trail" />
            <img src={shinJumpImg} alt="" className="shin-beam-shin-img" />
          </div>
          <div className="shin-beam-banner">
            <span>{beamCelebration.label}</span>
          </div>
        </div>
      )}

      {/* ==================================================================
          3-COLUMN MAIN STUDY LAYOUT
          ================================================================== */}
      <div className={`shin-body-layout ${isFocus ? 'is-focus-mode' : ''}`}>
        {/* Mobile Stats & Scene Drawer Bar */}
        <div className="shin-mobile-drawer-bar">
          <button
            type="button"
            className="shin-mobile-drawer-btn"
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            aria-expanded={mobileDrawerOpen}
          >
            <span>
              🖍️ {activeSceneMeta.icon} {activeSceneMeta.name} · {masteredPercent}% · Lv.{levelData.level}
            </span>
            <span>{mobileDrawerOpen ? '▲ Thu gọn' : '▼ Đổi cảnh & Shin'}</span>
          </button>
        </div>

        {/* LEFT SIDEBAR: Kasukabe Progress, Streak, Accuracy */}
        <aside className={`shin-sidebar-left ${mobileDrawerOpen ? 'is-mobile-drawer-open' : 'is-mobile-drawer-closed'}`}>
          {/* Card 1: Tiến Độ Kasukabe Donut */}
          <div className="shin-widget-card shin-progress-card">
            <div className="shin-widget-title">
              <span>🖍️</span> Sổ Tay Kasukabe
            </div>

            <div className="shin-donut-container">
              <svg viewBox="0 0 110 110" className="shin-donut-svg">
                <circle className="shin-donut-bg" cx="55" cy="55" r="44" />
                <circle
                  className="shin-donut-fill"
                  cx="55"
                  cy="55"
                  r="44"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * masteredPercent) / 100}
                />
              </svg>
              <div className="shin-donut-center">
                <span className="shin-donut-pct">{masteredPercent}%</span>
                <span className="shin-donut-sub">đã thuộc</span>
              </div>
            </div>

            <div className="shin-stat-list">
              <div className="shin-stat-row">
                <span className="shin-stat-label">
                  <i className="shin-dot dot-red" /> Đã thuộc
                </span>
                <strong className="shin-stat-val">
                  {statMastered}/{statTotal}
                </strong>
              </div>
              <div className="shin-stat-row">
                <span className="shin-stat-label">
                  <i className="shin-dot dot-green" /> Chuẩn xác
                </span>
                <strong className="shin-stat-val">{statCorrect}</strong>
              </div>
              <div className="shin-stat-row">
                <span className="shin-stat-label">
                  <i className="shin-dot dot-amber" /> Ớt chuông (sai)
                </span>
                <strong className="shin-stat-val">{statWrong}</strong>
              </div>
              <div className="shin-stat-row">
                <span className="shin-stat-label">
                  <i className="shin-dot dot-gray" /> Chưa làm
                </span>
                <strong className="shin-stat-val">{statUnanswered}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Chuỗi Ngày & Combo ChocoBi */}
          <div className="shin-widget-card shin-streak-card">
            <div className="shin-widget-title-row">
              <span className="shin-widget-title">🔥 Chuỗi Kasukabe</span>
              {tierLabel && <span className={`shin-combo-pill tier-${energyTier}`}>{tierLabel}</span>}
            </div>
            <div className="shin-streak-content">
              <div className="shin-streak-badge-box">🍪</div>
              <div className="shin-streak-texts">
                <div className="shin-streak-days">
                  {streak > 0 ? `${streak} ngày liên tiếp` : 'Ngày đầu ra quân'}
                </div>
                <div className="shin-streak-sub">
                  {sessionCombo >= 3
                    ? `Đang chuỗi ${sessionCombo} câu đúng liền!`
                    : 'Đúng 3 câu liên tiếp kích hoạt Action Beam!'}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Độ Chính Xác */}
          <div className="shin-widget-card shin-accuracy-card">
            <div className="shin-widget-title-row">
              <span className="shin-widget-title">🎯 Độ Chính Xác</span>
              <span className="shin-acc-ratio">
                {statCorrect}/{statAnswered} đúng
              </span>
            </div>
            <div className="shin-acc-big-num">{accuracyPercent}%</div>
            <div className="shin-acc-sub">
              {statAnswered} câu đã làm · {statCorrect} câu chuẩn
            </div>
            <div className="shin-acc-bar">
              <div className="shin-acc-bar-fill" style={{ width: `${accuracyPercent}%` }} />
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Kasukabe Progress Runner + Crayon Sticker 3D Quiz Card */}
        <main className="shin-center-column">
          {/* Kasukabe Crayon Progress Bar with Running Shin */}
          <div className="shin-progress-bar-wrap">
            <div className="shin-progress-track">
              <div className="shin-progress-fill" style={{ width: `${progressPercent}%` }}>
                <span
                  className="shin-progress-runner"
                  aria-hidden="true"
                  title={`Tiến độ ${progressPercent}%`}
                >
                  {isRainScene ? '☂️' : '🐶'}
                </span>
              </div>
            </div>
            <span className="shin-progress-pct-text">{progressPercent}%</span>
          </div>

          {/* Main Crayon Sticker Quiz Card */}
          <section
            key={question.id}
            className={`shin-quiz-card ${
              slideDirection === 'next'
                ? 'slide-in-next'
                : slideDirection === 'prev'
                ? 'slide-in-prev'
                : ''
            } ${fxBanner?.type === 'wrong' ? 'is-pepper-shake' : ''}`}
          >
            {/* Cute Pastel Washi Tape Strips on Top Corners */}
            <div className="shin-washi-tape tape-left" aria-hidden="true" />
            <div className="shin-washi-tape tape-right" aria-hidden="true" />

            {/* Kinetic Pop Feedback Badge */}
            {fxBanner && (
              <div
                key={fxBanner.key}
                className={`shin-fx-pop-badge is-${fxBanner.type}`}
                aria-hidden="true"
              >
                {fxBanner.label}
              </div>
            )}

            {/* Header: Question Number, Part Chip, Mark Mastered */}
            <div className="shin-q-header">
              <div className="shin-q-left-meta">
                <div className="shin-q-num-pill">
                  Câu {relativeIndex + 1} <span className="shin-q-total">/ {totalCount}</span>
                </div>
                {splitEnabled && currentPart && (
                  <span className="shin-q-part-chip">
                    {currentPart.name} · #{currentIndex + 1}/{questions.length}
                  </span>
                )}
              </div>

              <button
                type="button"
                className={`shin-mastered-btn ${isMastered ? 'is-mastered' : ''}`}
                onClick={() => onToggleMastered(question.id)}
                title="Đánh dấu câu này đã thuộc (Phím tắt: M)"
              >
                <span>{isMastered ? '⭐' : '🖍️'}</span>
                <span>{isMastered ? 'Đã thuộc' : 'Đánh dấu đã học'}</span>
              </button>
            </div>

            {/* Question Text */}
            <h2
              className="shin-question-text"
              data-hover-translate={question.text}
              data-hover-translate-kind="question"
            >
              {question.text}
            </h2>
            <QuestionImages images={question.images} />

            {/* Answer Options / Free Response */}
            {isFreeResponse ? (
              <div className="shin-free-response-wrap">
                <label htmlFor={`shin-free-${question.id}`} className="shin-free-label">
                  Nhập câu trả lời của bạn:
                </label>
                <textarea
                  id={`shin-free-${question.id}`}
                  value={selectedAnswer ?? ''}
                  onChange={(e) => onSelectOption(e.target.value)}
                  placeholder="Nhập đáp án..."
                  rows={3}
                  className="shin-free-textarea"
                />
              </div>
            ) : (
              <div className="shin-options-stack">
                {question.options.map((opt) => {
                  const isSelected = selectedAnswer?.includes(opt.key) ?? false;
                  const isCorrect = question.correctAnswer.includes(opt.key);

                  let cardClass = 'shin-option-card';
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
                      <span className="shin-option-key-badge">{opt.key}</span>
                      <span className="shin-option-text" data-hover-translate={opt.text}>
                        {opt.text}
                      </span>

                      {(isAnswered || isRevealed) && !isUnresolved && isCorrect && (
                        <span className="shin-option-status-icon correct">★</span>
                      )}
                      {(isAnswered || isRevealed) && isSelected && !isUnresolved && !isCorrect && (
                        <span className="shin-option-status-icon incorrect">🫑</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Feedback Box */}
            {(isAnswered || isRevealed) && (
              <div
                className={`shin-feedback-box ${
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
                    <span>🍪 SUGOI! Chuẩn không cần chỉnh (+35 XP ChocoBi)!</span>
                  ) : (
                    <span>
                      🫑 Ôi dính ớt chuông xanh rồi! Đáp án đúng là: <strong>{question.correctAnswer}</strong>
                    </span>
                  )
                ) : (
                  <span>💡 Đáp án đúng của câu này là: <strong>{question.correctAnswer}</strong></span>
                )}
              </div>
            )}

            {/* Actions Bar */}
            <div className="shin-actions-bar">
              <button
                type="button"
                className="shin-prev-btn"
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
                className="shin-reveal-btn"
                onClick={onToggleReveal}
                disabled={isAnswered}
                title="Xem đáp án (Phím tắt: Space)"
              >
                <span>{isAnswered ? '✓' : isRevealed ? '🙈' : '👁️'}</span>
                <span>{isAnswered ? 'Đã có đáp án' : isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
                {!isAnswered && <kbd className="shin-kbd">Space</kbd>}
              </button>

              {isMultipleChoice && !isAnswered && (
                <button
                  type="button"
                  className="shin-next-btn is-check-multi"
                  onClick={onCheckMultiple}
                  disabled={!selectedAnswer}
                >
                  Kiểm tra{selectedAnswer ? ` (${selectedAnswer.split('').join(', ')})` : ''}
                </button>
              )}

              <button
                type="button"
                className="shin-next-btn"
                onClick={onNext}
                title="Phím tắt: → hoặc Enter"
              >
                {splitEnabled && currentPart
                  ? currentIndex === currentPart.endIndex
                    ? currentPartIndex === parts.length - 1
                      ? 'Nộp bài & Kết quả'
                      : `Xong ${currentPart.name} →`
                    : 'Câu tiếp →'
                  : currentIndex === questions.length - 1
                  ? 'Nộp bài & Kết quả'
                  : 'Câu tiếp →'}
              </button>
            </div>

            {/* Đội Phòng Vệ Kasukabe AI Assistant */}
            <AskAI question={question} />

            {/* Keyboard Shortcuts Hint */}
            <div className="shin-keyboard-hints">
              <span>⌨️ Phím tắt:</span>
              <kbd>A</kbd>
              <kbd>B</kbd>
              <kbd>C</kbd>
              <kbd>D</kbd> chọn · <kbd>Space</kbd> đáp án · <kbd>←</kbd> <kbd>→</kbd> chuyển câu ·{' '}
              <kbd>M</kbd> đã thuộc
            </div>
          </section>
        </main>

        {/* RIGHT SIDEBAR: Shin 2-Pose Mascot + 4-Scene Switcher + ChocoBi XP + Focus Mode */}
        <aside className={`shin-sidebar-right ${mobileDrawerOpen ? 'is-mobile-drawer-open' : 'is-mobile-drawer-closed'}`}>
          {/* Card 1: Animated 2-Pose Shin Mascot */}
          <div className="shin-widget-card shin-mascot-card">
            <div className="shin-widget-title-row">
              <span className="shin-widget-title">🖍️ Bé Shin Đồng Hành</span>
              <span className="shin-lv-badge">Lv.{levelData.level}</span>
            </div>

            <ShinMascot
              variant="sidebar"
              mood={shinMood}
              scene={shinScene}
              comboCount={sessionCombo}
              mouseEffectsEnabled={mouseEffectsEnabled}
              onTriggerActionBeam={() => launchActionBeam('⚡ ACTION BEAM! SHIN TỚI ĐÂY!!')}
            />
          </div>

          {/* Card 2: Instant 4-Scene Kasukabe Switcher + Action Beam Trigger */}
          <div className="shin-widget-card shin-scene-switcher-card">
            <div className="shin-widget-title-row">
              <span className="shin-widget-title">🎬 Cảnh Kasukabe</span>
              <button
                type="button"
                className="shin-beam-quick-btn"
                onClick={() => launchActionBeam('⚡ ACTION BEAM!! CỐ LÊN NÀO!')}
                title="Kích hoạt hiệu ứng Motion Graphic Action Beam!"
              >
                ⚡ Beam
              </button>
            </div>

            <div className="shin-scene-grid">
              {SHIN_SCENES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`shin-scene-tile ${shinScene === s.id ? 'is-active' : ''}`}
                  onClick={() => handleSelectScene(s.id)}
                  aria-pressed={shinScene === s.id}
                >
                  <span
                    className="shin-scene-thumb"
                    style={{ backgroundImage: `url(${s.bg})` }}
                    aria-hidden="true"
                  />
                  <span className="shin-scene-meta">
                    <strong className="shin-scene-name">
                      {s.icon} {s.name}
                    </strong>
                    <small className="shin-scene-tag">{s.tag}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: ChocoBi XP */}
          <div className="shin-widget-card shin-xp-card">
            <div className="shin-widget-title-row">
              <span className="shin-widget-title">🍪 ChocoBi XP</span>
              <span className="shin-xp-num">{xp} XP</span>
            </div>
            <div className="shin-xp-bar">
              <div className="shin-xp-bar-fill" style={{ width: `${xpBarPercent}%` }} />
            </div>
            <div className="shin-xp-foot">
              <span>Còn {levelData.remainingXp} XP lên cấp</span>
              <span className="shin-lv-badge">Lv.{levelData.level}</span>
            </div>
          </div>

          {/* Card 4: Focus Mode */}
          <div className="shin-widget-card shin-focus-card">
            <div className="shin-focus-row">
              <div>
                <div className="shin-widget-title">🎯 Chế Độ Tập Trung</div>
                <p className="shin-focus-desc">Ẩn 2 cột phụ để làm đề siêu nhanh</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isFocus}
                className={`shin-toggle-pill ${isFocus ? 'is-on' : ''}`}
                onClick={handleToggleFocus}
                aria-label="Bật tắt chế độ tập trung"
              >
                <span className="shin-toggle-knob" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
