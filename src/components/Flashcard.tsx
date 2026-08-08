import { useState, useEffect, useCallback } from 'react';
import type { FlashcardSet } from '../data/flashcardData';

interface FlashcardProps {
  flashcardSet: FlashcardSet;
  onBack: () => void;
}

export default function Flashcard({ flashcardSet, onBack }: FlashcardProps) {
  const { cards, title } = flashcardSet;
  const storageKey = `keyt_flashcard_known_${flashcardSet.id}`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [shuffled, setShuffled] = useState(false);
  const [displayCards, setDisplayCards] = useState(cards);

  // Save known progress
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...knownIds]));
  }, [knownIds, storageKey]);

  // Shuffle function
  const shuffleCards = useCallback(() => {
    const shuffledArr = [...cards].sort(() => Math.random() - 0.5);
    setDisplayCards(shuffledArr);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffled(true);
  }, [cards]);

  const unshuffleCards = useCallback(() => {
    setDisplayCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffled(false);
  }, [cards]);

  const currentCard = displayCards[currentIndex];
  const totalCards = displayCards.length;
  const knownCount = knownIds.size;
  const progressPercent = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;

  const goNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, totalCards]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  const toggleKnown = useCallback(() => {
    setKnownIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentCard.id)) {
        next.delete(currentCard.id);
      } else {
        next.add(currentCard.id);
      }
      return next;
    });
  }, [currentCard]);

  const resetProgress = useCallback(() => {
    setKnownIds(new Set());
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd') goNext();
      else if (e.key === 'ArrowLeft' || e.key === 'a') goPrev();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleFlip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, toggleFlip]);

  const isKnown = knownIds.has(currentCard?.id);

  return (
    <div className="fc-wrapper">
      {/* Header */}
      <header className="fc-header">
        <div className="fc-header-left">
          <button type="button" className="fc-back-btn" onClick={onBack}>
            ← Quay lại
          </button>
          <div className="fc-header-info">
            <h1 className="fc-title">{title}</h1>
            <span className="fc-counter">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>
        </div>
        <div className="fc-header-right">
          <span className="fc-known-badge">
            ✓ {knownCount}/{totalCards} đã thuộc
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="fc-progress-bar">
        <div
          className="fc-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main card area */}
      <main className="fc-main">
        <div className="fc-card-container">
          <div
            className={`fc-card ${isFlipped ? 'fc-card--flipped' : ''}`}
            onClick={toggleFlip}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? 'Hiển thị thuật ngữ' : 'Hiển thị giải thích'}
          >
            <div className="fc-card-face fc-card-front">
              <span className="fc-card-label">THUẬT NGỮ</span>
              <p className="fc-card-text">{currentCard?.term}</p>
              <span className="fc-card-hint">Nhấn để lật thẻ</span>
            </div>
            <div className="fc-card-face fc-card-back">
              <span className="fc-card-label">GIẢI THÍCH</span>
              <p className="fc-card-text fc-card-text--def">
                {currentCard?.definition}
              </p>
              <span className="fc-card-hint">Nhấn để xem thuật ngữ</span>
            </div>
          </div>
        </div>

        {/* Controls under card */}
        <div className="fc-controls">
          <button
            type="button"
            className="fc-ctrl-btn"
            onClick={goPrev}
            disabled={currentIndex === 0}
            aria-label="Thẻ trước"
          >
            ‹
          </button>

          <div className="fc-ctrl-center">
            <button
              type="button"
              className={`fc-known-btn ${isKnown ? 'fc-known-btn--active' : ''}`}
              onClick={toggleKnown}
            >
              {isKnown ? '✓ Đã thuộc' : '○ Đánh dấu đã thuộc'}
            </button>
          </div>

          <button
            type="button"
            className="fc-ctrl-btn"
            onClick={goNext}
            disabled={currentIndex === totalCards - 1}
            aria-label="Thẻ sau"
          >
            ›
          </button>
        </div>

        {/* Toolbar */}
        <div className="fc-toolbar">
          <button
            type="button"
            className="fc-tool-btn"
            onClick={shuffled ? unshuffleCards : shuffleCards}
          >
            {shuffled ? '↺ Về thứ tự gốc' : '🔀 Trộn thẻ'}
          </button>
          <button
            type="button"
            className="fc-tool-btn fc-tool-btn--danger"
            onClick={resetProgress}
          >
            ↻ Xoá tiến độ
          </button>
        </div>

        {/* Mini card dots */}
        <div className="fc-dots">
          {displayCards.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              className={`fc-dot ${idx === currentIndex ? 'fc-dot--active' : ''} ${knownIds.has(card.id) ? 'fc-dot--known' : ''}`}
              onClick={() => {
                setCurrentIndex(idx);
                setIsFlipped(false);
              }}
              aria-label={`Thẻ ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Keyboard hint */}
        <p className="fc-keyboard-hint">
          ⌨ Dùng phím <kbd>←</kbd> <kbd>→</kbd> để chuyển thẻ, <kbd>Space</kbd> để lật
        </p>
      </main>
    </div>
  );
}
