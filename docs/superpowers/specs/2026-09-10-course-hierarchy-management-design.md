# Đặc tả Thiết kế: Hệ thống Phân cấp Môn học & Quản lý Bộ đề thi (Course Hierarchy & Management)

## 1. Tổng quan (Overview)
Hiện tại hệ thống hiển thị toàn bộ tất cả các bộ đề (hơn 25 bộ đề của nhiều môn khác nhau như SWD392, PMG201c, SDN302, CCHN...) trực tiếp trên trang chủ dưới dạng một lưới phẳng, gây rối mắt và khó quản lý khi số lượng đề tăng lên.

Giải pháp: Tổ chức lại giao diện và luồng hoạt động theo mô hình 2 cấp:
1. **Cấp 1 - Trang chủ (Courses View)**: Hiển thị các thẻ Môn học (PMG201c, SWD392, SDN302, CCHN, Flashcard...) cùng thẻ `+ Tạo môn học mới`.
2. **Cấp 2 - Màn hình Môn học (Course Detail / Quizzes View)**: Khi người dùng nhấp vào một môn học, ứng dụng chuyển sang danh sách hiển thị toàn bộ các bộ đề thuộc môn đó, kèm nút `← Quay lại danh sách môn` và nút `+ Thêm đề thi mới` cho môn.

Môn học tự tạo và đề thi tự tạo được lưu trữ bền vững trong `localStorage`.

---

## 2. Mô hình Dữ liệu (Data Model)

### 2.1. Course Interface (`src/data/courses.ts`)
```typescript
export interface Course {
  id: string;             // Định danh duy nhất (vd: 'pmg201c', 'swd392', 'sdn302', 'cchn', 'course_1741618...')
  code: string;           // Mã môn (vd: 'PMG201c', 'SWD392', 'SDN302')
  name: string;           // Tên đầy đủ môn học
  description: string;    // Mô tả môn học
  badge?: string;         // Tag phụ nếu có
  isCustom?: boolean;     // true nếu do người dùng tự tạo
  createdAt?: number;     // Timestamp tạo
}
```

### 2.2. Default Courses (`DEFAULT_COURSES`)
Hệ thống cấu hình sẵn 5 môn học mặc định:
- **PMG201c**: Quản lý dự án thông tin (Project Management). 8 bộ đề chuẩn & câu lặp.
- **SWD392**: Software Architecture & Design. 12 bộ đề thi các kỳ.
- **SDN302**: Distributed Systems & Cloud / Node.js. 4 bộ đề thi các kỳ.
- **CCHN**: Quản trị thương hiệu & Khách hàng. Đề 426 câu.
- **FLASHCARD**: Thẻ lật ghi nhớ thuật ngữ PMG201c.

### 2.3. Cập nhật QuizSetInfo (`src/data/quizSets.ts`)
Bổ sung trường `courseId: string` vào `QuizSetInfo`:
- Các bộ đề PMG201c gắn `courseId: 'pmg201c'`
- Các bộ đề SWD392 gắn `courseId: 'swd392'`
- Các bộ đề SDN302 gắn `courseId: 'sdn302'`
- Bộ đề CCHN gắn `courseId: 'cchn'`
- Các bộ đề người dùng tự dán sẽ được gắn `courseId` của môn đang mở.

### 2.4. Lưu trữ bền vững (Local Persistence)
- `keyt_custom_courses`: mảng JSON lưu `Course[]` do người dùng tự tạo.
- `keyt_custom_quizzes`: mảng JSON lưu `QuizSetInfo[]` do người dùng tạo cho các môn.

---

## 3. Kiến trúc Giao diện & Luồng màn hình (UI & Navigation)

### 3.1. Các trạng thái màn hình (`AppScreen` trong `src/App.tsx`)
```typescript
type AppScreen = 'course_list' | 'course_detail' | 'input' | 'quiz' | 'result' | 'flashcard';
```
- `course_list`: Màn hình trang chủ hiển thị danh sách Môn học + nút `+ Tạo môn học mới`.
- `course_detail`: Màn hình chi tiết một môn học, hiển thị các bộ đề của môn đó + nút `+ Thêm đề thi mới` + nút `← Quay lại`.
- `input`: Màn hình dán/nhập text đề thi mới (được truyền sẵn `courseId` để lưu vào đúng môn).
- `quiz` & `result`: Làm bài thi và xem kết quả (giữ nguyên hoạt động hiện tại).
- `flashcard`: Học flashcard (giữ nguyên hoạt động).

### 3.2. Thành phần Giao diện mới & Cải tiến
1. **`CourseSelector` (Mới: `src/components/CourseSelector.tsx`)**:
   - Header: Logo KEYT, Tiêu đề "Hôm nay bạn muốn ôn môn nào?", đếm tổng số môn.
   - Grid thẻ Môn học (phong cách Tesla dark/glassmorphism mượt mà hiện tại):
     - Hiển thị Mã môn nổi bật (vd `SWD392`, `PMG201c`).
     - Tên môn, mô tả ngắn gọn.
     - Thống kê: Số lượng đề thi, Tổng số câu hỏi, Tiến độ hoàn thành (%) tổng hợp từ các đề trong môn.
     - Nút "Vào ôn tập →".
     - Nếu là môn tự tạo (`isCustom`): Có menu/icon Đổi tên & Xóa môn (có hộp thoại xác nhận).
   - Thẻ `+ Tạo môn học mới`: Nhấp vào mở Modal Tạo Môn Học.
2. **`CourseQuizList` (Mới: `src/components/CourseQuizList.tsx`)**:
   - Header có Breadcrumb hoặc nút `← Quay lại danh sách môn`.
   - Tiêu đề Môn học (Mã môn + Tên môn), thanh tổng kết tiến độ môn.
   - Grid các bộ đề thuộc môn đó (kèm tiến độ từng đề %, số câu, trạng thái 'Bắt đầu' / 'Tiếp tục').
   - Thẻ `+ Thêm đề thi vào môn này`: chuyển sang màn hình `input` với `targetCourseId`.
   - Nếu đề thi là đề tự tạo: có nút xóa đề (với confirm dialog).
3. **`CreateCourseModal` (Mới: `src/components/CreateCourseModal.tsx`)**:
   - Modal popup tinh gọn, đẹp mắt:
     - Trường nhập: **Mã môn** (vd: PRN231, MAS291...)
     - Trường nhập: **Tên môn học** (vd: Xây dựng ứng dụng .NET...)
     - Trường nhập: **Mô tả ngắn** (tùy chọn)
     - Nút "Hủy" và "Tạo môn học".
   - Validate: Mã môn và Tên môn không được để trống.

---

## 4. Xử lý lỗi & Trường hợp ngoại lệ (Edge Cases & Error Handling)

1. **Môn học chưa có đề nào**:
   - Khi tạo môn mới thành công, vào môn đó sẽ hiển thị trạng thái trống thân thiện (Empty state) gợi ý: "Môn này chưa có bộ đề nào. Hãy bấm 'Thêm đề thi mới' để dán câu hỏi ôn tập!".
2. **Xóa môn học**:
   - Khi xóa một môn tự tạo, hiển thị cảnh báo xác nhận rõ ràng: "Bạn có chắc chắn muốn xóa môn học này cùng tất cả các đề thi tự tạo trong môn?".
   - Khi người dùng xác nhận, xóa môn khỏi `keyt_custom_courses` và xóa toàn bộ các đề thuộc `courseId` đó khỏi `keyt_custom_quizzes`.
3. **Tính toán tiến độ học**:
   - Tiến độ môn học (%) = Tổng số câu hỏi đã thuộc / Tổng số câu hỏi của tất cả các đề trong môn * 100.
   - Nếu môn chưa có câu hỏi nào, tiến độ hiển thị 0%.
4. **Tương thích ngược (Backward Compatibility)**:
   - Tất cả tiến độ làm bài cũ trong `localStorage` (`keyt_quiz_mastered_*`) vẫn được giữ nguyên vẹn 100%.

---

## 5. Kế hoạch Kiểm thử (Testing & Verification)
1. **Kiểm tra hiển thị trang chủ**:
   - Trang chủ hiển thị gọn gàng các môn học mặc định (PMG201c, SWD392, SDN302, CCHN, Flashcard).
   - Mỗi thẻ môn hiển thị đúng số lượng đề, tổng số câu hỏi và tiến độ %.
2. **Kiểm tra luồng tạo môn học**:
   - Bấm "+ Tạo môn học mới", nhập mã môn và tên môn -> Môn mới xuất hiện ngay trên trang chủ.
   - F5 tải lại trang -> Môn mới vẫn còn nguyên (localStorage hoạt động).
3. **Kiểm tra luồng xem và làm đề**:
   - Bấm vào môn SWD392 -> Ra đầy đủ 12 đề SWD392.
   - Bấm vào 1 đề -> Vào làm bài trắc nghiệm bình thường.
   - Bấm nút "Quay lại" -> Trở về danh sách đề của môn SWD392.
   - Bấm "Quay lại danh sách môn" -> Trở về trang chủ danh sách môn.
4. **Kiểm tra luồng thêm đề vào môn tự tạo**:
   - Vào môn tự tạo -> Bấm "+ Thêm đề thi mới" -> Dán đề thi -> Bắt đầu học -> Đề được lưu vào môn đó và tồn tại sau khi F5.
5. **Kiểm tra xóa môn tự tạo**:
   - Xóa môn tự tạo -> Môn biến mất khỏi danh sách và dữ liệu sạch sẽ.
