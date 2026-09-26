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
import { SAMPLE_QUIZ_PMG201C_SP26_RE } from './sampleQuizPMG201cSP26RE';
import { SAMPLE_QUIZ_PMG201C_FA25_FE } from './sampleQuizPMG201cFA25FE';
import { SAMPLE_QUIZ_PMG201C_FA25_RE } from './sampleQuizPMG201cFA25RE';
import { SAMPLE_QUIZ_PMG201C_CODECRAFTERS } from './sampleQuizPMG201cCodeCrafters';
import { SAMPLE_QUIZ_PMG201C_SU25_FE } from './sampleQuizPMG201cSU25FE';
import { SAMPLE_QUIZ_PMG201C_CAU_LAP } from './sampleQuizPMG201cCauLap';
import { SAMPLE_QUIZ_PMG201C_SP24_FE } from './sampleQuizPMG201cSP24FE';
import { SAMPLE_QUIZ_PMG201C_SU24_FE1 } from './sampleQuizPMG201cSU24FE1';
import { SAMPLE_QUIZ_MLN111_FULL } from './sampleQuizMLN111Full';
import { SAMPLE_QUIZ_MLN111_SU26_C1FE } from './sampleQuizMLN111SU26C1FE';
import { SAMPLE_QUIZ_MLN111_SU26_C2FE } from './sampleQuizMLN111SU26C2FE';
import { SAMPLE_QUIZ_MLN111_SU26_RE } from './sampleQuizMLN111SU26RE';
import { SAMPLE_QUIZ_MLN111_SP25_FE } from './sampleQuizMLN111SP25FE';
import { SAMPLE_QUIZ_MLN111_SP25_RE } from './sampleQuizMLN111SP25RE';
import { SAMPLE_QUIZ_MLN111_SU25_BL5_FE } from './sampleQuizMLN111SU25BL5FE';
import { SAMPLE_QUIZ_MLN122_FULL } from './sampleQuizMLN122Full';
import { SAMPLE_QUIZ_MLN122_FA23_FEB5 } from './sampleQuizMLN122FA23FEB5';
import { SAMPLE_QUIZ_MLN122_SP26_C2FE } from './sampleQuizMLN122SP26C2FE';
import { SAMPLE_QUIZ_JPD123_PT1 } from './sampleQuizJPD123PT1';
import {
  SAMPLE_QUIZ_JPD123_FA25_RE_MC,
  SAMPLE_QUIZ_JPD123_SP26_C1FE,
  SAMPLE_QUIZ_JPD123_SP26_C2FE,
  SAMPLE_QUIZ_JPD123_SU26_FE,
  SAMPLE_QUIZ_JPD123_SU26_RE,
} from './sampleQuizJPD123More';
import { SAMPLE_QUIZ_MLN122_SU25_B5_1 } from './sampleQuizMLN122SU25B51';
import { SAMPLE_QUIZ_MLN122_SU26_FE_C1 } from './sampleQuizMLN122SU26C1FE';
import { SAMPLE_QUIZ_MLN122_SU26_RE } from './sampleQuizMLN122SU26RE';
import { SAMPLE_QUIZ_MLN122_SU25_FE_C1_4330 } from './sampleQuizMLN122SU25FEC14330';

export interface QuizSetInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  badge?: string;
  rawText: string;
  kind?: 'text' | 'image';
  imageBasePath?: string;
  imageCount?: number;
  imageExtension?: string;
  imageViewport?: 'left' | 'right';
  courseId?: string;
}

export const DEFAULT_QUIZ_SETS: QuizSetInfo[] = [
  {
    id: 'pmg201c_cau_lap',
    courseId: 'pmg201c',
    title: 'PMG201c_CAU_LAP',
    description: 'Bộ 80 câu hỏi PMG201c bị lặp giữa các đề; 19 câu xuất hiện trong ít nhất 3 đề và được xếp ở đầu.',
    category: 'Môn PMG201c',
    badge: 'PMG201c Câu lặp - 80 câu',
    rawText: SAMPLE_QUIZ_PMG201C_CAU_LAP,
  },
  {
    id: 'pmg201c_su24_fe1',
    courseId: 'pmg201c',
    title: 'PMG201c_SU24_FE1',
    description: 'Bộ 50 câu hỏi PMG201c SU24 FE1 về khởi tạo, phạm vi, tiến độ, chi phí, chất lượng, giao tiếp, rủi ro và stakeholder.',
    category: 'Môn PMG201c',
    badge: 'PMG201c SU24 FE1 - 50 câu',
    rawText: SAMPLE_QUIZ_PMG201C_SU24_FE1,
  },
  {
    id: 'pmg201c_sp24_fe',
    courseId: 'pmg201c',
    title: 'PMG201c_SP24_FE',
    description: 'Bộ 50 câu hỏi PMG201c SP24 FE về khởi tạo, phạm vi, tiến độ, chi phí, chất lượng, giao tiếp, rủi ro và stakeholder.',
    category: 'Môn PMG201c',
    badge: 'PMG201c SP24 FE - 50 câu',
    rawText: SAMPLE_QUIZ_PMG201C_SP24_FE,
  },
  {
    id: 'pmg201c_su25_fe',
    courseId: 'pmg201c',
    title: 'PMG201c_SU25_FE',
    description: 'Bộ 50 câu hỏi PMG201c SU25 FE về tổ chức, phạm vi, tiến độ, chi phí, chất lượng, giao tiếp, rủi ro và stakeholder.',
    category: 'Môn PMG201c',
    badge: 'PMG201c SU25 FE - 50 câu',
    rawText: SAMPLE_QUIZ_PMG201C_SU25_FE,
  },
  {
    id: 'pmg201c_codecrafters',
    courseId: 'pmg201c',
    title: 'PMG201c CodeCrafters',
    description: 'Bộ câu hỏi PMG201c CodeCrafters về phạm vi, tiến độ, chi phí, chất lượng, giao tiếp, rủi ro và stakeholder.',
    category: 'Môn PMG201c',
    badge: 'PMG201c CodeCrafters - 315 câu',
    rawText: SAMPLE_QUIZ_PMG201C_CODECRAFTERS,
  },
  {
    id: 'pmg201c_fa25_re',
    courseId: 'pmg201c',
    title: 'PMG201c_FA25_RE',
    description: 'Bộ 50 câu hỏi PMG201c FA25 RE về khởi tạo, phạm vi, tiến độ, chi phí, chất lượng, giao tiếp, rủi ro và stakeholder.',
    category: 'Môn PMG201c',
    badge: 'PMG201c FA25 RE - 50 câu',
    rawText: SAMPLE_QUIZ_PMG201C_FA25_RE,
  },
  {
    id: 'pmg201c_fa25_fe',
    courseId: 'pmg201c',
    title: 'PMG201c_FA25_FE',
    description: 'Bộ 50 câu hỏi PMG201c FA25 FE về tổ chức, phạm vi, tiến độ, chi phí, chất lượng, giao tiếp, rủi ro và stakeholder.',
    category: 'Môn PMG201c',
    badge: 'PMG201c FA25 FE - 50 câu',
    rawText: SAMPLE_QUIZ_PMG201C_FA25_FE,
  },
  {
    id: 'pmg201c_sp26_re',
    courseId: 'pmg201c',
    title: 'PMG201c_SP26_RE',
    description: 'Bộ 50 câu hỏi PMG201c SP26 RE về quản lý dự án, giao tiếp, phạm vi, tiến độ, chi phí, chất lượng và rủi ro.',
    category: 'Môn PMG201c',
    badge: 'PMG201c SP26 RE - 50 câu',
    rawText: SAMPLE_QUIZ_PMG201C_SP26_RE,
  },
  {
    id: 'cchn_426',
    courseId: 'cchn',
    title: 'Bộ đề CCHN (426 câu)',
    description: 'Bộ 426 câu hỏi trắc nghiệm Quản trị Thương hiệu & Chăm sóc khách hàng (CBBE, Brand Elements, Brand Architecture, Marketing Communication...)',
    category: 'Môn CCHN',
    badge: 'Đề chuẩn 426 câu',
    rawText: SAMPLE_QUIZ_TEXT,
  },
  {
    id: 'swd392_197',
    courseId: 'swd392',
    title: 'Bộ đề SWD392 (197 câu)',
    description: 'Bộ 197 câu hỏi trắc nghiệm Software Architecture and Design (UML, Use Case, Object-Oriented Design, Testing, Design Patterns, SOA, Centralized/Distributed Control...)',
    category: 'Môn SWD392',
    badge: 'Đề chuẩn 197 câu',
    rawText: SAMPLE_QUIZ_SWD392,
  },
  {
    id: 'sdn302_sp26_b5fe_352719',
    courseId: 'sdn302',
    title: 'SDN302_SP26 B5FE 352719',
    description: 'Bộ 50 câu hỏi trắc nghiệm SDN302 về Node.js, Express, MongoDB, Mongoose, REST API, bảo mật và BaaS.',
    category: 'Môn SDN302',
    badge: 'Đề SDN302_SP26 - 50 câu',
    rawText: SAMPLE_QUIZ_SDN302,
  },
  {
    id: 'sdn302_su25_re',
    courseId: 'sdn302',
    title: 'SDN302 - SU25 - RE',
    description: 'Bộ 50 câu hỏi ôn tập SDN302 SU25 về Node.js, Express, MongoDB, Mongoose, REST API, NestJS, CORS và xác thực.',
    category: 'Môn SDN302',
    badge: 'Đề SDN302 SU25 - 50 câu',
    rawText: SAMPLE_QUIZ_SDN302_SU25_RE,
  },
  {
    id: 'sdn302_su25_b5_1',
    courseId: 'sdn302',
    title: 'SDN302 - SU25 - B5 - 1',
    description: 'Bộ 50 câu hỏi SDN302 SU25 B5 về Node.js, Express, MongoDB, Mongoose, REST API, NestJS, CORS, OAuth và bảo mật.',
    category: 'Môn SDN302',
    badge: 'Đề SDN302 SU25 B5 - 50 câu',
    rawText: SAMPLE_QUIZ_SDN302_SU25_B5_1,
  },
  {
    id: 'sdn302_fa2024_fe',
    courseId: 'sdn302',
    title: 'SDN302 - FA 2024 - FE',
    description: 'Bộ 50 câu hỏi SDN302 Final Exam FA 2024 về Node.js, Express, MongoDB, Mongoose, REST API, CORS, HTTPS, OAuth và EJS.',
    category: 'Môn SDN302',
    badge: 'Đề SDN302 FA 2024 - 50 câu',
    rawText: SAMPLE_QUIZ_SDN302_FA2024_FE,
  },
  {
    id: 'swd392_su26_fe',
    courseId: 'swd392',
    title: 'SWD392_SU26_FE',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam SU26 về UML, COMET, kiến trúc phần mềm, thiết kế hướng đối tượng, SOA, Software Product Line và design patterns.',
    category: 'Môn SWD392',
    badge: 'Đề SWD392 SU26 FE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SU26_FE,
  },
  {
    id: 'swd392_sp26_fe',
    courseId: 'swd392',
    title: 'SWD392 - SP26 - FE',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam SP26 về UML, COMET, kiến trúc phần mềm, thiết kế hướng đối tượng, SOA, component-based architecture và Software Product Line.',
    category: 'Môn SWD392',
    badge: 'Đề SWD392 SP26 FE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SP26_FE,
  },
  {
    id: 'swd392_sp26_re',
    courseId: 'swd392',
    title: 'SWD392 - SP26 - RE',
    description: 'Bộ 60 câu hỏi SWD392 kỳ SP26 RE về UML, COMET, mô hình hóa, kiến trúc phần mềm, cơ sở dữ liệu và design patterns.',
    category: 'Môn SWD392',
    badge: 'SWD392 SP26 RE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SP26_RE,
  },
  {
    id: 'swd392_su25_re',
    courseId: 'swd392',
    title: 'SWD392 - SU25 - RE',
    description: 'Bộ 60 câu hỏi SWD392 kỳ SU25 RE về UML, vòng đời phần mềm, phân tích thiết kế, subsystem, SOA và kiến trúc thành phần.',
    category: 'Môn SWD392',
    badge: 'SWD392 SU25 RE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SU25_RE,
  },
  {
    id: 'swd392_su26_fe_fuo',
    courseId: 'swd392',
    title: 'SWD392 - SU26 - FE_FUO',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam SU26 về UML, COMET, kiến trúc phần mềm, hệ phân tán, cơ sở dữ liệu và design patterns.',
    category: 'Môn SWD392',
    badge: 'SWD392 SU26 FE_FUO - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SU26_FE_FUO,
  },
  {
    id: 'swd392_su25_final_exam',
    courseId: 'swd392',
    title: 'SWD392_SU25_Final Exam',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam SU25 về mô hình hóa, UML, COMET, kiến trúc client/server, SOA và chất lượng phần mềm.',
    category: 'Môn SWD392',
    badge: 'SWD392 SU25 Final Exam - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SU25_FINAL_EXAM,
  },
  {
    id: 'swd392_fa25_feb5',
    courseId: 'swd392',
    title: 'SWD392 - FA25 - FEB5',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam B5 kỳ FA25 về UML, COMET, thiết kế subsystem, SOA, cơ sở dữ liệu và Software Product Line.',
    category: 'Môn SWD392',
    badge: 'SWD392 FA25 FEB5 - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_FA25_FEB5,
  },
  {
    id: 'swd392_sp2025_fe',
    courseId: 'swd392',
    title: 'SWD392 - SP 2025 - FE',
    description: 'Bộ 50 câu hỏi SWD392 Final Exam kỳ SP 2025 về UML, COMET, kiến trúc phần mềm, thiết kế hướng đối tượng, SOA và cơ sở dữ liệu.',
    category: 'Môn SWD392',
    badge: 'SWD392 SP 2025 FE - 50 câu',
    rawText: SAMPLE_QUIZ_SWD392_SP2025_FE,
  },
  {
    id: 'swd392_sp2024_fe',
    courseId: 'swd392',
    title: 'SWD392 - SP 2024 - FE',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam kỳ SP 2024 về UML, thiết kế hướng đối tượng, kiến trúc điều khiển, Software Product Line và cơ sở dữ liệu.',
    category: 'Môn SWD392',
    badge: 'SWD392 SP 2024 FE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SP2024_FE,
  },
  {
    id: 'swd392_su2024_fe',
    courseId: 'swd392',
    title: 'SWD392 - SU 2024 - FE',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam kỳ SU 2024 về UML, mô hình hóa, subsystem, hệ thời gian thực, bảo mật và chất lượng phần mềm.',
    category: 'Môn SWD392',
    badge: 'SWD392 SU 2024 FE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_SU2024_FE,
  },
  {
    id: 'swd392_fa2024_fe',
    courseId: 'swd392',
    title: 'SWD392 - FA 2024 - FE',
    description: 'Bộ 60 câu hỏi SWD392 Final Exam kỳ FA 2024 về UML, use case, kiến trúc phần mềm, thiết kế subsystem, SOA và cơ sở dữ liệu.',
    category: 'Môn SWD392',
    badge: 'SWD392 FA 2024 FE - 60 câu',
    rawText: SAMPLE_QUIZ_SWD392_FA2024_FE,
  },
  {
    id: 'mln111_full',
    courseId: 'mln111',
    title: 'MLN111',
    description: 'Bộ ngân hàng 556 câu hỏi trắc nghiệm Triết học Mác - Lênin tổng hợp chuẩn tiếng Việt có dấu.',
    category: 'Môn MLN111',
    badge: 'Đề chuẩn 556 câu',
    rawText: SAMPLE_QUIZ_MLN111_FULL,
  },
  {
    id: 'mln111_su26_c1fe',
    courseId: 'mln111',
    title: 'MLN111 - SU26 - C1FE',
    description: 'Bộ 60 câu hỏi trắc nghiệm Triết học Mác - Lênin Final Exam SU26 Ca 1.',
    category: 'Môn MLN111',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN111_SU26_C1FE,
  },
  {
    id: 'mln111_su26_c2fe',
    courseId: 'mln111',
    title: 'MLN111 - SU26 - C2FE',
    description: 'Bộ 60 câu hỏi trắc nghiệm Triết học Mác - Lênin Final Exam SU26 Ca 2.',
    category: 'Môn MLN111',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN111_SU26_C2FE,
  },
  {
    id: 'mln111_su26_re',
    courseId: 'mln111',
    title: 'MLN111 - SU26 - RE',
    description: 'Bộ 60 câu hỏi trắc nghiệm ôn tập Triết học Mác - Lênin kỳ SU26 RE.',
    category: 'Môn MLN111',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN111_SU26_RE,
  },
  {
    id: 'mln111_sp25_fe',
    courseId: 'mln111',
    title: 'MLN111 - SP25 - FE',
    description: 'Bộ 61 câu hỏi trắc nghiệm Triết học Mác - Lênin Final Exam SP25 chuẩn tiếng Việt có dấu.',
    category: 'Môn MLN111',
    badge: 'Đề chuẩn 61 câu',
    rawText: SAMPLE_QUIZ_MLN111_SP25_FE,
  },
  {
    id: 'mln111_sp25_re',
    courseId: 'mln111',
    title: 'MLN111 - SP25 - RE',
    description: 'Bộ 60 câu hỏi trắc nghiệm Triết học Mác - Lênin kỳ SP25 RE chuẩn tiếng Việt có dấu.',
    category: 'Môn MLN111',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN111_SP25_RE,
  },
  {
    id: 'mln111_su25_bl5_fe',
    courseId: 'mln111',
    title: 'MLN111_SU25_BL5_FE',
    description: 'Bộ 60 câu hỏi trắc nghiệm Triết học Mác - Lênin SU25 BL5 FE chuẩn tiếng Việt có dấu.',
    category: 'Môn MLN111',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN111_SU25_BL5_FE,
  },
  {
    id: 'mln122_full',
    courseId: 'mln122',
    title: 'MLN122',
    description: 'Bộ ngân hàng 510 câu hỏi trắc nghiệm Kinh tế chính trị Mác - Lênin tổng hợp chuẩn tiếng Việt có dấu.',
    category: 'Môn MLN122',
    badge: 'Đề chuẩn 510 câu',
    rawText: SAMPLE_QUIZ_MLN122_FULL,
  },
  {
    id: 'mln122_fa23_feb5',
    courseId: 'mln122',
    title: 'MLN122 - FA23 - FEB5',
    description: 'Bộ 60 câu hỏi trắc nghiệm Kinh tế chính trị Mác - Lênin FA23 FEB5 chuẩn tiếng Việt có dấu.',
    category: 'Môn MLN122',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN122_FA23_FEB5,
  },
  {
    id: 'mln122_sp26_c2fe',
    courseId: 'mln122',
    title: 'MLN122 - SP26 - C2FE',
    description: 'Bộ 60 câu hỏi trắc nghiệm Kinh tế chính trị Mác - Lênin SP26 Ca 2 chuẩn tiếng Việt có dấu.',
    category: 'Môn MLN122',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN122_SP26_C2FE,
  },
  {
    id: 'mln122_su26_fe_c1',
    courseId: 'mln122',
    title: 'MLN122 - SU26 - FE - C1',
    description: 'Bộ 60 câu hỏi trắc nghiệm Kinh tế chính trị Mác - Lênin SU26 Ca 1 chuẩn tiếng Việt có dấu.',
    category: 'Môn MLN122',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN122_SU26_FE_C1,
  },
  {
    id: 'mln122_su26_re',
    courseId: 'mln122',
    title: 'MLN122 - SU26 - RE',
    description: 'Bộ 60 câu hỏi trắc nghiệm Kinh tế chính trị Mác - Lênin kỳ SU26 RE chuẩn tiếng Việt có dấu.',
    category: 'Môn MLN122',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN122_SU26_RE,
  },
  {
    id: 'mln122_su25_b5_1',
    courseId: 'mln122',
    title: 'MLN122 - SU25 - B5 - 1',
    description: 'Bộ 60 câu hỏi trắc nghiệm Kinh tế chính trị Mác - Lênin SU25 B5 chuẩn tiếng Việt có dấu.',
    category: 'Môn MLN122',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN122_SU25_B5_1,
  },
  {
    id: 'mln122_su25_fe_c1_4330',
    courseId: 'mln122',
    title: 'MLN122_SU25_FE_C1_4330',
    description: 'Bộ 60 câu hỏi trắc nghiệm Kinh tế chính trị Mác - Lênin SU25 FE C1, mã đề 4330.',
    category: 'Môn MLN122',
    badge: 'Đề chuẩn 60 câu',
    rawText: SAMPLE_QUIZ_MLN122_SU25_FE_C1_4330,
  },
  {
    id: 'jpd123_pt1',
    courseId: 'jpd123',
    title: 'PT1',
    description: 'Bộ 35 câu hỏi chữ tiếng Nhật JPD123 PT1 (đã loại 1 ảnh trùng).',
    category: 'Môn JPD123',
    badge: 'JPD123 PT1 - 35 câu',
    rawText: SAMPLE_QUIZ_JPD123_PT1,
  },
  {
    id: 'jpd123_fa25_re_mc',
    courseId: 'jpd123',
    title: 'JPD123 - FA25 - RE - MC',
    description: 'Bộ 30 câu hỏi tiếng Nhật FA25 RE MC dạng chữ.',
    category: 'Môn JPD123',
    badge: 'FA25 RE MC - 30 câu',
    rawText: SAMPLE_QUIZ_JPD123_FA25_RE_MC,
  },
  {
    id: 'jpd123_sp26_c1fe',
    courseId: 'jpd123',
    title: 'JPD123 - SP26 - C1FE',
    description: 'Bộ 30 câu hỏi tiếng Nhật SP26 C1FE dạng chữ.',
    category: 'Môn JPD123',
    badge: 'SP26 C1FE - 30 câu',
    rawText: SAMPLE_QUIZ_JPD123_SP26_C1FE,
  },
  {
    id: 'jpd123_sp26_c2fe',
    courseId: 'jpd123',
    title: 'JPD123 - SP26 - C2FE',
    description: 'Bộ 31 câu hỏi tiếng Nhật SP26 C2FE dạng chữ.',
    category: 'Môn JPD123',
    badge: 'SP26 C2FE - 31 câu',
    rawText: SAMPLE_QUIZ_JPD123_SP26_C2FE,
  },
  {
    id: 'jpd123_su26_fe',
    courseId: 'jpd123',
    title: 'JPD123 - SU26 - FE',
    description: 'Bộ 30 câu hỏi tiếng Nhật SU26 FE dạng chữ.',
    category: 'Môn JPD123',
    badge: 'SU26 FE - 30 câu',
    rawText: SAMPLE_QUIZ_JPD123_SU26_FE,
  },
  {
    id: 'jpd123_su26_re',
    courseId: 'jpd123',
    title: 'JPD123 - SU26 - RE',
    description: 'Bộ 30 câu hỏi tiếng Nhật SU26 RE dạng chữ.',
    category: 'Môn JPD123',
    badge: 'SU26 RE - 30 câu',
    rawText: SAMPLE_QUIZ_JPD123_SU26_RE,
  },
];
