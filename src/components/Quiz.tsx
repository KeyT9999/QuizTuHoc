import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Question } from '../utils/quizParser';
import { MLN_RESEARCH_UNCERTAIN } from '../data/mlnResearchAnswerKeys';
import {
  loadQuizSplitSettings,
  saveQuizSplitSettings,
  calculateQuizParts,
  type QuizSplitSettings,
} from '../utils/quizSplit';
import QuizSplitModal from './QuizSplitModal';
import QuizModeBar, { type QuizPlayMode } from './QuizModeBar';
import TimeAttackGame from './games/TimeAttackGame';
import SurvivalTowerGame from './games/SurvivalTowerGame';
import TrueFalseGame from './games/TrueFalseGame';
import MistakeBusterView from './games/MistakeBusterView';
import MockExamView from './games/MockExamView';
import { getMistakeQuestionIds, saveMistakeQuestion } from '../utils/gameStorage';

interface QuizProps {
  setId?: string;
  setTitle?: string;
  questions: Question[];
  onFinish: (answers: Record<number, string>) => void;
  onBack: () => void;
}

export default function Quiz({ setId, setTitle, questions, onFinish, onBack }: QuizProps) {
  const storageKeyIndex = setId ? `keyt_quiz_index_${setId}` : 'keyt_quiz_index';
  const storageKeyAnswers = setId ? `keyt_quiz_answers_${setId}` : 'keyt_quiz_answers';
  const storageKeyMastered = setId ? `keyt_quiz_mastered_${setId}` : 'keyt_quiz_mastered';
  const storageKeySubmitted = setId ? `keyt_quiz_submitted_${setId}` : 'keyt_quiz_submitted';

  // Load split settings
  const [splitSettings, setSplitSettings] = useState<QuizSplitSettings>(() => {
    return loadQuizSplitSettings(setId, 50);
  });
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [showPartCompleteModal, setShowPartCompleteModal] = useState(false);

  // Play Mode (Cốt lõi vs Đột phá) & Mistake count
  const [activeMode, setActiveMode] = useState<QuizPlayMode>('study');
  const [mistakeCount, setMistakeCount] = useState<number>(() => {
    return setId ? getMistakeQuestionIds(setId).length : 0;
  });

  // Calculate parts based on splitSettings
  const parts = useMemo(() => {
    return calculateQuizParts(questions.length, splitSettings.chunkSize || 50);
  }, [questions.length, splitSettings.chunkSize]);

  const currentPartIndex = useMemo(() => {
    if (!splitSettings.enabled || parts.length === 0) return 0;
    if (splitSettings.currentPart >= parts.length) return parts.length - 1;
    return Math.max(0, splitSettings.currentPart);
  }, [splitSettings.enabled, splitSettings.currentPart, parts.length]);

  const currentPart = splitSettings.enabled && parts.length > 0 ? parts[currentPartIndex] : null;

  // Load initial index from localStorage, clamped to currentPart if split mode is active
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem(storageKeyIndex);
    const parsed = saved !== null ? parseInt(saved, 10) : 0;
    const valid = !isNaN(parsed) && parsed >= 0 && parsed < questions.length ? parsed : 0;

    const initialSplit = loadQuizSplitSettings(setId, 50);
    if (initialSplit.enabled) {
      const initialParts = calculateQuizParts(questions.length, initialSplit.chunkSize || 50);
      const targetPart = initialParts[initialSplit.currentPart] || initialParts[0];
      if (targetPart && (valid < targetPart.startIndex || valid > targetPart.endIndex)) {
        return targetPart.startIndex;
      }
    }
    return valid;
  });

  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(storageKeyAnswers);
      if (saved) return JSON.parse(saved);
      if (setId === 'ccnc_426') {
        const legacy = localStorage.getItem('keyt_quiz_answers');
        if (legacy) return JSON.parse(legacy);
      }
      return {};
    } catch {
      return {};
    }
  });

  const [masteredIds, setMasteredIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeyMastered);
      if (saved) return JSON.parse(saved);
      if (setId === 'ccnc_426') {
        const legacy = localStorage.getItem('keyt_quiz_mastered');
        if (legacy) return JSON.parse(legacy);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [submittedIds, setSubmittedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeySubmitted);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [gridFilter, setGridFilter] = useState<'part' | 'all'>('part');
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
  const questionCardRef = useRef<HTMLDivElement>(null);

  // Question IDs that have answers revealed via "Xem đáp án"
  const [revealedIds, setRevealedIds] = useState<number[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(storageKeyIndex, currentIndex.toString());
  }, [currentIndex, storageKeyIndex]);

  useEffect(() => {
    localStorage.setItem(storageKeyAnswers, JSON.stringify(answers));
  }, [answers, storageKeyAnswers]);

  useEffect(() => {
    localStorage.setItem(storageKeyMastered, JSON.stringify(masteredIds));
  }, [masteredIds, storageKeyMastered]);

  useEffect(() => {
    localStorage.setItem(storageKeySubmitted, JSON.stringify(submittedIds));
  }, [submittedIds, storageKeySubmitted]);

  useEffect(() => {
    saveQuizSplitSettings(setId, splitSettings);
  }, [splitSettings, setId]);

  // Safe question derivation
  const question = questions[currentIndex] || questions[0];

  const selectedAnswer = question ? answers[question.id] : undefined;
  const isUnresolved = question?.correctAnswer === '?';
  const isMultipleChoice = !isUnresolved && (question?.correctAnswer.length ?? 0) > 1;
  const isAnswered = isUnresolved
    ? selectedAnswer !== undefined
    : isMultipleChoice
    ? (question ? submittedIds.includes(question.id) : false)
    : selectedAnswer !== undefined;
  const isMastered = question ? masteredIds.includes(question.id) : false;
  const uncertainSet = new Set(MLN_RESEARCH_UNCERTAIN[setId ?? ''] ?? []);
  const isRevealed = question ? revealedIds.includes(question.id) : false;

  // Progress stats
  const progressPercent = questions.length > 0 ? Math.round((masteredIds.length / questions.length) * 100) : 0;

  const partQuestionIds = useMemo(() => {
    if (!currentPart) return [];
    return questions.slice(currentPart.startIndex, currentPart.endIndex + 1).map((q) => q.id);
  }, [currentPart, questions]);

  const partMasteredCount = useMemo(() => {
    return partQuestionIds.filter((id) => masteredIds.includes(id)).length;
  }, [partQuestionIds, masteredIds]);

  const partProgressPercent = currentPart && currentPart.totalCount > 0
    ? Math.round((partMasteredCount / currentPart.totalCount) * 100)
    : 0;

  const relativeIndex = currentPart ? currentIndex - currentPart.startIndex : currentIndex;

  // Handlers
  const handleSelectOption = useCallback(
    (key: string) => {
      if (!question || isAnswered) return;
      const answer = isMultipleChoice
        ? (selectedAnswer?.includes(key)
            ? selectedAnswer.replace(key, '')
            : `${selectedAnswer ?? ''}${key}`)
            .split('')
            .sort()
            .join('')
        : key;
      const newAnswers = { ...answers, [question.id]: answer };
      setAnswers(newAnswers);

      if (
        !isUnresolved &&
        !isMultipleChoice &&
        answer === question.correctAnswer &&
        !masteredIds.includes(question.id)
      ) {
        setMasteredIds((prev) => [...prev, question.id]);
      } else if (!isUnresolved && !isMultipleChoice && answer !== question.correctAnswer) {
        if (setId) {
          saveMistakeQuestion(setId, question.id);
          setMistakeCount(getMistakeQuestionIds(setId).length);
        }
      }
    },
    [isAnswered, isMultipleChoice, selectedAnswer, answers, question, isUnresolved, masteredIds]
  );

  const handleCheckMultiple = useCallback(() => {
    if (!question || !selectedAnswer || isAnswered) return;
    setSubmittedIds((prev) => [...prev, question.id]);
    if (selectedAnswer === question.correctAnswer && !masteredIds.includes(question.id)) {
      setMasteredIds((prev) => [...prev, question.id]);
    }
  }, [selectedAnswer, isAnswered, question, masteredIds]);

  const toggleMastered = (questionId: number) => {
    setMasteredIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const handleToggleReveal = useCallback(() => {
    if (!question || isAnswered) return;
    setRevealedIds((prev) =>
      prev.includes(question.id)
        ? prev.filter((id) => id !== question.id)
        : [...prev, question.id]
    );
  }, [question, isAnswered]);

  const triggerSlide = (direction: 'next' | 'prev') => {
    setSlideDirection(direction);
    setTimeout(() => setSlideDirection(null), 280);
  };

  const handleNext = useCallback(() => {
    if (splitSettings.enabled && currentPart) {
      if (currentIndex < currentPart.endIndex) {
        triggerSlide('next');
        setCurrentIndex(currentIndex + 1);
      } else {
        setShowPartCompleteModal(true);
      }
    } else {
      if (currentIndex < questions.length - 1) {
        triggerSlide('next');
        setCurrentIndex(currentIndex + 1);
      } else {
        onFinish(answers);
      }
    }
  }, [currentIndex, questions.length, answers, onFinish, splitSettings.enabled, currentPart]);

  const handlePrev = useCallback(() => {
    if (splitSettings.enabled && currentPart) {
      if (currentIndex > currentPart.startIndex) {
        triggerSlide('prev');
        setCurrentIndex(currentIndex - 1);
      }
    } else {
      if (currentIndex > 0) {
        triggerSlide('prev');
        setCurrentIndex(currentIndex - 1);
      }
    }
  }, [currentIndex, splitSettings.enabled, currentPart]);

  const handleSwitchPart = (targetPartIndex: number) => {
    if (targetPartIndex < 0 || targetPartIndex >= parts.length) return;
    const targetPart = parts[targetPartIndex];
    const updated: QuizSplitSettings = {
      ...splitSettings,
      currentPart: targetPartIndex,
    };
    setSplitSettings(updated);
    saveQuizSplitSettings(setId, updated);
    setCurrentIndex(targetPart.startIndex);
    setShowPartCompleteModal(false);
  };

  const handleApplySplitSettings = (newSettings: QuizSplitSettings, targetPartIndex?: number) => {
    setSplitSettings(newSettings);
    saveQuizSplitSettings(setId, newSettings);
    if (newSettings.enabled) {
      const newParts = calculateQuizParts(questions.length, newSettings.chunkSize);
      const targetIdx = targetPartIndex !== undefined ? targetPartIndex : newSettings.currentPart;
      const p = newParts[targetIdx] || newParts[0];
      if (p) {
        if (currentIndex < p.startIndex || currentIndex > p.endIndex) {
          setCurrentIndex(p.startIndex);
        }
      }
    }
  };

  const handleResetProgress = () => {
    setRevealedIds([]);
    if (splitSettings.enabled && currentPart) {
      const resetChoice = window.confirm(
        `Bạn muốn học lại từ đầu?\n\n• Nhấn OK: Đặt lại toàn bộ đề thi (${questions.length} câu).\n• Nhấn Hủy (Cancel): Chỉ đặt lại tiến trình của riêng ${currentPart.name} (${currentPart.totalCount} câu).`
      );

      if (resetChoice) {
        // Reset all
        setCurrentIndex(0);
        setAnswers({});
        setMasteredIds([]);
        setSubmittedIds([]);
        localStorage.removeItem(storageKeyIndex);
        localStorage.removeItem(storageKeyAnswers);
        localStorage.removeItem(storageKeyMastered);
        localStorage.removeItem(storageKeySubmitted);
      } else {
        // Reset current part only
        const partIds = new Set(partQuestionIds);
        setAnswers((prev) => {
          const next = { ...prev };
          partIds.forEach((id) => delete next[id]);
          return next;
        });
        setMasteredIds((prev) => prev.filter((id) => !partIds.has(id)));
        setSubmittedIds((prev) => prev.filter((id) => !partIds.has(id)));
        setCurrentIndex(currentPart.startIndex);
      }
    } else {
      if (window.confirm('Bạn có chắc muốn xóa toàn bộ tiến trình học và bắt đầu lại từ đầu?')) {
        setCurrentIndex(0);
        setAnswers({});
        setMasteredIds([]);
        setSubmittedIds([]);
        localStorage.removeItem(storageKeyIndex);
        localStorage.removeItem(storageKeyAnswers);
        localStorage.removeItem(storageKeyMastered);
        localStorage.removeItem(storageKeySubmitted);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMode !== 'study') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toLowerCase();

      // Toggle question grid
      if (key === 'g') {
        e.preventDefault();
        setShowQuestionGrid((prev) => !prev);
        return;
      }

      // If a modal is open, ignore subsequent card shortcuts
      if (showQuestionGrid || isSplitModalOpen || showPartCompleteModal) return;

      // Space: Toggle reveal correct answer (green highlight)
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleToggleReveal();
        return;
      }

      // Option selection: A/B/C/D or 1/2/3/4
      const optionKeys: Record<string, string> = {
        a: 'A',
        b: 'B',
        c: 'C',
        d: 'D',
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
      };
      if (optionKeys[key]) {
        e.preventDefault();
        const optionKey = optionKeys[key];
        if (question?.options.some((o) => o.key === optionKey)) {
          handleSelectOption(optionKey);
        }
        return;
      }

      // Navigation
      if (key === 'arrowright' || key === 'enter') {
        e.preventDefault();
        if (isMultipleChoice && !isAnswered && selectedAnswer) {
          handleCheckMultiple();
        } else {
          handleNext();
        }
        return;
      }

      if (key === 'arrowleft') {
        e.preventDefault();
        handlePrev();
        return;
      }

      // Toggle mastered
      if (key === 'm' && question) {
        e.preventDefault();
        toggleMastered(question.id);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeMode,
    question,
    handleToggleReveal,
    handleSelectOption,
    handleNext,
    handlePrev,
    handleCheckMultiple,
    isMultipleChoice,
    isAnswered,
    selectedAnswer,
    showQuestionGrid,
    isSplitModalOpen,
    showPartCompleteModal,
  ]);

  // Questions displayed in Grid Modal
  const displayedQuestions = useMemo(() => {
    if (splitSettings.enabled && currentPart && gridFilter === 'part') {
      return questions
        .slice(currentPart.startIndex, currentPart.endIndex + 1)
        .map((q, i) => ({ q, idx: currentPart.startIndex + i }));
    }
    return questions.map((q, idx) => ({ q, idx }));
  }, [questions, splitSettings.enabled, currentPart, gridFilter]);

  if (!question) {
    return (
      <div className="quiz-v2-wrapper">
        <div className="app-error-state">
          <h3>Không có câu hỏi nào</h3>
          <button className="back-btn" onClick={onBack}>
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-v2-wrapper">
      {/* Tier 1 — Premium Dark Header Bar */}
      <div className="quiz-v2-header">
        <div className="quiz-v2-header-left">
          <span className="quiz-v2-title">{setTitle ? setTitle.toUpperCase() : 'MULTIPLE CHOICE'}</span>
          
          {/* Circular Progress Ring */}
          <div className="quiz-progress-ring-wrapper">
            <svg className="quiz-progress-ring" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <circle className="quiz-progress-ring-bg" cx="18" cy="18" r="15.5" />
              <circle
                className="quiz-progress-ring-fill"
                cx="18" cy="18" r="15.5"
                strokeDasharray={`${2 * Math.PI * 15.5}`}
                strokeDashoffset={`${2 * Math.PI * 15.5 * (1 - (splitSettings.enabled ? partProgressPercent : progressPercent) / 100)}`}
              />
            </svg>
            <span className="quiz-progress-ring-text">
              {splitSettings.enabled ? partProgressPercent : progressPercent}%
            </span>
            {splitSettings.enabled && currentPart ? (
              <span className="quiz-progress-ring-label">
                <strong>{partMasteredCount}/{currentPart.totalCount}</strong> {currentPart.name}
                <span className="quiz-v2-mastered-total-tag" style={{ marginLeft: 6 }}>
                  Σ {masteredIds.length}/{questions.length}
                </span>
              </span>
            ) : (
              <span className="quiz-progress-ring-label">
                <strong>{masteredIds.length}/{questions.length}</strong> đã học
              </span>
            )}
          </div>
        </div>

        {/* Center / Part Navigation when Split Mode is Active */}
        {splitSettings.enabled && currentPart && (
          <div className="quiz-v2-header-center">
            <div className="quiz-v2-part-selector">
              <button
                type="button"
                className="quiz-v2-part-nav-btn"
                disabled={currentPartIndex === 0}
                onClick={() => handleSwitchPart(currentPartIndex - 1)}
                title="Về phần trước"
              >
                ◀
              </button>

              <div className="quiz-v2-part-select-wrapper">
                <select
                  className="quiz-v2-part-select"
                  value={currentPartIndex}
                  onChange={(e) => handleSwitchPart(parseInt(e.target.value, 10))}
                  aria-label="Chọn phần đề thi"
                >
                  {parts.map((p) => {
                    const pQuestions = questions.slice(p.startIndex, p.endIndex + 1);
                    const pMastered = pQuestions.filter((q) => masteredIds.includes(q.id)).length;
                    return (
                      <option key={p.partIndex} value={p.partIndex}>
                        {p.name} (Câu {p.startNumber} - {p.endNumber}) · {pMastered}/{p.totalCount} đã học
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="button"
                className="quiz-v2-part-nav-btn"
                disabled={currentPartIndex === parts.length - 1}
                onClick={() => handleSwitchPart(currentPartIndex + 1)}
                title="Sang phần tiếp theo"
              >
                ▶
              </button>
            </div>
          </div>
        )}

        <div className="quiz-v2-header-right">
          {/* Split Mode Config — Icon Button */}
          <button
            type="button"
            className={`quiz-v2-header-icon-btn ${splitSettings.enabled ? 'is-split-active' : ''}`}
            onClick={() => setIsSplitModalOpen(true)}
            title={splitSettings.enabled 
              ? `Chia nhỏ: ${splitSettings.chunkSize} câu/quiz` 
              : 'Chia nhỏ quiz'
            }
          >
            ✂️
          </button>

          {/* Question Grid — Icon Button */}
          <button
            type="button"
            className="quiz-v2-header-icon-btn"
            onClick={() => setShowQuestionGrid(!showQuestionGrid)}
            title={`Danh sách câu hỏi (${splitSettings.enabled && currentPart ? `${relativeIndex + 1}/${currentPart.totalCount}` : `${currentIndex + 1}/${questions.length}`}) · Phím tắt: G`}
          >
            📋
            <span className="header-btn-count">
              {splitSettings.enabled && currentPart ? `${relativeIndex + 1}` : `${currentIndex + 1}`}
            </span>
          </button>

          {/* Reset Progress — Icon Button */}
          <button 
            type="button" 
            className="quiz-v2-header-icon-btn" 
            onClick={handleResetProgress}
            title="Học lại từ đầu"
          >
            🔄
          </button>
          
          {/* Back — Text Button (important action, keep readable) */}
          <button type="button" className="quiz-v2-header-btn" onClick={onBack}>
            ← Đổi đề
          </button>
        </div>
      </div>

      {/* Progress Bar (shows current part progress if split mode, else full progress) */}
      <div className="quiz-v2-progress-track">
        <div
          className="quiz-v2-progress-fill"
          style={{ width: `${splitSettings.enabled ? partProgressPercent : progressPercent}%` }}
        />
      </div>

      {/* Navigation Bar: CỐT LÕI & ĐỘT PHÁ (Minigames) */}
      <QuizModeBar
        activeMode={activeMode}
        onChangeMode={(mode) => setActiveMode(mode)}
        mistakeCount={mistakeCount}
        onOpenQuestionGrid={() => setShowQuestionGrid(true)}
      />

      {/* Active Game / View Mode Rendering */}
      {activeMode === 'time_attack' && (
        <TimeAttackGame
          setId={setId || 'default'}
          setTitle={setTitle}
          questions={
            splitSettings.enabled && currentPart
              ? questions.slice(currentPart.startIndex, currentPart.endIndex + 1)
              : questions
          }
          onBackToStudy={() => setActiveMode('study')}
          onOpenMistakes={() => setActiveMode('mistake_buster')}
        />
      )}

      {activeMode === 'survival_tower' && (
        <SurvivalTowerGame
          setId={setId || 'default'}
          setTitle={setTitle}
          questions={
            splitSettings.enabled && currentPart
              ? questions.slice(currentPart.startIndex, currentPart.endIndex + 1)
              : questions
          }
          onBackToStudy={() => setActiveMode('study')}
          onOpenMistakes={() => setActiveMode('mistake_buster')}
        />
      )}

      {activeMode === 'true_false' && (
        <TrueFalseGame
          setId={setId || 'default'}
          setTitle={setTitle}
          questions={
            splitSettings.enabled && currentPart
              ? questions.slice(currentPart.startIndex, currentPart.endIndex + 1)
              : questions
          }
          onBackToStudy={() => setActiveMode('study')}
          onOpenMistakes={() => setActiveMode('mistake_buster')}
        />
      )}

      {activeMode === 'mistake_buster' && (
        <MistakeBusterView
          setId={setId || 'default'}
          setTitle={setTitle}
          allQuestions={questions}
          onBackToStudy={() => setActiveMode('study')}
          onMistakesUpdated={() => setMistakeCount(setId ? getMistakeQuestionIds(setId).length : 0)}
        />
      )}

      {activeMode === 'mock_exam' && (
        <MockExamView
          setId={setId || 'default'}
          setTitle={setTitle}
          allQuestions={questions}
          onBackToStudy={() => setActiveMode('study')}
          onOpenMistakes={() => setActiveMode('mistake_buster')}
          onMistakesUpdated={() => setMistakeCount(setId ? getMistakeQuestionIds(setId).length : 0)}
        />
      )}

      {/* Quick Question List Grid */}
      {showQuestionGrid && (
        <div className="quiz-v2-grid-modal">
          <div className="quiz-v2-grid-header">
            <div className="quiz-v2-grid-header-left">
              <strong>Danh sách câu hỏi & Tiến độ học:</strong>
              {splitSettings.enabled && currentPart && (
                <div className="quiz-v2-grid-filter-tabs">
                  <button
                    type="button"
                    className={`quiz-v2-grid-tab ${gridFilter === 'part' ? 'active' : ''}`}
                    onClick={() => setGridFilter('part')}
                  >
                    {currentPart.name} ({currentPart.startNumber} - {currentPart.endNumber})
                  </button>
                  <button
                    type="button"
                    className={`quiz-v2-grid-tab ${gridFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setGridFilter('all')}
                  >
                    Tất cả ({questions.length} câu)
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              className="quiz-v2-header-btn"
              onClick={() => setShowQuestionGrid(false)}
            >
              ✕ Đóng
            </button>
          </div>
          <div className="quiz-v2-grid-items">
            {displayedQuestions.map(({ q, idx }) => {
              const isCurrent = idx === currentIndex;
              const isQMastered = masteredIds.includes(q.id);
              const isQAnswered =
                q.correctAnswer.length > 1
                  ? submittedIds.includes(q.id)
                  : answers[q.id] !== undefined;

              let btnClass = 'quiz-v2-grid-item';
              if (isCurrent) btnClass += ' active';
              if (isQMastered) btnClass += ' mastered';
              else if (isQAnswered) btnClass += ' answered';
              if (uncertainSet.has(idx + 1)) btnClass += ' needs-review';

              return (
                <button
                  key={q.id}
                  type="button"
                  className={btnClass}
                  onClick={() => {
                    if (splitSettings.enabled) {
                      const targetPartIdx = Math.floor(idx / (splitSettings.chunkSize || 50));
                      if (targetPartIdx !== currentPartIndex && targetPartIdx < parts.length) {
                        const updated: QuizSplitSettings = {
                          ...splitSettings,
                          currentPart: targetPartIdx,
                        };
                        setSplitSettings(updated);
                        saveQuizSplitSettings(setId, updated);
                      }
                    }
                    setCurrentIndex(idx);
                    setShowQuestionGrid(false);
                  }}
                  title={`Câu ${idx + 1}: ${
                    isQMastered ? 'Đã học' : isQAnswered ? 'Đã làm' : 'Chưa học'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content — Centered Card (Study Mode) */}
      {activeMode === 'study' && (
      <div className="quiz-v2-content-center">
        <div
          ref={questionCardRef}
          className={`quiz-v2-question-card ${
            slideDirection === 'next'
              ? 'slide-in-right'
              : slideDirection === 'prev'
              ? 'slide-in-left'
              : ''
          }`}
          key={currentIndex}
        >
          {/* Question Header */}
          <div className="quiz-v2-q-header">
            <div className="quiz-v2-q-number">
              {splitSettings.enabled && currentPart ? (
                <>
                  <span className="quiz-v2-q-main-num">Câu {relativeIndex + 1}</span>
                  <span className="quiz-v2-q-total"> / {currentPart.totalCount}</span>
                  <span className="quiz-v2-q-part-pill">
                    {currentPart.name} · Gốc: #{currentIndex + 1}/{questions.length}
                  </span>
                </>
              ) : (
                <>
                  Câu {currentIndex + 1}{' '}
                  <span className="quiz-v2-q-total">/ {questions.length}</span>
                </>
              )}
            </div>
            <button
              type="button"
              className={`quiz-v2-mastered-toggle ${isMastered ? 'is-mastered' : ''}`}
              onClick={() => toggleMastered(question.id)}
              title="Phím tắt: M"
            >
              {isMastered ? '✓ Đã học' : '📖 Đánh dấu đã học'}
            </button>
          </div>

          {/* Question Text */}
          <div className="quiz-v2-q-text">{question.text}</div>

          {/* Options */}
          <div className="quiz-v2-options">
            {question.options.map((opt) => {
              const isSelected = selectedAnswer?.includes(opt.key) ?? false;
              const isCorrect = question.correctAnswer.includes(opt.key);

              let optClass = 'quiz-v2-option';
              if (isSelected && !isAnswered) optClass += ' selected';
              if (isAnswered && !isUnresolved) {
                if (isCorrect) optClass += ' correct';
                else if (isSelected) optClass += ' incorrect';
                else optClass += ' dimmed';
              } else if (isRevealed && !isUnresolved) {
                if (isCorrect) optClass += ' correct';
                else if (isSelected) optClass += ' incorrect';
                else optClass += ' dimmed';
              }

              return (
                <div
                  key={opt.key}
                  className={optClass}
                  onClick={() => handleSelectOption(opt.key)}
                >
                  <span className="quiz-v2-option-key">{opt.key}</span>
                  <span className="quiz-v2-option-text">{opt.text}</span>
                  {(isAnswered || isRevealed) && !isUnresolved && isCorrect && (
                    <span className="quiz-v2-option-icon correct-icon">✓</span>
                  )}
                  {(isAnswered || (isRevealed && isSelected)) && !isUnresolved && !isCorrect && (
                    <span className="quiz-v2-option-icon incorrect-icon">✗</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          {(isAnswered || isRevealed) && (
            <div className="quiz-v2-feedback">
              {isUnresolved ? (
                <span className="quiz-v2-feedback-warning">
                  ⚠ Chưa có đáp án nghiên cứu chắc chắn cho câu này.
                </span>
              ) : isAnswered ? (
                selectedAnswer === question.correctAnswer ? (
                  <span className="quiz-v2-feedback-correct">✓ Đáp án chính xác!</span>
                ) : (
                  <span className="quiz-v2-feedback-incorrect">
                    ✗ Sai! Đáp án đúng là {question.correctAnswer}
                  </span>
                )
              ) : (
                <span className="quiz-v2-feedback-correct">
                  💡 Đáp án đúng là: <strong>{question.correctAnswer}</strong>
                </span>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="quiz-v2-actions">
            <button
              type="button"
              className="quiz-v2-btn secondary"
              onClick={handlePrev}
              disabled={
                splitSettings.enabled && currentPart
                  ? currentIndex <= currentPart.startIndex
                  : currentIndex === 0
              }
              title="Phím tắt: ←"
            >
              ← Câu trước
            </button>

            <button
              type="button"
              className={`quiz-v2-btn reveal-btn ${isRevealed ? 'active' : ''} ${isAnswered ? 'answered' : ''}`}
              onClick={(e) => {
                e.currentTarget.blur();
                handleToggleReveal();
              }}
              disabled={isAnswered}
              title={
                isAnswered
                  ? 'Đã có kết quả đáp án cho câu này'
                  : isRevealed
                  ? 'Ẩn đáp án đúng · Phím tắt: Space (Dấu cách)'
                  : 'Xem đáp án đúng · Phím tắt: Space (Dấu cách)'
              }
            >
              <span className="reveal-btn-icon">{isAnswered ? '✓' : isRevealed ? '🙈' : '👁️'}</span>
              <span className="reveal-btn-text">
                {isAnswered ? 'Đã có đáp án' : isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
              </span>
              {!isAnswered && <kbd className="reveal-btn-kbd">Space</kbd>}
            </button>

            {isMultipleChoice && !isAnswered && (
              <button
                type="button"
                className="quiz-v2-btn primary"
                onClick={handleCheckMultiple}
                disabled={!selectedAnswer}
              >
                Kiểm tra đáp án
              </button>
            )}

            <button
              type="button"
              className="quiz-v2-btn primary"
              onClick={handleNext}
              title="Phím tắt: → hoặc Enter"
            >
              {splitSettings.enabled && currentPart
                ? currentIndex === currentPart.endIndex
                  ? currentPartIndex === parts.length - 1
                    ? 'Nộp bài & Kết quả'
                    : `Hoàn thành ${currentPart.name} →`
                  : 'Câu tiếp →'
                : currentIndex === questions.length - 1
                ? 'Nộp bài & Kết quả'
                : 'Câu tiếp →'}
            </button>
          </div>

          {/* Keyboard Hint */}
          <div className="quiz-v2-keyboard-hint">
            💡 Phím tắt: <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> chọn đáp án · <kbd className="hint-kbd-space">Space</kbd> xem đáp án · <kbd>←</kbd> <kbd>→</kbd> chuyển câu · <kbd>M</kbd> đánh dấu · <kbd>G</kbd> danh sách
          </div>
        </div>
      </div>
      )}

      {/* Part Complete Celebration Modal */}
      {showPartCompleteModal && currentPart && (
        <div className="quiz-split-modal-overlay">
          <div className="quiz-split-complete-card">
            <div className="quiz-split-complete-icon">🎉</div>
            <h3 className="quiz-split-complete-title">
              Hoàn thành {currentPart.name}!
            </h3>
            <p className="quiz-split-complete-subtitle">
              Bạn đã xem hết {currentPart.totalCount} câu trong phần này (Câu {currentPart.startNumber} – {currentPart.endNumber}).
            </p>

            <div className="quiz-split-complete-stats">
              <div className="quiz-split-stat-box">
                <div className="quiz-split-stat-value">{currentPart.totalCount}</div>
                <div className="quiz-split-stat-label">Tổng số câu</div>
              </div>
              <div className="quiz-split-stat-box highlight">
                <div className="quiz-split-stat-value">{partMasteredCount}</div>
                <div className="quiz-split-stat-label">Đã học thành thạo</div>
              </div>
              <div className="quiz-split-stat-box">
                <div className="quiz-split-stat-value">{partProgressPercent}%</div>
                <div className="quiz-split-stat-label">Tiến độ phần</div>
              </div>
            </div>

            <div className="quiz-split-complete-actions">
              {currentPartIndex < parts.length - 1 ? (
                <button
                  type="button"
                  className="quiz-split-complete-btn-next"
                  onClick={() => handleSwitchPart(currentPartIndex + 1)}
                >
                  Làm tiếp {parts[currentPartIndex + 1].name} →
                </button>
              ) : (
                <button
                  type="button"
                  className="quiz-split-complete-btn-next"
                  onClick={() => onFinish(answers)}
                >
                  Xem bảng điểm tổng kết 🏆
                </button>
              )}
              <button
                type="button"
                className="quiz-split-complete-btn-retry"
                onClick={() => {
                  setCurrentIndex(currentPart.startIndex);
                  setShowPartCompleteModal(false);
                }}
              >
                Ôn lại phần này 🔄
              </button>
              <button
                type="button"
                className="quiz-split-complete-btn-close"
                onClick={() => setShowPartCompleteModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Settings Modal */}
      <QuizSplitModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        totalQuestions={questions.length}
        settings={splitSettings}
        masteredIds={masteredIds}
        questions={questions}
        onApply={handleApplySplitSettings}
      />
    </div>
  );
}
