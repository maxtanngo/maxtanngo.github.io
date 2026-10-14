# Cập nhật mục “Về MaxNgo AI”

Gói cập nhật này bổ sung ảnh người sáng lập, lời giới thiệu và khu vực ủng hộ bằng chuyển khoản.

## Cách cập nhật lên GitHub

1. Giải nén `maxngo-ai-about-update.zip` ở thư mục gốc dự án.
2. Giữ nguyên cấu trúc thư mục trong gói.
3. Thay `src/Site.tsx` và `src/extras.css` hiện có bằng hai file cùng tên trong gói.
4. Thêm ảnh `public/images/ngo-thanh-tan.png`.
5. Commit và push các thay đổi lên nhánh GitHub Pages đang dùng. Workflow hiện tại sẽ build lại website.

Mã QR dùng VietQR Quick Link của MBBank, kèm nội dung gợi ý `UNG HO MAXNGO AI` và không đặt sẵn số tiền. Tên hiển thị trên mã được viết không dấu theo định dạng của VietQR. Khi chuyển khoản, người gửi vẫn nên kiểm tra tên người nhận trong ứng dụng ngân hàng trước khi xác nhận.

Nếu thay đổi tài khoản trong tương lai, hãy cập nhật đồng thời số tài khoản, tên chủ tài khoản và URL `qrUrl` trong `About` ở `src/Site.tsx`.
