import type { Question } from '../utils/quizParser';

export interface Ssa2KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

// IDs follow the source order in sampleQuizSSA2 and cover all 251 questions exactly once.
export const SSA2_KNOWLEDGE_GROUPS: Ssa2KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Tư duy phân tích, sáng tạo & Giải quyết vấn đề",
    summary: "Phân tích vấn đề, tư duy sáng tạo, quy trình giải quyết vấn đề Polya, Design Thinking và ứng dụng học tập.",
    questionIds: [
      1, 2, 3, 4, 8, 9, 10, 11, 23, 24, 25, 26,
      43, 44, 50, 52, 60, 61, 66, 67, 74, 75, 76, 85,
      88, 92, 97, 108, 109, 110, 118, 119, 126, 129, 132, 134,
      141, 142, 154, 167, 182, 191, 202, 210, 212, 225, 226, 233,
      246,
    ],
  },
  {
    id: '2',
    number: 2,
    title: "Tư duy phản biện, Lập luận & Đánh giá bằng chứng",
    summary: "Nhận diện luận điểm, tiền đề, kết luận, giả định ẩn, tư duy hệ thống, thiên kiến và lập luận học thuật.",
    questionIds: [
      36, 37, 42, 51, 56, 57, 100, 114, 128, 150, 151, 153,
      159, 163, 169, 176, 177, 185, 187, 192, 195, 199, 214, 217,
      245,
    ],
  },
  {
    id: '3',
    number: 3,
    title: "Quản lý thời gian, Mục tiêu & Chiến lược học tập",
    summary: "Lập kế hoạch, ưu tiên công việc, chống trì hoãn, trí nhớ, luyện truy hồi, siêu nhận thức và ôn thi hiệu quả.",
    questionIds: [
      12, 13, 14, 15, 16, 17, 21, 27, 28, 29, 30, 31,
      32, 41, 46, 47, 53, 59, 68, 69, 70, 77, 78, 79,
      80, 81, 86, 87, 90, 91, 94, 95, 96, 105, 106, 107,
      113, 115, 116, 117, 120, 121, 122, 131, 133, 135, 136, 138,
      148, 152, 160, 174, 190, 221, 247, 248, 249, 250,
    ],
  },
  {
    id: '4',
    number: 4,
    title: "Năng lực thông tin, Nghiên cứu & Đánh giá nguồn",
    summary: "Tìm kiếm từ khóa, phân biệt nguồn sơ cấp/thứ cấp, hồ sơ học thuật và kiểm chứng độ tin cậy của tài liệu.",
    questionIds: [
      5, 6, 7, 45, 62, 63, 82, 83, 127, 157, 162, 171,
      173, 180, 189, 196, 200, 201, 203, 204, 205, 218, 228, 229,
      241,
    ],
  },
  {
    id: '5',
    number: 5,
    title: "Liêm chính học thuật, Trích dẫn & Văn hóa Đại học",
    summary: "Giá trị cốt lõi của văn hóa đại học, phòng tránh đạo văn, diễn đạt lại (paraphrasing), trích dẫn và bản quyền.",
    questionIds: [
      84, 98, 149, 155, 161, 164, 168, 172, 178, 181, 183, 186,
      194, 197, 206, 211, 222, 230, 235, 237, 238, 240, 244,
    ],
  },
  {
    id: '6',
    number: 6,
    title: "AI có trách nhiệm & Năng lực số",
    summary: "Hiểu biết về AI (AI literacy), đạo đức dùng AI, quản lý tệp tin, bảo mật số và mạng lưới học tập cá nhân.",
    questionIds: [
      18, 33, 34, 35, 38, 39, 40, 54, 55, 58, 64, 71,
      72, 99, 103, 104, 111, 112, 123, 124, 125, 144, 145, 146,
      158, 184, 198, 213, 219, 231, 243,
    ],
  },
  {
    id: '7',
    number: 7,
    title: "Viết học thuật, Đọc hiểu, Ghi chép & Thuyết trình",
    summary: "Cấu trúc bài luận, tính mạch lạc, chiến lược đọc 3 bước, ghi chép bài giảng, thuyết trình và công cụ trực quan.",
    questionIds: [
      156, 165, 166, 179, 188, 207, 209, 215, 223, 224, 227, 232,
      234, 236, 242, 251,
    ],
  },
  {
    id: '8',
    number: 8,
    title: "Giao tiếp, Làm việc nhóm & Thích nghi Đại học",
    summary: "Kỹ năng giao tiếp học thuật, lắng nghe chủ động, email chuyên nghiệp, lãnh đạo nhóm và thích nghi đại học.",
    questionIds: [
      19, 20, 22, 48, 49, 65, 73, 89, 93, 101, 102, 130,
      137, 139, 140, 143, 147, 170, 175, 193, 208, 216, 220, 239,
    ],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  SSA2_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getSSA2KnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '';
}

export function getSSA2QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!SSA2_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getSSA2KnowledgeGroupId(question) === groupId);
}
