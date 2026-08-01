import { SAMPLE_QUIZ_TEXT } from './sampleQuiz';
import { SAMPLE_QUIZ_SWD392 } from './sampleQuizSWD392';
import { SAMPLE_QUIZ_SDN302 } from './sampleQuizSDN302';
import { SAMPLE_QUIZ_SDN302_SU25_RE } from './sampleQuizSDN302SU25RE';
import { SAMPLE_QUIZ_SDN302_SU25_B5_1 } from './sampleQuizSDN302SU25B51';
import { SAMPLE_QUIZ_SDN302_FA2024_FE } from './sampleQuizSDN302FA2024FE';
import { SAMPLE_QUIZ_SWD392_SU26_FE } from './sampleQuizSWD392SU26FE';
import { SAMPLE_QUIZ_SWD392_SP26_FE } from './sampleQuizSWD392SP26FE';
import { SAMPLE_QUIZ_SWD392_SP26_RE } from './sampleQuizSWD392SP26RE';
import { SAMPLE_QUIZ_SWD392_SU25_RE } from './sampleQuizSWD392SU25RE';
import { SAMPLE_QUIZ_SWD392_SU26_FE_FUO } from './sampleQuizSWD392SU26FEFUO';
import { SAMPLE_QUIZ_SWD392_SU25_FINAL_EXAM } from './sampleQuizSWD392SU25FinalExam';
import { SAMPLE_QUIZ_SWD392_FA25_FEB5 } from './sampleQuizSWD392FA25FEB5';
import { SAMPLE_QUIZ_SWD392_SP2025_FE } from './sampleQuizSWD392SP2025FE';
import { SAMPLE_QUIZ_SWD392_SP2024_FE } from './sampleQuizSWD392SP2024FE';
import { SAMPLE_QUIZ_SWD392_SU2024_FE } from './sampleQuizSWD392SU2024FE';
import { SAMPLE_QUIZ_SWD392_FA2024_FE } from './sampleQuizSWD392FA2024FE';

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
  {
    id: 'swd392_su26_fe',
    title: 'SWD392_SU26_FE',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam SU26 về UML, COMET, kiến trúc phần mềm, thiết kế hướng đối tượng, SOA, Software Product Line và design patterns.',
    category: 'Môn SWD392',
    badge: 'Đề SWD392 SU26 FE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SU26_FE,
  },
  {
    id: 'swd392_sp26_fe',
    title: 'SWD392 - SP26 - FE',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam SP26 về UML, COMET, kiến trúc phần mềm, thiết kế hướng đối tượng, SOA, component-based architecture và Software Product Line.',
    category: 'Môn SWD392',
    badge: 'Đề SWD392 SP26 FE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SP26_FE,
  },
  {
    id: 'swd392_sp26_re',
    title: 'SWD392 - SP26 - RE',
    description: 'Bộ 60 câu hỏi SWD392 kỳ SP26 RE về UML, COMET, mô hình hóa, kiến trúc phần mềm, cơ sở dữ liệu và design patterns.',
    category: 'Môn SWD392',
    badge: 'SWD392 SP26 RE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SP26_RE,
  },
  {
    id: 'swd392_su25_re',
    title: 'SWD392 - SU25 - RE',
    description: 'Bộ 60 câu hỏi SWD392 kỳ SU25 RE về UML, vòng đời phần mềm, phân tích thiết kế, subsystem, SOA và kiến trúc thành phần.',
    category: 'Môn SWD392',
    badge: 'SWD392 SU25 RE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SU25_RE,
  },
  {
    id: 'swd392_su26_fe_fuo',
    title: 'SWD392 - SU26 - FE_FUO',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam SU26 về UML, COMET, kiến trúc phần mềm, hệ phân tán, cơ sở dữ liệu và design patterns.',
    category: 'Môn SWD392',
    badge: 'SWD392 SU26 FE_FUO - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SU26_FE_FUO,
  },
  {
    id: 'swd392_su25_final_exam',
    title: 'SWD392_SU25_Final Exam',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam SU25 về mô hình hóa, UML, COMET, kiến trúc client/server, SOA và chất lượng phần mềm.',
    category: 'Môn SWD392',
    badge: 'SWD392 SU25 Final Exam - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SU25_FINAL_EXAM,
  },
  {
    id: 'swd392_fa25_feb5',
    title: 'SWD392 - FA25 - FEB5',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam B5 kỳ FA25 về UML, COMET, thiết kế subsystem, SOA, cơ sở dữ liệu và Software Product Line.',
    category: 'Môn SWD392',
    badge: 'SWD392 FA25 FEB5 - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_FA25_FEB5,
  },
  {
    id: 'swd392_sp2025_fe',
    title: 'SWD392 - SP 2025 - FE',
    description: 'Bộ 50 câu hỏi SWD392 Final Exam kỳ SP 2025 về UML, COMET, kiến trúc phần mềm, thiết kế hướng đối tượng, SOA và cơ sở dữ liệu.',
    category: 'Môn SWD392',
    badge: 'SWD392 SP 2025 FE - 50 câu',
    rawText: SAMPLE_QUIZ_SWD392_SP2025_FE,
  },
  {
    id: 'swd392_sp2024_fe',
    title: 'SWD392 - SP 2024 - FE',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam kỳ SP 2024 về UML, thiết kế hướng đối tượng, kiến trúc điều khiển, Software Product Line và cơ sở dữ liệu.',
    category: 'Môn SWD392',
    badge: 'SWD392 SP 2024 FE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SP2024_FE,
  },
  {
    id: 'swd392_su2024_fe',
    title: 'SWD392 - SU 2024 - FE',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam kỳ SU 2024 về UML, mô hình hóa, subsystem, hệ thời gian thực, bảo mật và chất lượng phần mềm.',
    category: 'Môn SWD392',
    badge: 'SWD392 SU 2024 FE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SU2024_FE,
  },
  {
    id: 'swd392_fa2024_fe',
    title: 'SWD392 - FA 2024 - FE',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam kỳ FA 2024 về UML, use case, kiến trúc phần mềm, thiết kế subsystem, SOA và cơ sở dữ liệu.',
    category: 'Môn SWD392',
    badge: 'SWD392 FA 2024 FE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_FA2024_FE,
  },
];
