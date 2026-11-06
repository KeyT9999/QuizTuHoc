import type { Question } from '../utils/quizParser';

export interface Mkt209mKnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
}

export const MKT209M_KNOWLEDGE_GROUPS: Mkt209mKnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: 'Chiến lược Content Marketing, 7A Framework & Đạo đức',
    summary: 'Khung 7A, Agile Content Marketing, tái sử dụng nội dung (repurposing), syndication và chuẩn mực đạo đức.',
  },
  {
    id: '2',
    number: 2,
    title: 'Thương hiệu, Giọng điệu (Brand Voice) & EPIC Framework',
    summary: 'Xây dựng thương hiệu, định vị giá trị, chân dung khách hàng (persona), Brand Voice/Tone và khung EPIC.',
  },
  {
    id: '3',
    number: 3,
    title: 'Nghệ thuật Kể chuyện (Storytelling) & Viết nội dung',
    summary: 'Đặt tiêu đề (Headline), cấu trúc Storytelling, bài viết blog, white paper, CTA và khơi gợi cảm xúc.',
  },
  {
    id: '4',
    number: 4,
    title: 'Bản đồ Trải nghiệm, Hành trình Khách hàng & Gamification',
    summary: 'Experience Mapping, Journey Map, điểm chạm (touchpoints), huy hiệu/leaderboard và Liquid Modernity.',
  },
  {
    id: '5',
    number: 5,
    title: 'Quản trị Mạng xã hội & Tương tác Đa nền tảng',
    summary: 'Tối ưu bài đăng trên Facebook, Instagram, Twitter, LinkedIn; sử dụng hashtag, @mention và hồ sơ doanh nghiệp.',
  },
  {
    id: '6',
    number: 6,
    title: 'Công cụ Lên lịch, Quản lý Trang & Phản hồi Khách hàng',
    summary: 'Hootsuite, Buffer, Sprout Social, Planoly; phân quyền quản trị trang, khung giờ đăng và xử lý khủng hoảng/bình luận.',
  },
  {
    id: '7',
    number: 7,
    title: 'Nội dung Đa phương tiện: Video, Hình ảnh & Âm thanh',
    summary: 'Sản xuất và tối ưu hóa nội dung hình ảnh, video, podcast/âm thanh và trải nghiệm trên thiết bị di động.',
  },
  {
    id: '8',
    number: 8,
    title: 'Đo lường Hiệu quả, Chuyển đổi & Truyền thông Báo chí',
    summary: 'Các chỉ số đo lường (Conversion, Bounce Rate, Reach, ROI), quảng cáo trả phí và xu hướng báo chí – truyền thông số.',
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
    pattern: /7a framework|attraction content|authority content|authority is built|affinity|acceleration|agility|authenticity|action is the point|form of action in mind|agile|content marketing|content strategy|syndication|curated content|content curation|ethics|ethical|copyright|plagiarism|editorial calendar|content calendar|repurpos|legal and compliance|credibility and transparency|content team|content channel|website security|most marketing fails|advocate for your customers|transformation they want to make/,
    weight: 10,
  },
  {
    groupId: '2',
    pattern: /epic framework|brand voice|brand tone|branding|brand identity|brand equity|brand loyal|function of the brand|logo|tagline|voice would be most fitting|tone|value proposition|positioning|persona|niche audience|target audience/,
    weight: 10,
  },
  {
    groupId: '3',
    pattern: /headline|storytelling|story|stories|narrative|copywriting|writer|writing|article|blog|white paper|ebook|infographic|call to action|cta|hook|curiosity|empathy|emotional|emotion|irresistible content|single focused point/,
    weight: 9,
  },
  {
    groupId: '4',
    pattern: /experience map|experience mapping|journey map|customer journey|empathy map|touchpoint|foursquare|badge|leaderboard|gamification|liquid modernity|bauman|create an experience for the buyer/,
    weight: 11,
  },
  {
    groupId: '5',
    pattern: /facebook|instagram|twitter|linkedin|tiktok|youtube|pinterest|hashtag|mention|social media post|social media page|social media profile|business profile|emoji|multiple photo|narrowcasting|engaging social media content|social media is useful|social sharing|creating content for social media|behind the scenes/,
    weight: 10,
  },
  {
    groupId: '6',
    pattern: /hootsuite|buffer|sprout social|planoly|scheduler|scheduling|publishing tool|best times to publish|time of day|chatbot|automated response|automate response|moderator|admin|editor|respond to comment|responding to customer comments|respond to social media|how do you respond|customer service|complaint|negative comment|24 hours|amelie|imra|calla|dave|marge|joseph|stacey/,
    weight: 11,
  },
  {
    groupId: '7',
    pattern: /video|image|visual|audio|podcast|smartphone|mobile|gif|photo|sound|caption|subtitle/,
    weight: 9,
  },
  {
    groupId: '8',
    pattern: /metric|conversion|bounce rate|analytics|roi|kpi|engagement rate|reach|impression|click|newspaper|journalism|journalist|news|media company|print edition|local news|civic|advertising|advertisement|ad blocker|audience fragmentation|free media coverage|earned media|washington post|paid|organic/,
    weight: 10,
  },
];

export function getMkt209mKnowledgeGroupId(question: Question): string {
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
  for (const group of MKT209M_KNOWLEDGE_GROUPS) {
    const score = scores.get(group.id) ?? 0;
    if (score > bestScore) {
      bestGroupId = group.id;
      bestScore = score;
    }
  }

  return bestGroupId;
}

export function getMkt209mQuestionsForGroup(questions: Question[], groupId: string): Question[] {
  return questions.filter((question) => getMkt209mKnowledgeGroupId(question) === groupId);
}
