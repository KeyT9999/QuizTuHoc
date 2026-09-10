import React from 'react';
import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import { getQuizSetProgress, calculateCourseProgress } from '../utils/courseStorage';

interface CourseQuizListProps {
  course: Course;
  quizSets: QuizSetInfo[];
  onSelectSet: (set: QuizSetInfo) => void;
  onBack: () => void;
  onCreateQuizSet: () => void;
  onDeleteQuizSet?: (setId: string) => void;
}

export default function CourseQuizList({
  course,
  quizSets,
  onSelectSet,
  onBack,
  onCreateQuizSet,
  onDeleteQuizSet,
}: CourseQuizListProps) {
  // Lọc tất cả các đề thuộc môn hiện tại
  const courseSets = quizSets.filter((set) => set.courseId === course.id);
  const courseProgress = calculateCourseProgress(course.id, quizSets);

  const handleDeleteSet = (e: React.MouseEvent, set: QuizSetInfo) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bộ đề "${set.title}" không?`
    );
    if (confirmed && onDeleteQuizSet) {
      onDeleteQuizSet(set.id);
    }
  };

  return (
    <div className="tesla-container">
      {/* Top Header with Back Button */}
      <header className="tesla-nav">
        <button
          type="button"
          className="keyt-back-nav-btn"
          onClick={onBack}
        >
          <span className="keyt-back-arrow">←</span>
          <span>Danh sách môn học</span>
        </button>

        <div className="keyt-brand-compact">
          <div className="tesla-logo-mark">K</div>
          <span className="tesla-logo">KEYT</span>
        </div>
      </header>

      <main className="tesla-main-content">
        {/* Banner thông tin môn học */}
        <div className="tesla-page-heading course-detail-heading">
          <div>
            <div className="course-code-badge-large">{course.code}</div>
            <h1>{course.name}</h1>
            <p>{course.description}</p>
          </div>
          <div className="course-stats-panel">
            <div className="course-stat-item">
              <span className="course-stat-val">{courseSets.length}</span>
              <span className="course-stat-lbl">Bộ đề</span>
            </div>
            <div className="course-stat-item">
              <span className="course-stat-val">{courseProgress.totalQuestions}</span>
              <span className="course-stat-lbl">Câu hỏi</span>
            </div>
            <div className="course-stat-item">
              <span className="course-stat-val">{courseProgress.percent}%</span>
              <span className="course-stat-lbl">Tiến độ</span>
            </div>
          </div>
        </div>

        {/* Thanh tiến độ tổng quan môn học */}
        <div className="course-overall-progress-bar">
          <div className="course-overall-track">
            <div
              className="course-overall-fill"
              style={{ width: `${courseProgress.percent}%` }}
            />
          </div>
          <div className="course-overall-text">
            <span>
              Đã học {courseProgress.masteredQuestions} / {courseProgress.totalQuestions} câu hỏi
            </span>
            <strong>{courseProgress.percent}% hoàn thành</strong>
          </div>
        </div>

        {/* Danh sách đề thi */}
        <div className="tesla-specs-grid">
          {courseSets.map((set) => {
            const { total, mastered, percent } = getQuizSetProgress(set);
            const isStarted = mastered > 0;
            const isCustom = set.id.startsWith('custom_') || set.category === 'Bộ đề tự tạo';

            return (
              <article
                key={set.id}
                className="tesla-spec-column clickable-card"
                onClick={() => onSelectSet(set)}
              >
                <div className="tesla-card-topline">
                  <span className="tesla-course-pill">
                    {set.badge || set.category || course.code}
                  </span>
                  <div className="tesla-topline-actions">
                    {isCustom && onDeleteQuizSet && (
                      <button
                        type="button"
                        className="tesla-btn-delete-course"
                        title="Xóa bộ đề này"
                        onClick={(e) => handleDeleteSet(e, set)}
                      >
                        🗑️
                      </button>
                    )}
                    <span className="tesla-card-arrow" aria-hidden="true">↗</span>
                  </div>
                </div>

                <div className="tesla-card-heading">
                  <h2 className="tesla-huge-model-title">{set.title}</h2>
                  <p className="tesla-model-sub-tag">{set.category}</p>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSet(set);
                    }}
                  >
                    <span>{isStarted ? 'Tiếp tục học' : 'Bắt đầu học'}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            );
          })}

          {/* Thẻ Thêm đề mới cho môn này */}
          <article
            className="tesla-spec-column add-column"
            onClick={onCreateQuizSet}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onCreateQuizSet();
            }}
          >
            <div className="tesla-add-icon">+</div>
            <div className="tesla-add-body">
              <span className="tesla-eyebrow">THÊM ĐỀ MỚI</span>
              <h2>Tạo đề thi mới</h2>
              <p className="tesla-add-desc">
                Dán câu hỏi và đáp án để tạo thêm một bộ đề ôn thi cho môn {course.code}.
              </p>
            </div>
            <div className="tesla-action-area">
              <button
                type="button"
                className="tesla-btn-prominent secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateQuizSet();
                }}
              >
                <span>Dán đề thi</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        </div>

        {/* Trạng thái môn chưa có đề nào */}
        {courseSets.length === 0 && (
          <div className="keyt-empty-course-state">
            <div className="keyt-empty-icon">📂</div>
            <h3>Môn này hiện chưa có đề thi nào</h3>
            <p>
              Hãy bấm vào thẻ <strong>"Tạo đề thi mới"</strong> ở trên để dán danh sách câu hỏi và đáp án cho môn {course.name}.
            </p>
          </div>
        )}
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
