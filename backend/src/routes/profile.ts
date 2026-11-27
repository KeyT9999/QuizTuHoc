import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { buildFullProfile, serializeUserBasics } from '../services/profileService.js';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Tên hiển thị không được để trống').max(80).optional(),
  bio: z.string().trim().max(240).optional(),
  studentId: z.string().trim().max(40).optional(),
  targetSemester: z.string().trim().max(40).optional(),
});

/**
 * GET /api/profile/me
 * Trả về đầy đủ hồ sơ Google + tổng hợp % tiến độ từng môn, từng bộ đề và Flashcard
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await buildFullProfile(req.authUser!);
    res.status(200).json(profile);
  } catch (error) {
    console.error('[Profile] GET /me error:', error);
    res.status(500).json({
      error: {
        code: 'PROFILE_LOAD_FAILED',
        message: 'Không thể tải thông tin hồ sơ học tập.',
      },
    });
  }
});

/**
 * PATCH /api/profile/me
 * Cập nhật thông tin cá nhân trên trang Profile (tên hiển thị, giới thiệu, MSSV/ngành, kỳ học)
 */
router.patch('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_PROFILE_UPDATE',
        message: parsed.error.issues[0]?.message || 'Dữ liệu cập nhật hồ sơ không hợp lệ.',
      },
    });
    return;
  }

  try {
    const user = req.authUser!;
    const data = parsed.data;

    if (typeof data.name === 'string') user.name = data.name;
    if (typeof data.bio === 'string') user.bio = data.bio;
    if (typeof data.studentId === 'string') user.studentId = data.studentId;
    if (typeof data.targetSemester === 'string') user.targetSemester = data.targetSemester;

    await user.save();

    res.status(200).json({
      user: serializeUserBasics(user),
    });
  } catch (error) {
    console.error('[Profile] PATCH /me error:', error);
    res.status(500).json({
      error: {
        code: 'PROFILE_UPDATE_FAILED',
        message: 'Không thể cập nhật thông tin hồ sơ.',
      },
    });
  }
});

export default router;
