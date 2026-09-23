import { useState, useEffect, useCallback, useRef } from 'react';
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
  playLifelineSound,
  playVictoryFanfare,
} from '../../utils/soundEffects';

interface SurvivalTowerGameProps {
  setId: string;
  setTitle?: string;
  questions: Question[];
  onBackToStudy: () => void;
  onOpenMistakes: () => void;
}

export default function SurvivalTowerGame({
  setId,
  questions,
  onBackToStudy,
  onOpenMistakes,
}: SurvivalTowerGameProps) {
  const maxFloors = Math.min(questions.length, 50);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [lives, setLives] = useState(3);
  const [floorTime, setFloorTime] = useState(25);
  const [isFrozen, setIsFrozen] = useState(false);
  const [checkpointFloor, setCheckpointFloor] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Lifelines availability
  const [used5050, setUsed5050] = useState(false);
  const [usedFreeze, setUsedFreeze] = useState(false);
  const [usedSwap, setUsedSwap] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);

  // Current deck of questions
  const [deck, setDeck] = useState<Question[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  const floorTimerRef = useRef<number | null>(null);
  const highScore = getGameHighScore(setId, 'tower');

  // Start new tower expedition
  const startNewRun = useCallback(
    (fromCheckpoint = 1) => {
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setCurrentFloor(fromCheckpoint);
      setCheckpointFloor(fromCheckpoint);
      setLives(3);
      setFloorTime(25);
      setIsFrozen(false);
      setUsed5050(false);
      setUsedFreeze(false);
      setUsedSwap(false);
      setHiddenOptions([]);
      setSelectedKey(null);
      setIsAnswering(false);
      setIsGameOver(false);
      setIsVictory(false);
      setIsPlaying(true);
      playClickSound();
    },
    [questions]
  );

  // Per-floor countdown timer
  useEffect(() => {
    if (!isPlaying || isGameOver || isVictory || isFrozen) return;

    floorTimerRef.current = window.setInterval(() => {
      setFloorTime((prev) => {
        if (prev <= 1) {
          clearInterval(floorTimerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (floorTimerRef.current) clearInterval(floorTimerRef.current);
    };
  }, [isPlaying, isGameOver, isVictory, isFrozen, currentFloor]);

  // Handle timeout (counts as wrong answer)
  useEffect(() => {
    if (isPlaying && floorTime === 0 && !isGameOver && !isVictory && !isAnswering) {
      handleTimeout();
    }
  }, [floorTime, isPlaying, isGameOver, isVictory, isAnswering]);

  const currentQ = deck[currentFloor - 1] || null;

  // Handle Timeout
  const handleTimeout = () => {
    playWrongSound();
    if (currentQ) saveMistakeQuestion(setId, currentQ.id);

    const nextLives = lives - 1;
    setLives(nextLives);

    if (nextLives <= 0) {
      finishGame(false);
    } else {
      // Retry or advance
      setFloorTime(25);
      setIsFrozen(false);
      setHiddenOptions([]);
      if (currentFloor < maxFloors) {
        setCurrentFloor((prev) => prev + 1);
      }
    }
  };

  const finishGame = (victory: boolean) => {
    setIsGameOver(true);
    setIsPlaying(false);
    setIsVictory(victory);

    saveGameHighScore(setId, 'tower', currentFloor, currentFloor);

    if (victory) {
      playVictoryFanfare();
    } else {
      playWrongSound();
    }
  };

  // Handle answer choice
  const handleSelectOption = useCallback(
    (chosenKey: string) => {
      if (!isPlaying || isGameOver || isVictory || isAnswering || !currentQ) return;

      setIsAnswering(true);
      setSelectedKey(chosenKey);

      const isCorrect = chosenKey.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase();

      if (isCorrect) {
        playCorrectSound(currentFloor);

        // Checkpoint update every 10 floors
        if (currentFloor % 10 === 0 && currentFloor < maxFloors) {
          setCheckpointFloor(currentFloor + 1);
        }

        setTimeout(() => {
          setSelectedKey(null);
          setIsAnswering(false);
          setHiddenOptions([]);
          setIsFrozen(false);
          setFloorTime(25);

          if (currentFloor >= maxFloors) {
            finishGame(true);
          } else {
            setCurrentFloor((prev) => prev + 1);
          }
        }, 320);
      } else {
        // Wrong answer
        playWrongSound();
        saveMistakeQuestion(setId, currentQ.id);

        const nextLives = lives - 1;
        setLives(nextLives);

        setTimeout(() => {
          setSelectedKey(null);
          setIsAnswering(false);

          if (nextLives <= 0) {
            finishGame(false);
          } else {
            setHiddenOptions([]);
            setIsFrozen(false);
            setFloorTime(25);
            if (currentFloor < maxFloors) {
              setCurrentFloor((prev) => prev + 1);
            }
          }
        }, 320);
      }
    },
    [isPlaying, isGameOver, isVictory, isAnswering, currentQ, currentFloor, maxFloors, lives, setId]
  );

  // Lifeline 1: 50:50
  const useLifeline5050 = () => {
    if (used5050 || !currentQ || isAnswering) return;
    playLifelineSound();
    setUsed5050(true);

    const correctKey = currentQ.correctAnswer.trim().toUpperCase();
    const incorrectKeys = currentQ.options
      .map((o) => o.key.toUpperCase())
      .filter((k) => k !== correctKey);

    // Pick 2 random incorrect keys to hide
    const shuffledIncorrect = [...incorrectKeys].sort(() => Math.random() - 0.5);
    setHiddenOptions(shuffledIncorrect.slice(0, 2));
  };

  // Lifeline 2: Freeze Time 15s
  const useLifelineFreeze = () => {
    if (usedFreeze || isAnswering) return;
    playLifelineSound();
    setUsedFreeze(true);
    setIsFrozen(true);
    setFloorTime((prev) => prev + 15);
  };

  // Lifeline 3: Swap Question
  const useLifelineSwap = () => {
    if (usedSwap || !currentQ || isAnswering) return;
    playLifelineSound();
    setUsedSwap(true);
    setHiddenOptions([]);

    // Pick another random question from remaining pool
    const unusedQuestions = questions.filter((q) => q.id !== currentQ.id);
    if (unusedQuestions.length > 0) {
      const replacement = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
      setDeck((prev) => {
        const copy = [...prev];
        copy[currentFloor - 1] = replacement;
        return copy;
      });
      setFloorTime(25);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || isVictory) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          startNewRun(1);
        }
        return;
      }

      if (!isPlaying) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          startNewRun(1);
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        if (!hiddenOptions.includes(key)) {
          e.preventDefault();
          handleSelectOption(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, isVictory, hiddenOptions, handleSelectOption, startNewRun]);

  // 1. Splash Screen
  if (!isPlaying && !isGameOver && !isVictory) {
    return (
      <div className="game-card-surface game-splash-box">
        <div className="game-splash-header">
          <div className="game-icon-orb orb-purple">👑</div>
          <h2 className="game-splash-title">Leo Tháp Sinh Tồn</h2>
          <p className="game-splash-subtitle">
            Chinh phục {maxFloors} tầng tháp câu hỏi với 3 Trái tim sinh mạng và 3 Quyền trợ giúp tối thượng!
          </p>
        </div>

        <div className="game-rule-cards">
          <div className="game-rule-card">
            <span className="rule-badge rule-red">3 Trái Tim ❤️</span>
            <strong>Sinh mạng hữu hạn</strong>
            <p>Mỗi câu trả lời sai bị mất 1 tim. Hết tim là dừng cuộc chơi!</p>
          </div>
          <div className="game-rule-card">
            <span className="rule-badge rule-purple">Mốc an toàn</span>
            <strong>Cứu cánh tầng 10, 20...</strong>
            <p>Vượt qua mỗi 10 tầng sẽ lưu điểm hồi sinh an toàn</p>
          </div>
          <div className="game-rule-card">
            <span className="rule-badge rule-green">3 Quyền trợ giúp</span>
            <strong>50:50 · Đóng băng · Đổi câu</strong>
            <p>Sử dụng khôn ngoan khi gặp các câu bẫy khó</p>
          </div>
        </div>

        <div className="game-best-record-strip">
          <span>🏆 Kỷ lục tầng cao nhất: <strong>Tầng {highScore.score || 0} / {maxFloors}</strong></span>
        </div>

        <div className="game-splash-actions">
          <button type="button" className="game-btn-primary game-btn-large" onClick={() => startNewRun(1)}>
            👑 BẮT ĐẦU LEO THÁP (Space)
          </button>
          <button type="button" className="game-btn-ghost" onClick={onBackToStudy}>
            ← Quay lại học chuẩn
          </button>
        </div>
      </div>
    );
  }

  // 2. Victory / Game Over Screen
  if (isGameOver || isVictory) {
    return (
      <div className="game-card-surface game-result-box">
        <div className="game-result-crown">
          {isVictory ? '🏆 HOÀN THÀNH ĐỈNH THÁP!' : '💀 BẠN ĐÃ RƠI ĐÀI!'}
        </div>
        <h2 className="game-result-score">
          Tầng {currentFloor} / {maxFloors}
        </h2>
        <p className="game-result-subtext">
          {isVictory
            ? `Xuất sắc! Bạn đã vượt qua toàn bộ ${maxFloors} tầng hiểm trở của bộ đề!`
            : checkpointFloor > 1
            ? `Bạn có thể hồi sinh từ mốc an toàn Tầng ${checkpointFloor} để tiếp tục leo!`
            : 'Đừng nản chí! Hãy thử lại để chinh phục các tầng cao hơn.'}
        </p>

        <div className="game-result-actions">
          {checkpointFloor > 1 && !isVictory && (
            <button
              type="button"
              className="game-btn-primary"
              onClick={() => startNewRun(checkpointFloor)}
            >
              🔄 Hồi sinh tại Tầng {checkpointFloor}
            </button>
          )}
          <button
            type="button"
            className={checkpointFloor > 1 && !isVictory ? 'game-btn-secondary' : 'game-btn-primary'}
            onClick={() => startNewRun(1)}
          >
            🏰 Leo tháp từ đầu (Tầng 1)
          </button>
          <button type="button" className="game-btn-secondary" onClick={onOpenMistakes}>
            🛡️ Xem lại các câu bị sai
          </button>
          <button type="button" className="game-btn-ghost" onClick={onBackToStudy}>
            ← Về trắc nghiệm chuẩn
          </button>
        </div>
      </div>
    );
  }

  // 3. Main Gameplay
  if (!currentQ) return null;

  return (
    <div className="game-gameplay-container">
      {/* Tower HUD Bar */}
      <div className="game-hud-bar game-hud-tower">
        {/* Floor Indicator */}
        <div className="tower-floor-badge">
          <span className="tower-icon">🏰</span>
          <div>
            <span className="tower-floor-num">TẦNG {currentFloor}</span>
            <span className="tower-floor-max"> / {maxFloors}</span>
          </div>
        </div>

        {/* Lives (Hearts) */}
        <div className="tower-lives-box" title={`Còn lại ${lives} mạng`}>
          {[1, 2, 3].map((heartIndex) => (
            <span
              key={heartIndex}
              className={`tower-heart ${heartIndex <= lives ? 'heart-alive' : 'heart-lost'}`}
            >
              {heartIndex <= lives ? '❤️' : '🖤'}
            </span>
          ))}
        </div>

        {/* Floor Timer */}
        <div className={`tower-timer-pill ${floorTime <= 5 ? 'timer-danger' : ''}`}>
          {isFrozen ? '❄️ 15s' : `⏱️ ${floorTime}s`}
        </div>
      </div>

      {/* Lifeline Buttons */}
      <div className="tower-lifelines-strip">
        <span className="lifelines-label">Trợ giúp:</span>
        <button
          type="button"
          className={`lifeline-btn ${used5050 ? 'is-used' : ''}`}
          disabled={used5050 || isAnswering}
          onClick={useLifeline5050}
          title="Ẩn 2 đáp án sai ngẫu nhiên"
        >
          🛡️ 50:50 {used5050 && '✓'}
        </button>

        <button
          type="button"
          className={`lifeline-btn ${usedFreeze ? 'is-used' : ''}`}
          disabled={usedFreeze || isAnswering}
          onClick={useLifelineFreeze}
          title="Đóng băng thời gian thêm 15 giây"
        >
          ❄️ Đóng băng {usedFreeze && '✓'}
        </button>

        <button
          type="button"
          className={`lifeline-btn ${usedSwap ? 'is-used' : ''}`}
          disabled={usedSwap || isAnswering}
          onClick={useLifelineSwap}
          title="Đổi câu hỏi này sang câu hỏi khác"
        >
          🔄 Đổi câu {usedSwap && '✓'}
        </button>
      </div>

      {/* Question Card */}
      <div className="game-question-card">
        <div className="game-q-counter">
          <span>Thử thách Tầng #{currentFloor}</span>
          <span className="game-q-hint-key">Phím tắt: A · B · C · D</span>
        </div>

        <div className="game-q-text">{currentQ.text}</div>

        <div className="game-q-options">
          {currentQ.options.map((opt) => {
            const isHidden = hiddenOptions.includes(opt.key.toUpperCase());
            const isSelected = selectedKey === opt.key;
            const isCorrectAnswer = opt.key.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase();

            if (isHidden) {
              return (
                <div key={opt.key} className="game-q-opt-hidden">
                  <span className="opt-key-circle">{opt.key}</span>
                  <span className="opt-label-text opt-eliminated">(Đã loại trừ 50:50)</span>
                </div>
              );
            }

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
