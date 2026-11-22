import { useState, useEffect, useRef } from 'react';
import doraemonWinkImg from '../assets/doraemon_wink.png';
import doraemonPeekImg from '../assets/doraemon_peek.png';
import { playDoraemonBellSound, playDoraemonGadgetSound } from '../utils/soundEffects';
import type { DoraemonSceneId } from '../utils/studyStats';

export type DoraemonMood = 'idle' | 'happy' | 'excited' | 'peek' | 'wrong';

interface DoraemonMascotProps {
  variant: 'sidebar' | 'floating';
  scene: DoraemonSceneId;
  mood?: DoraemonMood;
  combo?: number;
  mouseEffectsEnabled?: boolean;
  onTriggerPortal?: () => void;
}

const IDLE_QUOTES = [
  'Bánh Mì Ghi Nhớ đã sẵn sàng — học đến đâu thuộc làu đến đó! 🍞✨',
  'Đội Chong Chóng Tre lên và bay thẳng tới GPA 4.0 nào! 🚁💙',
  'Mỗi câu đúng cậu được thưởng 1 chiếc bánh rán Dorayaki nóng hổi! 🥞',
  'Cứ bình tĩnh đọc kỹ đề, Túi Thần Kỳ 4D luôn ở bên cậu! 🔔',
  'Bấm vào tớ 3 lần để mở Cánh Cửa Thần Kỳ nhé! 🚪✨',
];

const HAPPY_QUOTES = [
  'Tèn tén ten! Chính xác rồi, thưởng cậu bánh rán Dorayaki nè! 🥞💛',
  'Giỏi hơn cả Dekisugi luôn rồi đó cậu ơi! ⭐💙',
  'Bánh Mì Ghi Nhớ phát huy 100% công lực rồi! 🍞✨',
];

const EXCITED_QUOTES = [
  'COMBO SIÊU ĐỈNH! Mở ngay Cánh Cửa Thần Kỳ qua môn! 🚪🌟',
  'Woa!! Chuỗi trả lời đúng rực sáng cả bầu trời sao đêm! 🌌✨',
  'Tèn tén ten! Bảo bối thế kỷ 22 cũng phải chào thua trí nhớ cậu! 🔔🏆',
];

const WRONG_QUOTES = [
  'Úi! Tớ đang ngó trộm nhắc bài nè — đọc kỹ lại đáp án đúng nha! 👀💙',
  'Không sao đâu, dùng Khăn Trùm Thời Gian làm lại câu sau cực mượt! 🕰️',
  'Suỵt! Đừng để mẹ Nobita biết nha, mình ôn kỹ câu này liền! 🤭✨',
];

const CLICK_QUOTES = [
  'Keng keng! Chuông vàng chúc cậu thi trúng tủ 100%! 🔔✨',
  'Hihi nhột quá! Cho tớ ăn bánh rán Dorayaki đi~ 🥞💙',
  'Tèn tén ten! Lôi ngay bảo bối Qua Môn cấp tốc! 🎁🌟',
];

export default function DoraemonMascot({
  variant,
  scene,
  mood = 'idle',
  combo = 0,
  mouseEffectsEnabled = true,
  onTriggerPortal,
}: DoraemonMascotProps) {
  const [dismissed, setDismissed] = useState(false);
  const [clickBurst, setClickBurst] = useState(0);
  const [localMood, setLocalMood] = useState<DoraemonMood | null>(null);
  const [quote, setQuote] = useState<string>(() => IDLE_QUOTES[0]);
  const [showFloatingQuote, setShowFloatingQuote] = useState(false);

  const clickCountRef = useRef(0);
  const clickResetRef = useRef<number | null>(null);
  const quoteHideRef = useRef<number | null>(null);
  const moodTimerRef = useRef<number | null>(null);

  // React to quiz mood changes
  useEffect(() => {
    if (mood === 'excited') {
      setQuote(EXCITED_QUOTES[combo % EXCITED_QUOTES.length]);
    } else if (mood === 'happy') {
      setQuote(HAPPY_QUOTES[Math.floor(Math.random() * HAPPY_QUOTES.length)]);
    } else if (mood === 'wrong') {
      setQuote(WRONG_QUOTES[Math.floor(Math.random() * WRONG_QUOTES.length)]);
    } else if (mood === 'idle') {
      const idx = Math.floor(Math.random() * IDLE_QUOTES.length);
      setQuote(IDLE_QUOTES[idx]);
    }
  }, [mood, combo]);

  // Periodic gentle quote rotation in sidebar mode
  useEffect(() => {
    if (variant !== 'sidebar') return;
    const interval = window.setInterval(() => {
      if (mood === 'idle' && !localMood) {
        setQuote(IDLE_QUOTES[Math.floor(Math.random() * IDLE_QUOTES.length)]);
      }
    }, 11000);
    return () => clearInterval(interval);
  }, [variant, mood, localMood]);

  useEffect(() => {
    return () => {
      if (clickResetRef.current) clearTimeout(clickResetRef.current);
      if (quoteHideRef.current) clearTimeout(quoteHideRef.current);
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    };
  }, []);

  if (variant === 'floating' && dismissed) return null;

  const effectiveMood: DoraemonMood = localMood || mood;
  const usePeekSprite = effectiveMood === 'wrong' || effectiveMood === 'peek';

  const handleClick = () => {
    setClickBurst((c) => c + 1);
    clickCountRef.current += 1;

    if (clickResetRef.current) clearTimeout(clickResetRef.current);
    clickResetRef.current = window.setTimeout(() => {
      clickCountRef.current = 0;
    }, 1800);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      playDoraemonGadgetSound(true);
      setLocalMood('excited');
      setQuote('TÈN TÉN TEN!! Cánh Cửa Thần Kỳ mở lối qua môn 100%! 🚪✨');
      window.dispatchEvent(new CustomEvent('theme-particle-burst'));
      if (onTriggerPortal) {
        onTriggerPortal();
      }
    } else {
      playDoraemonBellSound(true);
      const nextMood: DoraemonMood = clickCountRef.current === 2 ? 'peek' : 'happy';
      setLocalMood(nextMood);
      setQuote(CLICK_QUOTES[Math.floor(Math.random() * CLICK_QUOTES.length)]);
    }

    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    moodTimerRef.current = window.setTimeout(() => {
      setLocalMood(null);
    }, 2400);

    if (variant === 'floating') {
      setShowFloatingQuote(true);
      if (quoteHideRef.current) clearTimeout(quoteHideRef.current);
      quoteHideRef.current = window.setTimeout(() => {
        setShowFloatingQuote(false);
      }, 3200);
    }
  };

  if (variant === 'floating') {
    return (
      <div
        className={`doraemon-floating-mascot scene-${scene} ${mouseEffectsEnabled ? 'fx-on' : 'fx-off'}`}
        aria-label="Doraemon đồng hành"
      >
        <button
          type="button"
          className="doraemon-floating-close"
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          title="Ẩn Doraemon tạm thời"
          aria-label="Ẩn Doraemon"
        >
          ✕
        </button>

        {showFloatingQuote && (
          <div className="doraemon-floating-bubble" role="status">
            {quote}
          </div>
        )}

        <button
          type="button"
          className={`doraemon-floating-btn mood-${effectiveMood}`}
          onClick={handleClick}
          title="Bấm Doraemon rung chuông vàng · Bấm 3 lần mở bảo bối!"
        >
          <span className="doraemon-floating-aura" aria-hidden="true" />
          <img
            src={usePeekSprite ? doraemonPeekImg : doraemonWinkImg}
            alt="Doraemon"
            className={`doraemon-mascot-img ${usePeekSprite ? 'is-peek' : 'is-wink'}`}
            draggable={false}
          />
          {clickBurst > 0 && (
            <span key={clickBurst} className="doraemon-click-ring" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`doraemon-sidebar-mascot scene-${scene} mood-${effectiveMood}`}>
      <button
        type="button"
        className="doraemon-mascot-stage"
        onClick={handleClick}
        title="Bấm Doraemon rung chuông vàng · Bấm 3 lần mở Cánh Cửa Thần Kỳ!"
      >
        <span className="doraemon-stage-halo" aria-hidden="true" />
        {/* Tiny spinning Take-copter SVG hovering over Doraemon when excited/happy */}
        <svg
          className={`doraemon-mini-copter ${effectiveMood === 'excited' || effectiveMood === 'happy' ? 'is-fast' : ''}`}
          viewBox="0 0 64 30"
          width="44"
          height="21"
          aria-hidden="true"
        >
          <rect x="6" y="4" width="52" height="5" rx="2.5" fill="#facc15" stroke="#b45309" strokeWidth="1.5" />
          <rect x="29" y="8" width="6" height="12" rx="2" fill="#f59e0b" />
          <ellipse cx="32" cy="22" rx="11" ry="5" fill="#fde047" stroke="#b45309" strokeWidth="1.5" />
        </svg>

        <img
          src={usePeekSprite ? doraemonPeekImg : doraemonWinkImg}
          alt="Doraemon đồng hành"
          className={`doraemon-mascot-img ${usePeekSprite ? 'is-peek' : 'is-wink'}`}
          draggable={false}
        />

        {clickBurst > 0 && (
          <div key={clickBurst} className="doraemon-sparkle-burst" aria-hidden="true">
            <span className="d-spark s1">✦</span>
            <span className="d-spark s2">🔔</span>
            <span className="d-spark s3">★</span>
            <span className="d-spark s4">🥞</span>
          </div>
        )}
      </button>

      <div className="doraemon-speech-bubble" role="status">
        {quote}
      </div>
    </div>
  );
}
