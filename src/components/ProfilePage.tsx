import React, { useMemo, useState } from 'react';
import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import type { FlashcardSet } from '../data/flashcardData';
import type { HomeNavTab } from '../utils/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { collectLocalProgressSnapshot, computeLocalRealXP } from '../utils/progressSync';
import UserAccountMenu from './UserAccountMenu';
import './ProfilePage.css';

interface ProfilePageProps {
  courses: Course[];
  quizSets: QuizSetInfo[];
  flashcardSets: FlashcardSet[];
  onNavigateTab: (tab: HomeNavTab) => void;
  onSelectCourse: (course: Course) => void;
  onSelectSet: (set: QuizSetInfo) => void;
  onSelectFlashcard: (fcSet: FlashcardSet) => void;
}

type ProfileSectionTab = 'courses' | 'sets' | 'flashcards';
type ProgressFilter = 'all' | 'in_progress' | 'completed';

function formatDateVi(isoString: string | null | undefined): string {
  if (!isoString) return 'Chưa có';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Chưa có';
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTimeVi(isoString: string | null | undefined): string {
  if (!isoString) return 'Chưa đồng bộ';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Chưa đồng bộ';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function ProfilePage({
  courses,
  quizSets,
  flashcardSets,
  onNavigateTab,
  onSelectCourse,
  onSelectSet,
  onSelectFlashcard,
}: ProfilePageProps) {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    isSyncing,
    isBackendReady,
    authError,
    syncError,
    loginWithGoogle,
    logout,
    syncNow,
    updateProfile,
    clearAuthError,
  } = useAuth();
  const { theme, openThemeModal } = useTheme();

  const [sectionTab, setSectionTab] = useState<ProfileSectionTab>('courses');
  const [filterMode, setFilterMode] = useState<ProgressFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const courseMap = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of courses) map.set(c.id, c);
    return map;
  }, [courses]);

  const quizSetMap = useMemo(() => {
    const map = new Map<string, QuizSetInfo>();
    for (const s of quizSets) map.set(s.id, s);
    return map;
  }, [quizSets]);

  const flashcardMap = useMemo(() => {
    const map = new Map<string, FlashcardSet>();
    for (const f of flashcardSets) map.set(f.id, f);
    return map;
  }, [flashcardSets]);

  // Preview of current local browser progress when user hasn't signed in yet
  const localPreview = useMemo(() => {
    if (isAuthenticated) return null;
    const snap = collectLocalProgressSnapshot(courses, quizSets, flashcardSets);
    const mainSets = snap.sets.filter((s) => !s.isKnowledgeGroup && s.masteredIds.length > 0);
    const masteredCount = mainSets.reduce((sum, s) => sum + s.masteredIds.length, 0);
    const courseIds = new Set(mainSets.map((s) => s.courseId).filter(Boolean));
    return {
      studiedCourses: courseIds.size,
      startedSets: mainSets.length,
      masteredCount,
      xp: computeLocalRealXP(courses, quizSets, flashcardSets),
      streakDays: snap.streakDays,
    };
  }, [courses, flashcardSets, isAuthenticated, quizSets]);

  const filteredCourses = useMemo(() => {
    if (!profile) return [];
    const q = searchQuery.trim().toLowerCase();
    return profile.courses.filter((course) => {
      if (filterMode === 'completed' && !course.isPassed) return false;
      if (filterMode === 'in_progress' && course.isPassed) return false;
      if (!q) return true;
      return (
        course.courseCode.toLowerCase().includes(q) ||
        course.courseName.toLowerCase().includes(q)
      );
    });
  }, [filterMode, profile, searchQuery]);

  const filteredSets = useMemo(() => {
    if (!profile) return [];
    const q = searchQuery.trim().toLowerCase();
    return profile.sets
      .filter((s) => !s.isKnowledgeGroup && s.masteredCount > 0)
      .filter((setItem) => {
        if (filterMode === 'completed' && !setItem.isCompleted) return false;
        if (filterMode === 'in_progress' && setItem.isCompleted) return false;
        if (!q) return true;
        return (
          setItem.setTitle.toLowerCase().includes(q) ||
          setItem.courseCode.toLowerCase().includes(q) ||
          setItem.courseName.toLowerCase().includes(q)
        );
      });
  }, [filterMode, profile, searchQuery]);

  const openEditForm = () => {
    if (!user) return;
    setEditName(user.name || '');
    setEditBio(user.bio || '');
    setEditStudentId(user.studentId || '');
    setEditSemester(user.targetSemester || '');
    setSaveMessage(null);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editName.trim()) return;
    setIsSavingProfile(true);
    setSaveMessage(null);
    const ok = await updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      studentId: editStudentId.trim(),
      targetSemester: editSemester.trim(),
    });
    setIsSavingProfile(false);
    if (ok) {
      setIsEditingProfile(false);
      setSaveMessage('Đã cập nhật hồ sơ thành công.');
    }
  };

  const summary = profile?.summary;
  const xpProgressPercent = summary
    ? Math.min(100, Math.round((summary.currentLevelXp / Math.max(1, summary.nextLevelXp)) * 100))
    : 0;
  const ringPercent = summary?.studiedCoursesPercent ?? 0;
  const ringCircumference = 2 * Math.PI * 36;
  const ringOffset = ringCircumference * (1 - ringPercent / 100);

  return (
    <div className={`profile-page theme-${theme}`}>
      <header className="profile-navbar">
        <div className="profile-navbar-inner">
          <div className="profile-nav-left">
            <button
              type="button"
              className="profile-back-btn"
              onClick={() => onNavigateTab('library')}
            >
              ← Thư viện
            </button>
            <div
              className="profile-brand"
              role="button"
              tabIndex={0}
              onClick={() => onNavigateTab('home')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onNavigateTab('home');
              }}
            >
              <div className="profile-logo-box">K</div>
              <div className="profile-brand-text">
                <span className="profile-brand-name">KEYT</span>
                <span className="profile-brand-sub">Hồ sơ học tập</span>
              </div>
            </div>
          </div>

          <nav className="profile-nav-actions">
            <button
              type="button"
              className="profile-nav-link"
              onClick={() => onNavigateTab('home')}
            >
              Trang chủ
            </button>
            <button
              type="button"
              className="profile-nav-link"
              onClick={() => onNavigateTab('library')}
            >
              Thư viện
            </button>
            <button
              type="button"
              className="profile-nav-link"
              onClick={() => onNavigateTab('stats')}
            >
              Thống kê
            </button>
            <button
              type="button"
              className="global-theme-toggle-btn"
              onClick={openThemeModal}
              title="Đổi giao diện học tập"
            >
              <span>🎨</span>
              <span>Giao diện</span>
            </button>
            <UserAccountMenu />
          </nav>
        </div>
      </header>

      <div className="profile-container">
        {authError && (
          <div className="profile-alert is-error" role="alert">
            <span>⚠️ {authError}</span>
            <button type="button" className="profile-alert-close" onClick={clearAuthError}>
              ✕
            </button>
          </div>
        )}

        {syncError && (
          <div className="profile-alert is-warning" role="status">
            <span>☁️ Đồng bộ tạm gián đoạn: {syncError}</span>
          </div>
        )}

        {saveMessage && (
          <div className="profile-alert is-success" role="status">
            <span>✅ {saveMessage}</span>
            <button
              type="button"
              className="profile-alert-close"
              onClick={() => setSaveMessage(null)}
            >
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="profile-loading-card">
            <div className="profile-spinner" />
            <h3>Đang tải hồ sơ học tập...</h3>
            <p>Vui lòng đợi trong giây lát khi hệ thống kiểm tra phiên đăng nhập Google.</p>
          </div>
        ) : !isAuthenticated || !user || !profile || !summary ? (
          <section className="profile-guest-card">
            <div className="profile-guest-badge">☁️ ĐỒNG BỘ TÀI KHOẢN GOOGLE</div>
            <h1 className="profile-guest-title">
              Lưu toàn bộ quá trình ôn thi vào tài khoản cá nhân
            </h1>
            <p className="profile-guest-desc">
              Đăng nhập bằng Google để xem hồ sơ học tập chi tiết, theo dõi phần trăm hoàn thành từng
              môn và từng bộ đề, đồng thời tự động đồng bộ tiến độ giữa máy tính và điện thoại.
            </p>

            {!isBackendReady && (
              <div className="profile-alert is-warning">
                <span>
                  ⚙️ Frontend chưa có biến môi trường <code>VITE_BACKEND_URL</code> trỏ tới server
                  VPS. Hãy cấu hình để kích hoạt đăng nhập Google.
                </span>
              </div>
            )}

            <button
              type="button"
              className="profile-google-cta"
              onClick={() => loginWithGoogle('/profile')}
              disabled={!isBackendReady}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            <div className="profile-guest-features">
              <div className="profile-guest-feature">
                <strong>🔄 Gộp tiến độ tự động</strong>
                <span>Dữ liệu bạn đã học trên trình duyệt này sẽ được gộp tự động, không mất câu nào.</span>
              </div>
              <div className="profile-guest-feature">
                <strong>📊 Chi tiết từng môn & %</strong>
                <span>Xem ngay danh sách môn đã ôn, bộ đề hoàn thành, câu đã thuộc và Flashcard.</span>
              </div>
              <div className="profile-guest-feature">
                <strong>📱 Đa thiết bị liền mạch</strong>
                <span>Học trên laptop, mở điện thoại lên tiếp tục đúng tiến độ vừa làm.</span>
              </div>
            </div>

            {localPreview && (localPreview.masteredCount > 0 || localPreview.xp > 0) && (
              <div className="profile-local-preview">
                <div className="profile-local-preview-title">
                  💾 Tiến độ hiện có trên máy này (sẵn sàng sao lưu khi đăng nhập):
                </div>
                <div className="profile-local-preview-stats">
                  <span>{localPreview.studiedCourses} môn đã học</span>
                  <span>•</span>
                  <span>{localPreview.startedSets} bộ đề</span>
                  <span>•</span>
                  <span>{localPreview.masteredCount.toLocaleString('vi-VN')} câu đã thuộc</span>
                  <span>•</span>
                  <span>{localPreview.xp.toLocaleString('vi-VN')} XP</span>
                </div>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* 1. PROFILE HERO CARD */}
            <section className="profile-hero-card">
              <div className="profile-hero-main">
                <div className="profile-hero-avatar-box">
                  {user.avatar && !avatarFailed ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="profile-hero-avatar"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    <div className="profile-hero-avatar-fallback">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="profile-level-chip">Lv.{summary.level}</span>
                </div>

                <div className="profile-hero-info">
                  <div className="profile-hero-name-row">
                    <h1 className="profile-hero-name">{user.name}</h1>
                    <span className="profile-verified-pill">✓ Google Account</span>
                  </div>
                  <p className="profile-hero-email">{user.email}</p>

                  {user.bio && <p className="profile-hero-bio">{user.bio}</p>}

                  <div className="profile-meta-chips">
                    {user.studentId && <span className="profile-meta-chip">🎓 {user.studentId}</span>}
                    {user.targetSemester && (
                      <span className="profile-meta-chip">📅 Mục tiêu: {user.targetSemester}</span>
                    )}
                    <span className="profile-meta-chip">
                      🗓️ Tham gia: {formatDateVi(user.createdAt)}
                    </span>
                    <span className="profile-meta-chip">
                      ☁️ Đồng bộ: {formatDateTimeVi(user.lastSyncedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-hero-actions">
                <button type="button" className="profile-btn-secondary" onClick={openEditForm}>
                  ✏️ Chỉnh sửa hồ sơ
                </button>
                <button
                  type="button"
                  className="profile-btn-primary"
                  onClick={() => void syncNow()}
                  disabled={isSyncing}
                >
                  {isSyncing ? '⏳ Đang đồng bộ...' : '☁️ Đồng bộ ngay'}
                </button>
                <button
                  type="button"
                  className="profile-btn-danger"
                  onClick={() => void logout()}
                >
                  🚪 Đăng xuất
                </button>
              </div>

              {isEditingProfile && (
                <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                  <div className="profile-edit-grid">
                    <label className="profile-field">
                      <span>Tên hiển thị</span>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={80}
                        required
                        placeholder="Tên của bạn"
                      />
                    </label>
                    <label className="profile-field">
                      <span>MSSV / Ngành học (tuỳ chọn)</span>
                      <input
                        type="text"
                        value={editStudentId}
                        onChange={(e) => setEditStudentId(e.target.value)}
                        maxLength={40}
                        placeholder="VD: SE1801 - Kỹ thuật phần mềm"
                      />
                    </label>
                    <label className="profile-field">
                      <span>Kỳ học mục tiêu (tuỳ chọn)</span>
                      <input
                        type="text"
                        value={editSemester}
                        onChange={(e) => setEditSemester(e.target.value)}
                        maxLength={40}
                        placeholder="VD: FA26 - Pass 100%"
                      />
                    </label>
                    <label className="profile-field profile-field--wide">
                      <span>Giới thiệu ngắn / Mục tiêu ôn thi</span>
                      <textarea
                        rows={2}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        maxLength={240}
                        placeholder="Ghi chú động lực hoặc mục tiêu điểm kỳ này..."
                      />
                    </label>
                  </div>
                  <div className="profile-edit-actions">
                    <button
                      type="button"
                      className="profile-btn-secondary"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="profile-btn-primary"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* 2. KPI SUMMARY CARDS */}
            <section className="profile-kpi-grid">
              <div className="profile-kpi-card profile-kpi-card--ring">
                <div className="profile-ring-wrap" aria-label={`Hoàn thành ${ringPercent}%`}>
                  <svg viewBox="0 0 88 88" className="profile-ring-svg">
                    <circle cx="44" cy="44" r="36" className="profile-ring-track" />
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      className="profile-ring-fill"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  <span className="profile-ring-value">{ringPercent}%</span>
                </div>
                <div className="profile-kpi-content">
                  <span className="profile-kpi-label">Tiến độ các môn đang ôn</span>
                  <strong className="profile-kpi-big">
                    {summary.totalMasteredQuestions.toLocaleString('vi-VN')} câu đã thuộc
                  </strong>
                  <span className="profile-kpi-sub">
                    Trên {summary.studiedCoursesTotalQuestions.toLocaleString('vi-VN')} câu của{' '}
                    {summary.studiedCoursesCount} môn đã học
                  </span>
                </div>
              </div>

              <div className="profile-kpi-card">
                <div className="profile-kpi-top">
                  <span className="profile-kpi-label">Môn học đã ôn</span>
                  <span className="profile-kpi-icon">📚</span>
                </div>
                <strong className="profile-kpi-big">{summary.studiedCoursesCount} môn</strong>
                <span className="profile-kpi-sub">
                  ✓ {summary.passedCoursesCount} môn đạt 100% · {summary.startedSetsCount} bộ đề đã mở
                </span>
                <div className="profile-kpi-bar">
                  <div
                    className="profile-kpi-bar-fill"
                    style={{
                      width: `${
                        summary.studiedCoursesCount > 0
                          ? Math.round((summary.passedCoursesCount / summary.studiedCoursesCount) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="profile-kpi-card">
                <div className="profile-kpi-top">
                  <span className="profile-kpi-label">Cấp độ & Kinh nghiệm thật</span>
                  <span className="profile-kpi-icon">⚡</span>
                </div>
                <strong className="profile-kpi-big">
                  Level {summary.level} · {summary.xp.toLocaleString('vi-VN')} XP
                </strong>
                <span className="profile-kpi-sub">
                  {summary.currentLevelXp}/{summary.nextLevelXp} XP · còn {summary.remainingXp} XP lên
                  Level {summary.level + 1}
                </span>
                {summary.xpBreakdown && (
                  <div className="profile-xp-breakdown">
                    <span>+{summary.xpBreakdown.masteredQuestionsXp.toLocaleString('vi-VN')} câu</span>
                    {summary.xpBreakdown.flashcardsXp > 0 && (
                      <span>+{summary.xpBreakdown.flashcardsXp.toLocaleString('vi-VN')} thẻ</span>
                    )}
                    {summary.xpBreakdown.completedSetsXp > 0 && (
                      <span>+{summary.xpBreakdown.completedSetsXp.toLocaleString('vi-VN')} bộ đề</span>
                    )}
                    {summary.xpBreakdown.passedCoursesXp > 0 && (
                      <span>+{summary.xpBreakdown.passedCoursesXp.toLocaleString('vi-VN')} PASS</span>
                    )}
                    {summary.xpBreakdown.studyDaysXp > 0 && (
                      <span>+{summary.xpBreakdown.studyDaysXp.toLocaleString('vi-VN')} ngày</span>
                    )}
                  </div>
                )}
                <div className="profile-kpi-bar">
                  <div className="profile-kpi-bar-fill" style={{ width: `${xpProgressPercent}%` }} />
                </div>
              </div>

              <div className="profile-kpi-card">
                <div className="profile-kpi-top">
                  <span className="profile-kpi-label">Chuỗi học thực tế</span>
                  <span className="profile-kpi-icon">🔥</span>
                </div>
                <strong className="profile-kpi-big">{summary.streakDays} ngày liên tiếp</strong>
                <span className="profile-kpi-sub">
                  🏆 Kỷ lục: {summary.longestStreakDays ?? summary.streakDays} ngày · Tổng{' '}
                  {summary.totalStudyDays ?? summary.streakDays} ngày học
                </span>
                {summary.recent7Days && summary.recent7Days.length > 0 && (
                  <div className="profile-streak-week" aria-label="Lịch học 7 ngày gần nhất">
                    {summary.recent7Days.map((day) => {
                      const shortDay = day.date.slice(8, 10) + '/' + day.date.slice(5, 7);
                      return (
                        <div
                          key={day.date}
                          className={`profile-streak-day ${day.studied ? 'is-active' : ''}`}
                          title={`${shortDay}: ${day.studied ? 'Đã học' : 'Chưa học'}`}
                        >
                          <span className="profile-streak-dot">{day.studied ? '✓' : ''}</span>
                          <span className="profile-streak-label">{day.date.slice(8, 10)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* 3. DETAILED LEARNING BREAKDOWN */}
            <section className="profile-detail-panel">
              <div className="profile-panel-toolbar">
                <div className="profile-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sectionTab === 'courses'}
                    className={`profile-tab-btn ${sectionTab === 'courses' ? 'active' : ''}`}
                    onClick={() => setSectionTab('courses')}
                  >
                    📚 Môn đã học ({profile.courses.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sectionTab === 'sets'}
                    className={`profile-tab-btn ${sectionTab === 'sets' ? 'active' : ''}`}
                    onClick={() => setSectionTab('sets')}
                  >
                    📝 Bộ đề đã làm ({summary.startedSetsCount})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sectionTab === 'flashcards'}
                    className={`profile-tab-btn ${sectionTab === 'flashcards' ? 'active' : ''}`}
                    onClick={() => setSectionTab('flashcards')}
                  >
                    🃏 Flashcard ({profile.flashcards.length})
                  </button>
                </div>

                {sectionTab !== 'flashcards' && (
                  <div className="profile-filters">
                    <input
                      type="search"
                      className="profile-search-input"
                      placeholder={
                        sectionTab === 'courses'
                          ? 'Tìm mã môn hoặc tên môn...'
                          : 'Tìm tên bộ đề hoặc môn...'
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="profile-filter-pills">
                      <button
                        type="button"
                        className={`profile-filter-pill ${filterMode === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterMode('all')}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        className={`profile-filter-pill ${filterMode === 'in_progress' ? 'active' : ''}`}
                        onClick={() => setFilterMode('in_progress')}
                      >
                        Đang học
                      </button>
                      <button
                        type="button"
                        className={`profile-filter-pill ${filterMode === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilterMode('completed')}
                      >
                        Hoàn thành
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TAB 1: STUDIED COURSES */}
              {sectionTab === 'courses' && (
                filteredCourses.length === 0 ? (
                  <div className="profile-empty-state">
                    <div className="profile-empty-icon">📖</div>
                    <h3>
                      {profile.courses.length === 0
                        ? 'Bạn chưa bắt đầu môn học nào'
                        : 'Không tìm thấy môn học phù hợp'}
                    </h3>
                    <p>
                      {profile.courses.length === 0
                        ? 'Vào Thư viện chọn một môn học và bắt đầu làm bài, tiến độ sẽ tự động lưu tại đây.'
                        : 'Thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc "Tất cả".'}
                    </p>
                    <button
                      type="button"
                      className="profile-btn-primary"
                      onClick={() => onNavigateTab('library')}
                    >
                      Mở Thư viện môn học →
                    </button>
                  </div>
                ) : (
                  <div className="profile-progress-list">
                    {filteredCourses.map((item) => {
                      const matchedCourse = courseMap.get(item.courseId);
                      return (
                        <div
                          key={item.courseId}
                          className={`profile-progress-row ${matchedCourse ? 'is-clickable' : ''}`}
                          onClick={() => {
                            if (matchedCourse) onSelectCourse(matchedCourse);
                          }}
                          role={matchedCourse ? 'button' : undefined}
                          tabIndex={matchedCourse ? 0 : undefined}
                          onKeyDown={(e) => {
                            if (matchedCourse && (e.key === 'Enter' || e.key === ' ')) {
                              onSelectCourse(matchedCourse);
                            }
                          }}
                        >
                          <div className="profile-row-left">
                            <div className="profile-row-badges">
                              <span className="profile-code-badge">{item.courseCode}</span>
                              {item.isPassed ? (
                                <span className="profile-status-pill is-done">✓ PASS 100%</span>
                              ) : (
                                <span className="profile-status-pill is-doing">Đang ôn</span>
                              )}
                              <span className="profile-date-note">
                                Cập nhật {formatDateVi(item.lastStudiedAt)}
                              </span>
                            </div>
                            <div className="profile-row-title">{item.courseName}</div>
                            <div className="profile-row-sub">
                              Đã thuộc <strong>{item.masteredQuestions.toLocaleString('vi-VN')}</strong> /{' '}
                              {item.totalQuestions.toLocaleString('vi-VN')} câu · Mở{' '}
                              <strong>{item.startedSets}</strong>/{item.totalSets} bộ đề (xong{' '}
                              {item.completedSets})
                            </div>
                          </div>

                          <div className="profile-row-right">
                            <span className="profile-row-percent">{item.percent}%</span>
                            <div className="profile-bar">
                              <div
                                className={`profile-bar-fill ${item.isPassed ? 'is-done' : ''}`}
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>
                            {matchedCourse && <span className="profile-row-cta">Học tiếp →</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* TAB 2: STUDIED QUIZ SETS */}
              {sectionTab === 'sets' && (
                filteredSets.length === 0 ? (
                  <div className="profile-empty-state">
                    <div className="profile-empty-icon">📝</div>
                    <h3>Chưa có bộ đề nào trong mục này</h3>
                    <p>Hãy chọn một bộ đề bất kỳ để luyện tập và theo dõi phần trăm hoàn thành.</p>
                    <button
                      type="button"
                      className="profile-btn-primary"
                      onClick={() => onNavigateTab('library')}
                    >
                      Khám phá bộ đề →
                    </button>
                  </div>
                ) : (
                  <div className="profile-progress-list">
                    {filteredSets.map((setItem) => {
                      const matchedSet = quizSetMap.get(setItem.setId);
                      return (
                        <div
                          key={setItem.setId}
                          className={`profile-progress-row ${matchedSet ? 'is-clickable' : ''}`}
                          onClick={() => {
                            if (matchedSet) onSelectSet(matchedSet);
                          }}
                          role={matchedSet ? 'button' : undefined}
                          tabIndex={matchedSet ? 0 : undefined}
                          onKeyDown={(e) => {
                            if (matchedSet && (e.key === 'Enter' || e.key === ' ')) {
                              onSelectSet(matchedSet);
                            }
                          }}
                        >
                          <div className="profile-row-left">
                            <div className="profile-row-badges">
                              {setItem.courseCode && (
                                <span className="profile-code-badge">{setItem.courseCode}</span>
                              )}
                              {setItem.isCompleted ? (
                                <span className="profile-status-pill is-done">✓ Hoàn thành</span>
                              ) : (
                                <span className="profile-status-pill is-doing">Đang ôn</span>
                              )}
                              <span className="profile-date-note">
                                {formatDateTimeVi(setItem.lastStudiedAt)}
                              </span>
                            </div>
                            <div className="profile-row-title">{setItem.setTitle}</div>
                            <div className="profile-row-sub">
                              Đã thuộc <strong>{setItem.masteredCount.toLocaleString('vi-VN')}</strong> /{' '}
                              {setItem.totalQuestions.toLocaleString('vi-VN')} câu
                              {setItem.courseName ? ` · ${setItem.courseName}` : ''}
                            </div>
                          </div>

                          <div className="profile-row-right">
                            <span className="profile-row-percent">{setItem.percent}%</span>
                            <div className="profile-bar">
                              <div
                                className={`profile-bar-fill ${setItem.isCompleted ? 'is-done' : ''}`}
                                style={{ width: `${setItem.percent}%` }}
                              />
                            </div>
                            {matchedSet && <span className="profile-row-cta">Làm tiếp →</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* TAB 3: FLASHCARDS */}
              {sectionTab === 'flashcards' && (
                profile.flashcards.length === 0 ? (
                  <div className="profile-empty-state">
                    <div className="profile-empty-icon">🃏</div>
                    <h3>Bạn chưa học bộ Flashcard nào</h3>
                    <p>Học thuật ngữ nhanh bằng thẻ lật Flashcard để tăng tốc độ ghi nhớ.</p>
                    {flashcardSets[0] && (
                      <button
                        type="button"
                        className="profile-btn-primary"
                        onClick={() => onSelectFlashcard(flashcardSets[0])}
                      >
                        Mở Flashcard ngay →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="profile-progress-list">
                    {profile.flashcards.map((fcItem) => {
                      const matchedFc = flashcardMap.get(fcItem.flashcardSetId);
                      return (
                        <div
                          key={fcItem.flashcardSetId}
                          className={`profile-progress-row ${matchedFc ? 'is-clickable' : ''}`}
                          onClick={() => {
                            if (matchedFc) onSelectFlashcard(matchedFc);
                          }}
                          role={matchedFc ? 'button' : undefined}
                          tabIndex={matchedFc ? 0 : undefined}
                          onKeyDown={(e) => {
                            if (matchedFc && (e.key === 'Enter' || e.key === ' ')) {
                              onSelectFlashcard(matchedFc);
                            }
                          }}
                        >
                          <div className="profile-row-left">
                            <div className="profile-row-badges">
                              <span className="profile-code-badge">FLASHCARD</span>
                              {fcItem.percent >= 100 ? (
                                <span className="profile-status-pill is-done">✓ Thuộc hết</span>
                              ) : (
                                <span className="profile-status-pill is-doing">Đang học</span>
                              )}
                            </div>
                            <div className="profile-row-title">{fcItem.title}</div>
                            <div className="profile-row-sub">
                              Đã thuộc <strong>{fcItem.knownCount}</strong> / {fcItem.totalCards} thẻ
                            </div>
                          </div>

                          <div className="profile-row-right">
                            <span className="profile-row-percent">{fcItem.percent}%</span>
                            <div className="profile-bar">
                              <div
                                className={`profile-bar-fill ${fcItem.percent >= 100 ? 'is-done' : ''}`}
                                style={{ width: `${fcItem.percent}%` }}
                              />
                            </div>
                            {matchedFc && <span className="profile-row-cta">Ôn thẻ →</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
