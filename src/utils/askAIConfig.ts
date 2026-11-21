import type { AppTheme } from '../context/ThemeContext';

export const MOBILE_ASK_AI_TOGGLE_EVENT = 'quiz-toggle-mobile-ask-ai';
export const MOBILE_ASK_AI_STATE_EVENT = 'quiz-mobile-ask-ai-state';

export const AI_PERSONAS: Record<
  AppTheme,
  { icon: string; btnIcon: string; title: string; subtitle: string; cta: string }
> = {
  'lotus-zen-sanctuary': {
    icon: '🪷',
    btnIcon: '✨',
    title: 'Kinh Đài Luận Giải AI',
    subtitle: 'Thấu triệt câu hỏi · Chỉ điểm đáp án & luận giải',
    cta: 'Thỉnh AI giảng',
  },
  'hon-viet': {
    icon: '📜',
    btnIcon: '🏮',
    title: 'Trạng Nguyên AI Luận Giải',
    subtitle: 'Phân tích đề bài · Đối chiếu đáp án chính xác',
    cta: 'Hỏi Trạng Nguyên',
  },
  'fantasy-academy': {
    icon: '🔮',
    btnIcon: '⚡',
    title: 'Hiền Giả Cổ Thuật AI',
    subtitle: 'Giải mã cổ ngữ · Chỉ dẫn đáp án & ma pháp',
    cta: 'Triệu hồi AI',
  },
  'billionaire-vault': {
    icon: '🏦',
    btnIcon: '💎',
    title: 'Private Wealth Advisor AI',
    subtitle: 'Cố vấn tài sản riêng · Phân tích đáp án chuẩn xác 100%',
    cta: 'Hỏi Cố Vấn',
  },
  'shin-kasukabe': {
    icon: '🖍️',
    btnIcon: '🛡️',
    title: 'Đội Phòng Vệ Kasukabe AI',
    subtitle: 'Shin – Kazama – Bạch Tuyết giải thích đáp án siêu dễ hiểu',
    cta: 'Hỏi Biệt Đội',
  },
  'spidey-night': {
    icon: '🕷️',
    btnIcon: '⚡',
    title: 'KAREN / E.D.I.T.H. AI Assistant',
    subtitle: 'Quét Spider-Sense · Phân tích & giải thích đáp án tức thì',
    cta: 'Hỏi AI ngay',
  },
  'cozy-night': {
    icon: '🎧',
    btnIcon: '🌙',
    title: 'Lofi Study Buddy AI',
    subtitle: 'Phân tích nhanh · Giải thích đáp án dễ hiểu',
    cta: 'Hỏi AI ngay',
  },
  default: {
    icon: '✦',
    btnIcon: '✨',
    title: 'Trợ lý AI Thông Minh',
    subtitle: 'Đọc câu hỏi · Chọn đáp án · Giải thích chi tiết',
    cta: 'Hỏi AI',
  },
};
