export interface XpBreakdown {
  masteredQuestionsXp: number;
  flashcardsXp: number;
  completedSetsXp: number;
  passedCoursesXp: number;
  studyDaysXp: number;
}

export interface RecentStudyDay {
  date: string;
  studied: boolean;
}

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'banned';
export type AnnouncementType = 'info' | 'update' | 'warning' | 'event';

export interface UserProfileBasics {
  id: string;
  email: string;
  name: string;
  googleName: string;
  givenName: string;
  avatar: string;
  bio: string;
  studentId: string;
  targetSemester: string;
  role?: UserRole;
  status?: UserStatus;
  bannedReason?: string;
  xp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  remainingXp: number;
  streakDays: number;
  longestStreakDays?: number;
  streakLastDate: string;
  studiedToday?: boolean;
  totalStudyDays?: number;
  lastLoginAt: string;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface ProfileSummary {
  xp: number;
  xpBreakdown?: XpBreakdown;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  remainingXp: number;
  streakDays: number;
  longestStreakDays?: number;
  streakLastDate: string;
  studiedToday?: boolean;
  totalStudyDays?: number;
  recent7Days?: RecentStudyDay[];
  studiedCoursesCount: number;
  passedCoursesCount: number;
  startedSetsCount: number;
  completedSetsCount: number;
  totalMasteredQuestions: number;
  studiedCoursesTotalQuestions: number;
  studiedCoursesPercent: number;
  totalCatalogQuestions: number;
  overallCatalogPercent: number;
  flashcardsKnown: number;
  flashcardsTotal: number;
  flashcardPercent: number;
}

export interface ProfileCourseItem {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalSets: number;
  startedSets: number;
  completedSets: number;
  totalQuestions: number;
  masteredQuestions: number;
  percent: number;
  isPassed: boolean;
  lastStudiedAt: string;
}

export interface ProfileSetItem {
  setId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  setTitle: string;
  kind: 'text' | 'image';
  isKnowledgeGroup: boolean;
  totalQuestions: number;
  masteredIds: number[];
  masteredCount: number;
  percent: number;
  isCompleted: boolean;
  lastStudiedAt: string;
}

export interface ProfileFlashcardItem {
  flashcardSetId: string;
  title: string;
  totalCards: number;
  knownIds: number[];
  knownCount: number;
  percent: number;
  lastStudiedAt: string;
}

export interface FullProfileResponse {
  user: UserProfileBasics;
  summary: ProfileSummary;
  courses: ProfileCourseItem[];
  sets: ProfileSetItem[];
  flashcards: ProfileFlashcardItem[];
  recentCourseIds: string[];
}

export interface ProgressSyncSetInput {
  setId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  setTitle: string;
  kind: 'text' | 'image';
  isKnowledgeGroup: boolean;
  totalQuestions: number;
  masteredIds: number[];
}

export interface ProgressSyncCourseCatalogInput {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalSets: number;
  totalQuestions: number;
}

export interface ProgressSyncFlashcardInput {
  flashcardSetId: string;
  title: string;
  totalCards: number;
  knownIds: number[];
}

export interface ProgressSyncPayload {
  xp: number;
  streakDays: number;
  streakLastDate: string;
  activityRecorded?: boolean;
  recentCourseIds: string[];
  totalCatalogQuestions: number;
  sets: ProgressSyncSetInput[];
  courseCatalog: ProgressSyncCourseCatalogInput[];
  flashcards: ProgressSyncFlashcardInput[];
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  studentId?: string;
  targetSemester?: string;
}

export class BackendApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'BackendApiError';
    this.status = status;
    this.code = code;
  }
}

const AUTH_TOKEN_STORAGE_KEY = 'keyt_auth_jwt_token';

export function getBackendBaseUrl(): string {
  const configured = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');
  if (configured) return configured;
  if (import.meta.env.DEV) return 'http://localhost:4000';
  return '';
}

export function isBackendConfigured(): boolean {
  return getBackendBaseUrl().length > 0;
}

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function buildGoogleLoginUrl(redirectPath = '/profile'): string {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) return '';
  const safeRedirect = redirectPath.startsWith('/') ? redirectPath : '/profile';
  return `${baseUrl}/api/auth/google?redirect=${encodeURIComponent(safeRedirect)}`;
}

async function apiFetch<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    keepalive?: boolean;
    skipAuthHeader?: boolean;
  } = {}
): Promise<T> {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) {
    throw new BackendApiError(
      503,
      'BACKEND_NOT_CONFIGURED',
      'Chưa cấu hình địa chỉ máy chủ backend (VITE_BACKEND_URL).'
    );
  }

  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (!options.skipAuthHeader) {
    const token = getStoredAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      credentials: 'include',
      keepalive: options.keepalive,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new BackendApiError(
      0,
      'NETWORK_ERROR',
      'Không thể kết nối tới máy chủ backend. Vui lòng kiểm tra kết nối mạng hoặc trạng thái VPS.'
    );
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errObj =
      typeof data === 'object' && data !== null && 'error' in data
        ? (data as { error?: { code?: string; message?: string } }).error
        : undefined;
    throw new BackendApiError(
      response.status,
      errObj?.code || `HTTP_${response.status}`,
      errObj?.message || 'Yêu cầu tới máy chủ thất bại.'
    );
  }

  return data as T;
}

export async function exchangeAuthTicket(
  ticket: string
): Promise<{ token: string; user: UserProfileBasics }> {
  return apiFetch<{ token: string; user: UserProfileBasics }>('/api/auth/exchange', {
    method: 'POST',
    body: { ticket },
    skipAuthHeader: true,
  });
}

export async function fetchCurrentProfile(): Promise<FullProfileResponse> {
  return apiFetch<FullProfileResponse>('/api/profile/me', { method: 'GET' });
}

export async function updateCurrentProfile(
  patch: UpdateProfileInput
): Promise<{ user: UserProfileBasics }> {
  return apiFetch<{ user: UserProfileBasics }>('/api/profile/me', {
    method: 'PATCH',
    body: patch,
  });
}

export async function mergeProgressToBackend(
  payload: ProgressSyncPayload
): Promise<FullProfileResponse> {
  return apiFetch<FullProfileResponse>('/api/progress/merge', {
    method: 'POST',
    body: payload,
  });
}

export async function syncProgressToBackend(
  payload: ProgressSyncPayload,
  options?: { keepalive?: boolean }
): Promise<FullProfileResponse> {
  return apiFetch<FullProfileResponse>('/api/progress/sync', {
    method: 'PUT',
    body: payload,
    keepalive: options?.keepalive,
  });
}

export async function logoutBackend(): Promise<void> {
  try {
    await apiFetch<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore logout network error and clear local token regardless
  }
}

// ============================================================================
// PUBLIC ANNOUNCEMENTS & ADMIN CRUD APIs
// ============================================================================

export interface PublicAnnouncement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  linkUrl: string;
  linkLabel: string;
  isPinned: boolean;
  createdAt: string;
}

export interface AdminAnnouncement extends PublicAnnouncement {
  isActive: boolean;
  expiresAt: string | null;
  createdByEmail: string;
  updatedAt: string;
}

export interface AdminOverviewResponse {
  totals: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    adminCount: number;
    newUsers7d: number;
    activeTodayCount: number;
    totalMasteredQuestions: number;
    totalStartedSets: number;
    totalCompletedSets: number;
    totalFlashcardsKnown: number;
    activeAnnouncementsCount: number;
  };
  dailyActivity7d: Array<{
    date: string;
    activeLearners: number;
    newUsers: number;
  }>;
  topCourses: Array<{
    courseId: string;
    courseCode: string;
    courseName: string;
    learnersCount: number;
    avgPercent: number;
    passedCount: number;
    totalMastered: number;
  }>;
  topLearners: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: UserRole;
    xp: number;
    level: number;
    streakDays: number;
    totalStudyDays: number;
  }>;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  googleName: string;
  avatar: string;
  bio: string;
  studentId: string;
  targetSemester: string;
  role: UserRole;
  status: UserStatus;
  bannedReason: string;
  bannedAt: string | null;
  adminNote: string;
  isPreProvisioned: boolean;
  xp: number;
  level: number;
  streakDays: number;
  longestStreakDays: number;
  totalStudyDays: number;
  studiedCoursesCount: number;
  passedCoursesCount: number;
  studiedCoursesPercent: number;
  totalMasteredQuestions: number;
  startedSetsCount: number;
  completedSetsCount: number;
  flashcardsKnown: number;
  lastLoginAt: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface AdminUsersListResponse {
  users: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUserDetailResponse extends FullProfileResponse {
  adminMeta: {
    role: UserRole;
    status: UserStatus;
    bannedReason: string;
    bannedAt: string | null;
    adminNote: string;
    isPreProvisioned: boolean;
    studyDates: string[];
  };
}

export interface AdminCreateUserInput {
  email: string;
  name: string;
  studentId?: string;
  targetSemester?: string;
  bio?: string;
  role?: UserRole;
  adminNote?: string;
}

export interface AdminUpdateUserInput {
  name?: string;
  studentId?: string;
  targetSemester?: string;
  bio?: string;
  role?: UserRole;
  status?: UserStatus;
  bannedReason?: string;
  adminNote?: string;
}

export interface AdminAnnouncementInput {
  title: string;
  content: string;
  type: AnnouncementType;
  linkUrl?: string;
  linkLabel?: string;
  isActive?: boolean;
  isPinned?: boolean;
  expiresAt?: string | null;
}

export interface AdminAuditLogItem {
  id: string;
  adminEmail: string;
  action: string;
  targetType: 'user' | 'announcement' | 'system';
  targetId: string;
  targetLabel: string;
  details: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  studentId: string;
  role: UserRole;
  xp: number;
  level: number;
  streakDays: number;
  longestStreakDays: number;
  studiedCoursesCount: number;
  totalMasteredQuestions: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  sort: 'xp' | 'streak';
  totalActiveLearners: number;
  communityMasteredQuestions: number;
  leaders: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
}

export async function fetchLeaderboard(
  sort: 'xp' | 'streak' = 'xp',
  limit = 6
): Promise<LeaderboardResponse> {
  return apiFetch<LeaderboardResponse>(`/api/leaderboard?sort=${sort}&limit=${limit}`, {
    method: 'GET',
  });
}

export async function fetchActiveAnnouncements(): Promise<{ announcements: PublicAnnouncement[] }> {
  return apiFetch<{ announcements: PublicAnnouncement[] }>('/api/announcements/active', {
    method: 'GET',
    skipAuthHeader: true,
  });
}

export async function fetchAdminOverview(): Promise<AdminOverviewResponse> {
  return apiFetch<AdminOverviewResponse>('/api/admin/overview', { method: 'GET' });
}

export async function fetchAdminUsers(params: {
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<AdminUsersListResponse> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.role && params.role !== 'all') qs.set('role', params.role);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.sort) qs.set('sort', params.sort);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return apiFetch<AdminUsersListResponse>(`/api/admin/users${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
}

export async function fetchAdminUserDetail(userId: string): Promise<AdminUserDetailResponse> {
  return apiFetch<AdminUserDetailResponse>(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'GET',
  });
}

export async function createAdminUser(payload: AdminCreateUserInput): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/api/admin/users', {
    method: 'POST',
    body: payload,
  });
}

export async function updateAdminUser(
  userId: string,
  payload: AdminUpdateUserInput
): Promise<AdminUserDetailResponse> {
  return apiFetch<AdminUserDetailResponse>(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function recalculateAdminUser(userId: string): Promise<FullProfileResponse> {
  return apiFetch<FullProfileResponse>(
    `/api/admin/users/${encodeURIComponent(userId)}/recalculate`,
    { method: 'POST' }
  );
}

export async function resetAdminUserProgress(
  userId: string,
  scope: 'all' | 'set',
  setId?: string
): Promise<FullProfileResponse> {
  return apiFetch<FullProfileResponse>(
    `/api/admin/users/${encodeURIComponent(userId)}/reset-progress`,
    {
      method: 'POST',
      body: { scope, ...(setId ? { setId } : {}) },
    }
  );
}

export async function deleteAdminUser(userId: string): Promise<{ ok: boolean; deletedId: string }> {
  return apiFetch<{ ok: boolean; deletedId: string }>(
    `/api/admin/users/${encodeURIComponent(userId)}`,
    { method: 'DELETE' }
  );
}

export async function downloadAdminUsersCsv(): Promise<void> {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) {
    throw new BackendApiError(503, 'BACKEND_NOT_CONFIGURED', 'Chưa cấu hình backend.');
  }
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/api/admin/users/export.csv`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    throw new BackendApiError(res.status, 'EXPORT_FAILED', 'Không thể xuất file CSV.');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `quiztuhoc-users-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function fetchAdminAnnouncements(): Promise<{ announcements: AdminAnnouncement[] }> {
  return apiFetch<{ announcements: AdminAnnouncement[] }>('/api/admin/announcements', {
    method: 'GET',
  });
}

export async function createAdminAnnouncement(
  payload: AdminAnnouncementInput
): Promise<{ announcement: AdminAnnouncement }> {
  return apiFetch<{ announcement: AdminAnnouncement }>('/api/admin/announcements', {
    method: 'POST',
    body: payload,
  });
}

export async function updateAdminAnnouncement(
  id: string,
  payload: Partial<AdminAnnouncementInput>
): Promise<{ announcement: AdminAnnouncement }> {
  return apiFetch<{ announcement: AdminAnnouncement }>(
    `/api/admin/announcements/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: payload,
    }
  );
}

export async function deleteAdminAnnouncement(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/admin/announcements/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminAuditLogs(limit = 50): Promise<{ logs: AdminAuditLogItem[] }> {
  return apiFetch<{ logs: AdminAuditLogItem[] }>(`/api/admin/audit-logs?limit=${limit}`, {
    method: 'GET',
  });
}
