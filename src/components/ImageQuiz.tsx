import { useEffect, useState } from 'react';

interface ImageQuizProps {
  setId: string;
  setTitle: string;
  imageBasePath: string;
  imageCount: number;
  imageExtension: string;
  onComplete: () => void;
  onBack: () => void;
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
  const indexKey = `keyt_image_quiz_index_${setId}`;
  const masteredKey = `keyt_image_quiz_mastered_${setId}`;

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

  useEffect(() => {
    localStorage.setItem(indexKey, String(currentIndex));
  }, [currentIndex, indexKey]);

  useEffect(() => {
    localStorage.setItem(masteredKey, JSON.stringify(masteredIds));
  }, [masteredIds, masteredKey]);

  const markCurrentAsViewed = () => {
    const questionNumber = currentIndex + 1;
    if (masteredIds.includes(questionNumber)) return;
    const nextMasteredIds = [...masteredIds, questionNumber];
    setMasteredIds(nextMasteredIds);
    localStorage.setItem(masteredKey, JSON.stringify(nextMasteredIds));
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
    setCurrentIndex(0);
    setMasteredIds([]);
    localStorage.removeItem(indexKey);
    localStorage.removeItem(masteredKey);
  };

  if (imageCount === 0) {
    return null;
  }

  const imageUrl = `${imageBasePath}/Q${currentIndex + 1}.${imageExtension}`;
  const isViewed = masteredIds.includes(currentIndex + 1);
  const percent = Math.round((masteredIds.length / imageCount) * 100);

  return (
    <div className="image-quiz-wrapper">
      <div className="image-quiz-header">
        <div>
          <div className="image-quiz-title">{setTitle}</div>
          <div className="image-quiz-progress">Đã xem: {masteredIds.length}/{imageCount} ({percent}%)</div>
          <div className="image-quiz-note">Luyện từ ảnh · tự đối chiếu đáp án</div>
        </div>
        <div className="image-quiz-actions">
          <button type="button" className="fuo-btn-text" onClick={handleReset}>Học lại từ đầu</button>
          <button type="button" className="fuo-btn-text" onClick={onBack}>Đổi bộ đề</button>
        </div>
      </div>

      <div className="image-quiz-content">
        <div className="image-quiz-toolbar">
          <strong>Câu {currentIndex + 1}/{imageCount}</strong>
          <button
            type="button"
            className={`image-quiz-viewed ${isViewed ? 'is-viewed' : ''}`}
            onClick={markCurrentAsViewed}
          >
            {isViewed ? '✓ Đã xem' : 'Đánh dấu đã xem'}
          </button>
        </div>

        <div className="image-quiz-frame">
          <img src={imageUrl} alt={`${setTitle} - câu ${currentIndex + 1}`} />
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
            {Array.from({ length: imageCount }, (_, index) => (
              <button
                key={index + 1}
                type="button"
                className={`${index === currentIndex ? 'active' : ''} ${masteredIds.includes(index + 1) ? 'viewed' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Câu ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button type="button" className="fuo-nav-btn primary" onClick={handleNext}>
            {currentIndex === imageCount - 1 ? 'Hoàn tất' : 'Câu tiếp theo'} →
          </button>
        </div>
      </div>
    </div>
  );
}
