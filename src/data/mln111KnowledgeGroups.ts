import type { Question } from '../utils/quizParser';

export interface Mln111KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
}

export const MLN111_KNOWLEDGE_GROUPS: Mln111KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: 'Duy tâm chủ quan – duy tâm khách quan – duy vật – nhị nguyên',
    summary: 'Nhận diện trường phái triết học qua lập trường và câu phát biểu.',
  },
  {
    id: '2',
    number: 2,
    title: 'Vấn đề cơ bản của triết học',
    summary: 'Vật chất hay ý thức có trước; con người có nhận thức được thế giới không?',
  },
  {
    id: '3',
    number: 3,
    title: 'Khả tri – bất khả tri',
    summary: 'Quan điểm về khả năng con người nhận thức thế giới.',
  },
  {
    id: '4',
    number: 4,
    title: 'Biện chứng – siêu hình',
    summary: 'Xem xét sự vật trong liên hệ, vận động, phát triển hay cô lập, tĩnh tại.',
  },
  {
    id: '5',
    number: 5,
    title: 'Vật chất – ý thức',
    summary: 'Định nghĩa vật chất của Lênin, nguồn gốc ý thức và quan hệ giữa hai mặt.',
  },
  {
    id: '6',
    number: 6,
    title: 'Vận động – đứng im – không gian – thời gian',
    summary: 'Phương thức và những hình thức tồn tại của vật chất.',
  },
  {
    id: '7',
    number: 7,
    title: 'Hai nguyên lý phép biện chứng',
    summary: 'Mối liên hệ phổ biến và sự phát triển.',
  },
  {
    id: '8',
    number: 8,
    title: 'Ba quy luật phép biện chứng',
    summary: 'Mâu thuẫn; lượng – chất; phủ định của phủ định.',
  },
  {
    id: '9',
    number: 9,
    title: 'Các cặp phạm trù',
    summary: 'Riêng – chung, nguyên nhân – kết quả, tất nhiên – ngẫu nhiên và các cặp khác.',
  },
  {
    id: '10',
    number: 10,
    title: 'Nhận thức luận',
    summary: 'Cảm tính – lý tính, kinh nghiệm – lý luận, thực tiễn và chân lý.',
  },
  {
    id: '11',
    number: 11,
    title: 'LLSX – QHSX – phương thức sản xuất',
    summary: 'Quan hệ giữa lực lượng sản xuất và quan hệ sản xuất.',
  },
  {
    id: '12',
    number: 12,
    title: 'CSHT – KTTT',
    summary: 'Cơ sở hạ tầng quyết định kiến trúc thượng tầng và tác động trở lại.',
  },
  {
    id: '13',
    number: 13,
    title: 'Tồn tại xã hội – ý thức xã hội – HTKT-XH',
    summary: 'Quan hệ giữa tồn tại xã hội, ý thức xã hội và hình thái kinh tế – xã hội.',
  },
  {
    id: '14',
    number: 14,
    title: 'Giai cấp – đấu tranh giai cấp – nhà nước – cách mạng',
    summary: 'Nguồn gốc, bản chất và vai trò của giai cấp, nhà nước, cách mạng.',
  },
  {
    id: '15',
    number: 15,
    title: 'Quần chúng – lãnh tụ – con người – cá nhân – tha hóa',
    summary: 'Ai sáng tạo lịch sử; vai trò quần chúng, lãnh tụ và bản chất con người.',
  },
  {
    id: '16',
    number: 16,
    title: 'Lịch sử triết học – Mác-Lênin – KTCT – CNXH',
    summary: 'Các nhà triết học, lịch sử tư tưởng và những nội dung KTCT, CNXH.',
  },
];

interface ClassificationRule {
  groupId: string;
  pattern: RegExp;
  weight: number;
}

// Normalize Vietnamese text before matching so source spelling variants do not
// make questions disappear from their knowledge group.
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
  // The most specific concepts come first; broad ideas are scored lower.
  { groupId: '2', pattern: /van de co ban cua triet hoc|tu duy va ton tai|ton tai va tu duy/, weight: 12 },
  { groupId: '2', pattern: /triet hoc co may van de|triet hoc co mot van de|may mat cua van de co ban/, weight: 10 },
  { groupId: '2', pattern: /mat thu nhat|mat thu hai/, weight: 7 },
  { groupId: '2', pattern: /cai nao co truoc.*cai nao quyet dinh|co truoc.*co sau.*quyet dinh/, weight: 6 },
  { groupId: '2', pattern: /hai khai niem.*cai nao.*co truoc|trong hai khai niem.*co truoc/, weight: 12 },

  { groupId: '3', pattern: /kha tri|bat kha tri|thuyet khong the biet/, weight: 12 },
  { groupId: '3', pattern: /kha nang nhan thuc duoc the gioi|co the nhan thuc duoc the gioi/, weight: 7 },
  { groupId: '3', pattern: /quy luat tu nhien deu la gia thuyet|kha nang biet the gioi/, weight: 6 },

  { groupId: '6', pattern: /dung im|van dong|khong gian|thoi gian/, weight: 10 },
  { groupId: '6', pattern: /hinh thuc ton tai cua vat chat|phuong thuc ton tai cua vat chat/, weight: 11 },

  { groupId: '8', pattern: /quy luat thong nhat va dau tranh|thong nhat va dau tranh giua cac mat doi lap/, weight: 12 },
  { groupId: '8', pattern: /luong va chat|luong chat|do va diem nut|buoc nhay/, weight: 11 },
  { groupId: '8', pattern: /phu dinh cua phu dinh|phu dinh bien chung/, weight: 12 },
  { groupId: '8', pattern: /quy luat.*mau thuan|quy luat.*phu dinh|quy luat.*luong/, weight: 9 },
  { groupId: '8', pattern: /thay doi ve luong|bien doi ve luong|luong.*chat|chat.*luong|buoc nhay|diem nut/, weight: 8 },
  { groupId: '8', pattern: /khong phai moi su thay doi ve luong|dac diem cua quy luat triet hoc/, weight: 9 },
  { groupId: '8', pattern: /diem xuat phat.*mau thuan|mau thuan von co cua chung/, weight: 10 },

  { groupId: '9', pattern: /nguyen nhan va ket qua|ket qua va nguyen nhan|tat nhien va ngau nhien|ngau nhien va tat nhien/, weight: 12 },
  { groupId: '9', pattern: /noi dung va hinh thuc|ban chat va hien tuong|kha nang va hien thuc|cai rieng va cai chung|cai chung va cai rieng/, weight: 12 },
  { groupId: '9', pattern: /pham tru nguyen nhan|pham tru ket qua|pham tru tat nhien|pham tru ngau nhien|pham tru noi dung|pham tru hinh thuc|pham tru ban chat|pham tru hien tuong/, weight: 10 },
  { groupId: '9', pattern: /nguyen nhan la pham tru|cai ngau nhien la cai|cai rieng la mot pham tru|kha nang hay hien thuc|quan he nhan qua|cap pham tru/, weight: 10 },
  { groupId: '9', pattern: /nhan qua|cai ngau nhien|cai rieng/, weight: 6 },
  { groupId: '9', pattern: /tong hop nhung mat.*yeu to.*tao nen su vat|doi ngheo.*dot nat|hien tuong nao la nguyen nhan.*ket qua/, weight: 9 },
  { groupId: '9', pattern: /cai ma nguoi ta qua quyet.*cau thanh|duoc coi la.*hinh thuc trong do an nap/, weight: 9 },
  { groupId: '9', pattern: /trong thuc te chung ta phai dua vao/, weight: 11 },

  { groupId: '11', pattern: /luc luong san xuat|quan he san xuat|phuong thuc san xuat/, weight: 11 },
  { groupId: '11', pattern: /tu lieu san xuat|cong cu lao dong|phan cong lao dong/, weight: 6 },
  { groupId: '11', pattern: /san xuat vat chat|tu lieu lao dong|quan he nguoi voi nguoi trong qua trinh san xuat|cac mat cua phuong thuc san xuat/, weight: 8 },
  { groupId: '11', pattern: /hanh vi lich su dau tien.*san xuat|san xuat ra.*tu lieu sinh hoat|san xuat vat chat la/, weight: 9 },
  { groupId: '11', pattern: /loai hinh san xuat|cac loai hinh san xuat|cac hinh thuc san xuat co ban/, weight: 12 },
  { groupId: '11', pattern: /llsx|qhsx|llsx va qhsx|qhsx va llsx/, weight: 10 },
  { groupId: '11', pattern: /phuong thuc san xuat.*duoc tao nen|quan he san xuat.*luc luong san xuat|luc luong san xuat.*quan he san xuat/, weight: 9 },

  { groupId: '12', pattern: /co so ha tang|kien truc thuong tang|csht|kttt/, weight: 12 },

  { groupId: '13', pattern: /ton tai xa hoi|y thuc xa hoi|hinh thai kinh te xa hoi/, weight: 12 },
  { groupId: '13', pattern: /phuong thuc san xuat.*hinh thai|co so kinh te cua xa hoi/, weight: 7 },
  { groupId: '13', pattern: /dieu kien sinh hoat vat chat cua xa hoi|quan he xa hoi quyet dinh|chu nghia duy vat lich su.*xa hoi/, weight: 8 },
  { groupId: '13', pattern: /nhan to quyet dinh.*hinh thai kinh te xa hoi|dieu kien sinh hoat vat chat.*xa hoi|nhan to.*xu huong phat trien xa hoi/, weight: 9 },
  { groupId: '13', pattern: /htkt xh|hinh thai kt xh|ttxh|ytsx/, weight: 10 },
  { groupId: '13', pattern: /quan he co ban nhat.*quyet dinh.*xa hoi|yeu to co ban nhat.*dieu kien sinh hoat vat chat/, weight: 8 },
  { groupId: '13', pattern: /quan he co ban nhat.*quyet dinh.*quan he xa hoi/, weight: 12 },
  { groupId: '13', pattern: /duy vat ve lich su|nhan to quyet dinh trong lich su|he tu tuong thong tri xa hoi|tup leu tranh.*cung dien/, weight: 10 },
  { groupId: '13', pattern: /he thong.*quan diem duy vat.*xa hoi|nguon goc.*dong luc.*xa hoi.*lich su/, weight: 10 },

  { groupId: '14', pattern: /dau tranh giai cap|nguon goc giai cap|ban chat giai cap/, weight: 12 },
  { groupId: '14', pattern: /nha nuoc|cach mang xa hoi|cach mang vo san/, weight: 7 },
  { groupId: '14', pattern: /giai cap/, weight: 4 },
  { groupId: '14', pattern: /giai cap thong tri|thuc chat.*dau tranh|cach mang xa hoi chu nghia|nguon goc sau xa cua cac cuoc cach mang|dinh nghia giai cap cua lenin/, weight: 9 },
  { groupId: '14', pattern: /thang loi cuoi cung.*che do xa hoi|thang loi.*trat tu xa hoi moi|nhan to.*thang loi.*xa hoi moi/, weight: 9 },
  { groupId: '14', pattern: /su ra doi.*nha nuoc|duy vat lich su.*nha nuoc|nha nuoc.*mau thuan giai cap/, weight: 12 },
  { groupId: '14', pattern: /dinh cao.*dau tranh giai cap/, weight: 10 },

  { groupId: '15', pattern: /quan chung nhan dan|vai tro cua quan chung|lanh tu|tha hoa/, weight: 11 },
  { groupId: '15', pattern: /ban chat con nguoi|con nguoi la tong hoa|ca nhan va xa hoi|ca nhan/, weight: 8 },
  { groupId: '15', pattern: /chu the sang tao.*lich su|sang tao chan chinh ra lich su|quan diem.*van de con nguoi/, weight: 8 },
  { groupId: '15', pattern: /quan diem tien bo.*van de con nguoi|tieu chi.*pham chat.*ca nhan|pham chat cua moi ca nhan/, weight: 12 },
  { groupId: '15', pattern: /quan diem.*con nguoi.*mac lenin|tieu chi co ban.*pham chat cua moi ca nhan/, weight: 11 },

  { groupId: '7', pattern: /moi lien he pho bien|nguyen ly ve moi lien he|nguyen ly moi lien he/, weight: 12 },
  { groupId: '7', pattern: /nguyen ly ve su phat trien|nguyen ly phat trien/, weight: 12 },
  { groupId: '7', pattern: /cac moi lien he|tinh chat cua moi lien he|quan diem phat trien/, weight: 8 },
  { groupId: '7', pattern: /tac dong qua lai.*chuyen hoa lan nhau|quy dinh.*tac dong qua lai.*chuyen hoa|tinh pho bien/, weight: 8 },
  { groupId: '7', pattern: /phat trien la qua trinh|tinh chat cua su phat trien|su vat moi ra doi.*su vat cu|ke thua.*su vat cu/, weight: 9 },
  { groupId: '7', pattern: /moi lien he ton tai o moi su vat|tinh chat nao cua moi lien he|moi lien he.*pho bien/, weight: 12 },
  { groupId: '7', pattern: /moi lien he.*ton tai o moi su vat|moi lien he.*ten tai o moi su vat|bat ky mot su vat.*moi lien he|bat ky su vat.*moi lien he|cac moi lien he.*phat trien/, weight: 12 },
  { groupId: '7', pattern: /su vat khi moi ra doi.*ton tai duoi dang|tinh chat nao cua phat trien/, weight: 9 },

  { groupId: '10', pattern: /nhan thuc cam tinh|nhan thuc ly tinh|nhan thuc luan|ly luan nhan thuc/, weight: 11 },
  { groupId: '10', pattern: /thuc tien|chan ly|tri thuc kinh nghiem|tri thuc ly luan/, weight: 8 },
  { groupId: '10', pattern: /cam giac|tri giac|bieu tuong/, weight: 5 },
  { groupId: '10', pattern: /ly luan va kinh nghiem|kinh nghiem va ly luan|nhan thuc di tu|di tu cam tinh den ly tinh/, weight: 9 },
  { groupId: '10', pattern: /tieu chuan cua chan ly|tieu chuan chan ly|nhan thuc di tu.*ban chat/, weight: 10 },
  { groupId: '10', pattern: /quan diem ve doi song.*thuc tien|ly luan nhan thuc/, weight: 8 },
  { groupId: '10', pattern: /dinh nghia nhan thuc|nhan thuc la qua trinh phan anh|phan anh.*the gioi khach quan.*bo oc con nguoi/, weight: 10 },

  { groupId: '1', pattern: /duy tam chu quan|duy tam khach quan|chu nghia duy tam|nhi nguyen luan|nhi nguyen/, weight: 11 },
  { groupId: '1', pattern: /duy vat sieu hinh|duy vat bien chung/, weight: 4 },
  { groupId: '1', pattern: /duy tam|duy vat(?! (?:ve )?lich su| bien chung| sieu hinh)|nhi nguyen/, weight: 5 },
  { groupId: '1', pattern: /chu nghia duy vat(?! (?:ve )?lich su| bien chung| sieu hinh)|truong phai duy vat|truong phai duy tam/, weight: 6 },
  { groupId: '1', pattern: /ban nguyen cua the gioi|ban chat the gioi la vat chat/, weight: 5 },
  { groupId: '1', pattern: /the gioi quan duoc hieu|the gioi quan la gi|chu quan duy y chi/, weight: 7 },
  { groupId: '1', pattern: /thales|heraclitus|anaximenes/, weight: 6 },
  { groupId: '1', pattern: /truong phai triet hoc nao|cac hinh thuc.*chu nghia duy vat|duy vat la truong phai triet hoc|quan diem nao thuoc chu nghia duy tam/, weight: 11 },
  { groupId: '1', pattern: /the gioi quan duy vat bien chung|the gioi quan khoa hoc.*hat nhan ly luan/, weight: 10 },

  { groupId: '5', pattern: /dinh nghia vat chat cua lenin|vat chat la pham tru triet hoc/, weight: 12 },
  { groupId: '5', pattern: /dinh nghia.*vat chat|vat chat nhu sau|pham tru vat chat/, weight: 12 },
  { groupId: '5', pattern: /nguon goc y thuc|ban chat cua y thuc|ban chat y thuc|y thuc phan anh/, weight: 10 },
  { groupId: '5', pattern: /vat chat quyet dinh y thuc|y thuc tac dong tro lai vat chat|moi quan he giua vat chat va y thuc/, weight: 10 },
  { groupId: '5', pattern: /hinh anh chu quan|dieu kien can va du de sinh ra y thuc|phan anh co tinh chu dong|khach quan la cai dang ton tai/, weight: 8 },
  { groupId: '5', pattern: /dong vat bac cao.*hinh thuc phan anh|lao dong va ngon ngu.*chuyen bien/, weight: 10 },
  { groupId: '5', pattern: /vat chat|y thuc/, weight: 4 },

  { groupId: '4', pattern: /phuong phap bien chung|phuong phap sieu hinh|bien chung|sieu hinh/, weight: 7 },
  { groupId: '4', pattern: /phuong phap rut ra ket qua rieng|khong tinh den su ton tai thuc te/, weight: 9 },
  { groupId: '4', pattern: /phuong phap luan la ly luan chung|phuong phap luan/, weight: 7 },
  { groupId: '4', pattern: /pha huy hoan toan cai cu|lap truong nao.*phat trien dien ra theo con duong tron/, weight: 10 },
  { groupId: '4', pattern: /phat trien dien ra theo con duong tron|lap lai don thuan cai cu/, weight: 12 },

  { groupId: '16', pattern: /lich su triet hoc|kinh te chinh tri|gia tri thang du|gia tri su dung|gia tri trao doi|hang hoa|tu ban chu nghia|chu nghia xa hoi khong tuong/, weight: 12 },
  { groupId: '16', pattern: /phat minh.*mac|mac.*phat minh|cong lao.*mac|mac.*cong lao/, weight: 11 },
  { groupId: '16', pattern: /triet hoc ra doi tu dau|su ra doi cua triet hoc|triet hoc mac lenin ra doi/, weight: 9 },
  { groupId: '16', pattern: /triet hoc mac lenin|chu nghia mac lenin|triet gia mac/, weight: 8 },
  { groupId: '16', pattern: /nguon goc ly luan cua chu nghia mac|tien de.*chu nghia mac lenin|chu nghia mac lenin.*ba bo phan|ba bo phan cau thanh/, weight: 9 },
  { groupId: '16', pattern: /triet hoc thoi trung co|phat trien cua chu nghia mac lenin/, weight: 8 },
  { groupId: '16', pattern: /nguon goc ra doi cua triet hoc|nguyen nhan ra doi cua triet hoc|tri thuc cua nhan loai.*thoi ky nao/, weight: 9 },
  { groupId: '16', pattern: /thoi ky phuc hung|triet hoc.*thoi ky/, weight: 8 },
  { groupId: '16', pattern: /thuat ngu.*triet hoc.*su dung lan dau tien|triet hoc.*su dung lan dau tien/, weight: 9 },
  { groupId: '16', pattern: /giai cap cong nhan|chu nghia xa hoi|tu ban|tien te|tu ban bat bien/, weight: 8 },
  { groupId: '16', pattern: /ktct|cnxh|gccn/, weight: 10 },
  { groupId: '16', pattern: /heghen|hegel|phoiobach|phoio bac|saint simon|xanh ximong|fourier|phourie|owen|mac|angghen|lenin/, weight: 3 },
];

export function getMln111KnowledgeGroupId(question: Question): string {
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

  let bestGroupId = '16';
  let bestScore = 0;
  for (const group of MLN111_KNOWLEDGE_GROUPS) {
    const score = scores.get(group.id) ?? 0;
    if (score > bestScore) {
      bestGroupId = group.id;
      bestScore = score;
    }
  }

  // Group 16 includes cross-topic and historical/economic questions that do
  // not contain one of the more specific concepts above.
  return bestGroupId;
}

export function getMln111QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  return questions.filter((question) => getMln111KnowledgeGroupId(question) === groupId);
}
