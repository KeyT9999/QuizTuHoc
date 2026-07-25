import { SAMPLE_QUIZ_TEXT } from './sampleQuiz';
import { SAMPLE_QUIZ_SWD392 } from './sampleQuizSWD392';

export interface QuizSetInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  badge?: string;
  rawText: string;
}

export const DEFAULT_QUIZ_SETS: QuizSetInfo[] = [
  {
    id: 'cchn_426',
    title: 'Bộ đề CCHN (426 câu)',
    description: 'Bộ 426 câu hỏi trắc nghiệm Quản trị Thương hiệu & Chăm sóc khách hàng (CBBE, Brand Elements, Brand Architecture, Marketing Communication...)',
    category: 'Môn CCHN',
    badge: 'Đề chuẩn 426 câu',
    rawText: SAMPLE_QUIZ_TEXT,
  },
  {
    id: 'swd392_197',
    title: 'Bộ đề SWD392 (197 câu)',
    description: 'Bộ 197 câu hỏi trắc nghiệm Software Architecture and Design (UML, Use Case, Object-Oriented Design, Testing, Design Patterns, SOA, Centralized/Distributed Control...)',
    category: 'Môn SWD392',
    badge: 'Đề chuẩn 197 câu',
    rawText: SAMPLE_QUIZ_SWD392,
  },
];
