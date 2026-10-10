import { useMemo } from 'react';
import type { Question } from '../utils/quizParser';

interface KnowledgeGroupDefinition {
  id: string;
  number: number;
  title: string;
  summary: string;
}

interface KnowledgeGroupPickerProps {
  setId: string;
  questions: Question[];
  onSelectGroup: (groupId: string) => void;
  onBack: () => void;
  groups: KnowledgeGroupDefinition[];
  getGroupId: (question: Question) => string;
  courseLabel: string;
}

export default function KnowledgeGroupPicker({
  setId,
  questions,
  onSelectGroup,
  onBack,
  groups,
  getGroupId,
  courseLabel,
}: KnowledgeGroupPickerProps) {
  const groupProgress = useMemo(() => {
    const groupedQuestions = new Map<string, Question[]>();
    for (const question of questions) {
      const groupId = getGroupId(question);
      const groupQuestions = groupedQuestions.get(groupId) ?? [];
      groupQuestions.push(question);
      groupedQuestions.set(groupId, groupQuestions);
    }

    return new Map(groups.map((group) => {
      const groupQuestions = groupedQuestions.get(group.id) ?? [];
      let masteredIds = new Set<number>();

      try {
        const saved = localStorage.getItem(`keyt_quiz_mastered_${setId}_group_${group.id}`);
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        if (Array.isArray(parsed)) {
          masteredIds = new Set(parsed.filter((id): id is number => Number.isSafeInteger(id)));
        }
      } catch {
        // Treat unavailable or malformed progress as not started.
      }

      const count = groupQuestions.length;
      const mastered = groupQuestions.filter((question) => masteredIds.has(question.id)).length;
      const percent = count > 0 ? Math.min(100, Math.round((mastered / count) * 100)) : 0;
      const status = count === 0
        ? 'Chưa có câu hỏi'
        : mastered === 0
          ? 'Chưa học'
          : mastered >= count
            ? 'Đã học'
            : 'Đang học';

      return [group.id, { count, mastered, percent, status }];
    }));
  }, [getGroupId, groups, questions, setId]);

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
          <span className="knowledge-groups-eyebrow">{courseLabel} · HỌC THEO CHỦ ĐỀ</span>
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

        <div className="knowledge-groups-grid" aria-label={`Danh sách ${groups.length} nhóm kiến thức ${courseLabel}`}>
          {groups.map((group) => {
            const progress = groupProgress.get(group.id) ?? {
              count: 0,
              mastered: 0,
              percent: 0,
              status: 'Chưa có câu hỏi',
            };

            return (
              <button
                key={group.id}
                type="button"
                className="knowledge-group-card"
                onClick={() => onSelectGroup(group.id)}
                disabled={progress.count === 0}
                aria-label={`Học nhóm ${group.number}: ${group.title}, ${progress.count} câu hỏi, ${progress.mastered} câu đã học, ${progress.percent}% hoàn thành, ${progress.status}`}
              >
                <span className="knowledge-group-card-heading">
                  <span className="knowledge-group-number">NHÓM {String(group.number).padStart(2, '0')}</span>
                  <span className={`knowledge-group-status ${progress.percent === 100 ? 'complete' : progress.percent > 0 ? 'in-progress' : ''}`}>
                    {progress.status}
                  </span>
                </span>
                <span className="knowledge-group-title">{group.title}</span>
                <span className="knowledge-group-summary">{group.summary}</span>
                <span className="knowledge-group-progress-copy">
                  <span>{progress.mastered}/{progress.count} câu đã học</span>
                  <span>{progress.percent}%</span>
                </span>
                <span
                  className="knowledge-group-progress-track"
                  role="progressbar"
                  aria-label={`Tiến độ nhóm ${group.number}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress.percent}
                >
                  <span style={{ width: `${progress.percent}%` }} />
                </span>
                <span className="knowledge-group-footer">
                  <span>{progress.count} câu hỏi</span>
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
