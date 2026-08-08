export interface FlashcardItem {
  id: number;
  term: string;
  definition: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  category: string;
  badge?: string;
  cards: FlashcardItem[];
}

export const FLASHCARD_SETS: FlashcardSet[] = [
  {
    id: 'flashcard_pmg201c_terms',
    title: 'Thuật ngữ PMG201c',
    description:
      'Bộ 32 thuật ngữ quan trọng trong môn PMG201c — Project Charter, WBS, Deliverables, Deployment và nhiều hơn nữa.',
    category: 'Môn PMG201c',
    badge: '32 thuật ngữ',
    cards: [
      {
        id: 1,
        term: 'Project Charter',
        definition: 'Tài liệu chính thức khởi tạo dự án, cấp quyền cho PM',
      },
      {
        id: 2,
        term: 'Sponsor',
        definition:
          'Người tài trợ, phê duyệt và cấp nguồn lực cho dự án',
      },
      {
        id: 3,
        term: 'Milestones',
        definition: 'Các mốc quan trọng trong dự án',
      },
      {
        id: 4,
        term: 'Project Initiation',
        definition:
          'Giai đoạn bắt đầu, xác định mục tiêu và phê duyệt dự án',
      },
      {
        id: 5,
        term: 'Project Planning',
        definition: 'Giai đoạn lập kế hoạch chi tiết cho dự án',
      },
      {
        id: 6,
        term: 'Project Executing',
        definition: 'Giai đoạn thực hiện công việc dự án',
      },
      {
        id: 7,
        term: 'Pre-launch',
        definition:
          'Giai đoạn chuẩn bị trước khi ra mắt sản phẩm',
      },
      {
        id: 8,
        term: 'Launch',
        definition:
          'Giai đoạn chính thức đưa sản phẩm ra thị trường',
      },
      {
        id: 9,
        term: 'Post-launch',
        definition:
          'Giai đoạn sau khi ra mắt, đánh giá và cải tiến',
      },
      {
        id: 10,
        term: 'Project Monitoring',
        definition: 'Theo dõi và kiểm soát tiến độ, hiệu suất',
      },
      {
        id: 11,
        term: 'Project Closing',
        definition:
          'Kết thúc dự án, tổng kết và lưu trữ tài liệu',
      },
      {
        id: 12,
        term: 'Deliverables',
        definition: 'Sản phẩm/kết quả cần bàn giao của dự án',
      },
      {
        id: 13,
        term: 'Market Penetration',
        definition: 'Mức độ sản phẩm tiếp cận thị trường',
      },
      {
        id: 14,
        term: 'Brand Awareness',
        definition: 'Mức độ nhận diện thương hiệu',
      },
      {
        id: 15,
        term: 'Customer Satisfaction',
        definition: 'Mức độ hài lòng của khách hàng',
      },
      {
        id: 16,
        term: 'WBS',
        definition:
          'Cấu trúc phân rã công việc theo cấp bậc',
      },
      {
        id: 17,
        term: 'Decomposition',
        definition:
          'Chia nhỏ công việc thành các phần nhỏ hơn',
      },
      {
        id: 18,
        term: 'Requirements Gathering and Analysis',
        definition:
          'Thu thập và phân tích yêu cầu từ stakeholder',
      },
      {
        id: 19,
        term: 'Software Requirements Specification (SRS) Document',
        definition:
          'Tài liệu mô tả chi tiết toàn bộ yêu cầu hệ thống',
      },
      {
        id: 20,
        term: 'System Design',
        definition:
          'Thiết kế tổng thể hệ thống (architecture, module)',
      },
      {
        id: 21,
        term: 'Basic Design',
        definition: 'Thiết kế ở mức high-level',
      },
      {
        id: 22,
        term: 'Detail Design',
        definition:
          'Thiết kế chi tiết từng module, logic xử lý',
      },
      {
        id: 23,
        term: 'Development and UT Testing',
        definition:
          'Lập trình và kiểm thử đơn vị (Unit Test)',
      },
      {
        id: 24,
        term: 'Code Package',
        definition: 'Bộ source code hoàn chỉnh của hệ thống',
      },
      {
        id: 25,
        term: 'Test Plan',
        definition:
          'Kế hoạch kiểm thử (scope, strategy, timeline)',
      },
      {
        id: 26,
        term: 'Test Scenario',
        definition: 'Kịch bản kiểm thử tổng quát',
      },
      {
        id: 27,
        term: 'Test Case',
        definition:
          'Các bước test chi tiết + expected result',
      },
      {
        id: 28,
        term: 'Deployment',
        definition:
          'Triển khai hệ thống lên môi trường thật',
      },
      {
        id: 29,
        term: 'Fix Bug',
        definition: 'Sửa lỗi phát sinh sau khi release',
      },
      {
        id: 30,
        term: 'Maintenance Phase',
        definition: 'Bảo trì, nâng cấp hệ thống',
      },
      {
        id: 31,
        term: 'Deliverables (chi tiết)',
        definition:
          'Sản phẩm/kết quả cụ thể mà dự án phải hoàn thành và bàn giao',
      },
      {
        id: 32,
        term: 'Assumption',
        definition:
          'Giả định được đưa ra là đúng để lập kế hoạch, dù chưa chắc chắn 100%',
      },
    ],
  },
];
