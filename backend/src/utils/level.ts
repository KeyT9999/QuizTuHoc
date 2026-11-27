export const XP_RULES = {
  perMasteredQuestion: 10,
  perKnownFlashcard: 5,
  perCompletedSet: 100,
  perPassedCourse: 300,
  perStudyDay: 25,
} as const;

export interface XpBreakdown {
  masteredQuestionsXp: number;
  flashcardsXp: number;
  completedSetsXp: number;
  passedCoursesXp: number;
  studyDaysXp: number;
}

export interface RealXpResult {
  totalXp: number;
  breakdown: XpBreakdown;
}

/**
 * Progressive RPG level curve:
 * Lv.1 -> Lv.2: 100 XP
 * Lv.2 -> Lv.3: 150 XP
 * Lv.L -> Lv.(L+1): 100 + (L - 1) * 50 XP
 */
export function xpRequiredForLevelStep(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return 100 + (safeLevel - 1) * 50;
}

export function calculateLevelInfo(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  remainingXp: number;
} {
  let remaining = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
  let level = 1;
  let stepCost = xpRequiredForLevelStep(level);

  while (remaining >= stepCost) {
    remaining -= stepCost;
    level += 1;
    stepCost = xpRequiredForLevelStep(level);
  }

  return {
    level,
    currentLevelXp: remaining,
    nextLevelXp: stepCost,
    remainingXp: stepCost - remaining,
  };
}

export function calculateRealXP(input: {
  masteredQuestions: number;
  flashcardsKnown: number;
  completedSets: number;
  passedCourses: number;
  studyDaysCount: number;
}): RealXpResult {
  const masteredQuestions = Math.max(0, Math.floor(input.masteredQuestions || 0));
  const flashcardsKnown = Math.max(0, Math.floor(input.flashcardsKnown || 0));
  const completedSets = Math.max(0, Math.floor(input.completedSets || 0));
  const passedCourses = Math.max(0, Math.floor(input.passedCourses || 0));
  const studyDaysCount = Math.max(0, Math.floor(input.studyDaysCount || 0));

  const breakdown: XpBreakdown = {
    masteredQuestionsXp: masteredQuestions * XP_RULES.perMasteredQuestion,
    flashcardsXp: flashcardsKnown * XP_RULES.perKnownFlashcard,
    completedSetsXp: completedSets * XP_RULES.perCompletedSet,
    passedCoursesXp: passedCourses * XP_RULES.perPassedCourse,
    studyDaysXp: studyDaysCount * XP_RULES.perStudyDay,
  };

  const totalXp =
    breakdown.masteredQuestionsXp +
    breakdown.flashcardsXp +
    breakdown.completedSetsXp +
    breakdown.passedCoursesXp +
    breakdown.studyDaysXp;

  return { totalXp, breakdown };
}

export function computePercent(done: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  const clampedDone = Math.max(0, Math.min(done, total));
  return Math.round((clampedDone / total) * 100);
}

export function normalizeUniqueIds(ids: unknown): number[] {
  if (!Array.isArray(ids)) return [];
  const unique = new Set<number>();
  for (const item of ids) {
    if (typeof item === 'number' && Number.isSafeInteger(item) && item >= 0) {
      unique.add(item);
    }
  }
  return Array.from(unique).sort((a, b) => a - b);
}

export function mergeUniqueIds(a: number[], b: number[]): number[] {
  const merged = new Set<number>();
  for (const id of a) {
    if (Number.isSafeInteger(id) && id >= 0) merged.add(id);
  }
  for (const id of b) {
    if (Number.isSafeInteger(id) && id >= 0) merged.add(id);
  }
  return Array.from(merged).sort((x, y) => x - y);
}

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Returns YYYY-MM-DD in Vietnam timezone (UTC+7 / Asia/Ho_Chi_Minh)
 */
export function getVietnamDateKey(date: Date = new Date()): string {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const year = vnTime.getUTCFullYear();
  const month = String(vnTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const year = utc.getUTCFullYear();
  const month = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utc.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDateKey(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (DATE_KEY_REGEX.test(trimmed)) return trimmed;
  const parsed = Date.parse(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return getVietnamDateKey(new Date(parsed));
}

export function normalizeStudyDates(dates: unknown, maxDateKey?: string): string[] {
  if (!Array.isArray(dates)) return [];
  const unique = new Set<string>();
  for (const item of dates) {
    const key = normalizeDateKey(typeof item === 'string' ? item : '');
    if (!key) continue;
    if (maxDateKey && key > maxDateKey) continue;
    unique.add(key);
  }
  return Array.from(unique).sort();
}

export interface StreakStats {
  streakDays: number;
  longestStreakDays: number;
  streakLastDate: string;
  studiedToday: boolean;
  totalStudyDays: number;
  recent7Days: Array<{ date: string; studied: boolean }>;
}

/**
 * Computes real unbroken study streak strictly from recorded YYYY-MM-DD study dates
 */
export function computeStreakFromDates(
  rawDates: string[],
  now: Date = new Date()
): StreakStats {
  const today = getVietnamDateKey(now);
  const yesterday = shiftDateKey(today, -1);
  const sortedDates = normalizeStudyDates(rawDates, today);
  const dateSet = new Set(sortedDates);

  const studiedToday = dateSet.has(today);
  const streakLastDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : '';

  // Compute current active streak (must include today OR yesterday)
  let streakDays = 0;
  let cursor: string | null = studiedToday ? today : dateSet.has(yesterday) ? yesterday : null;
  while (cursor && dateSet.has(cursor)) {
    streakDays += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  // Compute longest historical unbroken streak
  let longestStreakDays = 0;
  let run = 0;
  let prevKey: string | null = null;
  for (const key of sortedDates) {
    if (prevKey && shiftDateKey(prevKey, 1) === key) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longestStreakDays) longestStreakDays = run;
    prevKey = key;
  }

  // Last 7 days calendar (6 days ago -> today)
  const recent7Days: Array<{ date: string; studied: boolean }> = [];
  for (let offset = -6; offset <= 0; offset += 1) {
    const key = shiftDateKey(today, offset);
    recent7Days.push({ date: key, studied: dateSet.has(key) });
  }

  return {
    streakDays,
    longestStreakDays,
    streakLastDate,
    studiedToday,
    totalStudyDays: sortedDates.length,
    recent7Days,
  };
}

export function mergeRecentCourses(primary: string[], secondary: string[], limit = 12): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const id of [...primary, ...secondary]) {
    const clean = typeof id === 'string' ? id.trim() : '';
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      result.push(clean);
      if (result.length >= limit) break;
    }
  }
  return result;
}
