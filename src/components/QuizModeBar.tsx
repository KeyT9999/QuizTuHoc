import { useState } from 'react';
import { isSoundEnabled, setSoundEnabled } from '../utils/gameStorage';

export type QuizPlayMode =
  | 'study' // Trắc nghiệm chuẩn
  | 'mock_exam' // Thi thử FE
  | 'time_attack' // Đấu trí 60s
  | 'survival_tower' // Leo tháp sinh tồn
  | 'true_false' // Đúng hay Sai 5s
  | 'mistake_buster'; // Diệt câu hay sai

interface QuizModeBarProps {
  activeMode: QuizPlayMode;
  onChangeMode: (mode: QuizPlayMode) => void;
  mistakeCount: number;
  onOpenQuestionGrid: () => void;
}

export default function QuizModeBar({
  activeMode,
  onChangeMode,
  mistakeCount,
  onOpenQuestionGrid,
}: QuizModeBarProps) {
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  return (
    <div className="quiz-mode-hub">
      {/* Study Modes */}
      <button
        type="button"
        className={`quiz-mode-pill-btn ${activeMode === 'study' ? 'is-active' : ''}`}
        onClick={() => onChangeMode('study')}
      >
        <span className="quiz-mode-icon">📝</span>
        <span className="quiz-mode-text">Trắc nghiệm</span>
      </button>

      <button
        type="button"
        className="quiz-mode-pill-btn"
        onClick={onOpenQuestionGrid}
        title="Mở lưới danh sách câu hỏi"
      >
        <span className="quiz-mode-icon">📋</span>
        <span className="quiz-mode-text">Danh sách câu</span>
      </button>

      <button
        type="button"
        className={`quiz-mode-pill-btn ${activeMode === 'mistake_buster' ? 'is-active' : ''}`}
        onClick={() => onChangeMode('mistake_buster')}
      >
        <span className="quiz-mode-icon">🛡️</span>
        <span className="quiz-mode-text">Từ hay sai</span>
        <span
          className={`quiz-mode-badge ${
            mistakeCount > 0 ? 'badge-danger' : 'badge-neutral'
          }`}
        >
          {mistakeCount > 0 ? `${mistakeCount}` : '0'}
        </span>
      </button>

      <button
        type="button"
        className={`quiz-mode-pill-btn ${activeMode === 'mock_exam' ? 'is-active is-exam' : ''}`}
        onClick={() => onChangeMode('mock_exam')}
      >
        <span className="quiz-mode-icon">🎓</span>
        <span className="quiz-mode-text">Thi thử FE</span>
        <span className="quiz-mode-badge badge-exam">FE</span>
      </button>

      {/* Separator */}
      <div className="quiz-mode-separator" />

      {/* Game Modes */}
      <button
        type="button"
        className={`quiz-mode-pill-btn ${activeMode === 'time_attack' ? 'is-active is-hot' : ''}`}
        onClick={() => onChangeMode('time_attack')}
      >
        <span className="quiz-mode-icon">⚡</span>
        <span className="quiz-mode-text">Đấu trí 60s</span>
        <span className="quiz-mode-badge badge-hot">HOT</span>
      </button>

      <button
        type="button"
        className={`quiz-mode-pill-btn ${activeMode === 'survival_tower' ? 'is-active is-royal' : ''}`}
        onClick={() => onChangeMode('survival_tower')}
      >
        <span className="quiz-mode-icon">👑</span>
        <span className="quiz-mode-text">Leo tháp 50</span>
        <span className="quiz-mode-badge badge-tower">SURVIVAL</span>
      </button>

      <button
        type="button"
        className={`quiz-mode-pill-btn ${activeMode === 'true_false' ? 'is-active is-neon' : ''}`}
        onClick={() => onChangeMode('true_false')}
      >
        <span className="quiz-mode-icon">🎯</span>
        <span className="quiz-mode-text">Đúng/Sai 5s</span>
        <span className="quiz-mode-badge badge-blitz">BLITZ</span>
      </button>

      {/* Sound Toggle — Icon Only */}
      <div className="quiz-mode-right-actions">
        <button
          type="button"
          className={`quiz-sound-toggle-btn ${soundOn ? 'sound-on' : 'sound-off'}`}
          onClick={toggleSound}
          title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  );
}
