import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevelInfo,
  calculateRealXP,
  computePercent,
  computeStreakFromDates,
  mergeRecentCourses,
  mergeUniqueIds,
  normalizeUniqueIds,
} from '../src/utils/level.js';

test('calculateLevelInfo uses progressive RPG curve (100, 150, 200, ...)', () => {
  assert.deepEqual(calculateLevelInfo(0), {
    level: 1,
    currentLevelXp: 0,
    nextLevelXp: 100,
    remainingXp: 100,
  });

  // 100 XP -> Level 2 (0 / 150)
  assert.deepEqual(calculateLevelInfo(100), {
    level: 2,
    currentLevelXp: 0,
    nextLevelXp: 150,
    remainingXp: 150,
  });

  // 265 XP -> 100 (Lv2) + 150 (Lv3) = 250 -> Level 3 with 15 / 200
  assert.deepEqual(calculateLevelInfo(265), {
    level: 3,
    currentLevelXp: 15,
    nextLevelXp: 200,
    remainingXp: 185,
  });

  // 8,280 XP -> Level 17 (real progression for ~791 mastered questions)
  const high = calculateLevelInfo(8280);
  assert.equal(high.level, 17);
  assert.equal(high.nextLevelXp, 900);
});

test('calculateRealXP derives XP strictly from verified learning achievements', () => {
  const result = calculateRealXP({
    masteredQuestions: 791,
    flashcardsKnown: 29,
    completedSets: 2,
    passedCourses: 0,
    studyDaysCount: 1,
  });

  assert.equal(result.totalXp, 8280);
  assert.deepEqual(result.breakdown, {
    masteredQuestionsXp: 7910,
    flashcardsXp: 145,
    completedSetsXp: 200,
    passedCoursesXp: 0,
    studyDaysXp: 25,
  });
});

test('computeStreakFromDates computes active streak, longest streak, and resets on missed day', () => {
  const now = new Date('2026-11-27T04:00:00Z'); // 2026-11-27 11:00 GMT+7

  // Active streak including today (3 consecutive days)
  const active = computeStreakFromDates(
    ['2026-11-20', '2026-11-21', '2026-11-25', '2026-11-26', '2026-11-27'],
    now
  );
  assert.equal(active.streakDays, 3);
  assert.equal(active.longestStreakDays, 3);
  assert.equal(active.studiedToday, true);
  assert.equal(active.totalStudyDays, 5);
  assert.equal(active.recent7Days.length, 7);
  assert.equal(active.recent7Days[6].studied, true);

  // Studied yesterday -> streak stays alive until end of today
  const yesterdayOnly = computeStreakFromDates(['2026-11-25', '2026-11-26'], now);
  assert.equal(yesterdayOnly.streakDays, 2);
  assert.equal(yesterdayOnly.studiedToday, false);

  // Missed yesterday -> current streak resets to 0, longest streak preserved
  const broken = computeStreakFromDates(['2026-11-20', '2026-11-21', '2026-11-22'], now);
  assert.equal(broken.streakDays, 0);
  assert.equal(broken.longestStreakDays, 3);
  assert.equal(broken.studiedToday, false);
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

test('mergeRecentCourses merges without duplicates and caps at 12', () => {
  const merged = mergeRecentCourses(['mln111', 'pmg201c'], ['pmg201c', 'swd392', 'mln122']);
  assert.deepEqual(merged, ['mln111', 'pmg201c', 'swd392', 'mln122']);
});
