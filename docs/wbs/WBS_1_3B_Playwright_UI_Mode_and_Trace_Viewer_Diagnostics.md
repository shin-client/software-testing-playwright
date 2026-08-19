# WBS 1.3B: Playwright UI Mode and Trace Viewer Diagnostics

## Metadata

- **WBS Code:** `1.3B`
- **Task Name:** Nghiên cứu Chuyên sâu Playwright UI Mode & Trình gỡ lỗi Trace Viewer
- **Assignee:** Lê Minh Tài (MSSV: 0306241145)
- **Task Weight:** `2.5%`
- **Deliverable Artifacts:** Mục 2.2B Chương 2 trong `67_Bao_cao.docx`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ nghiên cứu bộ đôi công cụ chẩn đoán sự cố: Playwright UI Mode (Tương tác thời gian thực khi viết code) và Trace Viewer (Khám nghiệm sự cố hậu kỳ sau khi chạy test).
- **Mục đích:** Cung cấp câu hỏi định hướng và tài liệu chính thống để người phụ trách làm chủ quy trình phân tích nguyên nhân gốc rễ (Root Cause Analysis) cho các bài test fail trên máy chủ CI/CD.
- **Điểm mấu chốt:** Nắm vững 4 luồng dữ liệu kiểm toán trong file `trace.zip` và cơ chế Time-Travel Debugging mà không cần chạy lại kịch bản.

---

## 1. Mục Tiêu & Phạm Vi Nghiên Cứu (Research Scope)

- **Phạm vi trọng tâm:**
  - Giao diện tương tác thời gian thực: Playwright UI Mode (`bunx playwright test --ui`), tính năng Watch Mode, Time-Travel DOM inspection, Locator Picker trực quan.
  - Công cụ khám nghiệm sự cố hậu kỳ: Playwright Trace Viewer (`bunx playwright show-trace`), quy trình phân tích lỗi trên máy chủ CI/CD không có giao diện (Headless).
  - Cấu trúc dữ liệu của file nén kiểm toán `trace.zip`: Filmstrip timeline (ảnh chụp tuần tự), Action snapshots (DOM trước, trong và sau action), Network waterfall (HAR), Console logs và Source call stack.
  - Chiến lược cấu hình ghi Trace tối ưu trong `playwright.config.ts` (`on-first-retry`) để cân bằng giữa hiệu năng và dung lượng lưu trữ.
- **Ranh giới ngoài phạm vi (Non-goals):** Không viết code kịch bản test chẩn đoán performance glitch (đã phân bổ tại WBS 3.3).

---

## 2. Các Câu Hỏi Cốt Lõi Cần Trả Lời (Core Guiding Questions)

Người phụ trách cần nghiên cứu tài liệu chính thống để trả lời các câu hỏi sau:

1. **Về Playwright UI Mode:**
   - Playwright UI Mode mang lại những lợi ích gì cho kỹ sư SDET so với việc chạy test thông thường trong terminal?
   - Tính năng Time-Travel Debugging cho phép quan sát DOM ở 3 thời điểm: `Before Action`, `Action`, và `After Action` như thế nào?
   - Cơ chế Watch Mode tự động phát hiện thay đổi file và chạy lại test giúp tăng tốc độ phát triển (Feedback loop) ra sao?
2. **Về Playwright Trace Viewer:**
   - Khi một bài test bị fail trên máy chủ CI/CD (GitHub Actions), tại sao Trace Viewer là công cụ duy nhất cung cấp $100\%$ bằng chứng kiểm toán mà không cần phải cố gắng tái hiện lại trên máy local?
   - Phân tích chi tiết 4 luồng dữ liệu bên trong file `trace.zip`:
     1. **Filmstrip:** Chuỗi ảnh chụp màn hình theo từng mili-giây giúp phát hiện giao diện bị treo ra sao?
     2. **Network Log (HAR):** Xem Header, Request/Response body và độ trễ từng API call như thế nào?
     3. **DOM Snapshot:** Tại sao DOM snapshot trong Trace Viewer có thể tương tác (Inspect element) được như trên trình duyệt thật?
     4. **Console & Source Stack:** Xác định chính xác dòng code gây lỗi ngoại lệ như thế nào?
3. **Về Cấu Hình & Dịch Vụ Đám Mây:**
   - Tại sao trong môi trường CI/CD nên đặt cấu hình `trace: 'on-first-retry'` thay vì `trace: 'on'`?
   - Nền tảng web [trace.playwright.dev](https://trace.playwright.dev) xử lý file trace như thế nào (PWA chạy $100\%$ client-side, không tải dữ liệu người dùng lên server bên thứ ba)?

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

Người phụ trách bắt buộc phải đọc và trích dẫn từ các nguồn chuẩn sau:

1. **Tài Liệu Chính Thống Playwright:**
   - [Playwright UI Mode Interactive Testing Guide](https://playwright.dev/docs/test-ui-mode)
   - [Playwright Trace Viewer Comprehensive Guide](https://playwright.dev/docs/trace-viewer)
   - [Playwright Cloud Trace Viewer Tool](https://trace.playwright.dev/)
   - [Playwright Tracing API Documentation](https://playwright.dev/docs/api/class-tracing)

---

## 4. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo Word (`67_Bao_cao.docx` - Mục 2.2B Chương 2)
- **2.2B.1. Trình gỡ lỗi tương tác thời gian thực Playwright UI Mode:** Giới thiệu các tính năng Watch mode, Time-travel, Locator Picker. Đính kèm 01 ảnh chụp thực tế giao diện UI Mode.
- **2.2B.2. Trình khám nghiệm hậu kỳ Playwright Trace Viewer:**
  - Phân tích 4 luồng dữ liệu kiểm toán trong file `trace.zip`.
  - Hướng dẫn cách cấu hình ghi trace trong `playwright.config.ts`.
  - Đính kèm 02 ảnh chụp minh họa giao diện Trace Viewer (Tab Network Waterfall và Filmstrip Timeline).

---

## 5. Tiêu Chí Đánh Giá & Nghiệm Thu (Evaluation Rubric & DoD)

- [ ] **Khả Năng Phản Biện:** Trình diễn được thao tác mở file `trace.zip` và giải thích được các luồng dữ liệu trên giao diện Trace Viewer khi được yêu cầu.
- [ ] **Chất Lượng Học Thuật:**
  - [ ] Ảnh chụp màn hình rõ nét, thể hiện đúng các tab phân tích (Network, Filmstrip, DOM Snapshots).
  - [ ] Phân tích được ưu thế vượt trội của Trace Viewer so với việc chỉ lưu log console dạng text truyền thống.
