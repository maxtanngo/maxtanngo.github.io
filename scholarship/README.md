# MaxNgo Scholarship – Săn Học Bổng

## Chạy tại máy

Yêu cầu Python 3.11+, Node.js 22.13+ cho bộ test Worker và Chrome cho test giao diện. Trang tĩnh và crawler không cần cài gói Python hoặc npm.

Từ thư mục gốc của website, chạy:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Mở [Học tập](http://127.0.0.1:8000/hoc-tap/) rồi chọn **Tìm học bổng**. Có thể vào [Săn Học Bổng](http://127.0.0.1:8000/hoc-tap/san-hoc-bong/) trực tiếp. Dữ liệu ban đầu đi kèm trang. Trình duyệt lưu ID các mục đã đánh dấu trong localStorage. Ứng dụng không có tài khoản người dùng, form hồ sơ hay bộ theo dõi.

Mở cửa sổ dòng lệnh thứ hai để chạy:

```sh
python3 -m unittest discover -s scholarship/tests -p 'test_*.py'
node --test scholarship/tests/*.test.mjs
node scholarship/tests/ui.mjs http://127.0.0.1:8000
python3 scholarship/crawl.py
python3 scholarship/monitor.py
```

Đặt `CHROME_BIN` nếu Chrome cài ở đường dẫn khác. Trên macOS, nếu Python từ python.org chưa có bộ CA, cài chứng chỉ của bản Python hoặc dùng `SSL_CERT_FILE=/etc/ssl/cert.pem` nếu tệp đó tồn tại và là bộ CA hệ thống. Giữ xác thực TLS. Mở `scholarship/.local/status.html` để xem nguồn, dịch vụ AI, hàng đợi và bản dịch nháp. Lệnh crawl mặc định cập nhật `.local/state.json` và `.local/snapshot.json`. Lệnh `python3 scholarship/crawl.py --seed` dựng lại bản JSON đi kèm web từ dữ liệu đã đối chiếu trong registry.

## Luồng dữ liệu

1. Crawler chỉ tải các URL HTTPS đã đăng ký. Nó kiểm tra robots.txt, chặn chuyển hướng tự động và giới hạn thời gian chờ, kích thước tài liệu. Các bộ đọc nhận diện dấu hiệu và hạn theo từng nguồn. Crawler theo dõi thay đổi qua hàm băm văn bản và loại trùng theo ID, URL chuẩn hoặc tên chương trình cùng đơn vị và quốc gia. Nguồn lỗi hạ trạng thái xuống chưa xác nhận và giữ mốc đối chiếu lần trước; các nguồn khác vẫn chạy.
2. Danh mục ban đầu gồm UBC, Chevening, Australia Awards và ASEAN Scholarship Singapore cho Việt Nam. Bản tin chính thức của Đại sứ quán Singapore có thể phát hiện đợt mới theo năm ngay trong danh mục tin của họ. Nguồn khác được theo dõi ở URL đã đăng ký. Thêm chương trình và bộ đọc nguồn qua thay đổi được duyệt trong `sources.json` và `crawl.py`. Lịch chỉ ghi ngày chưa đủ để tự gắn nhãn đang mở trong bộ đọc Singapore. Trình duyệt tự hạ trạng thái cần xác nhận nếu lần đối chiếu đã quá 72 giờ, và đánh dấu đã qua hạn khi có giờ kết thúc xác định.
3. Hàng đợi xử lý phần mô tả công khai đã chọn trong registry. Gemini 3.1 Flash-Lite được ưu tiên. Workers AI dùng Llama 3.1 8B Instruct Fast khi Gemini lỗi hoặc hết quota. Tối đa bốn lần gọi AI mỗi lượt chạy, tổng cả hai nhà cung cấp. Khi gặp lỗi HTTP hoặc kết nối, nhà cung cấp đó tạm dừng đến lượt sau. Hàng đợi được lưu cùng trạng thái, và bản dịch nháp được đọc bằng trang vận hành. Cập nhật phần mô tả tiếng Việt trong registry sau khi duyệt bản nháp. AI không xác nhận trạng thái tuyển sinh và không nhận nội dung người dùng.
4. Workflow ghi queue và snapshot JSON lên nhánh dữ liệu trước khi gọi Worker. Worker xác thực PUT, kiểm tra schema, từ chối ghi đè bản mới hơn và lưu một bản snapshot trong D1. Trang đọc bản hợp lệ mới nhất giữa Worker, JSON nhánh dữ liệu và JSON đi kèm. Nếu cùng thời điểm, dữ liệu Worker được ưu tiên. Nếu mất D1, frontend vẫn dùng JSON. Tất cả dữ liệu của một lần refresh được cập nhật nguyên tử trong D1 bằng một câu lệnh SQL.

## Bật chạy thử với tài khoản của chủ website

1. Tạo GitHub repo staging hoặc rà soát trên nhánh riêng trước. Trên repo staging công khai, tạo nhánh `scholarship-data` với `snapshot.json` ở thư mục gốc. Có thể tạo một nhánh chỉ chứa dữ liệu bằng repo tạm. Đừng đặt nhánh này làm nguồn Pages. GitHub Actions đọc workflow theo lịch từ nhánh mặc định.
2. Chuẩn bị một Google AI Studio project Free Tier chưa gắn billing. Trong Cloudflare dùng Workers Free, kiểm tra AI model có sẵn trên Free và tạo D1 riêng cho staging. Có thể chạy snapshot-only trước rồi thêm từng dịch vụ. Tạo Workers AI token giới hạn quyền chạy inference.
3. Trong thư mục `scholarship/`, sao chép `wrangler.example.toml` thành `wrangler.toml`. Thay tên Worker, D1 database ID, `SITE_ORIGIN` đúng origin staging và chỉ đặt `CLOUDFLARE_TIER = "workers-free"` sau khi đã đối chiếu gói. Wrangler dùng tài khoản Cloudflare do chủ website xác thực. Chạy các lệnh sau với tên database staging đã cấu hình:

   ```sh
   npx wrangler d1 migrations apply maxngo-scholarship-staging --remote
   npx wrangler deploy
   npx wrangler secret put INGEST_TOKEN
   ```

   Dùng token ngẫu nhiên tối thiểu 32 ký tự (ví dụ `openssl rand -hex 32`). Gắn cùng token vào GitHub Secret `SCHOLARSHIP_INGEST_TOKEN`.

4. Cấu hình GitHub Actions Variables và Secrets. Chỉ bật biến gói cho dịch vụ đã xác nhận đủ điều kiện. Khi biến hạn mức thiếu hoặc sai, crawler bỏ qua dịch vụ và giữ việc chờ. GitHub cần cho workflow ghi nhánh `scholarship-data` bằng `GITHUB_TOKEN`.

   | Loại | Tên | Giá trị |
   |---|---|---|
   | Variable | `SCHOLARSHIP_ENABLED` | `true` sau khi đã chuẩn bị nhánh dữ liệu |
   | Variable | `GEMINI_TIER` | `free-unbilled` |
   | Secret | `GEMINI_API_KEY` | API key từ project Free Tier |
   | Variable | `CLOUDFLARE_TIER` | `workers-free` |
   | Variable | `CF_ACCOUNT_ID` | ID Cloudflare |
   | Secret | `CF_AI_TOKEN` | Workers AI token |
   | Variable | `SCHOLARSHIP_WORKER_URL` | URL HTTPS `*.workers.dev/api/scholarships` |
   | Secret | `SCHOLARSHIP_INGEST_TOKEN` | Cùng giá trị với `INGEST_TOKEN` của Worker |

5. Trên nhánh mặc định staging, chạy **MaxNgo Scholarship data** bằng nút **Run workflow**. Xem phần Summary để kiểm tra tình trạng từng nguồn, quota và D1. Sau đó đặt `workerUrl` và `snapshotUrl` trong `hoc-tap/san-hoc-bong/config.mjs`. Snapshot URL công khai dùng cấu trúc `https://raw.githubusercontent.com/OWNER/REPO/scholarship-data/snapshot.json`. Kiểm tra CORS từ đúng origin, GET Worker, thử lỗi Worker để kiểm tra fallback và xác thực PUT. Nếu chạy Pages từ một nhánh, commit do workflow tạo không kích hoạt build Pages. URL JSON nhánh dữ liệu cho phép làm mới danh sách mà không cần build lại website.
6. Chỉ hợp nhất và cho phép cấu hình production sau khi staging qua kiểm thử. Tắt đồng bộ nhanh bằng cách gỡ biến `SCHOLARSHIP_ENABLED` hoặc ngắt từng tier. Sau khi thử, đổi token nếu đã chia sẻ ngoài vùng Secrets. Chủ tài khoản cần gỡ xác nhận gói trước khi chuyển sang bất kỳ gói trả phí nào. Phần mềm không đọc được trạng thái thanh toán theo thời gian thực và không tự thao tác billing.

## Theo dõi và giới hạn

Workflow chạy lúc 01:23 và 13:23 UTC, tương ứng 08:23 và 20:23 giờ Việt Nam, phụ thuộc lịch GitHub Actions. Để xem chi tiết vận hành, tải `state.json` từ nhánh dữ liệu và chạy `python3 scholarship/monitor.py --state /path/to/state.json`. State trên nhánh public chứa mã nguồn đã đăng ký, dấu thời gian, tình trạng và bản dịch từ mô tả chương trình công khai. Không đưa hồ sơ, dữ liệu cá nhân, hay khóa vào registry, snapshot hoặc state. Khi nguồn đổi tổ chức trang, kiểm tra thông báo gốc và cập nhật bộ đọc cùng test.

Chi phí dịch vụ dự kiến là **0 USD** khi dùng các gói miễn phí đã xác nhận và còn hạn mức. Mỗi lượt chạy gọi tối đa bốn lệnh AI ngắn. Workers Free có 10.000 Neurons AI mỗi ngày. D1 Free có 5 triệu dòng đọc và 100.000 dòng ghi mỗi ngày, với các giới hạn cấp tài khoản. Khi các hạn mức bị chạm, queue hoặc snapshot dự phòng tiếp tục phục vụ. GitHub Actions dùng runner tiêu chuẩn cho kho công khai.

- [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Smoke test từ nhánh staging

Workflow `Scholarship staging smoke test` chạy khi đẩy nhánh `maxngo-scholarship-staging`. Cần các Repository Secrets `GEMINI_API_KEY`, `CF_AI_TOKEN`, `SCHOLARSHIP_INGEST_TOKEN` và ID tài khoản `CF_ACCOUNT_ID` (Secret hoặc Variable). Trong **Settings → Secrets and variables → Actions → Variables**, đặt `GEMINI_TIER=free-unbilled`, `CLOUDFLARE_TIER=workers-free`, `SCHOLARSHIP_STAGING_WORKER_URL` trỏ tới endpoint Worker staging có migration D1, và `SCHOLARSHIP_STAGING_ENABLED=true` sau khi xác nhận các điều kiện này. Nếu có cấu hình Worker production, workflow yêu cầu URL staging khác URL đó.

Workflow đọc các nguồn chính thức, thử một yêu cầu thực cho từng API AI và kiểm tra ghi rồi đọc lại snapshot qua Worker staging. Kết quả từng mục nằm trong **Summary**. Workflow này không cần nhánh dữ liệu và không triển khai website. Chỉ dùng D1 staging riêng. Nếu thiếu điều kiện, Summary chỉ hiện mục cần cấu hình và dừng trước mọi cuộc gọi live.
