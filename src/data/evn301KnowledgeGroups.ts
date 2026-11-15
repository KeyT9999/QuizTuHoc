import type { Question } from '../utils/quizParser';

export interface Evn301KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

// IDs follow sampleQuizEVN301.ts and cover every source question exactly once.
const EVN301_QUESTION_IDS_BY_GROUP: Record<string, readonly number[]> = {
  '1': [19, 22, 23, 24, 30, 54, 80, 88, 101, 106, 165, 171, 172, 173, 176, 177, 182, 216, 222, 263, 265, 268],
  '2': [48, 52, 53, 57, 61, 82, 90, 103, 113, 137, 144, 145, 147, 162, 175, 179, 215, 217, 223, 250, 256, 258, 267, 272],
  '3': [1, 8, 21, 27, 34, 36, 46, 72, 76, 78, 83, 96, 116, 131, 134, 141, 149, 163, 167, 178, 191, 199, 200, 202, 221, 232, 233, 234, 260, 271, 274, 275, 278],
  '4': [3, 4, 12, 28, 47, 49, 58, 70, 86, 87, 114, 119, 129, 132, 143, 153, 155, 161, 193, 226, 238, 239, 240, 241, 242, 243, 261, 270, 273, 277],
  '5': [13, 15, 20, 31, 43, 65, 66, 74, 75, 89, 104, 121, 126, 138, 166, 209, 210, 220, 225, 227, 266, 276, 279],
  '6': [6, 18, 25, 35, 55, 64, 81, 91, 95, 108, 122, 124, 127, 133, 136, 139, 146, 168, 187, 189, 190, 201, 203, 204, 205, 206, 208, 229, 230, 244, 254, 257, 259, 264],
  '7': [9, 17, 39, 40, 41, 44, 45, 60, 62, 77, 79, 84, 98, 99, 110, 118, 128, 142, 150, 158, 159, 186, 192, 198, 207, 214, 218, 228, 231, 245, 251, 252, 253, 262],
  '8': [7, 11, 32, 38, 63, 67, 71, 97, 111, 112, 120, 123, 148, 151, 154, 194, 195, 196, 235, 236, 237, 249, 269],
  '9': [2, 37, 56, 85, 92, 93, 94, 100, 107, 130, 140, 152, 157, 169, 170, 174, 180, 181, 211, 212, 213, 224, 248],
  '10': [5, 10, 14, 16, 26, 29, 33, 42, 50, 51, 59, 68, 69, 73, 102, 105, 109, 115, 117, 125, 135, 156, 160, 164, 183, 184, 185, 188, 197, 219, 246, 247, 255],
};

export const EVN301_KNOWLEDGE_GROUPS: Evn301KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Cơ sở & mô hình lập kế hoạch sự kiện",
    summary: "Khái niệm sự kiện, SWOT, Gantt, SCAMPER và các giai đoạn của quy trình lập kế hoạch.",
    questionIds: EVN301_QUESTION_IDS_BY_GROUP['1'],
  },
  {
    id: '2',
    number: 2,
    title: "Nghiên cứu, ý tưởng & tính khả thi",
    summary: "Nghiên cứu ban đầu, PEST, sự phù hợp với khách hàng, sàng lọc tính khả thi và kiểm thử ý tưởng.",
    questionIds: EVN301_QUESTION_IDS_BY_GROUP['2'],
  },
  {
    id: '3',
    number: 3,
    title: "Stakeholder, nhân sự & phối hợp nhóm",
    summary: "Phân tích bên liên quan, tuyển dụng, phân ca, brief tình nguyện viên, vai trò và phối hợp nhân sự.",
    questionIds: EVN301_QUESTION_IDS_BY_GROUP['3'],
  },
  {
    id: '4',
    number: 4,
    title: "Ngân sách, tài chính & nhà cung cấp",
    summary: "Ngân sách, dòng tiền, chi phí, chứng từ tài chính, đơn đặt hàng và quản lý quan hệ nhà cung cấp.",
    questionIds: EVN301_QUESTION_IDS_BY_GROUP['4'],
  },
  {
    id: '5',
    number: 5,
    title: "Địa điểm, khảo sát & bố trí mặt bằng",
    summary: "Chọn địa điểm, khảo sát hiện trường, luồng di chuyển, biển chỉ dẫn, khả năng tiếp cận và bãi đỗ xe.",
    questionIds: EVN301_QUESTION_IDS_BY_GROUP['5'],
  },
  {
    id: '6',
    number: 6,
    title: "Logistics, rủi ro & an toàn sự kiện",
    summary: "Kế hoạch dự phòng, điều phối logistics, quản lý đám đông, an toàn, ứng phó khẩn cấp và sự cố.",
    questionIds: EVN301_QUESTION_IDS_BY_GROUP['6'],
  },
  {
    id: '7',
    number: 7,
    title: "Sản xuất, vận hành & phục vụ trong ngày sự kiện",
    summary: "Lịch sản xuất, running order, setup, AV, quản lý sân khấu, đăng ký khách, phục vụ và diễn tập.",
    questionIds: EVN301_QUESTION_IDS_BY_GROUP['7'],
  },
  {
    id: '8',
    number: 8,
    title: "Marketing, quảng bá & bán vé",
    summary: "Kênh truyền thông, khuyến mãi, chuyển đổi, retargeting, khác biệt cạnh tranh và đo hiệu quả quảng cáo.",
    questionIds: EVN301_QUESTION_IDS_BY_GROUP['8'],
  },
  {
    id: '9',
    number: 9,
    title: "Trải nghiệm khách tham dự & loại hình sự kiện",
    summary: "Thiết kế trải nghiệm, chương trình, sự kiện hybrid/virtual, cảm giác cộng đồng và phân loại sự kiện.",
    questionIds: EVN301_QUESTION_IDS_BY_GROUP['9'],
  },
  {
    id: '10',
    number: 10,
    title: "Đánh giá, phản hồi & đo lường kết quả",
    summary: "Dữ liệu định tính/định lượng, khảo sát, phỏng vấn, benchmark, KPI, tổng kết và bài học sau sự kiện.",
    questionIds: EVN301_QUESTION_IDS_BY_GROUP['10'],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  EVN301_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getEvn301KnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '';
}

export function getEvn301QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!EVN301_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getEvn301KnowledgeGroupId(question) === groupId);
}
