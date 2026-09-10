import React from 'react';
import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import type { FlashcardSet } from '../data/flashcardData';
import { calculateCourseProgress, getFlashcardProgress } from '../utils/courseStorage';

interface CourseSelectorProps {
  courses: Course[];
  quizSets: QuizSetInfo[];
  flashcardSets: FlashcardSet[];
  onSelectCourse: (course: Course) => void;
  onSelectFlashcard: (fcSet: FlashcardSet) => void;
  onCreateCourseClick: () => void;
  onDeleteCourse: (courseId: string) => void;
}

export default function CourseSelector({
  courses,
  quizSets,
  flashcardSets,
  onSelectCourse,
  onSelectFlashcard,
  onCreateCourseClick,
  onDeleteCourse,
}: CourseSelectorProps) {
  const handleDeleteCourse = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa môn học "${course.name}" (${course.code}) cùng toàn bộ các đề thi tự tạo thuộc môn này không?`
    );
    if (confirmed) {
      onDeleteCourse(course.id);
    }
  };

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
            <span className="tesla-eyebrow">THƯ VIỆN MÔN HỌC</span>
            <h1>Hôm nay bạn muốn ôn môn nào?</h1>
            <p>Chọn một môn học để xem toàn bộ danh sách đề thi và theo dõi tiến độ ôn tập.</p>
          </div>
          <div className="tesla-set-count">{courses.length} môn học</div>
        </div>

        <div className="tesla-specs-grid">
          {courses.map((course) => {
            // Trường hợp môn Flashcard
            if (course.id === 'flashcard' && flashcardSets.length > 0) {
              const fcSet = flashcardSets[0];
              const { total, known, percent } = getFlashcardProgress(fcSet);
              const isStarted = known > 0;

              return (
                <article
                  key={course.id}
                  className="tesla-spec-column course-flashcard clickable-card"
                  onClick={() => onSelectFlashcard(fcSet)}
                >
                  <div className="tesla-card-topline">
                    <span className="tesla-course-pill">🔄 Thẻ ghi nhớ</span>
                    <span className="tesla-card-arrow" aria-hidden="true">↗</span>
                  </div>

                  <div className="tesla-card-heading">
                    <h2 className="tesla-huge-model-title">FLASHCARD</h2>
                    <p className="tesla-model-sub-tag">{course.name}</p>
                  </div>

                  <p className="tesla-card-description">{course.description}</p>

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
                      <span>Thuật ngữ</span>
                    </div>
                    <div>
                      <strong>{known}</strong>
                      <span>Đã thuộc</span>
                    </div>
                  </div>

                  <div className="tesla-action-area">
                    <button
                      type="button"
                      className="tesla-btn-prominent"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFlashcard(fcSet);
                      }}
                    >
                      <span>{isStarted ? 'Tiếp tục học' : 'Bắt đầu lật thẻ'}</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              );
            }

            // Các môn học bình thường
            const progress = calculateCourseProgress(course.id, quizSets);
            const courseKey = course.code.toLowerCase().replace(/[^a-z0-9]/g, '');

            return (
              <article
                key={course.id}
                className={`tesla-spec-column course-${courseKey} clickable-card`}
                onClick={() => onSelectCourse(course)}
              >
                <div className="tesla-card-topline">
                  <div className="tesla-card-pills-row">
                    <span className="tesla-course-pill">Môn {course.code}</span>
                    {course.isCustom && (
                      <span className="tesla-custom-pill">Tự tạo</span>
                    )}
                  </div>
                  <div className="tesla-topline-actions">
                    {course.isCustom && (
                      <button
                        type="button"
                        className="tesla-btn-delete-course"
                        title="Xóa môn học này"
                        onClick={(e) => handleDeleteCourse(e, course)}
                      >
                        🗑️
                      </button>
                    )}
                    <span className="tesla-card-arrow" aria-hidden="true">↗</span>
                  </div>
                </div>

                <div className="tesla-card-heading">
                  <h2 className="tesla-huge-model-title">{course.code}</h2>
                  <p className="tesla-model-sub-tag">{course.name}</p>
                </div>

                <p className="tesla-card-description">{course.description}</p>

                <div className="tesla-progress-block">
                  <div className="tesla-progress-copy">
                    <span>Tiến độ</span>
                    <strong>{progress.percent}%</strong>
                  </div>
                  <div className="tesla-progress-track">
                    <div className="tesla-progress-fill" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>

                <div className="tesla-card-stats">
                  <div>
                    <strong>{progress.totalSets}</strong>
                    <span>Bộ đề</span>
                  </div>
                  <div>
                    <strong>{progress.totalQuestions}</strong>
                    <span>Câu hỏi</span>
                  </div>
                </div>

                <div className="tesla-action-area">
                  <button
                    type="button"
                    className="tesla-btn-prominent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCourse(course);
                    }}
                  >
                    <span>Xem bộ đề ({progress.totalSets})</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            );
          })}

          {/* Thẻ Tạo môn học mới */}
          <article
            className="tesla-spec-column add-column"
            onClick={onCreateCourseClick}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onCreateCourseClick();
            }}
          >
            <div className="tesla-add-icon">+</div>
            <div className="tesla-add-body">
              <span className="tesla-eyebrow">MÔN HỌC CỦA BẠN</span>
              <h2>Tạo môn học mới</h2>
              <p className="tesla-add-desc">
                Thêm môn học mới để tổ chức, dán đề và theo dõi lộ trình ôn tập của riêng bạn.
              </p>
            </div>
            <div className="tesla-action-area">
              <button
                type="button"
                className="tesla-btn-prominent secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateCourseClick();
                }}
              >
                <span>Tạo môn học</span>
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
