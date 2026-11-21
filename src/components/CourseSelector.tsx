import React, { useState, useMemo, useEffect } from 'react';
import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import type { FlashcardSet } from '../data/flashcardData';
import {
  calculateCourseProgress,
  getFlashcardProgress,
  getQuizSetProgress,
  loadRecentCourseIds,
} from '../utils/courseStorage';
import type { HomeNavTab } from '../utils/router';
import PassedBadge from './PassedBadge';
import { useTheme } from '../context/ThemeContext';
import ThemeHero3DDiorama from './ThemeHero3DDiorama';
import {
  COURSE_CATEGORIES,
  CATEGORY_META_MAP,
  getCourseCategories,
  courseMatchesCategory,
  type CourseCategory,
  type MajorCategoryKey,
} from '../utils/courseCategories';
import './CourseSelector.css';

interface CourseSelectorProps {
  courses: Course[];
  quizSets: QuizSetInfo[];
  flashcardSets: FlashcardSet[];
  activeNavTab?: HomeNavTab;
  onChangeNavTab?: (tab: HomeNavTab) => void;
  onSelectCourse: (course: Course) => void;
  onSelectSet?: (set: QuizSetInfo) => void;
  onSelectFlashcard: (fcSet: FlashcardSet) => void;
  onCreateCourseClick: () => void;
  onDeleteCourse: (courseId: string) => void;
}

type SortType = 'default' | 'name_asc' | 'progress_desc' | 'questions_desc';

interface SubjectTheme {
  primary: string;
  soft: string;
  border: string;
  hoverShadow: string;
  icon: 'book' | 'landmark' | 'folder' | 'code' | 'cloud' | 'globe' | 'tag' | 'cards' | 'grad-cap';
}

function getCourseTheme(course: Course, activeTheme = 'default'): SubjectTheme {
  const courseId = course.id;
  const code = (course.code || courseId).toUpperCase();
  const primaryCat = getCourseCategories(course)[0] || 'it';
  const catMeta = CATEGORY_META_MAP[primaryCat];

  let icon: SubjectTheme['icon'] = catMeta.icon;
  if (code.includes('SDN302') || code.includes('PRC392') || code.includes('CES202') || code.includes('OSP201')) {
    icon = 'cloud';
  } else if (courseId === 'flashcard') {
    icon = 'cards';
  }

  if (activeTheme === 'lotus-zen-sanctuary') {
    return {
      primary: '#A77636',
      soft: 'rgba(247, 236, 214, 0.85)',
      border: 'rgba(167, 118, 54, 0.5)',
      hoverShadow: 'rgba(59, 32, 20, 0.35)',
      icon,
    };
  }

  if (activeTheme === 'fantasy-academy') {
    return {
      primary: '#f59e0b',
      soft: 'rgba(217, 119, 6, 0.16)',
      border: 'rgba(217, 119, 6, 0.4)',
      hoverShadow: 'rgba(217, 119, 6, 0.35)',
      icon,
    };
  }

  if (activeTheme === 'hon-viet') {
    return {
      primary: '#991b1b',
      soft: 'rgba(254, 243, 199, 0.8)',
      border: 'rgba(217, 119, 6, 0.45)',
      hoverShadow: 'rgba(153, 27, 27, 0.25)',
      icon,
    };
  }

  if (activeTheme === 'billionaire-vault') {
    return {
      primary: '#d4af37',
      soft: 'rgba(212, 175, 55, 0.14)',
      border: 'rgba(212, 175, 55, 0.36)',
      hoverShadow: 'rgba(212, 175, 55, 0.28)',
      icon,
    };
  }

  if (activeTheme === 'shin-kasukabe') {
    return {
      primary: '#ef4444',
      soft: 'rgba(254, 240, 138, 0.45)',
      border: 'rgba(245, 158, 11, 0.48)',
      hoverShadow: 'rgba(239, 68, 68, 0.24)',
      icon,
    };
  }

  if (activeTheme === 'spidey-night') {
    return {
      primary: '#f43f5e',
      soft: 'rgba(225, 29, 72, 0.2)',
      border: 'rgba(56, 189, 248, 0.42)',
      hoverShadow: 'rgba(225, 29, 72, 0.34)',
      icon,
    };
  }

  if (activeTheme === 'cozy-night') {
    return {
      primary: '#38bdf8',
      soft: 'rgba(99, 102, 241, 0.18)',
      border: 'rgba(129, 140, 248, 0.35)',
      hoverShadow: 'rgba(56, 189, 248, 0.28)',
      icon,
    };
  }

  // Modern Light / Default theme
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
  if (code.includes('IPR102')) {
    return {
      primary: '#0f766e',
      soft: '#f0fdfa',
      border: '#ccfbf1',
      hoverShadow: 'rgba(15, 118, 110, 0.16)',
      icon: 'landmark',
    };
  }
  if (code.includes('PRM393')) {
    return {
      primary: '#0284c7',
      soft: '#f0f9ff',
      border: '#bae6fd',
      hoverShadow: 'rgba(2, 132, 199, 0.16)',
      icon: 'code',
    };
  }
  if (code.includes('ITE302')) {
    return {
      primary: '#d97706',
      soft: '#fffbeb',
      border: '#fde68a',
      hoverShadow: 'rgba(217, 119, 6, 0.16)',
      icon: 'book',
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
    primary: catMeta.primary,
    soft: catMeta.soft,
    border: catMeta.border,
    hoverShadow: catMeta.hoverShadow,
    icon,
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

function getHomeHeroDetails(theme: string) {
  switch (theme) {
    case 'lotus-zen-sanctuary':
      return {
        eyebrow: '🪷 LIÊN HOA PHẬT QUỐC · THIỀN VIỆN TRI THỨC',
        titlePre: 'Tâm an định tĩnh, ',
        titleHighlight: 'trí tuệ khai hoa',
        desc: 'Không gian tu học lấy cảm hứng từ kiến trúc Phật giáo Việt Nam, hoa sen, vàng đồng và thiền định an yên. Chọn một pháp môn ôn luyện để thắp sáng con đường tri thức.',
        badgeIcon: '🪷',
        badgeTitle: 'Liên Hoa Phật Quốc',
      };
    case 'hon-viet':
      return {
        eyebrow: '⭐ HỒN VIỆT · VĂN MIẾU THƯ PHÒNG',
        titlePre: 'Khơi nguồn tri thức, ',
        titleHighlight: 'vững bước tương lai',
        desc: 'Học tập hôm nay – Dựng xây mai sau. Chọn một môn học để xem toàn bộ danh sách đề thi và theo dõi tiến độ ôn tập.',
        badgeIcon: '🪷',
        badgeTitle: 'Tinh hoa Đại Việt',
      };
    case 'fantasy-academy':
      return {
        eyebrow: '⚔️ HỌC VIỆN MA PHÁP · ĐẤU TRƯỜNG TRI THỨC',
        titlePre: 'Hôm nay bạn muốn ',
        titleHighlight: 'chinh phục bí tịch nào?',
        desc: 'Mở khóa từng pho cổ thư, tích lũy điểm kinh nghiệm và thăng hạng học giả thượng thừa.',
        badgeIcon: '📜',
        badgeTitle: 'Học Viện Ma Pháp',
      };
    case 'billionaire-vault':
      return {
        eyebrow: '💎 BILLIONAIRE VAULT · BLACK CARD & $100 USD STUDY HUB',
        titlePre: 'Hôm nay đầu tư trí tuệ vào ',
        titleHighlight: 'môn học sinh lời nào?',
        desc: 'Không gian Private Banking đẳng cấp: 3 chất liệu thẻ (Obsidian · Emerald · 24K Gold), Thẻ Đen 3D xoay tương tác, tài sản USD nhảy số và mưa tờ $100 USD thật khi chốt Combo!',
        badgeIcon: '💎',
        badgeTitle: 'Billionaire Vault',
      };
    case 'shin-kasukabe':
      return {
        eyebrow: '🖍️ SHIN KASUKABE · 4 CẢNH 3D & CHOCOBI STUDY HUB',
        titlePre: 'Hôm nay cùng Shin ',
        titleHighlight: 'chinh phục môn nào?',
        desc: 'Đội Phòng Vệ Kasukabe sẵn sàng! Chọn môn học, đổi giữa 4 khung cảnh 3D và gom sao ChocoBi để qua môn cực mượt.',
      };
    case 'spidey-night':
      return {
        eyebrow: '🕷️ SPIDEY NIGHT-VERSE · NEW YORK STUDY HUB',
        titlePre: 'Đêm nay bạn muốn ',
        titleHighlight: 'bắn tơ chinh phục môn nào?',
        desc: 'With great GPA comes great responsibility! Chọn môn học để kích hoạt Spider-Sense và cày đề xuyên màn đêm.',
        badgeIcon: '🕸️',
        badgeTitle: 'Spidey Night-Verse',
      };
    case 'cozy-night':
      return {
        eyebrow: '☕ GÓC HỌC KHUYA · LOFI STUDY HUB',
        titlePre: 'Đêm nay bạn muốn ',
        titleHighlight: 'ôn tập môn nào?',
        desc: 'Bật một bản nhạc lofi yêu thích, nhâm nhi tách trà ấm và bắt đầu phiên ôn tập hiệu quả.',
        badgeIcon: '🎧',
        badgeTitle: 'Lofi Study Night',
      };
    default:
      return {
        eyebrow: 'THƯ VIỆN MÔN HỌC',
        titlePre: 'Hôm nay bạn muốn ',
        titleHighlight: 'ôn môn nào?',
        desc: 'Chọn một môn học để xem toàn bộ danh sách đề thi và theo dõi tiến độ ôn tập.',
        badgeIcon: '🎓',
        badgeTitle: 'Thư viện môn học',
      };
  }
}

export default function CourseSelector({
  courses,
  quizSets,
  flashcardSets,
  activeNavTab = 'library',
  onChangeNavTab,
  onSelectCourse,
  onSelectSet,
  onSelectFlashcard,
  onCreateCourseClick,
  onDeleteCourse,
}: CourseSelectorProps) {
  const {
    theme,
    openThemeModal,
    mouseEffectsEnabled,
    toggleMouseEffects,
    hoverTranslateEnabled,
    toggleHoverTranslate,
    shinScene,
    setShinScene,
    moneyFinish,
    setMoneyFinish,
  } = useTheme();
  const heroDetails = getHomeHeroDetails(theme);
  const [activeTab, setActiveTab] = useState<HomeNavTab>(activeNavTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>('all');
  const [sortOrder, setSortOrder] = useState<SortType>('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [homeSubFilter, setHomeSubFilter] = useState<'all' | 'studying' | 'passed' | 'recent'>('all');

  useEffect(() => {
    setActiveTab(activeNavTab);
  }, [activeNavTab]);

  const switchTab = (tab: HomeNavTab) => {
    setActiveTab(tab);
    if (onChangeNavTab) {
      onChangeNavTab(tab);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openLibraryWithCategory = (cat: CourseCategory) => {
    setSelectedCategory(cat);
    switchTab('library');
  };

  const handleDeleteCourse = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa môn học "${course.name}" (${course.code}) cùng toàn bộ các đề thi tự tạo thuộc môn này không?`
    );
    if (confirmed) {
      onDeleteCourse(course.id);
    }
  };

  // Đếm số lượng môn học thuộc từng khối ngành (bao gồm các môn học chung 2-3 ngành)
  const categoryCounts = useMemo(() => {
    const counts: Record<CourseCategory, number> = {
      all: courses.length,
      it: 0,
      economics: 0,
      marketing: 0,
      media: 0,
      design: 0,
      politics: 0,
      language: 0,
    };
    for (const c of courses) {
      for (const cat of getCourseCategories(c)) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }
    return counts;
  }, [courses]);

  // Tổng hợp dữ liệu thống kê học tập & tiến độ cho cả Trang chủ và Thống kê
  const studyStats = useMemo(() => {
    const recentIds = loadRecentCourseIds();
    const courseMap = new Map<string, Course>();
    for (const c of courses) {
      courseMap.set(c.id, c);
    }

    const courseProgressMap = new Map<
      string,
      { totalSets: number; totalQuestions: number; masteredQuestions: number; percent: number; isPassed: boolean }
    >();

    const studiedCourses: Course[] = [];
    const inProgressCourses: Course[] = [];
    const passedCourses: Course[] = [];

    for (const course of courses) {
      if (course.id === 'flashcard' && flashcardSets.length > 0) {
        const fcProg = getFlashcardProgress(flashcardSets[0]);
        const isPassed = (course as any).isPassed === true || fcProg.percent >= 100;
        courseProgressMap.set(course.id, {
          totalSets: 1,
          totalQuestions: fcProg.total,
          masteredQuestions: fcProg.known,
          percent: fcProg.percent,
          isPassed,
        });
        if (fcProg.known > 0 || fcProg.percent > 0) {
          studiedCourses.push(course);
          if (fcProg.percent > 0 && fcProg.percent < 100) inProgressCourses.push(course);
        }
        if (isPassed) passedCourses.push(course);
        continue;
      }

      const prog = calculateCourseProgress(course.id, quizSets);
      const isPassed = (course as any).isPassed === true || (prog.totalQuestions > 0 && prog.percent >= 100);
      courseProgressMap.set(course.id, { ...prog, isPassed });

      if (prog.masteredQuestions > 0 || prog.percent > 0) {
        studiedCourses.push(course);
        if (prog.percent < 100) {
          inProgressCourses.push(course);
        }
      }
      if (isPassed) {
        passedCourses.push(course);
      }
    }

    // Sắp xếp môn đã học theo tiến độ giảm dần, rồi theo số câu đã thuộc
    studiedCourses.sort((a, b) => {
      const pA = courseProgressMap.get(a.id)!;
      const pB = courseProgressMap.get(b.id)!;
      if (pB.percent !== pA.percent) return pB.percent - pA.percent;
      return pB.masteredQuestions - pA.masteredQuestions;
    });

    // Danh sách môn vừa xem gần đây
    const recentCourses: Course[] = [];
    for (const id of recentIds) {
      const found = courseMap.get(id);
      if (found) recentCourses.push(found);
    }

    // Gộp môn đang học (>0%) + môn vừa xem gần đây (không trùng lặp)
    const activeOrRecentIds = new Set<string>();
    const activeOrRecentCourses: Course[] = [];
    for (const c of [...studiedCourses, ...recentCourses]) {
      if (!activeOrRecentIds.has(c.id)) {
        activeOrRecentIds.add(c.id);
        activeOrRecentCourses.push(c);
      }
    }

    // Top 9 môn tiêu biểu có nhiều bộ đề nhất
    const featuredCourses = [...courses]
      .filter((c) => c.id !== 'flashcard')
      .sort((a, b) => {
        const pA = courseProgressMap.get(a.id)!;
        const pB = courseProgressMap.get(b.id)!;
        if (pB.totalSets !== pA.totalSets) return pB.totalSets - pA.totalSets;
        return pB.totalQuestions - pA.totalQuestions;
      })
      .slice(0, 9);

    // Thống kê trên toàn bộ các bộ đề (Quiz Sets)
    let totalQuestions = 0;
    let totalMastered = 0;
    const startedSets: Array<{
      set: QuizSetInfo;
      course: Course | undefined;
      total: number;
      mastered: number;
      percent: number;
    }> = [];
    const completedSets: QuizSetInfo[] = [];

    for (const set of quizSets) {
      const prog = getQuizSetProgress(set);
      totalQuestions += prog.total;
      totalMastered += prog.mastered;
      if (prog.mastered > 0) {
        startedSets.push({
          set,
          course: set.courseId ? courseMap.get(set.courseId) : undefined,
          total: prog.total,
          mastered: prog.mastered,
          percent: prog.percent,
        });
      }
      if (prog.total > 0 && prog.percent >= 100) {
        completedSets.push(set);
      }
    }

    startedSets.sort((a, b) => {
      if (b.percent !== a.percent) return b.percent - a.percent;
      return b.mastered - a.mastered;
    });

    const overallPercent = totalQuestions > 0 ? Math.round((totalMastered / totalQuestions) * 100) : 0;

    // Flashcard stats
    const fcProg = flashcardSets.length > 0
      ? getFlashcardProgress(flashcardSets[0])
      : { total: 0, known: 0, percent: 0 };

    // Thống kê theo 7 khối ngành FPTU
    const majorKeys: MajorCategoryKey[] = [
      'it',
      'economics',
      'marketing',
      'media',
      'design',
      'politics',
      'language',
    ];

    const majorStats = majorKeys.map((key) => {
      const meta = CATEGORY_META_MAP[key];
      const majorCourses = courses.filter((c) => getCourseCategories(c).includes(key));
      let mStudiedCourses = 0;
      let mPassedCourses = 0;
      let mTotalSets = 0;
      let mTotalQuestions = 0;
      let mMasteredQuestions = 0;

      for (const c of majorCourses) {
        const p = courseProgressMap.get(c.id);
        if (!p) continue;
        mTotalSets += p.totalSets;
        mTotalQuestions += p.totalQuestions;
        mMasteredQuestions += p.masteredQuestions;
        if (p.masteredQuestions > 0 || p.percent > 0) mStudiedCourses++;
        if (p.isPassed) mPassedCourses++;
      }

      const mPercent = mTotalQuestions > 0 ? Math.round((mMasteredQuestions / mTotalQuestions) * 100) : 0;

      return {
        key,
        meta,
        totalCourses: majorCourses.length,
        studiedCourses: mStudiedCourses,
        passedCourses: mPassedCourses,
        totalSets: mTotalSets,
        totalQuestions: mTotalQuestions,
        masteredQuestions: mMasteredQuestions,
        percent: mPercent,
      };
    });

    return {
      courseProgressMap,
      studiedCourses,
      inProgressCourses,
      passedCourses,
      recentCourses,
      activeOrRecentCourses,
      featuredCourses,
      totalQuestions,
      totalMastered,
      overallPercent,
      startedSets,
      completedSets,
      flashcardTotal: fcProg.total,
      flashcardKnown: fcProg.known,
      flashcardPercent: fcProg.percent,
      majorStats,
    };
  }, [courses, quizSets, flashcardSets]);

  // Compute filtered & sorted courses for Library tab
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
        const pA = studyStats.courseProgressMap.get(a.id)?.percent ?? 0;
        const pB = studyStats.courseProgressMap.get(b.id)?.percent ?? 0;
        return pB - pA;
      });
    } else if (sortOrder === 'questions_desc') {
      list = [...list].sort((a, b) => {
        const qA = studyStats.courseProgressMap.get(a.id)?.totalQuestions ?? 0;
        const qB = studyStats.courseProgressMap.get(b.id)?.totalQuestions ?? 0;
        return qB - qA;
      });
    }

    return list;
  }, [courses, searchQuery, selectedCategory, sortOrder, studyStats.courseProgressMap]);

  // Danh sách môn hiển thị ở khu vực "Đang học & Gần đây" trên Trang chủ
  const homeActiveList = useMemo(() => {
    if (homeSubFilter === 'studying') return studyStats.studiedCourses;
    if (homeSubFilter === 'passed') return studyStats.passedCourses;
    if (homeSubFilter === 'recent') return studyStats.recentCourses;
    return studyStats.activeOrRecentCourses;
  }, [homeSubFilter, studyStats]);

  // Hàm render 1 thẻ môn học (dùng chung cho cả Trang chủ và Thư viện)
  const renderCourseCard = (course: Course) => {
    const courseTheme = getCourseTheme(course, theme);
    const courseCategories = getCourseCategories(course);

    const handleCardPointerMove = (e: React.MouseEvent<HTMLElement>) => {
      if (!mouseEffectsEnabled) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y - rect.height / 2) / (rect.height / 2)) * -4.2;
      const ry = ((x - rect.width / 2) / (rect.width / 2)) * 4.2;
      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);
      el.style.setProperty('--card-rx', `${rx.toFixed(2)}deg`);
      el.style.setProperty('--card-ry', `${ry.toFixed(2)}deg`);
    };

    const handleCardPointerLeave = (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      el.style.setProperty('--card-rx', '0deg');
      el.style.setProperty('--card-ry', '0deg');
    };

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
            '--subj-primary': courseTheme.primary,
            '--subj-soft': courseTheme.soft,
            '--subj-border': courseTheme.border,
            '--subj-hover-shadow': courseTheme.hoverShadow,
          } as React.CSSProperties}
          onMouseMove={handleCardPointerMove}
          onMouseLeave={handleCardPointerLeave}
          onClick={() => onSelectFlashcard(fcSet)}
        >
          <div className="subject-card-header">
            <div className="subject-icon-box">
              {renderSubjectIcon(courseTheme.icon)}
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

          <div className="subject-progress-section">
            <div className="subject-progress-header">
              <span className="subject-progress-label">Tiến độ ôn tập</span>
              <span className="subject-progress-percent">{percent}%</span>
            </div>
            <div className="subject-progress-track">
              <div className="subject-progress-bar" style={{ width: `${percent}%` }} />
            </div>
          </div>

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
    const progress = studyStats.courseProgressMap.get(course.id) ?? calculateCourseProgress(course.id, quizSets);
    const isPassed = (course as any).isPassed === true || (progress.totalQuestions > 0 && progress.percent >= 100);

    return (
      <article
        key={course.id}
        className="subject-card"
        style={{
          '--subj-primary': courseTheme.primary,
          '--subj-soft': courseTheme.soft,
          '--subj-border': courseTheme.border,
          '--subj-hover-shadow': courseTheme.hoverShadow,
        } as React.CSSProperties}
        onMouseMove={handleCardPointerMove}
        onMouseLeave={handleCardPointerLeave}
        onClick={() => onSelectCourse(course)}
      >
        <div className="subject-card-header">
          <div className="subject-icon-box">
            {renderSubjectIcon(courseTheme.icon)}
          </div>

          <div className="subject-info-body">
            <div className="subject-pill-row">
              <span className="subject-code-badge">Môn {course.code}</span>
              {courseCategories.map((catKey) => {
                const cm = CATEGORY_META_MAP[catKey];
                return (
                  <span
                    key={catKey}
                    className="subject-major-tag"
                    style={
                      {
                        '--tag-color': cm.primary,
                        '--tag-bg': cm.soft,
                        '--tag-border': cm.border,
                      } as React.CSSProperties
                    }
                  >
                    {cm.shortLabel}
                  </span>
                );
              })}
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

        <div className="subject-progress-section">
          <div className="subject-progress-header">
            <span className="subject-progress-label">Tiến độ ôn tập</span>
            <span className="subject-progress-percent">{progress.percent}%</span>
          </div>
          <div className="subject-progress-track">
            <div className="subject-progress-bar" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>

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
  };

  return (
    <div className={`home-dashboard theme-${theme} home-${theme}`}>
      {/* ====================================================================
          1. HEADER NAVIGATION
          ==================================================================== */}
      <header className="home-navbar">
        <div className="home-navbar-inner">
          {/* Brand Logo */}
          <div
            className="home-brand"
            role="button"
            tabIndex={0}
            onClick={() => switchTab('home')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') switchTab('home');
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="home-logo-box">K</div>
            <div className="home-brand-text">
              <span className="home-brand-name">KEYT</span>
              <span className="home-brand-subtitle">Quiz tự học</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="home-nav-links">
            <button
              type="button"
              className={`home-nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => switchTab('home')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Trang chủ</span>
            </button>

            <button
              type="button"
              className={`home-nav-item ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => switchTab('library')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Thư viện</span>
            </button>

            <button
              type="button"
              className={`home-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => switchTab('stats')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>Thống kê</span>
            </button>

            {/* Quick Toggle: Hover Auto-Translate (Default OFF) */}
            <button
              type="button"
              className={`global-mouse-fx-toggle-btn global-translate-toggle-btn ${hoverTranslateEnabled ? 'is-on' : 'is-off'}`}
              onClick={toggleHoverTranslate}
              title={
                hoverTranslateEnabled
                  ? 'Đang BẬT chế độ di chuột vào tự dịch tiếng Việt (Bấm để tắt)'
                  : 'Đang TẮT chế độ di chuột vào tự dịch (Mặc định tắt — Bấm để bật)'
              }
              aria-pressed={hoverTranslateEnabled}
            >
              <span>🌐</span>
              <span>{hoverTranslateEnabled ? 'Tự dịch: Bật' : 'Tự dịch: Tắt'}</span>
            </button>

            {/* Quick Toggle: Mouse Sparkle Effect */}
            <button
              type="button"
              className={`global-mouse-fx-toggle-btn ${mouseEffectsEnabled ? 'is-on' : 'is-off'}`}
              onClick={toggleMouseEffects}
              title={
                mouseEffectsEnabled
                  ? 'Đang BẬT hiệu ứng di chuột lấp lánh (Bấm để tắt chống rối mắt)'
                  : 'Đang TẮT hiệu ứng di chuột lấp lánh (Bấm để bật lại)'
              }
            >
              <span>{mouseEffectsEnabled ? '✨' : '🛡️'}</span>
              <span>{mouseEffectsEnabled ? 'Hiệu ứng chuột: Bật' : 'Hiệu ứng chuột: Tắt'}</span>
            </button>

            {/* Global Theme Selector Button */}
            <button
              type="button"
              className="global-theme-toggle-btn"
              onClick={openThemeModal}
              title="Đổi giao diện học tập"
            >
              <span>🎨</span>
              <span>Giao diện</span>
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
          TAB 1: TRANG CHỦ (HERO + TIẾN ĐỘ ĐANG HỌC / GẦN ĐÂY + LỐI TẮT NGÀNH)
          ==================================================================== */}
      {activeTab === 'home' && (
        <>
          <section className="home-hero">
            <div className="home-hero-left">
              <span className="home-hero-eyebrow">{heroDetails.eyebrow}</span>
              <h1 className="home-hero-title">
                {heroDetails.titlePre}
                <span className="home-gradient-text">{heroDetails.titleHighlight}</span>
              </h1>
              <p className="home-hero-desc">{heroDetails.desc}</p>

              <div className="home-hero-cta-row">
                <button
                  type="button"
                  className="home-hero-primary-btn"
                  onClick={() => switchTab('library')}
                >
                  <span>📚 Khám phá Thư viện ({courses.length} môn)</span>
                  <span aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  className="home-hero-secondary-btn"
                  onClick={() => switchTab('stats')}
                >
                  <span>📊 Xem Thống kê học tập</span>
                </button>
              </div>

              {theme === 'shin-kasukabe' && (
                <div className="shin-home-scene-bar" role="group" aria-label="Chọn cảnh Kasukabe">
                  <span className="shin-home-scene-label">🎬 Đổi cảnh 3D:</span>
                  {(
                    [
                      { id: 'room', label: '📚 Phòng học' },
                      { id: 'meadow', label: '🌿 Bãi cỏ' },
                      { id: 'hills', label: '☁️ Đồi cừu' },
                      { id: 'rain', label: '🌧️ Phố mưa (Dark)' },
                    ] as const
                  ).map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      className={`shin-home-scene-chip ${shinScene === sc.id ? 'is-active' : ''}`}
                      onClick={() => setShinScene(sc.id)}
                      aria-pressed={shinScene === sc.id}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              )}

              {theme === 'billionaire-vault' && (
                <div className="money-home-finish-bar" role="group" aria-label="Chọn chất liệu Billionaire Vault">
                  <span className="money-home-finish-label">💳 Chất liệu thẻ:</span>
                  {(
                    [
                      { id: 'obsidian', label: '🖤 Obsidian Black' },
                      { id: 'emerald', label: '💚 Emerald Old Money' },
                      { id: 'gold', label: '🏆 24K Gold Vault' },
                    ] as const
                  ).map((fin) => (
                    <button
                      key={fin.id}
                      type="button"
                      className={`money-home-finish-chip ${moneyFinish === fin.id ? 'is-active' : ''}`}
                      onClick={() => setMoneyFinish(fin.id)}
                      aria-pressed={moneyFinish === fin.id}
                    >
                      {fin.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="home-hero-right">
              <div className="home-hero-3d-stage">
                <ThemeHero3DDiorama theme={theme} height={250} />
              </div>
            </div>
          </section>

          {/* 4 Thẻ Tóm tắt Nhanh */}
          <section className="home-overview-section">
            <div className="home-overview-grid">
              <div
                className="home-overview-card clickable"
                onClick={() => switchTab('library')}
                role="button"
                tabIndex={0}
              >
                <div className="home-overview-icon purple">📚</div>
                <div className="home-overview-body">
                  <span className="home-overview-value">{courses.length} môn · {quizSets.length} đề</span>
                  <span className="home-overview-label">Kho đề FPT University</span>
                  <span className="home-overview-sub">{studyStats.totalQuestions.toLocaleString('vi-VN')} câu trắc nghiệm</span>
                </div>
              </div>

              <div
                className="home-overview-card clickable"
                onClick={() => switchTab('stats')}
                role="button"
                tabIndex={0}
              >
                <div className="home-overview-icon blue">🔥</div>
                <div className="home-overview-body">
                  <span className="home-overview-value">
                    {studyStats.studiedCourses.length} môn đang học
                  </span>
                  <span className="home-overview-label">Môn học có tiến độ &gt; 0%</span>
                  <span className="home-overview-sub">
                    Đã Pass 100%: {studyStats.passedCourses.length} môn
                  </span>
                </div>
              </div>

              <div
                className="home-overview-card clickable"
                onClick={() => switchTab('stats')}
                role="button"
                tabIndex={0}
              >
                <div className="home-overview-icon green">✅</div>
                <div className="home-overview-body">
                  <span className="home-overview-value">
                    {studyStats.startedSets.length} / {quizSets.length} bộ đề
                  </span>
                  <span className="home-overview-label">Bộ đề đã luyện tập</span>
                  <span className="home-overview-sub">
                    Hoàn thành 100%: {studyStats.completedSets.length} bộ đề
                  </span>
                </div>
              </div>

              <div
                className="home-overview-card clickable"
                onClick={() => switchTab('stats')}
                role="button"
                tabIndex={0}
              >
                <div className="home-overview-icon amber">🎯</div>
                <div className="home-overview-body">
                  <span className="home-overview-value">
                    {studyStats.totalMastered.toLocaleString('vi-VN')} câu
                  </span>
                  <span className="home-overview-label">Câu hỏi đã trả lời đúng</span>
                  <span className="home-overview-sub">
                    Tổng tiến độ toàn kho: {studyStats.overallPercent}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Khu vực 1: Môn đang học (Tiến độ > 0%) & Vừa xem gần đây */}
          <section className="home-section-block">
            <div className="home-section-header">
              <div>
                <h2 className="home-section-title">⚡ Môn đang ôn tập &amp; Vừa xem gần đây</h2>
                <p className="home-section-subtitle">
                  Các môn học bạn đã có tiến độ làm bài (&gt; 0%) hoặc vừa mở xem gần nhất để tiếp tục học ngay.
                </p>
              </div>

              <div className="home-subfilter-pills">
                <button
                  type="button"
                  className={`home-subfilter-pill ${homeSubFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setHomeSubFilter('all')}
                >
                  Tất cả ({studyStats.activeOrRecentCourses.length})
                </button>
                <button
                  type="button"
                  className={`home-subfilter-pill ${homeSubFilter === 'studying' ? 'active' : ''}`}
                  onClick={() => setHomeSubFilter('studying')}
                >
                  Tiến độ &gt; 0% ({studyStats.studiedCourses.length})
                </button>
                <button
                  type="button"
                  className={`home-subfilter-pill ${homeSubFilter === 'passed' ? 'active' : ''}`}
                  onClick={() => setHomeSubFilter('passed')}
                >
                  Đã Pass ({studyStats.passedCourses.length})
                </button>
                <button
                  type="button"
                  className={`home-subfilter-pill ${homeSubFilter === 'recent' ? 'active' : ''}`}
                  onClick={() => setHomeSubFilter('recent')}
                >
                  Vừa xem ({studyStats.recentCourses.length})
                </button>
              </div>
            </div>

            {homeActiveList.length === 0 ? (
              <div className="home-empty-progress-banner">
                <div className="home-empty-progress-left">
                  <span className="home-empty-progress-icon">🚀</span>
                  <div>
                    <h3>Bạn chưa có môn nào ở mục này</h3>
                    <p>
                      Hãy chọn một môn học bất kỳ bên dưới hoặc mở <strong>Thư viện 207 môn</strong> để bắt đầu làm đề — hệ thống sẽ tự động lưu lại tiến độ và các môn bạn vừa học tại đây!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="home-empty-btn"
                  onClick={() => switchTab('library')}
                >
                  Mở Thư viện 207 môn →
                </button>
              </div>
            ) : (
              <div className="home-cards-grid">
                {homeActiveList.map((course) => renderCourseCard(course))}
              </div>
            )}
          </section>

          {/* Khu vực 2: Khám phá nhanh theo 7 khối ngành FPTU */}
          <section className="home-section-block">
            <div className="home-section-header">
              <div>
                <h2 className="home-section-title">🎓 Khám phá theo 7 Khối ngành FPT University</h2>
                <p className="home-section-subtitle">
                  Bấm vào từng khối ngành để lọc toàn bộ các môn chuyên ngành và môn học giao thoa (2–4 ngành học chung).
                </p>
              </div>
              <button
                type="button"
                className="home-section-link-btn"
                onClick={() => openLibraryWithCategory('all')}
              >
                Xem tất cả {courses.length} môn →
              </button>
            </div>

            <div className="home-major-grid">
              {studyStats.majorStats.map((m) => (
                <div
                  key={m.key}
                  className="home-major-card"
                  style={
                    {
                      '--major-color': m.meta.primary,
                      '--major-soft': m.meta.soft,
                      '--major-border': m.meta.border,
                    } as React.CSSProperties
                  }
                  onClick={() => openLibraryWithCategory(m.key)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="home-major-card-top">
                    <span className="home-major-badge">{m.meta.shortLabel}</span>
                    <span className="home-major-count">{m.totalCourses} môn</span>
                  </div>
                  <h3 className="home-major-title">{m.meta.label}</h3>
                  <p className="home-major-meta">
                    {m.totalSets} bộ đề · {m.totalQuestions.toLocaleString('vi-VN')} câu hỏi
                  </p>
                  <div className="home-major-progress-row">
                    <span>Đã học: {m.studiedCourses}/{m.totalCourses} môn</span>
                    <strong>{m.percent}%</strong>
                  </div>
                  <div className="home-major-bar-track">
                    <div className="home-major-bar-fill" style={{ width: `${m.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Khu vực 3: Môn học tiêu biểu nhiều bộ đề nhất */}
          <section className="home-section-block" style={{ marginBottom: 40 }}>
            <div className="home-section-header">
              <div>
                <h2 className="home-section-title">🔥 Môn học tiêu biểu nhiều bộ đề nhất</h2>
                <p className="home-section-subtitle">
                  Các môn đại cương, chính trị, quản lý dự án và chuyên ngành có kho đề lớn nhất tại FPTU.
                </p>
              </div>
              <button
                type="button"
                className="home-section-link-btn"
                onClick={() => switchTab('library')}
              >
                Mở toàn bộ Thư viện ({courses.length} môn) →
              </button>
            </div>

            <div className="home-cards-grid">
              {studyStats.featuredCourses.map((course) => renderCourseCard(course))}
            </div>
          </section>
        </>
      )}

      {/* ====================================================================
          TAB 2: THƯ VIỆN (TOÀN BỘ 207 MÔN HỌC & 566 BỘ ĐỀ + BỘ LỌC 7 NGÀNH)
          ==================================================================== */}
      {activeTab === 'library' && (
        <>
          <section className="home-hero">
            <div className="home-hero-left">
              <span className="home-hero-eyebrow">{heroDetails.eyebrow}</span>
              <h1 className="home-hero-title">
                {heroDetails.titlePre}
                <span className="home-gradient-text">{heroDetails.titleHighlight}</span>
              </h1>
              <p className="home-hero-desc">{heroDetails.desc}</p>

              {theme === 'shin-kasukabe' && (
                <div className="shin-home-scene-bar" role="group" aria-label="Chọn cảnh Kasukabe">
                  <span className="shin-home-scene-label">🎬 Đổi cảnh 3D:</span>
                  {(
                    [
                      { id: 'room', label: '📚 Phòng học' },
                      { id: 'meadow', label: '🌿 Bãi cỏ' },
                      { id: 'hills', label: '☁️ Đồi cừu' },
                      { id: 'rain', label: '🌧️ Phố mưa (Dark)' },
                    ] as const
                  ).map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      className={`shin-home-scene-chip ${shinScene === sc.id ? 'is-active' : ''}`}
                      onClick={() => setShinScene(sc.id)}
                      aria-pressed={shinScene === sc.id}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              )}

              {theme === 'billionaire-vault' && (
                <div className="money-home-finish-bar" role="group" aria-label="Chọn chất liệu Billionaire Vault">
                  <span className="money-home-finish-label">💳 Chất liệu thẻ:</span>
                  {(
                    [
                      { id: 'obsidian', label: '🖤 Obsidian Black' },
                      { id: 'emerald', label: '💚 Emerald Old Money' },
                      { id: 'gold', label: '🏆 24K Gold Vault' },
                    ] as const
                  ).map((fin) => (
                    <button
                      key={fin.id}
                      type="button"
                      className={`money-home-finish-chip ${moneyFinish === fin.id ? 'is-active' : ''}`}
                      onClick={() => setMoneyFinish(fin.id)}
                      aria-pressed={moneyFinish === fin.id}
                    >
                      {fin.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="home-hero-right">
              <div className="home-hero-3d-stage">
                <ThemeHero3DDiorama theme={theme} height={250} />
              </div>
            </div>
          </section>

          <section className="home-search-filter-section">
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
                  placeholder="Tìm kiếm mã môn hoặc tên môn học (VD: IPR102, SWD392, MKT, JPD...)"
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

            <div className="home-category-chips">
              {COURSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`home-category-chip ${selectedCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.key === 'all' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  ) : cat.key === 'it' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  ) : cat.key === 'economics' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="3" y1="22" x2="21" y2="22" />
                      <line x1="6" y1="18" x2="6" y2="11" />
                      <line x1="10" y1="18" x2="10" y2="11" />
                      <line x1="14" y1="18" x2="14" y2="11" />
                      <line x1="18" y1="18" x2="18" y2="11" />
                      <polygon points="12 2 20 7 4 7" />
                    </svg>
                  ) : cat.key === 'marketing' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <circle cx="7" cy="7" r="1.5" />
                    </svg>
                  ) : cat.key === 'media' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  ) : cat.key === 'design' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 19l7-7 3 3-7 7-3-3z" />
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                      <path d="M2 2l7.586 7.586" />
                      <circle cx="11" cy="11" r="2" />
                    </svg>
                  ) : cat.key === 'politics' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  )}
                  <span>{cat.label}</span>
                  <span className="home-category-count">{categoryCounts[cat.key]}</span>
                </button>
              ))}
            </div>
          </section>

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
                displayedCourses.map((course) => renderCourseCard(course))
              )}

              {/* Thẻ Tạo môn học mới */}
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
        </>
      )}

      {/* ====================================================================
          TAB 3: THỐNG KÊ HỌC TẬP CÁ NHÂN (PERSONAL ANALYTICS DASHBOARD)
          ==================================================================== */}
      {activeTab === 'stats' && (
        <main className="stats-dashboard-container">
          {/* Header Banner Thống kê */}
          <section className="stats-hero-banner">
            <div className="stats-hero-text">
              <span className="home-hero-eyebrow">📊 THỐNG KÊ HỌC TẬP CÁ NHÂN · FPT UNIVERSITY</span>
              <h1 className="stats-hero-title">Hồ sơ Tiến độ &amp; Năng lực Ôn tập</h1>
              <p className="stats-hero-desc">
                Theo dõi trực tiếp số môn đã học, số bộ đề đã hoàn thành, tổng số câu trả lời đúng và tỷ lệ hoàn thành trên từng khối ngành đào tạo của Đại học FPT.
              </p>
            </div>
            <div className="stats-hero-actions">
              <button
                type="button"
                className="home-hero-primary-btn"
                onClick={() => switchTab('library')}
              >
                <span>📚 Vào Thư viện luyện đề</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>

          {/* 4 KPI Cards */}
          <section className="stats-kpi-grid">
            <div className="stats-kpi-card">
              <div className="stats-kpi-top">
                <span className="stats-kpi-label">Môn học đã tham gia</span>
                <span className="stats-kpi-icon purple">📘</span>
              </div>
              <div className="stats-kpi-value">
                {studyStats.studiedCourses.length}
                <span className="stats-kpi-total"> / {courses.length} môn</span>
              </div>
              <div className="stats-kpi-sub">
                Đã Pass 100%: <strong>{studyStats.passedCourses.length} môn</strong> · Đang học: <strong>{studyStats.inProgressCourses.length} môn</strong>
              </div>
            </div>

            <div className="stats-kpi-card">
              <div className="stats-kpi-top">
                <span className="stats-kpi-label">Bộ đề đã luyện tập</span>
                <span className="stats-kpi-icon blue">📝</span>
              </div>
              <div className="stats-kpi-value">
                {studyStats.startedSets.length}
                <span className="stats-kpi-total"> / {quizSets.length} đề</span>
              </div>
              <div className="stats-kpi-sub">
                Hoàn thành 100%: <strong>{studyStats.completedSets.length} bộ đề</strong>
              </div>
            </div>

            <div className="stats-kpi-card">
              <div className="stats-kpi-top">
                <span className="stats-kpi-label">Câu hỏi đã trả lời đúng</span>
                <span className="stats-kpi-icon green">🎯</span>
              </div>
              <div className="stats-kpi-value">
                {studyStats.totalMastered.toLocaleString('vi-VN')}
                <span className="stats-kpi-total"> / {studyStats.totalQuestions.toLocaleString('vi-VN')}</span>
              </div>
              <div className="stats-kpi-sub">
                Tỷ lệ chinh phục toàn kho: <strong>{studyStats.overallPercent}%</strong>
              </div>
            </div>

            <div className="stats-kpi-card">
              <div className="stats-kpi-top">
                <span className="stats-kpi-label">Thẻ ghi nhớ (Flashcards)</span>
                <span className="stats-kpi-icon amber">🗂️</span>
              </div>
              <div className="stats-kpi-value">
                {studyStats.flashcardKnown}
                <span className="stats-kpi-total"> / {studyStats.flashcardTotal} thẻ</span>
              </div>
              <div className="stats-kpi-sub">
                Tiến độ thuộc thuật ngữ: <strong>{studyStats.flashcardPercent}%</strong>
              </div>
            </div>
          </section>

          {/* Biểu đồ tiến độ theo 7 khối ngành FPT University */}
          <section className="stats-panel-card">
            <div className="stats-panel-header">
              <div>
                <h2 className="stats-panel-title">📈 Biểu đồ Tiến độ theo 7 Khối ngành FPT University</h2>
                <p className="stats-panel-subtitle">
                  Thống kê chi tiết số môn, số bộ đề và số câu hỏi đã thuộc trên từng khối ngành (bao gồm các môn giao thoa học chung).
                </p>
              </div>
            </div>

            <div className="stats-major-bars-list">
              {studyStats.majorStats.map((m) => (
                <div
                  key={m.key}
                  className="stats-major-row"
                  style={
                    {
                      '--row-color': m.meta.primary,
                      '--row-soft': m.meta.soft,
                      '--row-border': m.meta.border,
                    } as React.CSSProperties
                  }
                >
                  <div className="stats-major-row-head">
                    <div className="stats-major-row-title-group">
                      <span className="stats-major-pill">{m.meta.shortLabel}</span>
                      <span className="stats-major-name">{m.meta.label}</span>
                    </div>

                    <div className="stats-major-row-metrics">
                      <span>
                        <strong>{m.studiedCourses}</strong>/{m.totalCourses} môn đã học
                      </span>
                      <span className="stats-dot">·</span>
                      <span>
                        <strong>{m.passedCourses}</strong> môn Pass
                      </span>
                      <span className="stats-dot">·</span>
                      <span>
                        <strong>{m.masteredQuestions.toLocaleString('vi-VN')}</strong>/{m.totalQuestions.toLocaleString('vi-VN')} câu ({m.percent}%)
                      </span>
                      <button
                        type="button"
                        className="stats-major-go-btn"
                        onClick={() => openLibraryWithCategory(m.key)}
                      >
                        Ôn ngành này →
                      </button>
                    </div>
                  </div>

                  <div className="stats-major-bar-track">
                    <div
                      className="stats-major-bar-fill"
                      style={{ width: `${Math.max(m.percent, m.studiedCourses > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2 Cột: Môn đang học & Bộ đề đã luyện */}
          <section className="stats-two-col-grid">
            {/* Cột 1: Môn học đã có tiến độ */}
            <div className="stats-panel-card">
              <div className="stats-panel-header">
                <div>
                  <h2 className="stats-panel-title">
                    🏆 Các môn đã học ({studyStats.studiedCourses.length})
                  </h2>
                  <p className="stats-panel-subtitle">
                    Sắp xếp theo tỷ lệ hoàn thành từ cao xuống thấp. Bấm vào môn để mở danh sách đề.
                  </p>
                </div>
              </div>

              {studyStats.studiedCourses.length === 0 ? (
                <div className="stats-empty-box">
                  <p>Bạn chưa có môn học nào có tiến độ (&gt; 0%).</p>
                  <button
                    type="button"
                    className="home-empty-btn"
                    onClick={() => switchTab('library')}
                  >
                    Chọn môn học trong Thư viện →
                  </button>
                </div>
              ) : (
                <div className="stats-item-list">
                  {studyStats.studiedCourses.map((course) => {
                    const prog = studyStats.courseProgressMap.get(course.id)!;
                    const primaryCat = getCourseCategories(course)[0];
                    const cm = CATEGORY_META_MAP[primaryCat];
                    return (
                      <div
                        key={course.id}
                        className="stats-item-row"
                        onClick={() => onSelectCourse(course)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="stats-item-left">
                          <div className="stats-item-badges">
                            <span className="stats-item-code">{course.code}</span>
                            <span
                              className="subject-major-tag"
                              style={
                                {
                                  '--tag-color': cm.primary,
                                  '--tag-bg': cm.soft,
                                  '--tag-border': cm.border,
                                } as React.CSSProperties
                              }
                            >
                              {cm.shortLabel}
                            </span>
                            {prog.isPassed && <span className="stats-pass-pill">✓ PASS</span>}
                          </div>
                          <span className="stats-item-name">{course.name}</span>
                          <span className="stats-item-sub">
                            Đã thuộc {prog.masteredQuestions}/{prog.totalQuestions} câu ({prog.totalSets} bộ đề)
                          </span>
                        </div>

                        <div className="stats-item-right">
                          <span className="stats-item-percent">{prog.percent}%</span>
                          <div className="stats-mini-bar">
                            <div className="stats-mini-bar-fill" style={{ width: `${prog.percent}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cột 2: Các bộ đề đã luyện tập */}
            <div className="stats-panel-card">
              <div className="stats-panel-header">
                <div>
                  <h2 className="stats-panel-title">
                    📝 Các bộ đề đã làm ({studyStats.startedSets.length})
                  </h2>
                  <p className="stats-panel-subtitle">
                    Các bộ đề bạn đang làm dở hoặc đã hoàn thành. Bấm vào đề để vào thi tiếp ngay.
                  </p>
                </div>
              </div>

              {studyStats.startedSets.length === 0 ? (
                <div className="stats-empty-box">
                  <p>Bạn chưa bắt đầu làm bộ đề nào.</p>
                  <button
                    type="button"
                    className="home-empty-btn"
                    onClick={() => switchTab('library')}
                  >
                    Bắt đầu luyện đề ngay →
                  </button>
                </div>
              ) : (
                <div className="stats-item-list">
                  {studyStats.startedSets.slice(0, 30).map(({ set, course, total, mastered, percent }) => (
                    <div
                      key={set.id}
                      className="stats-item-row"
                      onClick={() => {
                        if (onSelectSet) {
                          onSelectSet(set);
                        } else if (course) {
                          onSelectCourse(course);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="stats-item-left">
                        <div className="stats-item-badges">
                          <span className="stats-item-code">{course?.code || set.courseId?.toUpperCase()}</span>
                          {percent >= 100 ? (
                            <span className="stats-pass-pill">✓ Hoàn thành</span>
                          ) : (
                            <span className="stats-doing-pill">Đang ôn</span>
                          )}
                        </div>
                        <span className="stats-item-name">{set.title}</span>
                        <span className="stats-item-sub">
                          Đã trả lời đúng {mastered}/{total} câu
                        </span>
                      </div>

                      <div className="stats-item-right">
                        <span className="stats-item-percent">{percent}%</span>
                        <div className="stats-mini-bar">
                          <div className="stats-mini-bar-fill" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      )}

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
