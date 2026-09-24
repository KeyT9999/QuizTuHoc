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

const TOTAL_FLOORS = 50;

// Emoji Avatars available for the player
const AVATARS = [
  { id: 'climber', emoji: '🧗', name: 'Nhà leo núi' },
  { id: 'hero', emoji: '🦸', name: 'Siêu anh hùng' },
  { id: 'ninja', emoji: '🥷', name: 'Ninja' },
  { id: 'wizard', emoji: '🧙‍♂️', name: 'Pháp sư' },
  { id: 'cat', emoji: '🐱', name: 'Mèo dũng cảm' },
  { id: 'robot', emoji: '🤖', name: 'Chiến binh Mech' },
];

// Zone styling helper for 50 floors
function getZoneInfo(floor: number) {
  if (floor === 50) {
    return {
      name: 'Đỉnh Tháp Huyền Thoại',
      tag: '👑 THÁP ĐỈNH',
      badgeClass: 'badge-apex',
      color: '#f59e0b',
      icon: '👑',
    };
  }
  if (floor >= 41) {
    return {
      name: 'Vực Hỏa Ngục',
      tag: '🌋 HỎA NGỤC',
      badgeClass: 'badge-lava',
      color: '#ef4444',
      icon: '🔥',
    };
  }
  if (floor >= 31) {
    return {
      name: 'Tầng Lôi Điện',
      tag: '⚡ LÔI ĐIỆN',
      badgeClass: 'badge-storm',
      color: '#a855f7',
      icon: '⚡',
    };
  }
  if (floor >= 21) {
    return {
      name: 'Vương Triều Pha Lê',
      tag: '💎 PHA LÊ',
      badgeClass: 'badge-crystal',
      color: '#06b6d4',
      icon: '💎',
    };
  }
  if (floor >= 11) {
    return {
      name: 'Rừng Rậm Cổ Thụ',
      tag: '🌲 CỔ THỤ',
      badgeClass: 'badge-forest',
      color: '#10b981',
      icon: '🌿',
    };
  }
  return {
    name: 'Chân Tháp Thạch Bi',
    tag: '🧱 CHÂN THÁP',
    badgeClass: 'badge-stone',
    color: '#64748b',
    icon: '🗿',
  };
}

export default function SurvivalTowerGame({
  setId,
  questions,
  onBackToStudy,
  onOpenMistakes,
}: SurvivalTowerGameProps) {
  // Game progress states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [lives, setLives] = useState(3);
  const [floorTime, setFloorTime] = useState(25);
  const [isFrozen, setIsFrozen] = useState(false);
  const [checkpointFloor, setCheckpointFloor] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [streak, setStreak] = useState(0);

  // Avatar & Visual states
  const [avatar, setAvatar] = useState('🧗');
  const [characterState, setCharacterState] = useState<'idle' | 'climbing' | 'falling'>('idle');
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'correct' | 'wrong' | 'timeout';
    message: string;
    subtext?: string;
  } | null>(null);

  // Lifelines availability
  const [used5050, setUsed5050] = useState(false);
  const [usedFreeze, setUsedFreeze] = useState(false);
  const [usedSwap, setUsedSwap] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);

  // Current deck of 50 questions
  const [deck, setDeck] = useState<Question[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Mobile drawer state
  const [showMobileTower, setShowMobileTower] = useState(false);

  const floorTimerRef = useRef<number | null>(null);
  const activeFloorRef = useRef<HTMLDivElement | null>(null);
  const towerScrollRef = useRef<HTMLDivElement | null>(null);
  const highScore = getGameHighScore(setId, 'tower');

  // Build deck with exactly 50 questions (repeating/shuffling if question set has fewer than 50)
  const prepareDeck = useCallback(() => {
    if (questions.length === 0) return [];
    let pool = [...questions].sort(() => Math.random() - 0.5);
    while (pool.length < TOTAL_FLOORS) {
      const extra = [...questions].sort(() => Math.random() - 0.5);
      pool = [...pool, ...extra];
    }
    return pool.slice(0, TOTAL_FLOORS);
  }, [questions]);

  // Start new tower expedition
  const startNewRun = useCallback(
    (fromCheckpoint = 1) => {
      const newDeck = prepareDeck();
      setDeck(newDeck);
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
      setCharacterState('idle');
      setActionFeedback(null);
      setStreak(0);
      setIsGameOver(false);
      setIsVictory(false);
      setIsPlaying(true);
      playClickSound();
    },
    [prepareDeck]
  );

  // Scroll active floor into view in the tower viewport
  const scrollToActiveFloor = useCallback(() => {
    if (activeFloorRef.current) {
      activeFloorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(scrollToActiveFloor, 120);
      return () => clearTimeout(timer);
    }
  }, [currentFloor, isPlaying, scrollToActiveFloor]);

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

  // Handle timeout (counts as wrong answer -> falls 2 floors!)
  useEffect(() => {
    if (isPlaying && floorTime === 0 && !isGameOver && !isVictory && !isAnswering) {
      handleTimeout();
    }
  }, [floorTime, isPlaying, isGameOver, isVictory, isAnswering]);

  const currentQ = deck[currentFloor - 1] || null;

  // Handle Timeout: Drop 2 floors and lose 1 life
  const handleTimeout = () => {
    playWrongSound();
    if (currentQ) saveMistakeQuestion(setId, currentQ.id);

    setIsAnswering(true);
    setCharacterState('falling');
    setStreak(0);

    const nextLives = lives - 1;
    const targetFloor = Math.max(1, currentFloor - 2);

    setActionFeedback({
      type: 'timeout',
      message: `⏱️ HẾT GIỜ! RỚT 2 TẦNG!`,
      subtext: `Tụt từ Tầng ${currentFloor} xuống Tầng ${targetFloor} (-1 ❤️)`,
    });

    setTimeout(() => {
      setLives(nextLives);
      setIsAnswering(false);
      setCharacterState('idle');
      setActionFeedback(null);

      if (nextLives <= 0) {
        finishGame(false, targetFloor);
      } else {
        setFloorTime(25);
        setIsFrozen(false);
        setHiddenOptions([]);
        setCurrentFloor(targetFloor);
      }
    }, 850);
  };

  const finishGame = (victory: boolean, finalFloor: number) => {
    setIsGameOver(true);
    setIsPlaying(false);
    setIsVictory(victory);

    saveGameHighScore(setId, 'tower', finalFloor, finalFloor);

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
        // Correct answer: Climb +1 floor
        playCorrectSound(currentFloor);
        setCharacterState('climbing');
        setStreak((s) => s + 1);

        const isLastFloor = currentFloor >= TOTAL_FLOORS;
        const nextFloor = isLastFloor ? TOTAL_FLOORS : currentFloor + 1;

        // Checkpoint update every 10 floors (10, 20, 30, 40)
        if (currentFloor % 10 === 0 && currentFloor < TOTAL_FLOORS) {
          setCheckpointFloor(currentFloor + 1);
        }

        setActionFeedback({
          type: 'correct',
          message: isLastFloor
            ? '🏆 CHINH PHỤC ĐỈNH THÁP 50 TẦNG!'
            : `🎉 CHÍNH XÁC! LEO LÊN TẦNG ${nextFloor} ⬆️`,
          subtext: isLastFloor
            ? 'Bạn đã trở thành Nhà Vô Địch Tối Thượng!'
            : streak >= 2
            ? `🔥 Chuỗi leo ${streak + 1} tầng liên tiếp!`
            : 'Vượt qua thử thách thành công!',
        });

        setTimeout(() => {
          setSelectedKey(null);
          setIsAnswering(false);
          setCharacterState('idle');
          setHiddenOptions([]);
          setIsFrozen(false);
          setFloorTime(25);
          setActionFeedback(null);

          if (isLastFloor) {
            finishGame(true, TOTAL_FLOORS);
          } else {
            setCurrentFloor(nextFloor);
          }
        }, 700);
      } else {
        // Wrong answer: Drop 2 floors and lose 1 heart!
        playWrongSound();
        if (currentQ) saveMistakeQuestion(setId, currentQ.id);

        setCharacterState('falling');
        setStreak(0);

        const nextLives = lives - 1;
        const targetFloor = Math.max(1, currentFloor - 2);

        setActionFeedback({
          type: 'wrong',
          message: `💥 SAI RỒI! RỚT 2 TẦNG! ⬇️⬇️`,
          subtext: `Tụt từ Tầng ${currentFloor} xuống Tầng ${targetFloor} (-1 ❤️)`,
        });

        setTimeout(() => {
          setSelectedKey(null);
          setIsAnswering(false);
          setCharacterState('idle');
          setActionFeedback(null);
          setLives(nextLives);

          if (nextLives <= 0) {
            finishGame(false, targetFloor);
          } else {
            setHiddenOptions([]);
            setIsFrozen(false);
            setFloorTime(25);
            setCurrentFloor(targetFloor);
          }
        }, 850);
      }
    },
    [isPlaying, isGameOver, isVictory, isAnswering, currentQ, currentFloor, streak, lives, setId]
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

  // Array of 50 floors for rendering top-down: 50, 49, ..., 1
  const floorRows = Array.from({ length: TOTAL_FLOORS }, (_, i) => TOTAL_FLOORS - i);
  const currentZone = getZoneInfo(currentFloor);

  // 1. Splash Screen
  if (!isPlaying && !isGameOver && !isVictory) {
    return (
      <div className="game-card-surface tower-splash-card">
        <div className="tower-splash-hero">
          <div className="tower-splash-emojis">
            <span className="splash-castle-emoji">🏰</span>
            <span className="splash-climber-emoji">{avatar}</span>
            <span className="splash-apex-crown">👑</span>
          </div>
          <h1 className="tower-splash-title">LEO THÁP 50 TẦNG</h1>
          <p className="tower-splash-tagline">
            Đúng leo 1 tầng ⬆️ · Sai rớt 2 tầng ⬇️⬇️ · Chinh phục đỉnh tháp quang vinh!
          </p>
        </div>

        {/* Avatar Selection */}
        <div className="tower-avatar-picker-section">
          <div className="avatar-picker-title">CHỌN NHÂN VẬT CỦA BẠN:</div>
          <div className="avatar-picker-list">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                className={`avatar-option-btn ${avatar === av.emoji ? 'is-selected' : ''}`}
                onClick={() => {
                  setAvatar(av.emoji);
                  playClickSound();
                }}
              >
                <span className="avatar-emoji-display">{av.emoji}</span>
                <span className="avatar-name-display">{av.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rule Cards */}
        <div className="tower-rule-grid">
          <div className="tower-rule-item item-climb">
            <div className="rule-item-icon">⬆️</div>
            <div className="rule-item-body">
              <strong>Đúng: Leo +1 Tầng</strong>
              <p>Mỗi câu trả lời đúng đưa nhân vật leo lên 1 tầng cao hơn</p>
            </div>
          </div>

          <div className="tower-rule-item item-fall">
            <div className="rule-item-icon">⬇️</div>
            <div className="rule-item-body">
              <strong>Sai: Rớt -2 Tầng + Mất 1 ❤️</strong>
              <p>Trả lời sai hoặc hết giờ sẽ trượt dốc 2 tầng và mất 1 sinh mạng!</p>
            </div>
          </div>

          <div className="tower-rule-item item-checkpoint">
            <div className="rule-item-icon">⛺</div>
            <div className="rule-item-body">
              <strong>Trạm an toàn Tầng 10, 20, 30, 40</strong>
              <p>Vượt qua các mốc này sẽ mở điểm hồi sinh khi không may rơi đài</p>
            </div>
          </div>

          <div className="tower-rule-item item-apex">
            <div className="rule-item-icon">👑</div>
            <div className="rule-item-body">
              <strong>Đỉnh Tháp Tầng 50</strong>
              <p>Đạt Tầng 50 để mở khoá Vương miện chiến thắng tối thượng!</p>
            </div>
          </div>
        </div>

        {/* High Score Banner */}
        <div className="tower-highscore-strip">
          <span>🏆 Kỷ lục cao nhất của bạn: <strong>Tầng {highScore.score || 0} / 50</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="tower-splash-actions">
          <button
            type="button"
            className="tower-btn-start game-btn-large"
            onClick={() => startNewRun(1)}
          >
            {avatar} BẮT ĐẦU LEO THÁP NGAY (Space)
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
      <div className="game-card-surface tower-result-card">
        <div className="tower-result-emojis">
          {isVictory ? (
            <div className="victory-emoji-banner">
              <span className="trophy-sparkle">✨</span>
              <span className="victory-avatar">{avatar}</span>
              <span className="trophy-crown">👑</span>
              <span className="trophy-cup">🏆</span>
            </div>
          ) : (
            <div className="defeat-emoji-banner">
              <span className="defeat-skull">💀</span>
              <span className="defeat-avatar">{avatar}</span>
              <span className="defeat-splash">💥</span>
            </div>
          )}
        </div>

        <h2 className="tower-result-heading">
          {isVictory ? 'ĐỈNH THÁP HUYỀN THOẠI ĐÃ BỊ CHINH PHỤC!' : 'BẠN ĐÃ RƠI KHỎI THÁP!'}
        </h2>

        <div className="tower-result-floor-badge">
          <span>{isVictory ? '👑 ĐẠT ĐỈNH TỐI CAO' : 'DỪNG CHÂN TẠI'}</span>
          <strong>TẦNG {currentFloor} / 50</strong>
        </div>

        <p className="tower-result-message">
          {isVictory
            ? `Tuyệt đỉnh thần sầu! Bạn đã xuất sắc leo qua 50 tầng tháp cam go và trở thành Huyền Thoại!`
            : checkpointFloor > 1
            ? `Bạn có điểm lưu an toàn tại Tầng ${checkpointFloor}. Hãy tiếp tục hành trình!`
            : 'Đừng bỏ cuộc! Hãy tôi luyện và leo lại để bứt phá kỷ lục mới!'}
        </p>

        <div className="tower-result-actions">
          {checkpointFloor > 1 && !isVictory && (
            <button
              type="button"
              className="tower-btn-start"
              onClick={() => startNewRun(checkpointFloor)}
            >
              🔄 Hồi sinh tại Trạm Tầng {checkpointFloor}
            </button>
          )}
          <button
            type="button"
            className={checkpointFloor > 1 && !isVictory ? 'game-btn-secondary' : 'tower-btn-start'}
            onClick={() => startNewRun(1)}
          >
            🏰 Leo tháp từ đầu (Tầng 1)
          </button>
          <button type="button" className="game-btn-secondary" onClick={onOpenMistakes}>
            🛡️ Ôn lại câu sai
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
    <div className="tower-game-wrapper">
      {/* Mobile Top Progress Strip */}
      <div className="tower-mobile-strip">
        <div className="mobile-strip-left">
          <span className="mobile-avatar">{avatar}</span>
          <span className="mobile-floor-text">Tầng {currentFloor}/50</span>
          <span className={`mobile-zone-pill ${currentZone.badgeClass}`}>{currentZone.tag}</span>
        </div>
        <button
          type="button"
          className="mobile-view-tower-btn"
          onClick={() => setShowMobileTower(!showMobileTower)}
        >
          🏰 {showMobileTower ? 'Ẩn tháp' : 'Xem tháp'}
        </button>
      </div>

      <div className="survival-tower-arena">
        {/* Left Column: Visual 50-Floor Tower */}
        <aside className={`tower-side-pane ${showMobileTower ? 'mobile-visible' : ''}`}>
          <div className="tower-pane-header">
            <div className="tower-pane-title">
              <span className="tower-castle-icon">🏰</span>
              <div>
                <strong>THÁP 50 TẦNG</strong>
                <div className="tower-height-stat">Độ cao: {Math.round((currentFloor / 50) * 100)}%</div>
              </div>
            </div>

            <button
              type="button"
              className="tower-locate-btn"
              onClick={scrollToActiveFloor}
              title="Cuộn tới vị trí nhân vật"
            >
              🎯 Vị trí
            </button>
          </div>

          {/* Vertical scrollable tower floors */}
          <div className="tower-viewport" ref={towerScrollRef}>
            <div className="tower-ladder-rail" />

            {floorRows.map((floorNum) => {
              const isCurrent = floorNum === currentFloor;
              const isCleared = floorNum < currentFloor;
              const isCheckpoint = [10, 20, 30, 40].includes(floorNum);
              const isApex = floorNum === 50;
              const zone = getZoneInfo(floorNum);

              let rowClass = 'tower-floor-row';
              if (isCurrent) rowClass += ' is-current';
              if (isCleared) rowClass += ' is-cleared';
              if (isCheckpoint) rowClass += ' is-checkpoint';
              if (isApex) rowClass += ' is-apex';

              return (
                <div
                  key={floorNum}
                  ref={isCurrent ? activeFloorRef : null}
                  className={`${rowClass} ${zone.badgeClass}`}
                  data-floor={floorNum}
                >
                  {/* Floor number & badge */}
                  <div className="floor-num-tag">
                    <span className="floor-num-digits">{floorNum}</span>
                    {isApex && <span className="floor-apex-icon">👑</span>}
                    {isCheckpoint && !isApex && <span className="floor-camp-icon">⛺</span>}
                  </div>

                  {/* Floor Ledge & Platform */}
                  <div className="floor-platform">
                    {isCurrent && (
                      <div
                        className={`tower-climber-token ${
                          characterState === 'climbing'
                            ? 'is-climbing'
                            : characterState === 'falling'
                            ? 'is-falling'
                            : 'is-idle'
                        }`}
                      >
                        <span className="climber-avatar-emoji">{avatar}</span>
                        <span className="climber-nametag">BẠN Ở ĐÂY</span>
                        {characterState === 'climbing' && <span className="climb-particles">✨</span>}
                        {characterState === 'falling' && <span className="fall-particles">💥</span>}
                      </div>
                    )}

                    {!isCurrent && isCleared && (
                      <span className="floor-cleared-star" title="Đã vượt qua">⭐</span>
                    )}

                    {!isCurrent && !isCleared && isCheckpoint && (
                      <span className="floor-checkpoint-tag">Trạm an toàn</span>
                    )}

                    {!isCurrent && !isCleared && !isCheckpoint && (
                      <span className="floor-empty-dash" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Column: Battle & Question Arena */}
        <main className="tower-battle-pane">
          {/* HUD Bar */}
          <div className="game-hud-bar tower-hud-bar">
            {/* Floor & Zone */}
            <div className="tower-hud-floor-box">
              <span className="hud-castle-icon">{currentZone.icon}</span>
              <div>
                <div className="hud-floor-title">TẦNG {currentFloor} / 50</div>
                <div className="hud-zone-sub">{currentZone.name}</div>
              </div>
            </div>

            {/* Rule reminder tag */}
            <div className="tower-penalty-tag">
              <span className="tag-up">Đúng: +1 ⬆️</span>
              <span className="tag-down">Sai: -2 ⬇️</span>
            </div>

            {/* Streak if active */}
            {streak >= 2 && (
              <div className="tower-streak-pill">
                🔥 x{streak} Combo!
              </div>
            )}

            {/* Lives */}
            <div className="tower-lives-box" title={`Còn lại ${lives} sinh mạng`}>
              {[1, 2, 3].map((heartIndex) => (
                <span
                  key={heartIndex}
                  className={`tower-heart ${heartIndex <= lives ? 'heart-alive' : 'heart-lost'}`}
                >
                  {heartIndex <= lives ? '❤️' : '🖤'}
                </span>
              ))}
            </div>

            {/* Timer */}
            <div className={`tower-timer-pill ${floorTime <= 6 ? 'timer-danger' : ''}`}>
              {isFrozen ? '❄️ 15s' : `⏱️ ${floorTime}s`}
            </div>
          </div>

          {/* Lifelines Strip */}
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

          {/* Action Feedback Banner (Climb / Fall banner) */}
          {actionFeedback && (
            <div className={`tower-action-banner banner-${actionFeedback.type}`}>
              <div className="action-banner-main">{actionFeedback.message}</div>
              {actionFeedback.subtext && (
                <div className="action-banner-sub">{actionFeedback.subtext}</div>
              )}
            </div>
          )}

          {/* Question Card */}
          <div className="game-question-card tower-q-card">
            <div className="game-q-counter">
              <span className="q-counter-floor">Thử thách Tầng #{currentFloor}</span>
              <span className="game-q-hint-key">Phím tắt: A · B · C · D</span>
            </div>

            <div className="game-q-text">{currentQ.text}</div>

            <div className="game-q-options">
              {currentQ.options.map((opt) => {
                const isHidden = hiddenOptions.includes(opt.key.toUpperCase());
                const isSelected = selectedKey === opt.key;
                const isCorrectAnswer =
                  opt.key.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase();

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
        </main>
      </div>
    </div>
  );
}
