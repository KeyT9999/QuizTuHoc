import type { Question } from '../utils/quizParser';

export interface Mmk2KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

// IDs follow the source order in sampleQuizMMK2 and cover all 274 questions exactly once.
export const MMK2_KNOWLEDGE_GROUPS: Mmk2KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Quản trị học, Cơ cấu tổ chức, Kiểm soát & Lãnh đạo",
    summary: "Chức năng quản trị, chiến lược tổ chức, phân chia bộ phận, kiểm soát, động lực (Maslow, Expectancy) và phong cách lãnh đạo.",
    questionIds: [
      6, 8, 14, 22, 26, 27, 28, 29, 30, 31, 45, 53,
      54, 58, 66, 77, 78, 109, 118, 122, 123, 130, 143, 145,
      146, 147, 157, 158, 161, 179, 188, 192, 194, 197, 205, 211,
      213, 215, 227, 228, 235, 246, 258, 259, 260, 264,
    ],
  },
  {
    id: '2',
    number: 2,
    title: "Tổng quan Marketing, Chiến lược, Môi trường & CRM",
    summary: "Quy trình Marketing, triết lý & đạo đức Marketing, ma trận BCG, giá trị & sự hài lòng khách hàng, CRM và môi trường vi mô/vĩ mô.",
    questionIds: [
      5, 11, 13, 15, 25, 32, 43, 44, 49, 50, 57, 62,
      65, 71, 72, 94, 95, 112, 113, 117, 121, 128, 133, 134,
      139, 163, 168, 173, 177, 181, 183, 199, 202, 208, 216, 231,
      239, 244, 245, 247, 254, 263, 272,
    ],
  },
  {
    id: '3',
    number: 3,
    title: "Nghiên cứu Marketing, Big Data & Hành vi khách hàng",
    summary: "Hệ thống MIS, dữ liệu sơ cấp/thứ cấp, nghiên cứu dân tộc học, Big Data, hành vi mua người tiêu dùng (B2C) và doanh nghiệp (B2B).",
    questionIds: [
      21, 23, 24, 51, 60, 69, 70, 73, 89, 90, 91, 92,
      93, 98, 99, 100, 103, 107, 110, 115, 129, 135, 136, 138,
      140, 151, 153, 156, 159, 185, 186, 189, 196, 204, 207, 219,
      224, 230, 234, 238, 241, 250, 255, 266, 271,
    ],
  },
  {
    id: '4',
    number: 4,
    title: "Phân khúc, Thị trường mục tiêu & Định vị (STP)",
    summary: "Tiêu chí phân khúc thị trường, lựa chọn thị trường mục tiêu, chiến lược tạo khác biệt và định vị sản phẩm.",
    questionIds: [
      17, 18, 64, 74, 86, 104, 116, 124, 127, 132, 169, 170,
      175, 184, 191, 198, 203, 206, 222, 233, 240, 253, 265, 269,
    ],
  },
  {
    id: '5',
    number: 5,
    title: "Chiến lược Sản phẩm, Thương hiệu & Định giá (Product & Pricing)",
    summary: "Phân loại sản phẩm, dịch vụ, phát triển sản phẩm mới (NPD), vòng đời sản phẩm, chi phí và các chiến lược định giá.",
    questionIds: [
      3, 7, 19, 39, 40, 41, 42, 55, 61, 75, 82, 84,
      85, 87, 88, 96, 108, 114, 119, 125, 131, 141, 142, 148,
      154, 166, 171, 178, 180, 182, 193, 195, 200, 212, 214, 218,
      221, 232, 243, 248, 249, 251, 261, 262, 267, 270, 274,
    ],
  },
  {
    id: '6',
    number: 6,
    title: "Kênh phân phối & Chuỗi cung ứng (Place)",
    summary: "Trung gian marketing, thiết kế & chiều dài kênh, hệ thống VMS, xung đột kênh, phân phối chọn lọc/độc quyền và bán buôn/bán lẻ.",
    questionIds: [
      2, 9, 10, 12, 20, 34, 47, 59, 63, 68, 83, 97,
      149, 155, 167, 190, 201, 223, 252, 257,
    ],
  },
  {
    id: '7',
    number: 7,
    title: "Truyền thông Marketing, Quảng cáo & Bán hàng (Promotion)",
    summary: "Hỗn hợp xúc tiến, mô hình truyền thông IMC, quảng cáo, PR, tài trợ, khuyến mãi, bán hàng cá nhân và Direct/Digital Marketing.",
    questionIds: [
      1, 4, 16, 33, 35, 36, 37, 38, 46, 48, 52, 56,
      67, 76, 79, 80, 81, 101, 102, 105, 106, 111, 120, 126,
      137, 144, 150, 152, 160, 162, 164, 165, 172, 174, 176, 187,
      209, 210, 217, 220, 225, 226, 229, 236, 237, 242, 256, 268,
      273,
    ],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  MMK2_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getMMK2KnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '';
}

export function getMMK2QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!MMK2_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getMMK2KnowledgeGroupId(question) === groupId);
}
