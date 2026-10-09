import { useEffect, useRef } from 'react';
import './StudyMilestoneRain.css';

interface StudyMilestoneRainProps {
  onClose: () => void;
}

const RAIN_CHARACTERS = Array.from('KeyTchúcbạnthitốtnhé!');
const RAIN_DROPS = Array.from({ length: 64 }, (_, index) => ({
  character: RAIN_CHARACTERS[(index * 7) % RAIN_CHARACTERS.length],
  left: `${(index * 37 + 11) % 100}%`,
  delay: `-${(index * 13) % 9}s`,
  duration: `${5 + (index % 6) * 0.65}s`,
  size: `${15 + (index % 4) * 3}px`,
  tone: index % 3,
}));

export default function StudyMilestoneRain({ onClose }: StudyMilestoneRainProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    continueButtonRef.current?.focus();

    const dismissTimer = window.setTimeout(onClose, 8500);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const buttons = overlayRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        if (!buttons?.length) return;

        const firstButton = buttons[0];
        const lastButton = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === firstButton) {
          event.preventDefault();
          lastButton.focus();
        } else if (!event.shiftKey && document.activeElement === lastButton) {
          event.preventDefault();
          firstButton.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(dismissTimer);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="study-milestone-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-milestone-title"
    >
      <div className="study-milestone-rain" aria-hidden="true">
        {RAIN_DROPS.map((drop, index) => (
          <span
            key={index}
            className={`study-milestone-rain-char tone-${drop.tone}`}
            style={{
              left: drop.left,
              animationDelay: drop.delay,
              animationDuration: drop.duration,
              fontSize: drop.size,
            }}
          >
            {drop.character}
          </span>
        ))}
      </div>

      <div className="study-milestone-card">
        <button
          type="button"
          className="study-milestone-close"
          onClick={onClose}
          aria-label="Đóng lời chúc"
        >
          ×
        </button>
        <span className="study-milestone-badge">30 PHÚT HỌC TẬP</span>
        <div className="study-milestone-sparkle" aria-hidden="true">✦</div>
        <h2 id="study-milestone-title">KeyT chúc bạn thi tốt nhé !</h2>
        <p>Bạn đã kiên trì học tập suốt 30 phút. Cố lên nhé!</p>
        <button
          ref={continueButtonRef}
          type="button"
          className="study-milestone-continue"
          onClick={onClose}
        >
          Tiếp tục học
        </button>
      </div>
    </div>
  );
}
