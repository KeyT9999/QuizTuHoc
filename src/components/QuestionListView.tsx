import { useState, useMemo } from 'react';
import type { Question } from '../utils/quizParser';
import { useTheme } from '../context/ThemeContext';
import DongSonDrumSvg from './DongSonDrumSvg';
import ZenTempleWatermark from './ZenTempleWatermark';

interface QuestionListViewProps {
  questions: Question[];
  currentIndex: number;
  masteredIds: number[];
  answers: Record<number, string>;
  submittedIds: number[];
  onSelectQuestion: (index: number) => void;
  onBackToStudy: () => void;
  setTitle?: string;
}

type FilterTab = 'all' | 'mastered' | 'unmastered' | 'answered';

export default function QuestionListView({
  questions,
  currentIndex,
  masteredIds,
  answers,
  submittedIds,
  onSelectQuestion,
  onBackToStudy,
  setTitle,
}: QuestionListViewProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const masteredCount = useMemo(
    () => questions.filter((q) => masteredIds.includes(q.id)).length,
    [questions, masteredIds]
  );

  const answeredCount = useMemo(
    () =>
      questions.filter((q) =>
        q.correctAnswer.length > 1 ? submittedIds.includes(q.id) : answers[q.id] !== undefined
      ).length,
    [questions, answers, submittedIds]
  );

  // Filter questions based on search & tab
  const filteredList = useMemo(() => {
    return questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q, idx }) => {
        // Tab filtering
        const isMastered = masteredIds.includes(q.id);
        const isAnswered =
          q.correctAnswer.length > 1 ? submittedIds.includes(q.id) : answers[q.id] !== undefined;

        if (activeFilter === 'mastered' && !isMastered) return false;
        if (activeFilter === 'unmastered' && isMastered) return false;
        if (activeFilter === 'answered' && !isAnswered) return false;

        // Search filtering
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesIndex = String(idx + 1).includes(query);
          const matchesText = q.text.toLowerCase().includes(query);
          const matchesOptions = q.options.some((opt) => opt.text.toLowerCase().includes(query));
          return matchesIndex || matchesText || matchesOptions;
        }

        return true;
      });
  }, [questions, activeFilter, searchQuery, masteredIds, answers, submittedIds]);

  const displayTitle = setTitle || 'BỘ ĐỀ TRẮC NGHIỆM';

  // Theme-specific headers
  const themeHeadlines = {
    'hon-viet': {
      icon: '🏛️',
      tag: 'KHO TÀNG CỔ THƯ & DI SẢN TRI THỨC',
      title: 'Danh Sách Câu Hỏi Khảo Cứu',
      desc: 'Tra cứu toàn bộ câu hỏi trong bộ đề, theo dõi trạng thái tinh thông và chọn câu để luyện tập ngay.',
    },
    'fantasy-academy': {
      icon: '📜',
      tag: 'CỔ THƯ VIỆN · PHÁP ĐIỂN TRI THỨC',
      title: 'Bí Thư Toàn Bộ Câu Hỏi',
      desc: 'Kho lưu trữ toàn bộ phong ấn câu hỏi học viện. Nhấn vào bất kỳ câu nào để bắt đầu giải mã phong ấn.',
    },
    'cozy-night': {
      icon: '☕',
      tag: 'GÓC HỌC TẬP ĐÊM · THƯ VIỆN CÂU HỎI',
      title: 'Danh Sách Câu Hỏi Tự Học',
      desc: 'Xem nhanh toàn bộ câu hỏi trong không gian yên tĩnh. Chọn câu bạn muốn ôn tập để tiếp tục hành trình.',
    },
    'lotus-zen-sanctuary': {
      icon: '🪷',
      tag: 'TÀNG KINH CÁC · BẢO ĐIỂN TRI THỨC',
      title: 'Kinh Quyển Toàn Bộ Câu Hỏi',
      desc: 'Tra cứu toàn bộ câu hỏi trong kho tàng kinh thư, theo dõi tiến độ giác ngộ và an nhiên chọn câu ôn luyện.',
    },
    default: {
      icon: '📋',
      tag: 'DANH SÁCH CÂU HỎI & TIẾN ĐỘ',
      title: 'Danh Sách Toàn Bộ Câu Hỏi',
      desc: 'Xem danh sách toàn bộ câu hỏi trong bộ đề, tìm kiếm nhanh và chuyển đến câu hỏi bất kỳ.',
    },
  };

  const currentHeadline = themeHeadlines[theme] || themeHeadlines.default;

  return (
    <div className={`theme-qlist-container theme-${theme}`}>
      {theme === 'hon-viet' && (
        <div className="theme-qlist-watermark" aria-hidden="true">
          <DongSonDrumSvg size={640} opacity={0.035} color="#d97706" />
        </div>
      )}
      {theme === 'lotus-zen-sanctuary' && (
        <div className="theme-qlist-watermark" aria-hidden="true">
          <ZenTempleWatermark size={640} opacity={0.045} color="#A77636" />
        </div>
      )}

      {/* Hero Banner */}
      <div className="theme-qlist-hero">
        <div className="theme-qlist-hero-left">
          <span className="theme-qlist-eyebrow">
            <span>{currentHeadline.icon}</span>
            <span>{currentHeadline.tag}</span>
          </span>
          <h2 className="theme-qlist-title">{currentHeadline.title}</h2>
          <p className="theme-qlist-desc">{currentHeadline.desc}</p>
        </div>

        <div className="theme-qlist-stats-pill">
          <div className="theme-qlist-stat-item">
            <span className="stat-label">Tổng số câu</span>
            <span className="stat-value">{questions.length}</span>
          </div>
          <div className="theme-qlist-stat-sep" />
          <div className="theme-qlist-stat-item">
            <span className="stat-label">Đã thuộc</span>
            <span className="stat-value val-mastered">{masteredCount}</span>
          </div>
          <div className="theme-qlist-stat-sep" />
          <div className="theme-qlist-stat-item">
            <span className="stat-label">Đã làm</span>
            <span className="stat-value val-answered">{answeredCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="theme-qlist-toolbar">
        <div className="theme-qlist-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="theme-qlist-search-input"
            placeholder="Tìm theo số câu hoặc từ khóa câu hỏi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="theme-qlist-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="theme-qlist-tabs">
          <button
            type="button"
            className={`theme-qlist-tab ${activeFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Tất cả ({questions.length})
          </button>
          <button
            type="button"
            className={`theme-qlist-tab ${activeFilter === 'mastered' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('mastered')}
          >
            ✓ Đã thuộc ({masteredCount})
          </button>
          <button
            type="button"
            className={`theme-qlist-tab ${activeFilter === 'unmastered' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('unmastered')}
          >
            ◯ Chưa thuộc ({questions.length - masteredCount})
          </button>
          <button
            type="button"
            className={`theme-qlist-tab ${activeFilter === 'answered' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('answered')}
          >
            📝 Đã làm ({answeredCount})
          </button>
        </div>
      </div>

      {/* Question Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="theme-qlist-empty">
          <span className="empty-icon">🔍</span>
          <h3>Không tìm thấy câu hỏi nào phù hợp</h3>
          <p>Thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc "Tất cả".</p>
          <button
            type="button"
            className="theme-qlist-reset-btn"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="theme-qlist-grid">
          {filteredList.map(({ q, idx }) => {
            const isCurrent = idx === currentIndex;
            const isMastered = masteredIds.includes(q.id);
            const isAnswered =
              q.correctAnswer.length > 1 ? submittedIds.includes(q.id) : answers[q.id] !== undefined;

            return (
              <div
                key={q.id}
                className={`theme-qlist-card ${isCurrent ? 'is-current-active' : ''} ${
                  isMastered ? 'is-mastered' : ''
                } ${isAnswered ? 'is-answered' : ''}`}
                onClick={() => onSelectQuestion(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectQuestion(idx);
                  }
                }}
              >
                <div className="card-top-row">
                  <div className="card-q-index">
                    <span className="q-num-badge">#{idx + 1}</span>
                    {isCurrent && <span className="current-dot-tag">Đang học</span>}
                  </div>

                  <div className="card-status-pill">
                    {isMastered ? (
                      <span className="status-tag status-mastered">✓ Đã thuộc</span>
                    ) : isAnswered ? (
                      <span className="status-tag status-answered">📝 Đã làm</span>
                    ) : (
                      <span className="status-tag status-unstudied">◯ Chưa học</span>
                    )}
                  </div>
                </div>

                <div className="card-q-text">{q.text}</div>

                <div className="card-bottom-row">
                  <span className="card-options-count">
                    {q.options.length} phương án · Đáp án: {isMastered || isAnswered ? q.correctAnswer : '???'}
                  </span>
                  <span className="card-action-link">Học câu này →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Back Action */}
      <div className="theme-qlist-floating-footer">
        <button type="button" className="theme-qlist-back-btn" onClick={onBackToStudy}>
          ← Quay lại làm trắc nghiệm ({displayTitle})
        </button>
      </div>
    </div>
  );
}
