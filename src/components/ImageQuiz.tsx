import { useEffect, useState } from 'react';
import { MLN_RESEARCH_ANSWER_KEYS, MLN_RESEARCH_UNCERTAIN } from '../data/mlnResearchAnswerKeys';

interface ImageQuizProps {
  setId: string;
  setTitle: string;
  imageBasePath: string;
  imageCount: number;
  imageExtension: string;
  onComplete: () => void;
  onBack: () => void;
}

const BASE_ANSWER_OPTIONS = ['A', 'B', 'C', 'D'];

function sortAnswer(answer: string) {
  return answer.split('').sort().join('');
}

export default function ImageQuiz({
  setId,
  setTitle,
  imageBasePath,
  imageCount,
  imageExtension,
  onComplete,
  onBack,
}: ImageQuizProps) {
  const key = MLN_RESEARCH_ANSWER_KEYS[setId];
  const uncertainQuestions = MLN_RESEARCH_UNCERTAIN[setId] ?? [];
  const indexKey = `keyt_image_quiz_index_${setId}`;
  const masteredKey = `keyt_image_quiz_mastered_${setId}`;
  const answersKey = `keyt_image_quiz_answers_${setId}`;
  const submittedKey = `keyt_image_quiz_submitted_${setId}`;

  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = Number(localStorage.getItem(indexKey));
    return Number.isInteger(saved) && saved >= 0 && saved < imageCount ? saved : 0;
  });
  const [masteredIds, setMasteredIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(masteredKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(answersKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [submittedIds, setSubmittedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(submittedKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);

  useEffect(() => localStorage.setItem(indexKey, String(currentIndex)), [currentIndex, indexKey]);
  useEffect(() => localStorage.setItem(masteredKey, JSON.stringify(masteredIds)), [masteredIds, masteredKey]);
  useEffect(() => localStorage.setItem(answersKey, JSON.stringify(answers)), [answers, answersKey]);
  useEffect(() => localStorage.setItem(submittedKey, JSON.stringify(submittedIds)), [submittedIds, submittedKey]);

  const questionNumber = currentIndex + 1;
  const researchAnswer = key?.[currentIndex] ?? '?';
  const answerOptions = researchAnswer.includes('E')
    ? [...BASE_ANSWER_OPTIONS, 'E']
    : BASE_ANSWER_OPTIONS;
  const isUnresolved = researchAnswer === '?';
  const isMultipleChoice = !isUnresolved && researchAnswer.length > 1;
  const selectedAnswer = answers[questionNumber] ?? '';
  const isAnswered = submittedIds.includes(questionNumber);
  const isMastered = masteredIds.includes(questionNumber);
  const isCorrect = !isUnresolved && selectedAnswer === researchAnswer;
  const answerCount = Object.keys(answers).length;
  const researchedCount = key?.filter((answer) => answer !== '?').length ?? 0;
  const imageUrl = `${imageBasePath}/Q${questionNumber}.${imageExtension}`;
  const percent = Math.round((masteredIds.length / imageCount) * 100);
  const uncertainSet = new Set(uncertainQuestions);

  const markMastered = () => {
    if (!isMastered) setMasteredIds((previous) => [...previous, questionNumber]);
  };

  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return;

    const nextAnswer = isMultipleChoice
      ? sortAnswer(selectedAnswer.includes(option)
        ? selectedAnswer.replace(option, '')
        : `${selectedAnswer}${option}`)
      : option;

    setAnswers((previous) => ({ ...previous, [questionNumber]: nextAnswer }));

    if (!isMultipleChoice) {
      setSubmittedIds((previous) => [...new Set([...previous, questionNumber])]);
      if (!isUnresolved && nextAnswer === researchAnswer) markMastered();
    }
  };

  const handleCheckMultiple = () => {
    if (!selectedAnswer || isAnswered) return;
    setSubmittedIds((previous) => [...new Set([...previous, questionNumber])]);
    if (selectedAnswer === researchAnswer) markMastered();
  };

  const toggleMastered = () => {
    setMasteredIds((previous) => previous.includes(questionNumber)
      ? previous.filter((id) => id !== questionNumber)
      : [...previous, questionNumber]);
  };

  const handleNext = () => {
    if (currentIndex < imageCount - 1) setCurrentIndex((previous) => previous + 1);
    else onComplete();
  };

  const handleResetProgress = () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ tiến trình học và bắt đầu lại từ đầu?')) return;
    setCurrentIndex(0);
    setAnswers({});
    setMasteredIds([]);
    setSubmittedIds([]);
    localStorage.removeItem(indexKey);
    localStorage.removeItem(answersKey);
    localStorage.removeItem(masteredKey);
    localStorage.removeItem(submittedKey);
  };

  if (imageCount === 0) return null;

  return (
    <div className="fuo-quiz-wrapper">
      <div className="fuo-header-banner">
        <div className="mln-header-title-group">
          <span className="fuo-header-title">{setTitle.toUpperCase()}</span>
          <span className="fuo-learned-badge">
            ✓ Đã học: {masteredIds.length}/{imageCount} ({percent}%)
          </span>
        </div>

        <div className="fuo-header-controls">
          <button type="button" className="fuo-btn-text" onClick={() => setShowQuestionGrid((previous) => !previous)}>
            📋 Danh sách câu ({questionNumber}/{imageCount})
          </button>
          <button type="button" className="fuo-btn-text" onClick={handleResetProgress}>
            🔄 Học lại từ đầu
          </button>
          <button type="button" className="fuo-btn-text" onClick={onBack}>
            ← Đổi bộ đề
          </button>
        </div>
      </div>

      <div className="mln-progress-strip">
        <span>Đã chọn: {answerCount}/{imageCount}</span>
        <span>Đáp án nghiên cứu: {researchedCount}/{imageCount}</span>
        <span className="mln-review-hint">Các câu đánh dấu cần kiểm tra sẽ không tự tính “đã học”.</span>
      </div>

      {showQuestionGrid && (
        <div className="fuo-grid-modal">
          <div className="fuo-grid-header">
            <strong>Danh sách câu hỏi & tiến độ</strong>
            <button type="button" className="fuo-btn-text" onClick={() => setShowQuestionGrid(false)}>✕ Đóng</button>
          </div>
          <div className="fuo-grid-items">
            {Array.from({ length: imageCount }, (_, index) => {
              const qNum = index + 1;
              const answered = submittedIds.includes(qNum);
              const selected = answers[qNum];
              let className = 'fuo-grid-item';
              if (index === currentIndex) className += ' active';
              if (masteredIds.includes(qNum)) className += ' mastered';
              else if (answered) className += ' answered';
              if (uncertainSet.has(qNum)) className += ' needs-review';

              return (
                <button
                  key={qNum}
                  type="button"
                  className={className}
                  onClick={() => {
                    setCurrentIndex(index);
                    setShowQuestionGrid(false);
                  }}
                  title={`Câu ${qNum}${selected ? ` - đã chọn ${selected}` : ''}`}
                >
                  {qNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="fuo-content-area mln-content-area">
        <div className="mln-question-heading">
          <div className="fuo-question-text">
            <strong>Câu {questionNumber}:</strong> Luyện câu hỏi trong ảnh; chọn đáp án bên dưới.
          </div>
          <button
            type="button"
            className={`fuo-toggle-mastered-btn ${isMastered ? 'is-mastered' : ''}`}
            onClick={toggleMastered}
          >
            {isMastered ? '✓ Đã học' : '📖 Đánh dấu đã học'}
          </button>
        </div>

        <div className="mln-image-question-card">
          <img src={imageUrl} alt={`${setTitle} - câu ${questionNumber}`} />
        </div>

        <div className="mln-answer-instruction">
          {isMultipleChoice ? 'Câu này có nhiều đáp án: chọn đủ phương án rồi bấm “Kiểm tra đáp án”.' : 'Bấm vào chữ cái của đáp án bạn chọn.'}
        </div>

        <div className="fuo-options-list mln-answer-options" aria-label="Các phương án trả lời">
          {answerOptions.map((option) => {
            const selected = selectedAnswer.includes(option);
            const correct = !isUnresolved && researchAnswer.includes(option);
            let statusClass = '';
            if (isAnswered) {
              if (correct) statusClass = 'fuo-opt-correct';
              else if (selected) statusClass = 'fuo-opt-incorrect';
              else statusClass = 'fuo-opt-dimmed';
            }

            return (
              <button
                key={option}
                type="button"
                className={`fuo-option-item mln-answer-option ${selected ? 'selected' : ''} ${statusClass}`}
                onClick={() => handleSelectAnswer(option)}
                disabled={isAnswered}
                aria-pressed={selected}
              >
                <span className="fuo-option-label">{option}.</span>
                <span className="fuo-option-content">Đáp án {option}</span>
                {isAnswered && correct && <span aria-label="đáp án đúng">✓</span>}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="fuo-instant-result mln-result-message" role="status">
            {isUnresolved ? (
              <span className="mln-txt-review">⚠ Chưa có đáp án nghiên cứu chắc chắn cho câu này.</span>
            ) : isCorrect ? (
              <span className="fuo-txt-success">✓ Đáp án chính xác</span>
            ) : (
              <span className="fuo-txt-error">✗ Sai! Đáp án nghiên cứu là {researchAnswer}</span>
            )}
          </div>
        )}

        <div className="fuo-action-bar">
          <button type="button" className="fuo-nav-btn" onClick={() => setCurrentIndex((previous) => previous - 1)} disabled={currentIndex === 0}>
            ← Câu trước
          </button>
          {isMultipleChoice && !isAnswered && (
            <button type="button" className="fuo-nav-btn fuo-primary" onClick={handleCheckMultiple} disabled={!selectedAnswer}>
              Kiểm tra đáp án
            </button>
          )}
          <button type="button" className="fuo-nav-btn fuo-primary" onClick={handleNext}>
            {currentIndex === imageCount - 1 ? 'Hoàn tất' : 'Câu tiếp'} →
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
