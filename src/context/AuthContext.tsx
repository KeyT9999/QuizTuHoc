import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { DEFAULT_COURSES } from '../data/courses';
import { DEFAULT_QUIZ_SETS } from '../data/quizSets';
import { FLASHCARD_SETS } from '../data/flashcardData';
import { loadCustomCourses, loadCustomQuizSets } from '../utils/courseStorage';
import {
  BackendApiError,
  buildGoogleLoginUrl,
  exchangeAuthTicket,
  fetchCurrentProfile,
  getStoredAuthToken,
  isBackendConfigured,
  logoutBackend,
  mergeProgressToBackend,
  setStoredAuthToken,
  syncProgressToBackend,
  updateCurrentProfile,
  type FullProfileResponse,
  type UpdateProfileInput,
  type UserProfileBasics,
} from '../utils/backendApi';
import {
  collectLocalProgressSnapshot,
  hydrateLocalStorageFromProfile,
  reconcileGuestLocalXP,
  STUDY_PROGRESS_UPDATED_EVENT,
  type StudyProgressUpdateDetail,
} from '../utils/progressSync';
import { navigateTo } from '../utils/router';

interface AuthContextValue {
  user: UserProfileBasics | null;
  profile: FullProfileResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  isBackendReady: boolean;
  authError: string | null;
  syncError: string | null;
  lastSyncedAt: string | null;
  loginWithGoogle: (redirectPath?: string) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  syncNow: () => Promise<void>;
  updateProfile: (patch: UpdateProfileInput) => Promise<boolean>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  cancelled: 'Bạn đã hủy đăng nhập Google.',
  google_not_configured: 'Máy chủ backend chưa cấu hình Google OAuth.',
  invalid_state: 'Phiên đăng nhập Google đã hết hạn. Vui lòng thử đăng nhập lại.',
  email_not_verified: 'Email Google của bạn chưa được xác minh.',
  oauth_callback_failed: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
  oauth_init_failed: 'Không thể khởi tạo phiên đăng nhập Google.',
};

function getAllCatalogItems() {
  return {
    courses: [...DEFAULT_COURSES, ...loadCustomCourses()],
    quizSets: [...DEFAULT_QUIZ_SETS, ...loadCustomQuizSets()],
    flashcardSets: FLASHCARD_SETS,
  };
}

// Deduplicate single-use OAuth ticket exchanges (critical under React StrictMode double-effects in dev)
const inFlightTicketExchanges = new Map<string, Promise<FullProfileResponse>>();

function completeOAuthTicketLogin(ticket: string): Promise<FullProfileResponse> {
  const existing = inFlightTicketExchanges.get(ticket);
  if (existing) return existing;

  const task = (async () => {
    const { token } = await exchangeAuthTicket(ticket);
    setStoredAuthToken(token);

    // Auto-merge existing browser progress with MongoDB on login!
    const { courses, quizSets, flashcardSets } = getAllCatalogItems();
    const localSnapshot = collectLocalProgressSnapshot(courses, quizSets, flashcardSets);
    return mergeProgressToBackend(localSnapshot);
  })();

  inFlightTicketExchanges.set(ticket, task);
  void task.finally(() => {
    window.setTimeout(() => inFlightTicketExchanges.delete(ticket), 5000);
  });

  return task;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<FullProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isBackendReady = isBackendConfigured();
  const isAuthenticated = Boolean(profile?.user);

  const pendingSyncTimerRef = useRef<number | null>(null);
  const pendingResetSetIdsRef = useRef<Set<string>>(new Set());
  const pendingResetFlashcardIdsRef = useRef<Set<string>>(new Set());
  const pendingActivityRecordedRef = useRef<boolean>(false);
  const hasDirtyChangesRef = useRef<boolean>(false);
  const isAuthenticatedRef = useRef<boolean>(false);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const applyProfile = useCallback((nextProfile: FullProfileResponse, hydrateLocal = true) => {
    setProfile(nextProfile);
    setSyncError(null);
    if (hydrateLocal) {
      hydrateLocalStorageFromProfile(nextProfile);
    }
  }, []);

  const performSync = useCallback(
    async (options?: { keepalive?: boolean }) => {
      if (!isBackendReady || !isAuthenticatedRef.current) return;

      const resetSetIds = Array.from(pendingResetSetIdsRef.current);
      const resetFlashcardIds = Array.from(pendingResetFlashcardIdsRef.current);
      const activityRecorded = pendingActivityRecordedRef.current;
      pendingResetSetIdsRef.current.clear();
      pendingResetFlashcardIdsRef.current.clear();
      pendingActivityRecordedRef.current = false;
      hasDirtyChangesRef.current = false;

      const { courses, quizSets, flashcardSets } = getAllCatalogItems();
      const snapshot = collectLocalProgressSnapshot(courses, quizSets, flashcardSets, {
        includeZeroSetIds: resetSetIds,
        includeZeroFlashcardIds: resetFlashcardIds,
        activityRecorded,
      });

      setIsSyncing(true);
      try {
        const updatedProfile = await syncProgressToBackend(snapshot, options);
        applyProfile(updatedProfile, true);
      } catch (error) {
        if (error instanceof BackendApiError && error.status === 401) {
          setStoredAuthToken(null);
          setProfile(null);
          setAuthError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error instanceof Error) {
          setSyncError(error.message);
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [applyProfile, isBackendReady]
  );

  // Initial bootstrap: handle /auth/callback OR restore existing session
  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      if (!isBackendReady) {
        setIsLoading(false);
        return;
      }

      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      const searchParams = new URLSearchParams(window.location.search);

      // Case 1: Returning from Google OAuth callback
      if (pathname === '/auth/callback') {
        const oauthErr = searchParams.get('error');
        const ticket = searchParams.get('ticket');
        const targetRedirect = searchParams.get('redirect') || '/profile';

        if (oauthErr) {
          if (!cancelled) {
            setAuthError(OAUTH_ERROR_MESSAGES[oauthErr] || 'Đăng nhập Google không thành công.');
            setIsLoading(false);
            navigateTo('/profile', true);
          }
          return;
        }

        if (ticket) {
          try {
            const mergedProfile = await completeOAuthTicketLogin(ticket);
            if (cancelled) return;

            applyProfile(mergedProfile, true);
            setAuthError(null);
            navigateTo(targetRedirect.startsWith('/') ? targetRedirect : '/profile', true);
          } catch (error) {
            if (!cancelled) {
              setStoredAuthToken(null);
              setAuthError(
                error instanceof Error ? error.message : 'Không thể hoàn tất đăng nhập Google.'
              );
              navigateTo('/profile', true);
            }
          } finally {
            if (!cancelled) setIsLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setIsLoading(false);
          navigateTo('/profile', true);
        }
        return;
      }

      // Case 2: Existing session check (only if token exists to avoid unnecessary 401 noise for guests)
      const token = getStoredAuthToken();
      if (!token) {
        const { courses, quizSets, flashcardSets } = getAllCatalogItems();
        reconcileGuestLocalXP(courses, quizSets, flashcardSets);
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const fetchedProfile = await fetchCurrentProfile();
        if (!cancelled) {
          applyProfile(fetchedProfile, true);
        }
      } catch (error) {
        if (!cancelled && error instanceof BackendApiError && error.status === 401) {
          setStoredAuthToken(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void initAuth();
    return () => {
      cancelled = true;
    };
  }, [applyProfile, isBackendReady]);

  // Listen to local study progress events and auto-sync (debounced 1.5s)
  useEffect(() => {
    if (!isAuthenticated || !isBackendReady) return;

    const handleProgressUpdate = (event: Event) => {
      const detail = (event as CustomEvent<StudyProgressUpdateDetail | undefined>).detail;
      if (detail?.resetSetIds) {
        for (const id of detail.resetSetIds) pendingResetSetIdsRef.current.add(id);
      }
      if (detail?.resetFlashcardIds) {
        for (const id of detail.resetFlashcardIds) pendingResetFlashcardIdsRef.current.add(id);
      }
      if (detail?.activityRecorded) {
        pendingActivityRecordedRef.current = true;
      }

      hasDirtyChangesRef.current = true;
      if (pendingSyncTimerRef.current !== null) {
        window.clearTimeout(pendingSyncTimerRef.current);
      }
      pendingSyncTimerRef.current = window.setTimeout(() => {
        pendingSyncTimerRef.current = null;
        void performSync();
      }, 1500);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasDirtyChangesRef.current) {
        if (pendingSyncTimerRef.current !== null) {
          window.clearTimeout(pendingSyncTimerRef.current);
          pendingSyncTimerRef.current = null;
        }
        void performSync({ keepalive: true });
      }
    };

    window.addEventListener(STUDY_PROGRESS_UPDATED_EVENT, handleProgressUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener(STUDY_PROGRESS_UPDATED_EVENT, handleProgressUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pendingSyncTimerRef.current !== null) {
        window.clearTimeout(pendingSyncTimerRef.current);
        pendingSyncTimerRef.current = null;
      }
    };
  }, [isAuthenticated, isBackendReady, performSync]);

  const loginWithGoogle = useCallback(
    (redirectPath?: string) => {
      if (!isBackendReady) {
        setAuthError('Chưa cấu hình địa chỉ máy chủ backend (VITE_BACKEND_URL).');
        return;
      }
      const nextPath =
        redirectPath ||
        (window.location.pathname === '/auth/callback' ? '/profile' : window.location.pathname);
      const url = buildGoogleLoginUrl(nextPath);
      if (url) {
        window.location.href = url;
      }
    },
    [isBackendReady]
  );

  const logout = useCallback(async () => {
    if (hasDirtyChangesRef.current) {
      await performSync();
    }
    await logoutBackend();
    setStoredAuthToken(null);
    setProfile(null);
    setSyncError(null);
  }, [performSync]);

  const refreshProfile = useCallback(async () => {
    if (!isBackendReady || !isAuthenticatedRef.current) return;
    setIsSyncing(true);
    try {
      const latest = await fetchCurrentProfile();
      applyProfile(latest, true);
    } catch (error) {
      if (error instanceof BackendApiError && error.status === 401) {
        setStoredAuthToken(null);
        setProfile(null);
      } else if (error instanceof Error) {
        setSyncError(error.message);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [applyProfile, isBackendReady]);

  const syncNow = useCallback(async () => {
    if (!isBackendReady || !isAuthenticatedRef.current) return;
    if (pendingSyncTimerRef.current !== null) {
      window.clearTimeout(pendingSyncTimerRef.current);
      pendingSyncTimerRef.current = null;
    }

    const { courses, quizSets, flashcardSets } = getAllCatalogItems();
    const localSnapshot = collectLocalProgressSnapshot(courses, quizSets, flashcardSets);

    setIsSyncing(true);
    try {
      const merged = await mergeProgressToBackend(localSnapshot);
      applyProfile(merged, true);
    } catch (error) {
      if (error instanceof Error) setSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  }, [applyProfile, isBackendReady]);

  const updateProfile = useCallback(async (patch: UpdateProfileInput): Promise<boolean> => {
    try {
      const { user: updatedUser } = await updateCurrentProfile(patch);
      setProfile((prev) => (prev ? { ...prev, user: updatedUser } : prev));
      setSyncError(null);
      return true;
    } catch (error) {
      if (error instanceof Error) setSyncError(error.message);
      return false;
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user: profile?.user ?? null,
        profile,
        isAuthenticated,
        isLoading,
        isSyncing,
        isBackendReady,
        authError,
        syncError,
        lastSyncedAt: profile?.user.lastSyncedAt ?? null,
        loginWithGoogle,
        logout,
        refreshProfile,
        syncNow,
        updateProfile,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
