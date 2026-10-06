import type { Question } from '../utils/quizParser';

export interface Mln122KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
}

export const MLN122_KNOWLEDGE_GROUPS: Mln122KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: 'Kinh tế chính trị Mác – Lênin',
    summary: 'Đối tượng, phương pháp, chức năng và lịch sử các trường phái kinh tế chính trị.',
  },
  {
    id: '2',
    number: 2,
    title: 'Sản xuất hàng hóa',
    summary: 'Điều kiện ra đời, phân công lao động xã hội và sự tách biệt kinh tế.',
  },
  {
    id: '3',
    number: 3,
    title: 'Hàng hóa – hai mặt của lao động',
    summary: 'Giá trị sử dụng, giá trị hàng hóa, lao động cụ thể và lao động trừu tượng.',
  },
  {
    id: '4',
    number: 4,
    title: 'Lượng giá trị hàng hóa',
    summary: 'Thời gian lao động xã hội cần thiết, năng suất và cường độ lao động.',
  },
  {
    id: '5',
    number: 5,
    title: 'Tiền tệ – giá cả',
    summary: 'Các hình thái giá trị, chức năng tiền tệ và những yếu tố ảnh hưởng giá cả.',
  },
  {
    id: '6',
    number: 6,
    title: 'Hàng hóa sức lao động – tư bản',
    summary: 'Sức lao động thành hàng hóa; tư bản bất biến, khả biến và công thức chung.',
  },
  {
    id: '7',
    number: 7,
    title: 'Giá trị thặng dư',
    summary: 'Nguồn gốc, tỷ suất và các phương pháp sản xuất giá trị thặng dư.',
  },
  {
    id: '8',
    number: 8,
    title: 'Tiền công',
    summary: 'Bản chất, tiền công danh nghĩa – thực tế và các hình thức trả công.',
  },
  {
    id: '9',
    number: 9,
    title: 'Tuần hoàn – chu chuyển – tích lũy',
    summary: 'Tuần hoàn tư bản, tái sản xuất, tích lũy và khủng hoảng thừa.',
  },
  {
    id: '10',
    number: 10,
    title: 'Lợi nhuận – địa tô',
    summary: 'Lợi nhuận bình quân, giá cả sản xuất và các loại địa tô.',
  },
  {
    id: '11',
    number: 11,
    title: 'Chủ nghĩa tư bản độc quyền',
    summary: 'Năm đặc điểm của chủ nghĩa tư bản độc quyền và các hình thức độc quyền.',
  },
  {
    id: '12',
    number: 12,
    title: 'Độc quyền nhà nước – chủ nghĩa tư bản hiện đại',
    summary: 'Liên minh độc quyền với nhà nước, điều tiết kinh tế và công ty xuyên quốc gia.',
  },
  {
    id: '13',
    number: 13,
    title: 'Kinh tế thị trường',
    summary: 'Cơ chế thị trường, cạnh tranh, cung cầu, chủ thể và lợi ích kinh tế.',
  },
  {
    id: '14',
    number: 14,
    title: 'Kinh tế thị trường định hướng XHCN Việt Nam',
    summary: 'Mục tiêu, thể chế, sở hữu, phân phối và vai trò Nhà nước, Đảng.',
  },
  {
    id: '15',
    number: 15,
    title: 'Công nghiệp hóa – cách mạng công nghiệp',
    summary: 'Các con đường công nghiệp hóa, bốn cuộc cách mạng công nghiệp và kinh tế tri thức.',
  },
  {
    id: '16',
    number: 16,
    title: 'Hội nhập kinh tế quốc tế – bài tập tính',
    summary: 'ASEAN, WTO, toàn cầu hóa và các bài tập tính về giá trị, tư bản, giá trị thặng dư.',
  },
];

interface ClassificationRule {
  groupId: string;
  pattern: RegExp;
  weight: number;
}

function normalizeText(text: string): string {
  return text
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  // Topic-specific phrases score more heavily than broad terms.
  { groupId: '14', pattern: /kinh te thi truong dinh huong xa hoi chu nghia|kttt dinh huong xhcn/, weight: 16 },
  { groupId: '14', pattern: /hoan thien the che|muc tieu.*dan giau nuoc manh|dai hoi ix|dai hoi vi|dai hoi xii/, weight: 11 },
  { groupId: '14', pattern: /vai tro.*dang|dang lanh dao|thanh phan kinh te.*viet nam|so huu.*viet nam|phan phoi.*viet nam|loi ich.*viet nam/, weight: 8 },
  { groupId: '14', pattern: /kinh te tu nhan.*viet nam|kinh te nha nuoc.*viet nam|thi truong chung khoan.*viet nam|nha nuoc phap quyen/, weight: 8 },

  { groupId: '12', pattern: /chu nghia tu ban doc quyen nha nuoc|doc quyen nha nuoc|doc quyen tu ban nha nuoc/, weight: 15 },
  { groupId: '12', pattern: /tap the tu ban khong lo|ket hop nhan su|so huu nha nuoc|cong ty xuyen quoc gia|tncs|t n c/, weight: 11 },
  { groupId: '12', pattern: /dieu tiet kinh te.*nha nuoc|nha nuoc.*to chuc doc quyen|to chuc doc quyen.*nha nuoc|chu nghia tu ban hien dai/, weight: 9 },
  { groupId: '12', pattern: /thuc dan moi|nuoc tu ban phat trien.*nuoc dang phat trien|cac nuoc le thuoc/, weight: 8 },
  { groupId: '12', pattern: /hinh thuc le thuoc moi|thuc dan.*le thuoc|thuoc dia kieu moi/, weight: 9 },
  { groupId: '12', pattern: /nha nuoc tu san dau tu thay|nha nuoc.*dau tu.*giai cap tu san|chinh phu nghi vien tu san|nghi vien.*cong ty co phan/, weight: 9 },

  { groupId: '11', pattern: /chu nghia tu ban doc quyen|tu ban doc quyen/, weight: 13 },
  { groupId: '11', pattern: /nam dac diem.*doc quyen|5 dac diem|cartel|cacten|syndicate|xanhdica|trust|t r u s t/, weight: 10 },
  { groupId: '11', pattern: /tu ban tai chinh|xuat khau tu ban|gia ca doc quyen|loi nhuan doc quyen|phan chia thi truong the gioi|phan chia lanh tho the gioi/, weight: 10 },
  { groupId: '11', pattern: /doc quyen hoa|to chuc doc quyen|doc quyen cong nghiep.*ngan hang|canh tranh.*doc quyen/, weight: 8 },
  { groupId: '11', pattern: /5 dac diem kinh te|doc quyen tu ban chu nghia thanh|trum tai chinh|doc quyen dau tien|doc quyen.*canh tranh/, weight: 8 },
  { groupId: '11', pattern: /tu ban tai chinh|lien ket cac doanh nghiep.*cung nganh|hinh thuc lien ket.*doc quyen/, weight: 8 },
  { groupId: '11', pattern: /lien ket cac doanh nghiep|co phieu|trai phieu|mua co phieu|dau tu.*co phieu/, weight: 7 },
  { groupId: '11', pattern: /nam dac diem kinh te cua chu nghia tu ban doc quyen|cuoc khung hoang.*doanh nghiep doc quyen/, weight: 8 },

  { groupId: '16', pattern: /hoi nhap kinh te quoc te|hoi nhap quoc te|viet nam gia nhap asean|viet nam gia nhap wto|asean|apec|asem|afta|wto/, weight: 12 },
  { groupId: '16', pattern: /toan cau hoa|khu vuc hoa|tac dong.*hoi nhap|loi ich.*hoi nhap|muc dich.*hoi nhap/, weight: 9 },
  { groupId: '16', pattern: /bai tap tinh|tinh gia tri hang hoa|so cong nhan|gia tri moi.*cong nhan|khoi luong gia tri thang du/, weight: 8 },
  { groupId: '16', pattern: /chu dong hoi nhap|da dang hoa thi truong|kinh te doi ngoai/, weight: 7 },

  { groupId: '15', pattern: /cach mang cong nghiep|cmcn|cong nghiep hoa|cong nghiep hoa hien dai hoa|cnh hdh/, weight: 11 },
  { groupId: '15', pattern: /lan thu nhat|lan thu hai|lan thu ba|lan thu tu/, weight: 3 },
  { groupId: '15', pattern: /kinh te tri thuc|big data|internet van vat|iot|tri tue nhan tao|john kay|may hoi nuoc/, weight: 10 },
  { groupId: '15', pattern: /hiep tac don gian|cong truong thu cong|dai cong nghiep|uu tien cong nghiep nang/, weight: 9 },
  { groupId: '15', pattern: /nuoc cong nghiep moi|nics|cac nuoc cong nghiep moi|con duong cong nghiep hoa/, weight: 9 },

  { groupId: '13', pattern: /kinh te thi truong/, weight: 7 },
  { groupId: '13', pattern: /co che thi truong|ban tay vo hinh|adam smith.*thi truong|chu the kinh te|loi ich kinh te/, weight: 10 },
  { groupId: '13', pattern: /canh tranh|cung va cau|quan he cung cau|quy luat cung cau|quy luat canh tranh/, weight: 7 },
  { groupId: '13', pattern: /kinh te hang hoa phat trien cao|uu diem.*kinh te thi truong|nhuoc diem.*kinh te thi truong|mam mong.*kinh te thi truong/, weight: 9 },
  { groupId: '13', pattern: /quy luat kinh te|quy luat gia tri|quy luat cung cau|cung la pham tru|cau duoc hieu|thi truong duoc hieu|cac loai thi truong|phan loai thi truong/, weight: 9 },
  { groupId: '13', pattern: /nhan to thuc day.*tang truong kinh te|tang truong kinh te|loi ich va quan he loi ich|quan he loi ich kinh te/, weight: 8 },
  { groupId: '13', pattern: /the che.*kinh te thi truong|phan loai the che|cac yeu to cau thanh.*the che|the che duoc hieu/, weight: 8 },
  { groupId: '13', pattern: /cung la pham tru|cau la pham tru|loi ich va quan he loi ich|cac loai thi truong|phan chia thi truong theo/, weight: 8 },
  { groupId: '13', pattern: /quan he kinh te.*bieu hien.*loi ich|quan he kinh te.*hinh thuc nao|the manh.*doanh nghiep vua va nho|bien dong cua thi truong/, weight: 8 },
  { groupId: '14', pattern: /the che duoc phan loai|phan chia the che|cac linh vuc cot loi.*the che|dan la goc|co so sau xa.*hinh thanh so huu|so huu hien thuc/, weight: 8 },
  { groupId: '14', pattern: /dai hoi.*dang cong san viet nam|dan giau nuoc manh|cong bang.*van minh|phan phoi.*cong bang|noi dung va hinh thuc cua so huu|dang cong san viet nam la dang cam quyen/, weight: 8 },
  { groupId: '14', pattern: /dang cong san viet nam.*xay dung nen kinh te|xay dung nen kinh te.*dang cong san/, weight: 11 },
  { groupId: '14', pattern: /so huu chiu su quy dinh|so huu.*trinh do luc luong san xuat/, weight: 8 },

  { groupId: '10', pattern: /loi nhuan binh quan|ty suat loi nhuan|gia ca san xuat|loi nhuan la gi|ban chat loi nhuan/, weight: 11 },
  { groupId: '10', pattern: /loi nhuan.*gia tri thang du|so sanh ty suat loi nhuan.*ty suat gia tri thang du/, weight: 7 },
  { groupId: '10', pattern: /dia to|dia to chenh lech|dia to tuyet doi|gia ca ruong dat|ruong dat/, weight: 11 },
  { groupId: '10', pattern: /chi phi san xuat tu ban|chi phi san xuat.*cong thuc|tu ban cho vay|lai tuc|loi tuc cho vay|tu ban thuong nghiep/, weight: 9 },
  { groupId: '10', pattern: /ve mat luong giua p m|p va m|loi nhuan.*phan thu nhap thang du/, weight: 8 },

  { groupId: '9', pattern: /tuan hoan tu ban|chu chuyen tu ban|toc do chu chuyen|thoi gian chu chuyen/, weight: 12 },
  { groupId: '9', pattern: /tu ban co dinh|tu ban luu dong|thoi gian san xuat|thoi gian luu thong/, weight: 9 },
  { groupId: '9', pattern: /tai san xuat don gian|tai san xuat mo rong|hai khu vuc tai san xuat|khu vuc i.*khu vuc ii/, weight: 10 },
  { groupId: '9', pattern: /tich luy tu ban|tich tu tu ban|tap trung tu ban|khung hoang thua|nguon goc tich luy/, weight: 10 },
  { groupId: '9', pattern: /tai san xuat tu ban xa hoi|tai san xuat xa hoi|tuan hoan cua tu ban cong nghiep|khung hoang kinh te|khung hoang thua/, weight: 9 },
  { groupId: '9', pattern: /hao mon huu hinh|hao mon vo hinh|tu ban co dinh|tu ban luu dong|noi dung co ban cua tai san xuat/, weight: 8 },
  { groupId: '9', pattern: /xu huong chung cua san xuat tu ban|phuong thuc san xuat tu ban.*thay the|kinh te hang hoa ra doi sau/, weight: 7 },

  { groupId: '8', pattern: /tien cong danh nghia|tien cong thuc te|tien cong theo thoi gian|tien cong theo san pham/, weight: 12 },
  { groupId: '8', pattern: /ban chat tien cong|tien cong la gia ca|hinh thuc tien cong/, weight: 10 },
  { groupId: '8', pattern: /tien cong|tien luong/, weight: 10 },

  { groupId: '7', pattern: /gia tri thang du|gttd|gia tri thang du tuyet doi|gia tri thang du tuong doi|gia tri thang du sieu ngach/, weight: 11 },
  { groupId: '7', pattern: /ty suat gia tri thang du|muc do boc lot|phuong phap san xuat.*gia tri thang du|thoi gian lao dong tat yeu|thoi gian lao dong thang du/, weight: 10 },
  { groupId: '7', pattern: /nguon goc.*gia tri thang du|muc dich truc tiep.*san xuat tu ban|m tren v|m chia v/, weight: 9 },
  { groupId: '7', pattern: /quy luat kinh te co ban cua chu nghia tu ban|ban chat boc lot.*gia tri thang du/, weight: 9 },

  { groupId: '6', pattern: /hang hoa suc lao dong|suc lao dong tro thanh hang hoa|gia tri su dung.*suc lao dong/, weight: 12 },
  { groupId: '6', pattern: /tu ban bat bien|tu ban kha bien|cau tao huu co cua tu ban|cau tao ky thuat.*tu ban|cau tao gia tri.*tu ban/, weight: 11 },
  { groupId: '6', pattern: /cong thuc chung cua tu ban|tien tro thanh tu ban|t h t|tu ban la gi|ban chat cua tu ban/, weight: 9 },
  { groupId: '6', pattern: /gia tri hang hoa suc lao dong|dieu kien.*suc lao dong.*hang hoa/, weight: 10 },
  { groupId: '6', pattern: /gia tri suc lao dong duoc do|nguoi cong nhan ban|mua ban suc lao dong.*mua ban no le/, weight: 9 },

  { groupId: '5', pattern: /chuc nang cua tien|tien te co.*chuc nang|thuc do gia tri|phuong tien luu thong|phuong tien cat tru|phuong tien thanh toan|tien te the gioi/, weight: 11 },
  { groupId: '5', pattern: /hinh thai tien te|hinh thai gia tri.*tien te|tien te xuat hien|su ra doi cua tien/, weight: 10 },
  { groupId: '5', pattern: /gia tri va gia ca|moi quan he.*gia tri.*gia ca|gia ca thi truong|cac yeu to anh huong.*gia ca|lam phat phi ma/, weight: 10 },
  { groupId: '5', pattern: /gia ca.*cung cau|cung cau.*gia ca|suc mua cua tien/, weight: 8 },
  { groupId: '5', pattern: /gia ca hang hoa|gia ca.*hang hoa|yeu to quyet dinh.*gia ca|gia tri danh nghia|gia tri thuc cua.*tien|tien can thiet trong luu thong/, weight: 9 },
  { groupId: '5', pattern: /banh xe.*luu thong|tien te la.*luu thong|luu thong hang hoa.*tien te|vat ngang gia chung/, weight: 8 },
  { groupId: '5', pattern: /lam phat|luong tien can thiet.*luu thong/, weight: 8 },

  { groupId: '4', pattern: /luong gia tri hang hoa|luong gia tri cua hang hoa|thoi gian lao dong xa hoi can thiet/, weight: 12 },
  { groupId: '4', pattern: /nang suat lao dong|cuong do lao dong|gia tri mot don vi hang hoa|gia tri 1 don vi hang hoa/, weight: 10 },
  { groupId: '4', pattern: /nang suat.*ty le nghich|cuong do.*tong gia tri|tang nang suat lao dong|tang cuong do lao dong/, weight: 10 },
  { groupId: '4', pattern: /gia tri ca biet|gia tri xa hoi.*hang hoa|hao phi lao dong ca biet|quy luat gia tri.*hao phi lao dong/, weight: 8 },

  { groupId: '3', pattern: /hai thuoc tinh cua hang hoa|gia tri su dung|gia tri trao doi/, weight: 10 },
  { groupId: '3', pattern: /hai mat cua lao dong|lao dong cu the|lao dong truu tuong/, weight: 11 },
  { groupId: '3', pattern: /gia tri hang hoa la gi|ban chat cua gia tri hang hoa|hang hoa co.*thuoc tinh/, weight: 9 },
  { groupId: '3', pattern: /lao dong gian don|lao dong phuc tap|khoa hoc ky thuat.*gia tri su dung/, weight: 8 },
  { groupId: '3', pattern: /san pham lao dong.*muc dich|dich vu.*hang hoa|hai hang hoa trao doi|co so chung.*quan he trao doi|trao doi.*ngang gia/, weight: 8 },
  { groupId: '3', pattern: /thuoc tinh gia tri.*hang hoa|gia tri.*trao doi hang hoa|hang hoa ca nhan|hang hoa duoc trao doi/, weight: 7 },
  { groupId: '3', pattern: /san pham va hang hoa|nguon goc cua gia tri hang hoa|gia tri hang hoa duoc tao ra|nguon goc gia tri hang hoa|loai hang hoa/, weight: 8 },

  { groupId: '2', pattern: /san xuat hang hoa|dieu kien.*san xuat hang hoa|ra doi.*san xuat hang hoa/, weight: 12 },
  { groupId: '2', pattern: /phan cong lao dong xa hoi|dai phan cong lao dong|tach biet.*kinh te|quyen so huu.*chu the/, weight: 10 },
  { groupId: '2', pattern: /chan nuoi tach khoi trong trot|thu cong nghiep tach khoi nong nghiep|thuong nghiep ra doi/, weight: 11 },
  { groupId: '2', pattern: /san xuat va trao doi hang hoa.*tien de|dieu kien ton tai.*hang hoa/, weight: 9 },
  { groupId: '2', pattern: /san xuat tu cung tu cap|qua trinh san xuat|san xuat vat chat|tu lieu san xuat|tu lieu lao dong|doi tuong lao dong/, weight: 7 },
  { groupId: '2', pattern: /cac yeu to cua qua trinh san xuat|ket hop.*tu lieu lao dong|san xuat ra tu lieu sinh hoat|hao phi lao dong.*san xuat/, weight: 8 },
  { groupId: '2', pattern: /lao dong san xuat|vai tro.*lao dong|cac phuong thuc san xuat|phuong thuc san xuat.*lich su|phuong thuc san xuat tu ban|quan he san xuat.*luc luong san xuat|luc luong san xuat.*quan he san xuat/, weight: 8 },
  { groupId: '2', pattern: /kinh te hang hoa la su tiep noi|san xuat hang hoa.*ton tai|hang hoa.*muc dich gi/, weight: 8 },
  { groupId: '2', pattern: /lao dong tu nhan doc lap|san pham.*lao dong tu nhan|muc do giau co cua xa hoi|khoi luong san pham thang du|sach su tach biet ve so huu/, weight: 8 },
  { groupId: '2', pattern: /xa hoi loai nguoi.*tach biet ve so huu|san pham.*trao doi.*hang hoa/, weight: 8 },

  { groupId: '1', pattern: /kinh te chinh tri mac lenin|doi tuong nghien cuu.*kinh te chinh tri|phuong phap nghien cuu.*kinh te chinh tri/, weight: 12 },
  { groupId: '1', pattern: /truu tuong hoa khoa hoc|chuc nang.*kinh te chinh tri|co dien anh|adam smith|david ricardo|william petty|aristoteles|xenophon/, weight: 10 },
  { groupId: '1', pattern: /chu nghia trong thuong|chu nghia trong nong|lich su.*kinh te chinh tri|thuat ngu kinh te chinh tri/, weight: 9 },
  { groupId: '1', pattern: /doi tuong cua kinh te chinh tri|kinh te chinh tri la gi|kinh te chinh tri co may chuc nang/, weight: 10 },
  { groupId: '1', pattern: /truong phai kinh te chinh tri|chu nghia trong thuong|chu nghia trong nong|truong phai trong thuong|truong phai trong nong/, weight: 9 },
  { groupId: '1', pattern: /adam smith.*kinh te chinh tri|ricardo|petty|aristoteles|xenophon|thuat ngu.*kinh te chinh tri/, weight: 8 },
  { groupId: '1', pattern: /ba loai thuong nghiep|thuong nghiep.*trao doi tu nhien|kinh te chinh tri hoc tu san co dien anh|tu tuong kinh te dau tien cua giai cap tu san|chu nghia tu ban ra doi.*nguyen nhan/, weight: 8 },
  { groupId: '1', pattern: /vai tro tich cuc.*chu nghia tu ban|han che.*chu nghia tu ban|thanh tuu.*chu nghia tu ban|chu nghia tu ban.*thanh tuu|gioi han phat trien cua chu nghia tu ban/, weight: 7 },
  { groupId: '11', pattern: /han che.*chu nghia tu ban|thanh tuu.*chu nghia tu ban|chu nghia tu ban.*thanh tuu|gioi han phat trien cua chu nghia tu ban/, weight: 7 },
  { groupId: '14', pattern: /doi moi.*dan la goc|quy luat quan he san xuat.*phu hop.*luc luong san xuat/, weight: 8 },
  { groupId: '14', pattern: /dai hoi.*dang cong san viet nam|dan lam goc|dan giau nuoc manh|cong bang.*van minh|phan phoi.*cong bang|so huu hien thuc|noi dung va hinh thuc cua so huu|dang cong san viet nam la dang cam quyen/, weight: 8 },
  { groupId: '14', pattern: /quan he loi ich.*chu the|loi ich.*quan he loi ich|muc tieu.*xa hoi chu nghia/, weight: 7 },
];

const NUMERIC_EXERCISE_PATTERN = /\b(?:w\s*=\s*c\s*\+\s*v\s*\+\s*m|m\s*'?\s*=\s*m\s*\/\s*v|p\s*'?\s*=\s*m\s*\/\s*\(\s*c\s*\+\s*v\s*\)|c\s*=\s*[\d.,]+|v\s*=\s*[\d.,]+|m\s*'?\s*=\s*[\d.,]+|p\s*'?\s*=\s*[\d.,]+)\b/i;

export function getMln122KnowledgeGroupId(question: Question): string {
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

  if (NUMERIC_EXERCISE_PATTERN.test(question.text)) {
    scores.set('16', (scores.get('16') ?? 0) + 30);
  } else if (
    /\d/.test(question.text)
    && /\b(?:tinh (?:gia tri|so|khoi luong|ty suat|toan)|bang bao nhieu|cho biet|x|cong nhan)\b/i.test(questionText)
  ) {
    scores.set('16', (scores.get('16') ?? 0) + 14);
  }

  let bestGroupId = '1';
  let bestScore = 0;
  for (const group of MLN122_KNOWLEDGE_GROUPS) {
    const score = scores.get(group.id) ?? 0;
    if (score > bestScore) {
      bestGroupId = group.id;
      bestScore = score;
    }
  }

  // Group 1 is the introductory KTCT topic and the fallback for general questions.
  return bestGroupId;
}

export function getMln122QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  return questions.filter((question) => getMln122KnowledgeGroupId(question) === groupId);
}
