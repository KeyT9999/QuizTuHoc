import { Router } from 'express';
import { Announcement } from '../models/Announcement.js';

const router = Router();

/**
 * GET /api/announcements/active
 * Công khai: trả về danh sách thông báo hệ thống đang bật & chưa hết hạn
 */
router.get('/active', async (_req, res) => {
  try {
    const now = new Date();
    const items = await Announcement.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      announcements: items.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        content: item.content,
        type: item.type,
        linkUrl: item.linkUrl,
        linkLabel: item.linkLabel,
        isPinned: item.isPinned,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error('[Announcements] GET /active error:', error);
    res.status(500).json({
      error: {
        code: 'ANNOUNCEMENTS_LOAD_FAILED',
        message: 'Không thể tải thông báo hệ thống.',
      },
    });
  }
});

export default router;
