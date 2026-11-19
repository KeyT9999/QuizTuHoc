import type { Question } from '../utils/quizParser';

export interface DpfKnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

// IDs follow the source order in sampleQuizDPF and cover all 183 questions exactly once.
export const DPF_KNOWLEDGE_GROUPS: DpfKnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Quản trị học, Cơ cấu tổ chức & Lãnh đạo",
    summary: "Chức năng quản trị, phân chia bộ phận, công nghệ Woodward, tổ chức cao/phẳng, quyền lực và phong cách lãnh đạo.",
    questionIds: [
      6, 8, 14, 22, 26, 27, 28, 29, 30, 31, 45, 53,
      54, 58, 66, 77, 78,
    ],
  },
  {
    id: '2',
    number: 2,
    title: "Tổng quan Marketing, Môi trường & CRM",
    summary: "Quy trình 5 bước Marketing, triết lý Marketing, giá trị & sự hài lòng khách hàng, CRM, môi trường vi mô và vĩ mô.",
    questionIds: [
      5, 11, 13, 15, 25, 32, 43, 44, 49, 50, 57, 62,
      65, 71, 72, 94, 95, 102, 103, 104, 105, 131, 132, 142,
      163, 181,
    ],
  },
  {
    id: '3',
    number: 3,
    title: "Nghiên cứu Marketing & Hành vi khách hàng (B2C & B2B)",
    summary: "Hệ thống thông tin MIS, dữ liệu sơ cấp/thứ cấp, nghiên cứu dân tộc học, hành vi người tiêu dùng và thị trường doanh nghiệp.",
    questionIds: [
      21, 23, 24, 51, 60, 69, 70, 73, 89, 90, 91, 92,
      93, 98, 99, 101, 111, 113, 155, 156, 157, 159, 160, 167,
      168, 169, 170, 171, 172, 173, 174, 175, 176, 178, 179, 180,
    ],
  },
  {
    id: '4',
    number: 4,
    title: "Phân khúc, Thị trường mục tiêu & Định vị (STP)",
    summary: "Tiêu chí phân khúc thị trường, chiến lược chọn thị trường mục tiêu, tạo khác biệt và định vị sản phẩm.",
    questionIds: [
      17, 18, 64, 74, 86, 106, 110, 112, 114, 115, 125, 129,
      138, 139, 140, 166, 177,
    ],
  },
  {
    id: '5',
    number: 5,
    title: "Chiến lược Sản phẩm & Định giá (Product & Pricing)",
    summary: "Phân loại sản phẩm, cấp độ sản phẩm, phát triển sản phẩm mới (NPD), vòng đời sản phẩm và các chiến lược định giá.",
    questionIds: [
      3, 7, 19, 39, 40, 41, 42, 55, 61, 75, 82, 84,
      85, 87, 88, 96, 108, 109, 119, 124, 126, 127, 128, 133,
      134, 135, 137, 141, 151, 152, 153, 154, 158, 161, 162, 164,
      165, 182,
    ],
  },
  {
    id: '6',
    number: 6,
    title: "Kênh phân phối & Chuỗi cung ứng (Place)",
    summary: "Trung gian marketing, chiều dài kênh, hệ thống VMS, xung đột kênh, phân phối đại trà/chọn lọc/độc quyền và chuỗi cung ứng.",
    questionIds: [
      2, 9, 10, 12, 20, 34, 47, 59, 63, 68, 83, 97,
      100, 150, 183,
    ],
  },
  {
    id: '7',
    number: 7,
    title: "Truyền thông Marketing, Quảng cáo & Bán hàng (Promotion)",
    summary: "Hỗn hợp xúc tiến, mô hình truyền thông IMC, quảng cáo, PR, khuyến mãi, bán hàng cá nhân và Direct/Digital Marketing.",
    questionIds: [
      1, 4, 16, 33, 35, 36, 37, 38, 46, 48, 52, 56,
      67, 76, 79, 80, 81, 107, 116, 117, 118, 120, 121, 122,
      123, 130, 136, 143, 144, 145, 146, 147, 148, 149,
    ],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  DPF_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getDPFKnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '';
}

export function getDPFQuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!DPF_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getDPFKnowledgeGroupId(question) === groupId);
}
