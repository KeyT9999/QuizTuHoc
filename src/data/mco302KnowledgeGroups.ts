import type { Question } from '../utils/quizParser';

export interface Mco302KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

const MCO302_QUESTION_IDS_BY_GROUP: Record<string, readonly number[]> = {
  '1': [1, 3, 4, 53, 99, 100, 101, 175, 183, 197, 236, 247, 279, 282],
  '2': [9, 10, 11, 12, 13, 15, 24, 55, 56, 57, 60, 61, 62, 87, 94, 96, 105, 106, 109, 110, 118, 148, 150, 153, 154, 161, 164, 167, 168, 191, 196, 203, 204, 206, 244, 254, 257, 259, 272, 276, 285],
  '3': [14, 16, 17, 39, 64, 65, 66, 113, 114, 115, 162, 179, 189, 192, 198, 201, 208, 209, 210, 258, 261, 275],
  '4': [6, 20, 21, 22, 51, 52, 68, 69, 76, 112, 116, 117, 119, 120, 157, 178, 194, 211, 213, 214, 215, 248, 264, 269, 277, 281],
  '5': [25, 26, 58, 67, 72, 73, 74, 75, 121, 122, 123, 124, 151, 160, 177, 202, 216, 217, 218, 219, 234, 253, 256, 260, 270],
  '6': [5, 8, 23, 27, 28, 29, 43, 50, 63, 77, 78, 79, 103, 104, 107, 111, 125, 126, 127, 128, 166, 176, 181, 184, 186, 193, 220, 221, 222, 268],
  '7': [2, 7, 18, 19, 30, 32, 33, 80, 81, 82, 83, 98, 129, 130, 131, 152, 170, 173, 182, 185, 188, 212, 224, 230, 237, 238, 255, 267, 278, 280],
  '8': [34, 35, 36, 37, 84, 85, 86, 132, 133, 134, 135, 156, 158, 163, 169, 171, 172, 225, 226, 239, 240, 246, 249, 252, 263, 265],
  '9': [38, 40, 41, 42, 44, 45, 54, 88, 89, 90, 91, 95, 97, 102, 108, 136, 137, 138, 140, 141, 142, 143, 146, 149, 155, 159, 165, 174, 180, 187, 190, 199, 205, 227, 228, 229, 231, 232, 235, 241, 242, 250, 251, 262, 266, 271, 274],
  '10': [31, 46, 47, 48, 49, 59, 70, 71, 92, 93, 139, 144, 145, 147, 195, 200, 207, 223, 233, 243, 245, 273, 283, 284],
};

export const MCO302_KNOWLEDGE_GROUPS: Mco302KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Các mệnh lệnh, Công nghệ & Toàn cầu hóa",
    summary: "6 mệnh lệnh giao tiếp liên văn hóa (Technological, Demographic, Economic, Peace, Self-Awareness, Ethical), tiếp cận công nghệ và toàn cầu hóa.",
    questionIds: MCO302_QUESTION_IDS_BY_GROUP['1'],
  },
  {
    id: '2',
    number: 2,
    title: "Văn hóa, Quyền lực, Hệ giá trị & 3 Hướng tiếp cận",
    summary: "Ba hướng tiếp cận (Social Science, Interpretive, Critical), tư duy biện chứng (Dialectics), hệ giá trị Hofstede / Kluckhohn & Strodtbeck, bối cảnh và quyền lực.",
    questionIds: MCO302_QUESTION_IDS_BY_GROUP['2'],
  },
  {
    id: '3',
    number: 3,
    title: "Lịch sử, Ký ức & Giao tiếp Liên văn hóa",
    summary: "Lịch sử gia đình, quốc gia, văn hóa, xã hội (Hidden Histories, Grand Narrative), giả thuyết tiếp xúc (Contact Hypothesis) và tác động của lịch sử.",
    questionIds: MCO302_QUESTION_IDS_BY_GROUP['3'],
  },
  {
    id: '4',
    number: 4,
    title: "Bản sắc Văn hóa, Khuôn mẫu & Định kiến Xã hội",
    summary: "Sự hình thành bản sắc (Majority, Minority, Multicultural, Ethnic, Racial, Gender, Age, Class), Whiteness, Interpellation, Stereotypes, Prejudice và Discrimination.",
    questionIds: MCO302_QUESTION_IDS_BY_GROUP['4'],
  },
  {
    id: '5',
    number: 5,
    title: "Ngôn ngữ, Phong cách Giao tiếp & Dịch thuật",
    summary: "Ký hiệu học, Sapir-Whorf / Nominalist / Relativist, giao tiếp High/Low-context, Direct/Indirect, Code-switching, chính sách ngôn ngữ và tương đương dịch thuật.",
    questionIds: MCO302_QUESTION_IDS_BY_GROUP['5'],
  },
  {
    id: '6',
    number: 6,
    title: "Giao tiếp Phi ngôn từ & Không gian Văn hóa",
    summary: "Proxemics (4 vùng khoảng cách), Kinesics, Chronemics (Monochronic/Polychronic), Paralinguistics, Expectancy Violations và Không gian văn hóa (Cultural Space, Cyberspace).",
    questionIds: MCO302_QUESTION_IDS_BY_GROUP['6'],
  },
  {
    id: '7',
    number: 7,
    title: "Di cư, Chuyển dịch & Thích nghi Văn hóa",
    summary: "Các nhóm di cư (Migrants, Sojourners, Expatriates, Refugees), 4 mô hình Assimilation / Separation / Integration / Marginalization, U-Curve, W-Curve và Culture Shock.",
    questionIds: MCO302_QUESTION_IDS_BY_GROUP['7'],
  },
  {
    id: '8',
    number: 8,
    title: "Văn hóa Đại chúng, Truyền thông & Đế quốc Văn hóa",
    summary: "Đặc trưng Popular Culture vs. Folk/High Culture, công nghiệp văn hóa, đại diện truyền thông, chủ nghĩa đế quốc văn hóa / điện tử (Cultural & Electronic Colonialism).",
    questionIds: MCO302_QUESTION_IDS_BY_GROUP['8'],
  },
  {
    id: '9',
    number: 9,
    title: "Quan hệ Liên văn hóa & Quản trị Xung đột",
    summary: "Quan hệ bạn bè/lãng mạn liên văn hóa, 4 kiểu tương tác, định hướng xung đột, 5 phong cách giải quyết xung đột, Facework và Hòa giải (Mediation).",
    questionIds: MCO302_QUESTION_IDS_BY_GROUP['9'],
  },
  {
    id: '10',
    number: 10,
    title: "Năng lực Liên văn hóa, Bối cảnh Ứng dụng & Công bằng Xã hội",
    summary: "Thành tố năng lực liên văn hóa (Motivation, Knowledge, Attitudes, Skills), ứng dụng trong Y tế / Đa văn hóa, Liên minh (Alliances) và Công bằng xã hội.",
    questionIds: MCO302_QUESTION_IDS_BY_GROUP['10'],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  MCO302_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getMco302KnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '2';
}

export function getMco302QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!MCO302_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getMco302KnowledgeGroupId(question) === groupId);
}
