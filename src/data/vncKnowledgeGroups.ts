import type { Question } from '../utils/quizParser';

export interface VncKnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

// IDs follow the source order in sampleQuizVNC and cover all 498 questions exactly once.
export const VNC_KNOWLEDGE_GROUPS: VncKnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Địa lý, khí hậu & vùng miền",
    summary: "Vị trí, địa hình, khí hậu, sông ngòi, biên giới, quần đảo và các vùng văn hóa địa lý.",
    questionIds: [
      2, 3, 57, 68, 74, 83, 113, 134, 153, 181, 204, 205,
      209, 210, 211, 213, 218, 365, 382, 412, 417, 418, 419, 443,
      467, 491,
    ],
  },
  {
    id: '2',
    number: 2,
    title: "Dân tộc, cư dân & ngôn ngữ",
    summary: "Các tộc người, cộng đồng cư dân, tiếng Việt, chữ viết, âm điệu và phân bố dân cư.",
    questionIds: [
      4, 7, 22, 61, 70, 106, 108, 117, 146, 147, 151, 176,
      191, 203, 208, 217, 230, 241, 360, 420,
    ],
  },
  {
    id: '3',
    number: 3,
    title: "Lịch sử, triều đại & phát triển quốc gia",
    summary: "Nhà nước và triều đại, các thời kỳ lịch sử, chiến tranh, thuộc địa, độc lập và thay đổi chính trị.",
    questionIds: [
      10, 11, 12, 13, 14, 40, 59, 72, 76, 85, 91, 99,
      119, 121, 122, 126, 130, 137, 139, 143, 155, 170, 173, 190,
      206, 207, 221, 222, 223, 225, 226, 227, 229, 231, 234, 236,
      239, 243, 244, 248, 250, 256, 259, 261, 265, 266, 267, 269,
      271, 272, 274, 275, 344, 364, 366, 371, 376, 377, 421, 422,
      426, 444, 448, 464, 465, 488,
    ],
  },
  {
    id: '4',
    number: 4,
    title: "Tôn giáo, tín ngưỡng & triết học",
    summary: "Phật giáo, Nho giáo, Đạo giáo, Kitô giáo, tín ngưỡng dân gian và các hệ tư tưởng.",
    questionIds: [
      1, 16, 17, 18, 19, 41, 53, 75, 84, 96, 110, 120,
      129, 138, 149, 154, 158, 164, 165, 166, 168, 169, 178, 192,
      199, 220, 224, 251, 253, 254, 255, 264, 277, 278, 279, 280,
      281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292,
      293, 295, 296, 298, 299, 300, 302, 303, 329, 331, 356, 358,
      359, 362, 368, 372, 378, 430, 445, 451, 453, 468, 475, 479,
      480, 483, 485, 498,
    ],
  },
  {
    id: '5',
    number: 5,
    title: "Gia đình, họ hàng & quan hệ xã hội",
    summary: "Quan hệ thân tộc, hôn nhân, vai trò giới, gia tộc và cấu trúc gia đình.",
    questionIds: [
      6, 44, 60, 62, 102, 103, 118, 133, 145, 167, 186, 326,
      327, 332, 333, 334, 335, 337, 338, 339, 340, 341, 342, 343,
      347, 348, 351, 352, 353, 452, 496, 497,
    ],
  },
  {
    id: '6',
    number: 6,
    title: "Phong tục, lễ hội, lịch & phép ứng xử",
    summary: "Tết, lễ hội, nghi lễ, lịch truyền thống, tập quán và quy tắc ứng xử.",
    questionIds: [
      35, 36, 39, 43, 45, 47, 56, 73, 77, 89, 92, 93,
      105, 114, 115, 116, 128, 136, 144, 150, 162, 187, 188, 197,
      216, 219, 245, 273, 301, 306, 320, 328, 330, 336, 374, 392,
      395, 396, 399, 400, 402, 403, 423, 438, 439, 440, 441, 447,
      457, 478, 489, 493,
    ],
  },
  {
    id: '7',
    number: 7,
    title: "Ẩm thực, món ăn & văn hóa bàn ăn",
    summary: "Nguyên liệu, món ăn, đồ uống, cách chế biến và phép tắc trong bữa ăn.",
    questionIds: [
      33, 34, 37, 51, 52, 71, 90, 95, 98, 104, 107, 174,
      202, 318, 319, 321, 322, 323, 324, 325, 370, 385, 387, 388,
      389, 397, 404, 407, 408, 415, 424, 431, 432, 433, 436, 458,
      461, 476, 484, 494,
    ],
  },
  {
    id: '8',
    number: 8,
    title: "Nghệ thuật, kiến trúc & nghề thủ công",
    summary: "Âm nhạc, biểu diễn, kiến trúc, hội họa, gốm, sơn mài và làng nghề.",
    questionIds: [
      25, 26, 27, 28, 29, 30, 31, 32, 48, 49, 50, 63,
      65, 67, 69, 78, 80, 86, 88, 94, 100, 101, 109, 112,
      123, 142, 148, 152, 159, 163, 171, 172, 177, 179, 180, 184,
      196, 198, 200, 201, 228, 297, 355, 361, 363, 367, 369, 375,
      384, 386, 393, 394, 401, 409, 410, 411, 413, 416, 427, 428,
      429, 442, 455, 456, 462, 466, 473, 474, 477, 490, 495,
    ],
  },
  {
    id: '9',
    number: 9,
    title: "Văn học, giáo dục & báo chí",
    summary: "Tác phẩm, tác giả, chữ viết trong văn học, trường học, khoa cử, báo chí và xuất bản.",
    questionIds: [
      8, 20, 21, 23, 24, 54, 55, 64, 66, 79, 82, 97,
      111, 124, 132, 135, 140, 141, 156, 160, 161, 175, 182, 183,
      185, 193, 252, 270, 304, 305, 308, 310, 312, 313, 314, 315,
      317, 380, 381, 383, 391, 405, 406, 425, 446, 454, 460, 463,
      469, 471, 472, 482, 486, 487, 492,
    ],
  },
  {
    id: '10',
    number: 10,
    title: "Nền tảng văn hóa & di sản",
    summary: "Các nền văn hóa khảo cổ, bản sắc, giao lưu văn hóa, vùng văn hóa và di sản.",
    questionIds: [
      9, 87, 194, 195, 212, 214, 215, 232, 233, 235, 237, 238,
      240, 242, 246, 247, 257, 258, 260, 262, 263, 268, 276, 294,
      316, 349, 350, 354, 437, 481,
    ],
  },
  {
    id: '11',
    number: 11,
    title: "Xã hội hiện đại, kinh tế & đời sống công cộng",
    summary: "Đời sống xã hội đương đại, phát triển kinh tế, chính sách, công nghiệp hóa và toàn cầu hóa.",
    questionIds: [
      15, 42, 46, 58, 81, 131, 157, 345, 346, 373, 435, 449,
      459, 470,
    ],
  },
  {
    id: '12',
    number: 12,
    title: "Tổng hợp kiến thức về Việt Nam",
    summary: "Câu hỏi tổng hợp hoặc dữ kiện không thuộc riêng một chủ đề lớn.",
    questionIds: [
      5, 38, 125, 127, 189, 249, 307, 309, 311, 357, 379, 390,
      398, 414, 434, 450,
    ],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  VNC_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getVNCKnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '';
}

export function getVNCQuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!VNC_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getVNCKnowledgeGroupId(question) === groupId);
}
