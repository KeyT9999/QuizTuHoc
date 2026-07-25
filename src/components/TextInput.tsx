import { useState } from 'react';
import { parseQuizText, type Question } from '../utils/quizParser';

interface TextInputProps {
  onStartQuiz: (questions: Question[]) => void;
}

const SAMPLE_TEXT = `"The differential effect that brand knowledge has on customer response to the marketing of that brand" is the definition of? | A. Customer-Based Brand Equity | B. Consumer-Based Brand Element | C. Consumer-Based Brand Equity | D. Customer-Based Brand Element
A


____ are the personal value and meaning that consumers attach to the product or service attributes.(NHUNG HOÀNG) | A. Brand attributes | B. Brand benefits | C. Brand images | D. Brand mantras
B


What factors that marketers need to consider to create the differential response that leads to customer-based brand equity? | A. The strength, weakness, and uniqueness of brand associations. | B. The strength, favorability, and uniqueness of brand associations. | C. The strength and weakness of brand associations. | D. The strength and uniqueness of brand associations.
B`;

export default function TextInput({ onStartQuiz }: TextInputProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const parsedQuestions = text.trim() ? parseQuizText(text) : [];

  const handleStart = () => {
    if (parsedQuestions.length === 0) {
      setError('Không tìm thấy câu hỏi nào. Hãy kiểm tra lại format text.');
      return;
    }
    setError('');
    onStartQuiz(parsedQuestions);
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    setError('');
  };

  return (
    <div className="text-input-container">
      <div className="text-input-card">
        <div className="card-header">
          <div className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
          </div>
          <div>
            <h1>Quiz Tự Học</h1>
            <p className="subtitle">Paste đề thi trắc nghiệm để bắt đầu làm bài</p>
          </div>
        </div>

        <div className="format-hint">
          <span className="hint-label">Format:</span>
          <code>Câu hỏi? | A. Đáp án | B. Đáp án | C. Đáp án | D. Đáp án</code>
          <br />
          <code>Đáp_án_đúng (A/B/C/D)</code>
        </div>

        <textarea
          id="quiz-text-input"
          className="text-area"
          placeholder="Paste nội dung đề thi vào đây..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError('');
          }}
          rows={12}
        />

        {error && <div className="error-message">{error}</div>}

        <div className="input-footer">
          <div className="question-count">
            {parsedQuestions.length > 0 && (
              <span className="count-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                {parsedQuestions.length} câu hỏi
              </span>
            )}
          </div>
          <div className="button-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleLoadSample}
            >
              Tải đề mẫu
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStart}
              disabled={parsedQuestions.length === 0}
            >
              Bắt đầu làm bài
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
