import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  mergeUserProgress,
  progressSyncPayloadSchema,
  syncUserProgress,
} from '../services/profileService.js';

const router = Router();

/**
 * POST /api/progress/merge
 * Gộp dữ liệu đang học trên trình duyệt (localStorage) với dữ liệu MongoDB khi mới đăng nhập
 * Luôn lấy hợp (union) của câu đã thuộc và giá trị lớn hơn của XP/Streak để không mất tiến độ.
 */
router.post('/merge', requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = progressSyncPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_PROGRESS_PAYLOAD',
        message: 'Dữ liệu đồng bộ tiến độ không hợp lệ.',
      },
    });
    return;
  }

  try {
    const profile = await mergeUserProgress(req.authUser!, parsed.data);
    res.status(200).json(profile);
  } catch (error) {
    console.error('[Progress] POST /merge error:', error);
    res.status(500).json({
      error: {
        code: 'PROGRESS_MERGE_FAILED',
        message: 'Không thể gộp dữ liệu học tập lên máy chủ.',
      },
    });
  }
});

/**
 * PUT /api/progress/sync
 * Lưu tiến độ học mới nhất từ trình duyệt lên MongoDB (hỗ trợ cả cập nhật và xóa tiến độ bộ đề)
 */
router.put('/sync', requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = progressSyncPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_PROGRESS_PAYLOAD',
        message: 'Dữ liệu đồng bộ tiến độ không hợp lệ.',
      },
    });
    return;
  }

  try {
    const profile = await syncUserProgress(req.authUser!, parsed.data);
    res.status(200).json(profile);
  } catch (error) {
    console.error('[Progress] PUT /sync error:', error);
    res.status(500).json({
      error: {
        code: 'PROGRESS_SYNC_FAILED',
        message: 'Không thể lưu tiến độ học lên máy chủ.',
      },
    });
  }
});

export default router;
