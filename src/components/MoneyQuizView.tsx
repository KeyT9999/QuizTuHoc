import { useState, useEffect, useRef, useCallback } from 'react';
import type { Question } from '../utils/quizParser';
import { isAnswerTextSelection } from '../utils/quizTextSelection';
import type { QuizPlayMode } from './QuizModeBar';
import AskAI from './AskAI';
import QuestionImages from './QuestionImages';
import MoneyWingsMascot, { type MoneyMood } from './MoneyWingsMascot';
import moneyBgObsidian from '../assets/money_bg_obsidian.jpg';
import moneyBgEmerald from '../assets/money_bg_emerald.jpg';
import moneyBgGold from '../assets/money_bg_gold.jpg';
import moneyUsdBillImg from '../assets/money_usd_bill.png';
import { useTheme } from '../context/ThemeContext';
import { playCashRegisterSound, playMoneyCountSound } from '../utils/soundEffects';
import {
  getUserXP,
  calculateLevel,
  getStudyStreak,
  getFocusMode,
  setFocusMode,
  getUserNetWorth,
  addUserNetWorth,
  type MoneyVaultFinish,
} from '../utils/studyStats';
import './MoneyVaultTheme.css';

interface QuizSplitPart {
  partIndex: number;
  name: string;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  startNumber: number;
  endNumber: number;
}

interface MoneyQuizViewProps {
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

interface FinishMeta {
  id: MoneyVaultFinish;
  icon: string;
  name: string;
  cardTitle: string;
  bg: string;
}

const VAULT_FINISHES: FinishMeta[] = [
  {
    id: 'obsidian',
    icon: '🖤',
    name: 'Obsidian',
    cardTitle: 'CENTURION BLACK',
    bg: moneyBgObsidian,
  },
  {
    id: 'emerald',
    icon: '💚',
    name: 'Emerald',
    cardTitle: 'OLD MONEY RESERVE',
    bg: moneyBgEmerald,
  },
  {
    id: 'gold',
    icon: '🏆',
    name: 'Gold',
    cardTitle: 'SOVEREIGN BULLION',
    bg: moneyBgGold,
  },
];

const RAIN_BILLS = Array.from({ length: 16 }, (_, idx) => ({
  id: idx,
  left: 3 + ((idx * 6.2) % 91),
  delay: (idx % 6) * 0.08,
  duration: 1.85 + (idx % 4) * 0.25,
  scale: 0.78 + (idx % 3) * 0.16,
  rotStart: -28 + (idx % 5) * 14,
}));

function formatUSD(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

function getWealthTier(netWorth: number): string {
  if (netWorth >= 1_000_000_000) return 'BILLIONAIRE';
  if (netWorth >= 100_000_000) return 'CENTI-MILLIONAIRE';
  if (netWorth >= 10_000_000) return 'MULTI-MILLIONAIRE';
  if (netWorth >= 1_000_000) return 'MILLIONAIRE';
  if (netWorth >= 250_000) return 'PRIVATE CLIENT';
  return 'SEED INVESTOR';
}

export default function MoneyQuizView({
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
}: MoneyQuizViewProps) {
  const { mouseEffectsEnabled, moneyFinish, setMoneyFinish } = useTheme();
  const [isFocus, setIsFocus] = useState(() => getFocusMode());
  const [xp, setXp] = useState(() => getUserXP());
  const [streak, setStreak] = useState(() => getStudyStreak());
  const [netWorth, setNetWorth] = useState(() => getUserNetWorth());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Interactive 3D Black Card tilt state
  const [cardTilt, setCardTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50 });

  // Financial feedback & Make It Rain states
  const [sessionCombo, setSessionCombo] = useState(0);
  const [fxBanner, setFxBanner] = useState<{ type: 'correct' | 'wrong'; label: string; key: number } | null>(null);
  const [rainCelebration, setRainCelebration] = useState<{ title: string; amount: string; key: number } | null>(null);

  const lastEvaluatedQRef = useRef<string>('');
  const celebratedMilestonesRef = useRef<Set<string>>(new Set());
  const fxTimerRef = useRef<number | null>(null);
  const rainTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleSync = () => {
      setXp(getUserXP());
      setStreak(getStudyStreak());
      setNetWorth(getUserNetWorth());
    };
    window.addEventListener('keyt-xp-changed', handleSync);
    window.addEventListener('keyt-xp-earned', handleSync);
    window.addEventListener('keyt-streak-changed', handleSync);
    window.addEventListener('keyt-networth-changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('keyt-xp-changed', handleSync);
      window.removeEventListener('keyt-xp-earned', handleSync);
      window.removeEventListener('keyt-streak-changed', handleSync);
      window.removeEventListener('keyt-networth-changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const launchMoneyRain = useCallback((title: string, amount: string) => {
    playCashRegisterSound(false);
    setRainCelebration({ title, amount, key: Date.now() });
    if (rainTimerRef.current) clearTimeout(rainTimerRef.current);
    rainTimerRef.current = window.setTimeout(() => {
      setRainCelebration(null);
    }, 2600);
  }, []);

  // Compute stats for current active set/part
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

  // Evaluate answers -> update USD Net Worth + Cash Register FX + Wire Transfer Celebrations
  useEffect(() => {
    if (!isAnswered || isUnresolved) return;
    const token = `${question.id}:${selectedAnswer ?? ''}`;
    if (lastEvaluatedQRef.current === token) return;
    lastEvaluatedQRef.current = token;

    const isRight = selectedAnswer === question.correctAnswer;
    if (isRight) {
      playCashRegisterSound(false);
      setSessionCombo((prev) => {
        const next = prev + 1;
        const payout = next >= 7 ? 100_000 : next >= 3 ? 25_000 : 10_000;
        const updated = addUserNetWorth(payout);
        setNetWorth(updated);

        setFxBanner({
          type: 'correct',
          label:
            next >= 7
              ? `💎 +${formatUSD(payout)} · BILLIONAIRE x${next}`
              : next >= 3
              ? `💵 +${formatUSD(payout)} · BULL RUN x${next}`
              : `💵 +${formatUSD(payout)} USD`,
          key: Date.now(),
        });

        if (next === 3 || (next >= 5 && next % 5 === 0)) {
          const bonus = next >= 10 ? 1_000_000 : next >= 5 ? 250_000 : 100_000;
          const afterBonus = addUserNetWorth(bonus);
          setNetWorth(afterBonus);
          launchMoneyRain(
            next >= 10
              ? `WIRE TRANSFER APPROVED · COMBO x${next}`
              : next >= 5
              ? `SWISS VAULT DIVIDEND · COMBO x${next}`
              : 'BULL MARKET BREAKOUT · COMBO x3',
            `+${formatUSD(bonus)} USD`
          );
        }
        return next;
      });
    } else {
      setSessionCombo(0);
      const updated = addUserNetWorth(-5_000);
      setNetWorth(updated);
      setFxBanner({
        type: 'wrong',
        label: '📉 MARKET DIP -$5,000',
        key: Date.now(),
      });
    }

    if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
    fxTimerRef.current = window.setTimeout(() => {
      setFxBanner(null);
    }, 1350);
  }, [isAnswered, isUnresolved, question.id, question.correctAnswer, selectedAnswer, launchMoneyRain]);

  // 50% & 100% progress Swiss Vault Bonus
  useEffect(() => {
    if (statTotal < 4) return;
    if (answeredPercent >= 100 && !celebratedMilestonesRef.current.has('100')) {
      celebratedMilestonesRef.current.add('100');
      const updated = addUserNetWorth(1_000_000);
      setNetWorth(updated);
      launchMoneyRain('PORTFOLIO 100% CLOSED · IPO JACKPOT', '+$1,000,000 USD');
    } else if (answeredPercent >= 50 && answeredPercent < 100 && !celebratedMilestonesRef.current.has('50')) {
      celebratedMilestonesRef.current.add('50');
      const updated = addUserNetWorth(250_000);
      setNetWorth(updated);
      launchMoneyRain('MID-SESSION DIVIDEND · 50% COMPLETE', '+$250,000 USD');
    }
  }, [answeredPercent, statTotal, launchMoneyRain]);

  useEffect(() => {
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
      if (rainTimerRef.current) clearTimeout(rainTimerRef.current);
    };
  }, []);

  const handleToggleFocus = () => {
    const next = !isFocus;
    setIsFocus(next);
    setFocusMode(next);
  };

  const handleSelectFinish = (finishId: MoneyVaultFinish) => {
    if (finishId === moneyFinish) return;
    playMoneyCountSound(false);
    setMoneyFinish(finishId);
  };

  const handleBlackCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseEffectsEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setCardTilt({
      rx: (0.5 - py) * 16,
      ry: (px - 0.5) * 18,
      glareX: px * 100,
      glareY: py * 100,
    });
  };

  const handleBlackCardLeave = () => {
    setCardTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
  };

  const levelData = calculateLevel(xp);
  const xpBarPercent = Math.min(100, Math.round((levelData.currentLevelXp / levelData.nextLevelXp) * 100));
  const wealthRank = getWealthTier(netWorth);
  const activeFinishMeta = VAULT_FINISHES.find((f) => f.id === moneyFinish) ?? VAULT_FINISHES[0];

  const moneyMood: MoneyMood = isFocus
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

  return (
    <div
      className={`money-vault-theme finish-${moneyFinish} ${
        isFocus ? 'is-focus-active' : ''
      } ${mouseEffectsEnabled ? 'fx-enabled' : 'fx-disabled'}`}
    >
      {/* ==================================================================
          FULL-VIEWPORT LUXURY USD VAULT BACKDROP + SUBTLE AMBIENT $100 BILLS
          ================================================================== */}
      <div className="money-stage-backdrop" aria-hidden="true">
        <div
          className="money-stage-wallpaper"
          style={{ backgroundImage: `url(${activeFinishMeta.bg})` }}
        />
        <div className="money-stage-vignette" />
        <div className="money-stage-grid-sheen" />

        {/* Subtle outer-edge fluttering real $100 USD bills (hidden in Focus / static mode) */}
        {mouseEffectsEnabled && !isFocus && (
          <div className="money-ambient-bills">
            <img src={moneyUsdBillImg} alt="" className="money-ambient-bill b1" />
            <img src={moneyUsdBillImg} alt="" className="money-ambient-bill b2" />
            <img src={moneyUsdBillImg} alt="" className="money-ambient-bill b3" />
          </div>
        )}
      </div>

      {/* ==================================================================
          LIVE WALL STREET GPA ▲ TICKER RIBBON (SUBTLE & LUXURIOUS)
          ================================================================== */}
      <div className="money-ticker-bar" aria-hidden="true">
        <div className="money-ticker-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="money-ticker-segment">
              <span className="ticker-item is-up">
                <strong>GPA</strong> ▲ +4.00%
              </span>
              <span className="ticker-sep">·</span>
              <span className="ticker-item is-gold">
                <strong>USD VAULT</strong> {formatUSD(netWorth)}
              </span>
              <span className="ticker-sep">·</span>
              <span className="ticker-item is-up">
                <strong>FE_PASS</strong> ▲ 99.9% STRONG BUY
              </span>
              <span className="ticker-sep">·</span>
              <span className="ticker-item is-up">
                <strong>ACCURACY</strong> {accuracyPercent}% ▲
              </span>
              <span className="ticker-sep">·</span>
              <span className="ticker-item is-gold">
                <strong>RANK</strong> {wealthRank}
              </span>
              <span className="ticker-sep">·</span>
              <span className="ticker-item is-up">
                <strong>STREAK</strong> {Math.max(1, streak)}D BULL RUN ▲
              </span>
              <span className="ticker-sep">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================
          WIRE TRANSFER APPROVED + REAL $100 USD MAKE-IT-RAIN OVERLAY
          ================================================================== */}
      {rainCelebration && (
        <div key={rainCelebration.key} className="money-rain-overlay" aria-hidden="true">
          {RAIN_BILLS.map((bill) => (
            <img
              key={bill.id}
              src={moneyUsdBillImg}
              alt=""
              className="money-rain-bill"
              style={{
                left: `${bill.left}%`,
                animationDelay: `${bill.delay}s`,
                animationDuration: `${bill.duration}s`,
                ['--bill-scale' as string]: bill.scale,
                ['--bill-rot' as string]: `${bill.rotStart}deg`,
              }}
            />
          ))}

          <div className="money-wire-banner">
            <div className="money-wire-badge">SWISS PRIVATE BANK · VERIFIED</div>
            <div className="money-wire-title">{rainCelebration.title}</div>
            <div className="money-wire-amount">{rainCelebration.amount}</div>
          </div>
        </div>
      )}

      {/* ==================================================================
          3-COLUMN PRIVATE VAULT LAYOUT
          ================================================================== */}
      <div className={`money-body-layout ${isFocus ? 'is-focus-mode' : ''}`}>
        {/* Mobile Drawer Bar */}
        <div className="money-mobile-drawer-bar">
          <button
            type="button"
            className="money-mobile-drawer-btn"
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            aria-expanded={mobileDrawerOpen}
          >
            <span>
              💎 {formatUSD(netWorth)} · {masteredPercent}% · {activeFinishMeta.name}
            </span>
            <span>{mobileDrawerOpen ? '▲ Thu gọn' : '▼ Black Card & Két USD'}</span>
          </button>
        </div>

        {/* LEFT SIDEBAR: Portfolio Progress, Net Worth & Accuracy */}
        <aside className={`money-sidebar-left ${mobileDrawerOpen ? 'is-mobile-drawer-open' : 'is-mobile-drawer-closed'}`}>
          {/* Card 1: Portfolio Donut */}
          <div className="money-widget-card">
            <div className="money-widget-title-row">
              <span className="money-widget-title">🏦 Danh Mục Ôn Thi</span>
              <span className="money-gold-chip">{masteredPercent}%</span>
            </div>

            <div className="money-donut-container">
              <svg viewBox="0 0 110 110" className="money-donut-svg">
                <circle className="money-donut-bg" cx="55" cy="55" r="44" />
                <circle
                  className="money-donut-fill"
                  cx="55"
                  cy="55"
                  r="44"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * masteredPercent) / 100}
                />
              </svg>
              <div className="money-donut-center">
                <span className="money-donut-pct">{masteredPercent}%</span>
                <span className="money-donut-sub">hoàn tất</span>
              </div>
            </div>

            <div className="money-stat-list">
              <div className="money-stat-row">
                <span className="money-stat-label">
                  <i className="m-dot dot-gold" /> Đã thuộc
                </span>
                <strong className="money-stat-val">
                  {statMastered}/{statTotal}
                </strong>
              </div>
              <div className="money-stat-row">
                <span className="money-stat-label">
                  <i className="m-dot dot-emerald" /> Chốt lời (đúng)
                </span>
                <strong className="money-stat-val">{statCorrect}</strong>
              </div>
              <div className="money-stat-row">
                <span className="money-stat-label">
                  <i className="m-dot dot-rose" /> Điều chỉnh (sai)
                </span>
                <strong className="money-stat-val">{statWrong}</strong>
              </div>
              <div className="money-stat-row">
                <span className="money-stat-label">
                  <i className="m-dot dot-muted" /> Chưa mở vị thế
                </span>
                <strong className="money-stat-val">{statUnanswered}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Bull Run Streak & Combo */}
          <div className="money-widget-card">
            <div className="money-widget-title-row">
              <span className="money-widget-title">📈 Chuỗi Bull Market</span>
              {sessionCombo >= 2 && (
                <span className="money-combo-pill">▲ x{sessionCombo}</span>
              )}
            </div>
            <div className="money-streak-row">
              <div className="money-streak-emblem">💵</div>
              <div>
                <div className="money-streak-days">
                  {streak > 0 ? `${streak} ngày sinh lời` : 'Phiên giao dịch đầu tiên'}
                </div>
                <div className="money-streak-sub">
                  {sessionCombo >= 3
                    ? `Đang chuỗi ${sessionCombo} câu đúng (+$25K–$100K/câu)`
                    : 'Đúng 3 câu liên tiếp kích hoạt Wire Transfer +$100K!'}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Win Rate (Accuracy) */}
          <div className="money-widget-card">
            <div className="money-widget-title-row">
              <span className="money-widget-title">🎯 Tỷ Lệ Thắng (ROI)</span>
              <span className="money-muted-val">
                {statCorrect}/{statAnswered}
              </span>
            </div>
            <div className="money-acc-num">{accuracyPercent}%</div>
            <div className="money-acc-bar">
              <div className="money-acc-fill" style={{ width: `${accuracyPercent}%` }} />
            </div>
            <div className="money-xp-foot">
              <span>Lv.{levelData.level} · {xp} XP</span>
              <span>Còn {levelData.remainingXp} XP</span>
            </div>
            <div className="money-xp-mini-bar">
              <div className="money-xp-mini-fill" style={{ width: `${xpBarPercent}%` }} />
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Gold Progress Track + Obsidian 1px Hairline Quiz Card */}
        <main className="money-center-column">
          {/* Champagne Gold Progress Bar */}
          <div className="money-progress-bar-wrap">
            <div className="money-progress-track">
              <div className="money-progress-fill" style={{ width: `${progressPercent}%` }}>
                <span className="money-progress-coin" aria-hidden="true">
                  $
                </span>
              </div>
            </div>
            <span className="money-progress-pct">{progressPercent}%</span>
          </div>

          {/* Main Private Vault Quiz Card */}
          <section
            key={question.id}
            className={`money-quiz-card ${
              slideDirection === 'next'
                ? 'slide-in-next'
                : slideDirection === 'prev'
                ? 'slide-in-prev'
                : ''
            } ${fxBanner?.type === 'wrong' ? 'is-dip-shake' : ''}`}
          >
            {/* Subtle Art-Deco 1px Brushed Gold Corner Brackets */}
            <span className="money-corner tl" aria-hidden="true" />
            <span className="money-corner tr" aria-hidden="true" />
            <span className="money-corner bl" aria-hidden="true" />
            <span className="money-corner br" aria-hidden="true" />

            {/* Payout / Market Dip Pop Banner */}
            {fxBanner && (
              <div
                key={fxBanner.key}
                className={`money-fx-pop-badge is-${fxBanner.type}`}
                aria-hidden="true"
              >
                {fxBanner.label}
              </div>
            )}

            {/* Question Header */}
            <div className="money-q-header">
              <div className="money-q-left-meta">
                <div className="money-q-num-pill">
                  CÂU {relativeIndex + 1} <span className="money-q-total">/ {totalCount}</span>
                </div>
                {splitEnabled && currentPart && (
                  <span className="money-q-part-chip">
                    {currentPart.name} · #{currentIndex + 1}/{questions.length}
                  </span>
                )}
              </div>

              <button
                type="button"
                className={`money-mastered-btn ${isMastered ? 'is-mastered' : ''}`}
                onClick={() => onToggleMastered(question.id)}
                title="Đánh dấu câu này đã thuộc (Phím tắt: M)"
              >
                <span>{isMastered ? '💎' : '✦'}</span>
                <span>{isMastered ? 'Đã sở hữu' : 'Đánh dấu đã học'}</span>
              </button>
            </div>

            {/* Question Text */}
            <h2
              className="money-question-text"
              data-hover-translate={question.text}
              data-hover-translate-kind="question"
            >
              {question.text}
            </h2>
            <QuestionImages images={question.images} />

            {/* Options / Free Response */}
            {isFreeResponse ? (
              <div className="money-free-wrap">
                <label htmlFor={`money-free-${question.id}`} className="money-free-label">
                  Nhập câu trả lời của bạn:
                </label>
                <textarea
                  id={`money-free-${question.id}`}
                  value={selectedAnswer ?? ''}
                  onChange={(e) => onSelectOption(e.target.value)}
                  placeholder="Nhập đáp án..."
                  rows={3}
                  className="money-free-textarea"
                />
              </div>
            ) : (
              <div className="money-options-stack">
                {question.options.map((opt) => {
                  const isSelected = selectedAnswer?.includes(opt.key) ?? false;
                  const isCorrect = question.correctAnswer.includes(opt.key);

                  let cardClass = 'money-option-card';
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
                      <span className="money-option-key">{opt.key}</span>
                      <span className="money-option-text" data-hover-translate={opt.text}>
                        {opt.text}
                      </span>

                      {(isAnswered || isRevealed) && !isUnresolved && isCorrect && (
                        <span className="money-option-status correct">✓</span>
                      )}
                      {(isAnswered || isRevealed) && isSelected && !isUnresolved && !isCorrect && (
                        <span className="money-option-status incorrect">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Feedback Box */}
            {(isAnswered || isRevealed) && (
              <div
                className={`money-feedback-box ${
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
                      💵 KA-CHING! Giao dịch chuẩn xác — đã cộng USD vào tài khoản Black Card của bạn (+35 XP).
                    </span>
                  ) : (
                    <span>
                      📉 Thị trường điều chỉnh (-$5,000). Đáp án chuẩn là: <strong>{question.correctAnswer}</strong>
                    </span>
                  )
                ) : (
                  <span>💎 Đáp án chuẩn của câu này là: <strong>{question.correctAnswer}</strong></span>
                )}
              </div>
            )}

            {/* Actions Bar */}
            <div className="money-actions-bar">
              <button
                type="button"
                className="money-prev-btn"
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
                className="money-reveal-btn"
                onClick={onToggleReveal}
                disabled={isAnswered}
                title="Xem đáp án (Phím tắt: Space)"
              >
                <span>{isAnswered ? '✓' : isRevealed ? '🙈' : '👁️'}</span>
                <span>{isAnswered ? 'Đã có đáp án' : isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
                {!isAnswered && <kbd className="money-kbd">Space</kbd>}
              </button>

              {isMultipleChoice && !isAnswered && (
                <button
                  type="button"
                  className="money-next-btn is-check-multi"
                  onClick={onCheckMultiple}
                  disabled={!selectedAnswer}
                >
                  Kiểm tra{selectedAnswer ? ` (${selectedAnswer.split('').join(', ')})` : ''}
                </button>
              )}

              <button
                type="button"
                className="money-next-btn"
                onClick={onNext}
                title="Phím tắt: → hoặc Enter"
              >
                {splitEnabled && currentPart
                  ? currentIndex === currentPart.endIndex
                    ? currentPartIndex === parts.length - 1
                      ? 'Chốt sổ & Kết quả'
                      : `Xong ${currentPart.name} →`
                    : 'Câu tiếp →'
                  : currentIndex === questions.length - 1
                  ? 'Chốt sổ & Kết quả'
                  : 'Câu tiếp →'}
              </button>
            </div>

            {/* Private Wealth Advisor AI */}
            <AskAI question={question} />

            {/* Keyboard Shortcuts Hint */}
            <div className="money-keyboard-hints">
              <span>⌨️ Phím tắt:</span>
              <kbd>A</kbd>
              <kbd>B</kbd>
              <kbd>C</kbd>
              <kbd>D</kbd> chọn · <kbd>Space</kbd> đáp án · <kbd>←</kbd> <kbd>→</kbd> chuyển câu ·{' '}
              <kbd>M</kbd> đã học
            </div>
          </section>
        </main>

        {/* RIGHT SIDEBAR: 3D Tilting Metal Black Card + 3 Finishes + Flying USD Mascot + Focus */}
        <aside className={`money-sidebar-right ${mobileDrawerOpen ? 'is-mobile-drawer-open' : 'is-mobile-drawer-closed'}`}>
          {/* Card 1: Interactive 3D Metal Black Card showing Live USD Net Worth */}
          <div className="money-widget-card money-blackcard-panel">
            <div className="money-widget-title-row">
              <span className="money-widget-title">💳 Private Black Card</span>
              <button
                type="button"
                className="money-rain-quick-btn"
                onClick={() => launchMoneyRain('MAKE IT RAIN · PRIVATE BONUS', '+$100 USD SHOWER')}
                title="Kích hoạt mưa tờ $100 USD thật!"
              >
                💵 Rain $100
              </button>
            </div>

            <div
              className={`money-3d-card finish-${moneyFinish}`}
              onMouseMove={handleBlackCardMove}
              onMouseLeave={handleBlackCardLeave}
              style={{
                transform: `perspective(700px) rotateX(${cardTilt.rx.toFixed(1)}deg) rotateY(${cardTilt.ry.toFixed(1)}deg)`,
                ['--glare-x' as string]: `${cardTilt.glareX.toFixed(0)}%`,
                ['--glare-y' as string]: `${cardTilt.glareY.toFixed(0)}%`,
              }}
            >
              <div className="money-card-glare" aria-hidden="true" />
              <div className="money-card-top">
                <span className="money-card-brand">KEYT PRIVATE</span>
                <span className="money-card-tier-tag">{activeFinishMeta.cardTitle}</span>
              </div>

              <div className="money-card-chip-row">
                {/* Engraved 24K Gold EMV Chip SVG */}
                <svg className="money-emv-chip" viewBox="0 0 42 32" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="40" height="30" rx="5" fill="url(#emvGold)" stroke="#f3d37a" strokeWidth="1.2" />
                  <path d="M1 11 H14 M28 11 H41 M1 21 H14 M28 21 H41 M14 1 V31 M28 1 V31" stroke="#785315" strokeWidth="1" opacity="0.7" />
                  <defs>
                    <linearGradient id="emvGold" x1="0" y1="0" x2="42" y2="32">
                      <stop offset="0%" stopColor="#fde68a" />
                      <stop offset="50%" stopColor="#d4af37" />
                      <stop offset="100%" stopColor="#926c15" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="money-card-contactless" aria-hidden="true">)))</span>
              </div>

              <div className="money-card-balance-label">NET WORTH · USD BALANCE</div>
              <div className="money-card-balance-val">{formatUSD(netWorth)}</div>

              <div className="money-card-foot">
                <span>{wealthRank}</span>
                <span className="money-card-num">•••• 9999</span>
              </div>
            </div>

            {/* 3 Luxury Material Finish Selector */}
            <div className="money-finish-pills" role="group" aria-label="Chọn chất liệu thẻ & két sắt">
              {VAULT_FINISHES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`money-finish-pill ${moneyFinish === f.id ? 'is-active' : ''}`}
                  onClick={() => handleSelectFinish(f.id)}
                  aria-pressed={moneyFinish === f.id}
                >
                  <span>{f.icon}</span>
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Flying USD Wings Mascot */}
          <div className="money-widget-card money-mascot-card">
            <div className="money-widget-title-row">
              <span className="money-widget-title">💸 Cọc Đô Có Cánh</span>
              <span className="money-gold-chip">USD</span>
            </div>

            <MoneyWingsMascot
              variant="sidebar"
              mood={moneyMood}
              finish={moneyFinish}
              comboCount={sessionCombo}
              mouseEffectsEnabled={mouseEffectsEnabled}
              onTriggerMakeItRain={() => launchMoneyRain('MAKE IT RAIN · $100 USD', 'WIRE TRANSFER APPROVED')}
            />
          </div>

          {/* Card 3: Focus Mode */}
          <div className="money-widget-card money-focus-card">
            <div className="money-focus-row">
              <div>
                <div className="money-widget-title">🔒 Private Focus</div>
                <p className="money-focus-desc">Tập trung 100%, tắt hiệu ứng phụ</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isFocus}
                className={`money-toggle-pill ${isFocus ? 'is-on' : ''}`}
                onClick={handleToggleFocus}
                aria-label="Bật tắt chế độ tập trung"
              >
                <span className="money-toggle-knob" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
