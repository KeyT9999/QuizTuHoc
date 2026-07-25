import { useState } from 'react';
import { parseQuizText, type Question } from '../utils/quizParser';
import { SAMPLE_QUIZ_TEXT } from '../data/sampleQuiz';

interface TextInputProps {
  onStartQuiz: (questions: Question[]) => void;
}

export default function TextInput({ onStartQuiz }: TextInputProps) {
  const [text, setText] = useState(SAMPLE_QUIZ_TEXT);
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
    setText(SAMPLE_QUIZ_TEXT);
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
