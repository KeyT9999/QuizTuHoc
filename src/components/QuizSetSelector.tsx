import type { QuizSetInfo } from '../data/quizSets';
import { parseQuizText } from '../utils/quizParser';

interface QuizSetSelectorProps {
  quizSets: QuizSetInfo[];
  onSelectSet: (setInfo: QuizSetInfo) => void;
  onCreateNewSet: () => void;
}

export default function QuizSetSelector({
  quizSets,
  onSelectSet,
  onCreateNewSet,
}: QuizSetSelectorProps) {
  // Helper to calculate progress for a quiz set
  const getSetProgress = (set: QuizSetInfo) => {
    const total = set.kind === 'image' ? (set.imageCount ?? 0) : parseQuizText(set.rawText).length;
    if (total === 0) return { total: 0, mastered: 0, percent: 0 };

    try {
      const storageKey = set.kind === 'image'
        ? `keyt_image_quiz_mastered_${set.id}`
        : `keyt_quiz_mastered_${set.id}`;
      const savedMastered = localStorage.getItem(storageKey);
      let masteredIds: number[] = [];
      if (savedMastered) {
        masteredIds = JSON.parse(savedMastered);
      } else if (set.id === 'cchn_426' || set.id === 'ccnc_426') {
        const legacyMastered = localStorage.getItem('keyt_quiz_mastered');
        if (legacyMastered) masteredIds = JSON.parse(legacyMastered);
      }
      const mastered = masteredIds.length;
      const percent = Math.round((mastered / total) * 100);
      return { total, mastered, percent };
    } catch {
      return { total, mastered: 0, percent: 0 };
    }
  };

  const orderedQuizSets = [...quizSets].sort((a, b) => {
    const getRank = (set: QuizSetInfo) => {
      if (set.id.includes('pmg201c') || set.title.includes('PMG201c')) return 0;
      if (set.id.includes('swd392') || set.title.includes('SWD392')) return 1;
      return 2;
    };
    return getRank(a) - getRank(b);
  });

  return (
    <div className="tesla-container">
      {/* Top Header - Minimalist KeyT Logo */}
      <header className="tesla-nav">
        <div className="tesla-logo-mark">K</div>
        <div>
          <div className="tesla-logo">KEYT</div>
          <div className="tesla-logo-caption">Quiz tự học</div>
        </div>
      </header>

      <main className="tesla-main-content">
        <div className="tesla-page-heading">
          <div>
            <span className="tesla-eyebrow">THƯ VIỆN BỘ ĐỀ</span>
            <h1>Hôm nay bạn muốn học gì?</h1>
            <p>Chọn một bộ đề để tiếp tục ôn tập và theo dõi tiến độ của bạn.</p>
          </div>
          <div className="tesla-set-count">{quizSets.length} bộ đề</div>
        </div>

        <div className="tesla-specs-grid">
          {orderedQuizSets.map((set) => {
            const { total, mastered, percent } = getSetProgress(set);
            const isStarted = mastered > 0;
            // Get short name (e.g. CCHN, SWD392)
            const shortName = set.id.includes('pmg201c') || set.title.includes('PMG201c')
              ? 'PMG201c'
              : set.id.includes('cchn') || set.title.includes('CCHN')
              ? 'CCHN'
              : set.id.includes('swd') || set.title.includes('SWD')
              ? 'SWD392'
              : set.title.split(' ')[0];
            const courseKey = shortName.toLowerCase().replace(/[^a-z0-9]/g, '');

            return (
              <article key={set.id} className={`tesla-spec-column course-${courseKey}`}>
                <div className="tesla-card-topline">
                  <span className="tesla-course-pill">{set.category}</span>
                  <span className="tesla-card-arrow" aria-hidden="true">↗</span>
                </div>

                <div className="tesla-card-heading">
                  <h2 className="tesla-huge-model-title">{shortName}</h2>
                  <p className="tesla-model-sub-tag">{set.title}</p>
                </div>

                <p className="tesla-card-description">{set.description}</p>

                <div className="tesla-progress-block">
                  <div className="tesla-progress-copy">
                    <span>Tiến độ</span>
                    <strong>{percent}%</strong>
                  </div>
                  <div className="tesla-progress-track">
                    <div className="tesla-progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                <div className="tesla-card-stats">
                  <div>
                    <strong>{total}</strong>
                    <span>Câu hỏi</span>
                  </div>
                  <div>
                    <strong>{mastered}</strong>
                    <span>Đã học</span>
                  </div>
                </div>

                <div className="tesla-action-area">
                  <button
                    type="button"
                    className="tesla-btn-prominent"
                    onClick={() => onSelectSet(set)}
                  >
                    <span>{isStarted ? 'Tiếp tục học' : 'Bắt đầu học'}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            );
          })}

          <article className="tesla-spec-column add-column" onClick={onCreateNewSet}>
            <div className="tesla-add-icon">+</div>
            <div className="tesla-add-body">
              <span className="tesla-eyebrow">BỘ ĐỀ CỦA BẠN</span>
              <h2>Tạo bộ đề mới</h2>
              <p className="tesla-add-desc">
                Dán câu hỏi và đáp án của riêng bạn để tạo một buổi ôn tập mới.
              </p>
            </div>
            <div className="tesla-action-area">
              <button type="button" className="tesla-btn-prominent secondary">
                <span>Tạo bộ đề</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="tesla-footer">
        <div className="tesla-footer-links">
          <span>KEYT © 2026</span>
          <a href="#privacy">Privacy & Legal</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}
