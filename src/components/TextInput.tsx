import { useState } from 'react';
import { parseQuizText, type Question } from '../utils/quizParser';
import { SAMPLE_QUIZ_TEXT } from '../data/sampleQuiz';
import type { Course } from '../data/courses';

interface TextInputProps {
  targetCourse?: Course | null;
  onStartQuiz: (questions: Question[], title?: string, rawText?: string, courseId?: string) => void;
  onBack: () => void;
}

export default function TextInput({ targetCourse, onStartQuiz, onBack }: TextInputProps) {
  const [setTitle, setSetTitle] = useState(
    targetCourse ? `Đề ôn tập ${targetCourse.code}` : 'Bộ đề tự nhập'
  );
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const parsedQuestions = text.trim() ? parseQuizText(text) : [];

  const handleStart = () => {
    if (parsedQuestions.length === 0) {
      setError('Không tìm thấy câu hỏi nào. Vui lòng nhập đúng format!');
      return;
    }
    setError('');
    onStartQuiz(parsedQuestions, setTitle || 'Bộ đề tự nhập', text, targetCourse?.id);
  };

  const handleLoadSample = () => {
    setText(SAMPLE_QUIZ_TEXT);
    setSetTitle('Bộ đề CCHN (426 câu)');
    setError('');
  };

  return (
    <div className="fuo-input-container">
      <div className="fuo-input-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ margin: 0 }}>
            {targetCourse ? `Thêm Đề Mới: ${targetCourse.code}` : 'Tạo / Nhập Bộ Đề Mới'}
          </h1>
          <button type="button" className="fuo-nav-btn" onClick={onBack}>
            ← Quay lại
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
            Tên bộ đề:
          </label>
          <input
            type="text"
            className="fuo-textarea"
            style={{ height: '38px', padding: '8px 12px', fontSize: '14px' }}
            value={setTitle}
            onChange={(e) => setSetTitle(e.target.value)}
            placeholder="Nhập tên bộ đề thi..."
          />
        </div>

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
            Tải dữ liệu CCHN mẫu
          </button>
          <button
            type="button"
            className="fuo-nav-btn fuo-primary"
            onClick={handleStart}
          >
            Vào học ngay ({parsedQuestions.length} câu)
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
