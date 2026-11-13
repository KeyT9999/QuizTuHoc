# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Cấu hình tính năng Hỏi AI

Tính năng Hỏi AI gọi API từ phía máy chủ. Ứng dụng thử DeepSeek trước, sau đó tự chuyển sang SiliconFlow và xKiro nếu dịch vụ trước lỗi. API key chỉ được đặt trong `.env` local hoặc biến môi trường máy chủ, không dùng tiền tố `VITE_`. Giá trị biến môi trường nên nhập dạng thường, không thêm dấu gạch chéo ngược.

Trong lúc học, rê chuột lên một từ tiếng Anh trong câu hỏi hoặc lựa chọn để xem nghĩa tiếng Việt theo ngữ cảnh. Dịch chỉ chạy sau khi con trỏ dừng một lúc và được lưu trong phiên để tránh gọi AI lặp lại.

Khi chạy local bằng `npm run dev`, tạo file `.env` từ `.env.example` và điền các API key cùng cấu hình tương ứng. Các biến base URL và model có giá trị mặc định trong ví dụ.

Trên Vercel, thêm các biến `DEEPSEEK_API_KEY`, `DEEPSEEK_API_BASE`, `DEEPSEEK_MODEL`, `SILICONFLOW_API_KEY`, `SILICONFLOW_API_BASE`, `SILICONFLOW_MODEL`, `XKIRO_API_KEY`, `XKIRO_API_BASE`, và `XKIRO_MODEL` trong **Project Settings → Environment Variables**, sau đó redeploy. Chỉ cần cấu hình key của những nhà cung cấp muốn bật.

## Cấu hình Google Analytics 4

1. Vào [Google Analytics](https://analytics.google.com/), tạo property GA4 và **Web data stream** cho `quiz-tu-hoc.vercel.app`. Đặt múi giờ báo cáo là **Bangkok (GMT+7)** để ngày thống kê trùng với giờ địa phương. Sao chép Measurement ID có dạng `G-XXXXXXXXXX`.
2. Khi chạy local, thêm ID vào `.env.local`:

   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. Trên Vercel, thêm biến `VITE_GA_MEASUREMENT_ID` trong **Project Settings → Environment Variables**, chọn môi trường **Production**, rồi redeploy.
4. Trong cấu hình Web data stream, bật **Enhanced measurement → Page views → Page changes based on browser history events** để Google Analytics ghi nhận điều hướng bên trong ứng dụng. Sau khi triển khai, mở **Reports → Realtime** để xác nhận lượt truy cập. Báo cáo theo ngày và thời gian tương tác nằm trong **Reports → Engagement → Pages and screens**; GA4 chỉ tính thời gian trang đang ở trạng thái mở và có tiêu điểm.

Ứng dụng chỉ tải Google Analytics trên bản production khi Measurement ID hợp lệ. Dữ liệu trước ngày cài đặt sẽ không được ghi nhận hồi tố.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
