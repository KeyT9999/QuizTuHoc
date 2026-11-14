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
import { useTheme, type AppTheme } from '../../context/ThemeContext';
import SurvivalTower3DScene, {
  type TowerHeroId,
  type TowerMotionType,
} from './SurvivalTower3DScene';
import './SurvivalTower3D.css';

interface SurvivalTowerGameProps {
  setId: string;
  setTitle?: string;
  questions: Question[];
  onBackToStudy: () => void;
  onOpenMistakes: () => void;
}

const TOTAL_FLOORS = 50;

type PaceMode = 'standard' | 'blitz' | 'zen';

interface HeroConfig {
  id: TowerHeroId;
  icon: string;
  name: string;
  role: string;
}

const HERO_ROSTER: HeroConfig[] = [
  { id: 'scholar', icon: '🎓', name: 'Trạng Nguyên', role: 'Học giả bảng vàng' },
  { id: 'knight', icon: '⚔️', name: 'Hiệp Sĩ', role: 'Giáp sắt tiên phong' },
  { id: 'mage', icon: '🔮', name: 'Đại Pháp Sư', role: 'Phù thủy tinh tú' },
  { id: 'ninja', icon: '🥷', name: 'Ảnh Vũ Ninja', role: 'Tốc biến bóng đêm' },
  { id: 'cat', icon: '🎧', name: 'Mèo Lofi', role: 'Phi hành gia đêm' },
  { id: 'mech', icon: '🤖', name: 'Chiến Giáp', role: 'Lõi năng lượng 3D' },
];

const PACE_CONFIGS: Record<
  PaceMode,
  { title: string; sub: string; seconds: number; xpMult: number }
> = {
  standard: {
    title: '⚡ Chuẩn 25s',
    sub: 'Cân bằng · XP x1.0',
    seconds: 25,
    xpMult: 1,
  },
  blitz: {
    title: '🔥 Tốc chiến 15s',
    sub: 'Kịch tính · XP x1.5',
    seconds: 15,
    xpMult: 1.5,
  },
  zen: {
    title: '🌙 Thư giãn ∞',
    sub: 'Không giờ · Ngắm 3D',
    seconds: 0,
    xpMult: 1,
  },
};

function getDefaultHeroForTheme(theme: AppTheme): TowerHeroId {
  if (theme === 'hon-viet' || theme === 'lotus-zen-sanctuary') return 'scholar';
  if (theme === 'fantasy-academy') return 'mage';
  if (theme === 'cozy-night') return 'cat';
  return 'knight';
}

function getBiomeMeta(floor: number) {
  if (floor >= 50) {
    return { icon: '👑', name: 'Thiên Đỉnh Vương Miện' };
  }
  if (floor >= 41) {
    return { icon: '🌋', name: 'Vực Lửa Hỏa Ngục' };
  }
  if (floor >= 31) {
    return { icon: '⚡', name: 'Đỉnh Tháp Lôi Điện' };
  }
  if (floor >= 21) {
    return { icon: '💎', name: 'Cung Điện Pha Lê' };
  }
  if (floor >= 11) {
    return { icon: '🌿', name: 'Rừng Ngọc Lục Bảo' };
  }
  return { icon: '🗿', name: 'Chân Tháp Cổ Thạch' };
}

function getThemeLobbyCopy(theme: AppTheme) {
  switch (theme) {
    case 'hon-viet':
      return {
        eyebrow: '🏯 ĐẠI THÁP 3D · HỒN VIỆT',
        title: 'ĐẠI THÁP VÔ CỰC 3D — 50 TẦNG DANH THẮNG',
        desc: 'Điều khiển chiến binh 3D vượt 50 tầng tháp xoắn ốc. Chuỗi Combo x3 tung cú nhào lộn vượt 2 tầng, phá giải Boss Gác Cổng mở Trạm Khóa Tầng bất tử!',
      };
    case 'fantasy-academy':
      return {
        eyebrow: '🔮 SKYWARD CITADEL 3D · ARCANUM',
        title: 'ĐẠI THÁP MA PHÁP 3D — 50 TẦNG TINH TÚ',
        desc: 'Xoay góc nhìn 360° quanh tòa tháp cổ ngữ 3D. Tích tụ ma lực Combo x3 để phóng vọt +2 tầng, dựng Khiên Năng Lượng 3D và hạ gục Hộ Vệ Tầng 50!',
      };
    case 'cozy-night':
      return {
        eyebrow: '🌙 STARLIGHT CITADEL 3D · COZY NIGHT',
        title: 'ĐẠI THÁP ÁNH SAO 3D — 50 TẦNG ĐÊM TRĂNG',
        desc: 'Phiêu lưu qua 6 tầng mây 3D lung linh dưới bầu trời sao. Kéo chuột xoay 360° ngắm tháp, nối chuỗi Combo x3 bật nhảy kép và chinh phục Đỉnh Ngân Hà!',
      };
    case 'lotus-zen-sanctuary':
      return {
        eyebrow: '🪷 BẢO THÁP 3D · TỊNH ĐÀI SEN',
        title: 'BẢO THÁP TRÍ TUỆ 3D — 50 TẦNG GIÁC NGỘ',
        desc: 'Từng bước phi thân qua 50 đài tháp 3D thanh tịnh. Giữ tâm vững vàng tích Combo x3 thăng hoa +2 tầng và mở ấn Bảo Tháp Tối Thượng.',
      };
    default:
      return {
        eyebrow: '🏰 THREE.JS INTERACTIVE 3D MODE',
        title: 'ĐẠI THÁP VÔ CỰC 3D — SKYWARD CITADEL 50',
        desc: 'Trải nghiệm leo tháp 3D tương tác thời gian thực: 6 chiến binh 3D, xoay camera 360°, Combo x3 nhào lộn +2 tầng, Khiên 3D Hộ Thể và 5 Ải Boss Trạm An Toàn!',
      };
  }
}

interface StageToast {
  tone: 'climb' | 'double' | 'shield' | 'fall';
  main: string;
  sub: string;
}

export default function SurvivalTowerGame({
  setId,
  setTitle,
  questions,
  onBackToStudy,
  onOpenMistakes,
}: SurvivalTowerGameProps) {
  const { theme } = useTheme();

  // Player customization & mode
  const [heroId, setHeroId] = useState<TowerHeroId>(() => getDefaultHeroForTheme(theme));
  const [paceMode, setPaceMode] = useState<PaceMode>('standard');

  // Core game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // 3D Floor & Motion state
  const [currentFloor, setCurrentFloor] = useState(1);
  const [fromFloor, setFromFloor] = useState(1);
  const [checkpointFloor, setCheckpointFloor] = useState(1);
  const [motionType, setMotionType] = useState<TowerMotionType>('idle');
  const [motionNonce, setMotionNonce] = useState(0);
  const [cameraMode, setCameraMode] = useState<'follow' | 'overview'>('follow');
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  // Combat & RPG stats
  const [lives, setLives] = useState(3);
  const [hasShield, setHasShield] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xpScore, setXpScore] = useState(0);
  const [floorTime, setFloorTime] = useState(25);
  const [isFrozen, setIsFrozen] = useState(false);

  // 4 Tactical Relics
  const [used5050, setUsed5050] = useState(false);
  const [usedFreeze, setUsedFreeze] = useState(false);
  const [usedShieldRelic, setUsedShieldRelic] = useState(false);
  const [usedSwap, setUsedSwap] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);

  // Question & Transition Lock
  const [deck, setDeck] = useState<Question[]>([]);
  const [lockedQuestion, setLockedQuestion] = useState<Question | null>(null);
  const [displayFloor, setDisplayFloor] = useState(1);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [stageToast, setStageToast] = useState<StageToast | null>(null);

  const timerRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  const highScore = getGameHighScore(setId, 'tower');
  const paceCfg = PACE_CONFIGS[paceMode];
  const isUntimed = paceCfg.seconds === 0;

  // Cleanup transition timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const prepareDeck = useCallback(() => {
    const mcQuestions = questions.filter((q) => !q.freeResponse && q.options.length > 0);
    if (mcQuestions.length === 0) return [];
    let pool = [...mcQuestions].sort(() => Math.random() - 0.5);
    while (pool.length < TOTAL_FLOORS) {
      const extra = [...mcQuestions].sort(() => Math.random() - 0.5);
      pool = [...pool, ...extra];
    }
    return pool.slice(0, TOTAL_FLOORS);
  }, [questions]);

  const pickReplacementQuestion = useCallback(
    (excludeId?: string | number) => {
      const mcQuestions = questions.filter((q) => !q.freeResponse && q.options.length > 0);
      if (mcQuestions.length === 0) return null;
      const pool = mcQuestions.filter((q) => q.id !== excludeId);
      const source = pool.length > 0 ? pool : mcQuestions;
      return source[Math.floor(Math.random() * source.length)];
    },
    [questions]
  );

  const startNewRun = useCallback(
    (startFloor = 1) => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      const newDeck = prepareDeck();
      setDeck(newDeck);
      setLockedQuestion(null);
      setCurrentFloor(startFloor);
      setFromFloor(startFloor);
      setDisplayFloor(startFloor);
      setCheckpointFloor(startFloor);
      setMotionType('idle');
      setMotionNonce((n) => n + 1);
      setLives(3);
      setHasShield(false);
      setStreak(0);
      setBestStreak(0);
      setXpScore(0);
      setFloorTime(PACE_CONFIGS[paceMode].seconds);
      setIsFrozen(false);
      setUsed5050(false);
      setUsedFreeze(false);
      setUsedShieldRelic(false);
      setUsedSwap(false);
      setHiddenOptions([]);
      setSelectedKey(null);
      setHoveredOption(null);
      setIsAnswering(false);
      setStageToast(null);
      setIsGameOver(false);
      setIsVictory(false);
      setIsPlaying(true);
      playClickSound();
    },
    [paceMode, prepareDeck]
  );

  // Per-floor countdown timer (skipped in Zen untimed mode)
  useEffect(() => {
    if (!isPlaying || isGameOver || isVictory || isFrozen || isAnswering || isUntimed) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setFloorTime((prev) => {
        if (prev <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isPlaying, isGameOver, isVictory, isFrozen, isAnswering, isUntimed, displayFloor]);

  const activeQ = lockedQuestion ?? deck[currentFloor - 1] ?? null;

  const finishGame = useCallback(
    (victory: boolean, finalFloor: number, maxStreakReached: number) => {
      setIsGameOver(true);
      setIsPlaying(false);
      setIsVictory(victory);
      saveGameHighScore(setId, 'tower', finalFloor, Math.max(finalFloor, maxStreakReached));

      if (victory) {
        playVictoryFanfare();
      } else {
        playWrongSound();
      }
    },
    [setId]
  );

  // Recharge 1 spent relic when conquering a Boss Gate
  const rechargeOneRelic = useCallback(() => {
    if (usedShieldRelic) {
      setUsedShieldRelic(false);
      return 'Khiên 3D';
    }
    if (used5050) {
      setUsed5050(false);
      return 'Trảm 50:50';
    }
    if (usedFreeze) {
      setUsedFreeze(false);
      return 'Ngưng đọng';
    }
    if (usedSwap) {
      setUsedSwap(false);
      return 'Đổi câu';
    }
    return null;
  }, [usedShieldRelic, used5050, usedFreeze, usedSwap]);

  // Shared Wrong / Timeout Penalty Handler (respects 3D Shield & Safe Checkpoint Lock)
  const triggerPenalty = useCallback(
    (reason: 'wrong' | 'timeout') => {
      if (!activeQ) return;
      saveMistakeQuestion(setId, activeQ.id);
      setIsAnswering(true);
      setHoveredOption(null);
      setLockedQuestion(activeQ);

      // Case A: 3D Energy Shield absorbs the hit!
      if (hasShield) {
        playLifelineSound();
        setHasShield(false);
        setFromFloor(currentFloor);
        setMotionType('shield_block');
        setMotionNonce((n) => n + 1);
        setStageToast({
          tone: 'shield',
          main: '🛡️ KHIÊN 3D HỘ THỂ ĐÃ CHẶN SÁT THƯƠNG!',
          sub: 'Giữ nguyên tầng hiện tại, bảo toàn ❤️ và chuỗi Combo!',
        });

        const replacement = pickReplacementQuestion(activeQ.id);
        if (replacement) {
          setDeck((prev) => {
            const copy = [...prev];
            copy[currentFloor - 1] = replacement;
            return copy;
          });
        }

        transitionTimeoutRef.current = window.setTimeout(() => {
          setLockedQuestion(null);
          setSelectedKey(null);
          setIsAnswering(false);
          setHiddenOptions([]);
          setIsFrozen(false);
          setFloorTime(paceCfg.seconds);
          setStageToast(null);
        }, 950);
        return;
      }

      // Case B: Unshielded -> Drop 2 floors (clamped by unlocked Safe Checkpoint!) & lose 1 heart
      playWrongSound();
      setStreak(0);
      const nextLives = lives - 1;
      const targetFloor = Math.max(checkpointFloor, currentFloor - 2);
      const protectedByCheckpoint = currentFloor - 2 < checkpointFloor && checkpointFloor > 1;

      setFromFloor(currentFloor);
      setCurrentFloor(targetFloor);
      setMotionType('fall');
      setMotionNonce((n) => n + 1);

      setStageToast({
        tone: 'fall',
        main:
          reason === 'timeout'
            ? `⏱️ HẾT GIỜ! RỚT XUỐNG TẦNG ${targetFloor}`
            : `💥 TRƯỢT CHÂN! RỚT XUỐNG TẦNG ${targetFloor}`,
        sub: protectedByCheckpoint
          ? `⚓ Trạm Khóa Tầng ${checkpointFloor} đã đỡ bạn khỏi rơi sâu hơn! (-1 ❤️)`
          : `Mất 1 ❤️ · Cố gắng lấy lại nhịp Combo nhé!`,
      });

      const replacement = pickReplacementQuestion(activeQ.id);
      if (replacement) {
        setDeck((prev) => {
          const copy = [...prev];
          copy[targetFloor - 1] = replacement;
          return copy;
        });
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setLives(nextLives);
        setLockedQuestion(null);
        setSelectedKey(null);
        setDisplayFloor(targetFloor);
        setIsAnswering(false);
        setStageToast(null);

        if (nextLives <= 0) {
          finishGame(false, targetFloor, bestStreak);
        } else {
          setHiddenOptions([]);
          setIsFrozen(false);
          setFloorTime(paceCfg.seconds);
        }
      }, 950);
    },
    [
      activeQ,
      setId,
      hasShield,
      currentFloor,
      pickReplacementQuestion,
      paceCfg.seconds,
      lives,
      checkpointFloor,
      finishGame,
      bestStreak,
    ]
  );

  // Trigger timeout when timer hits 0
  useEffect(() => {
    if (
      isPlaying &&
      !isUntimed &&
      floorTime === 0 &&
      !isGameOver &&
      !isVictory &&
      !isAnswering
    ) {
      triggerPenalty('timeout');
    }
  }, [floorTime, isPlaying, isUntimed, isGameOver, isVictory, isAnswering, triggerPenalty]);

  // Handle selecting option A/B/C/D
  const handleSelectOption = useCallback(
    (chosenKey: string) => {
      if (!isPlaying || isGameOver || isVictory || isAnswering || !activeQ) return;

      setSelectedKey(chosenKey);
      const normalizedCorrect = activeQ.correctAnswer.trim().toUpperCase();
      const isCorrect = normalizedCorrect.includes(chosenKey.toUpperCase());

      if (!isCorrect) {
        triggerPenalty('wrong');
        return;
      }

      // CORRECT ANSWER!
      setIsAnswering(true);
      setHoveredOption(null);
      setLockedQuestion(activeQ);

      const newStreak = streak + 1;
      const updatedBestStreak = Math.max(bestStreak, newStreak);
      setStreak(newStreak);
      setBestStreak(updatedBestStreak);

      const isFinalSummit = currentFloor >= TOTAL_FLOORS;
      const isDoubleLeap = !isFinalSummit && newStreak % 3 === 0;
      const climbStep = isDoubleLeap ? 2 : 1;
      const nextFloor = isFinalSummit
        ? TOTAL_FLOORS
        : Math.min(TOTAL_FLOORS, currentFloor + climbStep);

      playCorrectSound(Math.min(12, newStreak));

      // Calculate XP reward
      const timeBonus = isUntimed ? 15 : floorTime * 2;
      const comboBonus = newStreak * 20;
      const bossBonus = currentFloor % 10 === 0 ? 150 : 0;
      const gainedXp = Math.round((100 + timeBonus + comboBonus + bossBonus) * paceCfg.xpMult);
      setXpScore((prev) => prev + gainedXp);

      // Check Boss Milestone Checkpoint unlock (10, 20, 30, 40)
      const milestoneCandidate = Math.floor((nextFloor - 1) / 10) * 10;
      let bossRewardText = '';
      if (milestoneCandidate >= 10 && milestoneCandidate > checkpointFloor) {
        setCheckpointFloor(milestoneCandidate);
        setLives((prev) => Math.min(4, prev + 1));
        const recharged = rechargeOneRelic();
        bossRewardText = ` · 🔓 Khóa Trạm Tầng ${milestoneCandidate} (+1 ❤️${
          recharged ? `, hồi ${recharged}` : ''
        })`;
      }

      // Trigger immediate 3D Hero jump / 360 somersault / victory celebration!
      setFromFloor(currentFloor);
      setCurrentFloor(nextFloor);
      setMotionType(isFinalSummit ? 'victory' : isDoubleLeap ? 'leap_2' : 'leap_1');
      setMotionNonce((n) => n + 1);

      if (isFinalSummit) {
        setStageToast({
          tone: 'double',
          main: '👑 ĐẠI THẮNG TẦNG 50! ĐỈNH THÁP ĐÃ QUY PHỤC!',
          sub: `+${gainedXp} XP · Danh hiệu Bá Chủ Đại Tháp 3D!`,
        });
      } else if (isDoubleLeap) {
        setStageToast({
          tone: 'double',
          main: `⚡ COMBO x${newStreak}! NHÀO LỘN VỌT +2 TẦNG → TẦNG ${nextFloor}!`,
          sub: `+${gainedXp} XP${bossRewardText || ' · Tuyệt kỹ Tốc Biến Không Trung!'}`,
        });
      } else {
        setStageToast({
          tone: 'climb',
          main: `✨ CHÍNH XÁC! PHI THÂN LÊN TẦNG ${nextFloor}`,
          sub: `+${gainedXp} XP${
            bossRewardText ||
            (newStreak % 3 === 2
              ? ' · ⚡ Đúng câu kế tiếp sẽ NHẢY VỌT +2 TẦNG!'
              : ` · Chuỗi thắng x${newStreak}`)
          }`,
        });
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setLockedQuestion(null);
        setSelectedKey(null);
        setDisplayFloor(nextFloor);
        setIsAnswering(false);
        setHiddenOptions([]);
        setIsFrozen(false);
        setFloorTime(paceCfg.seconds);
        setStageToast(null);

        if (isFinalSummit) {
          finishGame(true, TOTAL_FLOORS, updatedBestStreak);
        }
      }, isDoubleLeap ? 860 : 720);
    },
    [
      isPlaying,
      isGameOver,
      isVictory,
      isAnswering,
      activeQ,
      triggerPenalty,
      streak,
      bestStreak,
      currentFloor,
      isUntimed,
      floorTime,
      paceCfg.xpMult,
      paceCfg.seconds,
      checkpointFloor,
      rechargeOneRelic,
      finishGame,
    ]
  );

  // Relic [1]: 50:50 Slash
  const handleRelic5050 = useCallback(() => {
    if (used5050 || !activeQ || isAnswering) return;
    playLifelineSound();
    setUsed5050(true);
    const correctKey = activeQ.correctAnswer.trim().toUpperCase();
    const wrongKeys = activeQ.options
      .map((o) => o.key.toUpperCase())
      .filter((k) => !correctKey.includes(k) && !hiddenOptions.includes(k));
    const toHide = [...wrongKeys].sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenOptions((prev) => [...prev, ...toHide]);
  }, [used5050, activeQ, isAnswering, hiddenOptions]);

  // Relic [2]: Time Freeze +15s (or Insight -1 wrong option in Zen untimed mode)
  const handleRelicFreeze = useCallback(() => {
    if (usedFreeze || !activeQ || isAnswering) return;
    playLifelineSound();
    setUsedFreeze(true);

    if (isUntimed) {
      const correctKey = activeQ.correctAnswer.trim().toUpperCase();
      const wrongKeys = activeQ.options
        .map((o) => o.key.toUpperCase())
        .filter((k) => !correctKey.includes(k) && !hiddenOptions.includes(k));
      if (wrongKeys.length > 0) {
        const pick = wrongKeys[Math.floor(Math.random() * wrongKeys.length)];
        setHiddenOptions((prev) => [...prev, pick]);
      }
      return;
    }

    setIsFrozen(true);
    setFloorTime((prev) => prev + 15);
  }, [usedFreeze, activeQ, isAnswering, isUntimed, hiddenOptions]);

  // Relic [3]: 3D Energy Shield
  const handleRelicShield = useCallback(() => {
    if (usedShieldRelic || hasShield || isAnswering) return;
    playLifelineSound();
    setUsedShieldRelic(true);
    setHasShield(true);
    setStageToast({
      tone: 'shield',
      main: '🛡️ ĐÃ BẬT KHIÊN NĂNG LƯỢNG 3D QUANH NHÂN VẬT!',
      sub: 'Tự động đỡ 1 lần chọn sai hoặc hết giờ mà không rớt tầng!',
    });
    window.setTimeout(() => {
      setStageToast((prev) => (prev?.tone === 'shield' ? null : prev));
    }, 1800);
  }, [usedShieldRelic, hasShield, isAnswering]);

  // Relic [4]: Swap Floor Question
  const handleRelicSwap = useCallback(() => {
    if (usedSwap || !activeQ || isAnswering) return;
    playLifelineSound();
    setUsedSwap(true);
    setHiddenOptions([]);
    const replacement = pickReplacementQuestion(activeQ.id);
    if (replacement) {
      setDeck((prev) => {
        const copy = [...prev];
        copy[currentFloor - 1] = replacement;
        return copy;
      });
      if (!isUntimed) setFloorTime(paceCfg.seconds);
    }
  }, [usedSwap, activeQ, isAnswering, pickReplacementQuestion, currentFloor, isUntimed, paceCfg.seconds]);

  // Keyboard shortcuts: A/B/C/D for options, 1/2/3/4 for Relics, Space/Enter to start
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!isPlaying) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          startNewRun(1);
        }
        return;
      }

      if (isAnswering) return;

      const upper = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(upper)) {
        if (!hiddenOptions.includes(upper)) {
          e.preventDefault();
          handleSelectOption(upper);
        }
      } else if (e.key === '1') {
        e.preventDefault();
        handleRelic5050();
      } else if (e.key === '2') {
        e.preventDefault();
        handleRelicFreeze();
      } else if (e.key === '3') {
        e.preventDefault();
        handleRelicShield();
      } else if (e.key === '4') {
        e.preventDefault();
        handleRelicSwap();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isPlaying,
    isAnswering,
    hiddenOptions,
    startNewRun,
    handleSelectOption,
    handleRelic5050,
    handleRelicFreeze,
    handleRelicShield,
    handleRelicSwap,
  ]);

  const rootThemeClass = `tower3d-root theme-${theme}`;
  const selectedHeroMeta = HERO_ROSTER.find((h) => h.id === heroId) ?? HERO_ROSTER[0];
  const biome = getBiomeMeta(currentFloor);
  const isBossFloor = currentFloor % 10 === 0;
  const isDangerTime = !isUntimed && !isFrozen && floorTime <= 6;
  const comboChargeStep = streak % 3;

  // =========================================================================
  // SCREEN 1: 3D INTERACTIVE LOBBY & HERO SHOWCASE
  // =========================================================================
  if (!isPlaying && !isGameOver && !isVictory) {
    const copy = getThemeLobbyCopy(theme);
    const previewFloor = Math.max(1, Math.min(TOTAL_FLOORS, highScore.score || 1));

    return (
      <div className={rootThemeClass}>
        <div className="tower3d-lobby-shell">
          {/* Left: Live 3D Three.js Interactive Preview */}
          <div className="tower3d-lobby-preview">
            <div className="tower3d-preview-badge">
              <span>🧊 MÔ HÌNH 3D TƯƠNG TÁC</span>
              <span>· Kéo để xoay 360°</span>
            </div>

            <SurvivalTower3DScene
              theme={theme}
              currentFloor={previewFloor}
              fromFloor={previewFloor}
              checkpointFloor={Math.max(1, Math.floor(previewFloor / 10) * 10)}
              heroId={heroId}
              motionType="idle"
              motionNonce={0}
              hasShield={false}
              isFrozen={false}
              isDangerTime={false}
              streak={3}
              hoveredOption={null}
              cameraMode="follow"
              previewMode={true}
            />

            <div className="tower3d-preview-caption">
              <span>
                Chiến binh: <strong>{selectedHeroMeta.icon} {selectedHeroMeta.name}</strong>
              </span>
              <span>Đài xuất phát: <strong>Tầng {previewFloor}</strong></span>
            </div>
          </div>

          {/* Right: Customization, Pace & Start */}
          <div className="tower3d-lobby-content">
            <div>
              <div className="tower3d-eyebrow">{copy.eyebrow}</div>
              <h2 className="tower3d-lobby-title">{copy.title}</h2>
              <p className="tower3d-lobby-desc">
                {setTitle ? `[${setTitle}] — ` : ''}
                {copy.desc}
              </p>
            </div>

            <div className="tower3d-record-bar">
              <span>
                🏆 Kỷ lục cao nhất:{' '}
                <strong>
                  {highScore.score > 0 ? `Tầng ${highScore.score} / 50` : 'Chưa mở lối'}
                </strong>
              </span>
              <span>📦 Kho đề: <strong>{questions.length} câu hỏi</strong></span>
            </div>

            {/* 6 Playable 3D Heroes */}
            <div>
              <div className="tower3d-section-label">1. Chọn Chiến Binh 3D</div>
              <div className="tower3d-hero-grid">
                {HERO_ROSTER.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className={`tower3d-hero-card ${heroId === h.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      playClickSound();
                      setHeroId(h.id);
                    }}
                  >
                    <span className="tower3d-hero-icon">{h.icon}</span>
                    <span className="tower3d-hero-meta">
                      <span className="tower3d-hero-name">{h.name}</span>
                      <span className="tower3d-hero-role">{h.role}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Pace Modes */}
            <div>
              <div className="tower3d-section-label">2. Chọn Nhịp Độ Chinh Phục</div>
              <div className="tower3d-pace-grid">
                {(Object.keys(PACE_CONFIGS) as PaceMode[]).map((modeKey) => {
                  const cfg = PACE_CONFIGS[modeKey];
                  return (
                    <button
                      key={modeKey}
                      type="button"
                      className={`tower3d-pace-btn ${paceMode === modeKey ? 'is-active' : ''}`}
                      onClick={() => {
                        playClickSound();
                        setPaceMode(modeKey);
                      }}
                    >
                      <span className="tower3d-pace-title">{cfg.title}</span>
                      <span className="tower3d-pace-sub">{cfg.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core 3D Roguelite Mechanics Summary */}
            <div className="tower3d-features-grid">
              <div className="tower3d-feature-pill">
                <span>⚡</span>
                <div>
                  <strong>Combo x3 Nhảy Đôi (+2 Tầng)</strong>
                  Đúng 3 câu liên tiếp tung cú lộn 360° vượt 2 tầng!
                </div>
              </div>
              <div className="tower3d-feature-pill">
                <span>🛡️</span>
                <div>
                  <strong>4 Pháp Bảo & Khiên 3D</strong>
                  Bật Khiên Năng Lượng 3D chặn đứng 1 lần sai/hết giờ.
                </div>
              </div>
              <div className="tower3d-feature-pill">
                <span>⚔️</span>
                <div>
                  <strong>5 Ải Boss Trạm An Toàn</strong>
                  Vượt Tầng 10·20·30·40 khóa chốt — không bao giờ rơi quá trạm!
                </div>
              </div>
              <div className="tower3d-feature-pill">
                <span>🎥</span>
                <div>
                  <strong>Camera 3D Xoay 360°</strong>
                  Kéo xoay tự do hoặc chuyển góc nhìn Toàn Tháp 50 tầng.
                </div>
              </div>
            </div>

            <div className="tower3d-lobby-actions">
              <button
                type="button"
                className="tower3d-btn-primary"
                onClick={() => startNewRun(1)}
              >
                🚀 BẮT ĐẦU LEO ĐẠI THÁP 3D
              </button>
              <button
                type="button"
                className="tower3d-btn-ghost"
                onClick={onBackToStudy}
              >
                ← Quay lại học chuẩn
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 3: 3D VICTORY / DEFEAT SUMMARY
  // =========================================================================
  if (isGameOver || isVictory) {
    return (
      <div className={rootThemeClass}>
        <div className="tower3d-lobby-shell">
          <div className="tower3d-lobby-preview">
            <div className="tower3d-preview-badge">
              <span>{isVictory ? '👑 ĐỈNH VINH QUANG 3D' : '🏛️ DẤU ẤN HÀNH TRÌNH'}</span>
            </div>

            <SurvivalTower3DScene
              theme={theme}
              currentFloor={currentFloor}
              fromFloor={currentFloor}
              checkpointFloor={checkpointFloor}
              heroId={heroId}
              motionType={isVictory ? 'victory' : 'idle'}
              motionNonce={motionNonce}
              hasShield={false}
              isFrozen={false}
              isDangerTime={false}
              streak={isVictory ? 5 : 0}
              hoveredOption={null}
              cameraMode="follow"
              previewMode={true}
            />

            <div className="tower3d-preview-caption">
              <span>
                Chiến binh: <strong>{selectedHeroMeta.icon} {selectedHeroMeta.name}</strong>
              </span>
              <span>
                Trạm khóa: <strong>Tầng {checkpointFloor}</strong>
              </span>
            </div>
          </div>

          <div className="tower3d-lobby-content">
            <div>
              <div className="tower3d-eyebrow">
                {isVictory ? '🏆 CHIẾN THẮNG TUYỆT ĐỐI' : '💥 KẾT THÚC LƯỢT CHINH PHỤC'}
              </div>
              <h2 className="tower3d-lobby-title">
                {isVictory
                  ? 'BÁ CHỦ ĐẠI THÁP 50 TẦNG!'
                  : `DỪNG CHÂN TẠI TẦNG ${currentFloor} / 50`}
              </h2>
              <p className="tower3d-lobby-desc">
                {isVictory
                  ? 'Tuyệt đỉnh! Bạn đã vượt qua cả 6 tầng sinh quyển 3D và đánh bại Hộ Vệ Tối Thượng trên đỉnh tháp!'
                  : checkpointFloor > 1
                  ? `Bạn đã mở khóa Trạm An Toàn Tầng ${checkpointFloor}! Bạn có thể hồi sinh ngay tại Tầng ${checkpointFloor} để leo tiếp lên đỉnh.`
                  : 'Mỗi câu sai đã được lưu vào Sổ Tay Câu Sai để bạn ôn luyện vững vàng trước khi phục thù!'}
              </p>
            </div>

            <div className="tower3d-result-stats">
              <div className="tower3d-stat-box">
                <span className="tower3d-stat-val">{currentFloor} / 50</span>
                <span className="tower3d-stat-lbl">Độ cao đạt được</span>
              </div>
              <div className="tower3d-stat-box">
                <span className="tower3d-stat-val">{xpScore.toLocaleString()}</span>
                <span className="tower3d-stat-lbl">Điểm Vinh Quang XP</span>
              </div>
              <div className="tower3d-stat-box">
                <span className="tower3d-stat-val">x{bestStreak}</span>
                <span className="tower3d-stat-lbl">Chuỗi Combo Đỉnh</span>
              </div>
            </div>

            <div className="tower3d-record-bar">
              <span>
                🏅 Kỷ lục bộ đề: <strong>Tầng {Math.max(highScore.score, currentFloor)} / 50</strong>
              </span>
              <span>
                ⚓ Trạm An Toàn đã mở: <strong>Tầng {checkpointFloor}</strong>
              </span>
            </div>

            <div className="tower3d-result-actions">
              {!isVictory && checkpointFloor > 1 && (
                <button
                  type="button"
                  className="tower3d-btn-primary"
                  onClick={() => startNewRun(checkpointFloor)}
                >
                  🔄 HỒI SINH TẠI TRẠM TẦNG {checkpointFloor}
                </button>
              )}
              <button
                type="button"
                className={!isVictory && checkpointFloor > 1 ? 'tower3d-btn-ghost' : 'tower3d-btn-primary'}
                onClick={() => startNewRun(1)}
              >
                🚀 Leo mới từ Tầng 1
              </button>
              <button
                type="button"
                className="tower3d-btn-ghost"
                onClick={onOpenMistakes}
              >
                🛡️ Ôn lại câu hay sai
              </button>
              <button
                type="button"
                className="tower3d-btn-ghost"
                onClick={onBackToStudy}
              >
                ← Quay lại học chuẩn
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: LIVE 3D GAMEPLAY ARENA
  // =========================================================================
  const normalizedCorrectKey = activeQ ? activeQ.correctAnswer.trim().toUpperCase() : '';
  const maxHeartSlots = Math.max(3, lives);

  return (
    <div className={rootThemeClass}>
      <div className="tower3d-arena">
        {/* LEFT / TOP: Interactive 3D Three.js Viewport */}
        <div
          className={`tower3d-stage-card ${mobileExpanded ? 'is-mobile-expanded' : ''}`}
        >
          {/* Top-Left Altitude & Boss Indicator */}
          <div className="tower3d-stage-top-left">
            <div className="tower3d-floor-chip">
              <span className="tower3d-floor-num">
                {biome.icon} TẦNG {currentFloor}/{TOTAL_FLOORS}
              </span>
              <span className="tower3d-biome-name">{biome.name}</span>
            </div>

            {isBossFloor && (
              <div className="tower3d-boss-alert">
                ⚔️ ẢI BOSS CANH GÁC · VƯỢT QUA KHÓA TRẠM & +1 ❤️
              </div>
            )}
          </div>

          {/* Top-Right Camera Controls + Mobile Expand */}
          <div className="tower3d-stage-top-right">
            <button
              type="button"
              className={`tower3d-cam-btn ${cameraMode === 'follow' ? 'is-active' : ''}`}
              onClick={() => setCameraMode('follow')}
              title="Camera bám sát chiến binh"
            >
              🎯<span className="tower3d-cam-label"> Theo chân</span>
            </button>
            <button
              type="button"
              className={`tower3d-cam-btn ${cameraMode === 'overview' ? 'is-active' : ''}`}
              onClick={() => setCameraMode('overview')}
              title="Góc nhìn rộng toàn tháp"
            >
              🔭<span className="tower3d-cam-label"> Toàn tháp</span>
            </button>
            <button
              type="button"
              className="tower3d-cam-btn tower3d-mobile-expand-btn"
              onClick={() => setMobileExpanded((v) => !v)}
            >
              {mobileExpanded ? '↕️ Thu gọn' : '↕️ 3D'}
            </button>
          </div>

          {/* Dynamic 3D Event Callout Toast */}
          {stageToast && (
            <div className={`tower3d-toast is-${stageToast.tone}`}>
              <div className="tower3d-toast-main">{stageToast.main}</div>
              <div className="tower3d-toast-sub">{stageToast.sub}</div>
            </div>
          )}

          {/* Three.js WebGL Scene */}
          <SurvivalTower3DScene
            theme={theme}
            currentFloor={currentFloor}
            fromFloor={fromFloor}
            checkpointFloor={checkpointFloor}
            heroId={heroId}
            motionType={motionType}
            motionNonce={motionNonce}
            hasShield={hasShield}
            isFrozen={isFrozen}
            isDangerTime={isDangerTime}
            streak={streak}
            hoveredOption={hoveredOption}
            cameraMode={cameraMode}
          />

          {/* Bottom 50-Floor Altitude Bar & Boss Checkpoints */}
          <div className="tower3d-stage-bottom">
            <div className="tower3d-progress-meta">
              <span>
                ⚓ Trạm khóa: <strong>Tầng {checkpointFloor}</strong>
              </span>
              <span className="tower3d-drag-hint">🖱️ Kéo chuột để xoay tháp 360°</span>
              <span>Độ cao: <strong>{Math.round((currentFloor / TOTAL_FLOORS) * 100)}%</strong></span>
            </div>
            <div className="tower3d-progress-track">
              <div
                className="tower3d-progress-fill"
                style={{ width: `${(currentFloor / TOTAL_FLOORS) * 100}%` }}
              />
              {[10, 20, 30, 40, 50].map((cp) => {
                const unlocked = checkpointFloor >= cp || (cp === 50 && isVictory);
                return (
                  <span
                    key={cp}
                    className={`tower3d-cp-dot ${unlocked ? 'is-unlocked' : ''}`}
                    style={{ left: `${(cp / TOTAL_FLOORS) * 100}%` }}
                    title={`Ải Boss Tầng ${cp}`}
                  >
                    {cp === 50 ? '👑' : ''}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT / BOTTOM: Tactical Battle Console */}
        <div className="tower3d-console-card">
          {/* Row 1: Hearts, Shield, Combo Charge & Timer */}
          <div className="tower3d-hud-row">
            <div className="tower3d-vitals">
              <div className="tower3d-hearts" aria-label={`Còn ${lives} mạng`}>
                {Array.from({ length: maxHeartSlots }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`tower3d-heart ${idx >= lives ? 'is-lost' : ''}`}
                  >
                    ❤️
                  </span>
                ))}
              </div>

              {hasShield && (
                <span className="tower3d-shield-pill">🛡️ Khiên 3D Bật</span>
              )}

              <span
                className={`tower3d-combo-meter ${comboChargeStep === 2 ? 'is-charged' : ''}`}
              >
                {comboChargeStep === 2
                  ? '⚡ TỤ LỰC 2/3 · CÂU NÀY VỌT +2 TẦNG!'
                  : `🔥 Combo x${streak} (${comboChargeStep}/3)`}
              </span>
            </div>

            <div className="tower3d-hud-right">
              <span className="tower3d-xp-pill">✨ {xpScore.toLocaleString()} XP</span>
              <span
                className={`tower3d-timer-pill ${
                  isFrozen ? 'is-frozen' : isDangerTime ? 'is-danger' : ''
                }`}
              >
                {isUntimed
                  ? '🌙 ∞'
                  : isFrozen
                  ? `❄️ ${floorTime}s`
                  : `⏱️ ${floorTime}s`}
              </span>
            </div>
          </div>

          {/* Row 2: 4 Tactical Relics */}
          <div className="tower3d-relics-grid">
            <button
              type="button"
              className="tower3d-relic-btn"
              disabled={used5050 || isAnswering}
              onClick={handleRelic5050}
              title="Chém bay 2 đáp án sai (Phím 1)"
            >
              <span>⚔️ 50:50</span>
              <span className="tower3d-relic-key">1</span>
            </button>

            <button
              type="button"
              className="tower3d-relic-btn"
              disabled={usedFreeze || isAnswering}
              onClick={handleRelicFreeze}
              title={
                isUntimed
                  ? 'Loại bỏ 1 đáp án sai (Phím 2)'
                  : 'Đóng băng đồng hồ và cộng +15s (Phím 2)'
              }
            >
              <span>{isUntimed ? '💡 Soi -1 sai' : '❄️ +15s Băng'}</span>
              <span className="tower3d-relic-key">2</span>
            </button>

            <button
              type="button"
              className={`tower3d-relic-btn ${hasShield ? 'is-active-shield' : ''}`}
              disabled={usedShieldRelic || hasShield || isAnswering}
              onClick={handleRelicShield}
              title="Dựng Khiên Năng Lượng 3D chặn 1 lần sai/hết giờ (Phím 3)"
            >
              <span>🛡️ {hasShield ? 'Đang hộ thể' : 'Khiên 3D'}</span>
              <span className="tower3d-relic-key">3</span>
            </button>

            <button
              type="button"
              className="tower3d-relic-btn"
              disabled={usedSwap || isAnswering}
              onClick={handleRelicSwap}
              title="Đổi sang câu hỏi khác cho tầng này (Phím 4)"
            >
              <span>🌀 Đổi câu</span>
              <span className="tower3d-relic-key">4</span>
            </button>
          </div>

          {/* Row 3: Question & High-Contrast Options */}
          {activeQ && (
            <div className="tower3d-question-box">
              <div className="tower3d-q-meta">
                <span>
                  {displayFloor % 10 === 0
                    ? `⚔️ THỬ THÁCH BOSS TẦNG #${displayFloor}`
                    : `THỬ THÁCH TẦNG #${displayFloor}`}
                </span>
                <span className="tower3d-q-shortcuts">
                  Phím tắt: A · B · C · D | Pháp bảo: 1 · 2 · 3 · 4
                </span>
              </div>

              <div className="tower3d-q-text">{activeQ.text}</div>

              <div className="tower3d-options-list">
                {activeQ.options.map((opt) => {
                  const keyUpper = opt.key.toUpperCase();
                  const isHidden = hiddenOptions.includes(keyUpper);

                  if (isHidden) {
                    return (
                      <div key={opt.key} className="tower3d-opt-eliminated">
                        <span className="tower3d-opt-key">{opt.key}</span>
                        <span>Đáp án đã bị Pháp Bảo loại bỏ</span>
                      </div>
                    );
                  }

                  const isChosen = selectedKey?.toUpperCase() === keyUpper;
                  const isRightOpt = normalizedCorrectKey.includes(keyUpper);

                  let stateClass = '';
                  if (isAnswering && (selectedKey !== null || (!isUntimed && floorTime === 0))) {
                    if (isRightOpt) {
                      stateClass = 'is-correct';
                    } else if (isChosen && !isRightOpt) {
                      stateClass = 'is-wrong';
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={isAnswering}
                      className={`tower3d-opt-btn ${stateClass}`}
                      onMouseEnter={() => {
                        if (!isAnswering) setHoveredOption(keyUpper);
                      }}
                      onMouseLeave={() => setHoveredOption(null)}
                      onClick={() => handleSelectOption(keyUpper)}
                    >
                      <span className="tower3d-opt-key">{opt.key}</span>
                      <span className="tower3d-opt-text">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Row 4: Escape & Hero Switch Hint */}
          <div className="tower3d-console-footer">
            <span>
              {selectedHeroMeta.icon} <strong>{selectedHeroMeta.name}</strong> · Nhịp:{' '}
              {paceCfg.title}
            </span>
            <button
              type="button"
              className="tower3d-exit-link"
              onClick={onBackToStudy}
            >
              ← Thoát tháp về học chuẩn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
