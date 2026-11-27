import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import type { FlashcardSet } from '../data/flashcardData';
import type {
  FullProfileResponse,
  ProgressSyncCourseCatalogInput,
  ProgressSyncFlashcardInput,
  ProgressSyncPayload,
  ProgressSyncSetInput,
} from './backendApi';
import {
  calculateCourseProgress,
  getFlashcardProgress,
  getQuizSetProgress,
  loadRecentCourseIds,
} from './courseStorage';
import { getStudyStreak, getUserXP, setUserXPExact, XP_RULES } from './studyStats';
import {
  PROGRESS_SYNCED_EVENT,
  STUDY_PROGRESS_UPDATED_EVENT,
  isHydratingFromCloud,
  notifyStudyProgressUpdated,
  setHydratingFromCloud,
  type StudyProgressUpdateDetail,
} from './studyProgressEvents';

export {
  PROGRESS_SYNCED_EVENT,
  STUDY_PROGRESS_UPDATED_EVENT,
  isHydratingFromCloud,
  notifyStudyProgressUpdated,
  type StudyProgressUpdateDetail,
};

function readStoredIdArray(storageKey: string): number[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const unique = new Set<number>();
    for (const item of parsed) {
      if (typeof item === 'number' && Number.isSafeInteger(item) && item >= 0) {
        unique.add(item);
      }
    }
    return Array.from(unique).sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export function collectLocalProgressSnapshot(
  courses: Course[],
  quizSets: QuizSetInfo[],
  flashcardSets: FlashcardSet[],
  options?: {
    includeZeroSetIds?: string[];
    includeZeroFlashcardIds?: string[];
    activityRecorded?: boolean;
  }
): ProgressSyncPayload {
  const courseMap = new Map<string, Course>();
  for (const course of courses) {
    courseMap.set(course.id, course);
  }

  const resetSetIdSet = new Set(options?.includeZeroSetIds || []);
  const resetFlashcardIdSet = new Set(options?.includeZeroFlashcardIds || []);
  const sets: ProgressSyncSetInput[] = [];
  const handledSetIds = new Set<string>();
  const touchedCourseIds = new Set<string>();

  let totalCatalogQuestions = 0;

  for (const set of quizSets) {
    const prog = getQuizSetProgress(set);
    totalCatalogQuestions += prog.total;

    const storageKey =
      set.kind === 'image'
        ? `keyt_image_quiz_mastered_${set.id}`
        : `keyt_quiz_mastered_${set.id}`;

    let masteredIds = readStoredIdArray(storageKey);
    if (masteredIds.length === 0 && (set.id === 'cchn_426' || set.id === 'ccnc_426')) {
      masteredIds = readStoredIdArray('keyt_quiz_mastered');
    }

    if (set.questionIds && set.questionIds.length > 0) {
      const validIds = new Set(set.questionIds);
      masteredIds = masteredIds.filter((id) => validIds.has(id));
    }

    if (masteredIds.length > 0 || resetSetIdSet.has(set.id)) {
      const course = set.courseId ? courseMap.get(set.courseId) : undefined;
      if (set.courseId) touchedCourseIds.add(set.courseId);
      handledSetIds.add(set.id);
      sets.push({
        setId: set.id,
        courseId: set.courseId || '',
        courseCode: course?.code || set.courseId?.toUpperCase() || '',
        courseName: course?.name || '',
        setTitle: set.title,
        kind: set.kind === 'image' ? 'image' : 'text',
        isKnowledgeGroup: false,
        totalQuestions: prog.total,
        masteredIds,
      });
    }
  }

  // Also capture knowledge-group sets (e.g. mln111_full_group_g1) saved in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('keyt_quiz_mastered_')) continue;
      const setId = key.slice('keyt_quiz_mastered_'.length);
      if (!setId || handledSetIds.has(setId)) continue;

      const masteredIds = readStoredIdArray(key);
      if (masteredIds.length === 0 && !resetSetIdSet.has(setId)) continue;

      const baseSetId = setId.includes('_group_') ? setId.split('_group_')[0] : setId;
      const baseSet = quizSets.find((s) => s.id === baseSetId);
      const course = baseSet?.courseId ? courseMap.get(baseSet.courseId) : undefined;

      sets.push({
        setId,
        courseId: baseSet?.courseId || '',
        courseCode: course?.code || baseSet?.courseId?.toUpperCase() || '',
        courseName: course?.name || '',
        setTitle: baseSet ? `${baseSet.title} (Nhóm kiến thức)` : setId,
        kind: 'text',
        isKnowledgeGroup: setId.includes('_group_'),
        totalQuestions: masteredIds.length,
        masteredIds,
      });
      handledSetIds.add(setId);
    }
  } catch {
    // ignore storage iteration failures
  }

  // Ensure explicitly reset knowledge-group sets are still sent with masteredIds: []
  for (const resetId of resetSetIdSet) {
    if (handledSetIds.has(resetId)) continue;
    const baseSetId = resetId.includes('_group_') ? resetId.split('_group_')[0] : resetId;
    const baseSet = quizSets.find((s) => s.id === baseSetId);
    const course = baseSet?.courseId ? courseMap.get(baseSet.courseId) : undefined;
    sets.push({
      setId: resetId,
      courseId: baseSet?.courseId || '',
      courseCode: course?.code || '',
      courseName: course?.name || '',
      setTitle: baseSet?.title || resetId,
      kind: baseSet?.kind === 'image' ? 'image' : 'text',
      isKnowledgeGroup: resetId.includes('_group_'),
      totalQuestions: 0,
      masteredIds: [],
    });
  }

  const courseCatalog: ProgressSyncCourseCatalogInput[] = [];
  for (const courseId of touchedCourseIds) {
    const course = courseMap.get(courseId);
    const prog = calculateCourseProgress(courseId, quizSets);
    courseCatalog.push({
      courseId,
      courseCode: course?.code || courseId.toUpperCase(),
      courseName: course?.name || course?.code || courseId,
      totalSets: prog.totalSets,
      totalQuestions: prog.totalQuestions,
    });
  }

  const flashcards: ProgressSyncFlashcardInput[] = [];
  for (const fcSet of flashcardSets) {
    const knownIds = readStoredIdArray(`keyt_flashcard_known_${fcSet.id}`);
    const fcProg = getFlashcardProgress(fcSet);
    if (knownIds.length > 0 || resetFlashcardIdSet.has(fcSet.id)) {
      flashcards.push({
        flashcardSetId: fcSet.id,
        title: fcSet.title,
        totalCards: fcProg.total,
        knownIds,
      });
    }
  }

  let streakLastDate = '';
  try {
    streakLastDate = localStorage.getItem('keyt_study_streak_last_date') || '';
  } catch {
    streakLastDate = '';
  }

  return {
    xp: getUserXP(),
    streakDays: getStudyStreak(),
    streakLastDate,
    ...(options?.activityRecorded ? { activityRecorded: true } : {}),
    recentCourseIds: loadRecentCourseIds(),
    totalCatalogQuestions,
    sets,
    courseCatalog,
    flashcards,
  };
}

/**
 * Computes real XP strictly from local verified progress (matches backend formula)
 */
export function computeLocalRealXP(
  courses: Course[],
  quizSets: QuizSetInfo[],
  flashcardSets: FlashcardSet[]
): number {
  const snap = collectLocalProgressSnapshot(courses, quizSets, flashcardSets);
  const mainSets = snap.sets.filter((s) => !s.isKnowledgeGroup && s.masteredIds.length > 0);
  const masteredQuestions = mainSets.reduce((sum, s) => sum + s.masteredIds.length, 0);
  const completedSets = mainSets.filter(
    (s) => s.totalQuestions > 0 && s.masteredIds.length >= s.totalQuestions
  ).length;
  const passedCourses = snap.courseCatalog.filter((c) => {
    if (c.totalQuestions <= 0) return false;
    const prog = calculateCourseProgress(c.courseId, quizSets);
    return prog.totalQuestions > 0 && prog.percent >= 100;
  }).length;
  const flashcardsKnown = snap.flashcards.reduce((sum, f) => sum + f.knownIds.length, 0);
  const studyDays = Math.max(snap.streakDays, masteredQuestions > 0 || flashcardsKnown > 0 ? 1 : 0);

  return (
    masteredQuestions * XP_RULES.perMasteredQuestion +
    flashcardsKnown * XP_RULES.perKnownFlashcard +
    completedSets * XP_RULES.perCompletedSet +
    passedCourses * XP_RULES.perPassedCourse +
    studyDays * XP_RULES.perStudyDay
  );
}

const REAL_XP_RECONCILED_KEY = 'keyt_real_xp_reconciled_v3';

export function reconcileGuestLocalXP(
  courses: Course[],
  quizSets: QuizSetInfo[],
  flashcardSets: FlashcardSet[]
): void {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(REAL_XP_RECONCILED_KEY) === 'true') return;
    const realXp = computeLocalRealXP(courses, quizSets, flashcardSets);
    setHydratingFromCloud(true);
    try {
      setUserXPExact(realXp);
      localStorage.setItem(REAL_XP_RECONCILED_KEY, 'true');
    } finally {
      setHydratingFromCloud(false);
    }
  } catch {
    // ignore
  }
}

export function hydrateLocalStorageFromProfile(profile: FullProfileResponse): void {
  if (typeof window === 'undefined') return;

  setHydratingFromCloud(true);
  try {
    for (const setItem of profile.sets) {
      const storageKey =
        setItem.kind === 'image'
          ? `keyt_image_quiz_mastered_${setItem.setId}`
          : `keyt_quiz_mastered_${setItem.setId}`;
      localStorage.setItem(storageKey, JSON.stringify(setItem.masteredIds));
    }

    for (const fcItem of profile.flashcards) {
      localStorage.setItem(
        `keyt_flashcard_known_${fcItem.flashcardSetId}`,
        JSON.stringify(fcItem.knownIds)
      );
    }

    if (typeof profile.summary.xp === 'number' && profile.summary.xp >= 0) {
      localStorage.setItem('keyt_user_total_xp', String(profile.summary.xp));
      window.dispatchEvent(new CustomEvent('keyt-xp-changed', { detail: profile.summary.xp }));
    }

    if (typeof profile.summary.streakDays === 'number' && profile.summary.streakDays >= 0) {
      localStorage.setItem('keyt_study_streak_days', String(profile.summary.streakDays));
      if (profile.summary.streakLastDate) {
        localStorage.setItem('keyt_study_streak_last_date', profile.summary.streakLastDate);
      }
      window.dispatchEvent(
        new CustomEvent('keyt-streak-changed', { detail: profile.summary.streakDays })
      );
    }

    if (Array.isArray(profile.recentCourseIds) && profile.recentCourseIds.length > 0) {
      localStorage.setItem('keyt_recent_courses', JSON.stringify(profile.recentCourseIds));
    }

    window.dispatchEvent(new CustomEvent(PROGRESS_SYNCED_EVENT, { detail: profile }));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Lỗi cập nhật tiến độ từ đám mây vào trình duyệt:', error);
  } finally {
    setHydratingFromCloud(false);
  }
}
