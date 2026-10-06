import { useMemo } from 'react';
import type { Question } from '../utils/quizParser';
import { getMln111KnowledgeGroupId, MLN111_KNOWLEDGE_GROUPS } from '../data/mln111KnowledgeGroups';

interface KnowledgeGroupPickerProps {
  questions: Question[];
  onSelectGroup: (groupId: string) => void;
  onBack: () => void;
}

export default function KnowledgeGroupPicker({
  questions,
  onSelectGroup,
  onBack,
}: KnowledgeGroupPickerProps) {
  const questionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const question of questions) {
      const groupId = getMln111KnowledgeGroupId(question);
      counts.set(groupId, (counts.get(groupId) ?? 0) + 1);
    }
    return counts;
  }, [questions]);

  return (
    <div className="tesla-container knowledge-groups-page">
      <header className="tesla-nav">
        <button type="button" className="keyt-back-nav-btn" onClick={onBack}>
          <span className="keyt-back-arrow">←</span>
          <span>Quay lại bài học</span>
        </button>

        <div className="keyt-brand-compact">
          <div className="tesla-logo-mark">K</div>
          <span className="tesla-logo">KEYT</span>
        </div>
      </header>

      <main className="tesla-main-content">
        <section className="knowledge-groups-heading" aria-labelledby="knowledge-groups-title">
          <span className="knowledge-groups-eyebrow">MLN111 · HỌC THEO CHỦ ĐỀ</span>
          <h1 id="knowledge-groups-title">Chọn nhóm kiến thức</h1>
          <p>
            Chọn một chủ đề để tập trung ôn từng phần trong bộ đề tổng hợp.
          </p>
          <div className="knowledge-groups-note">
            <span aria-hidden="true">ℹ️</span>
            <span>
              Câu hỏi có thể liên quan nhiều chủ đề; mỗi câu được xếp theo kiến thức chính đang kiểm tra.
              Nội dung câu hỏi, phương án và đáp án lấy nguyên từ bộ đề.
            </span>
          </div>
        </section>

        <div className="knowledge-groups-grid" aria-label="Danh sách 16 nhóm kiến thức">
          {MLN111_KNOWLEDGE_GROUPS.map((group) => {
            const count = questionCounts.get(group.id) ?? 0;

            return (
              <button
                key={group.id}
                type="button"
                className="knowledge-group-card"
                onClick={() => onSelectGroup(group.id)}
                disabled={count === 0}
                aria-label={`Học nhóm ${group.number}: ${group.title}, ${count} câu hỏi`}
              >
                <span className="knowledge-group-number">NHÓM {String(group.number).padStart(2, '0')}</span>
                <span className="knowledge-group-title">{group.title}</span>
                <span className="knowledge-group-summary">{group.summary}</span>
                <span className="knowledge-group-footer">
                  <span>{count} câu hỏi</span>
                  <span className="knowledge-group-action">Bắt đầu học <span aria-hidden="true">→</span></span>
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
