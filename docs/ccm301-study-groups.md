# CCM301 — Học theo nhóm

Bộ **CCM301 - Học Bao Pass** gồm 444 câu, được đọc và phân loại theo kiến thức chính đang kiểm tra. Mỗi câu thuộc đúng một nhóm; giữ nguyên nội dung, phương án, đáp án và ID gốc. Các câu trùng hoặc đảo phương án được giữ lại để luyện tập và xếp cùng chủ đề.

Trong quiz, chọn **Học theo nhóm**. Mỗi nhóm có tiến độ riêng; có thể dùng **Chia nhỏ đề thi** để học từng lượt ngắn. Trang chọn nhóm: `/course/ccm301/ccm301_hoc_bao_pass?groupPicker=true`.

| Nhóm | Chủ đề | Số câu |
| --- | --- | ---: |
| 1 | Tổng quan & vòng đời khủng hoảng | 43 |
| 2 | Stakeholder, danh tiếng & CSR | 39 |
| 3 | Quản trị vấn đề & rủi ro (Issues, Risk, ERM) | 39 |
| 4 | Nhận diện tín hiệu & đánh giá nguy cơ | 42 |
| 5 | OODA: phân tích, phòng ngừa & kiểm tra hiệu quả | 35 |
| 6 | Đội khủng hoảng, lãnh đạo & người phát ngôn | 27 |
| 7 | Kế hoạch CCP & hệ thống sẵn sàng ứng phó | 57 |
| 8 | Nhận diện khủng hoảng, xử lý thông tin & quyết định | 40 |
| 9 | Truyền thông ứng phó: tốc độ, nội dung & nhất quán | 45 |
| 10 | SCCT & chiến lược bảo vệ danh tiếng | 17 |
| 11 | Paracrisis, mạng xã hội & tin đồn | 29 |
| 12 | Hậu khủng hoảng, đánh giá & học hỏi | 31 |
| | **Tổng** | **444** |

Gợi ý học: nhóm 1–2 để nắm nền tảng; nhóm 3–5 về phòng ngừa; nhóm 6–7 về chuẩn bị; nhóm 8–11 về nhận diện và ứng phó; cuối cùng nhóm 12 để đánh giá và rút kinh nghiệm.

## Ranh giới phân loại

- Nhóm 1 học các giai đoạn; nhóm 4 học cách phát hiện và đánh giá tín hiệu cụ thể.
- Nhóm 3 học chức năng Issues/Risk/ERM; nhóm 5 học thao tác phân tích, lựa chọn biện pháp và kiểm tra hiệu quả trong OODA.
- Nhóm 2 học quan hệ stakeholder và danh tiếng; nhóm 10 học các chiến lược phản hồi, bồi thường, xin lỗi và SCCT.
- Nhóm 7 học công cụ, kế hoạch và mức độ sẵn sàng; nhóm 8 học cách xử lý thông tin khi khủng hoảng được nhận diện.
- Nhóm 9 học nguyên tắc thông điệp và công chúng; nhóm 11 tập trung tình huống paracrisis, phản ứng mạng xã hội và xử lý tin đồn. Méo thông điệp qua truyền đạt nhiều lần được xếp nhóm 8.

## Lưu ý về đáp án nguồn

Đây là phân nhóm học tập, không phải rà soát tính đúng sai của đáp án. Nguồn có câu trùng nội dung với đáp án mâu thuẫn, ví dụ:

- Câu 24 và 234: cùng hỏi khủng hoảng do phản ứng mạng xã hội, cùng thứ tự phương án, nhưng khóa đáp án lần lượt C và B.
- Câu 77 và 240: cùng hỏi mục đích của CCP, cùng thứ tự phương án, nhưng khóa đáp án C và A.
- Câu 16 và 270: cùng hỏi bước đầu tiên của Orient, cùng thứ tự phương án, nhưng khóa đáp án A và B.

Chưa thay đổi các đáp án này trong lần phân nhóm. Cần đối chiếu giáo trình/đáp án giảng viên trước khi sửa.

## Bảo trì

Bảng gán ID được lưu trong `src/data/ccm301KnowledgeGroups.ts`; `src/App.tsx` đăng ký cho đúng bộ `ccm301_hoc_bao_pass`. Dùng giao diện chọn nhóm và cơ chế lưu tiến độ hiện có.

Chạy `node --test tools/ccm301KnowledgeGroups.test.mjs` để kiểm tra bao phủ 444 câu, không trùng ID, câu trùng nội dung cùng nhóm, lọc giữ nguyên dữ liệu và thứ tự. Kiểm thử cũng lưu dấu vân tay của thứ tự câu hỏi: nếu thêm/sửa/đổi thứ tự câu, phải rà lại bảng gán trước khi cập nhật dấu vân tay. CI chạy kiểm thử này cùng lint và build.
