import React, { useEffect, useMemo, useState } from 'react';
import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import type { FlashcardSet } from '../data/flashcardData';
import { useAuth } from '../context/AuthContext';
import {
  fetchLeaderboard,
  isBackendConfigured,
  type LeaderboardResponse,
} from '../utils/backendApi';
import {
  CATEGORY_META_MAP,
  getCourseCategories,
  type MajorCategoryKey,
} from '../utils/courseCategories';
import { getMistakeQuestionIds } from '../utils/gameStorage';
import { loadMockExamHistory, type MockExamAttempt } from '../utils/mockExamStorage';
import { computeLocalRealXP } from '../utils/progressSync';
import {
  calculateLevel,
  getStudyStreak,
  getVietnamDateKey,
  XP_RULES,
} from '../utils/studyStats';
import { navigateTo, type HomeNavTab } from '../utils/router';
import './StatsDashboard.css';

interface CourseProgressEntry {
  totalSets: number;
  totalQuestions: number;
  masteredQuestions: number;
  percent: number;
  isPassed: boolean;
}

interface StartedSetEntry {
  set: QuizSetInfo;
  course: Course | undefined;
  total: number;
  mastered: number;
  percent: number;
}

interface MajorStatEntry {
  key: MajorCategoryKey;
  meta: (typeof CATEGORY_META_MAP)[MajorCategoryKey];
  totalCourses: number;
  studiedCourses: number;
  passedCourses: number;
  totalSets: number;
  totalQuestions: number;
  masteredQuestions: number;
  percent: number;
}

interface StatsDashboardProps {
  courses: Course[];
  quizSets: QuizSetInfo[];
  flashcardSets: FlashcardSet[];
  courseProgressMap: Map<string, CourseProgressEntry>;
  studiedCourses: Course[];
  inProgressCourses: Course[];
  passedCourses: Course[];
  startedSets: StartedSetEntry[];
  completedSets: QuizSetInfo[];
  totalMastered: number;
  studiedCoursesTotalQuestions: number;
  flashcardTotal: number;
  flashcardKnown: number;
  flashcardPercent: number;
  majorStats: MajorStatEntry[];
  onSelectCourse: (course: Course) => void;
  onSelectSet?: (set: QuizSetInfo) => void;
  onSelectFlashcard: (fcSet: FlashcardSet) => void;
  onSwitchTab: (tab: HomeNavTab) => void;
  onOpenMajorLibrary: (major: MajorCategoryKey) => void;
}

type DetailFilter = 'all' | 'in_progress' | 'near_done' | 'completed';

function buildLast35DaysHeatmap(
  studyDates: string[] | undefined,
  fallbackStreakDays: number
): Array<{ date: string; studied: boolean; isToday: boolean }> {
  const todayKey = getVietnamDateKey();
  const [y, m, d] = todayKey.split('-').map(Number);
  const dateSet = new Set(studyDates || []);
  const useFallback = !studyDates || studyDates.length === 0;
  const clampedFallback = Math.min(35, Math.max(0, fallbackStreakDays));

  const cells: Array<{ date: string; studied: boolean; isToday: boolean }> = [];
  for (let offset = -34; offset <= 0; offset += 1) {
    const dt = new Date(Date.UTC(y, m - 1, d + offset));
    const key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(
      dt.getUTCDate()
    ).padStart(2, '0')}`;
    const daysFromToday = -offset;
    const studied = useFallback
      ? clampedFallback > 0 && daysFromToday < clampedFallback
      : dateSet.has(key);
    cells.push({ date: key, studied, isToday: offset === 0 });
  }
  return cells;
}

export default function StatsDashboard({
  courses,
  quizSets,
  flashcardSets,
  courseProgressMap,
  studiedCourses,
  inProgressCourses,
  passedCourses,
  startedSets,
  completedSets,
  totalMastered,
  studiedCoursesTotalQuestions,
  flashcardTotal,
  flashcardKnown,
  flashcardPercent,
  majorStats,
  onSelectCourse,
  onSelectSet,
  onSelectFlashcard,
  onSwitchTab,
  onOpenMajorLibrary,
}: StatsDashboardProps) {
  const { user, profile, isAuthenticated, loginWithGoogle } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [detailSearch, setDetailSearch] = useState('');
  const [detailFilter, setDetailFilter] = useState<DetailFilter>('all');

  useEffect(() => {
    if (!isBackendConfigured()) return;
    let cancelled = false;
    fetchLeaderboard('xp', 5)
      .then((res) => {
        if (!cancelled) setLeaderboard(res);
      })
      .catch(() => {
        // ignore if offline
      });
    return () => {
      cancelled = true;
    };
  }, [user?.xp]);

  const activeXp = useMemo(() => {
    if (profile?.summary) return profile.summary.xp;
    return computeLocalRealXP(courses, quizSets, flashcardSets);
  }, [courses, flashcardSets, profile?.summary, quizSets]);

  const levelInfo = useMemo(() => calculateLevel(activeXp), [activeXp]);
  const xpProgressPercent = Math.min(
    100,
    Math.round((levelInfo.currentLevelXp / Math.max(1, levelInfo.nextLevelXp)) * 100)
  );

  const streakDays = profile?.summary.streakDays ?? getStudyStreak();
  const longestStreak = profile?.summary.longestStreakDays ?? streakDays;
  const totalStudyDays = profile?.summary.totalStudyDays ?? Math.max(streakDays, totalMastered > 0 ? 1 : 0);

  const xpBreakdown = useMemo(() => {
    if (profile?.summary.xpBreakdown) return profile.summary.xpBreakdown;
    return {
      masteredQuestionsXp: totalMastered * XP_RULES.perMasteredQuestion,
      flashcardsXp: flashcardKnown * XP_RULES.perKnownFlashcard,
      completedSetsXp: completedSets.length * XP_RULES.perCompletedSet,
      passedCoursesXp: passedCourses.length * XP_RULES.perPassedCourse,
      studyDaysXp: totalStudyDays * XP_RULES.perStudyDay,
    };
  }, [
    completedSets.length,
    flashcardKnown,
    passedCourses.length,
    profile?.summary.xpBreakdown,
    totalMastered,
    totalStudyDays,
  ]);

  const heatmapCells = useMemo(
    () => buildLast35DaysHeatmap(profile?.summary.studyDates, streakDays),
    [profile?.summary.studyDates, streakDays]
  );

  const studiedPercent =
    studiedCoursesTotalQuestions > 0
      ? Math.min(100, Math.round((totalMastered / studiedCoursesTotalQuestions) * 100))
      : 0;

  // 1. Donut chart segments based on proportion of user's mastered questions across the 7 majors
  const donutData = useMemo(() => {
    const activeMajors = majorStats
      .filter((m) => m.masteredQuestions > 0)
      .sort((a, b) => b.masteredQuestions - a.masteredQuestions);
    const sumMastered = activeMajors.reduce((acc, m) => acc + m.masteredQuestions, 0);
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    let cumulative = 0;

    const segments = activeMajors.map((m) => {
      const share = sumMastered > 0 ? m.masteredQuestions / sumMastered : 0;
      const length = share * circumference;
      const offset = cumulative;
      cumulative += length;
      return {
        key: m.key,
        label: m.meta.shortLabel,
        fullLabel: m.meta.label,
        color: m.meta.primary,
        mastered: m.masteredQuestions,
        sharePercent: Math.round(share * 100),
        dashArray: `${length} ${circumference - length}`,
        dashOffset: -offset,
      };
    });

    return { segments, sumMastered, radius, circumference };
  }, [majorStats]);

  // 2. Near-completion targets (40% - 99%)
  const nearCompletionItems = useMemo(() => {
    const list: Array<{
      id: string;
      kind: 'set' | 'flashcard';
      code: string;
      title: string;
      done: number;
      total: number;
      remaining: number;
      percent: number;
      set?: QuizSetInfo;
      course?: Course;
      fcSet?: FlashcardSet;
    }> = [];

    for (const s of startedSets) {
      if (s.percent >= 40 && s.percent < 100) {
        list.push({
          id: s.set.id,
          kind: 'set',
          code: s.course?.code || s.set.courseId?.toUpperCase() || 'QUIZ',
          title: s.set.title,
          done: s.mastered,
          total: s.total,
          remaining: Math.max(1, s.total - s.mastered),
          percent: s.percent,
          set: s.set,
          course: s.course,
        });
      }
    }

    if (flashcardSets.length > 0 && flashcardPercent >= 40 && flashcardPercent < 100) {
      list.push({
        id: flashcardSets[0].id,
        kind: 'flashcard',
        code: 'FLASHCARD',
        title: flashcardSets[0].title,
        done: flashcardKnown,
        total: flashcardTotal,
        remaining: Math.max(1, flashcardTotal - flashcardKnown),
        percent: flashcardPercent,
        fcSet: flashcardSets[0],
      });
    }

    return list.sort((a, b) => b.percent - a.percent).slice(0, 5);
  }, [flashcardKnown, flashcardPercent, flashcardSets, flashcardTotal, startedSets]);

  // 3. Mistake Bank Scanner (weak spots across sets)
  const weakSpots = useMemo(() => {
    const courseMap = new Map(courses.map((c) => [c.id, c]));
    const items: Array<{
      set: QuizSetInfo;
      courseCode: string;
      mistakeCount: number;
    }> = [];
    let totalMistakes = 0;

    for (const set of quizSets) {
      const mistakes = getMistakeQuestionIds(set.id);
      if (mistakes.length > 0) {
        totalMistakes += mistakes.length;
        const course = set.courseId ? courseMap.get(set.courseId) : undefined;
        items.push({
          set,
          courseCode: course?.code || set.courseId?.toUpperCase() || 'QUIZ',
          mistakeCount: mistakes.length,
        });
      }
    }

    items.sort((a, b) => b.mistakeCount - a.mistakeCount);
    return { totalMistakes, items: items.slice(0, 5) };
  }, [courses, quizSets]);

  // 4. Mock Exam Analytics across all quiz sets
  const mockExamStats = useMemo(() => {
    const courseMap = new Map(courses.map((c) => [c.id, c]));
    const allAttempts: Array<{
      attempt: MockExamAttempt;
      set: QuizSetInfo;
      courseCode: string;
    }> = [];

    for (const set of quizSets) {
      const history = loadMockExamHistory(set.id);
      if (history.length === 0) continue;
      const course = set.courseId ? courseMap.get(set.courseId) : undefined;
      const courseCode = course?.code || set.courseId?.toUpperCase() || 'QUIZ';
      for (const attempt of history) {
        allAttempts.push({ attempt, set, courseCode });
      }
    }

    allAttempts.sort(
      (a, b) => Date.parse(b.attempt.completedAt) - Date.parse(a.attempt.completedAt)
    );

    const count = allAttempts.length;
    const avgScore =
      count > 0
        ? Number((allAttempts.reduce((s, a) => s + a.attempt.score, 0) / count).toFixed(1))
        : 0;
    const bestScore =
      count > 0 ? Math.max(...allAttempts.map((a) => a.attempt.score)) : 0;
    const passCount = allAttempts.filter((a) => a.attempt.score >= 5).length;
    const passRate = count > 0 ? Math.round((passCount / count) * 100) : 0;

    return {
      count,
      avgScore,
      bestScore,
      passRate,
      recent: allAttempts.slice(0, 8),
    };
  }, [courses, quizSets]);

  // 5. Filtered detail lists
  const filteredStudiedCourses = useMemo(() => {
    const q = detailSearch.trim().toLowerCase();
    return studiedCourses.filter((course) => {
      const prog = courseProgressMap.get(course.id);
      if (!prog) return false;
      if (detailFilter === 'completed' && !prog.isPassed) return false;
      if (detailFilter === 'in_progress' && prog.isPassed) return false;
      if (detailFilter === 'near_done' && (prog.percent < 60 || prog.isPassed)) return false;
      if (!q) return true;
      return (
        course.code.toLowerCase().includes(q) ||
        course.name.toLowerCase().includes(q)
      );
    });
  }, [courseProgressMap, detailFilter, detailSearch, studiedCourses]);

  const filteredStartedSets = useMemo(() => {
    const q = detailSearch.trim().toLowerCase();
    return startedSets.filter(({ set, course, percent }) => {
      if (detailFilter === 'completed' && percent < 100) return false;
      if (detailFilter === 'in_progress' && percent >= 100) return false;
      if (detailFilter === 'near_done' && (percent < 60 || percent >= 100)) return false;
      if (!q) return true;
      return (
        set.title.toLowerCase().includes(q) ||
        (course?.code.toLowerCase().includes(q) ?? false) ||
        (course?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [detailFilter, detailSearch, startedSets]);

  const xpTotalForBar = Math.max(1, activeXp);
  const xpSegments = [
    { label: 'Câu đã thuộc', val: xpBreakdown.masteredQuestionsXp, color: '#6366f1' },
    { label: 'Flashcard', val: xpBreakdown.flashcardsXp, color: '#10b981' },
    { label: 'Bộ đề 100%', val: xpBreakdown.completedSetsXp, color: '#f59e0b' },
    { label: 'Môn PASS', val: xpBreakdown.passedCoursesXp, color: '#ec4899' },
    { label: 'Ngày học', val: xpBreakdown.studyDaysXp, color: '#38bdf8' },
  ].filter((seg) => seg.val > 0);

  return (
    <main className="s2-container">
      {/* ====================================================================
          1. PERSONALIZED ANALYTICS HERO
         ==================================================================== */}
      <section className="s2-hero">
        <div className="s2-hero-left">
          <span className="s2-eyebrow">📊 TRUNG TÂM PHÂN TÍCH HỌC TẬP · FPT UNIVERSITY</span>
          <h1 className="s2-title">
            {isAuthenticated && user
              ? `Năng lực Ôn thi của ${user.givenName || user.name}`
              : 'Phân tích Tiến độ & Năng lực Ôn tập'}
          </h1>
          <div className="s2-hero-badges">
            <span className="s2-pill is-accent">⭐ Level {levelInfo.level}</span>
            <span className="s2-pill">⚡ {activeXp.toLocaleString('vi-VN')} XP thật</span>
            <span className="s2-pill">🔥 {streakDays} ngày liên tiếp</span>
            {leaderboard?.myRank && (
              <span className="s2-pill is-gold">
                🏆 Hạng #{leaderboard.myRank.rank} / {leaderboard.totalActiveLearners} Top Học Bá
              </span>
            )}
          </div>
        </div>

        <div className="s2-hero-actions">
          {isAuthenticated ? (
            <button
              type="button"
              className="s2-btn-secondary"
              onClick={() => navigateTo('/profile')}
            >
              👤 Hồ sơ của tôi
            </button>
          ) : (
            <button
              type="button"
              className="s2-btn-secondary"
              onClick={() => loginWithGoogle('/stats')}
            >
              ☁️ Đăng nhập lưu tiến độ
            </button>
          )}
          <button
            type="button"
            className="s2-btn-primary"
            onClick={() => onSwitchTab('library')}
          >
            📚 Vào Thư viện đề →
          </button>
        </div>
      </section>

      {/* ====================================================================
          2. 4 GLASSMORPHIC KPI CARDS (NO WHITE STICKER BOXES!)
         ==================================================================== */}
      <section className="s2-kpi-grid">
        <div className="s2-kpi-card">
          <div className="s2-kpi-head">
            <span className="s2-kpi-label">Tiến độ các môn đang ôn</span>
            <span className="s2-kpi-icon is-indigo">🎯</span>
          </div>
          <div className="s2-kpi-value">
            {studiedPercent}%
            <span className="s2-kpi-unit"> · {totalMastered.toLocaleString('vi-VN')} câu</span>
          </div>
          <div className="s2-kpi-sub">
            Trên {studiedCoursesTotalQuestions.toLocaleString('vi-VN')} câu của{' '}
            <strong>{studiedCourses.length}</strong> môn đang học
          </div>
          <div className="s2-bar-track">
            <div className="s2-bar-fill" style={{ width: `${studiedPercent}%` }} />
          </div>
        </div>

        <div className="s2-kpi-card">
          <div className="s2-kpi-head">
            <span className="s2-kpi-label">Môn học &amp; Bộ đề</span>
            <span className="s2-kpi-icon is-emerald">📘</span>
          </div>
          <div className="s2-kpi-value">
            {studiedCourses.length}
            <span className="s2-kpi-unit"> môn · {startedSets.length} đề</span>
          </div>
          <div className="s2-kpi-sub">
            ✓ PASS 100%: <strong>{passedCourses.length} môn</strong> · Xong:{' '}
            <strong>{completedSets.length} bộ đề</strong>
          </div>
          <div className="s2-bar-track">
            <div
              className="s2-bar-fill is-emerald"
              style={{
                width: `${
                  startedSets.length > 0
                    ? Math.round((completedSets.length / startedSets.length) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="s2-kpi-card">
          <div className="s2-kpi-head">
            <span className="s2-kpi-label">Cấp độ &amp; XP thực tế</span>
            <span className="s2-kpi-icon is-amber">⚡</span>
          </div>
          <div className="s2-kpi-value">
            Lv.{levelInfo.level}
            <span className="s2-kpi-unit"> · {activeXp.toLocaleString('vi-VN')} XP</span>
          </div>
          <div className="s2-kpi-sub">
            Còn <strong>{levelInfo.remainingXp} XP</strong> lên Lv.{levelInfo.level + 1} · Kỷ lục{' '}
            <strong>{longestStreak} ngày</strong>
          </div>
          <div className="s2-bar-track">
            <div className="s2-bar-fill is-amber" style={{ width: `${xpProgressPercent}%` }} />
          </div>
        </div>

        <div className="s2-kpi-card">
          <div className="s2-kpi-head">
            <span className="s2-kpi-label">
              {mockExamStats.count > 0 ? 'Thi thử & Flashcards' : 'Thẻ ghi nhớ & Câu sai'}
            </span>
            <span className="s2-kpi-icon is-rose">🗂️</span>
          </div>
          {mockExamStats.count > 0 ? (
            <>
              <div className="s2-kpi-value">
                {mockExamStats.avgScore}
                <span className="s2-kpi-unit"> / 10 điểm TB</span>
              </div>
              <div className="s2-kpi-sub">
                {mockExamStats.count} lượt thi · Cao nhất <strong>{mockExamStats.bestScore}</strong>{' '}
                · Thẻ: <strong>{flashcardPercent}%</strong>
              </div>
              <div className="s2-bar-track">
                <div
                  className="s2-bar-fill is-rose"
                  style={{ width: `${Math.min(100, mockExamStats.avgScore * 10)}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="s2-kpi-value">
                {flashcardKnown}
                <span className="s2-kpi-unit"> / {flashcardTotal} thẻ</span>
              </div>
              <div className="s2-kpi-sub">
                Thuộc <strong>{flashcardPercent}%</strong> · Sổ câu sai:{' '}
                <strong>{weakSpots.totalMistakes} câu</strong>
              </div>
              <div className="s2-bar-track">
                <div className="s2-bar-fill is-rose" style={{ width: `${flashcardPercent}%` }} />
              </div>
            </>
          )}
        </div>
      </section>

      {/* ====================================================================
          3. VISUAL CHARTS: 7-MAJOR DONUT + 35-DAY ACTIVITY HEATMAP & XP BAR
         ==================================================================== */}
      <section className="s2-charts-grid">
        {/* LEFT: 7-Major Competence Donut + Glass Bars */}
        <div className="s2-panel">
          <div className="s2-panel-head">
            <div>
              <h2 className="s2-panel-title">🍩 Phân bổ Năng lực theo 7 Khối ngành</h2>
              <p className="s2-panel-sub">
                Tỷ trọng câu hỏi đã chinh phục theo từng ngành (bấm vào ngành để lọc kho đề ngay).
              </p>
            </div>
          </div>

          <div className="s2-donut-layout">
            <div className="s2-donut-wrap">
              <svg viewBox="0 0 150 150" className="s2-donut-svg">
                <circle cx="75" cy="75" r={donutData.radius} className="s2-donut-track" />
                {donutData.segments.map((seg) => (
                  <circle
                    key={seg.key}
                    cx="75"
                    cy="75"
                    r={donutData.radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="16"
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                    strokeLinecap="butt"
                  />
                ))}
              </svg>
              <div className="s2-donut-center">
                <strong>{totalMastered.toLocaleString('vi-VN')}</strong>
                <span>câu thuộc</span>
              </div>
            </div>

            <div className="s2-major-list">
              {majorStats.map((m) => {
                const sharePercent =
                  donutData.sumMastered > 0
                    ? Math.round((m.masteredQuestions / donutData.sumMastered) * 100)
                    : 0;
                const fillWidth =
                  m.masteredQuestions > 0 ? Math.max(sharePercent, 4) : 0;
                return (
                  <div
                    key={m.key}
                    className="s2-major-row"
                    style={{ '--m-color': m.meta.primary } as React.CSSProperties}
                  >
                    <div className="s2-major-top">
                      <div className="s2-major-left">
                        <span className="s2-major-dot" />
                        <span className="s2-major-code">{m.meta.shortLabel}</span>
                        <span className="s2-major-name">{m.meta.label}</span>
                      </div>
                      <div className="s2-major-right">
                        <span className="s2-major-nums">
                          <strong>{m.studiedCourses}</strong>/{m.totalCourses} môn ·{' '}
                          <strong>{m.masteredQuestions.toLocaleString('vi-VN')}</strong> câu
                          {sharePercent > 0 ? ` (${sharePercent}%)` : ''}
                        </span>
                        <button
                          type="button"
                          className="s2-major-btn"
                          onClick={() => onOpenMajorLibrary(m.key)}
                        >
                          Ôn →
                        </button>
                      </div>
                    </div>
                    <div className="s2-major-track">
                      <div className="s2-major-fill" style={{ width: `${fillWidth}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: 35-Day Heatmap + Real XP Sources */}
        <div className="s2-panel s2-panel--right">
          <div className="s2-panel-head">
            <div>
              <h2 className="s2-panel-title">🔥 Lịch nhiệt Học tập 35 ngày</h2>
              <p className="s2-panel-sub">
                Ghi nhận tự động theo giờ Việt Nam (GMT+7) mỗi ngày bạn làm bài thật.
              </p>
            </div>
          </div>

          <div className="s2-heatmap-grid" aria-label="Lịch nhiệt 35 ngày học gần nhất">
            {heatmapCells.map((cell) => {
              const label = `${cell.date.slice(8, 10)}/${cell.date.slice(5, 7)}/${cell.date.slice(0, 4)}`;
              return (
                <div
                  key={cell.date}
                  className={`s2-heat-cell ${cell.studied ? 'is-active' : ''} ${
                    cell.isToday ? 'is-today' : ''
                  }`}
                  title={`${label}: ${cell.studied ? 'Đã học ✓' : 'Chưa học'}`}
                >
                  <span>{cell.date.slice(8, 10)}</span>
                </div>
              );
            })}
          </div>

          <div className="s2-heat-meta">
            <span>
              🔥 Hiện tại: <strong>{streakDays} ngày</strong>
            </span>
            <span>
              🏆 Kỷ lục: <strong>{longestStreak} ngày</strong>
            </span>
            <span>
              📅 Tổng: <strong>{totalStudyDays} ngày học</strong>
            </span>
          </div>

          <div className="s2-divider" />

          <div className="s2-xp-section">
            <div className="s2-xp-head">
              <strong>⚡ Phân bổ nguồn XP thật</strong>
              <span>{activeXp.toLocaleString('vi-VN')} XP</span>
            </div>

            <div className="s2-xp-stacked-bar">
              {xpSegments.length === 0 ? (
                <div className="s2-xp-empty-bar" />
              ) : (
                xpSegments.map((seg) => (
                  <div
                    key={seg.label}
                    className="s2-xp-seg"
                    style={{
                      width: `${Math.max(3, (seg.val / xpTotalForBar) * 100)}%`,
                      backgroundColor: seg.color,
                    }}
                    title={`${seg.label}: +${seg.val.toLocaleString('vi-VN')} XP`}
                  />
                ))
              )}
            </div>

            <div className="s2-xp-legend">
              {xpSegments.map((seg) => (
                <span key={seg.label} className="s2-xp-tag">
                  <i style={{ backgroundColor: seg.color }} />
                  {seg.label}: <strong>+{seg.val.toLocaleString('vi-VN')}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. SMART ACTIONABLE INSIGHTS: NEAR-COMPLETION + WEAK SPOTS + MOCK EXAMS
         ==================================================================== */}
      <section className="s2-insights-grid">
        {/* Card A: Near Completion */}
        <div className="s2-panel">
          <div className="s2-panel-head">
            <div>
              <h2 className="s2-panel-title">🚀 Sắp cán đích 100%</h2>
              <p className="s2-panel-sub">
                Chốt nốt vài câu cuối để nhận thưởng +100 XP hoàn thành bộ đề!
              </p>
            </div>
          </div>

          {nearCompletionItems.length === 0 ? (
            <div className="s2-empty-mini">
              Chưa có bộ đề nào đạt từ 40% trở lên. Hãy chọn 1 bộ đề trong Thư viện để tăng tốc!
            </div>
          ) : (
            <div className="s2-action-list">
              {nearCompletionItems.map((item) => (
                <div
                  key={item.id}
                  className="s2-action-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (item.kind === 'flashcard' && item.fcSet) onSelectFlashcard(item.fcSet);
                    else if (item.set && onSelectSet) onSelectSet(item.set);
                    else if (item.course) onSelectCourse(item.course);
                  }}
                >
                  <div className="s2-action-left">
                    <div className="s2-action-top">
                      <span className="s2-code-tag">{item.code}</span>
                      <span className="s2-remaining-pill">
                        Còn {item.remaining} {item.kind === 'flashcard' ? 'thẻ' : 'câu'}
                      </span>
                    </div>
                    <strong className="s2-action-title">{item.title}</strong>
                  </div>
                  <div className="s2-action-right">
                    <span className="s2-action-pct">{item.percent}%</span>
                    <span className="s2-action-go">Chốt 100% →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card B: Weak Spots (Mistake Bank) */}
        <div className="s2-panel">
          <div className="s2-panel-head">
            <div>
              <h2 className="s2-panel-title">
                ⚠️ Điểm yếu cần khắc phục ({weakSpots.totalMistakes} câu sai)
              </h2>
              <p className="s2-panel-sub">
                Các bộ đề đang tích tụ nhiều câu làm sai trong Sổ lỗi — ưu tiên ôn lại trước thi.
              </p>
            </div>
          </div>

          {weakSpots.items.length === 0 ? (
            <div className="s2-empty-mini">
              🎉 Tuyệt vời! Sổ câu hay sai hiện đang trống. Các câu làm sai khi ôn sẽ tự gom về đây.
            </div>
          ) : (
            <div className="s2-action-list">
              {weakSpots.items.map(({ set, courseCode, mistakeCount }) => (
                <div
                  key={set.id}
                  className="s2-action-row is-warn"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (onSelectSet) onSelectSet(set);
                  }}
                >
                  <div className="s2-action-left">
                    <div className="s2-action-top">
                      <span className="s2-code-tag">{courseCode}</span>
                      <span className="s2-mistake-pill">{mistakeCount} câu sai</span>
                    </div>
                    <strong className="s2-action-title">{set.title}</strong>
                  </div>
                  <div className="s2-action-right">
                    <span className="s2-action-go">Gỡ lỗi →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card C: Mock Exam Analytics */}
        <div className="s2-panel">
          <div className="s2-panel-head">
            <div>
              <h2 className="s2-panel-title">📝 Lịch sử Thi thử (Mock Exam)</h2>
              <p className="s2-panel-sub">
                {mockExamStats.count > 0
                  ? `${mockExamStats.count} lượt thi · Tỷ lệ đậu (≥5đ): ${mockExamStats.passRate}%`
                  : 'Mô phỏng phòng thi bấm giờ để đo năng lực trước kỳ FE.'}
              </p>
            </div>
          </div>

          {mockExamStats.count === 0 ? (
            <div className="s2-empty-mini">
              Bạn chưa làm bài Thi thử nào. Mở bất kỳ bộ đề nào và chuyển sang chế độ{' '}
              <strong>Thi thử</strong> để ghi nhận biểu đồ điểm tại đây!
            </div>
          ) : (
            <>
              <div className="s2-mock-bars">
                {mockExamStats.recent
                  .slice()
                  .reverse()
                  .map(({ attempt, courseCode }) => (
                    <div
                      key={attempt.id}
                      className="s2-mock-col"
                      title={`${courseCode}: ${attempt.score}/10 (${attempt.percent}%)`}
                    >
                      <span className="s2-mock-val">{attempt.score}</span>
                      <div className="s2-mock-track">
                        <div
                          className={`s2-mock-fill ${attempt.score >= 5 ? 'is-pass' : 'is-fail'}`}
                          style={{ height: `${Math.max(10, attempt.score * 10)}%` }}
                        />
                      </div>
                      <span className="s2-mock-code">{courseCode.slice(0, 6)}</span>
                    </div>
                  ))}
              </div>
              <div className="s2-mock-summary">
                <span>
                  TB: <strong>{mockExamStats.avgScore}/10</strong>
                </span>
                <span>
                  Cao nhất: <strong>{mockExamStats.bestScore}/10</strong>
                </span>
                <span>
                  Đậu: <strong>{mockExamStats.passRate}%</strong>
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ====================================================================
          5. SEARCHABLE & FILTERABLE DETAIL LISTS (COURSES & QUIZ SETS)
         ==================================================================== */}
      <section className="s2-panel">
        <div className="s2-detail-toolbar">
          <div>
            <h2 className="s2-panel-title">
              📚 Chi tiết Môn đã học ({studiedCourses.length}) &amp; Bộ đề ({startedSets.length})
            </h2>
            <p className="s2-panel-sub">
              Tìm nhanh hoặc lọc để nhảy thẳng vào môn/đề bạn muốn luyện tiếp.
            </p>
          </div>

          <div className="s2-filter-controls">
            <input
              type="search"
              className="s2-search-input"
              placeholder="Tìm mã môn hoặc tên bộ đề..."
              value={detailSearch}
              onChange={(e) => setDetailSearch(e.target.value)}
            />
            <div className="s2-filter-pills">
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'in_progress', label: 'Đang ôn' },
                  { id: 'near_done', label: 'Sắp xong ≥60%' },
                  { id: 'completed', label: 'Hoàn thành' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`s2-filter-pill ${detailFilter === f.id ? 'active' : ''}`}
                  onClick={() => setDetailFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="s2-two-col">
          {/* Column 1: Studied Courses */}
          <div className="s2-list-col">
            <h3 className="s2-col-heading">
              🏆 Môn đã học ({filteredStudiedCourses.length})
            </h3>
            {filteredStudiedCourses.length === 0 ? (
              <div className="s2-empty-mini">
                {inProgressCourses.length === 0 && passedCourses.length === 0
                  ? 'Bạn chưa bắt đầu môn học nào.'
                  : 'Không có môn học nào khớp bộ lọc.'}
              </div>
            ) : (
              <div className="s2-item-list">
                {filteredStudiedCourses.map((course) => {
                  const prog = courseProgressMap.get(course.id)!;
                  const primaryCat = getCourseCategories(course)[0];
                  const cm = CATEGORY_META_MAP[primaryCat];
                  return (
                    <div
                      key={course.id}
                      className="s2-item-row"
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectCourse(course)}
                    >
                      <div className="s2-item-left">
                        <div className="s2-item-badges">
                          <span className="s2-code-tag">{course.code}</span>
                          <span
                            className="s2-cat-tag"
                            style={{ '--c-accent': cm.primary } as React.CSSProperties}
                          >
                            {cm.shortLabel}
                          </span>
                          {prog.isPassed && <span className="s2-pass-tag">✓ PASS</span>}
                        </div>
                        <span className="s2-item-title">{course.name}</span>
                        <span className="s2-item-sub">
                          Đã thuộc {prog.masteredQuestions}/{prog.totalQuestions} câu ({prog.totalSets}{' '}
                          bộ đề)
                        </span>
                      </div>
                      <div className="s2-item-right">
                        <span className="s2-item-pct">{prog.percent}%</span>
                        <div className="s2-mini-track">
                          <div
                            className={`s2-mini-fill ${prog.isPassed ? 'is-done' : ''}`}
                            style={{ width: `${prog.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2: Started Quiz Sets */}
          <div className="s2-list-col">
            <h3 className="s2-col-heading">
              📝 Bộ đề đã làm ({filteredStartedSets.length})
            </h3>
            {filteredStartedSets.length === 0 ? (
              <div className="s2-empty-mini">Không có bộ đề nào khớp bộ lọc.</div>
            ) : (
              <div className="s2-item-list">
                {filteredStartedSets.slice(0, 30).map(({ set, course, total, mastered, percent }) => (
                  <div
                    key={set.id}
                    className="s2-item-row"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (onSelectSet) onSelectSet(set);
                      else if (course) onSelectCourse(course);
                    }}
                  >
                    <div className="s2-item-left">
                      <div className="s2-item-badges">
                        <span className="s2-code-tag">
                          {course?.code || set.courseId?.toUpperCase() || 'QUIZ'}
                        </span>
                        {percent >= 100 ? (
                          <span className="s2-pass-tag">✓ Hoàn thành</span>
                        ) : (
                          <span className="s2-doing-tag">Đang ôn</span>
                        )}
                      </div>
                      <span className="s2-item-title">{set.title}</span>
                      <span className="s2-item-sub">
                        Đã thuộc {mastered}/{total} câu
                      </span>
                    </div>
                    <div className="s2-item-right">
                      <span className="s2-item-pct">{percent}%</span>
                      <div className="s2-mini-track">
                        <div
                          className={`s2-mini-fill ${percent >= 100 ? 'is-done' : ''}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
