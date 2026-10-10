import { useMemo } from 'react';
import type { Question } from '../../utils/quizParser';
import type { MockExamAttempt } from '../../utils/mockExamStorage';

interface MockExamHistoryPanelProps {
  attempts: MockExamAttempt[];
  questions: Question[];
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function MockExamHistoryPanel({ attempts, questions }: MockExamHistoryPanelProps) {
  const recurringReviewQuestions = useMemo(() => {
    const counts = new Map<number, { incorrect: number; skipped: number }>();
    for (const attempt of attempts) {
      for (const questionId of attempt.incorrectQuestionIds) {
        const count = counts.get(questionId) ?? { incorrect: 0, skipped: 0 };
        count.incorrect += 1;
        counts.set(questionId, count);
      }
      for (const questionId of attempt.skippedQuestionIds) {
        const count = counts.get(questionId) ?? { incorrect: 0, skipped: 0 };
        count.skipped += 1;
        counts.set(questionId, count);
      }
    }

    const questionsById = new Map(questions.map((question) => [question.id, question]));
    return [...counts.entries()]
      .flatMap(([questionId, count]) => {
        const question = questionsById.get(questionId);
        return question ? [{ question, ...count }] : [];
      })
      .sort((a, b) => (b.incorrect + b.skipped) - (a.incorrect + a.skipped) || b.incorrect - a.incorrect)
      .slice(0, 5);
  }, [attempts, questions]);

  return (
    <section className="mock-exam-history" aria-labelledby="mock-exam-history-title">
      <div className="mock-exam-history-heading">
        <div>
          <h3 id="mock-exam-history-title">Lịch sử Thi thử FE</h3>
          <p>Được lưu trên thiết bị này, tối đa 20 lượt gần nhất.</p>
        </div>
        {attempts.length > 0 && (
          <span className="mock-exam-history-count">
            {attempts.length} lượt · Cao nhất {Math.max(...attempts.map((attempt) => attempt.score)).toFixed(1)}/10
          </span>
        )}
      </div>

      {attempts.length === 0 ? (
        <p className="mock-exam-history-empty">Lịch sử và gợi ý ôn tập sẽ xuất hiện sau lượt thi đầu tiên.</p>
      ) : (
        <div className="mock-exam-history-columns">
          <div className="mock-exam-history-attempts" aria-label="Các lượt thi gần đây">
            {attempts.map((attempt, index) => (
              <article className="mock-exam-history-attempt" key={attempt.id}>
                <div className="mock-exam-history-attempt-date">
                  <time dateTime={attempt.completedAt}>
                    {new Date(attempt.completedAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                  <span>Lượt {attempts.length - index} · {attempt.correct}/{attempt.questionCount} đúng</span>
                </div>
                <strong className="mock-exam-history-score">{attempt.score.toFixed(1)}<small>/10</small></strong>
                <span className="mock-exam-history-time">
                  {formatTime(attempt.timeSpentSeconds)} / {formatTime(attempt.durationSeconds)}
                </span>
              </article>
            ))}
          </div>

          <section className="mock-exam-history-weak" aria-labelledby="mock-exam-history-weak-title">
            <h4 id="mock-exam-history-weak-title">Câu nên ôn lại</h4>
            <p className="mock-exam-history-weak-caption">Tổng hợp câu sai hoặc bỏ trống trong các lượt đã lưu.</p>
            {recurringReviewQuestions.length === 0 ? (
              <p className="mock-exam-history-empty">Chưa có câu sai hoặc bỏ trống. Làm tốt lắm!</p>
            ) : (
              <ol>
                {recurringReviewQuestions.map(({ question, incorrect, skipped }) => (
                  <li key={question.id}>
                    <span>{question.text}</span>
                    <small>Sai {incorrect} lần · bỏ trống {skipped} lần</small>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
