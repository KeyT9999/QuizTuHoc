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

  const getGrade = () => {
    if (percentage >= 90) return { label: 'Xuất sắc!', emoji: '🏆', color: 'var(--color-success)' };
    if (percentage >= 70) return { label: 'Tốt lắm!', emoji: '🎉', color: 'var(--color-primary)' };
    if (percentage >= 50) return { label: 'Khá ổn!', emoji: '💪', color: 'var(--color-warning)' };
    return { label: 'Cần cố gắng thêm!', emoji: '📚', color: 'var(--color-error)' };
  };

  const grade = getGrade();

  return (
    <div className="result-container">
      {/* Score card */}
      <div className="result-score-card">
        <div className="score-emoji">{grade.emoji}</div>
        <h1 className="score-label" style={{ color: grade.color }}>
          {grade.label}
        </h1>

        <div className="score-circle">
          <svg viewBox="0 0 120 120" className="score-ring">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--glass-border)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={grade.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 327} 327`}
              transform="rotate(-90 60 60)"
              className="score-ring-fill"
            />
          </svg>
          <div className="score-number">
            <span className="score-value">{percentage}</span>
            <span className="score-percent">%</span>
          </div>
        </div>

        <p className="score-detail">
          {correctCount} / {totalQuestions} câu đúng
        </p>

        <div className="result-actions">
          <button type="button" className="btn btn-secondary" onClick={onRetry}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23,4 23,10 17,10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Làm lại
          </button>
          <button type="button" className="btn btn-primary" onClick={onNewQuiz}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nhập đề mới
          </button>
        </div>
      </div>

      {/* Review list */}
      <div className="result-review">
        <h2>Chi tiết kết quả</h2>
        <div className="review-list">
          {questions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            const userOption = q.options.find((o) => o.key === userAnswer);
            const correctOption = q.options.find(
              (o) => o.key === q.correctAnswer
            );

            return (
              <div
                key={q.id}
                className={`review-item ${isCorrect ? 'review-correct' : 'review-incorrect'}`}
              >
                <div className="review-header">
                  <span className="review-number">Câu {idx + 1}</span>
                  <span className={`review-badge ${isCorrect ? 'badge-correct' : 'badge-incorrect'}`}>
                    {isCorrect ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                    {isCorrect ? 'Đúng' : 'Sai'}
                  </span>
                </div>
                <p className="review-question">{q.text}</p>
                {!isCorrect && userOption && (
                  <div className="review-answer wrong">
                    <span className="answer-label">Bạn chọn:</span>
                    <span>{userAnswer}. {userOption.text}</span>
                  </div>
                )}
                <div className="review-answer right">
                  <span className="answer-label">Đáp án đúng:</span>
                  <span>
                    {q.correctAnswer}. {correctOption?.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
