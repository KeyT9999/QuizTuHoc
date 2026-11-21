import { useState, useEffect, useRef, useCallback } from 'react';
import type { Question } from '../utils/quizParser';
import { isAnswerTextSelection } from '../utils/quizTextSelection';
import type { QuizPlayMode } from './QuizModeBar';
import AskAI from './AskAI';
import QuestionImages from './QuestionImages';
import SpideyChibiMascot, { type SpideyMood, type SpideySuitMode } from './SpideyChibiMascot';
import spideyChibiImg from '../assets/spidey_chibi.png';
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

const SPIDEY_SUIT_STORAGE_KEY = 'keyt_spidey_suit_mode';

function readSavedSuitMode(): SpideySuitMode {
  try {
    return localStorage.getItem(SPIDEY_SUIT_STORAGE_KEY) === 'symbiote' ? 'symbiote' : 'classic';
  } catch {
    return 'classic';
  }
}

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
  const [suitMode, setSuitMode] = useState<SpideySuitMode>(() => readSavedSuitMode());
  const [xp, setXp] = useState(() => getUserXP());
  const [streak, setStreak] = useState(() => getStudyStreak());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Spidey feedback FX states (THWIP! on correct, Spider-Sense on wrong)
  const [sessionCombo, setSessionCombo] = useState(0);
  const [fxBanner, setFxBanner] = useState<{ type: 'correct' | 'wrong'; label: string; key: number } | null>(null);
  const [swingCelebration, setSwingCelebration] = useState<{ label: string; key: number } | null>(null);

  const lastEvaluatedQRef = useRef<string>('');
  const celebratedMilestonesRef = useRef<Set<string>>(new Set());
  const fxTimerRef = useRef<number | null>(null);
  const swingTimerRef = useRef<number | null>(null);

  // Sync Symbiote / Classic suit attribute to <html> so outer wrapper responds seamlessly
  useEffect(() => {
    document.documentElement.setAttribute('data-spidey-suit', suitMode);
    document.body.setAttribute('data-spidey-suit', suitMode);
    return () => {
      document.documentElement.removeAttribute('data-spidey-suit');
      document.body.removeAttribute('data-spidey-suit');
    };
  }, [suitMode]);

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

  const launchSwingCelebration = useCallback((label: string) => {
    playWebThwipSound(false);
    setSwingCelebration({ label, key: Date.now() });
    if (swingTimerRef.current) clearTimeout(swingTimerRef.current);
    swingTimerRef.current = window.setTimeout(() => {
      setSwingCelebration(null);
    }, 2200);
  }, []);

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
  const answeredPercent = statTotal > 0 ? Math.round((statAnswered / statTotal) * 100) : 0;

  // Trigger THWIP! or Spider-Sense animation + milestone Chibi Web-Swing!
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
          label:
            next >= 7
              ? `IRON-SPIDER x${next}!`
              : next >= 3
              ? `VENOM STRIKE x${next}!`
              : next === 2
              ? 'COMBO x2!'
              : suitMode === 'symbiote'
              ? 'WE ARE VENOM!'
              : 'THWIP!',
          key: Date.now(),
        });

        // Launch overhead Chibi Web-Swing on combo milestones (x3, x5, x10, x15...)
        if (next === 3 || (next >= 5 && next % 5 === 0)) {
          const swingTag =
            suitMode === 'symbiote'
              ? `WE ARE UNSTOPPABLE · x${next}!`
              : next >= 10
              ? `ULTIMATE SPIDEY · x${next}!`
              : next >= 5
              ? `SPECTACULAR · COMBO x${next}!`
              : 'AMAZING · VENOM STRIKE x3!';
          launchSwingCelebration(swingTag);
        }
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
    }, 1200);
  }, [isAnswered, isUnresolved, question.id, question.correctAnswer, selectedAnswer, suitMode, launchSwingCelebration]);

  // Also celebrate 50% and 100% answered milestones with Chibi Web-Swing!
  useEffect(() => {
    if (statTotal < 4) return;
    if (answeredPercent >= 100 && !celebratedMilestonesRef.current.has('100')) {
      celebratedMilestonesRef.current.add('100');
      launchSwingCelebration('ULTIMATE PASS · 100% HOÀN THÀNH!');
    } else if (answeredPercent >= 50 && answeredPercent < 100 && !celebratedMilestonesRef.current.has('50')) {
      celebratedMilestonesRef.current.add('50');
      launchSwingCelebration('SPECTACULAR · ĐÃ ĐẠT 50% BỘ ĐỀ!');
    }
  }, [answeredPercent, statTotal, launchSwingCelebration]);

  useEffect(() => {
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
      if (swingTimerRef.current) clearTimeout(swingTimerRef.current);
    };
  }, []);

  const handleToggleFocus = () => {
    const next = !isFocus;
    setIsFocus(next);
    setFocusMode(next);
  };

  const handleToggleSuit = () => {
    playWebThwipSound(false);
    setSuitMode((prev) => {
      const next: SpideySuitMode = prev === 'classic' ? 'symbiote' : 'classic';
      try {
        localStorage.setItem(SPIDEY_SUIT_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const levelData = calculateLevel(xp);
  const xpBarPercent = Math.min(100, Math.round((levelData.currentLevelXp / levelData.nextLevelXp) * 100));

  // Dynamic Multiverse Combo Energy Tier
  const energyTier: 'classic' | 'miles' | 'iron' =
    suitMode === 'symbiote'
      ? 'classic'
      : sessionCombo >= 7
      ? 'iron'
      : sessionCombo >= 3
      ? 'miles'
      : 'classic';

  const tierLabel =
    suitMode === 'symbiote'
      ? '🖤 SYMBIOTE STEALTH'
      : energyTier === 'iron'
      ? `🔥 IRON-SPIDER x${sessionCombo}`
      : energyTier === 'miles'
      ? `⚡ VENOM STRIKE x${sessionCombo}`
      : sessionCombo >= 2
      ? `🕸️ COMBO x${sessionCombo}`
      : null;

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
    <div
      className={`spidey-night-theme suit-${suitMode} tier-${energyTier} ${
        isFocus ? 'is-focus-active' : ''
      } ${mouseEffectsEnabled ? 'fx-enabled' : 'fx-disabled'}`}
    >
      {/* ==================================================================
          CINEMATIC SPIDER-VERSE STAGE BACKDROP:
          1. Multiverse Glitch Portal + Comic Panels (shifts color by Combo!)
          2. 4-Corner Spider-Webs
          3. Living Manhattan Night Skyline with twinkling lit windows
          ================================================================== */}
      <div className="spidey-stage-backdrop" aria-hidden="true">
        {/* Right-edge Spidey night artwork blended softly */}
        <div className="spidey-stage-artwork" />

        {/* Subtle Spider-Verse Ben-Day Halftone Vignette on Far Edges */}
        <div className="spidey-stage-halftone" />

        {/* Multiverse Glitch Portal behind Center Card */}
        <div className="spidey-multiverse-portal">
          <div className="spidey-portal-ring ring-outer" />
          <div className="spidey-portal-ring ring-mid" />
          <div className="spidey-portal-ring ring-inner" />
          <div className="spidey-comic-panel-ghost panel-left" />
          <div className="spidey-comic-panel-ghost panel-right" />
        </div>

        {/* 4-Corner Spider-Webs Framing the Viewport */}
        <svg className="spidey-viewport-web web-tl" viewBox="0 0 200 200" fill="none">
          <path d="M0 0 L190 0 M0 0 L175 68 M0 0 L138 138 M0 0 L68 175 M0 0 L0 190" stroke="currentColor" strokeWidth="1.2" />
          <path d="M55 0 Q52 24 40 40 Q24 52 0 55" stroke="currentColor" strokeWidth="1" />
          <path d="M108 0 Q100 48 76 76 Q48 100 0 108" stroke="currentColor" strokeWidth="1" />
          <path d="M162 0 Q148 72 114 114 Q72 148 0 162" stroke="currentColor" strokeWidth="0.9" />
        </svg>
        <svg className="spidey-viewport-web web-tr" viewBox="0 0 200 200" fill="none">
          <path d="M200 0 L10 0 M200 0 L25 68 M200 0 L62 138 M200 0 L132 175 M200 0 L200 190" stroke="currentColor" strokeWidth="1.2" />
          <path d="M145 0 Q148 24 160 40 Q176 52 200 55" stroke="currentColor" strokeWidth="1" />
          <path d="M92 0 Q100 48 124 76 Q152 100 200 108" stroke="currentColor" strokeWidth="1" />
          <path d="M38 0 Q52 72 86 114 Q128 148 200 162" stroke="currentColor" strokeWidth="0.9" />
        </svg>

        {/* Living New York Manhattan Night Skyline along Bottom Horizon */}
        <div className="spidey-ny-skyline-wrap">
          <svg
            className="spidey-ny-skyline-svg"
            viewBox="0 0 1440 210"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="nySkyGlow" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="var(--spidey-horizon-glow)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--spidey-horizon-glow)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect x="0" y="30" width="1440" height="180" fill="url(#nySkyGlow)" />

            {/* Distant Back Layer Buildings */}
            <path
              d="M0 210 V142 H46 V118 H94 V148 H132 V94 H168 V136 H216 V78 H234 V56 H244 V78 H266 V132 H324 V104 H378 V146 H430 V88 H478 V138 H536 V108 H588 V148 H644 V74 H668 V42 H676 V18 H680 V42 H688 V74 H712 V140 H772 V98 H828 V144 H886 V84 H942 V136 H1008 V102 H1054 V142 H1110 V68 H1138 V46 H1148 V24 H1152 V46 H1164 V68 H1192 V134 H1254 V96 H1312 V140 H1368 V108 H1414 V136 H1440 V210 Z"
              fill="rgba(7, 11, 28, 0.78)"
            />

            {/* Foreground Manhattan Silhouette */}
            <path
              d="M0 210 V158 H62 V132 H118 V164 H174 V116 H222 V154 H290 V126 H344 V166 H404 V112 H458 V158 H522 V130 H584 V168 H652 V104 H706 V156 H764 V124 H824 V164 H892 V114 H950 V158 H1022 V128 H1084 V162 H1156 V108 H1214 V154 H1282 V124 H1346 V160 H1398 V134 H1440 V210 Z"
              fill="rgba(4, 6, 18, 0.94)"
            />

            {/* Twinkling Apartment & Office Windows */}
            <g className="ny-win-group-amber">
              <rect x="74" y="142" width="5" height="7" rx="1" />
              <rect x="92" y="152" width="5" height="7" rx="1" />
              <rect x="186" y="128" width="5" height="7" rx="1" />
              <rect x="202" y="140" width="5" height="7" rx="1" />
              <rect x="236" y="92" width="4" height="6" rx="1" />
              <rect x="304" y="138" width="5" height="7" rx="1" />
              <rect x="418" y="124" width="5" height="7" rx="1" />
              <rect x="438" y="142" width="5" height="7" rx="1" />
              <rect x="536" y="144" width="5" height="7" rx="1" />
              <rect x="668" y="118" width="5" height="7" rx="1" />
              <rect x="684" y="134" width="5" height="7" rx="1" />
              <rect x="782" y="136" width="5" height="7" rx="1" />
              <rect x="908" y="128" width="5" height="7" rx="1" />
              <rect x="926" y="144" width="5" height="7" rx="1" />
              <rect x="1038" y="140" width="5" height="7" rx="1" />
              <rect x="1174" y="122" width="5" height="7" rx="1" />
              <rect x="1192" y="138" width="5" height="7" rx="1" />
              <rect x="1298" y="136" width="5" height="7" rx="1" />
              <rect x="1316" y="148" width="5" height="7" rx="1" />
            </g>
            <g className="ny-win-group-cyan">
              <rect x="84" y="146" width="5" height="7" rx="1" />
              <rect x="148" y="110" width="4" height="6" rx="1" />
              <rect x="194" y="134" width="5" height="7" rx="1" />
              <rect x="320" y="146" width="5" height="7" rx="1" />
              <rect x="428" y="130" width="5" height="7" rx="1" />
              <rect x="554" y="138" width="5" height="7" rx="1" />
              <rect x="676" y="88" width="4" height="6" rx="1" />
              <rect x="692" y="126" width="5" height="7" rx="1" />
              <rect x="800" y="144" width="5" height="7" rx="1" />
              <rect x="916" y="136" width="5" height="7" rx="1" />
              <rect x="1054" y="148" width="5" height="7" rx="1" />
              <rect x="1146" y="78" width="4" height="6" rx="1" />
              <rect x="1182" y="130" width="5" height="7" rx="1" />
              <rect x="1306" y="142" width="5" height="7" rx="1" />
              <rect x="1410" y="146" width="5" height="7" rx="1" />
            </g>
          </svg>
        </div>
      </div>

      {/* ==================================================================
          OVERHEAD CHIBI SPIDEY WEB-SWING CELEBRATION (Combo x3/x5/x10 & 50%/100%)
          ================================================================== */}
      {swingCelebration && (
        <div key={swingCelebration.key} className="spidey-overhead-celebration" aria-hidden="true">
          <div className="spidey-swing-arc-runner">
            <svg className="spidey-swing-rope-svg" viewBox="0 0 120 120" fill="none">
              <line x1="90" y1="0" x2="64" y2="115" stroke="#f8fafc" strokeWidth="2.4" strokeDasharray="7 3" />
            </svg>
            <img src={spideyChibiImg} alt="" className="spidey-swing-chibi-img" />
          </div>
          <div className="spidey-celebration-comic-banner">
            <span className="spidey-celebration-star">⚡</span>
            <span>{swingCelebration.label}</span>
          </div>
        </div>
      )}

      {/* ==================================================================
          3-COLUMN MAIN BODY LAYOUT
          ================================================================== */}
      <main className={`spidey-body-layout ${isFocus ? 'is-focus-mode' : ''}`}>
        {/* ----------------- LEFT SIDEBAR ----------------- */}
        <aside className={`spidey-sidebar-left ${mobileDrawerOpen ? 'is-mobile-drawer-open' : 'is-mobile-drawer-closed'}`}>
          {/* Card 1: Tiến độ học Web Donut */}
          <div className="spidey-widget-card">
            <div className="spidey-widget-title-row">
              <h4 className="spidey-widget-title">
                <span>🕸️</span> Tiến Độ Tuần Tra
              </h4>
              {tierLabel && (
                <span className={`spidey-combo-chip tier-${energyTier}`}>{tierLabel}</span>
              )}
            </div>

            <div className="spidey-donut-box">
              <div className="spidey-donut-wrapper">
                <svg className="spidey-donut-svg" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="spideyDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={suitMode === 'symbiote' ? '#e2e8f0' : energyTier === 'iron' ? '#fbbf24' : energyTier === 'miles' ? '#22d3ee' : '#e11d48'} />
                      <stop offset="55%" stopColor={suitMode === 'symbiote' ? '#94a3b8' : energyTier === 'iron' ? '#ef4444' : energyTier === 'miles' ? '#a855f7' : '#fb7185'} />
                      <stop offset="100%" stopColor={suitMode === 'symbiote' ? '#8b5cf6' : '#38bdf8'} />
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
                <span>{suitMode === 'symbiote' ? '🖤' : '🔥'}</span>
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
          {/* Silk-Web Progress Track with gliding Spidey / Symbiote Mask */}
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
                <svg viewBox="0 0 28 28" width="24" height="24">
                  <ellipse
                    cx="14"
                    cy="14"
                    rx="11"
                    ry="12.5"
                    fill={suitMode === 'symbiote' ? '#0f172a' : '#e11d48'}
                    stroke={suitMode === 'symbiote' ? '#cbd5e1' : '#060918'}
                    strokeWidth="2"
                  />
                  <path
                    d="M5 10 Q10 11 12.2 15.8 Q8.2 16.5 5.4 13.5 Z"
                    fill="#ffffff"
                    stroke="#060918"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M23 10 Q18 11 15.8 15.8 Q19.8 16.5 22.6 13.5 Z"
                    fill="#ffffff"
                    stroke="#060918"
                    strokeWidth="1.5"
                  />
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

            {/* Silk web shot streak + Comic Onomatopoeia Pop Badge */}
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
                    <span>
                      {suitMode === 'symbiote'
                        ? '🖤 WE ARE CORRECT! Chuẩn xác tuyệt đối (+35 XP).'
                        : '🕸️ THWIP! Chính xác tuyệt đối (+35 XP).'}
                    </span>
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
            <span>🕷️ Tiến Độ, Bộ Giáp & Chibi ({masteredPercent}% · 🔥 {streak})</span>
            <span className="drawer-chevron">{mobileDrawerOpen ? '▲ Thu gọn' : '▼ Mở'}</span>
          </button>
        </div>

        {/* ----------------- RIGHT SIDEBAR ----------------- */}
        <aside className={`spidey-sidebar-right ${mobileDrawerOpen ? 'is-mobile-drawer-open' : 'is-mobile-drawer-closed'}`}>
          {/* Card 1: Chibi Spidey Đu Tơ Companion */}
          <div className="spidey-widget-card spidey-mascot-card">
            <div className="spidey-widget-title-row">
              <h4 className="spidey-widget-title">
                <span>{suitMode === 'symbiote' ? '🖤' : '🕷️'}</span> Spidey Đồng Hành
              </h4>
              <span className="spidey-level-tag">Lv.{levelData.level}</span>
            </div>

            <SpideyChibiMascot
              variant="sidebar"
              mood={chibiMood}
              suitMode={suitMode}
              combo={sessionCombo}
              mouseEffectsEnabled={mouseEffectsEnabled}
              onTriggerSwing={() =>
                launchSwingCelebration(
                  suitMode === 'symbiote' ? 'WE ARE VENOM! 🖤' : 'THWIP! SPIDER-SWING! 🕸️'
                )
              }
            />
          </div>

          {/* Card 2: Instant Suit Switcher (Classic <-> Symbiote Black) + Quick Swing */}
          <div className="spidey-widget-card spidey-suit-card">
            <div className="spidey-focus-row">
              <div>
                <h4 className="spidey-widget-title">
                  <span>{suitMode === 'symbiote' ? '🖤' : '🕸️'}</span>
                  {suitMode === 'symbiote' ? 'Symbiote Suit' : 'Classic Suit'}
                </h4>
                <div className="spidey-focus-desc">
                  {suitMode === 'symbiote'
                    ? 'Đen tuyền tơ bạc · Cày đêm siêu êm mắt'
                    : 'Đổi giáp đen Symbiote cực ngầu'}
                </div>
              </div>

              <div
                className={`spidey-toggle-switch is-suit-toggle ${suitMode === 'symbiote' ? 'is-on' : ''}`}
                onClick={handleToggleSuit}
                role="switch"
                aria-checked={suitMode === 'symbiote'}
                title={suitMode === 'symbiote' ? 'Chuyển về Classic Spider-Man' : 'Kích hoạt Symbiote Black Suit'}
              >
                <div className="spidey-toggle-knob" />
              </div>
            </div>

            <div className="spidey-suit-footer-row">
              <span className="spidey-tier-hint">
                {suitMode === 'symbiote'
                  ? 'Stealth Mode đang bật'
                  : energyTier === 'iron'
                  ? '🔥 Iron-Spider Overdrive'
                  : energyTier === 'miles'
                  ? '⚡ Miles Venom Strike'
                  : 'Combo ≥ 3 đổi màu Portal'}
              </span>
              <button
                type="button"
                className="spidey-mini-swing-btn"
                onClick={() =>
                  launchSwingCelebration(
                    suitMode === 'symbiote' ? 'WE ARE VENOM! 🖤' : 'AMAZING SPIDEY! 🕸️'
                  )
                }
                title="Xem Chibi Spidey đu tơ qua màn hình"
              >
                🕸️ Đu tơ
              </button>
            </div>
          </div>

          {/* Card 3: Web XP */}
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

          {/* Card 4: Focus Mode Toggle */}
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
