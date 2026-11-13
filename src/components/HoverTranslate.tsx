import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TranslationPopover {
  source: string;
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

function getWordAtPoint(element: HTMLElement, x: number, y: number): string {
  const context = element.dataset.hoverTranslate?.trim() || '';
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const caretPosition = doc.caretPositionFromPoint?.(x, y);
  const caretRange = caretPosition ? null : doc.caretRangeFromPoint?.(x, y);
  const textNode = caretPosition?.offsetNode ?? caretRange?.startContainer;
  const offset = caretPosition?.offset ?? caretRange?.startOffset;

  if (!textNode || offset === undefined || !element.contains(textNode)) return context;

  const text = textNode.textContent || '';
  for (const match of text.matchAll(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)) {
    const start = match.index ?? 0;
    if (offset >= start && offset <= start + match[0].length) return match[0];
  }

  return context;
}

function getCacheKey(context: string, source: string): string {
  const normalizedContext = context.trim().replace(/\s+/g, ' ').toLowerCase();
  return `${normalizedContext}\u0000${source.trim().toLowerCase()}`;
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
  const activeSource = useRef('');
  const requestVersion = useRef(0);

  useEffect(() => {
    let hoverTimer: number | undefined;
    let lastPointerMoveAt = 0;

    const closePopover = () => {
      if (hoverTimer !== undefined) window.clearTimeout(hoverTimer);
      hoverTimer = undefined;
      activeTarget.current = null;
      activeSource.current = '';
      requestVersion.current += 1;
      setPopover(null);
    };

    const openPopover = (element: HTMLElement, x: number, y: number, hoveredTerm?: string) => {
      const context = element.dataset.hoverTranslate?.trim() || '';
      const source = hoveredTerm?.trim() || context;
      if (!/[A-Za-z]{2}/.test(context) || !source) {
        closePopover();
        return;
      }

      if (activeTarget.current === element && activeSource.current === source) return;
      if (hoverTimer !== undefined) window.clearTimeout(hoverTimer);

      activeTarget.current = element;
      activeSource.current = source;
      const version = ++requestVersion.current;
      const cacheKey = getCacheKey(context, source);
      const cachedTranslation = translationCache.get(cacheKey);
      const placement = y > window.innerHeight - 180 ? 'above' : 'below';
      const popoverX = Math.max(12, Math.min(x + 12, window.innerWidth - 340));
      const popoverY = placement === 'above' ? y - 12 : y + 16;

      setPopover(cachedTranslation
        ? { source, x: popoverX, y: popoverY, placement, status: 'ready', translation: cachedTranslation }
        : null);

      if (cachedTranslation) return;

      hoverTimer = window.setTimeout(async () => {
        if (activeTarget.current !== element || requestVersion.current !== version) return;
        setPopover({ source, x: popoverX, y: popoverY, placement, status: 'loading' });

        try {
          const response = await fetch('/api/ask-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'translate', text: source, context }),
          });
          const payload = (await response.json().catch(() => null)) as TranslationResponse | null;
          const translation = payload?.translation?.trim();

          if (!response.ok || !translation) throw new Error('Translation unavailable');

          rememberTranslation(cacheKey, translation);
          if (activeTarget.current === element && requestVersion.current === version) {
            setPopover({ source, x: popoverX, y: popoverY, placement, status: 'ready', translation });
          }
        } catch {
          if (activeTarget.current === element && requestVersion.current === version) {
            setPopover({ source, x: popoverX, y: popoverY, placement, status: 'error' });
          }
        }
      }, HOVER_DELAY_MS);
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const element = getTranslationTarget(event.target);
      if (element) openPopover(element, event.clientX, event.clientY, getWordAtPoint(element, event.clientX, event.clientY));
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      if (lastPointerMoveAt && event.timeStamp - lastPointerMoveAt < 50) return;
      lastPointerMoveAt = event.timeStamp;
      const element = getTranslationTarget(event.target);
      if (element) openPopover(element, event.clientX, event.clientY, getWordAtPoint(element, event.clientX, event.clientY));
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
      openPopover(element, bounds.left, bounds.top, element.dataset.hoverTranslate);
    };

    const handleFocusOut = (event: FocusEvent) => {
      const element = getTranslationTarget(event.target);
      const nextElement = getTranslationTarget(event.relatedTarget);
      if (element && element === activeTarget.current && nextElement !== element) closePopover();
    };

    document.addEventListener('pointerover', handlePointerOver);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerout', handlePointerOut);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (hoverTimer !== undefined) window.clearTimeout(hoverTimer);
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointermove', handlePointerMove);
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
      <span className="hover-translation-label">{popover.source} · Tiếng Việt</span>
      {popover.status === 'loading' && <span>Đang dịch…</span>}
      {popover.status === 'error' && <span>Chưa dịch được, hãy thử lại sau.</span>}
      {popover.status === 'ready' && <span>{popover.translation}</span>}
    </div>,
    document.body,
  );
}
