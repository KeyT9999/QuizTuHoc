import type { Question } from '../utils/quizParser';

export interface Vnr202KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

const VNR202_QUESTION_IDS_BY_GROUP: Record<string, readonly number[]> = {
  '1': [15, 28, 44, 47, 60, 66, 77, 78, 86, 90, 96, 98, 104, 115, 120, 136, 149, 156, 162, 174, 196, 197, 222, 237, 240, 241, 242, 245, 246, 247, 248, 249, 255, 257, 258, 259, 308, 316, 324, 325, 326, 347, 358, 390, 391, 401, 403, 407, 409, 410, 411, 413, 415, 429],
  '2': [1, 2, 3, 16, 23, 30, 39, 40, 41, 50, 57, 59, 64, 67, 73, 74, 75, 80, 81, 84, 107, 112, 116, 119, 121, 123, 124, 131, 135, 142, 145, 152, 158, 165, 167, 171, 172, 173, 179, 183, 186, 189, 192, 200, 202, 203, 204, 207, 209, 211, 217, 218, 219, 221, 224, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 250, 252, 253, 256, 267, 273, 331, 334, 341, 346, 349, 353, 366, 368, 375, 378, 393, 404, 405, 406, 426, 436],
  '3': [9, 12, 18, 19, 20, 25, 29, 31, 36, 61, 62, 68, 87, 89, 95, 111, 114, 118, 127, 134, 138, 141, 143, 147, 157, 164, 176, 177, 182, 184, 193, 199, 208, 215, 216, 238, 239, 261, 262, 263, 264, 265, 266, 268, 269, 271, 272, 274, 275, 276, 277, 278, 279, 282, 320, 327, 332, 335, 342, 351, 365, 367, 369, 374, 377, 385, 412, 417, 423],
  '4': [4, 8, 10, 24, 33, 35, 38, 49, 51, 52, 53, 55, 63, 65, 69, 83, 85, 93, 97, 101, 103, 126, 128, 146, 170, 178, 191, 198, 206, 260, 280, 288, 315, 318, 329, 333, 339, 343, 350, 352, 355, 356, 357, 362, 371, 372, 373, 389, 392, 394, 397, 398, 402, 420, 421, 424, 437, 438],
  '5': [45, 46, 70, 88, 99, 100, 113, 148, 187, 188, 214, 311, 337, 360, 383, 387, 418, 427, 435],
  '6': [56, 71, 76, 91, 92, 110, 125, 129, 137, 159, 163, 169, 180, 210, 220, 223, 283, 286, 297, 300, 302, 303, 307, 312, 313, 317, 321, 338, 340, 348, 354, 359, 370, 382, 388, 399, 422, 425],
  '7': [11, 13, 21, 26, 42, 58, 105, 108, 133, 140, 154, 168, 181, 190, 195, 290, 291, 292, 294, 296, 298, 305, 314, 319, 322, 323, 376, 379, 380, 381, 386, 430],
  '8': [5, 6, 7, 14, 17, 22, 27, 32, 34, 37, 43, 48, 54, 72, 79, 82, 94, 102, 106, 109, 117, 122, 130, 132, 139, 144, 150, 151, 153, 155, 160, 161, 166, 175, 185, 194, 201, 205, 212, 213, 225, 243, 244, 251, 254, 270, 281, 284, 285, 287, 289, 293, 295, 299, 301, 304, 306, 309, 310, 328, 330, 336, 344, 345, 361, 363, 364, 384, 395, 396, 400, 408, 414, 416, 419, 428, 431, 432, 433, 434, 439, 440],
};

export const VNR202_KNOWLEDGE_GROUPS: Vnr202KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Sự ra đời của Đảng & Cương lĩnh đầu tiên (1858 - 1930)",
    summary: "Bối cảnh lịch sử, phong trào yêu nước, Nguyễn Ái Quốc chuẩn bị về tư tưởng - chính trị - tổ chức, Hội nghị thành lập Đảng 2/1930 và Cương lĩnh chính trị đầu tiên.",
    questionIds: VNR202_QUESTION_IDS_BY_GROUP['1'],
  },
  {
    id: '2',
    number: 2,
    title: "Đấu tranh giành chính quyền (1930 - 1945)",
    summary: "Cao trào 1930-1931, Luận cương 10/1930, phong trào dân chủ 1936-1939, chuyển hướng chiến lược 1939-1941, Mặt trận Việt Minh và Cách mạng Tháng Tám 1945.",
    questionIds: VNR202_QUESTION_IDS_BY_GROUP['2'],
  },
  {
    id: '3',
    number: 3,
    title: "Xây dựng & bảo vệ chính quyền, Kháng chiến chống Pháp (1945 - 1954)",
    summary: "Chỉ thị Kháng chiến kiến quốc, đường lối kháng chiến toàn dân - toàn diện - trường kỳ, Đại hội II (1951), chiến dịch Điện Biên Phủ và Hiệp định Giơ-ne-vơ 1954.",
    questionIds: VNR202_QUESTION_IDS_BY_GROUP['3'],
  },
  {
    id: '4',
    number: 4,
    title: "Kháng chiến chống Mỹ, cứu nước & Xây dựng CNXH ở miền Bắc (1954 - 1975)",
    summary: "Nghị quyết Trung ương 15, phong trào Đồng Khởi, Đại hội III (1960), đánh bại các chiến lược chiến tranh của Mỹ, Hiệp định Paris 1973 và Đại thắng mùa Xuân 1975.",
    questionIds: VNR202_QUESTION_IDS_BY_GROUP['4'],
  },
  {
    id: '5',
    number: 5,
    title: "Cả nước quá độ lên CNXH & Bước đầu tìm tòi đổi mới (1975 - 1986)",
    summary: "Hoàn thành thống nhất đất nước về mặt nhà nước, Đại hội IV (1976), Đại hội V (1982), các bước đột phá đổi mới kinh tế (Chỉ thị 100, Nghị quyết TW 8 khóa V).",
    questionIds: VNR202_QUESTION_IDS_BY_GROUP['5'],
  },
  {
    id: '6',
    number: 6,
    title: "Khởi xướng & Đẩy mạnh công cuộc Đổi mới, CNH-HĐH (1986 - 2006)",
    summary: "Đại hội VI (1986), Đại hội VII & Cương lĩnh 1991, Đại hội VIII (1996), Đại hội IX (2001) và quá trình chuyển sang kinh tế thị trường định hướng XHCN.",
    questionIds: VNR202_QUESTION_IDS_BY_GROUP['6'],
  },
  {
    id: '7',
    number: 7,
    title: "Hội nhập quốc tế sâu rộng & Phát triển toàn diện (2006 - nay)",
    summary: "Đại hội X (2006), Cương lĩnh bổ sung phát triển 2011 (Đại hội XI), Đại hội XII (2016), Đại hội XIII (2021), hội nhập WTO và các chiến lược phát triển mới.",
    questionIds: VNR202_QUESTION_IDS_BY_GROUP['7'],
  },
  {
    id: '8',
    number: 8,
    title: "Xây dựng Đảng, Nhà nước pháp quyền, Văn hóa & Đối ngoại",
    summary: "Hệ thống chính trị, xây dựng và chỉnh đốn Đảng, Mặt trận Tổ quốc, chính sách văn hóa - xã hội, quốc phòng - an ninh và đường lối đối ngoại thời kỳ đổi mới.",
    questionIds: VNR202_QUESTION_IDS_BY_GROUP['8'],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  VNR202_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getVnr202KnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '8';
}

export function getVnr202QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!VNR202_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getVnr202KnowledgeGroupId(question) === groupId);
}
