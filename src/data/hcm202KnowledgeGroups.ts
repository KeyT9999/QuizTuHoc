import type { Question } from '../utils/quizParser';

export interface Hcm202KnowledgeGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
}

export const HCM202_KNOWLEDGE_GROUPS: Hcm202KnowledgeGroup[] = [
  {
    id: '1',
    number: 1,
    title: 'Khái quát và phương pháp nghiên cứu',
    summary: 'Khái niệm, đối tượng, nội dung, ý nghĩa và nguyên tắc học tập tư tưởng Hồ Chí Minh.',
  },
  {
    id: '2',
    number: 2,
    title: 'Cơ sở hình thành và quá trình phát triển',
    summary: 'Nguồn gốc tư tưởng, ảnh hưởng văn hóa, nhân tố hình thành và các chặng đường hoạt động của Hồ Chí Minh.',
  },
  {
    id: '3',
    number: 3,
    title: 'Dân tộc và cách mạng giải phóng dân tộc',
    summary: 'Độc lập dân tộc, cách mạng thuộc địa, con đường giải phóng và quan hệ giữa độc lập với tự do.',
  },
  {
    id: '4',
    number: 4,
    title: 'Chủ nghĩa xã hội và thời kỳ quá độ',
    summary: 'Mục tiêu, bản chất, động lực, bước đi và nhiệm vụ xây dựng chủ nghĩa xã hội ở Việt Nam.',
  },
  {
    id: '5',
    number: 5,
    title: 'Đảng Cộng sản Việt Nam',
    summary: 'Sự ra đời, vai trò lãnh đạo, bản chất, nguyên tắc và công tác xây dựng Đảng.',
  },
  {
    id: '6',
    number: 6,
    title: 'Nhà nước, dân chủ và pháp quyền',
    summary: 'Nhà nước của dân, do dân, vì dân; quyền làm chủ, pháp luật và kiểm soát quyền lực.',
  },
  {
    id: '7',
    number: 7,
    title: 'Đại đoàn kết dân tộc và Mặt trận',
    summary: 'Vị trí, lực lượng, điều kiện, nguyên tắc và cách tổ chức khối đại đoàn kết dân tộc.',
  },
  {
    id: '8',
    number: 8,
    title: 'Đoàn kết quốc tế',
    summary: 'Lực lượng, nguyên tắc, hình thức và sức mạnh của đoàn kết quốc tế.',
  },
  {
    id: '9',
    number: 9,
    title: 'Văn hóa, giáo dục và thanh niên',
    summary: 'Quan điểm về nền văn hóa mới, chức năng văn hóa, giáo dục và vai trò của thế hệ trẻ.',
  },
  {
    id: '10',
    number: 10,
    title: 'Đạo đức cách mạng và cán bộ',
    summary: 'Chuẩn mực, nguyên tắc rèn luyện đạo đức, nêu gương và phẩm chất của người cán bộ.',
  },
  {
    id: '11',
    number: 11,
    title: 'Con người và xây dựng con người mới',
    summary: 'Quan niệm về con người, vai trò của con người và nhiệm vụ xây dựng con người xã hội chủ nghĩa.',
  },
  {
    id: '12',
    number: 12,
    title: 'Tác phẩm, mốc lịch sử và câu hỏi tổng hợp',
    summary: 'Các câu hỏi về tác phẩm, sự kiện, niên đại và nội dung chưa thuộc rõ một chuyên đề riêng.',
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
  // Introductory concepts and studying/researching Hồ Chí Minh Thought.
  { groupId: '1', pattern: /khai niem tu tuong ho chi minh|dinh nghia tu tuong ho chi minh|tu tuong ho chi minh la gi/, weight: 12 },
  { groupId: '1', pattern: /doi tuong nghien cuu|phuong phap nghien cuu|nguyen tac nghien cuu|nghien cuu tu tuong ho chi minh/, weight: 12 },
  { groupId: '1', pattern: /y nghia hoc tap|pham vi van dung tu tuong|van dung tu tuong ho chi minh|noi dung cot loi cua tu tuong/, weight: 8 },
  { groupId: '1', pattern: /dai hoi.*khai niem tu tuong|khai quat.*tu tuong ho chi minh|he thong quan diem/, weight: 8 },
  { groupId: '1', pattern: /cach van dung.*tu tuong ho chi minh|hoc chu nghia mac lenin|hieu chu nghia mac lenin|tinh than.*nghien cuu/, weight: 8 },
  { groupId: '1', pattern: /van dung chu nghia mac lenin|hoc tap.*nghien cuu.*chu nghia mac lenin|tuyen truyen chu nghia mac lenin/, weight: 8 },
  { groupId: '1', pattern: /nhan thuc va van dung sang tao|van dung.*tu tuong ho chi minh.*hien nay|tan dung thoi co.*vuot qua thach thuc/, weight: 8 },

  // Origins, influences and historical formation.
  { groupId: '2', pattern: /nguon goc.*tu tuong ho chi minh|co so hinh thanh|co so khach quan|co so chu quan/, weight: 12 },
  { groupId: '2', pattern: /hinh thanh va phat trien|qua trinh hinh thanh|cac giai doan hinh thanh|giai doan.*tu tuong ho chi minh/, weight: 11 },
  { groupId: '2', pattern: /nhan to chu quan.*hinh thanh|nhan to khach quan.*hinh thanh|anh huong cua.*gia dinh|anh huong cua.*que huong/, weight: 10 },
  { groupId: '2', pattern: /chu nghia yeu nuoc|tinh hoa van hoa|van hoa phuong dong|van hoa phuong tay|nho giao|phat giao|mac lenin.*hinh thanh|gia tri van hoa/, weight: 8 },
  { groupId: '2', pattern: /nguyen tat thanh|nguyen sinh cung|nguyen ai quoc|ho chi minh.*(sinh|ra di tim duong)|tim duong cuu nuoc|thoi gian.*(anh|phap|quang chau|lien xo)/, weight: 7 },
  { groupId: '2', pattern: /tu tuong ho chi minh hinh thanh tren co so|tien de tu tuong|tien de ly luan|hinh thanh ve co ban trong thoi ky|giai doan nao.*hinh thanh tu tuong/, weight: 10 },
  { groupId: '2', pattern: /hoang thi loan|khau hieu tu do binh dang bac ai|dai cach mang phap|uu diem lon nhat cua chu nghia mac|thang 7 nam 1920/, weight: 8 },
  { groupId: '2', pattern: /ho chi minh.*(o anh|o phap|o nga|o lien xo|o thai lan|ve nuoc|bi bat|doc thanh|quang chau)|nguyen ai quoc.*(nam nao|thoi gian nao|vao nam)/, weight: 8 },
  { groupId: '2', pattern: /chu truong.*phap cau tien bo|khai dan tri chan dan khi|nha yeu nuoc nao|nang cot cach phong kien/, weight: 6 },
  { groupId: '2', pattern: /ngoai ngu.*ho chi minh|ngoai ngu.*nguyen ai quoc|truong quoc hoc hue|ho chi minh.*o phap|khi o phap/, weight: 8 },
  { groupId: '2', pattern: /giai doan.*vuot qua thu thach|giu vung lap truong cach mang|yeu to.*hinh thanh tu tuong|anh huong.*hinh thanh tu tuong/, weight: 8 },
  { groupId: '2', pattern: /ra nuoc ngoai.*muc dich|muc dich.*ra nuoc ngoai|bi quan tuong gioi thach bat|hoat dong tai thai lan|den nga lan dau|vien nghien cuu cac van de dan toc|viet tai nuoc nao/, weight: 8 },
  { groupId: '2', pattern: /cuoc cach mang nao.*dau the ky xx|khau hieu tu do.*binh dang.*bac ai/, weight: 7 },

  // National liberation and independence.
  { groupId: '3', pattern: /cach mang giai phong dan toc|giai phong dan toc|dan toc thuoc dia|van de dan toc thuoc dia/, weight: 12 },
  { groupId: '3', pattern: /doc lap dan toc|doc lap.*tu do|quyen dan toc|chu nghia thuc dan|thuc dan xam luoc|de quoc xam luoc/, weight: 10 },
  { groupId: '3', pattern: /con duong cach mang vo san|con duong giai phong|muc tieu.*cach mang|nhiem vu.*cach mang o thuoc dia/, weight: 10 },
  { groupId: '3', pattern: /luc luong cach mang.*giai phong|bao luc cach mang|cach mang thuoc dia|giai phong giai cap.*giai phong dan toc/, weight: 8 },
  { groupId: '3', pattern: /chu nghia dan toc|suc manh dan toc|quyen tu do.*nhan dan viet nam/, weight: 7 },
  { groupId: '3', pattern: /giai cap dia chu.*viet nam|cach mang viet nam.*duoc xem|cach mang nao.*thuc tinh cac dan toc|ban chat cua phap va nhat/, weight: 8 },
  { groupId: '3', pattern: /dong bao nam bo.*dan nuoc viet nam|hoa binh la phuong phap cach mang|muc dich.*ra nuoc ngoai.*cuu nuoc|giai quyet van de dan toc.*van de/, weight: 8 },
  { groupId: '3', pattern: /thuc dan phap.*xam luoc|xam luoc viet nam|khai thac thuoc dia|binh dinh viet nam|doc lap.*hanh phuc tu do/, weight: 8 },
  { groupId: '3', pattern: /ban chat cua nhat va phap|nhat va phap.*ho chi minh|thuc dan phap.*thuc dan nhat/, weight: 10 },
  { groupId: '3', pattern: /cong nong la goc cach mang|luc luong.*goc cach mang|dong bao mien nam.*ten than thuong|van de dan toc.*lap truong/, weight: 8 },
  { groupId: '3', pattern: /truc tiep chi huy chien dich|chien dich.*khang chien|loi keu goi toan quoc khang chien|dau tranh giai phong.*dan toc/, weight: 8 },
  { groupId: '3', pattern: /dong bao toi duoc tu do|can nhat tren doi.*tu do|quy luat.*doc lap dan toc/, weight: 8 },
  { groupId: '3', pattern: /chinh sach doi voi phap sau khi gianh doc lap|linh hon cua cuoc khang chien|luc luong.*goc cach menh|goc cach menh/, weight: 8 },
  { groupId: '3', pattern: /lap truong.*giai quyet van de dan toc|van de dan toc.*lap truong|loi keu goi toan quoc khang chien/, weight: 8 },

  // Socialism and the transition period.
  { groupId: '4', pattern: /chu nghia xa hoi|xa hoi chu nghia|\bcnxh\b|qua do len chu nghia xa hoi|thoi ky qua do/, weight: 12 },
  { groupId: '4', pattern: /ban chat.*chu nghia xa hoi|muc tieu.*chu nghia xa hoi|dac diem.*chu nghia xa hoi|xay dung.*chu nghia xa hoi/, weight: 10 },
  { groupId: '4', pattern: /dong luc.*chu nghia xa hoi|nhiem vu lich su.*thoi ky qua do|buoc di.*chu nghia xa hoi|phan phoi.*chu nghia xa hoi/, weight: 10 },
  { groupId: '4', pattern: /cong huu|lam theo nang luc|lam nhieu huong nhieu|kinh te.*xa hoi chu nghia/, weight: 7 },
  { groupId: '4', pattern: /nganh kinh te chu yeu|cong nong thuong nghiep|cai cach ruong dat|cach mang xhcn|cach mang xa hoi chu nghia do/, weight: 8 },
  { groupId: '4', pattern: /ke thu.*de bep.*kinh te|phat trien kinh te|kinh te nuoc nha|hai cai chan cua nen kinh te/, weight: 7 },
  { groupId: '4', pattern: /nong dan that su nam|xay dung lai dat nuoc.*dang hoang hon|chu nghia nao.*thich hop voi dieu kien cua nuoc ta/, weight: 8 },

  // Communist Party.
  { groupId: '5', pattern: /dang cong san viet nam|dang lao dong viet nam|dang cam quyen|dang.*lanh dao cach mang/, weight: 12 },
  { groupId: '5', pattern: /quy luat ra doi cua dang|ban chat.*dang cong san|vai tro.*dang cong san|nguyen tac.*xay dung dang|xay dung dang/, weight: 11 },
  { groupId: '5', pattern: /quan he giua dang.*nhan dan|dang.*nhan dan|dang.*mat tran|dang.*chu nghia mac lenin/, weight: 8 },
  { groupId: '5', pattern: /chinh cuong van tat|duong kach menh|dieu le dang|cong tac can bo cua dang/, weight: 7 },
  { groupId: '5', pattern: /dang cong san la nhan to quyet dinh|dang phai thuong xuyen tu doi moi|tu chinh don|ban chat cua dang|dang la dao duc|dang la van minh/, weight: 11 },
  { groupId: '5', pattern: /dang.*(tu phe binh|phe binh|duong loi chinh tri|lanh dao mat tran|suc manh)|phuong huong.*dang lanh dao|cach mang truoc het phai co dang/, weight: 10 },
  { groupId: '5', pattern: /can bo dang vien|dang vien|to chuc dang|dang la cua ai|dang cua giai cap|dang cua dan toc/, weight: 8 },
  { groupId: '5', pattern: /luan diem sang tao.*dang|dang.*nhan to quyet dinh|dang.*tu phe binh|phe binh va tu phe binh|tu phe binh va phe binh|muc dich phe binh|chuc nang lanh dao.*dang/, weight: 10 },
  { groupId: '5', pattern: /duong loi chinh tri|trong tac pham duong (?:k|c)ach menh.*dang|duong cach menh.*dang nhu|cach mang truoc het phai co|dang la cua|chanh cuong van tat|suc manh cua dang|viet len tran hai chu cong san|dang nhu nguoi cam lai|cam lai co vung/, weight: 9 },
  { groupId: '5', pattern: /lanh dao duoc nhan dan|dang phai co.*nhan dan|dang cong san anh em|to chuc dang.*vai tro/, weight: 8 },
  { groupId: '5', pattern: /dang cong san viet nam ra doi|dang cong san.*ra doi.*co so|co so.*ra doi cua dang/, weight: 10 },

  // State, democracy, law and public service.
  { groupId: '6', pattern: /nha nuoc|nha nuoc phap quyen|phap quyen|quyen luc nha nuoc|kiem soat quyen luc/, weight: 12 },
  { groupId: '6', pattern: /dan chu|nhan dan lam chu|chinh phu|bo may nha nuoc|quoc hoi|phap luat/, weight: 10 },
  { groupId: '6', pattern: /nha nuoc cua dan|nha nuoc do dan|nha nuoc vi dan|quan ly nha nuoc|dai bieu.*nhan dan/, weight: 10 },
  { groupId: '6', pattern: /tieu chuan can bo|danh gia can bo|huan luyen can bo|dao tao can bo|cong tac can bo/, weight: 6 },
  { groupId: '6', pattern: /dan la chu|dan lam chu|nhan dan la|quyen lam chu|quyen luc cua nhan dan|hien phap/, weight: 9 },
  { groupId: '6', pattern: /can bo.*huong dan nhan dan|co hai cho dan|loi ich.*cua dan|nguoi day to cua dan|tham nhung.*giac/, weight: 8 },
  { groupId: '6', pattern: /tat ca.*trong nuoc.*toan the nhan dan|nhan dan.*tao ra.*quan ly|quan ly.*bo may|viec gi.*thanh cong hay that bai|loi ich cua dan/, weight: 8 },
  { groupId: '6', pattern: /muon viec thanh cong hay that bai|dong nguoi ban bac ky luong|ke hoach dinh ro rang|loai giac nao|giac noi xam/, weight: 8 },

  // National unity and the Front.
  { groupId: '7', pattern: /dai doan ket|mat tran dan toc|mat tran viet minh|mat tran lien viet|khoi dai doan ket/, weight: 12 },
  { groupId: '7', pattern: /doan ket dan toc|luc luong doan ket|nguyen tac doan ket|dieu kien.*doan ket|nen tang.*doan ket/, weight: 10 },
  { groupId: '7', pattern: /doan ket.*cong nong|cong nong tri thuc|suc manh.*doan ket|thuc hien.*doan ket/, weight: 8 },
  { groupId: '7', pattern: /doan ket la|doan ket toan dan|doan ket rong rai|lanh dao mat tran|xay dung mat tran|mat tran/, weight: 10 },
  { groupId: '7', pattern: /toan dan toc.*luc luong|dan ta tai nang|nhan dan.*sang tao|mat tran dan toc thong nhat/, weight: 8 },
  { groupId: '7', pattern: /viet nam doc lap dong minh|viet minh|nguyen tac toi cao.*doan ket|tin vao.*nhan dan|dan lieu cung xong/, weight: 8 },
  { groupId: '7', pattern: /doan ket phai can cu|doan ket.*can cu vao|quyen lanh dao mat tran|don ket rong rai|mat tran.*quyen lanh dao/, weight: 9 },
  { groupId: '7', pattern: /nha nong dan.*nam|nong dan.*nam quyen|ai co tai co duc.*phuc vu nhan dan/, weight: 7 },
  { groupId: '7', pattern: /doan ket phai gan voi|doan ket.*gan voi/, weight: 8 },

  // International solidarity.
  { groupId: '8', pattern: /doan ket quoc te|luc luong doan ket quoc te|nguyen tac doan ket quoc te|cach menh an nam.*bo phan.*cach menh the gioi/, weight: 14 },
  { groupId: '8', pattern: /phong trao cong nhan quoc te|phong trao giai phong dan toc|nhan dan the gioi|cac luc luong tien bo/, weight: 10 },
  { groupId: '8', pattern: /quan he quoc te|ngoai giao|hoi nhap quoc te|doan ket.*cac dan toc/, weight: 8 },
  { groupId: '8', pattern: /tinh than quoc te|quan he voi trung quoc|lao dong tat ca cac nuoc|giai phong anh em|cach mang an nam.*bo phan.*cach mang the gioi/, weight: 10 },
  { groupId: '8', pattern: /quoc te|quoc te chu nghia|quoc te vo san|cac dan toc bi ap buc/, weight: 6 },
  { groupId: '8', pattern: /bo phan.*cach mang the gioi|cach mang.*the gioi.*dong chi/, weight: 9 },

  // Culture, education and youth.
  { groupId: '9', pattern: /van hoa|nen van hoa|chuc nang van hoa|tinh chat van hoa|muc dich cua van hoa/, weight: 10 },
  { groupId: '9', pattern: /giao duc|thay giao|co giao|thanh nien|sinh vien|hoc tap.*thanh nien/, weight: 8 },
  { groupId: '9', pattern: /van hoa soi duong|xay dung.*van hoa moi|van hoa.*chinh tri|van hoa.*kinh te/, weight: 9 },
  { groupId: '9', pattern: /hoc de lam viec|phat trien giao duc|day hoc|boi duong the he|thanh nien.*sinh vien/, weight: 8 },

  // Revolutionary ethics and cadres.
  { groupId: '10', pattern: /dao duc cach mang|chuan muc dao duc|nguyen tac xay dung dao duc|ren luyen dao duc/, weight: 12 },
  { groupId: '10', pattern: /chi cong vo tu|can kiem liem chinh|chu nghia ca nhan|neu guong|tam guong|yeu thuong con nguoi/, weight: 11 },
  { groupId: '10', pattern: /pham chat dao duc|dao duc.*can bo|can bo.*dao duc|can bo.*pham chat|tham o|lang phi|quan lieu/, weight: 8 },
  { groupId: '10', pattern: /dao duc moi|tu duong dao duc|tu ren luyen dao duc|liem la|liet la|can la sie nang|cach mang.*tinh co nghia|tinh co nghia/, weight: 9 },
  { groupId: '10', pattern: /con nguoi co.*tinh cam|tu te|duoc yeu men.*pham chat|pham chat.*duoc yeu men|con nguoi co dao duc/, weight: 8 },
  { groupId: '10', pattern: /duc la goc cua tai|duc va tai|hong va chuyen|can la si|hieu voi dan|nguoi cach mang phai co|quan chung chi quy men.*nguoi/, weight: 9 },
  { groupId: '10', pattern: /cong san.*yeu men|quyet tam.*ren luyen dao duc|ngoc cang mai|vang cang luyen|tham nhung nhu giac/, weight: 8 },
  { groupId: '10', pattern: /viet len tran hai chu cong san|nguoi co dao duc.*duoc yeu men|khong thua nhan ban than/, weight: 8 },

  // People and the building of a new person.
  { groupId: '11', pattern: /xay dung con nguoi|con nguoi moi|con nguoi xa hoi chu nghia|quan niem.*con nguoi|ban chat con nguoi/, weight: 12 },
  { groupId: '11', pattern: /nhan to con nguoi|vai tro cua con nguoi|trong nguoi|chien luoc.*con nguoi|phat trien con nguoi/, weight: 10 },
  { groupId: '11', pattern: /tuoi tre|thanh nien|phu nu|tre em/, weight: 5 },
  { groupId: '11', pattern: /con nguoi|nguoi viet nam trong thoi dai moi|giai phong con nguoi|chinh the/, weight: 8 },
  { groupId: '11', pattern: /khong phai moi con nguoi|con nguoi.*dong luc|con nguoi.*xu huong|khai niem con nguoi|con nguoi viet nam/, weight: 9 },

  // Historical facts and source-text questions are used as a safe fallback for
  // material whose primary topic is not identified by the more specific rules.
  { groupId: '12', pattern: /tac pham nao|duoc trich tu.*tac pham|bao.*(chi|cao)|hoi nghi.*(nam|thang)|duoc thanh lap vao|vao thoi gian nao/, weight: 5 },
  { groupId: '12', pattern: /sua doi loi lam viec|tuyen ngon doc lap|loi keu goi toan quoc khang chien|ban an che do thuc dan phap/, weight: 6 },
  { groupId: '12', pattern: /bao.*uruguay|ho chi minh viet$|ho chi minh cho rang$|theo ho chi minh:$|ho chi minh cho rang$/, weight: 4 },
];

export function getHcm202KnowledgeGroupId(question: Question): string {
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

  let bestGroupId = '12';
  let bestScore = 0;
  for (const group of HCM202_KNOWLEDGE_GROUPS) {
    const score = scores.get(group.id) ?? 0;
    if (score > bestScore) {
      bestGroupId = group.id;
      bestScore = score;
    }
  }

  return bestGroupId;
}

export function getHcm202QuestionsForGroup(questions: Question[], groupId: string): Question[] {
  return questions.filter((question) => getHcm202KnowledgeGroupId(question) === groupId);
}
