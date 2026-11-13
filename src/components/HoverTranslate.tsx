import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TranslationPopover {
  label: string;
  x: number;
  y: number;
  placement: 'above' | 'below';
  status: 'loading' | 'ready' | 'error';
  translation?: string;
}

interface TranslationResponse {
  translation?: string;
}

const HOVER_DELAY_MS = 450;
const MAX_CACHED_TRANSLATIONS = 300;
const translationCache = new Map<string, string>();

function getTranslationTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;

  const directTarget = target.closest<HTMLElement>('[data-hover-translate]');
  if (directTarget) return directTarget;

  return target.closest('button')?.querySelector<HTMLElement>('[data-hover-translate]') ?? null;
}

function getCacheKey(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

function rememberTranslation(key: string, translation: string): void {
  if (translationCache.size >= MAX_CACHED_TRANSLATIONS) {
    const oldestKey = translationCache.keys().next().value;
    if (oldestKey) translationCache.delete(oldestKey);
  }

  translationCache.set(key, translation);
}

export default function HoverTranslate() {
  const [popover, setPopover] = useState<TranslationPopover | null>(null);
  const activeTarget = useRef<HTMLElement | null>(null);
  const requestVersion = useRef(0);

  useEffect(() => {
    let hoverTimer: number | undefined;

    const closePopover = () => {
      if (hoverTimer !== undefined) window.clearTimeout(hoverTimer);
      hoverTimer = undefined;
      activeTarget.current = null;
      requestVersion.current += 1;
      setPopover(null);
    };

    const openPopover = (element: HTMLElement, x: number, y: number) => {
      const text = element.dataset.hoverTranslate?.trim() || '';
      if (!/[A-Za-z]{2}/.test(text)) {
        closePopover();
        return;
      }

      if (activeTarget.current === element) return;
      if (hoverTimer !== undefined) window.clearTimeout(hoverTimer);

      activeTarget.current = element;
      const version = ++requestVersion.current;
      const cacheKey = getCacheKey(text);
      const cachedTranslation = translationCache.get(cacheKey);
      const label = element.dataset.hoverTranslateKind === 'question' ? 'Câu hỏi · Tiếng Việt' : 'Đáp án · Tiếng Việt';
      const placement = y > window.innerHeight - 180 ? 'above' : 'below';
      const popoverX = Math.max(12, Math.min(x + 12, window.innerWidth - 340));
      const popoverY = placement === 'above' ? y - 12 : y + 16;

      setPopover(cachedTranslation
        ? { label, x: popoverX, y: popoverY, placement, status: 'ready', translation: cachedTranslation }
        : null);

      if (cachedTranslation) return;

      hoverTimer = window.setTimeout(async () => {
        if (activeTarget.current !== element || requestVersion.current !== version) return;
        setPopover({ label, x: popoverX, y: popoverY, placement, status: 'loading' });

        try {
          const response = await fetch('/api/ask-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'translate', text }),
          });
          const payload = (await response.json().catch(() => null)) as TranslationResponse | null;
          const translation = payload?.translation?.trim();

          if (!response.ok || !translation) throw new Error('Translation unavailable');

          rememberTranslation(cacheKey, translation);
          if (activeTarget.current === element && requestVersion.current === version) {
            setPopover({ label, x: popoverX, y: popoverY, placement, status: 'ready', translation });
          }
        } catch {
          if (activeTarget.current === element && requestVersion.current === version) {
            setPopover({ label, x: popoverX, y: popoverY, placement, status: 'error' });
          }
        }
      }, HOVER_DELAY_MS);
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const element = getTranslationTarget(event.target);
      if (element) openPopover(element, event.clientX, event.clientY);
    };

    const handlePointerOut = (event: PointerEvent) => {
      const element = getTranslationTarget(event.target);
      const nextElement = getTranslationTarget(event.relatedTarget);
      if (element && element === activeTarget.current && nextElement !== element) closePopover();
    };

    const handleFocusIn = (event: FocusEvent) => {
      const element = getTranslationTarget(event.target);
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      openPopover(element, bounds.left, bounds.top);
    };

    const handleFocusOut = (event: FocusEvent) => {
      const element = getTranslationTarget(event.target);
      const nextElement = getTranslationTarget(event.relatedTarget);
      if (element && element === activeTarget.current && nextElement !== element) closePopover();
    };

    document.addEventListener('pointerover', handlePointerOver);
    document.addEventListener('pointerout', handlePointerOut);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (hoverTimer !== undefined) window.clearTimeout(hoverTimer);
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  if (!popover) return null;

  return createPortal(
    <div
      className={`hover-translation-tooltip is-${popover.placement}`}
      role="tooltip"
      aria-live="polite"
      style={{ left: popover.x, top: popover.y }}
    >
      <span className="hover-translation-label">{popover.label}</span>
      {popover.status === 'loading' && <span>Đang dịch…</span>}
      {popover.status === 'error' && <span>Chưa dịch được, hãy thử lại sau.</span>}
      {popover.status === 'ready' && <span>{popover.translation}</span>}
    </div>,
    document.body,
  );
}
