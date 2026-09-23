import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Question } from '../../utils/quizParser';
import {
  saveGameHighScore,
  getGameHighScore,
  saveMistakeQuestion,
} from '../../utils/gameStorage';
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playVictoryFanfare,
} from '../../utils/soundEffects';

interface TrueFalseGameProps {
  setId: string;
  setTitle?: string;
  questions: Question[];
  onBackToStudy: () => void;
  onOpenMistakes: () => void;
}

interface StatementItem {
  question: Question;
  pairingText: string;
  isActuallyTrue: boolean;
}

export default function TrueFalseGame({
  setId,
  questions,
  onBackToStudy,
  onOpenMistakes,
}: TrueFalseGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const highScore = getGameHighScore(setId, 'true_false');
  const timerRef = useRef<number | null>(null);

  // Generate statement deck
  const statements: StatementItem[] = useMemo(() => {
    const validQuestions = questions.filter((q) => q.options && q.options.length >= 2);
    const shuffled = [...validQuestions].sort(() => Math.random() - 0.5);

    return shuffled.map((q) => {
      const isTrue = Math.random() > 0.5;
      const correctOpt = q.options.find(
        (o) => o.key.toUpperCase() === q.correctAnswer.trim().toUpperCase()
      );
      const wrongOpts = q.options.filter(
        (o) => o.key.toUpperCase() !== q.correctAnswer.trim().toUpperCase()
      );

      let pairingText = '';
      if (isTrue && correctOpt) {
        pairingText = correctOpt.text;
      } else if (wrongOpts.length > 0) {
        pairingText = wrongOpts[Math.floor(Math.random() * wrongOpts.length)].text;
      } else {
        pairingText = correctOpt ? correctOpt.text : 'Đang xử lý';
      }

      return {
        question: q,
        pairingText,
        isActuallyTrue: isTrue,
      };
    });
  }, [questions]);

  // Start Blitz
  const startNewBlitz = useCallback(() => {
    setCardIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setSecondsLeft(5);
    setFeedback(null);
    setIsGameOver(false);
    setIsPlaying(true);
    playClickSound();
  }, []);

  // Per-statement 5s timer
  useEffect(() => {
    if (!isPlaying || isGameOver || feedback !== null) return;

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
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
  }, [isPlaying, isGameOver, cardIndex, feedback]);

  const currentItem = statements[cardIndex] || null;

  // Timeout handler (treated as wrong)
  useEffect(() => {
    if (isPlaying && secondsLeft === 0 && !isGameOver && feedback === null) {
      handleAnswer(null);
    }
  }, [secondsLeft, isPlaying, isGameOver, feedback]);

  // Handle user answering True or False
  const handleAnswer = (userChoseTrue: boolean | null) => {
    if (!isPlaying || isGameOver || feedback !== null || !currentItem) return;

    const isCorrect = userChoseTrue !== null && userChoseTrue === currentItem.isActuallyTrue;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setMaxStreak((prev) => Math.max(prev, nextStreak));
      setCorrectCount((prev) => prev + 1);
      setScore((prev) => prev + 50 * (nextStreak >= 5 ? 2 : 1));
      setFeedback('correct');
      playCorrectSound(nextStreak);
    } else {
      setStreak(0);
      setFeedback('wrong');
      playWrongSound();
      saveMistakeQuestion(setId, currentItem.question.id);
    }

    setTimeout(() => {
      setFeedback(null);
      setSecondsLeft(5);

      if (cardIndex < statements.length - 1) {
        setCardIndex((prev) => prev + 1);
      } else {
        // End game
        setIsGameOver(true);
        setIsPlaying(false);
        saveGameHighScore(setId, 'true_false', score + (isCorrect ? 50 : 0), maxStreak);
        playVictoryFanfare();
      }
    }, 380);
  };

  // Keyboard shortcut listener: 1/ArrowLeft = TRUE, 2/ArrowRight = FALSE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver || feedback !== null) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          startNewBlitz();
        }
        return;
      }

      if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, feedback, handleAnswer, startNewBlitz]);

  // 1. Splash Screen
  if (!isPlaying && !isGameOver) {
    return (
      <div className="game-card-surface game-splash-box">
        <div className="game-splash-header">
          <div className="game-icon-orb orb-neon">🎯</div>
          <h2 className="game-splash-title">Đúng Hay Sai 5 Giây</h2>
          <p className="game-splash-subtitle">
            Rèn luyện phản xạ phát hiện từ khóa bẫy! Hệ thống ghép ngẫu nhiên câu hỏi với một phương án — Bạn chỉ cần phán đoán Đúng hay Sai trong 5 giây!
          </p>
        </div>

        <div className="game-rule-cards">
          <div className="game-rule-card">
            <span className="rule-badge rule-green">5 Giây / Câu</span>
            <strong>Tốc độ cực nhanh</strong>
            <p>Không cần đọc hết 4 phương án, chỉ tập trung vào 1 mệnh đề duy nhất</p>
          </div>
          <div className="game-rule-card">
            <span className="rule-badge rule-purple">Phím tắt 1 & 2</span>
            <strong>Điều khiển thần tốc</strong>
            <p>Bấm [1] hoặc [←] cho ĐÚNG · Bấm [2] hoặc [→] cho SAI</p>
          </div>
        </div>

        <div className="game-best-record-strip">
          <span>🏆 Kỷ lục điểm: <strong>{highScore.score.toLocaleString()} điểm</strong> (Chuỗi {highScore.streak} câu)</span>
        </div>

        <div className="game-splash-actions">
          <button type="button" className="game-btn-primary game-btn-large" onClick={startNewBlitz}>
            🎯 BẮT ĐẦU BLITZ 5S (Space)
          </button>
          <button type="button" className="game-btn-ghost" onClick={onBackToStudy}>
            ← Quay lại học chuẩn
          </button>
        </div>
      </div>
    );
  }

  // 2. Game Over
  if (isGameOver) {
    return (
      <div className="game-card-surface game-result-box">
        <div className="game-result-crown">🎉 HOÀN THÀNH BLITZ!</div>
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
            <span className="stat-num stat-purple">{cardIndex + 1}</span>
            <span className="stat-label">Tổng câu đã duyệt</span>
          </div>
        </div>

        <div className="game-result-actions">
          <button type="button" className="game-btn-primary" onClick={startNewBlitz}>
            🔄 Chơi lại lượt mới (Space)
          </button>
          <button type="button" className="game-btn-secondary" onClick={onOpenMistakes}>
            🛡️ Xem các câu bị sai
          </button>
          <button type="button" className="game-btn-ghost" onClick={onBackToStudy}>
            ← Về trắc nghiệm chuẩn
          </button>
        </div>
      </div>
    );
  }

  // 3. Main Gameplay
  if (!currentItem) return null;

  return (
    <div className="game-gameplay-container">
      {/* HUD Bar */}
      <div className="game-hud-bar">
        <div className={`game-hud-timer-badge ${secondsLeft <= 2 ? 'timer-danger' : 'timer-normal'}`}>
          <span className="timer-icon">⏱️</span>
          <span className="timer-number">{secondsLeft}s</span>
        </div>

        <div className="game-hud-score-center">
          <div className="game-hud-score-value">{score.toLocaleString()}</div>
          <div className="game-hud-score-label">ĐIỂM</div>
        </div>

        <div className="game-hud-streak-box">
          <span className="streak-flame-icon">🔥</span>
          <div className="streak-meta">
            <span className="streak-count">{streak}</span>
            <span className="streak-title">{streak >= 5 ? 'x2.0 COMBO' : 'STREAK'}</span>
          </div>
        </div>
      </div>

      {/* Progress track */}
      <div className="game-hud-time-track">
        <div
          className={`game-hud-time-fill ${secondsLeft <= 2 ? 'timer-danger' : 'timer-neon'}`}
          style={{ width: `${(secondsLeft / 5) * 100}%` }}
        />
      </div>

      {/* Statement Card */}
      <div className={`game-question-card ${feedback ? `game-flash-${feedback}` : ''}`}>
        <div className="game-q-counter">
          <span>Mệnh đề #{cardIndex + 1} / {statements.length}</span>
          <span className="game-q-hint-key">Phím tắt: [1] hoặc [←] ĐÚNG  ·  [2] hoặc [→] SAI</span>
        </div>

        <div className="truefalse-context-box">
          <div className="truefalse-label">CÂU HỎI / TIỀN ĐỀ:</div>
          <div className="truefalse-question-text">{currentItem.question.text}</div>
        </div>

        <div className="truefalse-statement-box">
          <div className="truefalse-label">MỆNH ĐỀ GHÉP:</div>
          <div className="truefalse-statement-text">"{currentItem.pairingText}"</div>
        </div>

        {/* 2 Big Action Buttons */}
        <div className="truefalse-actions-grid">
          <button
            type="button"
            className="tf-btn tf-btn-true"
            disabled={feedback !== null}
            onClick={() => handleAnswer(true)}
          >
            <span className="tf-icon">✓</span>
            <span className="tf-title">ĐÚNG</span>
            <span className="tf-hint">(Phím 1 hoặc ←)</span>
          </button>

          <button
            type="button"
            className="tf-btn tf-btn-false"
            disabled={feedback !== null}
            onClick={() => handleAnswer(false)}
          >
            <span className="tf-icon">✗</span>
            <span className="tf-title">SAI</span>
            <span className="tf-hint">(Phím 2 hoặc →)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
