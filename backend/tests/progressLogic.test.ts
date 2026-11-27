import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevelInfo,
  computePercent,
  mergeRecentCourses,
  mergeStreak,
  mergeUniqueIds,
  normalizeUniqueIds,
} from '../src/utils/level.js';

test('calculateLevelInfo computes levels and remaining XP consistently with frontend', () => {
  assert.deepEqual(calculateLevelInfo(0), {
    level: 1,
    currentLevelXp: 0,
    nextLevelXp: 250,
    remainingXp: 250,
  });

  assert.deepEqual(calculateLevelInfo(265), {
    level: 2,
    currentLevelXp: 15,
    nextLevelXp: 250,
    remainingXp: 235,
  });
});

test('computePercent clamps cleanly between 0 and 100', () => {
  assert.equal(computePercent(0, 0), 0);
  assert.equal(computePercent(25, 100), 25);
  assert.equal(computePercent(120, 100), 100);
  assert.equal(computePercent(-5, 50), 0);
});

test('normalizeUniqueIds and mergeUniqueIds deduplicate and sort integer question IDs', () => {
  assert.deepEqual(normalizeUniqueIds([5, 1, 5, -2, 3.5, 2, '9']), [1, 2, 5]);
  assert.deepEqual(mergeUniqueIds([1, 4, 9], [2, 4, 10]), [1, 2, 4, 9, 10]);
});

test('mergeStreak preserves the newest valid date and highest count on same day', () => {
  assert.deepEqual(
    mergeStreak(
      { streakDays: 3, streakLastDate: 'Thu Nov 26 2026' },
      { streakDays: 5, streakLastDate: 'Fri Nov 27 2026' }
    ),
    { streakDays: 5, streakLastDate: 'Fri Nov 27 2026' }
  );

  assert.deepEqual(
    mergeStreak(
      { streakDays: 4, streakLastDate: 'Fri Nov 27 2026' },
      { streakDays: 2, streakLastDate: 'Fri Nov 27 2026' }
    ),
    { streakDays: 4, streakLastDate: 'Fri Nov 27 2026' }
  );
});

test('mergeRecentCourses merges without duplicates and caps at 12', () => {
  const merged = mergeRecentCourses(['mln111', 'pmg201c'], ['pmg201c', 'swd392', 'mln122']);
  assert.deepEqual(merged, ['mln111', 'pmg201c', 'swd392', 'mln122']);
});
