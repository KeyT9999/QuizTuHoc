import { useEffect, useId, useRef, useState } from 'react';
import type { Question } from '../utils/quizParser';
import { useTheme, type AppTheme } from '../context/ThemeContext';

const AI_PERSONAS: Record<
  AppTheme,
  { icon: string; btnIcon: string; title: string; subtitle: string; cta: string }
> = {
  'lotus-zen-sanctuary': {
    icon: '🪷',
    btnIcon: '✨',
    title: 'Kinh Đài Luận Giải AI',
    subtitle: 'Thấu triệt câu hỏi · Chỉ điểm đáp án & luận giải',
    cta: 'Thỉnh AI giảng',
  },
  'hon-viet': {
    icon: '📜',
    btnIcon: '🏮',
    title: 'Trạng Nguyên AI Luận Giải',
    subtitle: 'Phân tích đề bài · Đối chiếu đáp án chính xác',
    cta: 'Hỏi Trạng Nguyên',
  },
  'fantasy-academy': {
    icon: '🔮',
    btnIcon: '⚡',
    title: 'Hiền Giả Cổ Thuật AI',
    subtitle: 'Giải mã cổ ngữ · Chỉ dẫn đáp án & ma pháp',
    cta: 'Triệu hồi AI',
  },
  'cozy-night': {
    icon: '🎧',
    btnIcon: '🌙',
    title: 'Lofi Study Buddy AI',
    subtitle: 'Phân tích nhanh · Giải thích đáp án dễ hiểu',
    cta: 'Hỏi AI ngay',
  },
  default: {
    icon: '✦',
    btnIcon: '🤖',
    title: 'Trợ lý AI Thông Minh',
    subtitle: 'Đọc câu hỏi · Chọn đáp án · Giải thích chi tiết',
    cta: 'Hỏi AI',
  },
};

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
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const panelId = useId();
  const inputId = `${panelId}-input`;
  const requestVersion = useRef(0);

  useEffect(() => {
    requestVersion.current += 1;
    setIsOpen(false);
    setPrompt('');
    setAnswer('');
    setError('');
    setIsLoading(false);
  }, [question.id]);

  const askAI = async (customPrompt: string) => {
    if (isLoading) return;

    const currentRequestVersion = ++requestVersion.current;
    setIsOpen(true);
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
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void askAI(prompt.trim());
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setError('');
    if (!answer && !isLoading) {
      void askAI('');
    }
  };

  return (
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
  );
}
