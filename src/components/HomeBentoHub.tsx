import { useEffect, useMemo, useState } from 'react';
import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import type { FlashcardSet } from '../data/flashcardData';
import { useAuth } from '../context/AuthContext';
import {
  fetchLeaderboard,
  isBackendConfigured,
  type LeaderboardResponse,
} from '../utils/backendApi';
import { computeLocalRealXP } from '../utils/progressSync';
import { calculateLevel, getStudyStreak, getVietnamDateKey } from '../utils/studyStats';
import { navigateTo, type HomeNavTab } from '../utils/router';
import './HomeBentoHub.css';

interface StartedSetSummary {
  set: QuizSetInfo;
  course: Course | undefined;
  total: number;
  mastered: number;
  percent: number;
}

interface HomeBentoHubProps {
  courses: Course[];
  quizSets: QuizSetInfo[];
  flashcardSets: FlashcardSet[];
  studiedCourses: Course[];
  passedCourses: Course[];
  startedSets: StartedSetSummary[];
  completedSetsCount: number;
  totalMastered: number;
  studiedCoursesTotalQuestions: number;
  onSelectCourse: (course: Course) => void;
  onSelectSet?: (set: QuizSetInfo) => void;
  onSwitchTab: (tab: HomeNavTab) => void;
}

function buildGuestRecent7Days(streakDays: number): Array<{ date: string; studied: boolean }> {
  const todayKey = getVietnamDateKey();
  const [y, m, d] = todayKey.split('-').map(Number);
  const clamped = Math.min(7, Math.max(0, streakDays));
  const result: Array<{ date: string; studied: boolean }> = [];
  for (let offset = -6; offset <= 0; offset += 1) {
    const dt = new Date(Date.UTC(y, m - 1, d + offset));
    const key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(
      dt.getUTCDate()
    ).padStart(2, '0')}`;
    const daysFromToday = -offset;
    result.push({ date: key, studied: clamped > 0 && daysFromToday < clamped });
  }
  return result;
}

export default function HomeBentoHub({
  courses,
  quizSets,
  flashcardSets,
  studiedCourses,
  passedCourses,
  startedSets,
  completedSetsCount,
  totalMastered,
  studiedCoursesTotalQuestions,
  onSelectCourse,
  onSelectSet,
  onSwitchTab,
}: HomeBentoHubProps) {
  const { user, profile, isAuthenticated, loginWithGoogle } = useAuth();
  const [lbSort, setLbSort] = useState<'xp' | 'streak'>('xp');
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [lbLoading, setLbLoading] = useState(false);

  useEffect(() => {
    if (!isBackendConfigured()) return;
    let cancelled = false;
    setLbLoading(true);
    fetchLeaderboard(lbSort, 5)
      .then((data) => {
        if (!cancelled) setLeaderboard(data);
      })
      .catch(() => {
        // Keep graceful empty state if offline
      })
      .finally(() => {
        if (!cancelled) setLbLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lbSort, user?.xp, user?.streakDays]);

  const activeXp = useMemo(() => {
    if (profile?.summary) return profile.summary.xp;
    return computeLocalRealXP(courses, quizSets, flashcardSets);
  }, [courses, flashcardSets, profile?.summary, quizSets]);

  const levelInfo = useMemo(() => calculateLevel(activeXp), [activeXp]);
  const xpBarPercent = Math.min(
    100,
    Math.round((levelInfo.currentLevelXp / Math.max(1, levelInfo.nextLevelXp)) * 100)
  );

  const streakDays = profile?.summary.streakDays ?? getStudyStreak();
  const longestStreak = profile?.summary.longestStreakDays ?? streakDays;
  const studiedToday = profile?.summary.studiedToday ?? streakDays > 0;
  const recent7Days = useMemo(
    () => profile?.summary.recent7Days ?? buildGuestRecent7Days(streakDays),
    [profile?.summary.recent7Days, streakDays]
  );

  // Best 1-click resume target: highest-momentum incomplete set (>0% & <100%), else first studied course
  const resumeTarget = useMemo(() => {
    const inProgress = startedSets.find((s) => s.percent > 0 && s.percent < 100);
    if (inProgress) return { type: 'set' as const, item: inProgress };
    if (startedSets.length > 0) return { type: 'set' as const, item: startedSets[0] };
    if (studiedCourses.length > 0) return { type: 'course' as const, course: studiedCourses[0] };
    return null;
  }, [startedSets, studiedCourses]);

  const starterCourses = useMemo(() => {
    const preferredIds = ['mln111', 'hcm202', 'pmg201c', 'swd392'];
    const found = preferredIds
      .map((id) => courses.find((c) => c.id === id))
      .filter((c): c is Course => Boolean(c));
    return found.length > 0 ? found.slice(0, 3) : courses.slice(0, 3);
  }, [courses]);

  const studiedPercent =
    studiedCoursesTotalQuestions > 0
      ? Math.min(100, Math.round((totalMastered / studiedCoursesTotalQuestions) * 100))
      : 0;
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - studiedPercent / 100);

  const handleResumeClick = () => {
    if (!resumeTarget) {
      onSwitchTab('library');
      return;
    }
    if (resumeTarget.type === 'set') {
      if (onSelectSet) {
        onSelectSet(resumeTarget.item.set);
      } else if (resumeTarget.item.course) {
        onSelectCourse(resumeTarget.item.course);
      }
      return;
    }
    onSelectCourse(resumeTarget.course);
  };

  const medalForRank = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <section className="bento-hub" aria-label="Bảng điều khiển học tập cá nhân">
      <div className="bento-grid">
        {/* ================================================================
            TILE 1 (LEFT - 5fr): PERSONAL RESUME SPOTLIGHT + LEVEL / XP
           ================================================================ */}
        <div className="bento-card bento-card--resume">
          <div className="bento-resume-top">
            <div className="bento-greeting-wrap">
              {isAuthenticated && user ? (
                <>
                  <span className="bento-eyebrow">⚡ TIẾP TỤC HÀNH TRÌNH</span>
                  <h2 className="bento-greeting">Chào {user.givenName || user.name} 👋</h2>
                </>
              ) : (
                <>
                  <span className="bento-eyebrow">🚀 ÔN THI THÔNG MINH</span>
                  <h2 className="bento-greeting">Sẵn sàng cày đề hôm nay?</h2>
                </>
              )}
            </div>

            {isAuthenticated && user ? (
              <button
                type="button"
                className="bento-xp-chip"
                onClick={() => navigateTo('/profile')}
                title="Xem chi tiết nguồn XP & Hồ sơ học tập"
              >
                <span className="bento-xp-lv">Lv.{levelInfo.level}</span>
                <span className="bento-xp-num">{activeXp.toLocaleString('vi-VN')} XP</span>
              </button>
            ) : (
              <button
                type="button"
                className="bento-google-mini"
                data-no-shopee-redirect="true"
                onClick={() => loginWithGoogle('/home')}
              >
                <span>☁️</span>
                <span>Lưu tiến độ</span>
              </button>
            )}
          </div>

          <div className="bento-xp-bar-wrap">
            <div className="bento-xp-bar-track">
              <div className="bento-xp-bar-fill" style={{ width: `${xpBarPercent}%` }} />
            </div>
            <span className="bento-xp-bar-caption">
              {levelInfo.currentLevelXp}/{levelInfo.nextLevelXp} XP → Lv.{levelInfo.level + 1}
            </span>
          </div>

          {resumeTarget ? (
            <div className="bento-resume-spotlight" onClick={handleResumeClick} role="button" tabIndex={0}>
              <div className="bento-resume-meta">
                <span className="bento-code-pill">
                  {resumeTarget.type === 'set'
                    ? resumeTarget.item.course?.code || resumeTarget.item.set.courseId?.toUpperCase() || 'QUIZ'
                    : resumeTarget.course.code}
                </span>
                <span className="bento-resume-tag">
                  {resumeTarget.type === 'set' && resumeTarget.item.percent < 100
                    ? 'Đang ôn dở · Tiếp tục 1 chạm'
                    : 'Ôn lại gần nhất'}
                </span>
              </div>

              <div className="bento-resume-title">
                {resumeTarget.type === 'set' ? resumeTarget.item.set.title : resumeTarget.course.name}
              </div>

              {resumeTarget.type === 'set' && (
                <div className="bento-resume-progress">
                  <div className="bento-resume-bar-track">
                    <div
                      className="bento-resume-bar-fill"
                      style={{ width: `${resumeTarget.item.percent}%` }}
                    />
                  </div>
                  <div className="bento-resume-nums">
                    <span>
                      Đã thuộc <strong>{resumeTarget.item.mastered}</strong>/{resumeTarget.item.total} câu
                    </span>
                    <strong>{resumeTarget.item.percent}%</strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="bento-resume-cta"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResumeClick();
                }}
              >
                <span>▶ Học tiếp ngay</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <div className="bento-starter-box">
              <div className="bento-starter-label">Chọn nhanh 1 môn phổ biến để bắt đầu:</div>
              <div className="bento-starter-chips">
                {starterCourses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="bento-starter-chip"
                    onClick={() => onSelectCourse(c)}
                  >
                    <strong>{c.code}</strong>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bento-mini-stats">
            <button
              type="button"
              className="bento-mini-stat"
              onClick={() => onSwitchTab('stats')}
            >
              <strong>{studiedCourses.length} môn</strong>
              <span>đang ôn</span>
            </button>
            <button
              type="button"
              className="bento-mini-stat"
              onClick={() => onSwitchTab('stats')}
            >
              <strong>
                {completedSetsCount}/{startedSets.length}
              </strong>
              <span>đề hoàn thành</span>
            </button>
            <button
              type="button"
              className="bento-mini-stat"
              onClick={() => onSwitchTab('library')}
            >
              <strong>{courses.length} môn</strong>
              <span>{quizSets.length} bộ đề</span>
            </button>
          </div>
        </div>

        {/* ================================================================
            TILE 2 (MIDDLE - 3.2fr): REAL PROGRESS RING + 7-DAY STREAK
           ================================================================ */}
        <div className="bento-card bento-card--streak">
          <div className="bento-ring-row">
            <div className="bento-ring-box" aria-label={`Tiến độ môn đang ôn ${studiedPercent}%`}>
              <svg viewBox="0 0 84 84" className="bento-ring-svg">
                <circle cx="42" cy="42" r={ringRadius} className="bento-ring-track" />
                <circle
                  cx="42"
                  cy="42"
                  r={ringRadius}
                  className="bento-ring-fill"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <span className="bento-ring-text">{studiedPercent}%</span>
            </div>

            <div className="bento-ring-info">
              <span className="bento-card-kicker">TIẾN ĐỘ CÁC MÔN ĐANG ÔN</span>
              <strong className="bento-big-number">
                {totalMastered.toLocaleString('vi-VN')} câu
              </strong>
              <span className="bento-sub-note">
                {passedCourses.length > 0
                  ? `✓ Đã Pass 100%: ${passedCourses.length} môn`
                  : `Trên ${studiedCoursesTotalQuestions.toLocaleString('vi-VN')} câu đang học`}
              </span>
            </div>
          </div>

          <div className="bento-divider" />

          <div className="bento-streak-block">
            <div className="bento-streak-head">
              <div>
                <div className="bento-streak-count">🔥 {streakDays} ngày liên tiếp</div>
                <div className="bento-sub-note">
                  {studiedToday
                    ? `✓ Đã giữ lửa hôm nay · Kỷ lục ${longestStreak} ngày`
                    : 'Làm 1 câu đúng để thắp lửa hôm nay!'}
                </div>
              </div>
            </div>

            <div className="bento-week-strip" aria-label="Lịch học 7 ngày gần nhất">
              {recent7Days.map((day) => (
                <div
                  key={day.date}
                  className={`bento-week-day ${day.studied ? 'is-on' : ''}`}
                  title={`${day.date.slice(8, 10)}/${day.date.slice(5, 7)}: ${
                    day.studied ? 'Đã học' : 'Chưa học'
                  }`}
                >
                  <span className="bento-week-dot">{day.studied ? '✓' : ''}</span>
                  <span className="bento-week-lbl">{day.date.slice(8, 10)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-quick-links">
            <button
              type="button"
              className="bento-ghost-btn"
              onClick={() => navigateTo('/profile')}
            >
              👤 Hồ sơ của tôi
            </button>
            <button
              type="button"
              className="bento-ghost-btn"
              onClick={() => onSwitchTab('stats')}
            >
              📊 Thống kê
            </button>
          </div>
        </div>

        {/* ================================================================
            TILE 3 (RIGHT - 3.8fr): TOP HỌC BÁ LIVE LEADERBOARD
           ================================================================ */}
        <div className="bento-card bento-card--leaderboard">
          <div className="bento-lb-head">
            <div>
              <span className="bento-card-kicker">CỘNG ĐỒNG HỌC THẬT</span>
              <h3 className="bento-lb-title">🏆 Top Học Bá</h3>
            </div>
            <div className="bento-lb-toggle" role="tablist">
              <button
                type="button"
                className={lbSort === 'xp' ? 'active' : ''}
                onClick={() => setLbSort('xp')}
              >
                ⚡ XP
              </button>
              <button
                type="button"
                className={lbSort === 'streak' ? 'active' : ''}
                onClick={() => setLbSort('streak')}
              >
                🔥 Chuỗi
              </button>
            </div>
          </div>

          <div className="bento-lb-list">
            {lbLoading && !leaderboard ? (
              <div className="bento-lb-empty">Đang tải bảng xếp hạng...</div>
            ) : !leaderboard || leaderboard.leaders.length === 0 ? (
              <div className="bento-lb-empty">
                Đăng nhập Google và làm bài để trở thành người đầu tiên lên bảng xếp hạng!
              </div>
            ) : (
              leaderboard.leaders.map((entry) => (
                <div
                  key={entry.id}
                  className={`bento-lb-row ${entry.isCurrentUser ? 'is-me' : ''} ${
                    entry.rank <= 3 ? `is-top-${entry.rank}` : ''
                  }`}
                >
                  <span className="bento-lb-rank">{medalForRank(entry.rank)}</span>
                  {entry.avatar ? (
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="bento-lb-avatar"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="bento-lb-avatar-fallback">
                      {entry.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="bento-lb-user">
                    <span className="bento-lb-name">
                      {entry.name}
                      {entry.isCurrentUser && <em className="bento-me-pill">Bạn</em>}
                    </span>
                    <span className="bento-lb-sub">
                      Lv.{entry.level} · {entry.totalMasteredQuestions.toLocaleString('vi-VN')} câu
                    </span>
                  </div>
                  <span className="bento-lb-score">
                    {lbSort === 'xp'
                      ? `${entry.xp.toLocaleString('vi-VN')} XP`
                      : `🔥 ${entry.streakDays}d`}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="bento-lb-footer">
            {leaderboard ? (
              <span>
                🌍 <strong>{leaderboard.totalActiveLearners}</strong> học viên ·{' '}
                <strong>{leaderboard.communityMasteredQuestions.toLocaleString('vi-VN')}</strong> câu
                đã chinh phục
              </span>
            ) : (
              <span>Đồng bộ dữ liệu thực qua MongoDB</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
