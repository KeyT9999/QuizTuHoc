import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Question } from '../../utils/quizParser';
import { saveMistakeQuestion } from '../../utils/gameStorage';
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playVictoryFanfare,
} from '../../utils/soundEffects';

interface MockExamViewProps {
  setId: string;
  setTitle?: string;
  allQuestions: Question[];
  onBackToStudy: () => void;
  onOpenMistakes: () => void;
  onMistakesUpdated: () => void;
}

type ExamPhase = 'setup' | 'testing' | 'result';
type ReviewFilter = 'all' | 'incorrect' | 'correct' | 'skipped';

export default function MockExamView({
  setId,
  setTitle,
  allQuestions,
  onBackToStudy,
  onOpenMistakes,
  onMistakesUpdated,
}: MockExamViewProps) {
  // Phase
  const [phase, setPhase] = useState<ExamPhase>('setup');

  // Setup inputs
  const maxAvailable = allQuestions.length;
  const defaultCount = Math.min(50, maxAvailable > 0 ? maxAvailable : 50);
  const [questionCountInput, setQuestionCountInput] = useState<number>(defaultCount);
  const [durationMinutesInput, setDurationMinutesInput] = useState<number>(50);

  // Active Exam state
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');

  const timerRef = useRef<number | null>(null);

  // Helper to format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start exam with randomized questions
  const startExam = useCallback(
    (count?: number, minutes?: number, specificQuestions?: Question[]) => {
      const qCount = count ?? questionCountInput;
      const mMinutes = minutes ?? durationMinutesInput;

      let selectedQuestions: Question[] = [];
      if (specificQuestions && specificQuestions.length > 0) {
        selectedQuestions = specificQuestions;
      } else {
        const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
        selectedQuestions = shuffled.slice(0, Math.min(qCount, allQuestions.length));
      }

      setExamQuestions(selectedQuestions);
      setCurrentIndex(0);
      setUserAnswers({});
      setFlaggedIds([]);
      const timeInSec = Math.max(1, mMinutes) * 60;
      setTimeLeft(timeInSec);
      setTotalTimeSeconds(timeInSec);
      setAutoSubmitted(false);
      setReviewFilter('all');
      setPhase('testing');
      playClickSound();
    },
    [allQuestions, questionCountInput, durationMinutesInput]
  );

  // Timer countdown
  useEffect(() => {
    if (phase !== 'testing') return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Handle Answer Selection
  const handleSelectOption = useCallback(
    (optKey: string) => {
      const currentQ = examQuestions[currentIndex];
      if (!currentQ) return;

      const isMultipleChoice = currentQ.correctAnswer.length > 1 && currentQ.correctAnswer !== '?';

      if (isMultipleChoice) {
        const prev = userAnswers[currentQ.id] || '';
        const next = prev.includes(optKey)
          ? prev.replace(optKey, '')
          : `${prev}${optKey}`;
        const sorted = next.split('').sort().join('');
        setUserAnswers((prevMap) => ({ ...prevMap, [currentQ.id]: sorted }));
      } else {
        setUserAnswers((prevMap) => ({ ...prevMap, [currentQ.id]: optKey }));
      }
      playClickSound();
    },
    [examQuestions, currentIndex, userAnswers]
  );

  // Toggle Flag
  const handleToggleFlag = (qId: number) => {
    setFlaggedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
    playClickSound();
  };

  // Submit Exam
  const submitExam = useCallback(
    (isAuto = false) => {
      if (timerRef.current) clearInterval(timerRef.current);

      if (!isAuto) {
        const answeredCount = Object.keys(userAnswers).filter(
          (k) => userAnswers[Number(k)] && userAnswers[Number(k)].length > 0
        ).length;
        const unanswered = examQuestions.length - answeredCount;

        if (unanswered > 0) {
          const confirmSubmit = window.confirm(
            `Bạn còn ${unanswered} câu chưa làm!\nBạn có chắc chắn muốn nộp bài ngay bây giờ không?`
          );
          if (!confirmSubmit) return;
        } else {
          const confirmSubmit = window.confirm('Bạn có chắc chắn muốn nộp bài để xem điểm?');
          if (!confirmSubmit) return;
        }
      } else {
        setAutoSubmitted(true);
      }

      // Record mistakes to mistake bank
      let correct = 0;
      examQuestions.forEach((q) => {
        const userAns = userAnswers[q.id];
        const isCorrect = userAns && userAns.toUpperCase() === q.correctAnswer.trim().toUpperCase();
        if (isCorrect) {
          correct += 1;
        } else {
          // Save to mistake bank
          saveMistakeQuestion(setId, q.id);
        }
      });

      onMistakesUpdated();

      // Sound effect
      const finalScore = examQuestions.length > 0 ? (correct / examQuestions.length) * 10 : 0;
      if (finalScore >= 8.0) {
        playVictoryFanfare();
      } else if (finalScore >= 5.0) {
        playCorrectSound();
      } else {
        playWrongSound();
      }

      setPhase('result');
    },
    [userAnswers, examQuestions, setId, onMistakesUpdated]
  );

  // Auto-submit when time reaches 0
  useEffect(() => {
    if (phase === 'testing' && timeLeft === 0) {
      submitExam(true);
    }
  }, [phase, timeLeft, submitExam]);

  // Keyboard navigation during exam
  useEffect(() => {
    if (phase !== 'testing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toLowerCase();

      // Options: A, B, C, D or 1, 2, 3, 4
      const keyMap: Record<string, string> = {
        a: 'A',
        b: 'B',
        c: 'C',
        d: 'D',
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
      };

      if (keyMap[key]) {
        e.preventDefault();
        const currentQ = examQuestions[currentIndex];
        if (currentQ?.options.some((o) => o.key === keyMap[key])) {
          handleSelectOption(keyMap[key]);
        }
        return;
      }

      // Next / Previous
      if (key === 'arrowright' || key === 'enter') {
        e.preventDefault();
        if (currentIndex < examQuestions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
        return;
      }

      if (key === 'arrowleft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
        return;
      }

      // Flag
      if (key === 'f') {
        e.preventDefault();
        const currentQ = examQuestions[currentIndex];
        if (currentQ) handleToggleFlag(currentQ.id);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentIndex, examQuestions, handleSelectOption]);

  // Result statistics
  const stats = useMemo(() => {
    if (phase !== 'result') {
      return { correct: 0, incorrect: 0, skipped: 0, score: 0, percent: 0, timeSpent: 0 };
    }

    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    examQuestions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (!ans || ans.trim() === '') {
        skipped += 1;
      } else if (ans.toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    });

    const total = examQuestions.length;
    const score = total > 0 ? Number(((correct / total) * 10).toFixed(1)) : 0;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    const timeSpent = Math.max(0, totalTimeSeconds - timeLeft);

    return { correct, incorrect, skipped, score, percent, timeSpent };
  }, [phase, examQuestions, userAnswers, totalTimeSeconds, timeLeft]);

  // Questions for review list
  const reviewQuestions = useMemo(() => {
    if (phase !== 'result') return [];

    return examQuestions.map((q, idx) => {
      const ans = userAnswers[q.id] || '';
      const isSkipped = ans === '';
      const isCorrect = !isSkipped && ans.toUpperCase() === q.correctAnswer.trim().toUpperCase();
      return { q, idx, ans, isCorrect, isSkipped };
    });
  }, [phase, examQuestions, userAnswers]);

  const filteredReviewQuestions = useMemo(() => {
    if (reviewFilter === 'all') return reviewQuestions;
    if (reviewFilter === 'incorrect') return reviewQuestions.filter((item) => !item.isCorrect && !item.isSkipped);
    if (reviewFilter === 'correct') return reviewQuestions.filter((item) => item.isCorrect);
    if (reviewFilter === 'skipped') return reviewQuestions.filter((item) => item.isSkipped);
    return reviewQuestions;
  }, [reviewQuestions, reviewFilter]);

  // ----------------------------------------------------
  // RENDER PHASE 1: SETUP
  // ----------------------------------------------------
  if (phase === 'setup') {
    return (
      <div className="mock-exam-container">
        <div className="mock-exam-setup-card">
          <div className="mock-exam-badge-tag">MÔ PHỎNG PHÒNG THI THẬT</div>
          <h2 className="mock-exam-title">🎓 THI THỬ FE</h2>
          <p className="mock-exam-desc">
            Làm bài trắc nghiệm với thời gian đếm ngược thực tế. Hệ thống sẽ bốc ngẫu nhiên các câu hỏi từ ngân hàng đề, chấm điểm theo thang điểm 10 và chỉ ra câu sai chi tiết sau khi nộp bài.
          </p>

          <div className="mock-exam-config-grid">
            {/* Input 1: Question Count */}
            <div className="mock-exam-input-group">
              <label htmlFor="exam-question-count">
                <span>📝 Số lượng câu hỏi:</span>
                <strong>(Tối đa: {maxAvailable} câu)</strong>
              </label>
              <div className="mock-exam-input-wrapper">
                <input
                  id="exam-question-count"
                  type="number"
                  min={1}
                  max={maxAvailable}
                  value={questionCountInput}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setQuestionCountInput(Math.min(maxAvailable, Math.max(1, val)));
                    } else {
                      setQuestionCountInput(1);
                    }
                  }}
                  className="mock-exam-number-input"
                />
                <span className="input-suffix">câu</span>
              </div>
              <div className="mock-exam-quick-chips">
                {[20, 30, 40, 50, 60].filter((n) => n <= maxAvailable).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`mock-exam-chip ${questionCountInput === n ? 'active' : ''}`}
                    onClick={() => setQuestionCountInput(n)}
                  >
                    {n} câu
                  </button>
                ))}
                <button
                  type="button"
                  className={`mock-exam-chip ${questionCountInput === maxAvailable ? 'active' : ''}`}
                  onClick={() => setQuestionCountInput(maxAvailable)}
                >
                  Tất cả ({maxAvailable})
                </button>
              </div>
            </div>

            {/* Input 2: Duration */}
            <div className="mock-exam-input-group">
              <label htmlFor="exam-duration">
                <span>⏱️ Thời gian làm bài:</span>
                <strong>(Đếm ngược)</strong>
              </label>
              <div className="mock-exam-input-wrapper">
                <input
                  id="exam-duration"
                  type="number"
                  min={1}
                  max={180}
                  value={durationMinutesInput}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setDurationMinutesInput(Math.min(180, Math.max(1, val)));
                    } else {
                      setDurationMinutesInput(1);
                    }
                  }}
                  className="mock-exam-number-input"
                />
                <span className="input-suffix">phút</span>
              </div>
              <div className="mock-exam-quick-chips">
                {[15, 30, 45, 50, 60, 90].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`mock-exam-chip ${durationMinutesInput === m ? 'active' : ''}`}
                    onClick={() => setDurationMinutesInput(m)}
                  >
                    {m} phút
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mock-exam-summary-box">
            <div className="summary-item">
              <span className="summary-icon">📚</span>
              <span>Đề thi: <strong>{setTitle || 'Bộ câu hỏi'}</strong></span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">🎯</span>
              <span>Quy mô: <strong>{questionCountInput} câu ngẫu nhiên</strong> / {durationMinutesInput} phút</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⚖️</span>
              <span>Quy chế: Tự động nộp khi hết giờ · Đáp án ẩn trong lúc làm</span>
            </div>
          </div>

          <div className="mock-exam-setup-actions">
            <button
              type="button"
              className="mock-exam-btn secondary"
              onClick={onBackToStudy}
            >
              ← Quay lại ôn tập
            </button>
            <button
              type="button"
              className="mock-exam-btn primary"
              onClick={() => startExam()}
            >
              🚀 Bắt đầu làm bài
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER PHASE 2: TESTING (PHÒNG THI)
  // ----------------------------------------------------
  if (phase === 'testing') {
    const currentQ = examQuestions[currentIndex];
    const answeredCount = Object.keys(userAnswers).filter(
      (k) => userAnswers[Number(k)] && userAnswers[Number(k)].length > 0
    ).length;
    const isCurrentFlagged = currentQ ? flaggedIds.includes(currentQ.id) : false;
    const currentAnswer = currentQ ? userAnswers[currentQ.id] : undefined;
    const isTimeUrgent = timeLeft <= 60;
    const isTimeWarning = timeLeft <= 300 && !isTimeUrgent;

    return (
      <div className="mock-exam-container testing-mode">
        {/* Top Header Bar */}
        <div className="mock-exam-header-bar">
          <div className="header-left">
            <span className="header-exam-badge">THI THỬ FE</span>
            <span className="header-set-title">{setTitle || 'FINAL EXAM'}</span>
            <span className="header-progress-text">
              Đã làm: <strong>{answeredCount}</strong> / {examQuestions.length} câu
            </span>
          </div>

          {/* Countdown Clock */}
          <div
            className={`mock-exam-timer ${
              isTimeUrgent ? 'urgent' : isTimeWarning ? 'warning' : ''
            }`}
          >
            <span className="timer-icon">{isTimeUrgent ? '🔥' : '⏱️'}</span>
            <span className="timer-digits">{formatTime(timeLeft)}</span>
            {isTimeUrgent && <span className="timer-tag">Sắp hết giờ!</span>}
          </div>

          <div className="header-right">
            <button
              type="button"
              className="mock-exam-btn submit-btn"
              onClick={() => submitExam(false)}
            >
              📤 Nộp bài thi
            </button>
          </div>
        </div>

        {/* Exam Workspace: Question Area + Palette */}
        <div className="mock-exam-workspace">
          {/* Main Question Card */}
          <div className="mock-exam-card">
            <div className="exam-card-header">
              <div className="exam-q-info">
                <span className="exam-q-num">Câu {currentIndex + 1}</span>
                <span className="exam-q-total"> / {examQuestions.length}</span>
              </div>

              <button
                type="button"
                className={`exam-flag-btn ${isCurrentFlagged ? 'active' : ''}`}
                onClick={() => currentQ && handleToggleFlag(currentQ.id)}
                title="Đánh dấu câu hỏi cần xem lại (Phím tắt: F)"
              >
                {isCurrentFlagged ? '🚩 Đã cắm cờ' : '🏳️ Cắm cờ xem lại'}
              </button>
            </div>

            {/* Question Text */}
            <div className="exam-q-text">{currentQ?.text}</div>

            {/* Options */}
            <div className="exam-options">
              {currentQ?.options.map((opt) => {
                const isSelected = currentAnswer?.includes(opt.key) ?? false;
                return (
                  <div
                    key={opt.key}
                    className={`exam-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(opt.key)}
                  >
                    <span className="exam-option-key">{opt.key}</span>
                    <span className="exam-option-text">{opt.text}</span>
                    <span className="exam-option-radio">
                      {isSelected ? '●' : '○'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action buttons inside card */}
            <div className="exam-card-actions">
              <button
                type="button"
                className="mock-exam-btn secondary"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                ← Câu trước
              </button>

              <button
                type="button"
                className="mock-exam-btn primary"
                onClick={() => {
                  if (currentIndex < examQuestions.length - 1) {
                    setCurrentIndex((prev) => prev + 1);
                  } else {
                    submitExam(false);
                  }
                }}
              >
                {currentIndex === examQuestions.length - 1 ? 'Hoàn thành & Nộp bài' : 'Câu tiếp →'}
              </button>
            </div>

            {/* Keyboard hints */}
            <div className="exam-keyboard-hints">
              💡 Phím tắt: <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> chọn đáp án · <kbd>←</kbd> <kbd>→</kbd> chuyển câu · <kbd>F</kbd> cắm cờ
            </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="mock-exam-palette">
            <div className="palette-header">
              <h3>Bảng câu hỏi ({examQuestions.length})</h3>
              <div className="palette-legend">
                <span className="legend-item"><span className="legend-dot answered" /> Đã làm</span>
                <span className="legend-item"><span className="legend-dot empty" /> Chưa làm</span>
                <span className="legend-item"><span className="legend-dot flagged" /> Cắm cờ</span>
              </div>
            </div>

            <div className="palette-grid">
              {examQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAns = Boolean(userAnswers[q.id] && userAnswers[q.id].length > 0);
                const isFlagged = flaggedIds.includes(q.id);

                let cls = 'palette-cell';
                if (isCurrent) cls += ' current';
                if (isAns) cls += ' answered';
                if (isFlagged) cls += ' flagged';

                return (
                  <button
                    key={q.id}
                    type="button"
                    className={cls}
                    onClick={() => setCurrentIndex(idx)}
                    title={`Câu ${idx + 1}: ${isAns ? 'Đã làm' : 'Chưa làm'}${isFlagged ? ' (Có cắm cờ)' : ''}`}
                  >
                    {idx + 1}
                    {isFlagged && <span className="palette-flag-icon">🚩</span>}
                  </button>
                );
              })}
            </div>

            <div className="palette-footer">
              <button
                type="button"
                className="mock-exam-btn submit-btn block"
                onClick={() => submitExam(false)}
              >
                📤 Nộp bài thi ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER PHASE 3: RESULT & REVIEW
  // ----------------------------------------------------
  const isPassed = stats.score >= 5.0;
  const gradeLabel =
    stats.score >= 8.5
      ? '🌟 Xuất sắc'
      : stats.score >= 7.0
      ? '🎉 Khá giỏi'
      : stats.score >= 5.0
      ? '✅ Đạt yêu cầu'
      : '❌ Chưa đạt';

  return (
    <div className="mock-exam-container result-mode">
      {/* Score Summary Card */}
      <div className="mock-exam-score-card">
        {autoSubmitted && (
          <div className="auto-submit-banner">
            ⏰ Hết thời gian làm bài! Hệ thống đã tự động thu bài của bạn.
          </div>
        )}

        <div className="score-main-flex">
          <div className="score-circle-wrapper">
            <div className={`score-circle ${isPassed ? 'passed' : 'failed'}`}>
              <span className="score-number">{stats.score}</span>
              <span className="score-max">/ 10</span>
            </div>
            <span className={`score-badge ${isPassed ? 'badge-passed' : 'badge-failed'}`}>
              {gradeLabel}
            </span>
          </div>

          <div className="score-stats-grid">
            <div className="stat-card">
              <span className="stat-label">Số câu đúng</span>
              <span className="stat-value text-green">
                {stats.correct} / {examQuestions.length}
              </span>
              <span className="stat-sub">({stats.percent}%)</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Số câu sai</span>
              <span className="stat-value text-red">{stats.incorrect} câu</span>
              <span className="stat-sub">(Đã lưu vào câu sai)</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Chưa trả lời</span>
              <span className="stat-value text-gray">{stats.skipped} câu</span>
              <span className="stat-sub">Bỏ trống</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Thời gian làm bài</span>
              <span className="stat-value text-indigo">{formatTime(stats.timeSpent)}</span>
              <span className="stat-sub">/ {formatTime(totalTimeSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="score-actions-row">
          <button
            type="button"
            className="mock-exam-btn primary"
            onClick={() => startExam()}
          >
            🔄 Thi lại đề mới (Random {questionCountInput} câu)
          </button>

          <button
            type="button"
            className="mock-exam-btn secondary"
            onClick={() => startExam(undefined, undefined, examQuestions)}
          >
            🔁 Làm lại chính đề này
          </button>

          <button
            type="button"
            className="mock-exam-btn outline"
            onClick={() => setPhase('setup')}
          >
            ⚙️ Cấu hình lại
          </button>

          {stats.incorrect > 0 && (
            <button
              type="button"
              className="mock-exam-btn danger-outline"
              onClick={onOpenMistakes}
            >
              🛡️ Ôn tập {stats.incorrect} câu sai
            </button>
          )}

          <button
            type="button"
            className="mock-exam-btn secondary"
            onClick={onBackToStudy}
          >
            📖 Quay lại học
          </button>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="mock-exam-review-section">
        <div className="review-section-header">
          <h3>Chi tiết bài làm & Chữa câu sai</h3>

          {/* Filter Tabs */}
          <div className="review-filter-tabs">
            <button
              type="button"
              className={`review-tab ${reviewFilter === 'all' ? 'active' : ''}`}
              onClick={() => setReviewFilter('all')}
            >
              Tất cả ({reviewQuestions.length})
            </button>
            <button
              type="button"
              className={`review-tab tab-red ${reviewFilter === 'incorrect' ? 'active' : ''}`}
              onClick={() => setReviewFilter('incorrect')}
            >
              Câu sai ({stats.incorrect})
            </button>
            <button
              type="button"
              className={`review-tab tab-green ${reviewFilter === 'correct' ? 'active' : ''}`}
              onClick={() => setReviewFilter('correct')}
            >
              Câu đúng ({stats.correct})
            </button>
            <button
              type="button"
              className={`review-tab ${reviewFilter === 'skipped' ? 'active' : ''}`}
              onClick={() => setReviewFilter('skipped')}
            >
              Chưa làm ({stats.skipped})
            </button>
          </div>
        </div>

        {/* List of reviewed questions */}
        <div className="review-question-list">
          {filteredReviewQuestions.length === 0 ? (
            <div className="review-empty-state">
              Không có câu hỏi nào trong danh mục này!
            </div>
          ) : (
            filteredReviewQuestions.map(({ q, idx, ans, isCorrect, isSkipped }) => {
              return (
                <div
                  key={q.id}
                  className={`review-q-card ${
                    isCorrect ? 'is-correct' : isSkipped ? 'is-skipped' : 'is-incorrect'
                  }`}
                >
                  <div className="review-q-header">
                    <div className="review-q-index">
                      <strong>Câu {idx + 1}</strong>
                      <span className="review-original-id"> (Gốc: #{q.id})</span>
                    </div>

                    <div className="review-q-badge">
                      {isCorrect ? (
                        <span className="badge-correct">✓ Trả lời đúng</span>
                      ) : isSkipped ? (
                        <span className="badge-skipped">⚪ Chưa làm</span>
                      ) : (
                        <span className="badge-incorrect">✗ Trả lời sai</span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="review-q-text">{q.text}</div>

                  {/* Options */}
                  <div className="review-options">
                    {q.options.map((opt) => {
                      const isUserChoice = ans.includes(opt.key);
                      const isCorrectChoice = q.correctAnswer.includes(opt.key);

                      let optClass = 'review-option';
                      if (isCorrectChoice) optClass += ' option-correct';
                      else if (isUserChoice && !isCorrectChoice) optClass += ' option-wrong';
                      else optClass += ' option-dimmed';

                      return (
                        <div key={opt.key} className={optClass}>
                          <span className="review-opt-key">{opt.key}</span>
                          <span className="review-opt-text">{opt.text}</span>
                          {isCorrectChoice && (
                            <span className="review-opt-tag tag-correct">
                              ✓ Đáp án đúng
                            </span>
                          )}
                          {isUserChoice && !isCorrectChoice && (
                            <span className="review-opt-tag tag-wrong">
                              ✗ Bạn chọn
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Result Verdict Box */}
                  <div className="review-verdict-box">
                    {isCorrect ? (
                      <span className="verdict-correct">
                        ✓ Chính xác! Bạn đã chọn <strong>{ans}</strong>.
                      </span>
                    ) : isSkipped ? (
                      <span className="verdict-skipped">
                        ⚪ Bạn chưa chọn đáp án. Đáp án đúng là: <strong>{q.correctAnswer}</strong>.
                      </span>
                    ) : (
                      <span className="verdict-incorrect">
                        ✗ Bạn đã chọn <strong>{ans}</strong>. Đáp án đúng phải là:{' '}
                        <strong>{q.correctAnswer}</strong>.
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
