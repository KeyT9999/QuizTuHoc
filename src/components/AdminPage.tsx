import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { HomeNavTab } from '../utils/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  createAdminAnnouncement,
  createAdminUser,
  deleteAdminAnnouncement,
  deleteAdminUser,
  downloadAdminUsersCsv,
  fetchAdminAnnouncements,
  fetchAdminAuditLogs,
  fetchAdminOverview,
  fetchAdminUserDetail,
  fetchAdminUsers,
  recalculateAdminUser,
  resetAdminUserProgress,
  updateAdminAnnouncement,
  updateAdminUser,
  type AdminAnnouncement,
  type AdminAuditLogItem,
  type AdminOverviewResponse,
  type AdminUserDetailResponse,
  type AdminUserListItem,
  type AnnouncementType,
  type UserRole,
  type UserStatus,
} from '../utils/backendApi';
import UserAccountMenu from './UserAccountMenu';
import './AdminPage.css';

interface AdminPageProps {
  onNavigateTab: (tab: HomeNavTab) => void;
}

type AdminTab = 'overview' | 'users' | 'announcements' | 'audit';

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'Chưa có';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Chưa có';
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return 'Chưa có';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Chưa có';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AdminPage({ onNavigateTab }: AdminPageProps) {
  const { user, isAuthenticated, isAdmin, isLoading: authLoading, loginWithGoogle } = useAuth();
  const { theme, openThemeModal } = useTheme();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [bannerMessage, setBannerMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  // Overview state
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Users CRUD state
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  // Selected user detail modal
  const [detailUser, setDetailUser] = useState<AdminUserDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'courses' | 'sets' | 'flashcards'>('courses');

  // Create / Edit User modal
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [uEmail, setUEmail] = useState('');
  const [uName, setUName] = useState('');
  const [uStudentId, setUStudentId] = useState('');
  const [uSemester, setUSemester] = useState('');
  const [uBio, setUBio] = useState('');
  const [uRole, setURole] = useState<UserRole>('user');
  const [uStatus, setUStatus] = useState<UserStatus>('active');
  const [uBannedReason, setUBannedReason] = useState('');
  const [uAdminNote, setUAdminNote] = useState('');
  const [uSubmitting, setUSubmitting] = useState(false);

  // Announcements CRUD state
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<AnnouncementType>('update');
  const [annLinkUrl, setAnnLinkUrl] = useState('');
  const [annLinkLabel, setAnnLinkLabel] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [annActive, setAnnActive] = useState(true);
  const [annSubmitting, setAnnSubmitting] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const showToast = useCallback((kind: 'success' | 'error', text: string) => {
    setBannerMessage({ kind, text });
  }, []);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const data = await fetchAdminOverview();
      setOverview(data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Lỗi tải tổng quan.');
    } finally {
      setOverviewLoading(false);
    }
  }, [showToast]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await fetchAdminUsers({
        search: search.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
        sort: sortOrder,
        page,
        limit: 20,
      });
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
      setTotalUsersCount(data.pagination.total);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Lỗi tải danh sách user.');
    } finally {
      setUsersLoading(false);
    }
  }, [page, roleFilter, search, showToast, sortOrder, statusFilter]);

  const loadAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    try {
      const data = await fetchAdminAnnouncements();
      setAnnouncements(data.announcements);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Lỗi tải thông báo.');
    } finally {
      setAnnouncementsLoading(false);
    }
  }, [showToast]);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const data = await fetchAdminAuditLogs(60);
      setAuditLogs(data.logs);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Lỗi tải nhật ký.');
    } finally {
      setAuditLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'overview') void loadOverview();
    else if (activeTab === 'users') void loadUsers();
    else if (activeTab === 'announcements') void loadAnnouncements();
    else if (activeTab === 'audit') void loadAuditLogs();
  }, [activeTab, isAdmin, loadAnnouncements, loadAuditLogs, loadOverview, loadUsers]);

  const handleOpenUserDetail = async (userId: string) => {
    setDetailLoading(true);
    setDetailTab('courses');
    try {
      const detail = await fetchAdminUserDetail(userId);
      setDetailUser(detail);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể tải chi tiết user.');
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreateUserModal = () => {
    setUserModalMode('create');
    setEditingUserId(null);
    setUEmail('');
    setUName('');
    setUStudentId('');
    setUSemester('');
    setUBio('');
    setURole('user');
    setUStatus('active');
    setUBannedReason('');
    setUAdminNote('');
  };

  const openEditUserModal = (item: AdminUserListItem) => {
    setUserModalMode('edit');
    setEditingUserId(item.id);
    setUEmail(item.email);
    setUName(item.name);
    setUStudentId(item.studentId || '');
    setUSemester(item.targetSemester || '');
    setUBio(item.bio || '');
    setURole(item.role);
    setUStatus(item.status);
    setUBannedReason(item.bannedReason || '');
    setUAdminNote(item.adminNote || '');
  };

  const handleSubmitUserModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setUSubmitting(true);
    try {
      if (userModalMode === 'create') {
        await createAdminUser({
          email: uEmail.trim(),
          name: uName.trim(),
          studentId: uStudentId.trim(),
          targetSemester: uSemester.trim(),
          bio: uBio.trim(),
          role: uRole,
          adminNote: uAdminNote.trim(),
        });
        showToast('success', `Đã tạo trước tài khoản ${uEmail.trim()}.`);
      } else if (userModalMode === 'edit' && editingUserId) {
        const updated = await updateAdminUser(editingUserId, {
          name: uName.trim(),
          studentId: uStudentId.trim(),
          targetSemester: uSemester.trim(),
          bio: uBio.trim(),
          role: uRole,
          status: uStatus,
          bannedReason: uStatus === 'banned' ? uBannedReason.trim() : '',
          adminNote: uAdminNote.trim(),
        });
        if (detailUser?.user.id === editingUserId) {
          setDetailUser(updated);
        }
        showToast('success', `Đã cập nhật tài khoản ${uName.trim()}.`);
      }
      setUserModalMode(null);
      void loadUsers();
      void loadOverview();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Thao tác thất bại.');
    } finally {
      setUSubmitting(false);
    }
  };

  const handleQuickToggleBan = async (item: AdminUserListItem) => {
    const isCurrentlyBanned = item.status === 'banned';
    let reason = '';
    if (!isCurrentlyBanned) {
      const input = window.prompt(
        `Nhập lý do khóa tài khoản ${item.email} (có thể bỏ trống):`,
        'Vi phạm quy định sử dụng'
      );
      if (input === null) return;
      reason = input.trim();
    }
    try {
      await updateAdminUser(item.id, {
        status: isCurrentlyBanned ? 'active' : 'banned',
        bannedReason: isCurrentlyBanned ? '' : reason,
      });
      showToast(
        'success',
        isCurrentlyBanned ? `Đã mở khóa ${item.email}.` : `Đã khóa tài khoản ${item.email}.`
      );
      void loadUsers();
      void loadOverview();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể đổi trạng thái.');
    }
  };

  const handleDeleteUser = async (item: AdminUserListItem) => {
    const confirmed = window.confirm(
      `XÓA VĨNH VIỄN tài khoản "${item.name}" (${item.email}) cùng toàn bộ tiến độ học? Hành động này không thể hoàn tác!`
    );
    if (!confirmed) return;
    try {
      await deleteAdminUser(item.id);
      if (detailUser?.user.id === item.id) setDetailUser(null);
      showToast('success', `Đã xóa tài khoản ${item.email}.`);
      void loadUsers();
      void loadOverview();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể xóa tài khoản.');
    }
  };

  const handleRecalculateUser = async (userId: string) => {
    try {
      await recalculateAdminUser(userId);
      const fresh = await fetchAdminUserDetail(userId);
      setDetailUser(fresh);
      showToast('success', `Đã tính lại XP/Level/Streak thật (${fresh.summary.xp} XP · Lv.${fresh.summary.level}).`);
      void loadUsers();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể tính lại chỉ số.');
    }
  };

  const handleResetUserProgress = async (userId: string, scope: 'all' | 'set', setId?: string) => {
    const msg =
      scope === 'all'
        ? 'Xóa TOÀN BỘ tiến độ học, XP và chuỗi ngày học của tài khoản này?'
        : `Xóa tiến độ của bộ đề "${setId}" cho tài khoản này?`;
    if (!window.confirm(msg)) return;
    try {
      await resetAdminUserProgress(userId, scope, setId);
      const fresh = await fetchAdminUserDetail(userId);
      setDetailUser(fresh);
      showToast('success', scope === 'all' ? 'Đã reset toàn bộ tiến độ học.' : `Đã reset bộ đề ${setId}.`);
      void loadUsers();
      void loadOverview();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể reset tiến độ.');
    }
  };

  const handleExportCsv = async () => {
    try {
      await downloadAdminUsersCsv();
      showToast('success', 'Đã tải xuống file CSV danh sách người dùng.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể xuất CSV.');
    }
  };

  const resetAnnouncementForm = () => {
    setEditingAnnId(null);
    setAnnTitle('');
    setAnnContent('');
    setAnnType('update');
    setAnnLinkUrl('');
    setAnnLinkLabel('');
    setAnnPinned(false);
    setAnnActive(true);
  };

  const startEditAnnouncement = (ann: AdminAnnouncement) => {
    setEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnType(ann.type);
    setAnnLinkUrl(ann.linkUrl || '');
    setAnnLinkLabel(ann.linkLabel || '');
    setAnnPinned(ann.isPinned);
    setAnnActive(ann.isActive);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setAnnSubmitting(true);
    try {
      if (editingAnnId) {
        await updateAdminAnnouncement(editingAnnId, {
          title: annTitle.trim(),
          content: annContent.trim(),
          type: annType,
          linkUrl: annLinkUrl.trim(),
          linkLabel: annLinkLabel.trim(),
          isPinned: annPinned,
          isActive: annActive,
        });
        showToast('success', 'Đã cập nhật thông báo hệ thống.');
      } else {
        await createAdminAnnouncement({
          title: annTitle.trim(),
          content: annContent.trim(),
          type: annType,
          linkUrl: annLinkUrl.trim(),
          linkLabel: annLinkLabel.trim(),
          isPinned: annPinned,
          isActive: annActive,
        });
        showToast('success', 'Đã đăng thông báo hệ thống mới.');
      }
      resetAnnouncementForm();
      void loadAnnouncements();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể lưu thông báo.');
    } finally {
      setAnnSubmitting(false);
    }
  };

  const handleToggleAnnouncement = async (ann: AdminAnnouncement) => {
    try {
      await updateAdminAnnouncement(ann.id, { isActive: !ann.isActive });
      void loadAnnouncements();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể bật/tắt thông báo.');
    }
  };

  const handleDeleteAnnouncement = async (ann: AdminAnnouncement) => {
    if (!window.confirm(`Xóa thông báo "${ann.title}"?`)) return;
    try {
      await deleteAdminAnnouncement(ann.id);
      if (editingAnnId === ann.id) resetAnnouncementForm();
      showToast('success', 'Đã xóa thông báo.');
      void loadAnnouncements();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể xóa thông báo.');
    }
  };

  const maxDailyLearners = useMemo(() => {
    if (!overview) return 1;
    return Math.max(1, ...overview.dailyActivity7d.map((d) => Math.max(d.activeLearners, d.newUsers)));
  }, [overview]);

  return (
    <div className={`admin-page theme-${theme}`}>
      <header className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-nav-left">
            <button
              type="button"
              className="admin-back-btn"
              onClick={() => onNavigateTab('library')}
            >
              ← Thư viện
            </button>
            <div className="admin-brand">
              <div className="admin-logo">🛡️</div>
              <div>
                <div className="admin-brand-title">KEYT Admin</div>
                <div className="admin-brand-sub">Quản trị hệ thống</div>
              </div>
            </div>
          </div>

          <div className="admin-nav-right">
            <button
              type="button"
              className="global-theme-toggle-btn"
              onClick={openThemeModal}
              title="Đổi giao diện"
            >
              <span>🎨</span>
              <span>Giao diện</span>
            </button>
            <UserAccountMenu />
          </div>
        </div>
      </header>

      <div className="admin-container">
        {bannerMessage && (
          <div className={`admin-toast is-${bannerMessage.kind}`} role="status">
            <span>
              {bannerMessage.kind === 'success' ? '✅' : '⚠️'} {bannerMessage.text}
            </span>
            <button type="button" onClick={() => setBannerMessage(null)}>
              ✕
            </button>
          </div>
        )}

        {authLoading ? (
          <div className="admin-guard-card">
            <h3>Đang xác thực quyền Quản trị viên...</h3>
          </div>
        ) : !isAuthenticated ? (
          <div className="admin-guard-card">
            <div className="admin-guard-icon">🔐</div>
            <h2>Đăng nhập tài khoản Admin</h2>
            <p>Vui lòng đăng nhập bằng tài khoản Google được cấp quyền Admin để tiếp tục.</p>
            <button
              type="button"
              className="admin-btn-primary"
              data-no-shopee-redirect="true"
              onClick={() => loginWithGoogle('/admin')}
            >
              Đăng nhập với Google
            </button>
          </div>
        ) : !isAdmin ? (
          <div className="admin-guard-card">
            <div className="admin-guard-icon">⛔</div>
            <h2>403 — Không có quyền truy cập</h2>
            <p>
              Tài khoản <strong>{user?.email}</strong> không phải Quản trị viên (Admin).
            </p>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => onNavigateTab('library')}
            >
              ← Quay về Thư viện
            </button>
          </div>
        ) : (
          <>
            {/* TAB BAR */}
            <div className="admin-tabs-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'overview'}
                className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Tổng quan
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'users'}
                className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                👥 Quản lý User ({overview?.totals.totalUsers ?? totalUsersCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'announcements'}
                className={`admin-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
                onClick={() => setActiveTab('announcements')}
              >
                📢 Thông báo hệ thống
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'audit'}
                className={`admin-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit')}
              >
                🧾 Nhật ký Admin
              </button>
            </div>

            {/* ================================================================
                TAB 1: OVERVIEW ANALYTICS
               ================================================================ */}
            {activeTab === 'overview' && (
              <div className="admin-section">
                {overviewLoading && !overview ? (
                  <div className="admin-guard-card">Đang tải thống kê hệ thống...</div>
                ) : overview ? (
                  <>
                    <div className="admin-kpi-grid">
                      <div className="admin-kpi-card">
                        <span className="admin-kpi-label">Tổng người dùng</span>
                        <strong className="admin-kpi-val">{overview.totals.totalUsers}</strong>
                        <span className="admin-kpi-sub">
                          {overview.totals.adminCount} Admin · {overview.totals.bannedUsers} bị khóa
                        </span>
                      </div>
                      <div className="admin-kpi-card">
                        <span className="admin-kpi-label">Học hôm nay (DAU)</span>
                        <strong className="admin-kpi-val">{overview.totals.activeTodayCount}</strong>
                        <span className="admin-kpi-sub">
                          +{overview.totals.newUsers7d} user mới 7 ngày qua
                        </span>
                      </div>
                      <div className="admin-kpi-card">
                        <span className="admin-kpi-label">Tổng câu đã thuộc</span>
                        <strong className="admin-kpi-val">
                          {overview.totals.totalMasteredQuestions.toLocaleString('vi-VN')}
                        </strong>
                        <span className="admin-kpi-sub">
                          {overview.totals.totalFlashcardsKnown.toLocaleString('vi-VN')} thẻ Flashcard
                        </span>
                      </div>
                      <div className="admin-kpi-card">
                        <span className="admin-kpi-label">Bộ đề đã hoàn thành</span>
                        <strong className="admin-kpi-val">{overview.totals.totalCompletedSets}</strong>
                        <span className="admin-kpi-sub">
                          Trên {overview.totals.totalStartedSets} bộ đề đang ôn ·{' '}
                          {overview.totals.activeAnnouncementsCount} thông báo bật
                        </span>
                      </div>
                    </div>

                    {/* 7-day activity chart */}
                    <div className="admin-card">
                      <div className="admin-card-head">
                        <h3>📈 Hoạt động học tập 7 ngày gần nhất (giờ VN)</h3>
                        <button
                          type="button"
                          className="admin-btn-secondary"
                          onClick={() => void loadOverview()}
                        >
                          ↻ Làm mới
                        </button>
                      </div>
                      <div className="admin-chart-bars">
                        {overview.dailyActivity7d.map((d) => {
                          const activeH = Math.max(8, Math.round((d.activeLearners / maxDailyLearners) * 100));
                          const newH = Math.max(4, Math.round((d.newUsers / maxDailyLearners) * 100));
                          return (
                            <div key={d.date} className="admin-chart-col">
                              <div className="admin-chart-pair">
                                <div
                                  className="admin-bar is-active"
                                  style={{ height: `${activeH}%` }}
                                  title={`${d.date}: ${d.activeLearners} người học`}
                                >
                                  <span>{d.activeLearners}</span>
                                </div>
                                <div
                                  className="admin-bar is-new"
                                  style={{ height: `${newH}%` }}
                                  title={`${d.date}: ${d.newUsers} đăng ký mới`}
                                >
                                  <span>{d.newUsers}</span>
                                </div>
                              </div>
                              <span className="admin-chart-date">
                                {d.date.slice(8, 10)}/{d.date.slice(5, 7)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="admin-chart-legend">
                        <span>
                          <i className="legend-dot is-active" /> Học viên hoạt động
                        </span>
                        <span>
                          <i className="legend-dot is-new" /> Người dùng mới
                        </span>
                      </div>
                    </div>

                    <div className="admin-two-col">
                      {/* Top Courses */}
                      <div className="admin-card">
                        <h3>🔥 Top môn học được ôn nhiều nhất</h3>
                        {overview.topCourses.length === 0 ? (
                          <p className="admin-muted">Chưa có dữ liệu môn học.</p>
                        ) : (
                          <div className="admin-rank-list">
                            {overview.topCourses.map((c, idx) => (
                              <div key={c.courseId} className="admin-rank-row">
                                <span className="admin-rank-num">#{idx + 1}</span>
                                <div className="admin-rank-info">
                                  <strong>
                                    {c.courseCode} — {c.courseName}
                                  </strong>
                                  <span>
                                    {c.learnersCount} người học · TB {c.avgPercent}% ·{' '}
                                    {c.totalMastered.toLocaleString('vi-VN')} câu thuộc ({c.passedCount}{' '}
                                    PASS)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Top Learners */}
                      <div className="admin-card">
                        <h3>🏆 Top học viên XP thật cao nhất</h3>
                        {overview.topLearners.length === 0 ? (
                          <p className="admin-muted">Chưa có học viên nào.</p>
                        ) : (
                          <div className="admin-rank-list">
                            {overview.topLearners.map((learner, idx) => (
                              <button
                                key={learner.id}
                                type="button"
                                className="admin-rank-row is-clickable"
                                onClick={() => void handleOpenUserDetail(learner.id)}
                              >
                                <span className="admin-rank-num">#{idx + 1}</span>
                                <div className="admin-rank-info">
                                  <strong>
                                    {learner.name}{' '}
                                    {learner.role === 'admin' && (
                                      <span className="admin-pill is-admin">ADMIN</span>
                                    )}
                                  </strong>
                                  <span>
                                    {learner.email} · Lv.{learner.level} · 🔥 {learner.streakDays} ngày
                                  </span>
                                </div>
                                <span className="admin-rank-xp">
                                  {learner.xp.toLocaleString('vi-VN')} XP
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* ================================================================
                TAB 2: USERS FULL CRUD
               ================================================================ */}
            {activeTab === 'users' && (
              <div className="admin-section">
                <div className="admin-card">
                  <div className="admin-users-toolbar">
                    <div className="admin-search-group">
                      <input
                        type="search"
                        className="admin-input"
                        placeholder="Tìm theo tên, email hoặc MSSV..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                      />
                      <select
                        className="admin-select"
                        value={roleFilter}
                        onChange={(e) => {
                          setRoleFilter(e.target.value as 'all' | UserRole);
                          setPage(1);
                        }}
                      >
                        <option value="all">Mọi vai trò</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                      <select
                        className="admin-select"
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value as 'all' | UserStatus);
                          setPage(1);
                        }}
                      >
                        <option value="all">Mọi trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="banned">Bị khóa</option>
                      </select>
                      <select
                        className="admin-select"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                      >
                        <option value="newest">Mới tham gia</option>
                        <option value="xp_desc">XP cao nhất</option>
                        <option value="last_login">Đăng nhập gần nhất</option>
                        <option value="streak_desc">Streak dài nhất</option>
                      </select>
                    </div>

                    <div className="admin-toolbar-actions">
                      <button type="button" className="admin-btn-secondary" onClick={() => void handleExportCsv()}>
                        📥 Xuất CSV
                      </button>
                      <button type="button" className="admin-btn-primary" onClick={openCreateUserModal}>
                        + Tạo User
                      </button>
                    </div>
                  </div>

                  {usersLoading ? (
                    <div className="admin-loading-box">Đang tải danh sách người dùng...</div>
                  ) : users.length === 0 ? (
                    <div className="admin-loading-box">Không tìm thấy người dùng nào phù hợp.</div>
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Người dùng</th>
                            <th>Quyền & Trạng thái</th>
                            <th>Level / XP / Streak</th>
                            <th>Tiến độ học</th>
                            <th>Đăng nhập gần nhất</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((item) => {
                            const isSelf = item.id === user?.id;
                            return (
                              <tr key={item.id}>
                                <td>
                                  <div className="admin-user-cell">
                                    {item.avatar ? (
                                      <img
                                        src={item.avatar}
                                        alt={item.name}
                                        className="admin-avatar"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="admin-avatar-fallback">
                                        {(item.name || item.email).charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <div className="admin-user-name">
                                        {item.name} {isSelf && <span className="admin-pill">Bạn</span>}
                                      </div>
                                      <div className="admin-user-email">{item.email}</div>
                                      {item.studentId && (
                                        <div className="admin-user-meta">🎓 {item.studentId}</div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="admin-badges-col">
                                    <span className={`admin-pill ${item.role === 'admin' ? 'is-admin' : ''}`}>
                                      {item.role === 'admin' ? '🛡️ Admin' : 'User'}
                                    </span>
                                    <span
                                      className={`admin-pill ${
                                        item.status === 'banned' ? 'is-danger' : 'is-success'
                                      }`}
                                    >
                                      {item.status === 'banned' ? '🔒 Bị khóa' : '✓ Hoạt động'}
                                    </span>
                                    {item.isPreProvisioned && (
                                      <span className="admin-pill">Chưa login Google</span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <strong>Lv.{item.level}</strong> ·{' '}
                                  {item.xp.toLocaleString('vi-VN')} XP
                                  <div className="admin-user-meta">
                                    🔥 {item.streakDays} ngày (kỷ lục {item.longestStreakDays})
                                  </div>
                                </td>
                                <td>
                                  <strong>{item.studiedCoursesCount} môn</strong> ({item.studiedCoursesPercent}%)
                                  <div className="admin-user-meta">
                                    {item.totalMasteredQuestions.toLocaleString('vi-VN')} câu ·{' '}
                                    {item.completedSetsCount} đề xong · {item.flashcardsKnown} thẻ
                                  </div>
                                </td>
                                <td>
                                  <div>{formatDateTime(item.lastLoginAt)}</div>
                                  <div className="admin-user-meta">
                                    Tạo: {formatDateShort(item.createdAt)}
                                  </div>
                                </td>
                                <td>
                                  <div className="admin-row-actions">
                                    <button
                                      type="button"
                                      className="admin-icon-btn"
                                      title="Soi chi tiết tiến độ học"
                                      onClick={() => void handleOpenUserDetail(item.id)}
                                    >
                                      👁️ Chi tiết
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-icon-btn"
                                      title="Sửa thông tin & quyền"
                                      onClick={() => openEditUserModal(item)}
                                    >
                                      ✏️ Sửa
                                    </button>
                                    {!isSelf && (
                                      <>
                                        <button
                                          type="button"
                                          className={`admin-icon-btn ${
                                            item.status === 'banned' ? 'is-success' : 'is-warn'
                                          }`}
                                          onClick={() => void handleQuickToggleBan(item)}
                                        >
                                          {item.status === 'banned' ? '🔓 Mở' : '🔒 Khóa'}
                                        </button>
                                        <button
                                          type="button"
                                          className="admin-icon-btn is-danger"
                                          onClick={() => void handleDeleteUser(item)}
                                        >
                                          🗑️
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="admin-pagination">
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        ← Trang trước
                      </button>
                      <span>
                        Trang {page} / {totalPages} ({totalUsersCount} người dùng)
                      </span>
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Trang sau →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 3: SYSTEM ANNOUNCEMENTS CRUD
               ================================================================ */}
            {activeTab === 'announcements' && (
              <div className="admin-two-col">
                <form className="admin-card admin-form" onSubmit={handleSaveAnnouncement}>
                  <h3>{editingAnnId ? '✏️ Chỉnh sửa thông báo' : '➕ Tạo thông báo mới'}</h3>
                  <label className="admin-field">
                    <span>Tiêu đề *</span>
                    <input
                      type="text"
                      className="admin-input"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      maxLength={140}
                      required
                      placeholder="VD: Đã cập nhật bộ đề FA26 mới!"
                    />
                  </label>
                  <label className="admin-field">
                    <span>Nội dung *</span>
                    <textarea
                      rows={3}
                      className="admin-input"
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      maxLength={500}
                      required
                      placeholder="Thông tin chi tiết hiển thị ở banner Trang chủ..."
                    />
                  </label>
                  <div className="admin-form-row">
                    <label className="admin-field">
                      <span>Loại banner</span>
                      <select
                        className="admin-select"
                        value={annType}
                        onChange={(e) => setAnnType(e.target.value as AnnouncementType)}
                      >
                        <option value="update">🚀 Cập nhật mới</option>
                        <option value="info">📢 Thông tin</option>
                        <option value="event">🎉 Sự kiện</option>
                        <option value="warning">⚠️ Lưu ý / Bảo trì</option>
                      </select>
                    </label>
                    <label className="admin-field">
                      <span>Nhãn link (tuỳ chọn)</span>
                      <input
                        type="text"
                        className="admin-input"
                        value={annLinkLabel}
                        onChange={(e) => setAnnLinkLabel(e.target.value)}
                        placeholder="VD: Ôn ngay →"
                      />
                    </label>
                  </div>
                  <label className="admin-field">
                    <span>Đường dẫn link (tuỳ chọn)</span>
                    <input
                      type="text"
                      className="admin-input"
                      value={annLinkUrl}
                      onChange={(e) => setAnnLinkUrl(e.target.value)}
                      placeholder="/course/mln111 hoặc https://..."
                    />
                  </label>
                  <div className="admin-checkbox-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={annActive}
                        onChange={(e) => setAnnActive(e.target.checked)}
                      />
                      <span>Đang hiển thị công khai</span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={annPinned}
                        onChange={(e) => setAnnPinned(e.target.checked)}
                      />
                      <span>Ghim lên đầu</span>
                    </label>
                  </div>
                  <div className="admin-form-actions">
                    {editingAnnId && (
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        onClick={resetAnnouncementForm}
                      >
                        Hủy sửa
                      </button>
                    )}
                    <button type="submit" className="admin-btn-primary" disabled={annSubmitting}>
                      {annSubmitting
                        ? 'Đang lưu...'
                        : editingAnnId
                          ? 'Lưu thay đổi'
                          : 'Đăng thông báo'}
                    </button>
                  </div>
                </form>

                <div className="admin-card">
                  <h3>📋 Danh sách thông báo ({announcements.length})</h3>
                  {announcementsLoading ? (
                    <div className="admin-loading-box">Đang tải thông báo...</div>
                  ) : announcements.length === 0 ? (
                    <p className="admin-muted">Chưa có thông báo nào. Tạo thông báo đầu tiên ở bên trái!</p>
                  ) : (
                    <div className="admin-ann-list">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="admin-ann-item">
                          <div className="admin-ann-head">
                            <strong>
                              {ann.isPinned ? '📌 ' : ''}
                              {ann.title}
                            </strong>
                            <span className={`admin-pill ${ann.isActive ? 'is-success' : ''}`}>
                              {ann.isActive ? 'Đang bật' : 'Đang ẩn'}
                            </span>
                          </div>
                          <p className="admin-ann-body">{ann.content}</p>
                          <div className="admin-ann-footer">
                            <span className="admin-user-meta">
                              {ann.type} · {formatDateTime(ann.createdAt)}
                            </span>
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                className="admin-icon-btn"
                                onClick={() => void handleToggleAnnouncement(ann)}
                              >
                                {ann.isActive ? 'Ẩn' : 'Bật'}
                              </button>
                              <button
                                type="button"
                                className="admin-icon-btn"
                                onClick={() => startEditAnnouncement(ann)}
                              >
                                ✏️ Sửa
                              </button>
                              <button
                                type="button"
                                className="admin-icon-btn is-danger"
                                onClick={() => void handleDeleteAnnouncement(ann)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 4: ADMIN AUDIT LOGS
               ================================================================ */}
            {activeTab === 'audit' && (
              <div className="admin-card">
                <div className="admin-card-head">
                  <h3>🧾 Nhật ký thao tác Quản trị viên</h3>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => void loadAuditLogs()}
                  >
                    ↻ Làm mới
                  </button>
                </div>
                {auditLoading ? (
                  <div className="admin-loading-box">Đang tải nhật ký...</div>
                ) : auditLogs.length === 0 ? (
                  <p className="admin-muted">Chưa có thao tác quản trị nào được ghi nhận.</p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Thời gian</th>
                          <th>Admin</th>
                          <th>Hành động</th>
                          <th>Đối tượng</th>
                          <th>Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id}>
                            <td>{formatDateTime(log.createdAt)}</td>
                            <td>{log.adminEmail}</td>
                            <td>
                              <span className="admin-pill">{log.action}</span>
                            </td>
                            <td>{log.targetLabel || log.targetId}</td>
                            <td>{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ====================================================================
          MODAL: CREATE / EDIT USER
         ==================================================================== */}
      {userModalMode && (
        <div className="admin-modal-backdrop" onClick={() => setUserModalMode(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>{userModalMode === 'create' ? '➕ Tạo tài khoản User mới' : '✏️ Chỉnh sửa User'}</h3>
              <button type="button" onClick={() => setUserModalMode(null)}>
                ✕
              </button>
            </div>
            <form className="admin-form" onSubmit={handleSubmitUserModal}>
              <label className="admin-field">
                <span>Email Google *</span>
                <input
                  type="email"
                  className="admin-input"
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  disabled={userModalMode === 'edit'}
                  required
                  placeholder="sinhvien@gmail.com"
                />
              </label>
              <label className="admin-field">
                <span>Tên hiển thị *</span>
                <input
                  type="text"
                  className="admin-input"
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  required
                  maxLength={80}
                />
              </label>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>MSSV / Ngành</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={uStudentId}
                    onChange={(e) => setUStudentId(e.target.value)}
                    maxLength={40}
                  />
                </label>
                <label className="admin-field">
                  <span>Kỳ mục tiêu</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={uSemester}
                    onChange={(e) => setUSemester(e.target.value)}
                    maxLength={40}
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Vai trò</span>
                  <select
                    className="admin-select"
                    value={uRole}
                    onChange={(e) => setURole(e.target.value as UserRole)}
                    disabled={editingUserId === user?.id}
                  >
                    <option value="user">User thường</option>
                    <option value="admin">🛡️ Quản trị viên (Admin)</option>
                  </select>
                </label>
                {userModalMode === 'edit' && (
                  <label className="admin-field">
                    <span>Trạng thái</span>
                    <select
                      className="admin-select"
                      value={uStatus}
                      onChange={(e) => setUStatus(e.target.value as UserStatus)}
                      disabled={editingUserId === user?.id}
                    >
                      <option value="active">✓ Đang hoạt động</option>
                      <option value="banned">🔒 Khóa tài khoản</option>
                    </select>
                  </label>
                )}
              </div>
              {userModalMode === 'edit' && uStatus === 'banned' && (
                <label className="admin-field">
                  <span>Lý do khóa tài khoản</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={uBannedReason}
                    onChange={(e) => setUBannedReason(e.target.value)}
                    maxLength={300}
                    placeholder="VD: Spam / vi phạm quy định"
                  />
                </label>
              )}
              <label className="admin-field">
                <span>Ghi chú nội bộ của Admin (chỉ Admin thấy)</span>
                <textarea
                  rows={2}
                  className="admin-input"
                  value={uAdminNote}
                  onChange={(e) => setUAdminNote(e.target.value)}
                  maxLength={500}
                />
              </label>
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setUserModalMode(null)}
                >
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary" disabled={uSubmitting}>
                  {uSubmitting ? 'Đang lưu...' : userModalMode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: INSPECT USER FULL PROGRESS DETAIL
         ==================================================================== */}
      {(detailUser || detailLoading) && (
        <div className="admin-modal-backdrop" onClick={() => setDetailUser(null)}>
          <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>👤 Chi tiết học tập người dùng</h3>
              <button type="button" onClick={() => setDetailUser(null)}>
                ✕
              </button>
            </div>

            {detailLoading && !detailUser ? (
              <div className="admin-loading-box">Đang tải chi tiết hồ sơ...</div>
            ) : detailUser ? (
              <div className="admin-detail-body">
                <div className="admin-detail-header">
                  <div className="admin-user-cell">
                    {detailUser.user.avatar ? (
                      <img
                        src={detailUser.user.avatar}
                        alt={detailUser.user.name}
                        className="admin-avatar admin-avatar--lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="admin-avatar-fallback admin-avatar--lg">
                        {detailUser.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4>
                        {detailUser.user.name}{' '}
                        <span
                          className={`admin-pill ${
                            detailUser.adminMeta.role === 'admin' ? 'is-admin' : ''
                          }`}
                        >
                          {detailUser.adminMeta.role}
                        </span>{' '}
                        <span
                          className={`admin-pill ${
                            detailUser.adminMeta.status === 'banned' ? 'is-danger' : 'is-success'
                          }`}
                        >
                          {detailUser.adminMeta.status}
                        </span>
                      </h4>
                      <div className="admin-user-email">{detailUser.user.email}</div>
                      <div className="admin-user-meta">
                        Lv.{detailUser.summary.level} ·{' '}
                        {detailUser.summary.xp.toLocaleString('vi-VN')} XP · 🔥{' '}
                        {detailUser.summary.streakDays} ngày (kỷ lục{' '}
                        {detailUser.summary.longestStreakDays ?? 0}) ·{' '}
                        {detailUser.summary.totalMasteredQuestions.toLocaleString('vi-VN')} câu đã thuộc
                      </div>
                    </div>
                  </div>

                  <div className="admin-detail-actions">
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => void handleRecalculateUser(detailUser.user.id)}
                    >
                      ⚡ Tính lại XP thật
                    </button>
                    <button
                      type="button"
                      className="admin-btn-danger"
                      onClick={() => void handleResetUserProgress(detailUser.user.id, 'all')}
                    >
                      ↻ Reset toàn bộ tiến độ
                    </button>
                  </div>
                </div>

                {detailUser.adminMeta.adminNote && (
                  <div className="admin-note-box">
                    📝 <strong>Ghi chú Admin:</strong> {detailUser.adminMeta.adminNote}
                  </div>
                )}

                <div className="admin-detail-tabs">
                  <button
                    type="button"
                    className={`admin-tab-btn ${detailTab === 'courses' ? 'active' : ''}`}
                    onClick={() => setDetailTab('courses')}
                  >
                    📚 Môn đã học ({detailUser.courses.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab-btn ${detailTab === 'sets' ? 'active' : ''}`}
                    onClick={() => setDetailTab('sets')}
                  >
                    📝 Bộ đề đã làm ({detailUser.sets.filter((s) => !s.isKnowledgeGroup).length})
                  </button>
                  <button
                    type="button"
                    className={`admin-tab-btn ${detailTab === 'flashcards' ? 'active' : ''}`}
                    onClick={() => setDetailTab('flashcards')}
                  >
                    🃏 Flashcard ({detailUser.flashcards.length})
                  </button>
                </div>

                {detailTab === 'courses' && (
                  <div className="admin-detail-list">
                    {detailUser.courses.length === 0 ? (
                      <p className="admin-muted">Người dùng chưa học môn nào.</p>
                    ) : (
                      detailUser.courses.map((c) => (
                        <div key={c.courseId} className="admin-detail-row">
                          <div>
                            <strong>
                              {c.courseCode} — {c.courseName}
                            </strong>
                            <div className="admin-user-meta">
                              {c.masteredQuestions}/{c.totalQuestions} câu · {c.startedSets}/
                              {c.totalSets} bộ đề ({c.completedSets} xong)
                            </div>
                          </div>
                          <div className="admin-detail-right">
                            <strong>{c.percent}%</strong>
                            <div className="admin-mini-bar">
                              <div style={{ width: `${c.percent}%` }} />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {detailTab === 'sets' && (
                  <div className="admin-detail-list">
                    {detailUser.sets.filter((s) => !s.isKnowledgeGroup).length === 0 ? (
                      <p className="admin-muted">Người dùng chưa làm bộ đề nào.</p>
                    ) : (
                      detailUser.sets
                        .filter((s) => !s.isKnowledgeGroup)
                        .map((s) => (
                          <div key={s.setId} className="admin-detail-row">
                            <div>
                              <strong>
                                [{s.courseCode || s.courseId}] {s.setTitle}
                              </strong>
                              <div className="admin-user-meta">
                                {s.masteredCount}/{s.totalQuestions} câu · Cập nhật{' '}
                                {formatDateTime(s.lastStudiedAt)}
                              </div>
                            </div>
                            <div className="admin-detail-right">
                              <strong>{s.percent}%</strong>
                              <button
                                type="button"
                                className="admin-icon-btn is-danger"
                                onClick={() =>
                                  void handleResetUserProgress(detailUser.user.id, 'set', s.setId)
                                }
                              >
                                Reset đề
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}

                {detailTab === 'flashcards' && (
                  <div className="admin-detail-list">
                    {detailUser.flashcards.length === 0 ? (
                      <p className="admin-muted">Người dùng chưa học bộ Flashcard nào.</p>
                    ) : (
                      detailUser.flashcards.map((fc) => (
                        <div key={fc.flashcardSetId} className="admin-detail-row">
                          <div>
                            <strong>{fc.title}</strong>
                            <div className="admin-user-meta">
                              {fc.knownCount}/{fc.totalCards} thẻ đã thuộc
                            </div>
                          </div>
                          <div className="admin-detail-right">
                            <strong>{fc.percent}%</strong>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
