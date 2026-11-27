import type { Question } from '../utils/quizParser';

export interface Bcj201cKnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

// IDs follow sampleQuizBCJ201cBaKhi.ts and cover all 203 unique questions exactly once.
const BCJ201C_QUESTION_IDS_BY_GROUP: Record<string, readonly number[]> = {
  '1': [1, 2, 3, 4, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 31, 35, 36, 127, 128, 159, 161, 162, 168, 193],
  '2': [5, 8, 9, 22, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 129, 130, 131, 132, 133, 134, 137, 138, 160, 172, 179, 180, 186, 188, 192, 196, 199, 202],
  '3': [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 122, 124, 125, 126, 139, 140, 141, 143, 155, 157, 158, 165, 173, 174, 175, 176, 177, 191, 195, 197, 203],
  '4': [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 120, 121, 123, 135, 136, 142, 153, 154, 182, 185],
  '5': [68, 69, 70, 71, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 95, 96, 97, 114, 115, 116, 117, 118, 119, 144, 145, 146, 147, 148, 149, 156, 163, 166, 167, 169, 170, 171, 184, 189, 194, 198, 201],
  '6': [66, 67, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 86, 94, 98, 99, 100, 101, 102, 103, 151, 152, 164, 178],
  '7': [104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 150, 181, 183, 187, 190, 200],
};

export const BCJ201C_KNOWLEDGE_GROUPS: Bcj201cKnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Bối cảnh Truyền thông Số, Khán giả & Brand Journalism",
    summary: "Cacophony, ad blockers, niche audience, narrowcasting, Liquid Modernity, phân mảnh khán giả, earned/owned media, báo chí thương hiệu, Inbound Marketing và content curation.",
    questionIds: BCJ201C_QUESTION_IDS_BY_GROUP['1'],
  },
  {
    id: '2',
    number: 2,
    title: "Branded Content, Storytelling, Transmedia & Gamification",
    summary: "Khác biệt Branded Content và quảng cáo truyền thống, cấu trúc câu chuyện (plot), kể chuyện đa nền tảng (Transmedia), virality, BCMA và ứng dụng Gamification / AR.",
    questionIds: BCJ201C_QUESTION_IDS_BY_GROUP['2'],
  },
  {
    id: '3',
    number: 3,
    title: "Bản sắc, Tính cách & Định vị Thương hiệu (Brand Identity)",
    summary: "4 trụ cột thương hiệu, Brand House, Brand Positioning Statement, Perceptual Map, 5 chiều tính cách thương hiệu, logo, style guides, bao bì, màu sắc và phân khúc hành vi.",
    questionIds: BCJ201C_QUESTION_IDS_BY_GROUP['3'],
  },
  {
    id: '4',
    number: 4,
    title: "Ý tưởng Sáng tạo, Creative Pitch, Sản xuất & Nhiếp ảnh",
    summary: "Mindmapping, word associations, Creative Advertising Concepts, mood board, creative pitch, production brief, look & feel, stylist và 9 câu hỏi phân tích ảnh/quảng cáo thực tế.",
    questionIds: BCJ201C_QUESTION_IDS_BY_GROUP['4'],
  },
  {
    id: '5',
    number: 5,
    title: "Hành trình Khách hàng, Điểm chạm & Thiết kế UX/CX",
    summary: "Các giai đoạn Customer Journey, Value Proposition Canvas, Brand Strategy Orphans, điểm chạm (touchpoints), UX vs CX, nguyên lý Pareto, Peak-End Rule và thiết kế giao diện số.",
    questionIds: BCJ201C_QUESTION_IDS_BY_GROUP['5'],
  },
  {
    id: '6',
    number: 6,
    title: "Đo lường CX Metrics, Call Center, Chatbot & Đạo đức Dữ liệu",
    summary: "CX Dashboards, mô hình Gartner & McKinsey, First Call Resolution, rủi ro Chatbot & AI dự đoán, thống kê mô tả, sai lầm nghiên cứu thị trường và đạo đức dữ liệu (Ethics Matters).",
    questionIds: BCJ201C_QUESTION_IDS_BY_GROUP['6'],
  },
  {
    id: '7',
    number: 7,
    title: "Thuê ngoài (Outsourcing) & Trải nghiệm Nhân viên (EX)",
    summary: "Lợi ích, rủi ro và cách giảm thiểu tác động tiêu cực khi thuê ngoài CX / nghiên cứu khách hàng; thiết kế Employee Experience (EX) gắn với chiến lược và đồng bộ thông điệp thương hiệu.",
    questionIds: BCJ201C_QUESTION_IDS_BY_GROUP['7'],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  BCJ201C_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getBcj201cKnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '1';
}

export function getBcj201cQuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!BCJ201C_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getBcj201cKnowledgeGroupId(question) === groupId);
}
