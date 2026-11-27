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
