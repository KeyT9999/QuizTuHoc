import type { Question } from '../utils/quizParser';

export interface Mkt301KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
}

export const MKT301_KNOWLEDGE_GROUPS: Mkt301KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: 'Tổng quan Nghiên cứu Marketing, Chiến lược & Đạo đức',
    summary: 'Vai trò của nghiên cứu marketing trong hoạch định chiến lược, ra quyết định quản trị và các vấn đề đạo đức nghiên cứu.',
  },
  {
    id: '2',
    number: 2,
    title: 'Quy trình Nghiên cứu & Xác định Vấn đề',
    summary: 'Các bước trong quy trình nghiên cứu, xác định vấn đề/mục tiêu nghiên cứu, đánh giá giá trị thông tin và đề xuất nghiên cứu (Proposal).',
  },
  {
    id: '3',
    number: 3,
    title: 'Thiết kế Nghiên cứu: Khám phá, Mô tả & Nhân quả',
    summary: 'Phân biệt Exploratory, Descriptive và Causal Research; biến độc lập, phụ thuộc, ngoại lai và thiết kế thực nghiệm.',
  },
  {
    id: '4',
    number: 4,
    title: 'Dữ liệu Thứ cấp, Dữ liệu Sơ cấp & Nguồn Thông tin',
    summary: 'Đánh giá chất lượng dữ liệu thứ cấp, dữ liệu sơ cấp, tổng quan tài liệu (Literature Review), Big Data và Store Audit.',
  },
  {
    id: '5',
    number: 5,
    title: 'Nghiên cứu Định tính, Quan sát & Dân tộc học',
    summary: 'Thảo luận nhóm (Focus Group), phỏng vấn sâu (IDI), kỹ thuật phóng chiếu (Projective), quan sát và Ethnography.',
  },
  {
    id: '6',
    number: 6,
    title: 'Phân tích Dữ liệu Định tính & Lý thuyết Nền',
    summary: 'Quy trình phân tích định tính: mã hóa (coding), phân loại chủ đề, so sánh, tích hợp, Grounded Theory và Triangulation.',
  },
  {
    id: '7',
    number: 7,
    title: 'Phương pháp Khảo sát & Thu thập Dữ liệu Hiện trường',
    summary: 'Khảo sát trực tiếp, điện thoại, trực tuyến, qua thư; sai số do phỏng vấn viên, hồ sơ cuộc gọi và kiểm soát hiện trường.',
  },
  {
    id: '8',
    number: 8,
    title: 'Đo lường, Xây dựng Thang đo & Độ tin cậy/Giá trị',
    summary: 'Khái niệm Construct, 4 cấp độ đo (Nominal, Ordinal, Interval, Ratio), thang đo Likert/Semantic Differential, Reliability & Validity.',
  },
  {
    id: '9',
    number: 9,
    title: 'Thiết kế Bảng câu hỏi (Questionnaire Design)',
    summary: 'Quy trình thiết kế bảng hỏi, câu hỏi mở/đóng, câu hỏi lọc (filter/branching), lỗi câu hỏi (double-barreled, leading) và pretest.',
  },
  {
    id: '10',
    number: 10,
    title: 'Chọn mẫu & Xác định Kích thước Mẫu (Sampling)',
    summary: 'Tổng thể, khung mẫu, chọn mẫu xác suất (ngẫu nhiên đơn, phân tầng, cụm) và phi xác suất (thuận tiện, phán đoán, định ngạch, quả cầu tuyết).',
  },
  {
    id: '11',
    number: 11,
    title: 'Chuẩn bị Dữ liệu, Kiểm định Giả thuyết & Phân tích Thống kê',
    summary: 'Xác thực/biên tập dữ liệu, kiểm định giả thuyết (H0/H1, p-value, t-test, ANOVA, Chi-square), tương quan, hồi quy và biểu đồ thống kê.',
  },
  {
    id: '12',
    number: 12,
    title: 'Báo cáo Nghiên cứu & Trình bày Kết quả',
    summary: 'Cấu trúc báo cáo nghiên cứu, tóm tắt điều hành (Executive Summary), phương pháp luận và trình bày kết quả trực quan.',
  },
];

interface ClassificationRule {
  groupId: string;
  pattern: RegExp;
  weight: number;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    groupId: '1',
    pattern: /strategic plan|marketing research|program development|ethical|unethical|ethics|code of ethics|confidentiality|deceiving|padding expenses|management decision maker|john and bill|situation analysis|competitive intelligence|crm|customer relationship|pricing decision|cheetos|geographic market|lifestyle studies/,
    weight: 8,
  },
  {
    groupId: '2',
    pattern: /research process|research problem|research objective|information need|information value|research proposal|proposal|management problem|symptom|iceberg|literature review|unit of analysis|research question|not conducting the study|justify the nece/,
    weight: 10,
  },
  {
    groupId: '3',
    pattern: /exploratory|descriptive|causal|research design|independent variable|dependent variable|extraneous variable|control group|experimental|experiment|manipulation|internal validity|external validity|laboratory|field experiment|cross sectional|longitudinal/,
    weight: 11,
  },
  {
    groupId: '4',
    pattern: /secondary data|primary data|syndicated|internal data|external data|big data|census|database|data mining|assessing secondary|criterion for assessing|customer knowledge information|store audit|google scholar|cited by|product returns/,
    weight: 11,
  },
  {
    groupId: '5',
    pattern: /qualitative|focus group|moderator|in depth interview|idi|projective|word association|sentence completion|role playing|zmet|observation|observational|ethnograph|thick description|netnography|mystery shop|mechanical observation|participant observation/,
    weight: 11,
  },
  {
    groupId: '6',
    pattern: /qualitative data|coding|codebook|grounded theory|triangulation|transcript|theme|categorization|comparison in qualitative|integration in qualitative|memos|memoing|note taking|verbatims|content analysis|credibility|transferability|dependability|confirmability/,
    weight: 12,
  },
  {
    groupId: '7',
    pattern: /person administered|telephone survey|online survey|mail survey|self administered|in home interview|survey research method|interviewer|interviewing process|desirability bias|call record|random digit dialing|response rate|nonresponse|supplemental document|instruction form|quota sheet|drop off/,
    weight: 11,
  },
  {
    groupId: '8',
    pattern: /construct|nominal|ordinal|interval|ratio|scale|scaling|likert|semantic differential|constant sum|paired comparison|graphic rating|stapel|behavioral intention|predictor of future behavior|noncomparative|comparative scale|reliability|validity|convergent|discriminant|cronbach|internal consistency|test retest|split half|ave|factor loading|cfa|multiple item|single item|scale point/,
    weight: 11,
  },
  {
    groupId: '9',
    pattern: /questionnaire|structured question|unstructured question|question format|double barreled|leading|loaded|filter question|branching|screening question|skip question|open ended|closed ended|bad question|sensitive question|topic sensitivity|pretest|cover letter|layout|wording|framing|order bias/,
    weight: 12,
  },
  {
    groupId: '10',
    pattern: /sampling|sample size|target population|sampling frame|sampling unit|probability sampling|nonprobability|simple random|stratified|cluster|systematic|convenience|judgment|purposive|quota|snowball|census|propensity|sampling error|nonsampling error|parameter|statistic/,
    weight: 11,
  },
  {
    groupId: '11',
    pattern: /data validation|curbstoning|data edit|data entry|tabulation|cross tabulation|frequency count|valid percentage|missing data|missing value|outlier|null hypothesis|alternative hypothesis|h0|h1|type i error|type ii error|p value|significance|confidence interval|t test|levene|anova|chi square|pearson|spearman|correlation|covariation|predict the behavior|regression|bivariate|multivariate|importance performance|perceptual mapping|mean|median|mode|variance|standard deviation|normal distribution|pie chart|bar chart|histogram|scatter plot|scatter diagram/,
    weight: 11,
  },
  {
    groupId: '12',
    pattern: /research report|executive summary|oral presentation|table of contents|findings|recommendations|methodology section|methods and procedures|visual aid|jane is waiting|circular or recursive/,
    weight: 12,
  },
];

export function getMkt301KnowledgeGroupId(question: Question): string {
  const questionText = normalizeText(question.text);
  const optionsText = normalizeText(question.options.map((option) => option.text).join(' '));
  const scores = new Map<string, number>();

  for (const rule of CLASSIFICATION_RULES) {
    const questionMatch = rule.pattern.test(questionText);
    const optionMatch = rule.pattern.test(optionsText);
    const score = (questionMatch ? rule.weight : 0)
      + (optionMatch ? Math.max(1, Math.floor(rule.weight * 0.2)) : 0);
    if (score > 0) scores.set(rule.groupId, (scores.get(rule.groupId) ?? 0) + score);
  }

  let bestGroupId = '1';
  let bestScore = 0;
  for (const group of MKT301_KNOWLEDGE_GROUPS) {
    const score = scores.get(group.id) ?? 0;
    if (score > bestScore) {
      bestGroupId = group.id;
      bestScore = score;
    }
  }

  return bestGroupId;
}

export function getMkt301QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  return questions.filter((question) => getMkt301KnowledgeGroupId(question) === groupId);
}
