import { useState, useEffect, useRef } from 'react';
import flyingWingsImg from '../assets/money_flying_wings.png';
import { playCashRegisterSound, playMoneyCountSound } from '../utils/soundEffects';
import type { MoneyVaultFinish } from '../utils/studyStats';

export type MoneyMood = 'idle' | 'correct' | 'wrong' | 'streak' | 'focus';

interface MoneyWingsMascotProps {
  variant?: 'sidebar' | 'floating';
  mood?: MoneyMood;
  finish?: MoneyVaultFinish;
  comboCount?: number;
  mouseEffectsEnabled?: boolean;
  onTriggerMakeItRain?: () => void;
}

const IDLE_QUOTES = [
  'Chốt đúng câu này cộng ngay +$10,000 vào két sắt nhé! 💵',
  'Học chắc kiến thức — lương USD tự khắc tìm tới cửa! 🏦',
  'Đừng để tiền mọc cánh bay mất, soi kỹ đáp án chuẩn đi nào! 💸',
  'Người giàu không đoán mò — họ đầu tư chuẩn xác từng câu! 💎',
  'Mỗi câu đúng là một tờ $100 Benjamin Franklin mới tinh! 🎩',
  'GPA 4.0 + Thẻ Đen Black Card — combo chuẩn tỷ phú! ✨',
];

const CORRECT_QUOTES = [
  'KA-CHING!! Tiền USD chảy rào rào vào tài khoản Thụy Sĩ! 💵✨',
  'Đầu tư quá chuẩn! Cổ phiếu GPA vừa tăng trần +100%! 📈',
  'Chốt đơn +$25,000! Thêm mấy câu nữa mua G63 luôn nhé! 🏎️',
  'Đỉnh cao Private Banking! Đáp án chuẩn không lệch 1 xu! 🏆',
];

const WRONG_QUOTES = [
  'Ối! Thị trường rung lắc -$5,000! Đọc kỹ lại để chốt lời câu sau! 📉',
  'Suýt thì tiền mọc cánh bay mất! Ghi nhớ ngay để không lỗ lần 2! 💸',
  'Thị trường điều chỉnh nhẹ thôi — tỷ phú thực thụ luôn gỡ lại gấp 10! 💎',
];

const STREAK_QUOTES = [
  'WIRE TRANSFER APPROVED!! Tiền đô rơi ngập két sắt!! 🏦💵',
  'BULL MARKET!! Chuỗi thắng của bậc thầy Phố Wall! 📈🔥',
  'Tài khoản USD tăng dựng đứng — chuẩn hạng Billionaire! 👑',
];

const FOCUS_QUOTES = [
  'Chế độ Private Vault: yên tĩnh tuyệt đối để tối ưu hóa lợi nhuận GPA! 🤫',
];

function pickRandom(list: string[], exclude?: string): string {
  const pool = list.filter((q) => q !== exclude);
  const src = pool.length > 0 ? pool : list;
  return src[Math.floor(Math.random() * src.length)];
}

export default function MoneyWingsMascot({
  variant = 'sidebar',
  mood = 'idle',
  finish = 'obsidian',
  comboCount = 0,
  mouseEffectsEnabled = true,
  onTriggerMakeItRain,
}: MoneyWingsMascotProps) {
  const [quote, setQuote] = useState<string>(IDLE_QUOTES[0]);
  const [isSoaring, setIsSoaring] = useState(false);
  const [popTag, setPopTag] = useState<{ label: string; key: number } | null>(null);
  const [showFloatingBubble, setShowFloatingBubble] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const clickCountRef = useRef(0);
  const soarTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);
  const prevMoodRef = useRef<MoneyMood>(mood);

  useEffect(() => {
    if (mood === prevMoodRef.current && mood !== 'correct' && mood !== 'streak') return;
    prevMoodRef.current = mood;

    if (mood === 'streak') {
      setQuote(pickRandom(STREAK_QUOTES));
      setIsSoaring(true);
      setPopTag({ label: comboCount >= 5 ? `💵 +$100K x${comboCount}` : '💎 BULL RUN!', key: Date.now() });
    } else if (mood === 'correct') {
      setQuote(pickRandom(CORRECT_QUOTES));
      setIsSoaring(true);
      setPopTag({ label: '💵 +$10,000', key: Date.now() });
    } else if (mood === 'wrong') {
      setQuote(pickRandom(WRONG_QUOTES));
      setIsSoaring(false);
      setPopTag({ label: '📉 -$5,000', key: Date.now() });
    } else if (mood === 'focus') {
      setQuote(pickRandom(FOCUS_QUOTES));
      setIsSoaring(false);
    } else {
      setQuote(pickRandom(IDLE_QUOTES));
      setIsSoaring(false);
    }

    if (mood === 'correct' || mood === 'streak' || mood === 'wrong') {
      if (soarTimerRef.current) window.clearTimeout(soarTimerRef.current);
      soarTimerRef.current = window.setTimeout(() => {
        setIsSoaring(false);
        setPopTag(null);
      }, 1200);
    }
  }, [mood, comboCount]);

  useEffect(() => {
    return () => {
      if (soarTimerRef.current) window.clearTimeout(soarTimerRef.current);
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  const handleClickWings = () => {
    clickCountRef.current += 1;
    const isRainTrigger = clickCountRef.current % 3 === 0;

    if (isRainTrigger) {
      playCashRegisterSound();
    } else {
      playMoneyCountSound();
    }

    setIsSoaring(true);
    setPopTag({
      label: isRainTrigger ? '💵 MAKE IT RAIN!' : '✨ +$100 USD',
      key: Date.now(),
    });

    if (isRainTrigger && onTriggerMakeItRain) {
      onTriggerMakeItRain();
      setQuote('WIRE TRANSFER APPROVED! Mưa $100 USD đang đổ xuống!! 💵✨');
    } else {
      setQuote((prev) => pickRandom(IDLE_QUOTES, prev));
    }

    if (variant === 'floating') {
      setShowFloatingBubble(true);
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = window.setTimeout(() => setShowFloatingBubble(false), 3800);
    }

    if (soarTimerRef.current) window.clearTimeout(soarTimerRef.current);
    soarTimerRef.current = window.setTimeout(() => {
      setIsSoaring(false);
      setPopTag(null);
    }, 950);
  };

  if (variant === 'floating' && isDismissed) {
    return (
      <button
        type="button"
        className="money-floating-restore-btn"
        onClick={() => setIsDismissed(false)}
        title="Gọi Cọc Đô Có Cánh quay lại"
      >
        💸 Gọi USD
      </button>
    );
  }

  return (
    <div
      className={`money-mascot-root is-${variant} mood-${mood} finish-${finish} ${
        mouseEffectsEnabled ? 'fx-on' : 'fx-off'
      }`}
    >
      {variant === 'floating' && (
        <button
          type="button"
          className="money-floating-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          title="Ẩn tạm Cọc Đô Có Cánh"
          aria-label="Ẩn tạm Cọc Đô Có Cánh"
        >
          ×
        </button>
      )}

      <div
        className={`money-wings-stage ${isSoaring ? 'is-soaring' : ''} ${
          mood === 'wrong' ? 'is-dip-shake' : ''
        }`}
        onClick={handleClickWings}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClickWings();
          }
        }}
        title="Bấm vào Cọc Đô Có Cánh (Bấm 3 lần kích hoạt Mưa $100 USD!)"
      >
        <div className="money-wings-aura" aria-hidden="true" />

        {isSoaring && (
          <div className="money-sparkle-ring" aria-hidden="true">
            <span className="m-spark s1">$</span>
            <span className="m-spark s2">✦</span>
            <span className="m-spark s3">$</span>
            <span className="m-spark s4">✦</span>
          </div>
        )}

        {popTag && (
          <span key={popTag.key} className={`money-pop-tag mood-${mood}`}>
            {popTag.label}
          </span>
        )}

        <img
          src={flyingWingsImg}
          alt="Cọc tiền Đô la Mỹ có cánh"
          className="money-wings-img"
          draggable={false}
        />
      </div>

      {(variant === 'sidebar' || showFloatingBubble) && (
        <div
          className={`money-speech-bubble mood-${mood}`}
          onClick={handleClickWings}
          title="Bấm để xem câu thoại mới"
        >
          {quote}
        </div>
      )}
    </div>
  );
}
