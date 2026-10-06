import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Question } from '../utils/quizParser';
import AskAI from './AskAI';
import {
  saveMistakeQuestion,
  removeMistakeQuestion,
  getMistakeQuestionIds,
} from '../utils/gameStorage';
import {
  playVictoryFanfare,
  playWrongSound,
  playClickSound,
} from '../utils/soundEffects';
import './Result.css';

export interface ResultProps {
  questions: Question[];
  answers: Record<number, string>;
  onRetry: () => void;
  onNewQuiz: () => void;
  setTitle?: string;
  courseTitle?: string;
  courseCode?: string;
  setId?: string;
}

type FilterType = 'all' | 'incorrect' | 'correct' | 'skipped';

// Lightweight, zero-dependency HTML5 Canvas Confetti animation
function fireCelebrationConfetti() {
  if (typeof window === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vRot: number;
    alpha: number;
  }> = [];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1,
    });
  }

  const startTime = Date.now();

  function render() {
    if (!ctx) return;
    const elapsed = Date.now() - startTime;
    if (elapsed > 2600) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.32;
      p.rotation += p.vRot;
      p.alpha = Math.max(0, 1 - elapsed / 2600);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

export default function Result({
  questions,
  answers,
  onRetry,
  onNewQuiz,
  setTitle,
  courseTitle,
  courseCode,
  setId,
}: ResultProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [copiedQuestionId, setCopiedQuestionId] = useState<number | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedAiIds, setExpandedAiIds] = useState<Set<number>>(new Set());
  const [isMatrixExpanded, setIsMatrixExpanded] = useState(false);

  // Bookmarked / Saved mistake question IDs
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => {
    if (!setId) return new Set();
    return new Set(getMistakeQuestionIds(setId));
  });

  // Basic Stats
  const totalQuestions = questions.length;

  const analyzedQuestions = useMemo(() => {
    return questions.map((q, idx) => {
      const userAnswer = answers[q.id]?.trim() || '';
      const isSkipped = userAnswer === '';
      const isCorrect =
        !isSkipped && userAnswer.toUpperCase() === q.correctAnswer.trim().toUpperCase();
      const isIncorrect = !isSkipped && !isCorrect;

      return {
        q,
        idx,
        userAnswer,
        isSkipped,
        isCorrect,
        isIncorrect,
      };
    });
  }, [questions, answers]);

  const correctCount = useMemo(
    () => analyzedQuestions.filter((item) => item.isCorrect).length,
    [analyzedQuestions]
  );
  const incorrectCount = useMemo(
    () => analyzedQuestions.filter((item) => item.isIncorrect).length,
    [analyzedQuestions]
  );
  const skippedCount = useMemo(
    () => analyzedQuestions.filter((item) => item.isSkipped).length,
    [analyzedQuestions]
  );

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const score10 = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 10).toFixed(1)) : 0;

  // Grade tier info
  const gradeTier = useMemo(() => {
    if (percentage >= 85) {
      return {
        level: 'excellent',
        badgeClass: 'badge-tier-excellent',
        label: 'Xuất sắc',
        title: 'Thành tích vượt trội! 🌟',
        desc: 'Kiến thức của bạn rất vững chắc. Bạn hoàn toàn sẵn sàng đạt điểm số tối đa trong kỳ thi thật!',
        color: '#10b981',
      };
    }
    if (percentage >= 70) {
      return {
        level: 'good',
        badgeClass: 'badge-tier-good',
        label: 'Khá giỏi',
        title: 'Kết quả rất tốt! 🎉',
        desc: 'Bạn đã nắm được phần lớn trọng tâm. Hãy rà soát lại các câu làm sai để bứt phá lên mức xuất sắc nhé.',
        color: '#4f46e5',
      };
    }
    if (percentage >= 50) {
      return {
        level: 'pass',
        badgeClass: 'badge-tier-pass',
        label: 'Đạt yêu cầu',
        title: 'Đã vượt qua điểm chuẩn! ⚠️',
        desc: 'Bạn đã đạt mốc yêu cầu, nhưng vẫn còn một số lỗ hổng kiến thức cần củng cố thêm trước khi đi thi.',
        color: '#f59e0b',
      };
    }
    return {
      level: 'retry',
      badgeClass: 'badge-tier-retry',
      label: 'Cần ôn tập thêm',
      title: 'Đừng nản lòng! 📚',
      desc: 'Hãy tập trung ôn kỹ các câu sai bên dưới, sử dụng tính năng giải thích AI để hiểu rõ bản chất vấn đề nhé.',
      color: '#ef4444',
    };
  }, [percentage]);

  // Audio & Confetti on mount
  useEffect(() => {
    if (percentage >= 70) {
      fireCelebrationConfetti();
      playVictoryFanfare();
    } else {
      playWrongSound();
    }
  }, [percentage]);

  // Scroll listener for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter & Search
  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return analyzedQuestions.filter((item) => {
      // Filter tab check
      if (filter === 'incorrect' && !item.isIncorrect) return false;
      if (filter === 'correct' && !item.isCorrect) return false;
      if (filter === 'skipped' && !item.isSkipped) return false;

      // Search query check
      if (query) {
        const textMatch = item.q.text.toLowerCase().includes(query);
        const optionsMatch = item.q.options.some((opt) =>
          opt.text.toLowerCase().includes(query) || opt.key.toLowerCase().includes(query)
        );
        const answerMatch = item.q.correctAnswer.toLowerCase().includes(query);
        if (!textMatch && !optionsMatch && !answerMatch) return false;
      }

      return true;
    });
  }, [analyzedQuestions, filter, searchQuery]);

  // Jump to specific question
  const handleJumpToQuestion = useCallback(
    (qId: number) => {
      playClickSound();

      // If question is filtered out, reset filter to 'all'
      const target = analyzedQuestions.find((item) => item.q.id === qId);
      if (target) {
        if (filter === 'incorrect' && !target.isIncorrect) setFilter('all');
        if (filter === 'correct' && !target.isCorrect) setFilter('all');
        if (filter === 'skipped' && !target.isSkipped) setFilter('all');
      }

      setTimeout(() => {
        const element = document.getElementById(`review-q-${qId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setActiveHighlightId(qId);
          setTimeout(() => setActiveHighlightId(null), 1800);
        }
      }, 50);
    },
    [analyzedQuestions, filter]
  );

  // Bookmark / Save single question
  const handleToggleBookmark = useCallback(
    (qId: number) => {
      if (!setId) {
        setToastMessage('Vui lòng làm bài trong bộ đề để lưu câu sai.');
        setTimeout(() => setToastMessage(null), 2500);
        return;
      }
      playClickSound();
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(qId)) {
          next.delete(qId);
          removeMistakeQuestion(setId, qId);
          setToastMessage('Đã bỏ lưu câu hỏi khỏi sổ tay.');
        } else {
          next.add(qId);
          saveMistakeQuestion(setId, qId);
          setToastMessage('Đã lưu câu hỏi vào sổ tay ôn tập!');
        }
        setTimeout(() => setToastMessage(null), 2200);
        return next;
      });
    },
    [setId]
  );

  // Batch save all incorrect questions
  const handleSaveAllIncorrect = useCallback(() => {
    if (!setId) {
      setToastMessage('Bộ đề hiện tại chưa hỗ trợ lưu tự động.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    playClickSound();
    let count = 0;
    const next = new Set(bookmarkedIds);
    analyzedQuestions.forEach((item) => {
      if (item.isIncorrect && !next.has(item.q.id)) {
        saveMistakeQuestion(setId, item.q.id);
        next.add(item.q.id);
        count += 1;
      }
    });
    setBookmarkedIds(next);
    setToastMessage(`Đã lưu thêm ${count} câu sai vào Trảm Câu Sai!`);
    setTimeout(() => setToastMessage(null), 2600);
  }, [setId, bookmarkedIds, analyzedQuestions]);

  // Copy question text
  const handleCopyQuestion = useCallback((q: Question, idx: number) => {
    playClickSound();
    const formatted = [
      `Câu ${idx + 1}: ${q.text}`,
      ...q.options.map((o) => `${o.key}. ${o.text}`),
      `Đáp án: ${q.correctAnswer}`,
    ].join('\n');

    navigator.clipboard?.writeText(formatted).then(() => {
      setCopiedQuestionId(q.id);
      setTimeout(() => setCopiedQuestionId(null), 2000);
    });
  }, []);

  // Toggle inline AskAI
  const handleToggleAi = useCallback((qId: number) => {
    playClickSound();
    setExpandedAiIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  }, []);

  // Circular gauge calculation
  const gaugeRadius = 54;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference * (1 - percentage / 100);

  return (
    <div className="result-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="result-toast-notification">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="result-header">
        <div className="result-header-left">
          <div className="result-breadcrumbs">
            <span className="result-breadcrumb-link" onClick={onNewQuiz}>
              {courseCode ? `Môn ${courseCode}` : 'Trang chủ'}
            </span>
            <span className="result-breadcrumb-sep">/</span>
            <span>{setTitle || 'Bộ đề trắc nghiệm'}</span>
            <span className="result-breadcrumb-sep">/</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>Kết quả</span>
          </div>

          <div className="result-header-title-row">
            <h1 className="result-header-title">KẾT QUẢ BÀI THI</h1>
            <span className="result-header-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Đã hoàn thành
            </span>
          </div>
        </div>

        <div className="result-header-actions">
          <button
            type="button"
            className="result-btn result-btn-ghost"
            onClick={() => window.print()}
            title="In đề & kết quả hoặc lưu thành PDF"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            In / Lưu PDF
          </button>

          <button
            type="button"
            className="result-btn result-btn-ghost"
            onClick={onNewQuiz}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {courseTitle ? `Về môn ${courseCode || ''}` : 'Đổi đề mới'}
          </button>

          <button
            type="button"
            className="result-btn result-btn-primary"
            onClick={onRetry}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Làm lại bài này
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="result-content-container">
        {/* HERO SCORE CARD */}
        <section className="result-hero-card">
          <div className="result-hero-top">
            {/* SVG Circular Progress Gauge */}
            <div className="result-gauge-wrap">
              <div className="result-gauge-circle">
                <svg className="result-gauge-svg" viewBox="0 0 130 130">
                  <circle
                    className="result-gauge-bg"
                    cx="65"
                    cy="65"
                    r={gaugeRadius}
                  />
                  <circle
                    className="result-gauge-fill"
                    cx="65"
                    cy="65"
                    r={gaugeRadius}
                    stroke={gradeTier.color}
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeOffset}
                  />
                </svg>
                <div className="result-gauge-center">
                  <span className="result-gauge-percent">{percentage}%</span>
                  <span className="result-gauge-sub">{correctCount}/{totalQuestions} câu</span>
                </div>
              </div>
            </div>

            {/* Performance Grade & Message */}
            <div className="result-eval-info">
              <span className={`result-eval-badge ${gradeTier.badgeClass}`}>
                {gradeTier.level === 'excellent' && '🌟 '}
                {gradeTier.level === 'good' && '🎉 '}
                {gradeTier.level === 'pass' && '⚠️ '}
                {gradeTier.level === 'retry' && '📚 '}
                {gradeTier.label}
              </span>
              <h2 className="result-eval-title">{gradeTier.title}</h2>
              <p className="result-eval-desc">{gradeTier.desc}</p>
            </div>
          </div>

          {/* KPI Analytics Cards */}
          <div className="result-kpi-grid">
            {/* 1. Correct */}
            <div className="result-kpi-card">
              <div className="result-kpi-icon-wrap result-kpi-icon-green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="result-kpi-body">
                <span className="result-kpi-label">Số câu đúng</span>
                <span className="result-kpi-val" style={{ color: '#059669' }}>
                  {correctCount} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>/ {totalQuestions}</span>
                </span>
                <span className="result-kpi-sub">Tỷ lệ: {percentage}%</span>
              </div>
            </div>

            {/* 2. Incorrect */}
            <div className="result-kpi-card">
              <div className="result-kpi-icon-wrap result-kpi-icon-red">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div className="result-kpi-body">
                <span className="result-kpi-label">Số câu sai</span>
                <span className="result-kpi-val" style={{ color: '#dc2626' }}>
                  {incorrectCount} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>câu</span>
                </span>
                <span className="result-kpi-sub">
                  {totalQuestions > 0 ? Math.round((incorrectCount / totalQuestions) * 100) : 0}% tổng đề
                </span>
              </div>
            </div>

            {/* 3. Skipped / Unanswered */}
            <div className="result-kpi-card">
              <div className="result-kpi-icon-wrap result-kpi-icon-gray">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div className="result-kpi-body">
                <span className="result-kpi-label">Chưa trả lời</span>
                <span className="result-kpi-val" style={{ color: '#475569' }}>
                  {skippedCount} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>câu</span>
                </span>
                <span className="result-kpi-sub">{skippedCount === 0 ? 'Làm đủ 100%' : 'Bỏ trống'}</span>
              </div>
            </div>

            {/* 4. Score out of 10 */}
            <div className="result-kpi-card">
              <div className="result-kpi-icon-wrap result-kpi-icon-purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
                  <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <div className="result-kpi-body">
                <span className="result-kpi-label">Điểm quy đổi (hệ 10)</span>
                <span className="result-kpi-val" style={{ color: '#4f46e5' }}>
                  {score10} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>/ 10</span>
                </span>
                <span className="result-kpi-sub">{score10 >= 5 ? 'Đạt điểm chuẩn' : 'Dưới trung bình'}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons in Hero */}
          <div className="result-hero-actions">
            <div className="result-actions-left">
              <button
                type="button"
                className="result-btn result-btn-primary"
                onClick={onRetry}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Làm lại bài thi
              </button>

              {incorrectCount > 0 && (
                <button
                  type="button"
                  className="result-btn result-btn-secondary"
                  onClick={() => {
                    playClickSound();
                    setFilter('incorrect');
                    document.getElementById('question-review-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Xem ngay {incorrectCount} câu sai
                </button>
              )}
            </div>

            <div className="result-actions-right">
              {incorrectCount > 0 && setId && (
                <button
                  type="button"
                  className="result-btn result-btn-secondary"
                  onClick={handleSaveAllIncorrect}
                  title="Tự động lưu tất cả câu làm sai vào bộ nhớ để luyện tập chế độ Trảm Câu Sai"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Lưu tất cả {incorrectCount} câu sai
                </button>
              )}

              <button
                type="button"
                className="result-btn result-btn-secondary"
                onClick={onNewQuiz}
              >
                Đổi đề thi khác
              </button>
            </div>
          </div>
        </section>

        {/* QUESTION JUMP MATRIX (MA TRẬN CHUYỂN NHANH CÂU HỎI) */}
        <section className="result-matrix-box">
          <div className="result-matrix-header">
            <h3 className="result-matrix-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Ma trận câu hỏi ({totalQuestions} câu)
            </h3>

            <div className="result-matrix-legend">
              <span className="legend-item">
                <span className="legend-chip chip-correct" />
                Đúng: <strong>{correctCount}</strong>
              </span>
              <span className="legend-item">
                <span className="legend-chip chip-wrong" />
                Sai: <strong>{incorrectCount}</strong>
              </span>
              <span className="legend-item">
                <span className="legend-chip chip-skipped" />
                Chưa làm: <strong>{skippedCount}</strong>
              </span>
              {totalQuestions > 60 && (
                <button
                  type="button"
                  className="matrix-toggle-btn"
                  onClick={() => setIsMatrixExpanded((prev) => !prev)}
                >
                  {isMatrixExpanded ? 'Thu gọn ▲' : `Xem toàn bộ ${totalQuestions} ô ▼`}
                </button>
              )}
            </div>
          </div>

          <div className={`result-matrix-grid-wrap ${isMatrixExpanded ? 'is-expanded' : ''}`}>
            <div className="result-matrix-grid">
              {analyzedQuestions.map(({ q, idx, isCorrect, isIncorrect, isSkipped }) => {
                let cellClass = 'matrix-cell';
                if (isCorrect) cellClass += ' cell-correct';
                else if (isIncorrect) cellClass += ' cell-wrong';
                else if (isSkipped) cellClass += ' cell-skipped';

                return (
                  <button
                    key={q.id}
                    type="button"
                    className={cellClass}
                    onClick={() => handleJumpToQuestion(q.id)}
                    title={`Câu ${idx + 1}: ${isCorrect ? 'Đúng' : isIncorrect ? 'Sai' : 'Chưa làm'} (Nhấn để cuộn tới)`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* REVIEW TOOLBAR (SEARCH & FILTER TABS) */}
        <section id="question-review-section" className="result-toolbar">
          {/* Segmented Filter Tabs */}
          <div className="result-filter-tabs">
            <button
              type="button"
              className={`result-filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => {
                playClickSound();
                setFilter('all');
              }}
            >
              Tất cả <span className="tab-badge">{totalQuestions}</span>
            </button>

            <button
              type="button"
              className={`result-filter-tab tab-wrong ${filter === 'incorrect' ? 'active' : ''}`}
              onClick={() => {
                playClickSound();
                setFilter('incorrect');
              }}
            >
              ❌ Câu sai <span className="tab-badge">{incorrectCount}</span>
            </button>

            <button
              type="button"
              className={`result-filter-tab tab-correct ${filter === 'correct' ? 'active' : ''}`}
              onClick={() => {
                playClickSound();
                setFilter('correct');
              }}
            >
              ✓ Câu đúng <span className="tab-badge">{correctCount}</span>
            </button>

            {skippedCount > 0 && (
              <button
                type="button"
                className={`result-filter-tab ${filter === 'skipped' ? 'active' : ''}`}
                onClick={() => {
                  playClickSound();
                  setFilter('skipped');
                }}
              >
                Bỏ trống <span className="tab-badge">{skippedCount}</span>
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="result-search-box">
            <svg
              className="result-search-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="result-search-input"
              placeholder="Tìm kiếm nội dung câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="result-search-clear"
                onClick={() => setSearchQuery('')}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* DETAILED QUESTION REVIEW LIST */}
        <section className="result-questions-list">
          {filteredQuestions.length === 0 ? (
            <div className="result-empty-search">
              <h4>Không tìm thấy câu hỏi phù hợp</h4>
              <p>Thử tìm với từ khóa khác hoặc chuyển sang tab lọc khác.</p>
              <button
                type="button"
                className="result-btn result-btn-secondary"
                style={{ marginTop: 14 }}
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
              >
                Xem tất cả câu hỏi
              </button>
            </div>
          ) : (
            filteredQuestions.map(({ q, idx, userAnswer, isCorrect, isIncorrect, isSkipped }) => {
              const isSaved = bookmarkedIds.has(q.id);
              const isAiOpen = expandedAiIds.has(q.id);
              const isHighlighted = activeHighlightId === q.id;

              let cardClass = 'result-q-card';
              if (isCorrect) cardClass += ' is-correct';
              else if (isIncorrect) cardClass += ' is-incorrect';
              else cardClass += ' is-skipped';
              if (isHighlighted) cardClass += ' highlight-pulse';

              return (
                <article
                  key={q.id}
                  id={`review-q-${q.id}`}
                  className={cardClass}
                >
                  {/* Card Header */}
                  <div className="result-q-card-header">
                    <div className="result-q-title-group">
                      <span className="result-q-number">Câu {idx + 1}</span>

                      {isCorrect && (
                        <span className="result-q-status-badge status-correct">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          ĐÚNG
                        </span>
                      )}

                      {isIncorrect && (
                        <span className="result-q-status-badge status-incorrect">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          SAI
                        </span>
                      )}

                      {isSkipped && (
                        <span className="result-q-status-badge status-skipped">
                          CHƯA TRẢ LỜI
                        </span>
                      )}
                    </div>

                    {/* Card Tools */}
                    <div className="result-q-card-tools">
                      {/* AI Explain button */}
                      <button
                        type="button"
                        className={`q-tool-btn ${isAiOpen ? 'btn-ai-active' : ''}`}
                        onClick={() => handleToggleAi(q.id)}
                        title="Hỏi AI giải thích chi tiết câu này"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                          <rect x="4" y="8" width="16" height="12" rx="2" />
                          <circle cx="9" cy="13" r="1" />
                          <circle cx="15" cy="13" r="1" />
                        </svg>
                        {isAiOpen ? 'Đóng giải thích AI' : 'Hỏi AI giải thích'}
                      </button>

                      {/* Bookmark / Save question */}
                      {setId && (
                        <button
                          type="button"
                          className={`q-tool-btn ${isSaved ? 'btn-saved' : ''}`}
                          onClick={() => handleToggleBookmark(q.id)}
                          title={isSaved ? 'Bỏ lưu câu hỏi này' : 'Lưu câu hỏi này vào sổ tay ôn tập'}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                          {isSaved ? 'Đã lưu' : 'Lưu câu hỏi'}
                        </button>
                      )}

                      {/* Copy Question */}
                      <button
                        type="button"
                        className="q-tool-btn"
                        onClick={() => handleCopyQuestion(q, idx)}
                        title="Sao chép nội dung câu hỏi"
                      >
                        {copiedQuestionId === q.id ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Đã chép!
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            Sao chép
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Question Stem */}
                  <p className="result-q-stem">{q.text}</p>

                  {/* Options List */}
                  <div className="result-options-list">
                    {q.options.map((opt) => {
                      const isOptionCorrect = q.correctAnswer.includes(opt.key);
                      const isUserSelected = userAnswer.includes(opt.key);

                      let rowClass = 'result-opt-row';
                      if (isOptionCorrect) {
                        rowClass += ' opt-is-correct';
                      } else if (isUserSelected) {
                        rowClass += ' opt-is-user-wrong';
                      }

                      return (
                        <div key={opt.key} className={rowClass}>
                          <span className="result-opt-key">{opt.key}</span>
                          <span className="result-opt-text">{opt.text}</span>

                          {/* Status Tag */}
                          {isUserSelected && isOptionCorrect && (
                            <span className="result-opt-tag tag-user-correct">
                              ✓ Bạn chọn đúng
                            </span>
                          )}

                          {isUserSelected && !isOptionCorrect && (
                            <span className="result-opt-tag tag-user-wrong">
                              ✗ Bạn đã chọn
                            </span>
                          )}

                          {!isUserSelected && isOptionCorrect && (
                            <span className="result-opt-tag tag-correct">
                              ✓ Đáp án chính xác
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Verdict summary banner */}
                  {isCorrect && (
                    <div className="result-verdict-banner verdict-box-correct">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Bạn đã trả lời chính xác: <strong>Đáp án {q.correctAnswer}</strong></span>
                    </div>
                  )}

                  {isIncorrect && (
                    <div className="result-verdict-banner verdict-box-incorrect">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>
                        Bạn chọn: <strong>{userAnswer || 'Chưa chọn'}</strong> · Đáp án đúng là:{' '}
                        <strong>{q.correctAnswer}</strong> ({q.options.find((o) => q.correctAnswer.includes(o.key))?.text})
                      </span>
                    </div>
                  )}

                  {isSkipped && (
                    <div className="result-verdict-banner verdict-box-skipped">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <span>
                        Câu này bạn bỏ trống. Đáp án chính xác là: <strong>{q.correctAnswer}</strong> ({q.options.find((o) => q.correctAnswer.includes(o.key))?.text})
                      </span>
                    </div>
                  )}

                  {/* Inline Ask AI Assistant */}
                  {isAiOpen && (
                    <div className="result-ai-container">
                      <AskAI question={q} />
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </main>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          className="result-back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Cuộn lên đầu trang"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          Lên đầu trang
        </button>
      )}

      {/* Watermark & Branding */}
      <div className="fuo-watermark" style={{ marginTop: 40 }}>
        <div className="fuo-logo-main">KEYT</div>
        <div className="fuo-logo-sub">KEYT.COM · NỀN TẢNG ÔN THI TRẮC NGHIỆM ĐỈNH CAO</div>
      </div>
    </div>
  );
}
