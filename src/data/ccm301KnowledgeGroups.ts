import type { Question } from '../utils/quizParser';

export interface Ccm301KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  questionIds: readonly number[];
}

// Manually reviewed against all 444 questions in sampleQuizCCM301.ts.
// IDs are original bank positions: preserve them for progress and source lookup.
// Review these assignments if the bank is reordered; the test fingerprints its stems.
export const CCM301_KNOWLEDGE_GROUPS: Ccm301KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: "Tổng quan & vòng đời khủng hoảng",
    summary: "Phân biệt crisis, disaster và operational crisis; học mô hình ba giai đoạn precrisis – crisis – postcrisis, mô hình tái sinh và khả năng chống chịu.",
    questionIds: [
      1, 2, 3, 4, 52, 53, 96, 115, 129, 139, 152, 174, 182, 183,
      185, 186, 187, 189, 190, 191, 192, 193, 195, 198, 199, 200, 201, 202,
      203, 204, 205, 209, 232, 283, 284, 285, 287, 288, 289, 290, 387, 402,
      421,
    ],
  },
  {
    id: '2',
    number: 2,
    title: "Stakeholder, danh tiếng & CSR",
    summary: "Nhận diện stakeholder chính/phụ, power – legitimacy – willingness, khoảng cách kỳ vọng; liên hệ danh tiếng, niềm tin, CSR và greenwashing.",
    questionIds: [
      5, 10, 12, 59, 60, 101, 122, 132, 141, 147, 154, 178, 184, 260,
      261, 262, 263, 264, 265, 268, 280, 281, 295, 302, 303, 330, 331, 333,
      334, 335, 336, 340, 381, 394, 399, 411, 420, 431, 432,
    ],
  },
  {
    id: '3',
    number: 3,
    title: "Quản trị vấn đề & rủi ro (Issues, Risk, ERM)",
    summary: "Phân biệt issues management và risk management; học mô hình Jones & Chase, ERM, nguồn rủi ro nội bộ/bên ngoài và truyền thông rủi ro.",
    questionIds: [
      7, 8, 9, 11, 13, 20, 56, 57, 58, 61, 62, 67, 80, 98,
      111, 135, 150, 158, 159, 164, 177, 291, 292, 317, 325, 326, 327, 328,
      329, 332, 337, 338, 339, 393, 414, 416, 424, 434, 440,
    ],
  },
  {
    id: '4',
    number: 4,
    title: "Nhận diện tín hiệu & đánh giá nguy cơ",
    summary: "Tìm red flags, chẩn đoán điểm yếu, đánh giá likelihood – impact; phân loại crisis types/clusters và ưu tiên nguy cơ cần xử lý.",
    questionIds: [
      14, 15, 23, 51, 63, 64, 70, 71, 105, 107, 110, 114, 170, 197,
      208, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222,
      223, 224, 225, 226, 227, 228, 229, 230, 233, 235, 236, 237, 238, 294,
    ],
  },
  {
    id: '5',
    number: 5,
    title: "OODA: phân tích, phòng ngừa & kiểm tra hiệu quả",
    summary: "Từ Observe đến Orient – Decide – Act: phân tích dữ liệu, chọn biện pháp phòng ngừa, giám sát và đánh giá hiệu quả giảm thiểu nguy cơ.",
    questionIds: [
      16, 17, 18, 19, 21, 65, 66, 68, 102, 113, 123, 131, 143, 144,
      148, 153, 160, 161, 167, 270, 271, 272, 273, 274, 275, 276, 277, 278,
      279, 293, 297, 298, 300, 301, 306,
    ],
  },
  {
    id: '6',
    number: 6,
    title: "Đội khủng hoảng, lãnh đạo & người phát ngôn",
    summary: "Vai trò và kỹ năng của CMT; lãnh đạo, trí tuệ cảm xúc, diễn tập, ra quyết định nhóm; trách nhiệm người phát ngôn và cách trả lời truyền thông.",
    questionIds: [
      6, 25, 26, 27, 28, 29, 55, 72, 73, 74, 75, 104, 108, 112,
      118, 126, 134, 140, 145, 151, 180, 286, 382, 385, 400, 409, 438,
    ],
  },
  {
    id: '7',
    number: 7,
    title: "Kế hoạch CCP & hệ thống sẵn sàng ứng phó",
    summary: "Cấu trúc và giới hạn CCP/CMP, biểu mẫu và danh bạ; mass notification, crisis control center, dark site, press kit và sự sẵn sàng của cộng đồng.",
    questionIds: [
      30, 31, 32, 33, 34, 76, 77, 78, 99, 116, 124, 136, 146, 181,
      240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253,
      254, 255, 256, 258, 259, 342, 343, 344, 345, 346, 347, 348, 349, 350,
      351, 352, 353, 355, 356, 357, 358, 383, 384, 396, 410, 419, 422, 426,
      433,
    ],
  },
  {
    id: '8',
    number: 8,
    title: "Nhận diện khủng hoảng, xử lý thông tin & quyết định",
    summary: "Selling the crisis và framing; salience, immediacy, uncertainty; thu thập và kiểm chứng thông tin, MUM effect, thiên lệch, méo thông điệp và knowledge map.",
    questionIds: [
      35, 36, 38, 81, 82, 83, 103, 109, 117, 119, 155, 165, 169, 171,
      307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 318, 319, 320, 321,
      322, 323, 324, 377, 390, 392, 395, 401, 406, 408, 423, 436,
    ],
  },
  {
    id: '9',
    number: 9,
    title: "Truyền thông ứng phó: tốc độ, nội dung & nhất quán",
    summary: "Golden hour, stealing thunder, một tiếng nói thống nhất; ưu tiên instructing rồi adjusting information, chọn công chúng/kênh và tránh im lặng, thiếu minh bạch.",
    questionIds: [
      37, 39, 40, 42, 84, 85, 86, 87, 88, 97, 106, 120, 128, 142,
      157, 168, 172, 257, 359, 360, 361, 362, 363, 365, 366, 367, 370, 371,
      372, 373, 375, 376, 380, 389, 397, 404, 405, 407, 417, 418, 427, 428,
      429, 439, 444,
    ],
  },
  {
    id: '10',
    number: 10,
    title: "SCCT & chiến lược bảo vệ danh tiếng",
    summary: "Trách nhiệm khủng hoảng và attribution theory; chọn denial, diminishment hoặc rebuilding, phân biệt scapegoating, compensation và lời xin lỗi đầy đủ.",
    questionIds: [
      41, 43, 44, 45, 89, 90, 149, 162, 176, 266, 267, 269, 364, 369,
      386, 415, 437,
    ],
  },
  {
    id: '11',
    number: 11,
    title: "Paracrisis, mạng xã hội & tin đồn",
    summary: "Nhận diện khủng hoảng danh tiếng công khai; xử lý challenge bằng refusal/recognition/revision và reform/repentance; kiểm soát tin đồn, truyền miệng và phản ứng mạng xã hội.",
    questionIds: [
      22, 24, 54, 69, 127, 130, 137, 138, 163, 173, 179, 188, 231, 234,
      239, 282, 296, 299, 304, 341, 378, 379, 398, 403, 430, 435, 441, 442,
      443,
    ],
  },
  {
    id: '12',
    number: 12,
    title: "Hậu khủng hoảng, đánh giá & học hỏi",
    summary: "Follow-up, phục hồi niềm tin và tưởng niệm; đánh giá performance/impact, so sánh mục tiêu với kết quả; lưu trữ tri thức, tacit knowledge và organizational memory.",
    questionIds: [
      46, 47, 48, 49, 50, 79, 91, 92, 93, 94, 95, 100, 121, 125,
      133, 156, 166, 175, 194, 196, 206, 207, 305, 354, 368, 374, 388, 391,
      412, 413, 425,
    ],
  },
];

const QUESTION_GROUP_IDS = new Map<number, string>(
  CCM301_KNOWLEDGE_GROUPS.flatMap((group) =>
    group.questionIds.map((id) => [id, group.id] as const)
  )
);

export function getCcm301KnowledgeGroupId(question: Question): string {
  // Unreviewed IDs have no topic; coverage tests require every source question to be mapped.
  return QUESTION_GROUP_IDS.get(question.id) ?? '';
}

export function getCcm301QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  if (!CCM301_KNOWLEDGE_GROUPS.some((group) => group.id === groupId)) return [];
  return questions.filter((question) => getCcm301KnowledgeGroupId(question) === groupId);
}
