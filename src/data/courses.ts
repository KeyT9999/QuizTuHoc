export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  badge?: string;
  isCustom?: boolean;
  createdAt?: number;
}

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'mln111',
    code: 'MLN111',
    name: 'Triết học Mác - Lênin',
    description: 'Bao gồm 7 bộ đề thi và ngân hàng câu hỏi tổng hợp 556 câu, tổng 917 câu trắc nghiệm chuẩn tiếng Việt.',
    badge: '7 bộ đề',
  },
  {
    id: 'mln122',
    code: 'MLN122',
    name: 'Kinh tế chính trị Mác - Lênin',
    description: 'Bao gồm 7 bộ đề thi và ngân hàng câu hỏi tổng hợp 510 câu, tổng 870 câu hỏi trắc nghiệm chuẩn tiếng Việt.',
    badge: '7 bộ đề',
  },
  {
    id: 'pmg201c',
    code: 'PMG201c',
    name: 'Quản lý dự án CNTT',
    description: 'Bao gồm 8 bộ đề thi các kỳ SP26, FA25, SU25, SP24, SU24, CodeCrafters và bộ câu hỏi lặp.',
    badge: '8 bộ đề',
  },
  {
    id: 'swd392',
    code: 'SWD392',
    name: 'Software Architecture & Design',
    description: 'Bao gồm 12 bộ đề thi đầy đủ về UML, COMET, mô hình hóa kiến trúc, SOA, SPL và design patterns.',
    badge: '12 bộ đề',
  },
  {
    id: 'sdn302',
    code: 'SDN302',
    name: 'Distributed Systems & Cloud',
    description: 'Bao gồm 4 bộ đề thi Node.js, Express, MongoDB, Mongoose, REST API, CORS và Cloud BaaS.',
    badge: '4 bộ đề',
  },
  {
    id: 'jpd123',
    code: 'JPD123',
    name: 'Tiếng Nhật JPD123',
    description: 'Bộ đề luyện tập tiếng Nhật JPD123 với các câu hỏi trắc nghiệm đọc hiểu và ngữ pháp.',
    badge: '1 bộ đề',
  },
  {
    id: 'cchn',
    code: 'CCHN',
    name: 'Quản trị Thương hiệu & CSKH',
    description: 'Bộ đề 426 câu hỏi chuẩn về CBBE, Brand Elements, Brand Architecture, Marketing Communication.',
    badge: 'Đề chuẩn 426 câu',
  },
  {
    id: 'flashcard',
    code: 'FLASHCARD',
    name: 'Thuật ngữ Flashcard PMG201c',
    description: 'Hệ thống thẻ lật thông minh giúp ghi nhớ nhanh các định nghĩa và thuật ngữ cốt lõi quản lý dự án.',
    badge: 'Thẻ ghi nhớ',
  },
];
