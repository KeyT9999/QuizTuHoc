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
  return 2478; // Baseline starting XP matching mock
}

export function addStudyXP(amount: number): number {
  const current = getUserXP();
  const next = current + Math.max(0, amount);
  try {
    localStorage.setItem(XP_STORAGE_KEY, next.toString());
    window.dispatchEvent(new CustomEvent('keyt-xp-changed', { detail: next }));
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

// Study Streak Management
export function getStudyStreak(): number {
  try {
    const savedStreak = localStorage.getItem(STREAK_DAYS_KEY);
    const lastDate = localStorage.getItem(STREAK_LAST_DATE_KEY);
    const today = new Date().toDateString();

    if (!savedStreak || !lastDate) {
      // Initialize with 6 days matching the mock
      localStorage.setItem(STREAK_DAYS_KEY, '6');
      localStorage.setItem(STREAK_LAST_DATE_KEY, today);
      return 6;
    }

    const streak = parseInt(savedStreak, 10) || 1;
    return streak;
  } catch {
    return 6;
  }
}

export function recordDailyStudy(): number {
  try {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(STREAK_LAST_DATE_KEY);
    const currentStreak = parseInt(localStorage.getItem(STREAK_DAYS_KEY) || '6', 10);

    if (lastDate === today) {
      return currentStreak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let nextStreak = currentStreak;
    if (lastDate === yesterday.toDateString()) {
      nextStreak += 1;
    } else if (lastDate) {
      // More than 1 day missed
      nextStreak = 1;
    }

    localStorage.setItem(STREAK_DAYS_KEY, nextStreak.toString());
    localStorage.setItem(STREAK_LAST_DATE_KEY, today);
    return nextStreak;
  } catch {
    return 6;
  }
}
