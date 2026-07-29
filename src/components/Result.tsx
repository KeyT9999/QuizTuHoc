import type { Question } from '../utils/quizParser';

interface ResultProps {
  questions: Question[];
  answers: Record<number, string>;
  onRetry: () => void;
  onNewQuiz: () => void;
}

export default function Result({ questions, answers, onRetry, onNewQuiz }: ResultProps) {
  const totalQuestions = questions.length;
  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctAnswer
  ).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="fuo-quiz-wrapper">
      <div className="fuo-header-banner">
        <span className="fuo-header-title">KẾT QUẢ BÀI THI</span>
        <div className="fuo-header-controls">
          <button type="button" className="fuo-btn-text" onClick={onNewQuiz}>
            Nhập đề thi mới
          </button>
        </div>
      </div>

      <div className="fuo-content-area">
        <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', border: '1px solid #dadce0', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '18px', color: '#1a73e8', marginBottom: '8px' }}>
            Kết quả: {correctCount}/{totalQuestions} ({percentage}%)
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="fuo-nav-btn fuo-primary" onClick={onRetry}>
              Làm lại bài này
            </button>
            <button type="button" className="fuo-nav-btn" onClick={onNewQuiz}>
              Đổi đề mới
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: '14px', marginBottom: '16px', color: '#5f6368' }}>Chi tiết từng câu hỏi:</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            const correctOptions = q.options.filter((o) => q.correctAnswer.includes(o.key));

            return (
              <div
                key={q.id}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #dadce0',
                  borderLeft: `4px solid ${isCorrect ? '#137333' : '#c5221f'}`,
                  borderRadius: '4px',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#5f6368', marginBottom: '4px' }}>
                  Câu {idx + 1}: {isCorrect ? '✓ Đúng' : '✗ Sai'}
                </div>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>{q.text}</div>
                <div style={{ fontSize: '13px', color: isCorrect ? '#137333' : '#c5221f' }}>
                  Bạn chọn: {userAnswer || 'Chưa chọn'}
                </div>
                {!isCorrect && (
                  <div style={{ fontSize: '13px', color: '#137333', marginTop: '2px' }}>
                    Đáp án đúng: {correctOptions
                      .map((option) => `${option.key}. ${option.text}`)
                      .join(' | ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fuo-watermark">
        <div className="fuo-logo-main">KEYT</div>
        <div className="fuo-logo-sub">KEYT.COM</div>
      </div>
    </div>
  );
}
