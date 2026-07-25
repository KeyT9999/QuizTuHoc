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
  const getSetProgress = (setId: string, rawText: string) => {
    const questions = parseQuizText(rawText);
    const total = questions.length;
    if (total === 0) return { total: 0, mastered: 0, percent: 0 };

    try {
      const savedMastered = localStorage.getItem(`keyt_quiz_mastered_${setId}`);
      let masteredIds: number[] = [];
      if (savedMastered) {
        masteredIds = JSON.parse(savedMastered);
      } else if (setId === 'cchn_426' || setId === 'ccnc_426') {
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

  return (
    <div className="tesla-container">
      {/* Top Header - Minimalist KeyT Logo */}
      <header className="tesla-nav">
        <div className="tesla-logo">K E Y T</div>
      </header>

      {/* Main Model Selector Section */}
      <main className="tesla-main-content">
        <div className="tesla-specs-grid">
          {quizSets.map((set) => {
            const { total, mastered, percent } = getSetProgress(set.id, set.rawText);
            const isStarted = mastered > 0;
            // Get short name (e.g. CCHN, SWD392)
            const shortName = set.id.includes('cchn') || set.title.includes('CCHN')
              ? 'CCHN'
              : set.id.includes('swd') || set.title.includes('SWD')
              ? 'SWD392'
              : set.title.split(' ')[0];

            return (
              <div key={set.id} className="tesla-spec-column">
                {/* Big Model Name */}
                <div className="tesla-huge-model-title">{shortName}</div>
                <div className="tesla-model-sub-tag">{set.title}</div>

                <div className="tesla-divider" />

                {/* Metric 1: Total Questions */}
                <div className="tesla-metric-group">
                  <div className="tesla-metric-value">
                    {total} <span className="tesla-metric-unit">câu hỏi</span>
                  </div>
                </div>

                {/* Metric 2: Progress */}
                <div className="tesla-metric-group">
                  <div className="tesla-metric-label">Tiến độ học</div>
                  <div className="tesla-metric-value">
                    {percent}% <span className="tesla-metric-unit">({mastered}/{total} câu)</span>
                  </div>
                </div>

                {/* Metric 3: Category */}
                <div className="tesla-metric-group">
                  <div className="tesla-metric-label">Môn học</div>
                  <div className="tesla-metric-value text-medium">
                    {set.category}
                  </div>
                </div>

                {/* Prominent Tesla Action Button */}
                <div className="tesla-action-area">
                  <button
                    type="button"
                    className="tesla-btn-prominent"
                    onClick={() => onSelectSet(set)}
                  >
                    {isStarted ? 'TIẾP TỤC HỌC' : 'VÀO HỌC NGAY'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Custom Model Box */}
          <div className="tesla-spec-column add-column" onClick={onCreateNewSet}>
            <div className="tesla-huge-model-title" style={{ opacity: 0.4 }}>+ TẠO ĐỀ</div>
            <div className="tesla-model-sub-tag">Nhập bộ đề tùy chọn mới</div>

            <div className="tesla-divider" />

            <div className="tesla-add-body">
              <p className="tesla-add-desc">
                Dán nội dung câu hỏi trắc nghiệm riêng của bạn để làm bài làm tự ôn luyện
              </p>
            </div>

            <div className="tesla-action-area" style={{ marginTop: 'auto' }}>
              <button type="button" className="tesla-btn-prominent secondary">
                + TẠO BỘ ĐỀ MỚI
              </button>
            </div>
          </div>
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
