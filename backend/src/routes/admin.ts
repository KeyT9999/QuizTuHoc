import crypto from 'node:crypto';
import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import {
  requireAdmin,
  requireAuth,
  type AuthenticatedRequest,
} from '../middleware/auth.js';
import { User, type IUser } from '../models/User.js';
import { SetProgress } from '../models/SetProgress.js';
import { CourseSummary } from '../models/CourseSummary.js';
import { FlashcardProgress } from '../models/FlashcardProgress.js';
import { AuthTicket } from '../models/AuthTicket.js';
import { Announcement } from '../models/Announcement.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';
import {
  buildFullProfile,
  recalculateUserGamification,
} from '../services/profileService.js';
import {
  calculateLevelInfo,
  computePercent,
  computeStreakFromDates,
  getVietnamDateKey,
  shiftDateKey,
} from '../utils/level.js';

const router = Router();
router.use(requireAuth, requireAdmin);

async function writeAudit(
  admin: IUser,
  params: {
    action: string;
    targetType: 'user' | 'announcement' | 'system';
    targetId?: string;
    targetLabel?: string;
    details?: string;
  }
): Promise<void> {
  try {
    await AdminAuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId || '',
      targetLabel: params.targetLabel || '',
      details: params.details || '',
    });
  } catch (error) {
    console.error('[AdminAudit] Failed to record audit log:', error);
  }
}

function getParamId(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * GET /api/admin/overview
 * Tổng quan toàn hệ thống: KPI người dùng, hoạt động 7 ngày, môn học hot, top học viên
 */
router.get('/overview', async (_req, res) => {
  try {
    const now = new Date();
    const todayVn = getVietnamDateKey(now);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      allUsers,
      topCoursesAgg,
      setStatsAgg,
      flashcardStatsAgg,
      activeAnnouncementsCount,
    ] = await Promise.all([
      User.find({})
        .select(
          'email name avatar role status xp level streakDays studyDates lastLoginAt createdAt'
        )
        .lean(),
      CourseSummary.aggregate<{
        _id: string;
        courseCode: string;
        courseName: string;
        learnersCount: number;
        avgPercent: number;
        passedCount: number;
        totalMastered: number;
      }>([
        {
          $group: {
            _id: '$courseId',
            courseCode: { $first: '$courseCode' },
            courseName: { $first: '$courseName' },
            learnersCount: { $sum: 1 },
            avgPercent: { $avg: '$percent' },
            passedCount: { $sum: { $cond: ['$isPassed', 1, 0] } },
            totalMastered: { $sum: '$masteredQuestions' },
          },
        },
        { $sort: { learnersCount: -1, totalMastered: -1 } },
        { $limit: 10 },
      ]),
      SetProgress.aggregate<{
        _id: null;
        totalMasteredQuestions: number;
        totalStartedSets: number;
        totalCompletedSets: number;
      }>([
        { $match: { isKnowledgeGroup: { $ne: true }, masteredCount: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            totalMasteredQuestions: { $sum: '$masteredCount' },
            totalStartedSets: { $sum: 1 },
            totalCompletedSets: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          },
        },
      ]),
      FlashcardProgress.aggregate<{ _id: null; totalFlashcardsKnown: number }>([
        {
          $group: {
            _id: null,
            totalFlashcardsKnown: { $sum: '$knownCount' },
          },
        },
      ]),
      Announcement.countDocuments({
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      }),
    ]);

    const totalUsers = allUsers.length;
    const bannedUsers = allUsers.filter((u) => u.status === 'banned').length;
    const activeUsers = totalUsers - bannedUsers;
    const adminCount = allUsers.filter((u) => u.role === 'admin').length;
    const newUsers7d = allUsers.filter(
      (u) => u.createdAt && new Date(u.createdAt) >= sevenDaysAgo
    ).length;

    const activeTodayCount = allUsers.filter((u) =>
      (u.studyDates || []).includes(todayVn)
    ).length;

    // 7-day activity chart
    const dailyActivity7d: Array<{
      date: string;
      activeLearners: number;
      newUsers: number;
    }> = [];
    for (let offset = -6; offset <= 0; offset += 1) {
      const dateKey = shiftDateKey(todayVn, offset);
      const activeLearners = allUsers.filter((u) =>
        (u.studyDates || []).includes(dateKey)
      ).length;
      const newUsers = allUsers.filter(
        (u) => u.createdAt && getVietnamDateKey(new Date(u.createdAt)) === dateKey
      ).length;
      dailyActivity7d.push({ date: dateKey, activeLearners, newUsers });
    }

    const topLearners = [...allUsers]
      .filter((u) => u.status !== 'banned')
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, 8)
      .map((u) => {
        const levelInfo = calculateLevelInfo(u.xp || 0);
        const streakStats = computeStreakFromDates(u.studyDates || [], now);
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          role: u.role || 'user',
          xp: u.xp || 0,
          level: levelInfo.level,
          streakDays: streakStats.streakDays,
          totalStudyDays: streakStats.totalStudyDays,
        };
      });

    const setTotals = setStatsAgg[0] || {
      totalMasteredQuestions: 0,
      totalStartedSets: 0,
      totalCompletedSets: 0,
    };
    const fcTotals = flashcardStatsAgg[0] || { totalFlashcardsKnown: 0 };

    res.status(200).json({
      totals: {
        totalUsers,
        activeUsers,
        bannedUsers,
        adminCount,
        newUsers7d,
        activeTodayCount,
        totalMasteredQuestions: setTotals.totalMasteredQuestions,
        totalStartedSets: setTotals.totalStartedSets,
        totalCompletedSets: setTotals.totalCompletedSets,
        totalFlashcardsKnown: fcTotals.totalFlashcardsKnown,
        activeAnnouncementsCount,
      },
      dailyActivity7d,
      topCourses: topCoursesAgg.map((c) => ({
        courseId: c._id,
        courseCode: c.courseCode || c._id.toUpperCase(),
        courseName: c.courseName || c.courseCode || c._id,
        learnersCount: c.learnersCount,
        avgPercent: Math.round(c.avgPercent || 0),
        passedCount: c.passedCount,
        totalMastered: c.totalMastered,
      })),
      topLearners,
    });
  } catch (error) {
    console.error('[Admin] GET /overview error:', error);
    res.status(500).json({
      error: {
        code: 'ADMIN_OVERVIEW_FAILED',
        message: 'Không thể tải dữ liệu tổng quan quản trị.',
      },
    });
  }
});

/**
 * GET /api/admin/users/export.csv
 * Xuất danh sách toàn bộ người dùng và tiến độ học ra CSV (UTF-8 BOM)
 */
router.get('/users/export.csv', async (_req, res) => {
  try {
    const [users, courseAgg, setAgg] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).lean(),
      CourseSummary.aggregate<{
        _id: mongoose.Types.ObjectId;
        studiedCourses: number;
        passedCourses: number;
        avgPercent: number;
      }>([
        {
          $group: {
            _id: '$userId',
            studiedCourses: { $sum: 1 },
            passedCourses: { $sum: { $cond: ['$isPassed', 1, 0] } },
            avgPercent: { $avg: '$percent' },
          },
        },
      ]),
      SetProgress.aggregate<{
        _id: mongoose.Types.ObjectId;
        masteredQuestions: number;
        completedSets: number;
      }>([
        { $match: { isKnowledgeGroup: { $ne: true }, masteredCount: { $gt: 0 } } },
        {
          $group: {
            _id: '$userId',
            masteredQuestions: { $sum: '$masteredCount' },
            completedSets: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          },
        },
      ]),
    ]);

    const courseMap = new Map(courseAgg.map((c) => [c._id.toString(), c]));
    const setMap = new Map(setAgg.map((s) => [s._id.toString(), s]));
    const now = new Date();

    const headers = [
      'ID',
      'Email',
      'Ten hien thi',
      'MSSV/Nganh',
      'Ky muc tieu',
      'Vai tro',
      'Trang thai',
      'Level',
      'XP',
      'Streak (ngay)',
      'So mon da hoc',
      'So mon PASS',
      'Tien do TB (%)',
      'Cau da thuoc',
      'Bo de xong',
      'Lan dang nhap cuoi',
      'Ngay tao',
    ];

    const lines = [headers.map(escapeCsvCell).join(',')];
    for (const u of users) {
      const uid = u._id.toString();
      const cStats = courseMap.get(uid);
      const sStats = setMap.get(uid);
      const streak = computeStreakFromDates(u.studyDates || [], now);
      const level = calculateLevelInfo(u.xp || 0).level;

      lines.push(
        [
          uid,
          u.email,
          u.name,
          u.studentId || '',
          u.targetSemester || '',
          u.role || 'user',
          u.status || 'active',
          level,
          u.xp || 0,
          streak.streakDays,
          cStats?.studiedCourses || 0,
          cStats?.passedCourses || 0,
          Math.round(cStats?.avgPercent || 0),
          sStats?.masteredQuestions || 0,
          sStats?.completedSets || 0,
          u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : '',
          u.createdAt ? new Date(u.createdAt).toISOString() : '',
        ]
          .map(escapeCsvCell)
          .join(',')
      );
    }

    const csvWithBom = '\uFEFF' + lines.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="quiztuhoc-users-${getVietnamDateKey(now)}.csv"`
    );
    res.status(200).send(csvWithBom);
  } catch (error) {
    console.error('[Admin] Export CSV error:', error);
    res.status(500).json({
      error: {
        code: 'EXPORT_FAILED',
        message: 'Không thể xuất file CSV người dùng.',
      },
    });
  }
});

/**
 * GET /api/admin/users
 * Danh sách User có tìm kiếm, lọc vai trò/trạng thái, sắp xếp & phân trang
 */
router.get('/users', async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const role = typeof req.query.role === 'string' ? req.query.role : 'all';
    const status = typeof req.query.status === 'string' ? req.query.status : 'all';
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'newest';
    const page = Math.max(1, Number.parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(String(req.query.limit || '20'), 10) || 20)
    );

    const filter: Record<string, unknown> = {};
    if (role === 'admin' || role === 'user') filter.role = role;
    if (status === 'active' || status === 'banned') filter.status = status;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { studentId: regex }];
    }

    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'xp_desc') sortObj = { xp: -1, createdAt: -1 };
    else if (sort === 'last_login') sortObj = { lastLoginAt: -1, createdAt: -1 };
    else if (sort === 'streak_desc') sortObj = { streakDays: -1, xp: -1 };

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const userIds = users.map((u) => u._id);
    const [courseAgg, setAgg, fcAgg] = await Promise.all([
      CourseSummary.aggregate<{
        _id: mongoose.Types.ObjectId;
        studiedCoursesCount: number;
        passedCoursesCount: number;
        totalCourseQuestions: number;
        masteredCourseQuestions: number;
      }>([
        { $match: { userId: { $in: userIds } } },
        {
          $group: {
            _id: '$userId',
            studiedCoursesCount: { $sum: 1 },
            passedCoursesCount: { $sum: { $cond: ['$isPassed', 1, 0] } },
            totalCourseQuestions: { $sum: '$totalQuestions' },
            masteredCourseQuestions: { $sum: '$masteredQuestions' },
          },
        },
      ]),
      SetProgress.aggregate<{
        _id: mongoose.Types.ObjectId;
        totalMasteredQuestions: number;
        startedSetsCount: number;
        completedSetsCount: number;
      }>([
        {
          $match: {
            userId: { $in: userIds },
            isKnowledgeGroup: { $ne: true },
            masteredCount: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: '$userId',
            totalMasteredQuestions: { $sum: '$masteredCount' },
            startedSetsCount: { $sum: 1 },
            completedSetsCount: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          },
        },
      ]),
      FlashcardProgress.aggregate<{
        _id: mongoose.Types.ObjectId;
        flashcardsKnown: number;
      }>([
        { $match: { userId: { $in: userIds } } },
        {
          $group: {
            _id: '$userId',
            flashcardsKnown: { $sum: '$knownCount' },
          },
        },
      ]),
    ]);

    const courseMap = new Map(courseAgg.map((c) => [c._id.toString(), c]));
    const setMap = new Map(setAgg.map((s) => [s._id.toString(), s]));
    const fcMap = new Map(fcAgg.map((f) => [f._id.toString(), f]));
    const now = new Date();

    const items = users.map((u) => {
      const uid = u._id.toString();
      const cStats = courseMap.get(uid);
      const sStats = setMap.get(uid);
      const fStats = fcMap.get(uid);
      const levelInfo = calculateLevelInfo(u.xp || 0);
      const streakStats = computeStreakFromDates(u.studyDates || [], now);

      return {
        id: uid,
        email: u.email,
        name: u.name,
        googleName: u.googleName,
        avatar: u.avatar,
        bio: u.bio,
        studentId: u.studentId,
        targetSemester: u.targetSemester,
        role: u.role || 'user',
        status: u.status || 'active',
        bannedReason: u.bannedReason || '',
        bannedAt: u.bannedAt,
        adminNote: u.adminNote || '',
        isPreProvisioned: u.googleId?.startsWith('pre_') || false,
        xp: u.xp || 0,
        level: levelInfo.level,
        streakDays: streakStats.streakDays,
        longestStreakDays: streakStats.longestStreakDays,
        totalStudyDays: streakStats.totalStudyDays,
        studiedCoursesCount: cStats?.studiedCoursesCount || 0,
        passedCoursesCount: cStats?.passedCoursesCount || 0,
        studiedCoursesPercent: computePercent(
          cStats?.masteredCourseQuestions || 0,
          cStats?.totalCourseQuestions || 0
        ),
        totalMasteredQuestions: sStats?.totalMasteredQuestions || 0,
        startedSetsCount: sStats?.startedSetsCount || 0,
        completedSetsCount: sStats?.completedSetsCount || 0,
        flashcardsKnown: fStats?.flashcardsKnown || 0,
        lastLoginAt: u.lastLoginAt,
        lastSyncedAt: u.lastSyncedAt,
        createdAt: u.createdAt,
      };
    });

    res.status(200).json({
      users: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('[Admin] GET /users error:', error);
    res.status(500).json({
      error: {
        code: 'ADMIN_USERS_LIST_FAILED',
        message: 'Không thể tải danh sách người dùng.',
      },
    });
  }
});

/**
 * GET /api/admin/users/:id
 * Soi chi tiết đầy đủ hồ sơ & tiến độ học (% môn, % bộ đề, Flashcard, XP, Streak) của 1 user
 */
router.get('/users/:id', async (req, res) => {
  const id = getParamId(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID người dùng không hợp lệ.' } });
    return;
  }

  try {
    const target = await User.findById(id);
    if (!target) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng.' } });
      return;
    }

    const fullProfile = await buildFullProfile(target);
    res.status(200).json({
      ...fullProfile,
      adminMeta: {
        role: target.role || 'user',
        status: target.status || 'active',
        bannedReason: target.bannedReason || '',
        bannedAt: target.bannedAt,
        adminNote: target.adminNote || '',
        isPreProvisioned: target.googleId.startsWith('pre_'),
        studyDates: target.studyDates || [],
      },
    });
  } catch (error) {
    console.error('[Admin] GET /users/:id error:', error);
    res.status(500).json({
      error: {
        code: 'ADMIN_USER_DETAIL_FAILED',
        message: 'Không thể tải chi tiết người dùng.',
      },
    });
  }
});

const createUserSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ').max(160),
  name: z.string().trim().min(1, 'Tên hiển thị không được trống').max(80),
  studentId: z.string().trim().max(40).optional().default(''),
  targetSemester: z.string().trim().max(40).optional().default(''),
  bio: z.string().trim().max(240).optional().default(''),
  role: z.enum(['user', 'admin']).optional().default('user'),
  adminNote: z.string().trim().max(500).optional().default(''),
});

/**
 * POST /api/admin/users
 * CREATE: Tạo trước tài khoản theo email Google (khi người đó login Google sẽ tự gắn vào hồ sơ này)
 */
router.post('/users', async (req: AuthenticatedRequest, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_USER_DATA',
        message: parsed.error.issues[0]?.message || 'Dữ liệu tạo tài khoản không hợp lệ.',
      },
    });
    return;
  }

  try {
    const email = parsed.data.email.toLowerCase();
    const exists = await User.findOne({ email }).lean();
    if (exists) {
      res.status(409).json({
        error: {
          code: 'EMAIL_EXISTS',
          message: `Email ${email} đã tồn tại trong hệ thống.`,
        },
      });
      return;
    }

    const created = await User.create({
      googleId: `pre_${crypto.randomUUID()}`,
      email,
      googleName: parsed.data.name,
      name: parsed.data.name,
      givenName: parsed.data.name.split(' ')[0] || '',
      avatar: '',
      studentId: parsed.data.studentId,
      targetSemester: parsed.data.targetSemester,
      bio: parsed.data.bio,
      role: parsed.data.role,
      status: 'active',
      adminNote: parsed.data.adminNote,
      lastLoginAt: null,
    });

    await writeAudit(req.authUser!, {
      action: 'USER_CREATE',
      targetType: 'user',
      targetId: created._id.toString(),
      targetLabel: created.email,
      details: `Tạo trước user (${created.role}): ${created.name}`,
    });

    res.status(201).json({
      id: created._id.toString(),
      email: created.email,
      name: created.name,
      role: created.role,
      status: created.status,
    });
  } catch (error) {
    console.error('[Admin] POST /users error:', error);
    res.status(500).json({
      error: {
        code: 'ADMIN_USER_CREATE_FAILED',
        message: 'Không thể tạo tài khoản người dùng.',
      },
    });
  }
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  studentId: z.string().trim().max(40).optional(),
  targetSemester: z.string().trim().max(40).optional(),
  bio: z.string().trim().max(240).optional(),
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'banned']).optional(),
  bannedReason: z.string().trim().max(300).optional(),
  adminNote: z.string().trim().max(500).optional(),
});

/**
 * PATCH /api/admin/users/:id
 * UPDATE: Sửa thông tin, phân quyền Admin/User, khóa/mở tài khoản, ghi chú Admin
 */
router.patch('/users/:id', async (req: AuthenticatedRequest, res) => {
  const id = getParamId(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID người dùng không hợp lệ.' } });
    return;
  }

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_UPDATE',
        message: parsed.error.issues[0]?.message || 'Dữ liệu cập nhật không hợp lệ.',
      },
    });
    return;
  }

  try {
    const target = await User.findById(id);
    if (!target) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng.' } });
      return;
    }

    const isSelf = target._id.equals(req.authUser!._id);
    const data = parsed.data;

    if (isSelf && data.role === 'user') {
      res.status(400).json({
        error: {
          code: 'CANNOT_DEMOTE_SELF',
          message: 'Không thể tự hạ quyền Admin của chính mình.',
        },
      });
      return;
    }

    if (isSelf && data.status === 'banned') {
      res.status(400).json({
        error: {
          code: 'CANNOT_BAN_SELF',
          message: 'Không thể tự khóa tài khoản của chính mình.',
        },
      });
      return;
    }

    const changes: string[] = [];
    if (typeof data.name === 'string' && data.name !== target.name) {
      target.name = data.name;
      changes.push(`name="${data.name}"`);
    }
    if (typeof data.studentId === 'string') target.studentId = data.studentId;
    if (typeof data.targetSemester === 'string') target.targetSemester = data.targetSemester;
    if (typeof data.bio === 'string') target.bio = data.bio;
    if (typeof data.adminNote === 'string') target.adminNote = data.adminNote;

    let action = 'USER_UPDATE';
    if (data.role && data.role !== target.role) {
      changes.push(`role:${target.role}->${data.role}`);
      target.role = data.role;
      action = 'USER_ROLE_CHANGE';
    }

    if (data.status && data.status !== target.status) {
      target.status = data.status;
      if (data.status === 'banned') {
        target.bannedAt = new Date();
        target.bannedReason = data.bannedReason ?? target.bannedReason ?? '';
        action = 'USER_BAN';
        changes.push(`banned("${target.bannedReason}")`);
      } else {
        target.bannedAt = null;
        target.bannedReason = '';
        action = 'USER_UNBAN';
        changes.push('unbanned');
      }
    } else if (typeof data.bannedReason === 'string' && target.status === 'banned') {
      target.bannedReason = data.bannedReason;
    }

    await target.save();

    await writeAudit(req.authUser!, {
      action,
      targetType: 'user',
      targetId: target._id.toString(),
      targetLabel: target.email,
      details: changes.join(', ') || 'Cập nhật hồ sơ / ghi chú admin',
    });

    const fullProfile = await buildFullProfile(target);
    res.status(200).json({
      ...fullProfile,
      adminMeta: {
        role: target.role,
        status: target.status,
        bannedReason: target.bannedReason,
        bannedAt: target.bannedAt,
        adminNote: target.adminNote,
        isPreProvisioned: target.googleId.startsWith('pre_'),
        studyDates: target.studyDates || [],
      },
    });
  } catch (error) {
    console.error('[Admin] PATCH /users/:id error:', error);
    res.status(500).json({
      error: {
        code: 'ADMIN_USER_UPDATE_FAILED',
        message: 'Không thể cập nhật người dùng.',
      },
    });
  }
});

/**
 * POST /api/admin/users/:id/recalculate
 * Tính lại XP, Level, Streak thật cho 1 user
 */
router.post('/users/:id/recalculate', async (req: AuthenticatedRequest, res) => {
  const id = getParamId(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID người dùng không hợp lệ.' } });
    return;
  }

  try {
    const target = await User.findById(id);
    if (!target) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng.' } });
      return;
    }

    await recalculateUserGamification(target);
    const fullProfile = await buildFullProfile(target);

    await writeAudit(req.authUser!, {
      action: 'USER_RECALCULATE',
      targetType: 'user',
      targetId: target._id.toString(),
      targetLabel: target.email,
      details: `Tính lại XP=${target.xp}, Lv.${target.level}, Streak=${target.streakDays}`,
    });

    res.status(200).json(fullProfile);
  } catch (error) {
    console.error('[Admin] POST /users/:id/recalculate error:', error);
    res.status(500).json({
      error: {
        code: 'RECALCULATE_FAILED',
        message: 'Không thể tính lại chỉ số người dùng.',
      },
    });
  }
});

const resetProgressSchema = z.object({
  scope: z.enum(['all', 'set']).default('all'),
  setId: z.string().trim().max(160).optional(),
});

/**
 * POST /api/admin/users/:id/reset-progress
 * Reset toàn bộ tiến độ học hoặc 1 bộ đề cụ thể của user
 */
router.post('/users/:id/reset-progress', async (req: AuthenticatedRequest, res) => {
  const id = getParamId(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID người dùng không hợp lệ.' } });
    return;
  }

  const parsed = resetProgressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: 'INVALID_RESET', message: 'Tham số reset không hợp lệ.' } });
    return;
  }

  try {
    const target = await User.findById(id);
    if (!target) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng.' } });
      return;
    }

    if (parsed.data.scope === 'set' && parsed.data.setId) {
      const removed = await SetProgress.findOneAndDelete({
        userId: target._id,
        setId: parsed.data.setId,
      });

      if (removed?.courseId) {
        const remaining = await SetProgress.find({
          userId: target._id,
          courseId: removed.courseId,
          isKnowledgeGroup: { $ne: true },
        }).lean();

        const masteredQuestions = remaining.reduce((sum, s) => sum + s.masteredCount, 0);
        if (masteredQuestions === 0) {
          await CourseSummary.deleteOne({ userId: target._id, courseId: removed.courseId });
        } else {
          const prevSummary = await CourseSummary.findOne({
            userId: target._id,
            courseId: removed.courseId,
          });
          if (prevSummary) {
            const totalQ = Math.max(prevSummary.totalQuestions, masteredQuestions);
            prevSummary.masteredQuestions = masteredQuestions;
            prevSummary.startedSets = remaining.filter((s) => s.masteredCount > 0).length;
            prevSummary.completedSets = remaining.filter((s) => s.isCompleted).length;
            prevSummary.percent = computePercent(masteredQuestions, totalQ);
            prevSummary.isPassed = totalQ > 0 && prevSummary.percent >= 100;
            await prevSummary.save();
          }
        }
      }

      await recalculateUserGamification(target);
      await writeAudit(req.authUser!, {
        action: 'USER_RESET_SET',
        targetType: 'user',
        targetId: target._id.toString(),
        targetLabel: target.email,
        details: `Xóa tiến độ bộ đề: ${parsed.data.setId}`,
      });
    } else {
      await Promise.all([
        SetProgress.deleteMany({ userId: target._id }),
        CourseSummary.deleteMany({ userId: target._id }),
        FlashcardProgress.deleteMany({ userId: target._id }),
      ]);
      target.studyDates = [];
      target.streakDays = 0;
      target.longestStreakDays = 0;
      target.streakLastDate = '';
      target.xp = 0;
      target.level = 1;
      target.recentCourseIds = [];
      await target.save();

      await writeAudit(req.authUser!, {
        action: 'USER_RESET_ALL',
        targetType: 'user',
        targetId: target._id.toString(),
        targetLabel: target.email,
        details: 'Reset toàn bộ tiến độ học, XP và chuỗi ngày học',
      });
    }

    const fullProfile = await buildFullProfile(target);
    res.status(200).json(fullProfile);
  } catch (error) {
    console.error('[Admin] POST /users/:id/reset-progress error:', error);
    res.status(500).json({
      error: {
        code: 'RESET_PROGRESS_FAILED',
        message: 'Không thể reset tiến độ người dùng.',
      },
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * DELETE: Xóa vĩnh viễn user cùng toàn bộ dữ liệu học tập liên quan
 */
router.delete('/users/:id', async (req: AuthenticatedRequest, res) => {
  const id = getParamId(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID người dùng không hợp lệ.' } });
    return;
  }

  try {
    const target = await User.findById(id);
    if (!target) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng.' } });
      return;
    }

    if (target._id.equals(req.authUser!._id)) {
      res.status(400).json({
        error: {
          code: 'CANNOT_DELETE_SELF',
          message: 'Không thể tự xóa tài khoản Admin của chính mình.',
        },
      });
      return;
    }

    await Promise.all([
      SetProgress.deleteMany({ userId: target._id }),
      CourseSummary.deleteMany({ userId: target._id }),
      FlashcardProgress.deleteMany({ userId: target._id }),
      AuthTicket.deleteMany({ userId: target._id }),
      User.deleteOne({ _id: target._id }),
    ]);

    await writeAudit(req.authUser!, {
      action: 'USER_DELETE',
      targetType: 'user',
      targetId: target._id.toString(),
      targetLabel: target.email,
      details: `Xóa vĩnh viễn user ${target.name} (${target.email})`,
    });

    res.status(200).json({ ok: true, deletedId: id });
  } catch (error) {
    console.error('[Admin] DELETE /users/:id error:', error);
    res.status(500).json({
      error: {
        code: 'ADMIN_USER_DELETE_FAILED',
        message: 'Không thể xóa người dùng.',
      },
    });
  }
});

// ============================================================================
// SYSTEM ANNOUNCEMENTS FULL CRUD
// ============================================================================

const announcementSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(140),
  content: z.string().trim().min(1, 'Nội dung không được để trống').max(500),
  type: z.enum(['info', 'update', 'warning', 'event']).default('info'),
  linkUrl: z.string().trim().max(300).optional().default(''),
  linkLabel: z.string().trim().max(60).optional().default(''),
  isActive: z.boolean().optional().default(true),
  isPinned: z.boolean().optional().default(false),
  expiresAt: z.string().datetime().nullable().optional(),
});

router.get('/announcements', async (_req, res) => {
  try {
    const items = await Announcement.find({}).sort({ isPinned: -1, createdAt: -1 }).lean();
    res.status(200).json({
      announcements: items.map((a) => ({
        id: a._id.toString(),
        title: a.title,
        content: a.content,
        type: a.type,
        linkUrl: a.linkUrl,
        linkLabel: a.linkLabel,
        isActive: a.isActive,
        isPinned: a.isPinned,
        expiresAt: a.expiresAt,
        createdByEmail: a.createdByEmail,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    });
  } catch (error) {
    console.error('[Admin] GET /announcements error:', error);
    res.status(500).json({
      error: { code: 'ANNOUNCEMENTS_FAILED', message: 'Không thể tải danh sách thông báo.' },
    });
  }
});

router.post('/announcements', async (req: AuthenticatedRequest, res) => {
  const parsed = announcementSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_ANNOUNCEMENT',
        message: parsed.error.issues[0]?.message || 'Dữ liệu thông báo không hợp lệ.',
      },
    });
    return;
  }

  try {
    const created = await Announcement.create({
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      createdByEmail: req.authUser!.email,
    });

    await writeAudit(req.authUser!, {
      action: 'ANNOUNCEMENT_CREATE',
      targetType: 'announcement',
      targetId: created._id.toString(),
      targetLabel: created.title,
      details: `Tạo thông báo (${created.type})`,
    });

    res.status(201).json({
      announcement: {
        id: created._id.toString(),
        title: created.title,
        content: created.content,
        type: created.type,
        linkUrl: created.linkUrl,
        linkLabel: created.linkLabel,
        isActive: created.isActive,
        isPinned: created.isPinned,
        expiresAt: created.expiresAt,
        createdByEmail: created.createdByEmail,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Admin] POST /announcements error:', error);
    res.status(500).json({
      error: { code: 'ANNOUNCEMENT_CREATE_FAILED', message: 'Không thể tạo thông báo.' },
    });
  }
});

const announcementUpdateSchema = announcementSchema.partial();

router.patch('/announcements/:id', async (req: AuthenticatedRequest, res) => {
  const id = getParamId(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID thông báo không hợp lệ.' } });
    return;
  }

  const parsed = announcementUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_ANNOUNCEMENT',
        message: parsed.error.issues[0]?.message || 'Dữ liệu cập nhật thông báo không hợp lệ.',
      },
    });
    return;
  }

  try {
    const item = await Announcement.findById(id);
    if (!item) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy thông báo.' } });
      return;
    }

    const d = parsed.data;
    if (typeof d.title === 'string') item.title = d.title;
    if (typeof d.content === 'string') item.content = d.content;
    if (d.type) item.type = d.type;
    if (typeof d.linkUrl === 'string') item.linkUrl = d.linkUrl;
    if (typeof d.linkLabel === 'string') item.linkLabel = d.linkLabel;
    if (typeof d.isActive === 'boolean') item.isActive = d.isActive;
    if (typeof d.isPinned === 'boolean') item.isPinned = d.isPinned;
    if (d.expiresAt !== undefined) item.expiresAt = d.expiresAt ? new Date(d.expiresAt) : null;

    await item.save();

    await writeAudit(req.authUser!, {
      action: 'ANNOUNCEMENT_UPDATE',
      targetType: 'announcement',
      targetId: item._id.toString(),
      targetLabel: item.title,
      details: `active=${item.isActive}, pinned=${item.isPinned}`,
    });

    res.status(200).json({
      announcement: {
        id: item._id.toString(),
        title: item.title,
        content: item.content,
        type: item.type,
        linkUrl: item.linkUrl,
        linkLabel: item.linkLabel,
        isActive: item.isActive,
        isPinned: item.isPinned,
        expiresAt: item.expiresAt,
        createdByEmail: item.createdByEmail,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Admin] PATCH /announcements/:id error:', error);
    res.status(500).json({
      error: { code: 'ANNOUNCEMENT_UPDATE_FAILED', message: 'Không thể cập nhật thông báo.' },
    });
  }
});

router.delete('/announcements/:id', async (req: AuthenticatedRequest, res) => {
  const id = getParamId(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID thông báo không hợp lệ.' } });
    return;
  }

  try {
    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy thông báo.' } });
      return;
    }

    await writeAudit(req.authUser!, {
      action: 'ANNOUNCEMENT_DELETE',
      targetType: 'announcement',
      targetId: id,
      targetLabel: deleted.title,
      details: 'Xóa thông báo hệ thống',
    });

    res.status(200).json({ ok: true, deletedId: id });
  } catch (error) {
    console.error('[Admin] DELETE /announcements/:id error:', error);
    res.status(500).json({
      error: { code: 'ANNOUNCEMENT_DELETE_FAILED', message: 'Không thể xóa thông báo.' },
    });
  }
});

// ============================================================================
// ADMIN AUDIT LOGS
// ============================================================================

router.get('/audit-logs', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit || '50'), 10) || 50));
    const logs = await AdminAuditLog.find({}).sort({ createdAt: -1 }).limit(limit).lean();

    res.status(200).json({
      logs: logs.map((l) => ({
        id: l._id.toString(),
        adminEmail: l.adminEmail,
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        targetLabel: l.targetLabel,
        details: l.details,
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    console.error('[Admin] GET /audit-logs error:', error);
    res.status(500).json({
      error: { code: 'AUDIT_LOGS_FAILED', message: 'Không thể tải nhật ký quản trị.' },
    });
  }
});

export default router;
