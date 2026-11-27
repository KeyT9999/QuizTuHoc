import { z } from 'zod';
import type { IUser } from '../models/User.js';
import { SetProgress, type ISetProgress } from '../models/SetProgress.js';
import { CourseSummary } from '../models/CourseSummary.js';
import { FlashcardProgress } from '../models/FlashcardProgress.js';
import {
  calculateLevelInfo,
  computePercent,
  mergeRecentCourses,
  mergeStreak,
  mergeUniqueIds,
  normalizeUniqueIds,
} from '../utils/level.js';

export const setProgressInputSchema = z.object({
  setId: z.string().trim().min(1).max(160),
  courseId: z.string().trim().max(80).default(''),
  courseCode: z.string().trim().max(40).default(''),
  courseName: z.string().trim().max(180).default(''),
  setTitle: z.string().trim().max(240).default(''),
  kind: z.enum(['text', 'image']).default('text'),
  isKnowledgeGroup: z.boolean().optional(),
  totalQuestions: z.number().int().min(0).max(50000).default(0),
  masteredIds: z.array(z.number().int().min(0).max(1_000_000)).max(20000).default([]),
});

export const courseCatalogInputSchema = z.object({
  courseId: z.string().trim().min(1).max(80),
  courseCode: z.string().trim().max(40).default(''),
  courseName: z.string().trim().max(180).default(''),
  totalSets: z.number().int().min(0).max(5000).default(0),
  totalQuestions: z.number().int().min(0).max(200000).default(0),
});

export const flashcardProgressInputSchema = z.object({
  flashcardSetId: z.string().trim().min(1).max(120),
  title: z.string().trim().max(200).default(''),
  totalCards: z.number().int().min(0).max(20000).default(0),
  knownIds: z.array(z.number().int().min(0).max(1_000_000)).max(20000).default([]),
});

export const progressSyncPayloadSchema = z.object({
  xp: z.number().int().min(0).max(100_000_000).optional(),
  streakDays: z.number().int().min(0).max(100_000).optional(),
  streakLastDate: z.string().trim().max(64).optional(),
  recentCourseIds: z.array(z.string().trim().min(1).max(80)).max(24).optional(),
  totalCatalogQuestions: z.number().int().min(0).max(5_000_000).optional(),
  sets: z.array(setProgressInputSchema).max(2000).default([]),
  courseCatalog: z.array(courseCatalogInputSchema).max(500).default([]),
  flashcards: z.array(flashcardProgressInputSchema).max(200).default([]),
});

export type ProgressSyncPayload = z.infer<typeof progressSyncPayloadSchema>;
export type CourseCatalogInput = z.infer<typeof courseCatalogInputSchema>;

export function serializeUserBasics(user: IUser) {
  const levelInfo = calculateLevelInfo(user.xp);
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    googleName: user.googleName,
    givenName: user.givenName,
    avatar: user.avatar,
    bio: user.bio,
    studentId: user.studentId,
    targetSemester: user.targetSemester,
    xp: user.xp,
    level: levelInfo.level,
    currentLevelXp: levelInfo.currentLevelXp,
    nextLevelXp: levelInfo.nextLevelXp,
    remainingXp: levelInfo.remainingXp,
    streakDays: user.streakDays,
    streakLastDate: user.streakLastDate,
    lastLoginAt: user.lastLoginAt,
    lastSyncedAt: user.lastSyncedAt,
    createdAt: user.createdAt,
  };
}

async function rebuildCourseSummaries(
  userId: IUser['_id'],
  catalogList: CourseCatalogInput[]
): Promise<void> {
  const catalogMap = new Map<string, CourseCatalogInput>();
  for (const item of catalogList) {
    catalogMap.set(item.courseId, item);
  }

  const [allSets, existingSummaries] = await Promise.all([
    SetProgress.find({ userId, isKnowledgeGroup: { $ne: true } }).lean(),
    CourseSummary.find({ userId }).lean(),
  ]);

  const existingSummaryMap = new Map(existingSummaries.map((s) => [s.courseId, s]));
  const groupedByCourse = new Map<string, typeof allSets>();

  for (const setDoc of allSets) {
    if (!setDoc.courseId) continue;
    const list = groupedByCourse.get(setDoc.courseId) || [];
    list.push(setDoc);
    groupedByCourse.set(setDoc.courseId, list);
  }

  const bulkOps: Parameters<typeof CourseSummary.bulkWrite>[0] = [];
  const activeCourseIds = new Set<string>();

  for (const [courseId, courseSets] of groupedByCourse.entries()) {
    const masteredQuestions = courseSets.reduce((sum, s) => sum + s.masteredCount, 0);
    if (masteredQuestions <= 0) continue;

    activeCourseIds.add(courseId);
    const catalog = catalogMap.get(courseId);
    const prev = existingSummaryMap.get(courseId);

    const sumSetTotals = courseSets.reduce((sum, s) => sum + s.totalQuestions, 0);
    const totalQuestions = Math.max(
      catalog?.totalQuestions || 0,
      prev?.totalQuestions || 0,
      sumSetTotals,
      masteredQuestions
    );
    const totalSets = Math.max(catalog?.totalSets || 0, prev?.totalSets || 0, courseSets.length);
    const startedSets = courseSets.filter((s) => s.masteredCount > 0).length;
    const completedSets = courseSets.filter((s) => s.isCompleted).length;
    const percent = computePercent(masteredQuestions, totalQuestions);
    const isPassed = totalQuestions > 0 && percent >= 100;

    let lastStudiedAt = new Date(0);
    let fallbackCode = '';
    let fallbackName = '';
    for (const s of courseSets) {
      if (s.lastStudiedAt && new Date(s.lastStudiedAt) > lastStudiedAt) {
        lastStudiedAt = new Date(s.lastStudiedAt);
      }
      if (!fallbackCode && s.courseCode) fallbackCode = s.courseCode;
      if (!fallbackName && s.courseName) fallbackName = s.courseName;
    }

    const courseCode = catalog?.courseCode || fallbackCode || prev?.courseCode || courseId.toUpperCase();
    const courseName = catalog?.courseName || fallbackName || prev?.courseName || courseCode;

    bulkOps.push({
      updateOne: {
        filter: { userId, courseId },
        update: {
          $set: {
            courseCode,
            courseName,
            totalSets,
            startedSets,
            completedSets,
            totalQuestions,
            masteredQuestions,
            percent,
            isPassed,
            lastStudiedAt: lastStudiedAt.getTime() > 0 ? lastStudiedAt : new Date(),
          },
        },
        upsert: true,
      },
    });
  }

  // Delete obsolete CourseSummaries whose progress dropped to 0
  const staleCourseIds = existingSummaries
    .map((s) => s.courseId)
    .filter((id) => !activeCourseIds.has(id));

  if (staleCourseIds.length > 0) {
    bulkOps.push({
      deleteMany: {
        filter: { userId, courseId: { $in: staleCourseIds } },
      },
    });
  }

  if (bulkOps.length > 0) {
    await CourseSummary.bulkWrite(bulkOps, { ordered: false });
  }
}

export async function mergeUserProgress(user: IUser, payload: ProgressSyncPayload) {
  const now = new Date();

  const [existingSets, existingFlashcards] = await Promise.all([
    SetProgress.find({ userId: user._id }).lean(),
    FlashcardProgress.find({ userId: user._id }).lean(),
  ]);

  const existingSetMap = new Map<string, Pick<ISetProgress, 'masteredIds' | 'totalQuestions' | 'courseId' | 'courseCode' | 'courseName' | 'setTitle' | 'kind' | 'isKnowledgeGroup'>>(
    existingSets.map((item) => [item.setId, item])
  );
  const existingFcMap = new Map(existingFlashcards.map((item) => [item.flashcardSetId, item]));

  const setOps: Parameters<typeof SetProgress.bulkWrite>[0] = [];
  for (const incoming of payload.sets) {
    const prev = existingSetMap.get(incoming.setId);
    const mergedIds = mergeUniqueIds(prev?.masteredIds || [], normalizeUniqueIds(incoming.masteredIds));
    if (mergedIds.length === 0) continue;

    const totalQuestions = Math.max(incoming.totalQuestions, prev?.totalQuestions || 0, mergedIds.length);
    const masteredCount = mergedIds.length;
    const percent = computePercent(masteredCount, totalQuestions);
    const isKnowledgeGroup =
      typeof incoming.isKnowledgeGroup === 'boolean'
        ? incoming.isKnowledgeGroup
        : incoming.setId.includes('_group_');

    setOps.push({
      updateOne: {
        filter: { userId: user._id, setId: incoming.setId },
        update: {
          $set: {
            courseId: incoming.courseId || prev?.courseId || '',
            courseCode: incoming.courseCode || prev?.courseCode || '',
            courseName: incoming.courseName || prev?.courseName || '',
            setTitle: incoming.setTitle || prev?.setTitle || incoming.setId,
            kind: incoming.kind || prev?.kind || 'text',
            isKnowledgeGroup,
            totalQuestions,
            masteredIds: mergedIds,
            masteredCount,
            percent,
            isCompleted: totalQuestions > 0 && percent >= 100,
            lastStudiedAt: now,
          },
        },
        upsert: true,
      },
    });
  }

  const fcOps: Parameters<typeof FlashcardProgress.bulkWrite>[0] = [];
  for (const incoming of payload.flashcards) {
    const prev = existingFcMap.get(incoming.flashcardSetId);
    const mergedIds = mergeUniqueIds(prev?.knownIds || [], normalizeUniqueIds(incoming.knownIds));
    if (mergedIds.length === 0) continue;

    const totalCards = Math.max(incoming.totalCards, prev?.totalCards || 0, mergedIds.length);
    const knownCount = mergedIds.length;
    const percent = computePercent(knownCount, totalCards);

    fcOps.push({
      updateOne: {
        filter: { userId: user._id, flashcardSetId: incoming.flashcardSetId },
        update: {
          $set: {
            title: incoming.title || prev?.title || incoming.flashcardSetId,
            totalCards,
            knownIds: mergedIds,
            knownCount,
            percent,
            lastStudiedAt: now,
          },
        },
        upsert: true,
      },
    });
  }

  await Promise.all([
    setOps.length > 0 ? SetProgress.bulkWrite(setOps, { ordered: false }) : Promise.resolve(),
    fcOps.length > 0 ? FlashcardProgress.bulkWrite(fcOps, { ordered: false }) : Promise.resolve(),
  ]);

  const nextXp = Math.max(user.xp || 0, payload.xp || 0);
  const nextStreak = mergeStreak(
    { streakDays: user.streakDays || 0, streakLastDate: user.streakLastDate || '' },
    { streakDays: payload.streakDays || 0, streakLastDate: payload.streakLastDate || '' }
  );

  user.xp = nextXp;
  user.level = calculateLevelInfo(nextXp).level;
  user.streakDays = nextStreak.streakDays;
  user.streakLastDate = nextStreak.streakLastDate;
  user.recentCourseIds = mergeRecentCourses(payload.recentCourseIds || [], user.recentCourseIds || []);
  if (typeof payload.totalCatalogQuestions === 'number' && payload.totalCatalogQuestions > 0) {
    user.totalCatalogQuestions = Math.max(user.totalCatalogQuestions || 0, payload.totalCatalogQuestions);
  }
  user.lastSyncedAt = now;

  await Promise.all([user.save(), rebuildCourseSummaries(user._id, payload.courseCatalog)]);

  return buildFullProfile(user);
}

export async function syncUserProgress(user: IUser, payload: ProgressSyncPayload) {
  const now = new Date();

  const setOps: Parameters<typeof SetProgress.bulkWrite>[0] = [];
  for (const incoming of payload.sets) {
    const cleanIds = normalizeUniqueIds(incoming.masteredIds);
    if (cleanIds.length === 0) {
      setOps.push({
        deleteOne: {
          filter: { userId: user._id, setId: incoming.setId },
        },
      });
      continue;
    }

    const totalQuestions = Math.max(incoming.totalQuestions, cleanIds.length);
    const masteredCount = cleanIds.length;
    const percent = computePercent(masteredCount, totalQuestions);
    const isKnowledgeGroup =
      typeof incoming.isKnowledgeGroup === 'boolean'
        ? incoming.isKnowledgeGroup
        : incoming.setId.includes('_group_');

    setOps.push({
      updateOne: {
        filter: { userId: user._id, setId: incoming.setId },
        update: {
          $set: {
            courseId: incoming.courseId,
            courseCode: incoming.courseCode,
            courseName: incoming.courseName,
            setTitle: incoming.setTitle || incoming.setId,
            kind: incoming.kind,
            isKnowledgeGroup,
            totalQuestions,
            masteredIds: cleanIds,
            masteredCount,
            percent,
            isCompleted: totalQuestions > 0 && percent >= 100,
            lastStudiedAt: now,
          },
        },
        upsert: true,
      },
    });
  }

  const fcOps: Parameters<typeof FlashcardProgress.bulkWrite>[0] = [];
  for (const incoming of payload.flashcards) {
    const cleanIds = normalizeUniqueIds(incoming.knownIds);
    if (cleanIds.length === 0) {
      fcOps.push({
        deleteOne: {
          filter: { userId: user._id, flashcardSetId: incoming.flashcardSetId },
        },
      });
      continue;
    }

    const totalCards = Math.max(incoming.totalCards, cleanIds.length);
    const knownCount = cleanIds.length;
    const percent = computePercent(knownCount, totalCards);

    fcOps.push({
      updateOne: {
        filter: { userId: user._id, flashcardSetId: incoming.flashcardSetId },
        update: {
          $set: {
            title: incoming.title || incoming.flashcardSetId,
            totalCards,
            knownIds: cleanIds,
            knownCount,
            percent,
            lastStudiedAt: now,
          },
        },
        upsert: true,
      },
    });
  }

  await Promise.all([
    setOps.length > 0 ? SetProgress.bulkWrite(setOps, { ordered: false }) : Promise.resolve(),
    fcOps.length > 0 ? FlashcardProgress.bulkWrite(fcOps, { ordered: false }) : Promise.resolve(),
  ]);

  if (typeof payload.xp === 'number') {
    const nextXp = Math.max(user.xp || 0, payload.xp);
    user.xp = nextXp;
    user.level = calculateLevelInfo(nextXp).level;
  }

  if (typeof payload.streakDays === 'number' || typeof payload.streakLastDate === 'string') {
    const nextStreak = mergeStreak(
      { streakDays: user.streakDays || 0, streakLastDate: user.streakLastDate || '' },
      {
        streakDays: payload.streakDays ?? user.streakDays ?? 0,
        streakLastDate: payload.streakLastDate ?? user.streakLastDate ?? '',
      }
    );
    user.streakDays = nextStreak.streakDays;
    user.streakLastDate = nextStreak.streakLastDate;
  }

  if (payload.recentCourseIds && payload.recentCourseIds.length > 0) {
    user.recentCourseIds = mergeRecentCourses(payload.recentCourseIds, user.recentCourseIds || []);
  }

  if (typeof payload.totalCatalogQuestions === 'number' && payload.totalCatalogQuestions > 0) {
    user.totalCatalogQuestions = payload.totalCatalogQuestions;
  }

  user.lastSyncedAt = now;

  await Promise.all([user.save(), rebuildCourseSummaries(user._id, payload.courseCatalog)]);

  return buildFullProfile(user);
}

export async function buildFullProfile(user: IUser) {
  const [courses, sets, flashcards] = await Promise.all([
    CourseSummary.find({ userId: user._id })
      .sort({ percent: -1, masteredQuestions: -1, lastStudiedAt: -1 })
      .lean(),
    SetProgress.find({ userId: user._id })
      .sort({ lastStudiedAt: -1, percent: -1 })
      .lean(),
    FlashcardProgress.find({ userId: user._id })
      .sort({ percent: -1, lastStudiedAt: -1 })
      .lean(),
  ]);

  const mainSets = sets.filter((s) => !s.isKnowledgeGroup && s.masteredCount > 0);
  const totalMasteredQuestions = mainSets.reduce((sum, s) => sum + s.masteredCount, 0);
  const studiedCoursesTotalQuestions = courses.reduce((sum, c) => sum + c.totalQuestions, 0);
  const totalCatalogQuestions = Math.max(user.totalCatalogQuestions || 0, studiedCoursesTotalQuestions);
  const studiedCoursesPercent = computePercent(totalMasteredQuestions, studiedCoursesTotalQuestions);
  const overallCatalogPercent = computePercent(totalMasteredQuestions, totalCatalogQuestions);

  const flashcardsKnown = flashcards.reduce((sum, f) => sum + f.knownCount, 0);
  const flashcardsTotal = flashcards.reduce((sum, f) => sum + f.totalCards, 0);
  const flashcardPercent = computePercent(flashcardsKnown, flashcardsTotal);

  const levelInfo = calculateLevelInfo(user.xp);

  return {
    user: serializeUserBasics(user),
    summary: {
      xp: user.xp,
      level: levelInfo.level,
      currentLevelXp: levelInfo.currentLevelXp,
      nextLevelXp: levelInfo.nextLevelXp,
      remainingXp: levelInfo.remainingXp,
      streakDays: user.streakDays,
      streakLastDate: user.streakLastDate,
      studiedCoursesCount: courses.length,
      passedCoursesCount: courses.filter((c) => c.isPassed).length,
      startedSetsCount: mainSets.length,
      completedSetsCount: mainSets.filter((s) => s.isCompleted).length,
      totalMasteredQuestions,
      studiedCoursesTotalQuestions,
      studiedCoursesPercent,
      totalCatalogQuestions,
      overallCatalogPercent,
      flashcardsKnown,
      flashcardsTotal,
      flashcardPercent,
    },
    courses: courses.map((c) => ({
      courseId: c.courseId,
      courseCode: c.courseCode,
      courseName: c.courseName,
      totalSets: c.totalSets,
      startedSets: c.startedSets,
      completedSets: c.completedSets,
      totalQuestions: c.totalQuestions,
      masteredQuestions: c.masteredQuestions,
      percent: c.percent,
      isPassed: c.isPassed,
      lastStudiedAt: c.lastStudiedAt,
    })),
    sets: sets.map((s) => ({
      setId: s.setId,
      courseId: s.courseId,
      courseCode: s.courseCode,
      courseName: s.courseName,
      setTitle: s.setTitle,
      kind: s.kind,
      isKnowledgeGroup: s.isKnowledgeGroup,
      totalQuestions: s.totalQuestions,
      masteredIds: s.masteredIds,
      masteredCount: s.masteredCount,
      percent: s.percent,
      isCompleted: s.isCompleted,
      lastStudiedAt: s.lastStudiedAt,
    })),
    flashcards: flashcards.map((f) => ({
      flashcardSetId: f.flashcardSetId,
      title: f.title,
      totalCards: f.totalCards,
      knownIds: f.knownIds,
      knownCount: f.knownCount,
      percent: f.percent,
      lastStudiedAt: f.lastStudiedAt,
    })),
    recentCourseIds: user.recentCourseIds || [],
  };
}
