import { useEffect, useId, useRef, useState } from 'react';
import type { Question } from '../utils/quizParser';

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
    <section className="ask-ai" aria-labelledby={`${panelId}-title`}>
      <button
        type="button"
        className={`ask-ai-toggle ${isOpen ? 'is-open' : ''}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
      >
        <span aria-hidden="true">🤖</span>
        <span>Hỏi AI</span>
      </button>

      {isOpen && (
        <div id={panelId} className="ask-ai-panel">
          <div className="ask-ai-panel-header">
            <div>
              <strong id={`${panelId}-title`}>Hỏi AI về câu này</strong>
              <span>AI sẽ tự chọn đáp án đúng và giải thích bằng tiếng Việt.</span>
            </div>
            {answer && (
              <button
                type="button"
                className="ask-ai-clear"
                onClick={() => {
                  setAnswer('');
                  setPrompt('');
                }}
              >
                Xóa
              </button>
            )}
          </div>

          <form className="ask-ai-form" onSubmit={handleSubmit}>
            <label htmlFor={inputId}>
              Yêu cầu bổ sung cho AI <span>(không bắt buộc)</span>
            </label>
            <textarea
              id={inputId}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ví dụ: Giải thích kỹ hơn vì sao đáp án B đúng"
              maxLength={1000}
              rows={2}
            />
            <div className="ask-ai-form-footer">
              <span>{prompt.length}/1000</span>
              <button type="submit" className="ask-ai-submit" disabled={isLoading}>
                {isLoading ? 'Đang hỏi AI…' : 'Hỏi lại AI'}
              </button>
            </div>
          </form>

          {error && <p className="ask-ai-error" role="alert">{error}</p>}
          {isLoading && <p className="ask-ai-loading" role="status">AI đang phân tích câu hỏi…</p>}
          {answer && (
            <div className="ask-ai-answer" role="status" aria-live="polite">
              <strong>🤖 Giải thích từ AI</strong>
              <p>{answer}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
