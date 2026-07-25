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
      setError('Không tìm thấy câu hỏi nào. Vui lòng nhập đúng format!');
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
    <div className="fuo-input-container">
      <div className="fuo-input-card">
        <h1>KeyT Quiz Maker</h1>
        <p>Dán đoạn văn bản câu hỏi trắc nghiệm vào ô bên dưới để tạo bài làm:</p>

        <textarea
          className="fuo-textarea"
          rows={12}
          placeholder={`Nội dung câu hỏi | A. Đáp án 1 | B. Đáp án 2 | C. Đáp án 3 | D. Đáp án 4\nĐáp_án_đúng`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError('');
          }}
        />

        {error && <div style={{ color: '#c5221f', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

        <div className="fuo-btn-group">
          <button type="button" className="fuo-nav-btn" onClick={handleLoadSample}>
            Tải dữ liệu mẫu
          </button>
          <button
            type="button"
            className="fuo-nav-btn fuo-primary"
            onClick={handleStart}
          >
            Tạo bài làm ({parsedQuestions.length} câu)
          </button>
        </div>
      </div>

      <div className="fuo-watermark">
        <div className="fuo-logo-main">KEYT</div>
        <div className="fuo-logo-sub">KEYT.COM</div>
      </div>
    </div>
  );
}
