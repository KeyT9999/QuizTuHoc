export type AppTheme = 'cozy-night' | 'fantasy-academy' | 'hon-viet' | 'lotus-zen-sanctuary' | 'default';

const THEME_STORAGE_KEY = 'keyt_selected_ui_theme';
const FOCUS_MODE_KEY = 'keyt_focus_mode_enabled';
const XP_STORAGE_KEY = 'keyt_user_total_xp';
const STREAK_DAYS_KEY = 'keyt_study_streak_days';
const STREAK_LAST_DATE_KEY = 'keyt_study_streak_last_date';

// Theme Management
export function getAppTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (
      saved === 'default' ||
      saved === 'cozy-night' ||
      saved === 'fantasy-academy' ||
      saved === 'hon-viet' ||
      saved === 'lotus-zen-sanctuary'
    ) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'hon-viet'; // Default to Hồn Việt Study Dashboard
}

export function setAppTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent('keyt-theme-changed', { detail: theme }));
  } catch {
    // ignore
  }
}

// Focus Mode
export function getFocusMode(): boolean {
  try {
    return localStorage.getItem(FOCUS_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setFocusMode(enabled: boolean): void {
  try {
    localStorage.setItem(FOCUS_MODE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('keyt-focus-mode-changed', { detail: enabled }));
  } catch {
    // ignore
  }
}

// One-time cleanup of legacy mock default values
const MOCK_CLEANED_FLAG = 'keyt_mock_data_cleaned_v2';
try {
  if (typeof window !== 'undefined' && localStorage.getItem(MOCK_CLEANED_FLAG) !== 'true') {
    // If previously initialized with hardcoded mock '6' or mock '2478', reset to clean state
    if (localStorage.getItem(STREAK_DAYS_KEY) === '6') {
      localStorage.removeItem(STREAK_DAYS_KEY);
      localStorage.removeItem(STREAK_LAST_DATE_KEY);
    }
    if (localStorage.getItem(XP_STORAGE_KEY) === '2478') {
      localStorage.removeItem(XP_STORAGE_KEY);
    }
    localStorage.setItem(MOCK_CLEANED_FLAG, 'true');
  }
} catch {
  // ignore
}

// XP Gamification
export function getUserXP(): number {
  try {
    const raw = localStorage.getItem(XP_STORAGE_KEY);
    if (raw) {
      const val = parseInt(raw, 10);
      if (!isNaN(val) && val >= 0) return val;
    }
  } catch {
    // ignore
  }
  return 0; // Pure real data: starts at 0 XP
}

export function addStudyXP(amount: number): number {
  const current = getUserXP();
  const next = current + Math.max(0, amount);
  try {
    localStorage.setItem(XP_STORAGE_KEY, next.toString());
    window.dispatchEvent(new CustomEvent('keyt-xp-changed', { detail: next }));
    window.dispatchEvent(new CustomEvent('keyt-xp-earned', { detail: next }));
    window.dispatchEvent(new Event('storage'));
  } catch {
    // ignore
  }
  return next;
}

export function calculateLevel(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; remainingXp: number } {
  const XP_PER_LEVEL = 250;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXp = xp % XP_PER_LEVEL;
  const remainingXp = XP_PER_LEVEL - currentLevelXp;
  return {
    level,
    currentLevelXp,
    nextLevelXp: XP_PER_LEVEL,
    remainingXp,
  };
}

// Study Streak Management (100% Real User Activity)
export function getStudyStreak(): number {
  try {
    const savedStreakRaw = localStorage.getItem(STREAK_DAYS_KEY);
    const lastDate = localStorage.getItem(STREAK_LAST_DATE_KEY);

    if (!savedStreakRaw || !lastDate) {
      return 0; // No real study recorded yet -> 0 days
    }

    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const streak = parseInt(savedStreakRaw, 10) || 0;

    // If last active study was today or yesterday, streak is currently valid
    if (lastDate === today || lastDate === yesterdayStr) {
      return streak;
    }

    // Missed more than 1 calendar day without studying -> streak reset to 0
    localStorage.setItem(STREAK_DAYS_KEY, '0');
    return 0;
  } catch {
    return 0;
  }
}

export function recordDailyStudy(): number {
  try {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(STREAK_LAST_DATE_KEY);
    const savedStreak = parseInt(localStorage.getItem(STREAK_DAYS_KEY) || '0', 10);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // Already recorded study session for today: keep current streak
    if (lastDate === today) {
      const activeStreak = Math.max(1, savedStreak);
      localStorage.setItem(STREAK_DAYS_KEY, activeStreak.toString());
      return activeStreak;
    }

    let nextStreak = 1;
    // Studied yesterday: maintain unbroken streak (+1 day)
    if (lastDate === yesterdayStr) {
      nextStreak = Math.max(1, savedStreak) + 1;
    } else {
      // First day ever or restarted after missing days
      nextStreak = 1;
    }

    localStorage.setItem(STREAK_DAYS_KEY, nextStreak.toString());
    localStorage.setItem(STREAK_LAST_DATE_KEY, today);
    window.dispatchEvent(new CustomEvent('keyt-streak-changed', { detail: nextStreak }));
    window.dispatchEvent(new Event('storage'));
    return nextStreak;
  } catch {
    return 0;
  }
}

