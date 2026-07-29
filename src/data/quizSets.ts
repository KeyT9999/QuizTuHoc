import { SAMPLE_QUIZ_TEXT } from './sampleQuiz';
import { SAMPLE_QUIZ_SWD392 } from './sampleQuizSWD392';
import { SAMPLE_QUIZ_SDN302 } from './sampleQuizSDN302';
import { SAMPLE_QUIZ_SDN302_SU25_RE } from './sampleQuizSDN302SU25RE';
import { SAMPLE_QUIZ_SDN302_SU25_B5_1 } from './sampleQuizSDN302SU25B51';
import { SAMPLE_QUIZ_SDN302_FA2024_FE } from './sampleQuizSDN302FA2024FE';

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
  {
    id: 'sdn302_sp26_b5fe_352719',
    title: 'SDN302_SP26 B5FE 352719',
    description: 'Bộ 50 câu hỏi trắc nghiệm SDN302 về Node.js, Express, MongoDB, Mongoose, REST API, bảo mật và BaaS.',
    category: 'Môn SDN302',
    badge: 'Đề SDN302_SP26 - 50 câu',
    rawText: SAMPLE_QUIZ_SDN302,
  },
  {
    id: 'sdn302_su25_re',
    title: 'SDN302 - SU25 - RE',
    description: 'Bộ 50 câu hỏi ôn tập SDN302 SU25 về Node.js, Express, MongoDB, Mongoose, REST API, NestJS, CORS và xác thực.',
    category: 'Môn SDN302',
    badge: 'Đề SDN302 SU25 - 50 câu',
    rawText: SAMPLE_QUIZ_SDN302_SU25_RE,
  },
  {
    id: 'sdn302_su25_b5_1',
    title: 'SDN302 - SU25 - B5 - 1',
    description: 'Bộ 50 câu hỏi SDN302 SU25 B5 về Node.js, Express, MongoDB, Mongoose, REST API, NestJS, CORS, OAuth và bảo mật.',
    category: 'Môn SDN302',
    badge: 'Đề SDN302 SU25 B5 - 50 câu',
    rawText: SAMPLE_QUIZ_SDN302_SU25_B5_1,
  },
  {
    id: 'sdn302_fa2024_fe',
    title: 'SDN302 - FA 2024 - FE',
    description: 'Bộ 50 câu hỏi SDN302 Final Exam FA 2024 về Node.js, Express, MongoDB, Mongoose, REST API, CORS, HTTPS, OAuth và EJS.',
    category: 'Môn SDN302',
    badge: 'Đề SDN302 FA 2024 - 50 câu',
    rawText: SAMPLE_QUIZ_SDN302_FA2024_FE,
  },
];
