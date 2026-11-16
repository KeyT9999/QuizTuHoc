import type { Question } from '../utils/quizParser';

export interface Mln131KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

const MLN131_QUESTION_IDS_BY_GROUP: Record<string, readonly number[]> = {
  '1': [10, 39, 117, 216, 232, 262, 344, 363, 400],
  '2': [5, 13, 15, 23, 27, 29, 31, 33, 53, 54, 68, 69, 74, 81, 85, 92, 109, 112, 122, 128, 131, 136, 143, 170, 171, 174, 175, 177, 193, 211, 212, 217, 229, 245, 247, 254, 263, 280, 284, 291, 297, 302, 308, 309, 321, 327, 330, 336, 348, 357, 366, 377, 378, 389, 397, 403, 404, 410, 413, 418, 424, 445, 446, 447, 452, 458, 461, 463],
  '3': [2, 4, 17, 21, 28, 30, 32, 37, 38, 43, 44, 49, 67, 77, 78, 79, 82, 83, 84, 88, 91, 101, 103, 107, 110, 113, 114, 119, 120, 121, 124, 129, 130, 134, 135, 163, 164, 165, 166, 168, 169, 172, 173, 178, 179, 184, 188, 192, 202, 208, 209, 213, 214, 222, 223, 227, 235, 237, 240, 264, 271, 277, 281, 294, 300, 301, 305, 306, 319, 323, 329, 335, 337, 340, 341, 346, 373, 374, 385, 392, 399, 408, 415, 426, 431, 432, 434, 441, 454],
  '4': [18, 20, 35, 40, 47, 60, 64, 65, 73, 86, 89, 105, 123, 125, 127, 139, 145, 155, 158, 176, 189, 195, 197, 199, 201, 203, 226, 228, 231, 236, 239, 244, 246, 250, 258, 270, 276, 279, 282, 296, 311, 313, 315, 320, 324, 331, 343, 352, 354, 355, 365, 369, 372, 376, 407, 412, 420, 422, 427, 429, 437, 443, 449, 459, 464],
  '5': [8, 12, 22, 25, 41, 45, 59, 70, 72, 90, 95, 96, 99, 115, 126, 133, 137, 138, 144, 157, 181, 185, 187, 196, 198, 206, 207, 210, 215, 219, 220, 241, 248, 252, 260, 265, 278, 283, 290, 307, 316, 318, 326, 333, 368, 390, 405, 409, 416, 430, 439, 442, 448, 453, 460, 462],
  '6': [1, 6, 7, 9, 11, 14, 19, 34, 36, 46, 50, 51, 57, 61, 66, 75, 76, 80, 87, 94, 98, 102, 106, 108, 111, 140, 142, 147, 148, 149, 150, 152, 154, 156, 159, 160, 161, 167, 182, 183, 186, 190, 191, 200, 205, 221, 224, 225, 230, 233, 243, 249, 251, 253, 257, 259, 266, 268, 275, 285, 286, 287, 288, 292, 295, 298, 299, 303, 310, 314, 317, 322, 325, 332, 339, 342, 349, 358, 359, 360, 361, 367, 370, 371, 375, 379, 382, 383, 384, 391, 393, 398, 401, 406, 414, 417, 419, 425, 428, 433, 436, 438, 440, 450, 457],
  '7': [3, 16, 24, 26, 42, 48, 52, 55, 56, 58, 62, 63, 71, 93, 97, 100, 104, 116, 118, 132, 141, 146, 151, 153, 162, 180, 194, 204, 218, 234, 238, 242, 255, 256, 261, 267, 269, 272, 273, 274, 289, 293, 304, 312, 328, 334, 338, 345, 347, 350, 351, 353, 356, 362, 364, 380, 381, 386, 387, 388, 394, 395, 396, 402, 411, 421, 423, 435, 444, 451, 455, 456],
};

export const MLN131_KNOWLEDGE_GROUPS: Mln131KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Nhập môn Chủ nghĩa xã hội khoa học",
    summary: "Sự ra đời, các giai đoạn phát triển (Mác - Ăngghen - Lênin), đối tượng, phương pháp và ý nghĩa nghiên cứu Chủ nghĩa xã hội khoa học.",
    questionIds: MLN131_QUESTION_IDS_BY_GROUP['1'],
  },
  {
    id: '2',
    number: 2,
    title: "Sứ mệnh lịch sử của giai cấp công nhân",
    summary: "Khái niệm, đặc điểm, nội dung sứ mệnh lịch sử, điều kiện khách quan - chủ quan quy định sứ mệnh lịch sử của giai cấp công nhân thế giới và Việt Nam.",
    questionIds: MLN131_QUESTION_IDS_BY_GROUP['2'],
  },
  {
    id: '3',
    number: 3,
    title: "Chủ nghĩa xã hội và Thời kỳ quá độ lên CNXH",
    summary: "Hình thái kinh tế - xã hội cộng sản chủ nghĩa, đặc trưng bản chất của CNXH, tính tất yếu và đặc điểm của thời kỳ quá độ lên CNXH ở Việt Nam.",
    questionIds: MLN131_QUESTION_IDS_BY_GROUP['3'],
  },
  {
    id: '4',
    number: 4,
    title: "Dân chủ xã hội chủ nghĩa và Nhà nước xã hội chủ nghĩa",
    summary: "Bản chất của nền dân chủ XHCN, mối quan hệ giữa dân chủ XHCN và nhà nước pháp quyền XHCN của nhân dân, do nhân dân, vì nhân dân.",
    questionIds: MLN131_QUESTION_IDS_BY_GROUP['4'],
  },
  {
    id: '5',
    number: 5,
    title: "Cơ cấu xã hội - giai cấp và Liên minh giai cấp, tầng lớp",
    summary: "Cơ cấu xã hội - giai cấp trong thời kỳ quá độ, tính tất yếu và nội dung của liên minh công - nông - trí thức và các tầng lớp lao động ở Việt Nam.",
    questionIds: MLN131_QUESTION_IDS_BY_GROUP['5'],
  },
  {
    id: '6',
    number: 6,
    title: "Vấn đề Dân tộc và Tôn giáo trong thời kỳ quá độ lên CNXH",
    summary: "Cương lĩnh dân tộc của chủ nghĩa Mác - Lênin, đặc điểm quan hệ dân tộc ở Việt Nam, bản chất - nguồn gốc - tính chất của tôn giáo và chính sách tôn giáo.",
    questionIds: MLN131_QUESTION_IDS_BY_GROUP['6'],
  },
  {
    id: '7',
    number: 7,
    title: "Vấn đề Gia đình trong thời kỳ quá độ lên CNXH",
    summary: "Khái niệm, vị trí, các chức năng cơ bản của gia đình, cơ sở xây dựng gia đình trong thời kỳ quá độ và phương hướng xây dựng gia đình Việt Nam mới.",
    questionIds: MLN131_QUESTION_IDS_BY_GROUP['7'],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  MLN131_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getMln131KnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '3';
}

export function getMln131QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!MLN131_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getMln131KnowledgeGroupId(question) === groupId);
}
