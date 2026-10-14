# MaxNgo AI

Website công cụ dành cho nhà sáng tạo nội dung và người làm video marketing. Bản này được dựng bằng React, TypeScript và Vite; có nhiều trang tĩnh để GitHub Pages phục vụ trực tiếp.

## Tính năng

- Trang chủ định vị MaxNgo AI quanh quy trình video marketing.
- Video Editor: chỉnh sửa video trên trình duyệt bằng FFmpeg.wasm.
- Hook Card Studio: tạo ảnh 16:9 và tải PNG; có bản HTML độc lập chạy offline.
- Script Radar: tạo prompt có cấu trúc, không giả vờ gọi mô hình AI.
- Trang tải về, hướng dẫn, giới thiệu, sitemap, robots.txt, metadata và Open Graph.
- GitHub Actions tự kiểm tra TypeScript, build và triển khai `dist/` lên GitHub Pages khi có thay đổi vào `main`.

## Chạy và build cục bộ

```bash
npm ci
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

Các lệnh cần chạy từ thư mục gốc của repository. Build đầu tiên cần Node.js 22 trở lên.

## Cấu trúc

```text
src/Site.tsx                       Trang chủ và các trang công cụ
src/site.css, src/extras.css       Giao diện responsive
src/editor/                        Video Editor
tools/*/index.html                 Trang tĩnh cho từng tool
downloads/index.html               Kho tải về
public/downloads/                  Tiện ích Hook Card HTML offline
public/sitemap.xml                 Sitemap
public/robots.txt                  Quy tắc crawl
.github/workflows/pages.yml        Build và triển khai GitHub Pages
```

## Đưa lên GitHub Pages

1. Chép các tệp và thư mục của dự án vào repository `maxtanngo.github.io` của bạn. Không tải `node_modules/` hoặc `dist/` lên GitHub.
2. Commit và push lên nhánh `main`.
3. Mở **Settings → Pages** trong repository và chọn **GitHub Actions** làm Build and deployment source.
4. Mở tab **Actions** để theo dõi workflow `Build and deploy MaxNgo AI to GitHub Pages`.

Workflow build thư mục `dist` rồi deploy lên GitHub Pages. Nếu repository dùng nhánh mặc định khác `main`, sửa trigger nhánh trong `.github/workflows/pages.yml` cho khớp.

## Lưu ý về xử lý dữ liệu

- Hook Card Studio tạo ảnh trong trình duyệt. Bản offline nằm tại `public/downloads/maxngo-hook-card.html` và không dùng thư viện ngoài.
- Script Radar chỉ dựng prompt ở phía trình duyệt. Người dùng tự gửi prompt sang công cụ AI họ chọn.
- Video Editor xử lý video bằng FFmpeg.wasm phía trình duyệt. Lần xuất đầu cần internet để tải FFmpeg từ unpkg; video lớn/4K có thể cần nhiều RAM và thời gian.
- Không đưa API key bí mật vào code frontend hoặc GitHub Pages. Nếu thêm tính năng Gemini có API key chung của chủ website, hãy gọi qua backend có quản lý secret.

## Routes

- `/` — trang chủ
- `/tools/video-editor/` — Video Editor
- `/tools/hook-card/` — Hook Card Studio
- `/tools/script-radar/` — Script Radar Prompt Builder
- `/downloads/` — kho tải về
- `/guides/` — hướng dẫn
- `/about/` — thông tin dự án và góp ý
