import { Router } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { CourseSummary } from '../models/CourseSummary.js';
import { SetProgress } from '../models/SetProgress.js';
import { SESSION_COOKIE_NAME } from '../middleware/auth.js';
import { verifySessionToken } from '../utils/jwt.js';
import { calculateLevelInfo, computeStreakFromDates } from '../utils/level.js';

const router = Router();

function extractOptionalUserId(req: Parameters<Parameters<typeof router.get>[1]>[0]): string | null {
  const authHeader = req.headers.authorization;
  let token: string | null = null;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim() || null;
  } else if (typeof req.cookies?.[SESSION_COOKIE_NAME] === 'string') {
    token = req.cookies[SESSION_COOKIE_NAME].trim() || null;
  }
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload || !mongoose.Types.ObjectId.isValid(payload.sub)) return null;
  return payload.sub;
}

/**
 * GET /api/leaderboard?sort=xp|streak&limit=8
 * Công khai (không lộ email người khác): trả về Top học viên theo XP thật hoặc Streak thật
 */
router.get('/', async (req, res) => {
  try {
    const sortMode = req.query.sort === 'streak' ? 'streak' : 'xp';
    const limit = Math.min(20, Math.max(3, Number.parseInt(String(req.query.limit || '8'), 10) || 8));
    const currentUserId = extractOptionalUserId(req);
    const now = new Date();

    const [users, courseCounts, masteredCounts] = await Promise.all([
      User.find({ status: { $ne: 'banned' }, xp: { $gt: 0 } })
        .select('name avatar studentId role xp studyDates')
        .lean(),
      CourseSummary.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
      SetProgress.aggregate<{ _id: mongoose.Types.ObjectId; mastered: number }>([
        { $match: { isKnowledgeGroup: { $ne: true }, masteredCount: { $gt: 0 } } },
        { $group: { _id: '$userId', mastered: { $sum: '$masteredCount' } } },
      ]),
    ]);

    const courseCountMap = new Map(courseCounts.map((c) => [c._id.toString(), c.count]));
    const masteredMap = new Map(masteredCounts.map((m) => [m._id.toString(), m.mastered]));

    let communityMasteredQuestions = 0;
    for (const m of masteredCounts) communityMasteredQuestions += m.mastered;

    const ranked = users
      .map((u) => {
        const uid = u._id.toString();
        const levelInfo = calculateLevelInfo(u.xp || 0);
        const streakStats = computeStreakFromDates(u.studyDates || [], now);
        return {
          id: uid,
          name: u.name,
          avatar: u.avatar || '',
          studentId: u.studentId || '',
          role: u.role || 'user',
          xp: u.xp || 0,
          level: levelInfo.level,
          streakDays: streakStats.streakDays,
          longestStreakDays: streakStats.longestStreakDays,
          studiedCoursesCount: courseCountMap.get(uid) || 0,
          totalMasteredQuestions: masteredMap.get(uid) || 0,
          isCurrentUser: currentUserId === uid,
        };
      })
      .sort((a, b) => {
        if (sortMode === 'streak') {
          if (b.streakDays !== a.streakDays) return b.streakDays - a.streakDays;
          if (b.longestStreakDays !== a.longestStreakDays) {
            return b.longestStreakDays - a.longestStreakDays;
          }
          return b.xp - a.xp;
        }
        if (b.xp !== a.xp) return b.xp - a.xp;
        return b.totalMasteredQuestions - a.totalMasteredQuestions;
      })
      .map((entry, idx) => ({
        rank: idx + 1,
        ...entry,
      }));

    const myEntry = currentUserId ? ranked.find((r) => r.id === currentUserId) || null : null;

    res.status(200).json({
      sort: sortMode,
      totalActiveLearners: ranked.length,
      communityMasteredQuestions,
      leaders: ranked.slice(0, limit),
      myRank: myEntry,
    });
  } catch (error) {
    console.error('[Leaderboard] GET / error:', error);
    res.status(500).json({
      error: {
        code: 'LEADERBOARD_FAILED',
        message: 'Không thể tải bảng xếp hạng lúc này.',
      },
    });
  }
});

export default router;
