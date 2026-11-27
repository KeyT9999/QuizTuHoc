import { notifyStudyProgressUpdated } from './studyProgressEvents';

export type AppTheme = 'doraemon-gadget' | 'billionaire-vault' | 'shin-kasukabe' | 'spidey-night' | 'cozy-night' | 'fantasy-academy' | 'hon-viet' | 'lotus-zen-sanctuary' | 'default';
export type ShinSceneId = 'room' | 'meadow' | 'hills' | 'rain';
export type MoneyVaultFinish = 'obsidian' | 'emerald' | 'gold';
export type DoraemonSceneId = 'starry' | 'sky' | 'room';

const THEME_STORAGE_KEY = 'keyt_selected_ui_theme';
const MOUSE_EFFECTS_KEY = 'keyt_mouse_effects_enabled';
const HOVER_TRANSLATE_KEY = 'keyt_hover_translate_enabled';
const SHIN_SCENE_KEY = 'keyt_shin_scene_id';
const MONEY_FINISH_KEY = 'keyt_money_vault_finish';
const MONEY_NETWORTH_KEY = 'keyt_money_usd_networth';
const DORAEMON_SCENE_KEY = 'keyt_doraemon_scene_id';
const DORAEMON_DORAYAKI_KEY = 'keyt_doraemon_dorayaki_count';
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
      saved === 'doraemon-gadget' ||
      saved === 'billionaire-vault' ||
      saved === 'shin-kasukabe' ||
      saved === 'spidey-night' ||
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

// Mouse Sparkle & Interactive Cursor Effects
export function getMouseEffectsEnabled(): boolean {
  try {
    const saved = localStorage.getItem(MOUSE_EFFECTS_KEY);
    if (saved === 'false') return false;
    if (saved === 'true') return true;
  } catch {
    // ignore
  }
  return true;
}

export function setMouseEffectsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(MOUSE_EFFECTS_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('keyt-mouse-effects-changed', { detail: enabled }));
  } catch {
    // ignore
  }
}

// Hover Auto-Translate (Default: OFF; users opt-in via settings/toggle)
export function getHoverTranslateEnabled(): boolean {
  try {
    return localStorage.getItem(HOVER_TRANSLATE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setHoverTranslateEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(HOVER_TRANSLATE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('keyt-hover-translate-changed', { detail: enabled }));
  } catch {
    // ignore
  }
}

// Shin Kasukabe Active Scene ('room' | 'meadow' | 'hills' | 'rain')
export function getShinScene(): ShinSceneId {
  try {
    const saved = localStorage.getItem(SHIN_SCENE_KEY);
    if (saved === 'room' || saved === 'meadow' || saved === 'hills' || saved === 'rain') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'room';
}

export function setShinScene(scene: ShinSceneId): void {
  try {
    localStorage.setItem(SHIN_SCENE_KEY, scene);
    window.dispatchEvent(new CustomEvent('keyt-shin-scene-changed', { detail: scene }));
  } catch {
    // ignore
  }
}

// Billionaire Vault Active Material Finish ('obsidian' | 'emerald' | 'gold')
export function getMoneyVaultFinish(): MoneyVaultFinish {
  try {
    const saved = localStorage.getItem(MONEY_FINISH_KEY);
    if (saved === 'obsidian' || saved === 'emerald' || saved === 'gold') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'obsidian';
}

export function setMoneyVaultFinish(finish: MoneyVaultFinish): void {
  try {
    localStorage.setItem(MONEY_FINISH_KEY, finish);
    window.dispatchEvent(new CustomEvent('keyt-money-finish-changed', { detail: finish }));
  } catch {
    // ignore
  }
}

// Billionaire Vault Persistent USD Net Worth (Starts at $100,000 Private Seed Capital)
export function getUserNetWorth(): number {
  try {
    const raw = localStorage.getItem(MONEY_NETWORTH_KEY);
    if (raw) {
      const val = parseInt(raw, 10);
      if (!isNaN(val) && val >= 0) return val;
    }
  } catch {
    // ignore
  }
  return 100000;
}

export function addUserNetWorth(delta: number): number {
  const current = getUserNetWorth();
  const next = Math.max(10000, current + delta);
  try {
    localStorage.setItem(MONEY_NETWORTH_KEY, next.toString());
    window.dispatchEvent(new CustomEvent('keyt-networth-changed', { detail: next }));
    window.dispatchEvent(new Event('storage'));
  } catch {
    // ignore
  }
  return next;
}

// Doraemon Active World Scene ('starry' | 'sky' | 'room')
export function getDoraemonScene(): DoraemonSceneId {
  try {
    const saved = localStorage.getItem(DORAEMON_SCENE_KEY);
    if (saved === 'starry' || saved === 'sky' || saved === 'room') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'starry';
}

export function setDoraemonScene(scene: DoraemonSceneId): void {
  try {
    localStorage.setItem(DORAEMON_SCENE_KEY, scene);
    window.dispatchEvent(new CustomEvent('keyt-doraemon-scene-changed', { detail: scene }));
  } catch {
    // ignore
  }
}

// Doraemon Persistent Dorayaki Count (Bánh Rán Tích Lũy)
export function getUserDorayaki(): number {
  try {
    const raw = localStorage.getItem(DORAEMON_DORAYAKI_KEY);
    if (raw) {
      const val = parseInt(raw, 10);
      if (!isNaN(val) && val >= 0) return val;
    }
  } catch {
    // ignore
  }
  return 0;
}

export function addUserDorayaki(delta: number): number {
  const next = Math.max(0, getUserDorayaki() + delta);
  try {
    localStorage.setItem(DORAEMON_DORAYAKI_KEY, next.toString());
    window.dispatchEvent(new CustomEvent('keyt-dorayaki-changed', { detail: next }));
    window.dispatchEvent(new Event('storage'));
  } catch {
    // ignore
  }
  return next;
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

export const XP_RULES = {
  perMasteredQuestion: 10,
  perKnownFlashcard: 5,
  perCompletedSet: 100,
  perPassedCourse: 300,
  perStudyDay: 25,
} as const;

export function getVietnamDateKey(date: Date = new Date()): string {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const year = vnTime.getUTCFullYear();
  const month = String(vnTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const year = utc.getUTCFullYear();
  const month = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utc.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDateKey(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = Date.parse(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return getVietnamDateKey(new Date(parsed));
}

// XP Gamification (synced with server-authoritative real XP)
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
  return 0;
}

export function setUserXPExact(xp: number): number {
  const next = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
  try {
    localStorage.setItem(XP_STORAGE_KEY, next.toString());
    window.dispatchEvent(new CustomEvent('keyt-xp-changed', { detail: next }));
    window.dispatchEvent(new Event('storage'));
  } catch {
    // ignore
  }
  return next;
}

export function addStudyXP(amount: number): number {
  const current = getUserXP();
  const next = current + Math.max(0, Math.floor(amount));
  try {
    localStorage.setItem(XP_STORAGE_KEY, next.toString());
    window.dispatchEvent(new CustomEvent('keyt-xp-changed', { detail: next }));
    window.dispatchEvent(new CustomEvent('keyt-xp-earned', { detail: next }));
    window.dispatchEvent(new Event('storage'));
    notifyStudyProgressUpdated({ activityRecorded: true });
  } catch {
    // ignore
  }
  return next;
}

/**
 * Progressive RPG level curve (matches backend exactly):
 * Lv.1->2: 100 XP, Lv.2->3: 150 XP, Lv.L->(L+1): 100 + (L-1)*50 XP
 */
export function calculateLevel(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  remainingXp: number;
} {
  let remaining = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
  let level = 1;
  let stepCost = 100 + (level - 1) * 50;

  while (remaining >= stepCost) {
    remaining -= stepCost;
    level += 1;
    stepCost = 100 + (level - 1) * 50;
  }

  return {
    level,
    currentLevelXp: remaining,
    nextLevelXp: stepCost,
    remainingXp: stepCost - remaining,
  };
}

// Study Streak Management (Vietnam Timezone YYYY-MM-DD, synced with MongoDB studyDates)
export function getStudyStreak(): number {
  try {
    const savedStreakRaw = localStorage.getItem(STREAK_DAYS_KEY);
    const lastDateKey = normalizeDateKey(localStorage.getItem(STREAK_LAST_DATE_KEY));

    if (!savedStreakRaw || !lastDateKey) {
      return 0;
    }

    const today = getVietnamDateKey();
    const yesterday = shiftDateKey(today, -1);
    const streak = parseInt(savedStreakRaw, 10) || 0;

    if (lastDateKey === today || lastDateKey === yesterday) {
      return streak;
    }

    localStorage.setItem(STREAK_DAYS_KEY, '0');
    return 0;
  } catch {
    return 0;
  }
}

export function recordDailyStudy(): number {
  try {
    const today = getVietnamDateKey();
    const yesterday = shiftDateKey(today, -1);
    const lastDateKey = normalizeDateKey(localStorage.getItem(STREAK_LAST_DATE_KEY));
    const savedStreak = parseInt(localStorage.getItem(STREAK_DAYS_KEY) || '0', 10);

    if (lastDateKey === today) {
      const activeStreak = Math.max(1, savedStreak);
      localStorage.setItem(STREAK_DAYS_KEY, activeStreak.toString());
      localStorage.setItem(STREAK_LAST_DATE_KEY, today);
      notifyStudyProgressUpdated({ activityRecorded: true });
      return activeStreak;
    }

    const nextStreak = lastDateKey === yesterday ? Math.max(1, savedStreak) + 1 : 1;

    localStorage.setItem(STREAK_DAYS_KEY, nextStreak.toString());
    localStorage.setItem(STREAK_LAST_DATE_KEY, today);
    window.dispatchEvent(new CustomEvent('keyt-streak-changed', { detail: nextStreak }));
    window.dispatchEvent(new Event('storage'));
    notifyStudyProgressUpdated({ activityRecorded: true });
    return nextStreak;
  } catch {
    return 0;
  }
}

