import type { Course } from '../data/courses';

export type CourseCategory =
  | 'all'
  | 'it'
  | 'economics'
  | 'marketing'
  | 'media'
  | 'design'
  | 'politics'
  | 'language';

export type MajorCategoryKey = Exclude<CourseCategory, 'all'>;

export interface CategoryMeta {
  key: CourseCategory;
  label: string;
  shortLabel: string;
  primary: string;
  soft: string;
  border: string;
  hoverShadow: string;
  icon: 'book' | 'landmark' | 'folder' | 'code' | 'cloud' | 'globe' | 'tag' | 'cards' | 'grad-cap';
}

export const COURSE_CATEGORIES: CategoryMeta[] = [
  {
    key: 'all',
    label: 'Tất cả',
    shortLabel: 'Tất cả',
    primary: '#4f46e5',
    soft: '#eef2ff',
    border: '#e0e7ff',
    hoverShadow: 'rgba(79, 70, 229, 0.16)',
    icon: 'grad-cap',
  },
  {
    key: 'it',
    label: 'Công nghệ thông tin',
    shortLabel: 'CNTT',
    primary: '#2563eb',
    soft: '#eff6ff',
    border: '#dbeafe',
    hoverShadow: 'rgba(37, 99, 235, 0.16)',
    icon: 'code',
  },
  {
    key: 'economics',
    label: 'Kinh tế & Quản trị',
    shortLabel: 'Kinh tế',
    primary: '#059669',
    soft: '#ecfdf5',
    border: '#d1fae5',
    hoverShadow: 'rgba(5, 150, 105, 0.16)',
    icon: 'landmark',
  },
  {
    key: 'marketing',
    label: 'Marketing',
    shortLabel: 'Marketing',
    primary: '#d97706',
    soft: '#fffbeb',
    border: '#fef3c7',
    hoverShadow: 'rgba(217, 119, 6, 0.16)',
    icon: 'tag',
  },
  {
    key: 'media',
    label: 'Truyền thông & PR',
    shortLabel: 'Truyền thông',
    primary: '#e11d48',
    soft: '#fff1f2',
    border: '#ffe4e6',
    hoverShadow: 'rgba(225, 29, 72, 0.16)',
    icon: 'globe',
  },
  {
    key: 'design',
    label: 'Thiết kế (Design)',
    shortLabel: 'Design',
    primary: '#9333ea',
    soft: '#faf5ff',
    border: '#f3e8ff',
    hoverShadow: 'rgba(147, 51, 234, 0.16)',
    icon: 'folder',
  },
  {
    key: 'politics',
    label: 'Lý luận & Pháp luật',
    shortLabel: 'Lý luận & Luật',
    primary: '#7c3aed',
    soft: '#f5f3ff',
    border: '#ede9fe',
    hoverShadow: 'rgba(124, 58, 237, 0.16)',
    icon: 'book',
  },
  {
    key: 'language',
    label: 'Ngôn ngữ & Kỹ năng',
    shortLabel: 'Ngôn ngữ & Kỹ năng',
    primary: '#db2777',
    soft: '#fdf2f8',
    border: '#fce7f3',
    hoverShadow: 'rgba(219, 39, 119, 0.16)',
    icon: 'globe',
  },
];

export const CATEGORY_META_MAP: Record<CourseCategory, CategoryMeta> = Object.fromEntries(
  COURSE_CATEGORIES.map((c) => [c.key, c])
) as Record<CourseCategory, CategoryMeta>;

/**
 * Trả về danh sách các khối ngành tại Đại học FPT học chung môn này.
 * Một môn học có thể thuộc 1, 2, 3 hoặc 4 khối ngành (ví dụ: PMG201c thuộc CNTT + Kinh tế;
 * BRA301 / EVN301 thuộc Marketing + Truyền thông + Kinh tế; WDU202c/203c thuộc Design + CNTT).
 */
export function getCourseCategories(course: Pick<Course, 'code' | 'name' | 'description'>): MajorCategoryKey[] {
  const code = String(course.code || '').toUpperCase().trim();
  const text = `${course.code} ${course.name} ${course.description || ''}`.toLowerCase();
  const cats = new Set<MajorCategoryKey>();

  // 1. Thiết kế Mỹ thuật số (Graphic Design, UI/UX, Web/Game Design)
  if (
    /^(WDU|HOD102|HOA|AET|DET)/.test(code) ||
    code === 'WED201C' ||
    code === 'CAM201' ||
    code === 'CAA201' ||
    code === 'MMK101' ||
    code === 'PRU213' ||
    code === 'FER202' ||
    code === 'IPR102'
  ) {
    cats.add('design');
  }

  // 2. Marketing & Digital Marketing
  if (
    /^(MKT|MKG|MKC|MMK|ADS|SEO|SEG|DMS|DMA|CSP|BRA|CCHN|IMC|IMA|BCJ|CAA|CAM|SAL)/.test(code) ||
    code === 'ISC301' ||
    code === 'EVN201' ||
    code === 'EVN301' ||
    code === 'CCM301' ||
    code === 'PRE301' ||
    code === 'MCO302'
  ) {
    cats.add('marketing');
  }

  // 3. Truyền thông Đa phương tiện, Quan hệ công chúng (PR) & Sự kiện
  if (
    /^(CCM|MCO|EVN|PRE|EPR|RMC|CAA|CAM|IMC|IMA|BCJ|MMK|ISM201|LAE|DPS)/.test(code) ||
    code === 'BRA301' ||
    code === 'MKT208C' ||
    code === 'MKT209M' ||
    code === 'MKC201M' ||
    code === 'CSP201M' ||
    code === 'MKT304' ||
    code === 'MKT301' ||
    code === 'MKT101' ||
    code === 'MKG101' ||
    code === 'ADS301M' ||
    code === 'SEO201C' ||
    code === 'DMS301M' ||
    code === 'DMA301M' ||
    code === 'IPR102'
  ) {
    cats.add('media');
  }

  // 4. Kinh tế, Quản trị kinh doanh, Tài chính - Kế toán, Kinh doanh quốc tế, Logistics
  if (
    /^(ECO|ACC|FAC|FIN|BKG|SCM|GLA|GLC|GLI|LOG|IOM|IIP|IBF|IBC|IBI|IEI|MGT|OBE|HRM|SYB|TTM|SAL|CCHN|MKG|MKT101|MKT201|MKT202|MKT205|MKT301|MKT309|BRA301|EVN|ISC|ISM302|BPS|DSS|ITB|KMS|MAS202|SSB|RMB)/.test(code) ||
    code === 'PMG201C' ||
    code === 'FLASHCARD' ||
    code === 'DTA301' ||
    code === 'DAT301M' ||
    code === 'MAS291' ||
    code === 'DET101C' ||
    code === 'MLN122' ||
    code === 'LAW102' ||
    code === 'LAW201C' ||
    code === 'IPR102' ||
    code === 'MIP201' ||
    code === 'CCM301' ||
    code === 'MCO302' ||
    code === 'ENB302' ||
    code === 'CHN113' ||
    code === 'CHN123'
  ) {
    cats.add('economics');
  }

  // 5. Công nghệ thông tin (Kỹ thuật phần mềm, AI/Data, An toàn thông tin, Vi mạch, Ô tô số, HTTT)
  if (
    /^(CSI|PRF|PRO|PFP|PRP|APO|PCP|CSD|DBI|DBM|DBS|OSG|OSP|NWC|CEA|SWE|SWR|SWT|SWD|SDN|PRJ|PRN|PRM|MMA|FER|WED|WDU|HSF|SBA|MSS|PRC|MSA|SAP|PRU|PWD|AIG|AIL|AIM|AID|AIE|AIH|REL|CPV|NLP|MAI|MAD|MAE|MAS291|BDI|DTA|DAT|ADY|DSR|IAA|IAO|IAM|IAP|IAW|HOD402|FRS|CRY|AIC|SPM|CES|ITA|ISM302|BPS|DSS|ITB|KMS|IMO|ISC|IOT|EBS|DIC|ELC|EEI|MCP|MCE|FAP|SDI|ASI|ATS|AEE|PMG|ITE|SEG)/.test(code) ||
    code === 'FLASHCARD' ||
    code === 'TMG301' ||
    code === 'DET101C' ||
    code === 'JPD113' ||
    code === 'JPD123' ||
    code === 'JPD133'
  ) {
    cats.add('it');
  }

  // 6. Lý luận chính trị, Pháp luật & Đạo đức nghề nghiệp
  if (
    /^(MLN|HCM|VNR|VNC|LAW|IPR|MIP|LAE)/.test(code) ||
    code === 'ITE302C' ||
    code === 'AIE301M'
  ) {
    cats.add('politics');
  }

  // 7. Ngôn ngữ (Anh, Nhật, Trung, Hàn) & Kỹ năng mềm Đại học
  if (
    /^(JPD|CHN|KOR|TRS|ENB|ENW|TMG|SSG|SSL|SSA|SSB|DPS|GNS|RMB|DET)/.test(code)
  ) {
    cats.add('language');
  }

  // Fallback tự động theo từ khóa cho các môn học do người dùng tự tạo (custom courses)
  if (cats.size === 0) {
    if (/lập trình|phần mềm|mạng|dữ liệu|ai|trí tuệ nhân tạo|web|cloud|an ninh|bảo mật|mạch|ô tô|cntt|software|data|code/.test(text)) {
      cats.add('it');
    }
    if (/kinh tế|tài chính|kế toán|quản trị|doanh nghiệp|thương mại|logistics|chuỗi cung ứng|đầu tư|thuế|ngân hàng|du lịch|nhân sự|dự án/.test(text)) {
      cats.add('economics');
    }
    if (/marketing|tiếp thị|thương hiệu|seo|ads|bán hàng|tiêu dùng|brand/.test(text)) {
      cats.add('marketing');
    }
    if (/truyền thông|quan hệ công chúng|pr|quảng cáo|sự kiện|báo chí|media/.test(text)) {
      cats.add('media');
    }
    if (/thiết kế|mỹ thuật|ui|ux|đồ họa|design|nghệ thuật/.test(text)) {
      cats.add('design');
    }
    if (/triết học|mác|lênin|hồ chí minh|lịch sử đảng|chủ nghĩa xã hội|pháp luật|luật|văn hóa|đạo đức/.test(text)) {
      cats.add('politics');
    }
    if (/tiếng|hán ngữ|hàn ngữ|nhật|anh|kỹ năng|giao tiếp|nghiên cứu/.test(text)) {
      cats.add('language');
    }
    if (cats.size === 0) {
      cats.add('it');
    }
  }

  // Sắp xếp ưu tiên khối ngành chính của môn học lên đầu để chọn màu sắc/icon đại diện chuẩn nhất
  const list = [...cats];
  list.sort((a, b) => getPrimaryPriority(code, a) - getPrimaryPriority(code, b));
  return list;
}

function getPrimaryPriority(code: string, cat: MajorCategoryKey): number {
  if (/^(MLN|HCM|VNR|VNC|LAW|IPR|MIP)/.test(code) && cat === 'politics') return 0;
  if (/^(JPD|CHN|KOR|TRS|ENB|ENW|SSG|SSL|SSA|GNS)/.test(code) && cat === 'language') return 0;
  if (/^(WDU|HOD102|HOA|AET|DET)/.test(code) && cat === 'design') return 0;
  if (/^(CCM|MCO|EVN|PRE|EPR|RMC|CAA|CAM|ISM201|LAE|DPS)/.test(code) && cat === 'media') return 0;
  if (/^(MKT|MKG|MKC|MMK|ADS|SEO|SEG|DMS|DMA|CSP|BRA|CCHN|IMC|IMA|BCJ|SAL)/.test(code) && cat === 'marketing') return 0;
  if (/^(ECO|ACC|FAC|FIN|BKG|SCM|GLA|GLC|GLI|LOG|IOM|IIP|IBF|IBC|IBI|IEI|MGT|OBE|HRM|SYB|TTM|MAS202|SSB|RMB)/.test(code) && cat === 'economics') return 0;
  return 10;
}

export function courseMatchesCategory(
  course: Pick<Course, 'code' | 'name' | 'description'>,
  category: CourseCategory
): boolean {
  if (category === 'all') return true;
  return getCourseCategories(course).includes(category);
}
