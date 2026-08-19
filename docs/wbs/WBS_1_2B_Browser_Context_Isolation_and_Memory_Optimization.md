# WBS 1.2B: Browser Context Isolation and Memory Optimization

## Metadata

- **WBS Code:** `1.2B`
- **Task Name:** Nghiên cứu Cơ chế Browser Context Isolation & Tối ưu hóa Bộ nhớ RAM
- **Assignee:** Nguyễn Quốc Đương (MSSV: 0306241102)
- **Task Weight:** `2.5%`
- **Deliverable Artifacts:** Mục 1.4 Chương 1 trong `67_Bao_cao.docx`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ nghiên cứu kiến trúc phân tầng bộ nhớ và cơ chế cô lập ngữ cảnh trình duyệt (Browser Context Isolation) của Playwright.
- **Mục đích:** Cung cấp câu hỏi định hướng và tài liệu chính thống để người phụ trách chứng minh khả năng chạy song song hàng trăm test độc lập trên 1 Browser Process duy nhất.
- **Điểm mấu chốt:** Nắm vững cơ chế ảo hóa Incognito trong RAM, khả năng tiết kiệm $90\%$ bộ nhớ và kỹ thuật tái sử dụng phiên xác thực qua `storageState`.

---

## 1. Mục Tiêu & Phạm Vi Nghiên Cứu (Research Scope)

- **Phạm vi trọng tâm:**
  - Phân tầng tiến trình hệ điều hành: Sự khác biệt giữa `Browser Process` (Tiến trình OS nặng), `BrowserContext` (Ngữ cảnh cô lập trong RAM), và `Page` (Tab giao diện).
  - Cơ chế cô lập trạng thái tuyệt đối (Zero State Leakage): Cookies, Web Storage (`localStorage`, `sessionStorage`), IndexedDB, Permissions, Geolocation.
  - Hiệu quả tài nguyên định lượng: Chi phí khởi động và dung lượng RAM giữa việc mở Browser mới vs tạo Context mới.
  - Kỹ thuật tối ưu hóa thời gian chạy E2E: Quản lý phiên xác thực nhanh qua `storageState.json` (Authentication Reuse).
- **Ranh giới ngoài phạm vi (Non-goals):** Không cấu hình file fixture code thực nghiệm (đã phân bổ tại WBS 2.1).

---

## 2. Các Câu Hỏi Cốt Lõi Cần Trả Lời (Core Guiding Questions)

Người phụ trách cần nghiên cứu tài liệu chính thống để trả lời các câu hỏi sau:

1. **Về Phân Tầng Tiến Trình Trình Duyệt:**
   - Tại sao việc khởi động một tiến trình trình duyệt Chromium mới (`Browser Process`) lại tốn nhiều thời gian ($~1500\text{ms}$) và ngốn nhiều tài nguyên RAM ($~150\text{MB}$)?
   - `BrowserContext` trong Playwright hoạt động như thế nào? Tại sao nó có thể khởi tạo mới chỉ trong $2\text{ms} - 10\text{ms}$ và tiêu tốn chỉ vài Megabytes RAM?
2. **Về Cơ Chế Cô Lập Trạng Thái (State Isolation):**
   - Làm thế nào Playwright đảm bảo rằng Cookie, Token đăng nhập hoặc dữ liệu lưu trong `localStorage` của Bài test A không bị rò rỉ (leak) sang Bài test B?
   - Tại sao cơ chế này cho phép Playwright chạy song song (Parallel Execution) nhiều workers độc lập mà không bao giờ bị xung đột dữ liệu phiên?
3. **Về Kỹ Thuật Tối Ưu Hóa Phiên Xác Thực (`storageState`):**
   - Vấn đề nghẽn thời gian: Nếu 50 bài test E2E đều phải tự điền form đăng nhập trên UI ($3\text{s} - 5\text{s}$ mỗi bài), tổng thời gian lãng phí là bao nhiêu?
   - Cơ chế `storageState` trích xuất trạng thái Cookies/LocalStorage sau khi đăng nhập 1 lần (qua API hoặc UI setup) và nạp trực tiếp vào RAM của các `BrowserContext` tiếp theo như thế nào?

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

Người phụ trách bắt buộc phải đọc và trích dẫn từ các nguồn chuẩn sau:

1. **Tài Liệu Chính Thống Playwright:**
   - [Playwright BrowserContext API Documentation](https://playwright.dev/docs/api/class-browsercontext)
   - [Playwright Isolation Architecture & Browser Contexts](https://playwright.dev/docs/browser-contexts)
   - [Playwright Authentication & Storage State Strategy](https://playwright.dev/docs/auth)
2. **Kiến Trúc Nhân Trình Duyệt:**
   - [Chromium Multi-process Architecture (The Chromium Projects)](https://www.chromium.org/developers/design-documents/multi-process-architecture/)

---

## 4. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo Word (`67_Bao_cao.docx` - Mục 1.4 Chương 1)
- **1.4.1. Phân tầng kiến trúc Browser -> BrowserContext -> Page:**
  - Phân tích sự khác biệt giữa tiến trình OS và không gian bộ nhớ RAM.
  - Tự vẽ 01 sơ đồ cây phân cấp kiến trúc 3 tầng.
- **1.4.2. Cơ chế cô lập trạng thái đa người dùng:** Giải thích chi tiết sự cô lập của Cookies, LocalStorage, IndexedDB và Cache.
- **1.4.3. Kỹ thuật tái sử dụng phiên xác thực (`storageState`):** Sơ đồ luồng lưu và nạp `storageState.json` để tăng tốc toàn bộ test suite.
- **1.4.4. Bảng so sánh tài nguyên:** Bảng đối soát RAM, CPU và thời gian khởi tạo giữa Browser-level isolation (Selenium) và Context-level isolation (Playwright).

---

## 5. Tiêu Chí Đánh Giá & Nghiệm Thu (Evaluation Rubric & DoD)

- [ ] **Khả Năng Phản Biện:** Giải thích rõ ràng bản chất kỹ thuật của `BrowserContext` và cơ chế hoạt động của `storageState` trước câu hỏi phản biện.
- [ ] **Chất Lượng Học Thuật:**
  - [ ] Sơ đồ cây phân cấp bộ nhớ tự vẽ rõ ràng, trực quan.
  - [ ] Bảng so sánh tài nguyên có số liệu định lượng cụ thể.
