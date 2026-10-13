import { useMemo, useState } from 'react';
import type { Question } from '../../utils/quizParser';
import type { MockExamAttempt } from '../../utils/mockExamStorage';
import { useTheme } from '../../context/ThemeContext';
import './MockExamHistoryPanel.css';

interface MockExamHistoryPanelProps {
  attempts: MockExamAttempt[];
  questions: Question[];
  onStartWeakExam?: (weakQuestions: Question[]) => void;
  onClearHistory?: () => void;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function MockExamHistoryPanel({
  attempts,
  questions,
  onStartWeakExam,
  onClearHistory,
}: MockExamHistoryPanelProps) {
  const { theme } = useTheme();
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<number>>(new Set());

  // Aggregate recurring weak questions
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
      .slice(0, 6);
  }, [attempts, questions]);

  // Overall statistics
  const stats = useMemo(() => {
    if (attempts.length === 0) return null;
    const scores = attempts.map((a) => a.score);
    const maxScore = Math.max(...scores);
    const avgScore = Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1));
    const passCount = attempts.filter((a) => a.score >= 5.0).length;
    const passRate = Math.round((passCount / attempts.length) * 100);
    return { maxScore, avgScore, passRate };
  }, [attempts]);

  const toggleQuestionExpand = (id: number) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getScoreClass = (score: number) => {
    if (score >= 8.5) return 'high';
    if (score >= 6.5) return 'good';
    if (score >= 5.0) return 'pass';
    return 'low';
  };

  const getGradeBadge = (score: number) => {
    if (theme === 'lotus-zen-sanctuary') {
      if (score >= 9.0) return '🪷 Đại Giác Ngộ';
      if (score >= 7.0) return '✨ Đỗ Khoa Bảng';
      if (score >= 5.0) return '✓ Đạt Khảo Thí';
      return '📖 Cần Tu Tập';
    }
    if (score >= 9.0) return '🏆 Xuất Sắc';
    if (score >= 7.0) return '⭐ Khá Giỏi';
    if (score >= 5.0) return '✓ Đạt Chuẩn';
    return '⚠️ Cần Cố Gắng';
  };

  const isZen = theme === 'lotus-zen-sanctuary';

  return (
    <section
      className={`mock-exam-history theme-${theme}`}
      data-theme={theme}
      aria-labelledby="mock-exam-history-title"
    >
      {/* Decorative Ornamental Divider */}
      <div className="mock-exam-history-divider" aria-hidden="true">
        <span className="mock-exam-history-divider-line" />
        <span className="mock-exam-history-divider-badge">
          {isZen ? '🪷 Khảo Tích Bảng Vàng' : '📜 Lịch Sử & Phân Tích'}
        </span>
        <span className="mock-exam-history-divider-line" />
      </div>

      {/* Header Area */}
      <div className="mock-exam-history-header">
        <div className="mock-exam-history-header-top">
          <div className="mock-exam-history-title-group">
            <h3 id="mock-exam-history-title" className="mock-exam-history-title">
              {isZen ? (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m12 6 2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1Z" />
                  </svg>
                  Nhật Ký Khảo Thí & Tu Tập
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  Lịch Sử Thi Thử FE
                </>
              )}
            </h3>
            <p className="mock-exam-history-subtitle">
              Lưu trữ tối đa 20 lượt thi gần nhất trên thiết bị này · Tự động phát hiện các câu sai để củng cố
            </p>
          </div>

          {/* Quick Metrics Strip */}
          {stats && (
            <div className="mock-exam-history-metrics">
              <span className="mock-exam-metric-chip highlight" title="Điểm số cao nhất">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
                Cao nhất: {stats.maxScore.toFixed(1)}/10
              </span>

              <span className="mock-exam-metric-chip" title="Điểm trung bình các lượt thi">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Trung bình: {stats.avgScore}/10
              </span>

              <span className="mock-exam-metric-chip" title="Tổng số lượt làm bài">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {attempts.length} lượt thi
              </span>

              {onClearHistory && (
                <button
                  type="button"
                  className="mock-exam-btn-clear"
                  onClick={onClearHistory}
                  title="Xóa toàn bộ lịch sử thi thử đã lưu trên thiết bị"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Xóa lịch sử
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {attempts.length === 0 ? (
        <div className="mock-exam-history-empty-card">
          <div className="mock-exam-empty-icon-wrap" style={{ background: isZen ? 'rgba(167, 118, 54, 0.15)' : 'rgba(79, 70, 229, 0.1)' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={isZen ? '#A77636' : '#4F46E5'} strokeWidth="1.8">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h4 className="mock-exam-empty-title">
            {isZen ? 'Chưa có nhật ký khảo thí nào' : 'Chưa có lịch sử làm bài'}
          </h4>
          <p className="mock-exam-empty-desc">
            {isZen
              ? 'Hãy bắt đầu một lượt khảo thí bên trên để ghi danh vào bảng vàng và nhận phân tích các điểm trọng tâm cần tu tập.'
              : 'Lịch sử điểm số và danh sách các câu sai cần củng cố sẽ tự động xuất hiện ngay sau lượt thi đầu tiên.'}
          </p>
        </div>
      ) : (
        <div className="mock-exam-history-grid">
          {/* Column 1: Exam Attempts Log */}
          <div className="mock-exam-col-card" aria-label="Các lượt thi gần đây">
            <div className="mock-exam-col-header">
              <div className="mock-exam-col-title-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <h4 className="mock-exam-col-title">
                  {isZen ? 'Nhật Ký Các Lượt Thi' : 'Các Lượt Thi Gần Đây'}
                </h4>
              </div>
              <span className="mock-exam-col-badge">{attempts.length} lượt đã lưu</span>
            </div>

            <div className="mock-exam-history-list">
              {attempts.map((attempt, index) => {
                const scoreClass = getScoreClass(attempt.score);
                const gradeLabel = getGradeBadge(attempt.score);
                const attemptNumber = attempts.length - index;
                const percentCorrect = attempt.questionCount > 0
                  ? Math.round((attempt.correct / attempt.questionCount) * 100)
                  : 0;

                return (
                  <article className="mock-exam-attempt-item" key={attempt.id}>
                    <div className="mock-exam-attempt-meta">
                      <div className="mock-exam-attempt-tags">
                        <span className="mock-exam-attempt-num">Lượt {attemptNumber}</span>
                        <span className={`mock-exam-attempt-grade ${scoreClass}`}>{gradeLabel}</span>
                      </div>

                      <div className="mock-exam-attempt-stats">
                        <time className="mock-exam-attempt-date" dateTime={attempt.completedAt}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {new Date(attempt.completedAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>

                        <span className="mock-exam-attempt-acc">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {attempt.correct}/{attempt.questionCount} đúng ({percentCorrect}%)
                        </span>
                      </div>
                    </div>

                    <div className="mock-exam-attempt-score-block">
                      <div className={`mock-exam-attempt-score ${scoreClass}`}>
                        {attempt.score.toFixed(1)}
                        <small>/10</small>
                      </div>
                      <span className="mock-exam-attempt-time">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {formatTime(attempt.timeSpentSeconds)} / {formatTime(attempt.durationSeconds)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Column 2: Weak Area Questions to Review */}
          <section className="mock-exam-col-card" aria-labelledby="mock-exam-history-weak-title">
            <div className="mock-exam-col-header">
              <div className="mock-exam-col-title-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                <h4 id="mock-exam-history-weak-title" className="mock-exam-col-title">
                  {isZen ? 'Điểm Khảo Nghiệm Cần Ôn Lại' : 'Câu Trọng Tâm Nên Ôn Lại'}
                </h4>
              </div>

              {recurringReviewQuestions.length > 0 && onStartWeakExam && (
                <button
                  type="button"
                  className="mock-exam-btn-fast-practice"
                  onClick={() => onStartWeakExam(recurringReviewQuestions.map((item) => item.question))}
                  title="Tạo phòng thi thử chỉ gồm các câu bạn thường làm sai này"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Luyện riêng {recurringReviewQuestions.length} câu này
                </button>
              )}
            </div>

            {recurringReviewQuestions.length === 0 ? (
              <div className="mock-exam-history-empty-card" style={{ padding: '24px 16px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h4 className="mock-exam-empty-title" style={{ color: '#16A34A', fontSize: '15px' }}>
                  {isZen ? 'Tâm Ý Vững Vàng · Không Có Câu Sai!' : 'Rất Tốt! Không Có Câu Sai Nào'}
                </h4>
                <p className="mock-exam-empty-desc">
                  Tất cả các câu trong các lượt đã lưu đều được làm chính xác. Hãy tiếp tục duy trì phong độ!
                </p>
              </div>
            ) : (
              <div className="mock-exam-history-list">
                {recurringReviewQuestions.map(({ question, incorrect, skipped }) => {
                  const isExpanded = expandedQuestionIds.has(question.id);
                  const correctAnswerKey = question.correctAnswer?.trim().toUpperCase() ?? '';

                  return (
                    <article className="mock-exam-weak-item" key={question.id}>
                      <div className="mock-exam-weak-header">
                        <span className="mock-exam-weak-id">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          Câu hỏi #{question.id}
                        </span>

                        <div className="mock-exam-weak-chips">
                          {incorrect > 0 && (
                            <span className="mock-exam-chip-danger">
                              Sai {incorrect} lần
                            </span>
                          )}
                          {skipped > 0 && (
                            <span className="mock-exam-chip-skip">
                              Bỏ trống {skipped} lần
                            </span>
                          )}
                        </div>
                      </div>

                      <p className={`mock-exam-weak-text ${isExpanded ? 'is-expanded' : ''}`}>
                        {question.text}
                      </p>

                      <div className="mock-exam-weak-actions">
                        <button
                          type="button"
                          className="mock-exam-btn-reveal"
                          onClick={() => toggleQuestionExpand(question.id)}
                          aria-expanded={isExpanded}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isExpanded ? (
                              <>
                                <path d="m18 15-6-6-6 6" />
                              </>
                            ) : (
                              <>
                                <path d="m6 9 6 6 6-6" />
                              </>
                            )}
                          </svg>
                          {isExpanded ? 'Thu gọn đáp án' : 'Xem đáp án đúng'}
                        </button>
                      </div>

                      {/* Expandable answer viewer */}
                      {isExpanded && (
                        <div className="mock-exam-reveal-box">
                          <div>
                            <strong>Đáp án đúng: </strong>
                            <span style={{ color: isZen ? '#A77636' : '#16A34A', fontWeight: 800 }}>
                              {correctAnswerKey || '(Không có)'}
                            </span>
                          </div>

                          {question.options && question.options.length > 0 && (
                            <div className="mock-exam-reveal-opts">
                              {question.options.map((opt) => {
                                const isCorrect = opt.key.trim().toUpperCase() === correctAnswerKey;
                                return (
                                  <div
                                    key={opt.key}
                                    className={`mock-exam-reveal-opt ${isCorrect ? 'is-correct-opt' : ''}`}
                                  >
                                    <span style={{ fontWeight: 800 }}>{opt.key}.</span>
                                    <span>{opt.text}</span>
                                    {isCorrect && (
                                      <span style={{ marginLeft: 'auto', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Chính xác
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
