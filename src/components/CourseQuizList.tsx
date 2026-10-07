import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import { getQuizSetProgress, calculateCourseProgress } from '../utils/courseStorage';
import PassedBadge from './PassedBadge';
import './CourseQuizList.css';

interface CourseQuizListProps {
  course: Course;
  quizSets: QuizSetInfo[];
  onSelectSet: (set: QuizSetInfo) => void;
  onBack: () => void;
  onCreateQuizSet: () => void;
  onDeleteQuizSet?: (setId: string) => void;
}

type SortType = 'default' | 'name_asc' | 'progress_desc' | 'questions_desc' | 'questions_asc';

// 4-Color Accent System Cycling
const CARD_COLOR_THEMES = [
  {
    key: 'purple',
    accent: '#6366f1',
    borderLeft: '#8b5cf6',
    badgeBg: '#f5f3ff',
    badgeText: '#6d28d9',
    badgeBorder: '#ede9fe',
    btnBg: '#4f46e5',
    btnHover: '#4338ca',
  },
  {
    key: 'blue',
    accent: '#3b82f6',
    borderLeft: '#3b82f6',
    badgeBg: '#eff6ff',
    badgeText: '#1d4ed8',
    badgeBorder: '#dbeafe',
    btnBg: '#2563eb',
    btnHover: '#1d4ed8',
  },
  {
    key: 'green',
    accent: '#10b981',
    borderLeft: '#10b981',
    badgeBg: '#ecfdf5',
    badgeText: '#047857',
    badgeBorder: '#d1fae5',
    btnBg: '#10b981',
    btnHover: '#059669',
  },
  {
    key: 'orange',
    accent: '#f97316',
    borderLeft: '#f97316',
    badgeBg: '#fff7ed',
    badgeText: '#c2410c',
    badgeBorder: '#ffedd5',
    btnBg: '#f97316',
    btnHover: '#ea580c',
  },
];

// Academic study illustration for hero right side
function CourseHeroVisual() {
  return (
    <svg
      className="course-hero-illustration"
      viewBox="0 0 340 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Soft Background Radial Glow */}
        <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#C7D2FE" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0" />
        </radialGradient>

        {/* Book 1 Gradients (Bottom) */}
        <linearGradient id="book1Spine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Book 2 Gradients (Middle Pink/Purple) */}
        <linearGradient id="book2Spine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>

        {/* Book 3 Gradients (Top Blue) */}
        <linearGradient id="book3Spine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>

        {/* Plant leaf gradients */}
        <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Academic bust/relief gradient */}
        <linearGradient id="bustGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EEF2FF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Decorative dot matrix pattern */}
      <g opacity="0.4" fill="#818CF8">
        <circle cx="20" cy="30" r="1.5" />
        <circle cx="36" cy="30" r="1.5" />
        <circle cx="52" cy="30" r="1.5" />
        <circle cx="68" cy="30" r="1.5" />
        <circle cx="20" cy="46" r="1.5" />
        <circle cx="36" cy="46" r="1.5" />
        <circle cx="52" cy="46" r="1.5" />
        <circle cx="68" cy="46" r="1.5" />
        <circle cx="20" cy="62" r="1.5" />
        <circle cx="36" cy="62" r="1.5" />
        <circle cx="52" cy="62" r="1.5" />
        <circle cx="68" cy="62" r="1.5" />
      </g>

      {/* Ambient background glow */}
      <circle cx="240" cy="110" r="105" fill="url(#heroGlow)" />

      {/* Soft ground shadow */}
      <ellipse cx="180" cy="195" rx="135" ry="14" fill="#CBD5E1" opacity="0.45" />

      {/* STACKED BOOKS (Perspective Isometric) */}
      {/* Book 1 (Bottom Cyan/Blue) */}
      <g id="bookBottom">
        <rect x="75" y="156" width="160" height="28" rx="6" fill="#0284C7" />
        <rect x="88" y="160" width="144" height="20" rx="3" fill="#F8FAFC" />
        <rect x="73" y="156" width="16" height="28" rx="5" fill="url(#book1Spine)" />
        {/* Bookmark ribbon */}
        <path d="M125 170 L133 186 L141 170 Z" fill="#F59E0B" />
      </g>

      {/* Book 2 (Middle Pink/Magenta) */}
      <g id="bookMiddle">
        <rect x="88" y="126" width="150" height="26" rx="6" fill="#BE185D" />
        <rect x="100" y="130" width="135" height="18" rx="3" fill="#FFFFFF" />
        <rect x="86" y="126" width="16" height="26" rx="5" fill="url(#book2Spine)" />
        {/* Line on pages */}
        <line x1="108" y1="139" x2="225" y2="139" stroke="#E2E8F0" strokeWidth="1" />
      </g>

      {/* Book 3 (Top Indigo) */}
      <g id="bookTop">
        <rect x="102" y="96" width="138" height="26" rx="6" fill="#3730A3" />
        <rect x="114" y="100" width="123" height="18" rx="3" fill="#F1F5F9" />
        <rect x="100" y="96" width="16" height="26" rx="5" fill="url(#book3Spine)" />
      </g>

      {/* POTTED SUCCULENT PLANT */}
      <g id="succulentPlant">
        {/* Pot */}
        <ellipse cx="155" cy="98" rx="16" ry="6" fill="#E2E8F0" />
        <path d="M141 98 L145 124 L165 124 L169 98 Z" fill="#FFFFFF" />
        <path d="M145 124 Q155 128 165 124 Z" fill="#E2E8F0" />
        {/* Leaves */}
        <path d="M155 96 Q146 80 152 68 Q158 80 155 96 Z" fill="url(#leafGrad)" />
        <path d="M153 96 Q138 88 136 78 Q148 84 153 96 Z" fill="url(#leafGrad)" opacity="0.9" />
        <path d="M157 96 Q172 88 174 78 Q162 84 157 96 Z" fill="url(#leafGrad)" opacity="0.9" />
        <path d="M155 95 Q150 86 148 76 Q156 82 155 95 Z" fill="#10B981" />
      </g>

      {/* ACADEMIC BUST / MEDALLION EMBLEM */}
      <g id="academicBust" transform="translate(225, 42)">
        {/* Soft shadow */}
        <ellipse cx="36" cy="148" rx="32" ry="7" fill="#CBD5E1" opacity="0.4" />
        {/* Pedestal */}
        <rect x="16" y="128" width="40" height="18" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="12" y="142" width="48" height="8" rx="3" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
        {/* Bust Sculpted Body */}
        <path
          d="M20 128 C20 108 26 98 36 98 C46 98 52 108 52 128 Z"
          fill="url(#bustGrad)"
          stroke="#CBD5E1"
          strokeWidth="1.2"
        />
        {/* Head */}
        <circle cx="36" cy="80" r="16" fill="url(#bustGrad)" stroke="#CBD5E1" strokeWidth="1.2" />
        {/* Hair / Beard Profile Sculpting */}
        <path
          d="M26 80 Q24 70 34 66 Q44 64 48 72 Q50 80 46 88 Q40 96 32 94 Q26 92 26 80 Z"
          fill="#DBEAFE"
          opacity="0.8"
        />
        {/* Graduation cap or Academic halo motif */}
        <path d="M18 64 L36 56 L54 64 L36 72 Z" fill="#4F46E5" opacity="0.85" />
        <rect x="26" y="67" width="20" height="7" rx="2" fill="#4338CA" opacity="0.85" />
        <line x1="48" y1="65" x2="52" y2="78" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="52" cy="79" r="1.8" fill="#F59E0B" />
      </g>

      {/* Decorative floating academic stars */}
      <g fill="#F59E0B" opacity="0.85">
        <path d="M295 48 L296.5 52 L301 53 L297.5 56 L298.5 60 L295 57.5 L291.5 60 L292.5 56 L289 53 L293.5 52 Z" />
        <path d="M68 98 L69 101 L72 101.8 L69.8 104 L70.4 107 L68 105 L65.6 107 L66.2 104 L64 101.8 L67 101 Z" opacity="0.65" />
      </g>
    </svg>
  );
}

// Icon for course hero rounded square
function renderCourseHeroIcon(code: string) {
  const c = code.toUpperCase();
  if (c.includes('MLN111')) {
    // Open Book
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }
  if (c.includes('MLN122')) {
    // Landmark
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="22" x2="21" y2="22" />
        <line x1="6" y1="18" x2="6" y2="11" />
        <line x1="10" y1="18" x2="10" y2="11" />
        <line x1="14" y1="18" x2="14" y2="11" />
        <line x1="18" y1="18" x2="18" y2="11" />
        <polygon points="12 2 20 7 4 7" />
      </svg>
    );
  }
  if (c.includes('PMG201')) {
    // Folder
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (c.includes('SWD392')) {
    // Code
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  // Default Graduation Cap
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

export default function CourseQuizList({
  course,
  quizSets,
  onSelectSet,
  onBack,
  onCreateQuizSet,
  onDeleteQuizSet,
}: CourseQuizListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortType>('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter all sets belonging to current course
  const courseSets = useMemo(() => {
    return quizSets.filter((set) => set.courseId === course.id);
  }, [quizSets, course.id]);

  // Overall course progress
  const courseProgress = useMemo(() => {
    return calculateCourseProgress(course.id, quizSets);
  }, [course.id, quizSets]);

  // Filtered & Sorted sets
  const filteredSets = useMemo(() => {
    let list = courseSets;

    // Search by title, description, category, or badge
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((set) => {
        const titleMatch = set.title.toLowerCase().includes(q);
        const descMatch = set.description?.toLowerCase().includes(q);
        const badgeMatch = set.badge?.toLowerCase().includes(q);
        const catMatch = set.category?.toLowerCase().includes(q);
        return titleMatch || descMatch || badgeMatch || catMatch;
      });
    }

    // Sort order
    if (sortOrder === 'name_asc') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    } else if (sortOrder === 'progress_desc') {
      list = [...list].sort((a, b) => {
        const pA = getQuizSetProgress(a).percent;
        const pB = getQuizSetProgress(b).percent;
        return pB - pA;
      });
    } else if (sortOrder === 'questions_desc') {
      list = [...list].sort((a, b) => {
        const qA = getQuizSetProgress(a).total;
        const qB = getQuizSetProgress(b).total;
        return qB - qA;
      });
    } else if (sortOrder === 'questions_asc') {
      list = [...list].sort((a, b) => {
        const qA = getQuizSetProgress(a).total;
        const qB = getQuizSetProgress(b).total;
        return qA - qB;
      });
    }

    return list;
  }, [courseSets, searchQuery, sortOrder]);

  const handleDeleteSet = (e: React.MouseEvent, set: QuizSetInfo) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bộ đề "${set.title}" không?`
    );
    if (confirmed && onDeleteQuizSet) {
      onDeleteQuizSet(set.id);
    }
  };

  // Circular progress calculations for Course Stats Card 3
  const ringRadius = 16;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (ringCircumference * Math.min(courseProgress.percent, 100)) / 100;

  return (
    <div className="course-quiz-dashboard">
      {/* ====================================================================
          1. HEADER / NAVBAR
          ==================================================================== */}
      <header className="course-nav">
        <div className="course-nav-inner">
          {/* Left: Back button + Brand */}
          <div className="course-nav-left">
            <button
              type="button"
              className="course-back-btn"
              onClick={onBack}
              title="Quay lại danh sách môn học"
              aria-label="Danh sách môn học"
            >
              <span className="course-back-arrow" aria-hidden="true">←</span>
              <span>Danh sách môn học</span>
            </button>

            <div className="course-brand" onClick={onBack} role="button" tabIndex={0}>
              <div className="course-logo-box">K</div>
              <div className="course-brand-text">
                <span className="course-brand-name">KEYT</span>
                <span className="course-brand-subtitle">Quiz tự học</span>
              </div>
            </div>
          </div>

          {/* Right: Nav Links + User Avatar */}
          <nav className="course-nav-links">
            <button
              type="button"
              className="course-nav-item"
              onClick={onBack}
              title="Về trang chủ"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Trang chủ</span>
            </button>

            <button
              type="button"
              className="course-nav-item active"
              title="Thư viện môn học"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Thư viện</span>
            </button>

            <button
              type="button"
              className="course-nav-item"
              title="Thống kê học tập"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>Thống kê</span>
            </button>

            {/* Avatar / User Menu */}
            <div className="course-user-menu" title="Tài khoản cá nhân">
              <div className="course-user-avatar">V</div>
              <div className="course-user-chevron">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* ====================================================================
          2. MAIN CONTENT
          ==================================================================== */}
      <main className="course-main-content">
        {/* ====================================================================
            3. COURSE HERO
            ==================================================================== */}
        <section className="course-hero">
          <div className="course-hero-left">
            <div className="course-hero-icon-box">
              {renderCourseHeroIcon(course.code)}
            </div>

            <div className="course-hero-info">
              <span className="course-hero-badge">Môn {course.code}</span>
              <h1 className="course-hero-title">{course.name}</h1>
              <p className="course-hero-desc">{course.description}</p>
            </div>
          </div>

          {/* Right Visual (Academic study 3D-styled SVG illustration) */}
          <div className="course-hero-right">
            <CourseHeroVisual />
          </div>
        </section>

        {/* ====================================================================
            4. COURSE STATS
            ==================================================================== */}
        <section className="course-stats-grid">
          {/* Card 1: Bộ đề */}
          <div className="course-stat-card">
            <div className="course-stat-icon-wrap purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="course-stat-content">
              <span className="course-stat-number">{courseSets.length}</span>
              <span className="course-stat-label">Bộ đề</span>
            </div>
          </div>

          {/* Card 2: Câu hỏi */}
          <div className="course-stat-card">
            <div className="course-stat-icon-wrap blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="course-stat-content">
              <span className="course-stat-number">{courseProgress.totalQuestions}</span>
              <span className="course-stat-label">Câu hỏi</span>
            </div>
          </div>

          {/* Card 3: Tiến độ ôn tập */}
          <div className="course-stat-card">
            <div className="course-stat-icon-wrap ring-box">
              <svg width="40" height="40" viewBox="0 0 40 40">
                {/* Background Ring */}
                <circle
                  cx="20"
                  cy="20"
                  r={ringRadius}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                />
                {/* Progress Ring */}
                <circle
                  cx="20"
                  cy="20"
                  r={ringRadius}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3.5"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                  style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                />
              </svg>
            </div>
            <div className="course-stat-content">
              <span className="course-stat-number">{courseProgress.percent}%</span>
              <span className="course-stat-label">Tiến độ ôn tập</span>
            </div>
          </div>
        </section>

        {/* ====================================================================
            5. SEARCH + SORT TOOLBAR
            ==================================================================== */}
        <section className="exam-toolbar">
          <div className="exam-search-box">
            <svg
              className="exam-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="exam-search-input"
              placeholder="Tìm kiếm bộ đề (ví dụ: SU26, C1FE, Final Exam...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm bộ đề"
            />
            {searchQuery && (
              <button
                type="button"
                className="exam-search-clear"
                onClick={() => setSearchQuery('')}
                title="Xóa tìm kiếm"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="exam-sort-container" ref={sortRef}>
            <button
              type="button"
              className="exam-sort-btn"
              onClick={() => setIsSortOpen(!isSortOpen)}
              aria-expanded={isSortOpen}
              aria-haspopup="true"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <span>Sắp xếp</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isSortOpen && (
              <div className="exam-sort-dropdown" role="menu">
                <button
                  type="button"
                  className={`exam-sort-item ${sortOrder === 'default' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOrder('default');
                    setIsSortOpen(false);
                  }}
                  role="menuitem"
                >
                  <span>Mặc định</span>
                  {sortOrder === 'default' && <span>✓</span>}
                </button>

                <button
                  type="button"
                  className={`exam-sort-item ${sortOrder === 'name_asc' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOrder('name_asc');
                    setIsSortOpen(false);
                  }}
                  role="menuitem"
                >
                  <span>Tên A → Z</span>
                  {sortOrder === 'name_asc' && <span>✓</span>}
                </button>

                <button
                  type="button"
                  className={`exam-sort-item ${sortOrder === 'progress_desc' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOrder('progress_desc');
                    setIsSortOpen(false);
                  }}
                  role="menuitem"
                >
                  <span>Tiến độ cao → thấp</span>
                  {sortOrder === 'progress_desc' && <span>✓</span>}
                </button>

                <button
                  type="button"
                  className={`exam-sort-item ${sortOrder === 'questions_desc' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOrder('questions_desc');
                    setIsSortOpen(false);
                  }}
                  role="menuitem"
                >
                  <span>Số câu hỏi nhiều nhất</span>
                  {sortOrder === 'questions_desc' && <span>✓</span>}
                </button>

                <button
                  type="button"
                  className={`exam-sort-item ${sortOrder === 'questions_asc' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOrder('questions_asc');
                    setIsSortOpen(false);
                  }}
                  role="menuitem"
                >
                  <span>Số câu hỏi ít nhất</span>
                  {sortOrder === 'questions_asc' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ====================================================================
            6. EXAM CARDS GRID
            ==================================================================== */}
        <section className="exam-cards-grid">
          {filteredSets.map((set, index) => {
            const { total, mastered, percent } = getQuizSetProgress(set);
            const isCustom = set.id.startsWith('custom_') || set.category === 'Bộ đề tự tạo';
            const isPassed = Boolean((set as any).isPassed || (set as any).passed);

            // Cycle through 4 color accents
            const theme = CARD_COLOR_THEMES[index % CARD_COLOR_THEMES.length];

            // Badge text (from set.badge or standard count)
            const badgeText = set.badge || (total > 0 ? `Đề chuẩn ${total} câu` : set.category || `Môn ${course.code}`);

            return (
              <article
                key={set.id}
                className="exam-card"
                style={{
                  '--card-accent': theme.accent,
                  '--card-border-left': theme.borderLeft,
                  '--card-badge-bg': theme.badgeBg,
                  '--card-badge-text': theme.badgeText,
                  '--card-badge-border': theme.badgeBorder,
                  '--card-btn-bg': theme.btnBg,
                  '--card-btn-hover': theme.btnHover,
                } as React.CSSProperties}
                onClick={() => onSelectSet(set)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSet(set);
                  }
                }}
              >
                {/* Top Row: Badge + Passed + Delete + Open Icon */}
                <div className="exam-card-header">
                  <span className="exam-badge">{badgeText}</span>

                  <div className="exam-card-actions">
                    <PassedBadge isPassed={isPassed} />

                    {isCustom && onDeleteQuizSet && (
                      <button
                        type="button"
                        className="exam-delete-btn"
                        title="Xóa bộ đề này"
                        onClick={(e) => handleDeleteSet(e, set)}
                        aria-label="Xóa bộ đề"
                      >
                        🗑️
                      </button>
                    )}

                    <span className="exam-open-icon" aria-hidden="true" title="Mở bộ đề">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="exam-title">{set.title}</h2>

                {/* Subject Subtitle */}
                <p className="exam-subject-sub">
                  {set.category && set.category.startsWith('Môn') ? set.category : `Môn ${course.code}`}
                </p>

                {/* Description */}
                <p className="exam-desc">{set.description}</p>

                {/* Progress Section */}
                <div className="exam-progress-wrap">
                  <div className="exam-progress-row">
                    <span className="exam-progress-label">Tiến độ ôn tập</span>
                    <span className="exam-progress-val">{percent}%</span>
                  </div>
                  <div className="exam-progress-track">
                    <div
                      className="exam-progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Footer: Bottom Stats + CTA */}
                <div className="exam-footer">
                  <div className="exam-stats-group">
                    <div className="exam-stat-pill" title={`${total} câu hỏi trong bộ đề`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      <span className="exam-stat-num">{total}</span>
                      <span>Câu hỏi</span>
                    </div>

                    <div className="exam-stat-pill" title={`Đã học thành thạo ${mastered} câu`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                      <span className="exam-stat-num">{mastered}</span>
                      <span>Đã học</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="exam-cta-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSet(set);
                    }}
                  >
                    <span>Tiếp tục học</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            );
          })}

          {/* Add New Custom Quiz Set Card */}
          <article
            className="exam-add-card"
            onClick={onCreateQuizSet}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCreateQuizSet();
              }
            }}
          >
            <div className="exam-add-top">
              <div className="exam-add-icon-box">+</div>
              <span className="exam-add-badge">THÊM ĐỀ MỚI</span>
              <h2 className="exam-add-title">Tạo đề thi mới</h2>
              <p className="exam-add-desc">
                Dán câu hỏi và đáp án để tạo thêm một bộ đề ôn thi riêng cho môn {course.code}.
              </p>
            </div>
            <button
              type="button"
              className="exam-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCreateQuizSet();
              }}
            >
              <span>Dán đề thi</span>
              <span aria-hidden="true">→</span>
            </button>
          </article>

          {/* Empty search result state */}
          {filteredSets.length === 0 && searchQuery && (
            <div className="exam-empty-state">
              <div className="exam-empty-icon">🔍</div>
              <h3 className="exam-empty-title">Không tìm thấy bộ đề phù hợp</h3>
              <p className="exam-empty-desc">
                Không có bộ đề nào khớp với từ khóa "{searchQuery}". Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
              </p>
              <button
                type="button"
                className="exam-empty-btn"
                onClick={() => setSearchQuery('')}
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          )}

          {/* Empty course with no sets state */}
          {courseSets.length === 0 && !searchQuery && (
            <div className="exam-empty-state">
              <div className="exam-empty-icon">📂</div>
              <h3 className="exam-empty-title">Môn này hiện chưa có đề thi nào</h3>
              <p className="exam-empty-desc">
                Hãy bấm vào thẻ "Tạo đề thi mới" để dán danh sách câu hỏi và đáp án cho môn {course.name}.
              </p>
              <button
                type="button"
                className="exam-empty-btn"
                onClick={onCreateQuizSet}
              >
                + Tạo đề thi đầu tiên
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ====================================================================
          7. FOOTER
          ==================================================================== */}
      <footer className="course-footer">
        <div className="course-footer-inner">
          <span>KEYT © 2026 · Nền tảng ôn thi trắc nghiệm thông minh</span>
          <div className="course-footer-links">
            <a href="#privacy">Chính sách bảo mật</a>
            <a href="#terms">Điều khoản sử dụng</a>
            <a href="#contact">Hỗ trợ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
