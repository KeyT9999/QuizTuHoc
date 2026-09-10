# Kế hoạch Triển khai Hệ thống Phân cấp Môn học & Quản lý Bộ đề thi (Course Hierarchy & Management)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi giao diện trang chủ từ danh sách đề thi phẳng sang mô hình phân cấp 2 tầng: Trang chủ hiển thị danh sách Môn học (có tính năng Tạo môn mới), nhấp vào môn học sẽ hiển thị danh sách các đề thi của môn đó (kèm tính năng Thêm đề thi vào môn).

**Architecture:** Tạo data model `Course` và mapping `courseId` trong `QuizSetInfo`. Tạo module quản lý lưu trữ LocalStorage cho môn học và đề thi tự tạo (`courseStorage.ts`). Xây dựng component `CourseSelector` cho trang chủ, `CourseQuizList` cho trang chi tiết môn học, và `CreateCourseModal` để tạo môn mới. Cập nhật `App.tsx` điều phối luồng màn hình (`course_list` <-> `course_detail` <-> `input` <-> `quiz` <-> `result`).

**Tech Stack:** React 18 / TypeScript, Vite, CSS Modules / Vanilla CSS (Tesla minimal dark UI), LocalStorage API.

---

## Danh sách Task chi tiết

### Task 1: Định nghĩa Course Model & Cập nhật Dữ liệu Bộ đề
**Files:**
- Create: `src/data/courses.ts`
- Modify: `src/data/quizSets.ts`

- [ ] **Step 1: Tạo file `src/data/courses.ts`**
  - Định nghĩa `interface Course { id, code, name, description, badge?, isCustom?, createdAt? }`
  - Khai báo danh sách `DEFAULT_COURSES` bao gồm: PMG201c, SWD392, SDN302, CCHN, FLASHCARD.
- [ ] **Step 2: Cập nhật `QuizSetInfo` và gán `courseId` trong `src/data/quizSets.ts`**
  - Thêm thuộc tính `courseId?: string` vào `interface QuizSetInfo`.
  - Gán `courseId: 'pmg201c'` cho 8 bộ đề PMG201c.
  - Gán `courseId: 'swd392'` cho 12 bộ đề SWD392.
  - Gán `courseId: 'sdn302'` cho 4 bộ đề SDN302.
  - Gán `courseId: 'cchn'` cho đề CCHN 426 câu.
- [ ] **Step 3: Kiểm tra biên dịch TypeScript**
  - Chạy `npm run build` hoặc kiểm tra không có lỗi syntax/type.

---

### Task 2: Xây dựng Module Quản lý LocalStorage cho Môn học & Bộ đề
**Files:**
- Create: `src/utils/courseStorage.ts`

- [ ] **Step 1: Viết các hàm lưu trữ và truy xuất trong `src/utils/courseStorage.ts`**
  - `loadCustomCourses(): Course[]`
  - `saveCustomCourses(courses: Course[]): void`
  - `loadCustomQuizSets(): QuizSetInfo[]`
  - `saveCustomQuizSets(sets: QuizSetInfo[]): void`
  - `deleteCustomCourse(courseId: string): void`
  - `deleteCustomQuizSet(setId: string): void`
- [ ] **Step 2: Tính toán tiến độ học tập môn học**
  - `calculateCourseProgress(courseId: string, sets: QuizSetInfo[]): { totalQuestions: number, masteredQuestions: number, percent: number }`

---

### Task 3: Xây dựng Modal Tạo Môn học Mới (`CreateCourseModal`)
**Files:**
- Create: `src/components/CreateCourseModal.tsx`
- Modify: `src/App.css` (bổ sung modal styling nếu cần)

- [ ] **Step 1: Xây dựng component `CreateCourseModal`**
  - Form với các trường:
    - Mã môn (vd: PRN231, MAS291...)
    - Tên môn học (vd: Lập trình .NET...)
    - Mô tả ngắn
  - Validation: Không cho phép để trống Mã môn hoặc Tên môn.
  - Giao diện Dark theme, nút bấm nổi bật phong cách Tesla.
  - Callback `onCreate(course: Course)` và `onClose()`.

---

### Task 4: Xây dựng Màn hình Danh sách Môn học (`CourseSelector`)
**Files:**
- Create: `src/components/CourseSelector.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Xây dựng component `CourseSelector`**
  - Header: Logo KEYT, tiêu đề "Hôm nay bạn muốn ôn môn nào?", hiển thị tổng số môn học.
  - Grid danh sách thẻ Môn học:
    - Thẻ hiển thị Mã môn (SWD392, PMG201c...), Tên môn, Mô tả.
    - Thống kê: Số lượng bộ đề, tổng số câu hỏi, tiến độ (%) của môn.
    - Nút "Vào ôn tập →".
    - Môn tự tạo (`isCustom: true`): có nút Xóa môn (với confirm alert).
  - Thẻ `+ Tạo môn học mới` (mở CreateCourseModal).
  - Thẻ đặc biệt cho Flashcard dẫn trực tiếp vào lật thẻ.

---

### Task 5: Xây dựng Màn hình Danh sách Bộ đề của Môn (`CourseQuizList`)
**Files:**
- Create: `src/components/CourseQuizList.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Xây dựng `CourseQuizList`**
  - Header với nút `← Quay lại danh sách môn`.
  - Hiển thị thông tin môn hiện tại: Mã môn, Tên môn, Mô tả, Tiến độ tổng thể của môn.
  - Grid danh sách các đề thi thuộc môn đó (`courseId === currentCourse.id`).
  - Mỗi đề hiển thị tiến độ (%), số câu hỏi, nút "Bắt đầu học" hoặc "Tiếp tục học".
  - Thẻ `+ Thêm bộ đề mới`: chuyển sang màn hình nhập đề thi mới cho môn hiện tại.
  - Hỗ trợ nút Xóa đề nếu là đề tự tạo.
  - Trạng thái trống (Empty State): Khi môn chưa có đề nào, hiển thị thông báo hướng dẫn tạo đề đầu tiên.

---

### Task 6: Tích hợp Toàn bộ Luồng Điều hướng trong `App.tsx`
**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/TextInput.tsx`

- [ ] **Step 1: Cập nhật `TextInput` để nhận `targetCourse` và quay lại đúng màn hình**
  - Nhận `targetCourse?: Course` và callback quay lại đúng `course_detail`.
- [ ] **Step 2: Cập nhật State & Luồng màn hình trong `App.tsx`**
  - State `courses` gộp `DEFAULT_COURSES` + `customCourses`.
  - State `quizSets` gộp `DEFAULT_QUIZ_SETS` + `customQuizSets`.
  - Screen routing:
    - `'course_list'`: render `CourseSelector`
    - `'course_detail'`: render `CourseQuizList`
    - `'input'`: render `TextInput` gắn với `currentCourse`
    - `'quiz'`: làm bài thi, nút Back quay về `course_detail`
    - `'result'`: xem kết quả thi, nút Back quay về `course_detail`
    - `'flashcard'`: học flashcard, nút Back quay về `course_list`

---

### Task 7: Kiểm thử & Hoàn thiện Giao diện
**Files:**
- Modify: `src/App.css` (tinh chỉnh thẩm mỹ & responsive)

- [ ] **Step 1: Kiểm thử luồng Môn học mặc định**
  - Vào PMG201c -> xem 8 đề -> làm bài -> quay lại môn -> quay lại danh sách môn.
  - Vào SWD392 -> xem 12 đề -> làm bài -> quay lại.
  - Vào SDN302 -> xem 4 đề.
  - Vào CCHN -> xem đề.
  - Vào Flashcard -> lật thẻ bình thường.
- [ ] **Step 2: Kiểm thử tạo Môn mới & tạo Đề mới**
  - Tạo môn mới "PRN231 - .NET" -> môn mới xuất hiện.
  - F5 tải lại trang -> môn vẫn còn.
  - Bấm vào PRN231 -> hiển thị màn hình đề trống -> bấm "+ Thêm bộ đề" -> dán câu hỏi -> Bắt đầu -> Đề được lưu vào môn PRN231.
  - F5 lại trang -> Đề vẫn nằm trong môn PRN231.
- [ ] **Step 3: Kiểm thử Xóa Môn & Xóa Đề tự tạo**
  - Xóa đề tự tạo thành công.
  - Xóa môn tự tạo thành công, dữ liệu dọn sạch.
