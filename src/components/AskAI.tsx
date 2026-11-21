import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Question } from '../utils/quizParser';
import { useTheme } from '../context/ThemeContext';
import {
  AI_PERSONAS,
  MOBILE_ASK_AI_STATE_EVENT,
  MOBILE_ASK_AI_TOGGLE_EVENT,
} from '../utils/askAIConfig';

interface AskAIProps {
  question: Question;
}

interface AskAIResponse {
  answer?: string;
  error?: {
    message?: string;
  };
}

export default function AskAI({ question }: AskAIProps) {
  const { theme } = useTheme();
  const persona = AI_PERSONAS[theme] || AI_PERSONAS.default;
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const panelId = useId();
  const inputId = `${panelId}-input`;
  const mobileInputId = `${panelId}-mobile-input`;
  const requestVersion = useRef(0);
  const answerRef = useRef('');
  const loadingRef = useRef(false);

  answerRef.current = answer;
  loadingRef.current = isLoading;

  useEffect(() => {
    requestVersion.current += 1;
    setIsOpen(false);
    setIsMobileSheetOpen(false);
    setPrompt('');
    setAnswer('');
    setError('');
    setIsLoading(false);
  }, [question.id]);

  const askAI = useCallback(async (customPrompt: string, openInline = true) => {
    if (loadingRef.current) return;

    const currentRequestVersion = ++requestVersion.current;
    if (openInline) setIsOpen(true);
    setIsLoading(true);
    setAnswer('');
    setError('');

    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.text,
          options: question.options,
          correctAnswer: question.correctAnswer,
          prompt: customPrompt,
        }),
      });

      const payload = (await response.json().catch(() => null)) as AskAIResponse | null;
      if (!response.ok || !payload?.answer) {
        throw new Error(payload?.error?.message || 'Không thể nhận câu trả lời từ AI.');
      }

      if (currentRequestVersion === requestVersion.current) {
        setAnswer(payload.answer);
      }
    } catch (requestError: unknown) {
      if (currentRequestVersion === requestVersion.current) {
        setError(requestError instanceof Error ? requestError.message : 'Không thể nhận câu trả lời từ AI.');
      }
    } finally {
      if (currentRequestVersion === requestVersion.current) {
        setIsLoading(false);
      }
    }
  }, [question.correctAnswer, question.options, question.text]);

  useEffect(() => {
    const handleMobileToggle = () => {
      setIsMobileSheetOpen((prev) => {
        const next = !prev;
        if (next) {
          setError('');
          if (!answerRef.current && !loadingRef.current) {
            void askAI('', false);
          }
        }
        return next;
      });
    };

    window.addEventListener(MOBILE_ASK_AI_TOGGLE_EVENT, handleMobileToggle);
    return () => window.removeEventListener(MOBILE_ASK_AI_TOGGLE_EVENT, handleMobileToggle);
  }, [askAI]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(MOBILE_ASK_AI_STATE_EVENT, {
        detail: { isOpen: isMobileSheetOpen, isLoading, hasAnswer: Boolean(answer) },
      })
    );
  }, [isMobileSheetOpen, isLoading, answer]);

  useEffect(() => {
    if (!isMobileSheetOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileSheetOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void askAI(prompt.trim(), !isMobileSheetOpen);
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setError('');
    if (!answer && !isLoading) {
      void askAI('', true);
    }
  };

  return (
    <>
      <section className={`ask-ai ask-ai-theme-${theme}`} aria-labelledby={`${panelId}-title`}>
        <div className="ask-ai-toolbar">
          <div className="ask-ai-toolbar-copy">
            <span className="ask-ai-toolbar-icon" aria-hidden="true">{persona.icon}</span>
            <div>
              <strong>{persona.title}</strong>
              <span>{persona.subtitle}</span>
            </div>
          </div>
          <button
            type="button"
            className={`ask-ai-toggle ${isOpen ? 'is-open' : ''}`}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={handleToggle}
          >
            <span aria-hidden="true">{persona.btnIcon}</span>
            <span>{isLoading ? 'Đang phân tích…' : isOpen ? 'Ẩn lời giải' : persona.cta}</span>
            <span className="ask-ai-toggle-chevron" aria-hidden="true">{isOpen ? '⌃' : '›'}</span>
          </button>
        </div>

        {isOpen && (
          <div id={panelId} className="ask-ai-panel" aria-busy={isLoading}>
            <div className="ask-ai-panel-header">
              <div className="ask-ai-heading">
                <span className="ask-ai-status-dot" aria-hidden="true" />
                <div>
                  <strong id={`${panelId}-title`}>AI phân tích câu này</strong>
                  <span>Đáp án đúng và lời giải thích dựa trên câu hỏi hiện tại.</span>
                </div>
              </div>
              <span className="ask-ai-status">{isLoading ? 'Đang xử lý' : answer ? 'Đã hoàn tất' : 'Sẵn sàng'}</span>
            </div>

            <form className="ask-ai-follow-up" onSubmit={handleSubmit}>
              <label htmlFor={inputId}>Muốn hỏi thêm? <span>Không bắt buộc</span></label>
              <div className="ask-ai-input-row">
                <input
                  id={inputId}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ví dụ: Vì sao đáp án B đúng?"
                  maxLength={1000}
                />
                <button type="submit" className="ask-ai-submit" disabled={isLoading || !prompt.trim()}>
                  Hỏi thêm
                </button>
              </div>
            </form>

            {error && <p className="ask-ai-error" role="alert">{error}</p>}
            {isLoading && (
              <div className="ask-ai-loading" role="status">
                <span className="ask-ai-spinner" aria-hidden="true" />
                <span>AI đang đọc câu hỏi và đối chiếu các lựa chọn…</span>
              </div>
            )}
            {answer && !isLoading && (
              <div className="ask-ai-answer" role="status" aria-live="polite">
                <div className="ask-ai-answer-heading">
                  <span className="ask-ai-answer-icon" aria-hidden="true">✓</span>
                  <strong>Câu trả lời từ AI</strong>
                </div>
                <p>{answer}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {isMobileSheetOpen &&
        createPortal(
          <div
            className="ask-ai-mobile-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={persona.title}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsMobileSheetOpen(false);
              }
            }}
          >
            <div className={`ask-ai-mobile-sheet ask-ai-theme-${theme}`}>
              <div className="ask-ai-mobile-grabber" aria-hidden="true" />

              <div className="ask-ai-mobile-header">
                <div className="ask-ai-mobile-title-row">
                  <span className="ask-ai-mobile-icon" aria-hidden="true">{persona.icon}</span>
                  <div className="ask-ai-mobile-title-copy">
                    <strong>{persona.title}</strong>
                    <span>{isLoading ? 'Đang phân tích câu hỏi…' : answer ? 'Đã hoàn tất phân tích' : persona.subtitle}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="ask-ai-mobile-close"
                  onClick={() => setIsMobileSheetOpen(false)}
                  aria-label="Đóng khung hỏi AI"
                >
                  ✕
                </button>
              </div>

              <div className="ask-ai-mobile-body" aria-busy={isLoading}>
                {error && <p className="ask-ai-error" role="alert">{error}</p>}

                {isLoading && (
                  <div className="ask-ai-loading" role="status">
                    <span className="ask-ai-spinner" aria-hidden="true" />
                    <span>AI đang đọc câu hỏi và đối chiếu các lựa chọn…</span>
                  </div>
                )}

                {answer && !isLoading && (
                  <div className="ask-ai-answer" role="status" aria-live="polite">
                    <div className="ask-ai-answer-heading">
                      <span className="ask-ai-answer-icon" aria-hidden="true">✓</span>
                      <strong>Lời giải thích từ AI</strong>
                    </div>
                    <p>{answer}</p>
                  </div>
                )}

                {!answer && !isLoading && !error && (
                  <button
                    type="button"
                    className="ask-ai-mobile-retry-btn"
                    onClick={() => void askAI('', false)}
                  >
                    <span>{persona.btnIcon}</span>
                    <span>{persona.cta}</span>
                  </button>
                )}
              </div>

              <form className="ask-ai-mobile-footer-form" onSubmit={handleSubmit}>
                <input
                  id={mobileInputId}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Hỏi thêm (VD: Vì sao đáp án B đúng?)…"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  className="ask-ai-submit"
                  disabled={isLoading || !prompt.trim()}
                >
                  Gửi
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
