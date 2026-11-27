export const XP_PER_LEVEL = 250;

export function calculateLevelInfo(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  remainingXp: number;
} {
  const safeXp = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = safeXp % XP_PER_LEVEL;
  const remainingXp = XP_PER_LEVEL - currentLevelXp;

  return {
    level,
    currentLevelXp,
    nextLevelXp: XP_PER_LEVEL,
    remainingXp,
  };
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

export function mergeStreak(
  cloud: { streakDays: number; streakLastDate: string },
  local: { streakDays: number; streakLastDate: string }
): { streakDays: number; streakLastDate: string } {
  const cloudTime = cloud.streakLastDate ? Date.parse(cloud.streakLastDate) : NaN;
  const localTime = local.streakLastDate ? Date.parse(local.streakLastDate) : NaN;
  const cloudValid = Number.isFinite(cloudTime);
  const localValid = Number.isFinite(localTime);

  if (cloudValid && localValid) {
    if (cloud.streakLastDate === local.streakLastDate) {
      return {
        streakDays: Math.max(cloud.streakDays, local.streakDays),
        streakLastDate: cloud.streakLastDate,
      };
    }
    if (localTime > cloudTime) {
      return {
        streakDays: Math.max(local.streakDays, cloud.streakDays > 0 ? local.streakDays : 0),
        streakLastDate: local.streakLastDate,
      };
    }
    return {
      streakDays: cloud.streakDays,
      streakLastDate: cloud.streakLastDate,
    };
  }

  if (localValid) {
    return { streakDays: Math.max(0, local.streakDays), streakLastDate: local.streakLastDate };
  }
  if (cloudValid) {
    return { streakDays: Math.max(0, cloud.streakDays), streakLastDate: cloud.streakLastDate };
  }

  return {
    streakDays: Math.max(0, cloud.streakDays, local.streakDays),
    streakLastDate: cloud.streakLastDate || local.streakLastDate || '',
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
