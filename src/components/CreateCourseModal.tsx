import React, { useState } from 'react';
import type { Course } from '../data/courses';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: (course: Course) => void;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onCreateCourse,
}: CreateCourseModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedCode) {
      setError('Vui lòng nhập mã môn học (ví dụ: PRN231, MAS291).');
      return;
    }
    if (!trimmedName) {
      setError('Vui lòng nhập tên đầy đủ của môn học.');
      return;
    }

    const cleanCode = trimmedCode.toUpperCase();
    const slug = cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newCourse: Course = {
      id: `custom_course_${slug}_${Date.now()}`,
      code: cleanCode,
      name: trimmedName,
      description: trimmedDesc || `Môn học ${cleanCode} do bạn tạo`,
      isCustom: true,
      createdAt: Date.now(),
    };

    onCreateCourse(newCourse);
    setCode('');
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div className="keyt-modal-backdrop" onClick={onClose}>
      <div
        className="keyt-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="keyt-modal-header">
          <div>
            <span className="keyt-modal-eyebrow">QUẢN LÝ MÔN HỌC</span>
            <h2 className="keyt-modal-title">Tạo Môn Học Mới</h2>
          </div>
          <button
            type="button"
            className="keyt-modal-close-btn"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="keyt-modal-form">
          {error && <div className="keyt-modal-error">{error}</div>}

          <div className="keyt-form-group">
            <label htmlFor="course-code">
              Mã môn học <span className="keyt-required">*</span>
            </label>
            <input
              id="course-code"
              type="text"
              placeholder="VD: PRN231, MAS291, CSD201..."
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
          </div>

          <div className="keyt-form-group">
            <label htmlFor="course-name">
              Tên môn học <span className="keyt-required">*</span>
            </label>
            <input
              id="course-name"
              type="text"
              placeholder="VD: Lập trình C# .NET, Xác suất thống kê..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
            />
          </div>

          <div className="keyt-form-group">
            <label htmlFor="course-desc">Mô tả ngắn (tùy chọn)</label>
            <textarea
              id="course-desc"
              rows={3}
              placeholder="VD: Đề thi Final Exam và các bộ câu hỏi ôn tập kỳ SP26..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="keyt-modal-actions">
            <button
              type="button"
              className="keyt-btn-cancel"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="keyt-btn-submit">
              Tạo môn học
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
