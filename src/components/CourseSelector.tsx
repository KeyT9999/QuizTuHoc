import React, { useState, useMemo } from 'react';
import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import type { FlashcardSet } from '../data/flashcardData';
import { calculateCourseProgress, getFlashcardProgress } from '../utils/courseStorage';
import PassedBadge from './PassedBadge';
import './CourseSelector.css';

interface CourseSelectorProps {
  courses: Course[];
  quizSets: QuizSetInfo[];
  flashcardSets: FlashcardSet[];
  onSelectCourse: (course: Course) => void;
  onSelectFlashcard: (fcSet: FlashcardSet) => void;
  onCreateCourseClick: () => void;
  onDeleteCourse: (courseId: string) => void;
}

type CategoryType = 'all' | 'politics' | 'economics' | 'pm' | 'it';
type SortType = 'default' | 'name_asc' | 'progress_desc' | 'questions_desc';

interface SubjectTheme {
  primary: string;
  soft: string;
  border: string;
  hoverShadow: string;
  icon: 'book' | 'landmark' | 'folder' | 'code' | 'cloud' | 'globe' | 'tag' | 'cards' | 'grad-cap';
}

function getCourseTheme(courseId: string, courseCode: string): SubjectTheme {
  const code = (courseCode || courseId).toUpperCase();
  if (code.includes('MLN111')) {
    return {
      primary: '#8b5cf6',
      soft: '#f5f3ff',
      border: '#ede9fe',
      hoverShadow: 'rgba(139, 92, 246, 0.16)',
      icon: 'book',
    };
  }
  if (code.includes('MLN122')) {
    return {
      primary: '#3b82f6',
      soft: '#eff6ff',
      border: '#dbeafe',
      hoverShadow: 'rgba(59, 130, 246, 0.16)',
      icon: 'landmark',
    };
  }
  if (code.includes('PMG201')) {
    return {
      primary: '#10b981',
      soft: '#ecfdf5',
      border: '#d1fae5',
      hoverShadow: 'rgba(16, 185, 129, 0.16)',
      icon: 'folder',
    };
  }
  if (code.includes('SWD392')) {
    return {
      primary: '#f97316',
      soft: '#fff7ed',
      border: '#ffedd5',
      hoverShadow: 'rgba(249, 115, 22, 0.16)',
      icon: 'code',
    };
  }
  if (code.includes('SDN302')) {
    return {
      primary: '#06b6d4',
      soft: '#ecfeff',
      border: '#cffafe',
      hoverShadow: 'rgba(6, 182, 212, 0.16)',
      icon: 'cloud',
    };
  }
  if (code.includes('JPD')) {
    return {
      primary: '#ec4899',
      soft: '#fdf2f8',
      border: '#fce7f3',
      hoverShadow: 'rgba(236, 72, 153, 0.16)',
      icon: 'globe',
    };
  }
  if (code.includes('CCHN')) {
    return {
      primary: '#f59e0b',
      soft: '#fffbeb',
      border: '#fef3c7',
      hoverShadow: 'rgba(245, 158, 11, 0.16)',
      icon: 'tag',
    };
  }
  if (courseId === 'flashcard') {
    return {
      primary: '#6366f1',
      soft: '#eef2ff',
      border: '#e0e7ff',
      hoverShadow: 'rgba(99, 102, 241, 0.16)',
      icon: 'cards',
    };
  }
  return {
    primary: '#4f46e5',
    soft: '#eef2ff',
    border: '#e0e7ff',
    hoverShadow: 'rgba(79, 70, 229, 0.16)',
    icon: 'grad-cap',
  };
}

function renderSubjectIcon(iconType: SubjectTheme['icon']) {
  switch (iconType) {
    case 'book':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'landmark':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="22" x2="21" y2="22" />
          <line x1="6" y1="18" x2="6" y2="11" />
          <line x1="10" y1="18" x2="10" y2="11" />
          <line x1="14" y1="18" x2="14" y2="11" />
          <line x1="18" y1="18" x2="18" y2="11" />
          <polygon points="12 2 20 7 4 7" />
        </svg>
      );
    case 'folder':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'code':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'cloud':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
      );
    case 'globe':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'tag':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <circle cx="7" cy="7" r="1.5" />
        </svg>
      );
    case 'cards':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="16" height="14" rx="2" />
          <path d="M6 3h12a2 2 0 0 1 2 2v12" />
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
  }
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [sortOrder, setSortOrder] = useState<SortType>('default');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const handleDeleteCourse = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa môn học "${course.name}" (${course.code}) cùng toàn bộ các đề thi tự tạo thuộc môn này không?`
    );
    if (confirmed) {
      onDeleteCourse(course.id);
    }
  };

  // Helper to categorize course
  const courseMatchesCategory = (c: Course, category: CategoryType) => {
    if (category === 'all') return true;
    const text = `${c.code} ${c.name} ${c.description}`.toLowerCase();
    if (category === 'politics') {
      return text.includes('mln111') || text.includes('mln122') || text.includes('mác') || text.includes('lênin') || text.includes('chính trị') || text.includes('triết học');
    }
    if (category === 'economics') {
      return text.includes('mln122') || text.includes('cchn') || text.includes('kinh tế') || text.includes('marketing') || text.includes('thương hiệu');
    }
    if (category === 'pm') {
      return text.includes('pmg') || text.includes('quản lý dự án') || text.includes('project');
    }
    if (category === 'it') {
      return text.includes('swd') || text.includes('sdn') || text.includes('software') || text.includes('cloud') || text.includes('kiến trúc') || text.includes('cntt') || text.includes('lập trình');
    }
    return true;
  };

  // Compute filtered & sorted courses
  const displayedCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1. Filter by search & category
    let list = courses.filter((course) => {
      // Category filter
      if (!courseMatchesCategory(course, selectedCategory)) {
        return false;
      }
      // Search filter
      if (q) {
        const matchName = course.name.toLowerCase().includes(q);
        const matchCode = course.code.toLowerCase().includes(q);
        const matchDesc = course.description.toLowerCase().includes(q);
        return matchName || matchCode || matchDesc;
      }
      return true;
    });

    // 2. Sort
    if (sortOrder === 'name_asc') {
      list = [...list].sort((a, b) => a.code.localeCompare(b.code));
    } else if (sortOrder === 'progress_desc') {
      list = [...list].sort((a, b) => {
        const pA = calculateCourseProgress(a.id, quizSets).percent;
        const pB = calculateCourseProgress(b.id, quizSets).percent;
        return pB - pA;
      });
    } else if (sortOrder === 'questions_desc') {
      list = [...list].sort((a, b) => {
        const qA = calculateCourseProgress(a.id, quizSets).totalQuestions;
        const qB = calculateCourseProgress(b.id, quizSets).totalQuestions;
        return qB - qA;
      });
    }

    return list;
  }, [courses, quizSets, searchQuery, selectedCategory, sortOrder]);

  return (
    <div className="home-dashboard">
      {/* ====================================================================
          1. HEADER NAVIGATION
          ==================================================================== */}
      <header className="home-navbar">
        <div className="home-navbar-inner">
          {/* Brand Logo */}
          <div className="home-brand">
            <div className="home-logo-box">K</div>
            <div className="home-brand-text">
              <span className="home-brand-name">KEYT</span>
              <span className="home-brand-subtitle">Quiz tự học</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="home-nav-links">
            <button type="button" className="home-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Trang chủ</span>
            </button>

            <button type="button" className="home-nav-item active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Thư viện</span>
            </button>

            <button type="button" className="home-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>Thống kê</span>
            </button>

            {/* User Avatar Menu */}
            <div className="home-user-menu">
              <div className="home-user-avatar" title="Tài khoản cá nhân">
                V
              </div>
              <div className="home-user-chevron">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* ====================================================================
          2. HERO SECTION
          ==================================================================== */}
      <section className="home-hero">
        <div className="home-hero-left">
          <span className="home-hero-eyebrow">THƯ VIỆN MÔN HỌC</span>
          <h1 className="home-hero-title">
            Hôm nay bạn muốn <span className="home-gradient-text">ôn môn nào?</span>
          </h1>
          <p className="home-hero-desc">
            Chọn một môn học để xem toàn bộ danh sách đề thi và theo dõi tiến độ ôn tập.
          </p>
        </div>

        {/* Hero Right Visual (SVG Study Illustration) */}
        <div className="home-hero-right">
          <svg className="home-hero-illustration" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Soft Ambient Shadow */}
            <ellipse cx="160" cy="195" rx="130" ry="14" fill="#E2E8F0" opacity="0.6" />

            {/* Stacked Book 1 (Bottom Dark Indigo) */}
            <rect x="70" y="160" width="180" height="26" rx="5" fill="#312E81" />
            <rect x="85" y="164" width="162" height="18" rx="2" fill="#FFFFFF" />
            <rect x="68" y="160" width="18" height="26" rx="4" fill="#4338CA" />

            {/* Stacked Book 2 (Middle Blue) */}
            <rect x="82" y="132" width="165" height="26" rx="5" fill="#2563EB" />
            <rect x="96" y="136" width="148" height="18" rx="2" fill="#F8FAFC" />
            <rect x="80" y="132" width="18" height="26" rx="4" fill="#3B82F6" />

            {/* Stacked Book 3 (Top Sky Blue) */}
            <rect x="95" y="104" width="150" height="26" rx="5" fill="#0284C7" />
            <rect x="108" y="108" width="134" height="18" rx="2" fill="#FFFFFF" />
            <rect x="93" y="104" width="17" height="26" rx="4" fill="#38BDF8" />

            {/* Succulent Plant Pot (Left) */}
            <path d="M36 175H58L54 195H40L36 175Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
            <ellipse cx="47" cy="175" rx="11" ry="3" fill="#E2E8F0" />
            <path d="M47 150C44 160 41 170 47 175C53 170 50 160 47 150Z" fill="#10B981" />
            <path d="M40 156C36 163 38 171 45 174C45 168 43 161 40 156Z" fill="#059669" />
            <path d="M54 156C58 163 56 171 49 174C49 168 51 161 54 156Z" fill="#34D399" />

            {/* Pencil Cup (Between) */}
            <rect x="255" y="152" width="28" height="42" rx="4" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="262" y1="130" x2="262" y2="152" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
            <line x1="270" y1="124" x2="270" y2="152" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
            <line x1="277" y1="134" x2="277" y2="152" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
          </svg>

          {/* Floating Graduation Cap Card */}
          <div className="home-floating-grad-cap" title="Học tập vững vàng">
            <span className="grad-cap-icon">🎓</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. SEARCH & CATEGORY FILTER SECTION
          ==================================================================== */}
      <section className="home-search-filter-section">
        {/* Search input + Sort button */}
        <div className="home-search-row">
          <div className="home-search-input-wrap">
            <svg
              className="home-search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="home-search-input"
              placeholder="Tìm kiếm môn học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="home-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="home-sort-dropdown-wrap">
            <button
              type="button"
              className="home-sort-btn"
              onClick={() => setIsSortOpen((prev) => !prev)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
              <span>Sắp xếp</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isSortOpen && (
              <div className="home-sort-menu">
                <button
                  type="button"
                  className={`home-sort-option ${sortOrder === 'default' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOrder('default');
                    setIsSortOpen(false);
                  }}
                >
                  Mặc định
                </button>
                <button
                  type="button"
                  className={`home-sort-option ${sortOrder === 'name_asc' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOrder('name_asc');
                    setIsSortOpen(false);
                  }}
                >
                  Mã môn A → Z
                </button>
                <button
                  type="button"
                  className={`home-sort-option ${sortOrder === 'progress_desc' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOrder('progress_desc');
                    setIsSortOpen(false);
                  }}
                >
                  Tiến độ cao nhất
                </button>
                <button
                  type="button"
                  className={`home-sort-option ${sortOrder === 'questions_desc' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOrder('questions_desc');
                    setIsSortOpen(false);
                  }}
                >
                  Nhiều câu hỏi nhất
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Chips */}
        <div className="home-category-chips">
          <button
            type="button"
            className={`home-category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Tất cả</span>
          </button>

          <button
            type="button"
            className={`home-category-chip ${selectedCategory === 'politics' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('politics')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Lý luận chính trị</span>
          </button>

          <button
            type="button"
            className={`home-category-chip ${selectedCategory === 'economics' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('economics')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="3" y1="22" x2="21" y2="22" />
              <line x1="6" y1="18" x2="6" y2="11" />
              <line x1="10" y1="18" x2="10" y2="11" />
              <line x1="14" y1="18" x2="14" y2="11" />
              <line x1="18" y1="18" x2="18" y2="11" />
              <polygon points="12 2 20 7 4 7" />
            </svg>
            <span>Kinh tế</span>
          </button>

          <button
            type="button"
            className={`home-category-chip ${selectedCategory === 'pm' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('pm')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>Quản lý dự án</span>
          </button>

          <button
            type="button"
            className={`home-category-chip ${selectedCategory === 'it' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('it')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Công nghệ thông tin</span>
          </button>
        </div>
      </section>

      {/* ====================================================================
          4. SUBJECT CARD GRID
          ==================================================================== */}
      <main className="home-cards-container">
        <div className="home-cards-grid">
          {displayedCourses.length === 0 ? (
            <div className="home-empty-state">
              <h3>Không tìm thấy môn học nào</h3>
              <p>Thử tìm với từ khóa khác hoặc bấm hiển thị tất cả môn học.</p>
              <button
                type="button"
                className="home-empty-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Hiển thị tất cả môn học
              </button>
            </div>
          ) : (
            displayedCourses.map((course) => {
              const theme = getCourseTheme(course.id, course.code);

              // 1. Flashcard Course
              if (course.id === 'flashcard' && flashcardSets.length > 0) {
                const fcSet = flashcardSets[0];
                const { total, known, percent } = getFlashcardProgress(fcSet);
                const isPassed = (course as any).isPassed === true || percent >= 100;

                return (
                  <article
                    key={course.id}
                    className="subject-card"
                    style={{
                      '--subj-primary': theme.primary,
                      '--subj-soft': theme.soft,
                      '--subj-border': theme.border,
                      '--subj-hover-shadow': theme.hoverShadow,
                    } as React.CSSProperties}
                    onClick={() => onSelectFlashcard(fcSet)}
                  >
                    {/* Header */}
                    <div className="subject-card-header">
                      <div className="subject-icon-box">
                        {renderSubjectIcon(theme.icon)}
                      </div>

                      <div className="subject-info-body">
                        <div className="subject-pill-row">
                          <span className="subject-code-badge">🔄 Thẻ ghi nhớ</span>
                        </div>
                        <h2 className="subject-code-title">FLASHCARD</h2>
                        <p className="subject-name-text">{course.name}</p>
                        <p className="subject-desc-text">{course.description}</p>
                      </div>

                      <div className="subject-top-actions">
                        <PassedBadge isPassed={isPassed} />
                        <span className="subject-open-arrow" aria-hidden="true">↗</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="subject-progress-section">
                      <div className="subject-progress-header">
                        <span className="subject-progress-label">Tiến độ ôn tập</span>
                        <span className="subject-progress-percent">{percent}%</span>
                      </div>
                      <div className="subject-progress-track">
                        <div className="subject-progress-bar" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    {/* Footer Stats & CTA */}
                    <div className="subject-card-footer">
                      <div className="subject-stats-row">
                        <div className="subject-stat-item">
                          <div className="subject-stat-icon-wrap">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <rect x="2" y="7" width="16" height="14" rx="2" />
                              <path d="M6 3h12a2 2 0 0 1 2 2v12" />
                            </svg>
                          </div>
                          <div className="subject-stat-text">
                            <span className="subject-stat-value">{total}</span>
                            <span className="subject-stat-label">Thuật ngữ</span>
                          </div>
                        </div>

                        <div className="subject-stat-item">
                          <div className="subject-stat-icon-wrap">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <div className="subject-stat-text">
                            <span className="subject-stat-value">{known}</span>
                            <span className="subject-stat-label">Đã thuộc</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="subject-cta-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFlashcard(fcSet);
                        }}
                      >
                        <span>{known > 0 ? 'Tiếp tục học' : 'Lật thẻ ngay'}</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </article>
                );
              }

              // 2. Normal Course
              const progress = calculateCourseProgress(course.id, quizSets);
              const isPassed = (course as any).isPassed === true || progress.percent >= 100;

              return (
                <article
                  key={course.id}
                  className="subject-card"
                  style={{
                    '--subj-primary': theme.primary,
                    '--subj-soft': theme.soft,
                    '--subj-border': theme.border,
                    '--subj-hover-shadow': theme.hoverShadow,
                  } as React.CSSProperties}
                  onClick={() => onSelectCourse(course)}
                >
                  {/* Header */}
                  <div className="subject-card-header">
                    <div className="subject-icon-box">
                      {renderSubjectIcon(theme.icon)}
                    </div>

                    <div className="subject-info-body">
                      <div className="subject-pill-row">
                        <span className="subject-code-badge">Môn {course.code}</span>
                        {course.isCustom && (
                          <span className="subject-custom-tag">Tự tạo</span>
                        )}
                      </div>
                      <h2 className="subject-code-title">{course.code}</h2>
                      <p className="subject-name-text">{course.name}</p>
                      <p className="subject-desc-text">{course.description}</p>
                    </div>

                    <div className="subject-top-actions">
                      <PassedBadge isPassed={isPassed} />

                      {course.isCustom && (
                        <button
                          type="button"
                          className="subject-delete-btn"
                          title="Xóa môn học này"
                          onClick={(e) => handleDeleteCourse(e, course)}
                        >
                          🗑️
                        </button>
                      )}

                      <span className="subject-open-arrow" aria-hidden="true">↗</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="subject-progress-section">
                    <div className="subject-progress-header">
                      <span className="subject-progress-label">Tiến độ ôn tập</span>
                      <span className="subject-progress-percent">{progress.percent}%</span>
                    </div>
                    <div className="subject-progress-track">
                      <div className="subject-progress-bar" style={{ width: `${progress.percent}%` }} />
                    </div>
                  </div>

                  {/* Footer Stats & CTA */}
                  <div className="subject-card-footer">
                    <div className="subject-stats-row">
                      <div className="subject-stat-item">
                        <div className="subject-stat-icon-wrap">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div className="subject-stat-text">
                          <span className="subject-stat-value">{progress.totalSets}</span>
                          <span className="subject-stat-label">Bộ đề</span>
                        </div>
                      </div>

                      <div className="subject-stat-item">
                        <div className="subject-stat-icon-wrap">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                        </div>
                        <div className="subject-stat-text">
                          <span className="subject-stat-value">{progress.totalQuestions}</span>
                          <span className="subject-stat-label">Câu hỏi</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="subject-cta-btn"
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
            })
          )}

          {/* 3. Thẻ Tạo môn học mới */}
          <article
            className="subject-card-add"
            onClick={onCreateCourseClick}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onCreateCourseClick();
            }}
          >
            <div className="add-card-body">
              <div className="add-icon-circle">+</div>
              <div className="add-info-text">
                <span className="home-hero-eyebrow" style={{ marginBottom: 6 }}>MÔN HỌC CỦA BẠN</span>
                <h3>Tạo môn học mới</h3>
                <p>
                  Thêm môn học mới để tổ chức, dán đề và theo dõi lộ trình ôn tập của riêng bạn.
                </p>
              </div>
            </div>

            <div className="add-card-footer">
              <button
                type="button"
                className="add-btn"
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

      {/* ====================================================================
          5. FOOTER
          ==================================================================== */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <span>KEYT © 2026 · Nền tảng ôn thi trắc nghiệm sinh viên</span>
          <div className="home-footer-links">
            <a href="#privacy">Privacy & Legal</a>
            <a href="#contact">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
