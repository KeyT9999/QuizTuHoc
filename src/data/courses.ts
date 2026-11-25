import { FUSTATION_NEW_COURSES } from './fustationCourses';
import { BRA301_QUESTION_IDS } from './bra301KnowledgeGroups';

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  badge?: string;
  isCustom?: boolean;
  createdAt?: number;
}

const BASE_COURSES: Course[] = [
  {
    id: 'mln111',
    code: 'MLN111',
    name: 'Triết học Mác - Lênin',
    description: 'Bao gồm 7 bộ đề gốc, ngân hàng tổng hợp 556 câu và 12 đề thi FUSTATION (tổng 19 bộ đề · 1.595 câu trắc nghiệm chuẩn tiếng Việt).',
    badge: '19 bộ đề',
  },
  {
    id: 'hcm202',
    code: 'HCM202',
    name: 'Tư tưởng Hồ Chí Minh',
    description: 'Ngân hàng câu hỏi trắc nghiệm 656 câu + bộ câu sai hay gặp và 11 đề thi FUSTATION (tổng 13 bộ đề).',
    badge: '13 bộ đề',
  },
  {
    id: 'mln122',
    code: 'MLN122',
    name: 'Kinh tế chính trị Mác - Lênin',
    description: 'Gồm ngân hàng tổng hợp 510 câu, 7 bộ đề sẵn có và 10 bộ đề thi FUSTATION (tổng 18 bộ đề · 1.826 câu hỏi).',
    badge: '18 bộ đề',
  },
  {
    id: 'mln131',
    code: 'MLN131',
    name: 'Chủ nghĩa xã hội khoa học',
    description: 'Bao gồm ngân hàng Quiz Bá Khí 464 câu và 14 bộ đề thi từ FUSTATION (tổng 15 bộ đề · 1.254 câu hỏi trắc nghiệm chuẩn có đáp án).',
    badge: '15 bộ đề',
  },
  {
    id: 'vnr202',
    code: 'VNR202',
    name: 'Lịch sử Đảng Cộng sản Việt Nam',
    description: 'Bao gồm ngân hàng Quiz Bá Khí 440 câu và 11 bộ đề thi từ FUSTATION (tổng 12 bộ đề · 1.100 câu hỏi trắc nghiệm chuẩn có đáp án).',
    badge: '12 bộ đề',
  },
  {
    id: 'pmg201c',
    code: 'PMG201c',
    name: 'Quản lý dự án CNTT',
    description: 'Bao gồm 8 bộ đề sẵn có và 7 bộ đề thi FUSTATION các kỳ FA26, SU26, SP26, FA25, SU25 (tổng 15 bộ đề).',
    badge: '15 bộ đề',
  },
  {
    id: 'swd392',
    code: 'SWD392',
    name: 'Software Architecture & Design',
    description: 'Bao gồm 12 bộ đề sẵn có và 5 bộ đề thi FUSTATION về UML, COMET, kiến trúc phần mềm, SOA, SPL và design patterns (tổng 17 bộ đề).',
    badge: '17 bộ đề',
  },
  {
    id: 'sdn302',
    code: 'SDN302',
    name: 'Distributed Systems & Cloud',
    description: 'Bao gồm 4 bộ đề sẵn có và 2 bộ đề thi FUSTATION về Node.js, Express, MongoDB, Mongoose, REST API, CORS và Cloud BaaS (tổng 6 bộ đề).',
    badge: '6 bộ đề',
  },
  {
    id: 'jpd123',
    code: 'JPD123',
    name: 'Tiếng Nhật JPD123',
    description: 'Bao gồm 6 bộ đề luyện tập sẵn có và 7 bộ đề thi PT1, Final/Retake từ FUSTATION các kỳ FA26, SU26, SP26 (tổng 13 bộ đề · 400 câu hỏi từ vựng, chữ Hán, ngữ pháp và đọc hiểu).',
    badge: '13 bộ đề',
  },
  {
    id: 'cchn',
    code: 'CCHN',
    name: 'Quản trị Thương hiệu & CSKH',
    description: 'Bộ đề 426 câu hỏi chuẩn về CBBE, Brand Elements, Brand Architecture, Marketing Communication.',
    badge: 'Đề chuẩn 426 câu',
  },
  {
    id: 'mkt209m',
    code: 'MKT209M',
    name: 'Content Marketing',
    description: 'Ngân hàng 284 câu hỏi ôn tập + 2 bộ đề thi FUSTATION về Content Marketing, Social Media, Storytelling và 7A/EPIC Framework (tổng 3 bộ đề).',
    badge: '3 bộ đề',
  },
  {
    id: 'mkt301',
    code: 'MKT301',
    name: 'Marketing Research',
    description: 'Ngân hàng 458 câu hỏi ôn tập + 4 bộ đề thi FUSTATION về Nghiên cứu Marketing, thiết kế nghiên cứu, chọn mẫu và phân tích dữ liệu (tổng 5 bộ đề).',
    badge: '5 bộ đề',
  },
  {
    id: 'ccm301',
    code: 'CCM301',
    name: 'Quản trị truyền thông khủng hoảng',
    description: 'Ngân hàng 444 câu hỏi ôn tập + 3 bộ đề thi FUSTATION về quản lý khủng hoảng, truyền thông và danh tiếng tổ chức (tổng 4 bộ đề).',
    badge: '4 bộ đề',
  },
  {
    id: 'bra301',
    code: 'BRA301',
    name: 'Quản trị thương hiệu',
    description: `Ngân hàng ${BRA301_QUESTION_IDS.length} câu (update 23.11) + 7 bộ đề thi Final/Retake các kỳ FA26, SU26, SP26, FA25, SU25 từ FUSTATION (tổng 8 bộ đề · ${BRA301_QUESTION_IDS.length + 350} câu trắc nghiệm quản trị thương hiệu).`,
    badge: '8 bộ đề',
  },
  {
    id: 'evn301',
    code: 'EVN301',
    name: 'Quản lý sự kiện',
    description: 'Ngân hàng 279 câu + 5 bộ đề thi Final/Retake các kỳ FA26, SU26, SP26 từ FUSTATION (tổng 529 câu hỏi lập kế hoạch, vận hành và đánh giá sự kiện).',
    badge: '6 bộ đề',
  },
  {
    id: 'vnc',
    code: 'VNC',
    name: 'Văn hóa Việt Nam',
    description: 'Bộ 498 câu hỏi về địa lý, lịch sử, tôn giáo, phong tục, gia đình, nghệ thuật và đời sống văn hóa Việt Nam.',
    badge: '1 quiz · 498 câu',
  },
  {
    id: 'ssa',
    code: 'SSA101',
    name: 'Kỹ năng học tập & thành công sinh viên (SSA)',
    description: 'Gồm bộ SSA-Quiz Bá Khí (153 câu), bộ SSA2_QuizBaKhi tổng hợp từ 4 file FINAL (251 câu · 8 nhóm kiến thức) và 3 đề thi Final/Retake SP26 từ FUSTATION (tổng 5 bộ đề · 554 câu trắc nghiệm).',
    badge: '5 bộ đề',
  },
  {
    id: 'mmk101',
    code: 'MMK101',
    name: 'Nguyên lý Quản trị & Marketing (MMK)',
    description: 'Gồm bộ tổng hợp FINAL (183 câu · 7 nhóm), bộ MMK2_QuizBaKhi từ MMK Key chính (274 câu · 7 nhóm kiến thức) và 1 đề thi Final Exam SU26 từ FUSTATION (tổng 3 bộ đề · 507 câu trắc nghiệm chuẩn có đáp án).',
    badge: '3 bộ đề',
  },
  {
    id: 'mco302',
    code: 'MCO302',
    name: 'Giao tiếp Liên văn hóa (Intercultural Communication)',
    description: 'Ngân hàng 316 câu (update 23.11) + 2 bộ đề thi Final Exam các kỳ SU26, SP26 từ FUSTATION (tổng 3 bộ đề · 416 câu trắc nghiệm giao tiếp liên văn hóa).',
    badge: '3 bộ đề',
  },
  {
    id: 'ipr102',
    code: 'IPR102',
    name: 'Luật sở hữu trí tuệ (Intellectual Property Rights)',
    description: 'Bao gồm 3 bộ đề thi Final Exam các kỳ SU26, SP26 và SU25 (tổng 150 câu trắc nghiệm chuẩn có đáp án về Copyright, Trademark, Patent, Industrial Design & Passing-off).',
    badge: '3 bộ đề',
  },
  {
    id: 'prm393',
    code: 'PRM393',
    name: 'Lập trình di động (Mobile Programming)',
    description: 'Bao gồm 6 bộ đề thi Final/Retake/Block 5 các kỳ SU26 và SP26 từ FUSTATION & FuExam (tổng 298 câu trắc nghiệm chuẩn có đáp án về Flutter, Dart, Widgets, State Management BLoC, REST API, JWT & Firebase).',
    badge: '6 bộ đề',
  },
  {
    id: 'ite302c',
    code: 'ITE302c',
    name: 'Đạo đức trong CNTT (Ethics in IT)',
    description: 'Bao gồm trọn bộ 5 đề thi Final/Retake các kỳ SU26, SP26 và SU25 từ FUSTATION (tổng 300 câu trắc nghiệm chuẩn có đáp án về đạo đức nghề nghiệp CNTT, quyền riêng tư dữ liệu, sở hữu trí tuệ, an ninh mạng và AI có trách nhiệm).',
    badge: '5 bộ đề',
  },
  {
    id: 'flashcard',
    code: 'FLASHCARD',
    name: 'Thuật ngữ Flashcard PMG201c',
    description: 'Hệ thống thẻ lật thông minh giúp ghi nhớ nhanh các định nghĩa và thuật ngữ cốt lõi quản lý dự án.',
    badge: 'Thẻ ghi nhớ',
  },
];

export const DEFAULT_COURSES: Course[] = [
  ...BASE_COURSES,
  ...FUSTATION_NEW_COURSES,
];
