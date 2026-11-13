import type { Question } from '../utils/quizParser';

export interface Bra301KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

// IDs follow the question order in sampleQuizBRA301.ts and cover every source question.
const BRA301_QUESTION_IDS_BY_GROUP: Record<string, readonly number[]> = {
  '1': [
    16, 19, 135, 141, 211, 212, 213, 269, 272, 275, 356, 464, 499,
  ],
  '2': [
    12, 17, 28, 35, 36, 43, 53, 65, 72, 85, 87, 96, 99, 100, 102, 108, 131, 139,
    152, 159, 166, 172, 175, 200, 222, 226, 227, 233, 234, 236, 237, 238, 239, 241, 242, 243,
    244, 268, 287, 316, 319, 322, 335, 354, 355, 360, 363, 376, 378, 379, 391, 395, 404, 408,
    419, 433, 439, 440, 443, 451, 453, 458, 485, 492, 512,
  ],
  '3': [
    22, 30, 32, 42, 44, 47, 48, 74, 77, 101, 111, 113, 163, 171, 180, 181, 183, 184,
    185, 187, 188, 229, 230, 232, 248, 249, 294, 295, 318, 334, 337, 346, 358, 374, 385, 390,
    392, 412, 417, 427, 428, 435, 436, 437, 460, 461, 473, 491,
  ],
  '4': [
    15, 23, 26, 39, 50, 54, 60, 73, 82, 84, 103, 105, 110, 133, 156, 225, 250, 251,
    252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 263, 265, 266, 277, 291, 292, 297, 304,
    305, 312, 331, 344, 365, 366, 373, 399, 401, 421, 424, 429, 430, 447, 448, 471, 489, 501,
    503, 506, 515,
  ],
  '5': [
    7, 8, 9, 10, 14, 40, 46, 52, 57, 62, 63, 66, 130, 140, 144, 155, 210, 245,
    262, 278, 285, 286, 288, 289, 293, 298, 302, 307, 310, 311, 327, 333, 350, 351, 352, 367,
    368, 383, 386, 393, 406, 409, 425, 426, 431, 441, 456, 457, 462, 468, 470, 484, 486, 490,
    498, 505, 513, 517,
  ],
  '6': [
    5, 6, 13, 20, 38, 55, 56, 59, 67, 71, 75, 76, 78, 79, 80, 98, 109, 115,
    119, 136, 138, 142, 143, 145, 146, 162, 164, 167, 169, 170, 173, 174, 194, 195, 196, 197,
    198, 199, 201, 202, 203, 247, 280, 283, 284, 299, 301, 317, 320, 324, 325, 329, 332, 338,
    339, 341, 349, 380, 387, 405, 407, 410, 414, 416, 423, 452, 455, 463, 465, 474, 475, 476,
    483, 493, 494, 507, 509, 511, 516,
  ],
  '7': [
    1, 2, 3, 4, 21, 24, 25, 27, 45, 58, 64, 69, 95, 97, 104, 107, 114, 116,
    117, 118, 120, 121, 122, 123, 124, 125, 126, 137, 147, 150, 160, 161, 178, 179, 182, 186,
    209, 290, 303, 306, 314, 315, 323, 361, 388, 394, 397, 403, 411, 442, 445, 450, 479, 500,
    508, 518,
  ],
  '8': [
    11, 41, 51, 68, 81, 83, 88, 92, 106, 128, 129, 132, 134, 148, 149, 165, 189, 190,
    191, 192, 193, 205, 223, 231, 270, 273, 274, 276, 328, 336, 340, 345, 362, 364, 375, 382,
    402, 413, 415, 438, 444, 449, 467, 481, 482, 504,
  ],
  '9': [
    18, 31, 49, 61, 70, 86, 93, 94, 112, 151, 153, 154, 158, 168, 176, 206, 207, 208,
    219, 224, 235, 240, 246, 264, 267, 300, 309, 342, 347, 348, 371, 372, 377, 384, 389, 396,
    418, 420, 432, 434, 446, 454, 480, 502, 514,
  ],
  '10': [
    29, 33, 34, 89, 90, 91, 127, 157, 204, 214, 215, 216, 217, 218, 228, 271, 279, 296,
    308, 313, 321, 330, 353, 357, 359, 369, 370, 381, 398, 400, 459, 469, 472, 478, 487, 488,
    495, 496, 497, 510,
  ],
  '11': [
    37, 177, 220, 221, 281, 282, 326, 343, 422, 466, 477,
  ],
};

export const BRA301_KNOWLEDGE_GROUPS: Bra301KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Tổng quan & giá trị thương hiệu",
    summary: "Khái niệm và vai trò của thương hiệu; phân biệt thương hiệu với sản phẩm và các định nghĩa nền tảng.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['1'],
  },
  {
    id: '2',
    number: 2,
    title: "CBBE: nhận biết, hình ảnh & lòng trung thành",
    summary: "Customer-Based Brand Equity, nhận biết, liên tưởng, hình ảnh, tính cách, cảm xúc, đánh giá và cộng hưởng thương hiệu.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['2'],
  },
  {
    id: '3',
    number: 3,
    title: "Định vị, phân khúc & thị trường toàn cầu",
    summary: "Định vị cạnh tranh, phân khúc khách hàng, thích nghi theo vùng và chiến lược thương hiệu toàn cầu.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['3'],
  },
  {
    id: '4',
    number: 4,
    title: "Yếu tố thương hiệu, tên gọi & nhận diện",
    summary: "Đặt tên và lựa chọn logo, biểu tượng, slogan, nhân vật, bao bì, URL và các yếu tố nhận diện.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['4'],
  },
  {
    id: '5',
    number: 5,
    title: "Truyền thông, trải nghiệm & thương hiệu số",
    summary: "IMC, quảng cáo, khuyến mãi, nội dung, truyền thông số, quan hệ khách hàng và trải nghiệm thương hiệu.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['5'],
  },
  {
    id: '6',
    number: 6,
    title: "Kiến trúc, danh mục & phát triển thương hiệu",
    summary: "Brand architecture, danh mục, thương hiệu con, mở rộng, di chuyển, tái định vị và làm mới thương hiệu.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['6'],
  },
  {
    id: '7',
    number: 7,
    title: "Liên tưởng thứ cấp & hợp tác thương hiệu",
    summary: "Co-branding, cấp phép, người nổi tiếng, xuất xứ địa lý, nhà bán lẻ, kênh phân phối và đối tác.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['7'],
  },
  {
    id: '8',
    number: 8,
    title: "Nghiên cứu & phương pháp phân tích",
    summary: "Nghiên cứu định tính/định lượng, phương pháp so sánh, conjoint, projective, free association và thử nghiệm.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['8'],
  },
  {
    id: '9',
    number: 9,
    title: "Kiểm toán, theo dõi & định giá thương hiệu",
    summary: "Brand audit, inventory, tracking, brand value chain, valuation, ROMI và hệ thống quản trị giá trị thương hiệu.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['9'],
  },
  {
    id: '10',
    number: 10,
    title: "Khách hàng, sản phẩm & hiệu quả thị trường",
    summary: "Hành vi mua, lợi ích, rủi ro, giá, mức ý nghĩa của sản phẩm và kết quả thị trường.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['10'],
  },
  {
    id: '11',
    number: 11,
    title: "Quản trị & điều hành thương hiệu",
    summary: "Lập kế hoạch, trách nhiệm tổ chức, uy tín, khả năng chống chịu và quản trị thương hiệu.",
    questionIds: BRA301_QUESTION_IDS_BY_GROUP['11'],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  BRA301_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getBra301KnowledgeGroupId(question: Question): string {
  return QUESTION_GROUP_IDS.get(question.id) ?? '';
}

export function getBra301QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!BRA301_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getBra301KnowledgeGroupId(question) === groupId);
}
