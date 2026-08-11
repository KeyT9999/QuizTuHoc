import { useEffect, useState } from 'react';

interface ImageQuizProps {
  setId: string;
  setTitle: string;
  imageBasePath: string;
  imageCount: number;
  imageExtension: string;
  imageViewport?: 'left' | 'right';
  onComplete: () => void;
  onBack: () => void;
}

const ANSWER_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ImageQuiz({
  setId,
  setTitle,
  imageBasePath,
  imageCount,
  imageExtension,
  imageViewport = 'left',
  onComplete,
  onBack,
}: ImageQuizProps) {
  const indexKey = `keyt_image_quiz_index_${setId}`;
  const masteredKey = `keyt_image_quiz_mastered_${setId}`;
  const answersKey = `keyt_image_quiz_answers_${setId}`;

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
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    localStorage.setItem(indexKey, String(currentIndex));
  }, [currentIndex, indexKey]);

  useEffect(() => {
    localStorage.setItem(masteredKey, JSON.stringify(masteredIds));
  }, [masteredIds, masteredKey]);

  useEffect(() => {
    localStorage.setItem(answersKey, JSON.stringify(answers));
  }, [answers, answersKey]);

  const questionNumber = currentIndex + 1;

  const markCurrentAsViewed = () => {
    if (masteredIds.includes(questionNumber)) return;
    setMasteredIds((prev) => [...prev, questionNumber]);
  };

  const handleSelectAnswer = (key: string) => {
    const currentAnswer = answers[questionNumber];
    // Toggle: click again to deselect
    if (currentAnswer === key) {
      const newAnswers = { ...answers };
      delete newAnswers[questionNumber];
      setAnswers(newAnswers);
    } else {
      setAnswers((prev) => ({ ...prev, [questionNumber]: key }));
      // Auto-mark as viewed when selecting an answer
      if (!masteredIds.includes(questionNumber)) {
        setMasteredIds((prev) => [...prev, questionNumber]);
      }
    }
  };

  const handleNext = () => {
    markCurrentAsViewed();
    if (currentIndex < imageCount - 1) {
      setCurrentIndex((previous) => previous + 1);
    } else {
      onComplete();
    }
  };

  const handleReset = () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ tiến trình và bắt đầu lại?')) return;
    setCurrentIndex(0);
    setMasteredIds([]);
    setAnswers({});
    localStorage.removeItem(indexKey);
    localStorage.removeItem(masteredKey);
    localStorage.removeItem(answersKey);
  };

  if (imageCount === 0) {
    return null;
  }

  const imageUrl = `${imageBasePath}/Q${questionNumber}.${imageExtension}`;
  const isViewed = masteredIds.includes(questionNumber);
  const selectedAnswer = answers[questionNumber];
  const answeredCount = Object.keys(answers).length;
  const percent = Math.round((masteredIds.length / imageCount) * 100);

  return (
    <div className="image-quiz-wrapper">
      <div className="image-quiz-header">
        <div>
          <div className="image-quiz-title">{setTitle}</div>
          <div className="image-quiz-progress">
            Đã xem: {masteredIds.length}/{imageCount} ({percent}%)
            {answeredCount > 0 && (
              <span style={{ marginLeft: 12, color: '#1a73e8' }}>
                · Đã chọn đáp án: {answeredCount}/{imageCount}
              </span>
            )}
          </div>
          <div className="image-quiz-note">Luyện từ ảnh · chọn đáp án · tự đối chiếu</div>
        </div>
        <div className="image-quiz-actions">
          <button type="button" className="fuo-btn-text" onClick={handleReset}>🔄 Học lại từ đầu</button>
          <button type="button" className="fuo-btn-text" onClick={onBack}>← Đổi bộ đề</button>
        </div>
      </div>

      <div className="image-quiz-content">
        <div className="image-quiz-toolbar">
          <strong>Câu {questionNumber}/{imageCount}</strong>
          <div className="image-quiz-toolbar-actions">
            <button
              type="button"
              className="image-quiz-toggle-image"
              onClick={() => setShowFullImage((previous) => !previous)}
            >
              {showFullImage ? 'Phóng to câu hỏi' : 'Xem toàn ảnh'}
            </button>
            <button
              type="button"
              className={`image-quiz-viewed ${isViewed ? 'is-viewed' : ''}`}
              onClick={markCurrentAsViewed}
            >
              {isViewed ? '✓ Đã xem' : 'Đánh dấu đã xem'}
            </button>
          </div>
        </div>

        <div className={`image-quiz-frame image-quiz-frame--${imageViewport} ${showFullImage ? 'is-full-image' : ''}`}>
          <img src={imageUrl} alt={`${setTitle} - câu ${questionNumber}`} />
        </div>

        {/* Answer Selection Buttons */}
        <div className="image-quiz-answer-bar">
          <span className="image-quiz-answer-label">Chọn đáp án:</span>
          <div className="image-quiz-answer-options">
            {ANSWER_OPTIONS.map((key) => (
              <button
                key={key}
                type="button"
                className={`image-quiz-answer-btn ${selectedAnswer === key ? 'selected' : ''}`}
                onClick={() => handleSelectAnswer(key)}
              >
                {key}
              </button>
            ))}
          </div>
          {selectedAnswer && (
            <span className="image-quiz-answer-chosen">
              ✓ Bạn chọn: <strong>{selectedAnswer}</strong>
            </span>
          )}
        </div>

        <div className="image-quiz-navigation">
          <button
            type="button"
            className="fuo-nav-btn"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((previous) => previous - 1)}
          >
            ← Câu trước
          </button>
          <div className="image-quiz-dots" aria-label="Danh sách câu hỏi">
            {Array.from({ length: imageCount }, (_, index) => {
              const qNum = index + 1;
              const isCurrent = index === currentIndex;
              const isQViewed = masteredIds.includes(qNum);
              const hasAnswer = answers[qNum] !== undefined;

              let className = '';
              if (isCurrent) className += ' active';
              if (isQViewed) className += ' viewed';
              if (hasAnswer) className += ' answered';

              return (
                <button
                  key={qNum}
                  type="button"
                  className={className.trim()}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Câu ${qNum}${hasAnswer ? ` - đã chọn ${answers[qNum]}` : ''}`}
                  title={hasAnswer ? `Đã chọn: ${answers[qNum]}` : `Câu ${qNum}`}
                >
                  {qNum}
                </button>
              );
            })}
          </div>
          <button type="button" className="fuo-nav-btn primary" onClick={handleNext}>
            {currentIndex === imageCount - 1 ? 'Hoàn tất' : 'Câu tiếp theo'} →
          </button>
        </div>
      </div>
    </div>
  );
}
