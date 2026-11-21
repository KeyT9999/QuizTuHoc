import { useState, useEffect, useRef, useCallback } from 'react';
import spideyChibiImg from '../assets/spidey_chibi.png';
import { playWebThwipSound } from '../utils/soundEffects';
import './SpideyNightTheme.css';

export type SpideyMood = 'idle' | 'correct' | 'wrong' | 'streak';
export type SpideySuitMode = 'classic' | 'symbiote';

interface SpideyChibiMascotProps {
  variant?: 'sidebar' | 'floating';
  mood?: SpideyMood;
  suitMode?: SpideySuitMode;
  combo?: number;
  mouseEffectsEnabled?: boolean;
  onTriggerSwing?: () => void;
}

const SYMBIOTE_QUOTES = [
  'WE ARE... PASSING THIS EXAM! 🖤',
  'Symbiote Stealth Mode — cày đêm cực êm mắt 🕷️',
  'Bóng tối giúp tập trung gấp đôi, quét sạch đề thôi!',
  'Tơ bạc Symbiote đã khóa mục tiêu A+! ⚡',
];

const IDLE_QUOTES = [
  'With great GPA comes great responsibility! 🕷️',
  'Giác quan nhện mách hôm nay bạn pass mượt!',
  'Bắn tơ qua môn nào, cố lên bạn ơi! 🕸️',
  'Mỗi câu đúng là một cú đu tơ siêu đỉnh!',
  'Đêm New York mát quá, cày thêm 10 câu nữa nhé!',
  'Nhấn vào mình để tiếp thêm năng lượng Spider-Verse ⚡',
];

const CORRECT_QUOTES = [
  'THWIP! Chuẩn không cần chỉnh! 🎯',
  'Đỉnh nóc kịch trần luôn bạn ơi! 🕷️',
  'Giác quan nhện xác nhận: Quá xuất sắc!',
  'Bắn trúng hồng tâm! Tiếp tục giữ phong độ!',
];

const STREAK_QUOTES = [
  'Spider-Verse Combo đang bùng cháy! 🔥',
  'Không ai cản nổi chuỗi đúng này đâu! ⚡',
  'Đu tơ tốc độ ánh sáng! Đỉnh quá! 🕸️',
];

const WRONG_QUOTES = [
  'Spider-Sense ting ting! Đọc kỹ đáp án đúng nhé ⚡',
  'Ngã tơ nhẹ thôi — đứng dậy làm câu sau chuẩn ngay!',
  'Ghi nhớ câu này lại, vào phòng thi gặp là ăn chắc! 💡',
];

export default function SpideyChibiMascot({
  variant = 'sidebar',
  mood = 'idle',
  suitMode = 'classic',
  combo = 0,
  mouseEffectsEnabled = true,
  onTriggerSwing,
}: SpideyChibiMascotProps) {
  const [isDropped, setIsDropped] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (variant !== 'floating') return false;
    try {
      return localStorage.getItem('keyt_spidey_chibi_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [quote, setQuote] = useState<string>(IDLE_QUOTES[0]);
  const [showBubble, setShowBubble] = useState<boolean>(variant === 'sidebar');
  const [thwipCount, setThwipCount] = useState(0);

  const dropTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);

  // React automatically when quiz mood changes
  useEffect(() => {
    if (variant !== 'sidebar') return;
    if (mood === 'streak' && combo >= 2) {
      const pick = STREAK_QUOTES[combo % STREAK_QUOTES.length];
      setQuote(`COMBO x${combo}! ${pick}`);
      setShowBubble(true);
    } else if (mood === 'correct') {
      const pick = CORRECT_QUOTES[Math.floor(Math.random() * CORRECT_QUOTES.length)];
      setQuote(pick);
      setShowBubble(true);
    } else if (mood === 'wrong') {
      const pick = WRONG_QUOTES[Math.floor(Math.random() * WRONG_QUOTES.length)];
      setQuote(pick);
      setShowBubble(true);
    }
  }, [mood, combo, variant]);

  useEffect(() => {
    return () => {
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  const handleChibiClick = useCallback(() => {
    playWebThwipSound(false);
    setThwipCount((prev) => {
      const next = prev + 1;
      // Every 3 clicks on sidebar Chibi triggers an Easter-egg overhead web swing!
      if (variant === 'sidebar' && next % 3 === 0 && onTriggerSwing) {
        onTriggerSwing();
      }
      return next;
    });
    setIsDropped(true);
    if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    dropTimerRef.current = window.setTimeout(() => setIsDropped(false), 620);

    const pool =
      suitMode === 'symbiote'
        ? SYMBIOTE_QUOTES
        : mood === 'wrong'
        ? WRONG_QUOTES
        : mood === 'streak'
        ? STREAK_QUOTES
        : IDLE_QUOTES;
    const nextQuote = pool[Math.floor(Math.random() * pool.length)];
    setQuote(nextQuote);
    setShowBubble(true);

    if (variant === 'floating') {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = window.setTimeout(() => setShowBubble(false), 4200);
    }
  }, [mood, suitMode, variant, onTriggerSwing]);

  const handleToggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('keyt_spidey_chibi_collapsed', next ? 'true' : 'false');
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  if (variant === 'floating' && isCollapsed) {
    return (
      <button
        type="button"
        className="spidey-chibi-collapsed-pill"
        onClick={handleToggleCollapse}
        title="Gọi Chibi Spidey đu tơ xuất hiện"
        aria-label="Hiện Chibi Spidey"
      >
        <span className="spidey-collapsed-icon">🕷️</span>
        <span>Spidey</span>
      </button>
    );
  }

  return (
    <div
      className={`spidey-chibi-root is-${variant} mood-${mood} suit-${suitMode} ${
        isDropped ? 'is-dropped' : ''
      } ${mouseEffectsEnabled ? 'fx-on' : 'fx-off'}`}
    >
      {variant === 'floating' && (
        <button
          type="button"
          className="spidey-chibi-hide-btn"
          onClick={handleToggleCollapse}
          title="Thu gọn Chibi Spidey"
          aria-label="Thu gọn Chibi Spidey"
        >
          ×
        </button>
      )}

      {/* Swinging pendulum rig anchored to top edge */}
      <div
        className="spidey-chibi-pendulum"
        onClick={handleChibiClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleChibiClick();
          }
        }}
        title="Bấm vào Chibi Spidey để đu tơ & nhận lời cổ vũ!"
        aria-label="Chibi Spidey đu dây tơ"
      >
        {/* Seamless vertical silk web strand connecting top anchor to the rope top at x=75.1% */}
        <svg
          className="spidey-chibi-web-line"
          viewBox="0 0 12 68"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            x1="6"
            y1="0"
            x2="6"
            y2="68"
            stroke="rgba(248, 250, 252, 0.88)"
            strokeWidth="2.2"
            strokeDasharray="6 2 3 2"
          />
          <line
            x1="6"
            y1="0"
            x2="6"
            y2="68"
            stroke="rgba(56, 189, 248, 0.45)"
            strokeWidth="4"
            opacity="0.45"
          />
        </svg>

        {/* Spider-Sense alert sparks above Chibi head when wrong */}
        {mood === 'wrong' && (
          <svg
            className="spidey-chibi-sense-sparks"
            viewBox="0 0 120 42"
            fill="none"
            aria-hidden="true"
          >
            <path d="M18 32 L26 20 L16 14 L25 4" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M60 28 L55 15 L65 11 L60 2" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M102 32 L94 20 L104 14 L95 4" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}

        <img
          src={spideyChibiImg}
          alt="Chibi Spider-Man đu dây tơ"
          className="spidey-chibi-img"
          draggable={false}
        />

        {isDropped && (
          <span key={thwipCount} className="spidey-chibi-thwip-tag">
            THWIP!
          </span>
        )}
      </div>

      {/* Comic Speech Bubble */}
      {showBubble && (
        <div
          className={`spidey-chibi-bubble mood-${mood}`}
          onClick={handleChibiClick}
          role="status"
          aria-live="polite"
        >
          <span className="spidey-bubble-text">{quote}</span>
        </div>
      )}
    </div>
  );
}
