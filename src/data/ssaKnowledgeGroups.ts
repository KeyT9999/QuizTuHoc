import type { Question } from '../utils/quizParser';

export interface SsaKnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

// IDs follow the source order in sampleQuizSSA and cover all 153 questions exactly once.
export const SSA_KNOWLEDGE_GROUPS: SsaKnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Tư duy phân tích, phản biện & giải quyết vấn đề",
    summary: "Luyện phân tích, tư duy phản biện, sáng tạo, nhận diện vấn đề và chọn cách giải quyết có căn cứ.",
    questionIds: [
      1, 2, 3, 4, 14, 15, 17, 21, 22, 26, 29, 37,
      38, 39, 40, 41, 46, 47, 51, 59, 62, 63, 65, 69,
      73, 74, 75, 76, 77, 78, 81, 82, 88, 89, 91, 92,
      94, 95, 96, 99, 116, 117, 127, 128, 129, 130, 144, 145,
      146, 147, 152,
    ],
  },
  {
    id: '2',
    number: 2,
    title: "Quản lý thời gian, ưu tiên & mục tiêu",
    summary: "Lập lịch, dùng planner, ưu tiên việc quan trọng, đặt mục tiêu và giảm trì hoãn.",
    questionIds: [
      5, 6, 7, 8, 9, 23, 24, 45, 53, 72, 100, 101,
      102, 103, 107, 123,
    ],
  },
  {
    id: '3',
    number: 3,
    title: "Chiến lược học tập, trí nhớ & siêu nhận thức",
    summary: "Cách học chủ động, ghi nhớ, luyện truy hồi, tự đánh giá và điều chỉnh chiến lược học.",
    questionIds: [
      16, 19, 20, 25, 34, 35, 36, 48, 49, 50, 52, 54,
      55, 66, 83, 90, 97, 105, 106, 108, 109, 110, 113, 132,
      133, 134, 135, 136, 138, 139, 153,
    ],
  },
  {
    id: '4',
    number: 4,
    title: "Năng lực thông tin, nghiên cứu & kỹ năng số",
    summary: "Tìm kiếm, kiểm chứng nguồn, hiểu năng lực số và đánh giá thông tin/AI.",
    questionIds: [
      10, 11, 32, 33, 61, 67, 79, 80, 85, 86, 87, 115,
      119, 120, 131, 142, 148, 149, 150,
    ],
  },
  {
    id: '5',
    number: 5,
    title: "Liêm chính học thuật & AI có trách nhiệm",
    summary: "Đạo văn, diễn đạt lại, sử dụng AI minh bạch, quyền riêng tư và công bằng trong đánh giá.",
    questionIds: [
      12, 27, 28, 42, 43, 56, 57, 58, 64, 68, 93, 98,
      124, 140, 141, 143,
    ],
  },
  {
    id: '6',
    number: 6,
    title: "Giao tiếp, kết nối & thích nghi đại học",
    summary: "Giao tiếp, lắng nghe, làm việc với cộng đồng học tập và tìm hỗ trợ khi chuyển tiếp lên đại học.",
    questionIds: [
      13, 18, 30, 31, 44, 60, 70, 71, 84, 104, 111, 112,
      114, 118, 121, 122, 125, 126, 137, 151,
    ],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  SSA_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getSSAKnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '';
}

export function getSSAQuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!SSA_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getSSAKnowledgeGroupId(question) === groupId);
}
