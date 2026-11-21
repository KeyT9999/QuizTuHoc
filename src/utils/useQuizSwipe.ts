import { useRef, type TouchEventHandler } from 'react';

interface UseQuizSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  canSwipeLeft?: boolean;
  canSwipeRight?: boolean;
  enabled?: boolean;
  thresholdPx?: number;
}

const IGNORED_SWIPE_SELECTOR =
  'input, textarea, select, [contenteditable="true"], .quiz-mode-hub, .ask-ai-mobile-sheet, .mobile-quiz-dock, .quiz-mobile-tools-drawer';

export function useQuizSwipe({
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft = true,
  canSwipeRight = true,
  enabled = true,
  thresholdPx = 56,
}: UseQuizSwipeOptions): {
  onTouchStart: TouchEventHandler<HTMLElement>;
  onTouchEnd: TouchEventHandler<HTMLElement>;
  onTouchCancel: TouchEventHandler<HTMLElement>;
} {
  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const onTouchStart: TouchEventHandler<HTMLElement> = (event) => {
    if (!enabled || event.touches.length !== 1) {
      startRef.current = null;
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest(IGNORED_SWIPE_SELECTOR)) {
      startRef.current = null;
      return;
    }

    const touch = event.touches[0];
    startRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const onTouchEnd: TouchEventHandler<HTMLElement> = (event) => {
    if (!enabled || !startRef.current || event.changedTouches.length !== 1) {
      startRef.current = null;
      return;
    }

    const start = startRef.current;
    startRef.current = null;

    // Respect user text selection gestures
    const selectionText = window.getSelection?.()?.toString().trim();
    if (selectionText) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dt = Date.now() - start.time;

    if (dt > 650) return;
    if (Math.abs(dx) < thresholdPx) return;
    if (Math.abs(dx) <= Math.abs(dy) * 1.45) return;

    if (dx < 0 && canSwipeLeft) {
      onSwipeLeft();
    } else if (dx > 0 && canSwipeRight) {
      onSwipeRight();
    }
  };

  const onTouchCancel: TouchEventHandler<HTMLElement> = () => {
    startRef.current = null;
  };

  return { onTouchStart, onTouchEnd, onTouchCancel };
}
