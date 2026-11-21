import { useState, useEffect, useRef } from 'react';
import shinIdleImg from '../assets/shin_sticker_idle.png';
import shinJumpImg from '../assets/shin_sticker_jump.png';
import { playShinBoingSound } from '../utils/soundEffects';
import type { ShinSceneId } from '../utils/studyStats';

export type ShinMood = 'idle' | 'correct' | 'wrong' | 'streak' | 'focus';

interface ShinMascotProps {
  variant?: 'sidebar' | 'floating';
  mood?: ShinMood;
  scene?: ShinSceneId;
  comboCount?: number;
  mouseEffectsEnabled?: boolean;
  onTriggerActionBeam?: () => void;
}

const IDLE_QUOTES = [
  'Ôi chị đẹp ơi, chọn đáp án đúng đi nào~ ✌️',
  'Ăn miếng bánh ChocoBi rồi làm tiếp cho thông não nha! 🍪',
  'Bạch Tuyết bảo câu này nhìn kỹ là biết liền á! 🐶',
  'Mẹ Misae đang nhìn kìa, tập trung cày điểm A+ đi! 👀',
  'Đội Phòng Vệ Kasukabe không bao giờ bó tay trước đề FE! 🛡️',
  'Shin 5 tuổi còn biết học bài, bạn cũng cố lên nha! ⭐',
];

const RAIN_QUOTES = [
  'Trời mưa Kasukabe chill quá, cày đề siêu thấm luôn! 🌧️',
  'Cầm ô vàng đi cùng Bạch Tuyết, làm hết đề này nha! ☂️',
  'Mưa rơi tí tách, làm bài bách phát bách trúng! ✨',
  'Mưa mát thế này mà qua môn nữa là hết nước chấm! 🐶',
];

const CORRECT_QUOTES = [
  'SUGOI!! Thưởng hẳn 1 hộp bánh ChocoBi luôn nè! 🍪⭐',
  'Đỉnh nóc kịch trần! Siêu Nhân Hành Động phải chào thua! ⚡',
  'Chuẩn không cần chỉnh! Bạch Tuyết vẫy đuôi khen kìa! 🐶',
  'Quá trời giỏi luôn! Nhảy múa ăn mừng thôi~ 💃',
];

const WRONG_QUOTES = [
  'Á á Ớt Chuông Xanh kìa!! 🫑 Đừng sợ, đọc lại đáp án nha!',
  'Ối giồi ôi! Suýt bị mẹ Misae cốc đầu rồi, ghi nhớ câu này ngay! 💥',
  'Coi như ăn nhầm miếng ớt chuông, câu sau phục thù bằng ChocoBi! 🍪',
  'Bình tĩnh nào! Đội Phòng Vệ Kasukabe sai 1 câu để thi thật đúng hết! 🛡️',
];

const STREAK_QUOTES = [
  'ACTION BEAM!! ⚡ Chuỗi đúng đỉnh cao vũ trụ Kasukabe!',
  'CHOCOBI FEVER!! 🍪🔥 Không ai cản nổi tốc độ này!',
  'Siêu Nhân Bụng Bự ra chiêu — Quét sạch cả đề thi!! 🌟',
];

const FOCUS_QUOTES = [
  'Suỵt~ Shin ngồi ngoan ăn ChocoBi để bạn tập trung 100% nhé! 🤫',
  'Bạch Tuyết đang canh cửa, cứ yên tâm cày đề nha! 🐶',
];

function pickRandom(list: string[], exclude?: string): string {
  const pool = list.filter((item) => item !== exclude);
  const src = pool.length > 0 ? pool : list;
  return src[Math.floor(Math.random() * src.length)];
}

export default function ShinMascot({
  variant = 'sidebar',
  mood = 'idle',
  scene = 'room',
  comboCount = 0,
  mouseEffectsEnabled = true,
  onTriggerActionBeam,
}: ShinMascotProps) {
  const [quote, setQuote] = useState<string>(() =>
    scene === 'rain' ? RAIN_QUOTES[0] : IDLE_QUOTES[0]
  );
  const [isJumping, setIsJumping] = useState(false);
  const [popTag, setPopTag] = useState<{ label: string; key: number } | null>(null);
  const [showFloatingBubble, setShowFloatingBubble] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const clickCountRef = useRef(0);
  const jumpTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);
  const prevMoodRef = useRef<ShinMood>(mood);

  // React to mood & combo changes
  useEffect(() => {
    if (mood === prevMoodRef.current && mood !== 'correct' && mood !== 'streak') return;
    prevMoodRef.current = mood;

    if (mood === 'streak') {
      setQuote(pickRandom(STREAK_QUOTES));
      setIsJumping(true);
      setPopTag({ label: comboCount >= 5 ? `⚡ BEAM x${comboCount}!` : '🍪 CHOCOBI!', key: Date.now() });
    } else if (mood === 'correct') {
      setQuote(pickRandom(CORRECT_QUOTES));
      setIsJumping(true);
      setPopTag({ label: '⭐ SUGOI!', key: Date.now() });
    } else if (mood === 'wrong') {
      setQuote(pickRandom(WRONG_QUOTES));
      setIsJumping(false);
      setPopTag({ label: '🫑 ỚT CHUÔNG!', key: Date.now() });
    } else if (mood === 'focus') {
      setQuote(pickRandom(FOCUS_QUOTES));
      setIsJumping(false);
    } else {
      setQuote(pickRandom(scene === 'rain' ? RAIN_QUOTES : IDLE_QUOTES));
      setIsJumping(false);
    }

    if (mood === 'correct' || mood === 'streak' || mood === 'wrong') {
      if (jumpTimerRef.current) window.clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = window.setTimeout(() => {
        setIsJumping(false);
        setPopTag(null);
      }, 1150);
    }
  }, [mood, comboCount, scene]);

  useEffect(() => {
    return () => {
      if (jumpTimerRef.current) window.clearTimeout(jumpTimerRef.current);
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  const handleClickShin = () => {
    playShinBoingSound();
    clickCountRef.current += 1;

    setIsJumping(true);
    setPopTag({
      label: clickCountRef.current % 3 === 0 ? '⚡ ACTION BEAM!' : '🍪 BOING!',
      key: Date.now(),
    });

    if (clickCountRef.current % 3 === 0 && onTriggerActionBeam) {
      onTriggerActionBeam();
      setQuote('ACTION BEAM!! ⚡ Quá đã luôn bạn ơi!');
    } else {
      const pool = scene === 'rain' ? [...RAIN_QUOTES, ...IDLE_QUOTES] : IDLE_QUOTES;
      setQuote((prev) => pickRandom(pool, prev));
    }

    if (variant === 'floating') {
      setShowFloatingBubble(true);
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = window.setTimeout(() => setShowFloatingBubble(false), 3800);
    }

    if (jumpTimerRef.current) window.clearTimeout(jumpTimerRef.current);
    jumpTimerRef.current = window.setTimeout(() => {
      setIsJumping(false);
      setPopTag(null);
    }, 950);
  };

  if (variant === 'floating' && isDismissed) {
    return (
      <button
        type="button"
        className="shin-floating-restore-btn"
        onClick={() => setIsDismissed(false)}
        title="Gọi bé Shin quay lại"
      >
        🖍️ Gọi Shin
      </button>
    );
  }

  const useJumpPose = isJumping || mood === 'correct' || mood === 'streak';
  const activeImg = useJumpPose ? shinJumpImg : shinIdleImg;

  return (
    <div
      className={`shin-mascot-root is-${variant} mood-${mood} scene-${scene} ${
        mouseEffectsEnabled ? 'fx-on' : 'fx-off'
      }`}
    >
      {variant === 'floating' && (
        <button
          type="button"
          className="shin-floating-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          title="Ẩn tạm bé Shin"
          aria-label="Ẩn tạm bé Shin"
        >
          ×
        </button>
      )}

      <div
        className={`shin-sticker-stage ${useJumpPose ? 'is-jumping' : ''} ${
          mood === 'wrong' ? 'is-pepper-panic' : ''
        }`}
        onClick={handleClickShin}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClickShin();
          }
        }}
        title="Bấm vào bé Shin để nghe thoại hài (Bấm 3 lần kích hoạt Action Beam!)"
      >
        {/* 3D Soft Ground Contact Shadow */}
        <div className="shin-ground-shadow" aria-hidden="true" />

        {/* Green Pepper Panic Dizzy Swirl + Bouncing Pepper */}
        {mood === 'wrong' && (
          <div className="shin-pepper-fx" aria-hidden="true">
            <span className="shin-pepper-icon">🫑</span>
            <svg className="shin-dizzy-svg" viewBox="0 0 64 24" fill="none">
              <path
                d="M10 14C14 5 24 5 28 13C31 19 22 21 20 15C18 9 32 4 42 12C48 16 54 12 56 8"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Bursting ChocoBi Stars when Jumping */}
        {useJumpPose && (
          <div className="shin-chocobi-stars" aria-hidden="true">
            <span className="shin-star s1">★</span>
            <span className="shin-star s2">★</span>
            <span className="shin-star s3">✦</span>
            <span className="shin-star s4">★</span>
          </div>
        )}

        {/* Pop Motion Tag */}
        {popTag && (
          <span key={popTag.key} className="shin-pop-tag">
            {popTag.label}
          </span>
        )}

        <img
          src={activeImg}
          alt="Crayon Shin-chan Mascot"
          className={`shin-sticker-img ${useJumpPose ? 'pose-jump' : 'pose-idle'}`}
          draggable={false}
        />
      </div>

      {/* Speech Bubble */}
      {(variant === 'sidebar' || showFloatingBubble) && (
        <div
          className={`shin-speech-bubble mood-${mood}`}
          onClick={handleClickShin}
          title="Bấm để đổi câu thoại"
        >
          {quote}
        </div>
      )}
    </div>
  );
}
