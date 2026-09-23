import { useState, useEffect, useCallback, useRef } from 'react';
import type { Question } from '../../utils/quizParser';
import {
  getGameHighScore,
  saveGameHighScore,
  saveMistakeQuestion,
} from '../../utils/gameStorage';
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playVictoryFanfare,
} from '../../utils/soundEffects';

interface TimeAttackGameProps {
  setId: string;
  setTitle?: string;
  questions: Question[];
  onBackToStudy: () => void;
  onOpenMistakes: () => void;
}

export default function TimeAttackGame({
  setId,
  questions,
  onBackToStudy,
  onOpenMistakes,
}: TimeAttackGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [timeBonusNotice, setTimeBonusNotice] = useState<string | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Deck of shuffled questions
  const [deck, setDeck] = useState<Question[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  const highScore = getGameHighScore(setId, 'time_attack');
  const timerRef = useRef<number | null>(null);

  // Initialize deck
  const startNewGame = useCallback(() => {
    // Shuffle questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCardIndex(0);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setTotalAttempted(0);
    setSelectedKey(null);
    setIsAnswering(false);
    setIsGameOver(false);
    setIsNewRecord(false);
    setIsPlaying(true);
    playClickSound();
  }, [questions]);

  // Main countdown timer
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isGameOver]);

  // Handle Game Over
  useEffect(() => {
    if (isPlaying && timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
      setIsPlaying(false);

      const achievedNew = saveGameHighScore(setId, 'time_attack', score, maxStreak);
      setIsNewRecord(achievedNew);

      if (achievedNew || score > 500) {
        playVictoryFanfare();
      } else {
        playWrongSound();
      }
    }
  }, [timeLeft, isPlaying, isGameOver, setId, score, maxStreak]);

  const currentQ = deck[cardIndex] || null;

  // Handle answer choice
  const handleSelectOption = useCallback(
    (chosenKey: string) => {
      if (!isPlaying || isGameOver || isAnswering || !currentQ) return;

      setIsAnswering(true);
      setSelectedKey(chosenKey);
      setTotalAttempted((prev) => prev + 1);

      const isCorrect = chosenKey.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase();

      if (isCorrect) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setMaxStreak((prev) => Math.max(prev, nextStreak));
        setCorrectCount((prev) => prev + 1);

        // Multiplier based on streak
        let multiplier = 1.0;
        if (nextStreak >= 10) multiplier = 3.0;
        else if (nextStreak >= 6) multiplier = 2.0;
        else if (nextStreak >= 3) multiplier = 1.5;

        const points = Math.round(100 * multiplier);
        setScore((prev) => prev + points);

        // +3 seconds bonus
        setTimeLeft((prev) => Math.min(prev + 3, 99));
        setTimeBonusNotice('+3s');
        setTimeout(() => setTimeBonusNotice(null), 800);

        playCorrectSound(nextStreak);
      } else {
        // Penalty: -5s & reset streak & save to mistake bank
        setStreak(0);
        saveMistakeQuestion(setId, currentQ.id);

        setTimeLeft((prev) => Math.max(prev - 5, 0));
        setTimeBonusNotice('-5s');
        setTimeout(() => setTimeBonusNotice(null), 800);

        playWrongSound();
      }

      // Next question fast transition (260ms)
      setTimeout(() => {
        setSelectedKey(null);
        setIsAnswering(false);

        if (cardIndex < deck.length - 1) {
          setCardIndex((prev) => prev + 1);
        } else {
          // If ran out of questions, re-shuffle and loop
          const reshuffled = [...questions].sort(() => Math.random() - 0.5);
          setDeck(reshuffled);
          setCardIndex(0);
        }
      }, 260);
    },
    [isPlaying, isGameOver, isAnswering, currentQ, streak, deck.length, cardIndex, questions, setId]
  );

  // Keyboard controls (A, B, C, D or 1, 2, 3, 4, Space to restart)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          startNewGame();
        }
        return;
      }

      if (!isPlaying) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          startNewGame();
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        e.preventDefault();
        handleSelectOption(key);
      } else if (e.key === '1') {
        e.preventDefault();
        handleSelectOption('A');
      } else if (e.key === '2') {
        e.preventDefault();
        handleSelectOption('B');
      } else if (e.key === '3') {
        e.preventDefault();
        handleSelectOption('C');
      } else if (e.key === '4') {
        e.preventDefault();
        handleSelectOption('D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, handleSelectOption, startNewGame]);

  // 1. Splash Screen before starting
  if (!isPlaying && !isGameOver) {
    return (
      <div className="game-card-surface game-splash-box">
        <div className="game-splash-header">
          <div className="game-icon-orb orb-orange">⚡</div>
          <h2 className="game-splash-title">Đấu Trí 60 Giây</h2>
          <p className="game-splash-subtitle">
            Chạy đua cùng thời gian! Trả lời thật nhanh để tích combo x3 điểm số và kéo dài thời gian sống còn.
          </p>
        </div>

        <div className="game-rule-cards">
          <div className="game-rule-card">
            <span className="rule-badge rule-green">+3 giây</span>
            <strong>Trả lời đúng</strong>
            <p>Được cộng thời gian & tích lũy combo điểm số</p>
          </div>
          <div className="game-rule-card">
            <span className="rule-badge rule-red">-5 giây</span>
            <strong>Trả lời sai</strong>
            <p>Bị trừ thời gian, đứt chuỗi combo & lưu vào sổ lỗi</p>
          </div>
          <div className="game-rule-card">
            <span className="rule-badge rule-purple">x3 Combo</span>
            <strong>Chuỗi thần tốc</strong>
            <p>Nhân đôi, nhân ba điểm số khi đúng 3, 6, 10 câu liên tục</p>
          </div>
        </div>

        <div className="game-best-record-strip">
          <span>🏆 Kỷ lục bộ đề: <strong>{highScore.score.toLocaleString()} điểm</strong> (Chuỗi {highScore.streak} câu)</span>
        </div>

        <div className="game-splash-actions">
          <button type="button" className="game-btn-primary game-btn-large" onClick={startNewGame}>
            🔥 BẮT ĐẦU CHƠI NGAY (Phím Space)
          </button>
          <button type="button" className="game-btn-ghost" onClick={onBackToStudy}>
            ← Quay lại học chuẩn
          </button>
        </div>
      </div>
    );
  }

  // 2. Game Over Modal / Result
  if (isGameOver) {
    const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

    return (
      <div className="game-card-surface game-result-box">
        <div className="game-result-crown">
          {isNewRecord ? '🎉 KỶ LỤC MỚI!' : '⏱️ HẾT GIỜ!'}
        </div>
        <h2 className="game-result-score">{score.toLocaleString()} <span className="game-score-unit">điểm</span></h2>

        <div className="game-stats-grid">
          <div className="game-stat-card">
            <span className="stat-num stat-orange">{maxStreak}</span>
            <span className="stat-label">Chuỗi đúng cao nhất</span>
          </div>
          <div className="game-stat-card">
            <span className="stat-num stat-green">{correctCount}</span>
            <span className="stat-label">Số câu đúng</span>
          </div>
          <div className="game-stat-card">
            <span className="stat-num">{accuracy}%</span>
            <span className="stat-label">Độ chính xác</span>
          </div>
          <div className="game-stat-card">
            <span className="stat-num stat-purple">{totalAttempted}</span>
            <span className="stat-label">Tổng câu đã giải</span>
          </div>
        </div>

        <div className="game-result-actions">
          <button type="button" className="game-btn-primary" onClick={startNewGame}>
            🔄 Chơi lại ván mới (Space)
          </button>
          <button type="button" className="game-btn-secondary" onClick={onOpenMistakes}>
            🛡️ Xem các câu sai để sửa
          </button>
          <button type="button" className="game-btn-ghost" onClick={onBackToStudy}>
            ← Về trắc nghiệm chuẩn
          </button>
        </div>
      </div>
    );
  }

  // 3. Main Gameplay HUD & Question
  if (!currentQ) return null;

  const timerColorClass = timeLeft <= 10 ? 'timer-danger' : timeLeft <= 20 ? 'timer-warning' : 'timer-normal';

  return (
    <div className="game-gameplay-container">
      {/* Game HUD Bar */}
      <div className="game-hud-bar">
        {/* Timer */}
        <div className={`game-hud-timer-badge ${timerColorClass}`}>
          <span className="timer-icon">⏳</span>
          <span className="timer-number">{timeLeft}s</span>
          {timeBonusNotice && (
            <span className={`timer-bonus-bubble ${timeBonusNotice.startsWith('+') ? 'bonus-plus' : 'bonus-minus'}`}>
              {timeBonusNotice}
            </span>
          )}
        </div>

        {/* Score & Combo */}
        <div className="game-hud-score-center">
          <div className="game-hud-score-value">{score.toLocaleString()}</div>
          <div className="game-hud-score-label">ĐIỂM</div>
        </div>

        {/* Streak Flame */}
        <div className="game-hud-streak-box">
          <span className="streak-flame-icon">🔥</span>
          <div className="streak-meta">
            <span className="streak-count">{streak}</span>
            <span className="streak-title">
              {streak >= 10 ? 'x3.0 COMBO' : streak >= 6 ? 'x2.0 COMBO' : streak >= 3 ? 'x1.5 COMBO' : 'STREAK'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="game-hud-time-track">
        <div
          className={`game-hud-time-fill ${timerColorClass}`}
          style={{ width: `${Math.min((timeLeft / 60) * 100, 100)}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="game-question-card">
        <div className="game-q-counter">
          <span>Câu số #{cardIndex + 1}</span>
          <span className="game-q-hint-key">Phím tắt: A · B · C · D hoặc 1 · 2 · 3 · 4</span>
        </div>

        <div className="game-q-text">{currentQ.text}</div>

        <div className="game-q-options">
          {currentQ.options.map((opt) => {
            const isSelected = selectedKey === opt.key;
            const isCorrectAnswer = opt.key.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase();

            let optStateClass = '';
            if (isAnswering) {
              if (isSelected) {
                optStateClass = isCorrectAnswer ? 'opt-flash-correct' : 'opt-flash-wrong';
              } else if (isCorrectAnswer) {
                optStateClass = 'opt-flash-correct';
              }
            }

            return (
              <button
                key={opt.key}
                type="button"
                className={`game-q-opt-btn ${optStateClass}`}
                disabled={isAnswering}
                onClick={() => handleSelectOption(opt.key)}
              >
                <span className="opt-key-circle">{opt.key}</span>
                <span className="opt-label-text">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
