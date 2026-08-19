# WBS 1.1B: WebSocket CDP vs HTTP WebDriver Architecture

## Metadata

- **WBS Code:** `1.1B`
- **Task Name:** Nghiên cứu Kiến trúc kết nối WebSocket CDP vs HTTP WebDriver
- **Assignee:** Trần Văn Ngọc (MSSV: 0306241131)
- **Task Weight:** `2.0%`
- **Deliverable Artifacts:** Mục 1.2 Chương 1 trong `67_Bao_cao.docx`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ nghiên cứu cơ chế kết nối mạng và giao thức điều khiển trình duyệt giữa Playwright (WebSocket CDP) và Selenium (HTTP WebDriver).
- **Mục đích:** Cung cấp câu hỏi định hướng và tài liệu chuẩn để người phụ trách phân tích nguồn gốc hiệu năng micro-giây của Playwright.
- **Điểm mấu chốt:** Chứng minh nguyên nhân gốc rễ giúp Playwright triệt tiêu TCP handshake overhead và bắt sự kiện thời gian thực.

---

## 1. Mục Tiêu & Phạm Vi Nghiên Cứu (Research Scope)

- **Phạm vi trọng tâm:**
  - Cơ chế hoạt động của Selenium WebDriver: Mô hình HTTP REST Client-Server, vai trò của tiến trình trung gian (`chromedriver`, `geckodriver`), cơ chế Stateless Polling.
  - Cơ chế hoạt động của Playwright: Single Persistent WebSocket Pipe (RFC 6455), kết nối trực tiếp vào Chrome DevTools Protocol (CDP) / Firefox / WebKit internal sockets.
  - Kỹ thuật truyền thông tin: Multiplexed JSON-RPC 2.0, cơ chế Push Notifications thời gian thực khi có sự kiện DOM/Network thay đổi.
  - Phân tích định lượng: Chi phí đóng gói Header, chi phí bắt tay TCP Handshake, và độ trễ Round-Trip Time (RTT).
- **Ranh giới ngoài phạm vi (Non-goals):** Không đi sâu vào chi tiết code lập trình test case (thuộc Phase 2 & 3).

---

## 2. Các Câu Hỏi Cốt Lõi Cần Trả Lời (Core Guiding Questions)

Người phụ trách cần nghiên cứu tài liệu chính thống để trả lời các câu hỏi sau:

1. **Về Kiến Trúc Selenium HTTP WebDriver:**
   - Tại sao Selenium bắt buộc phải có một file nhị phân trung gian (`chromedriver.exe`, `geckodriver.exe`) nằm giữa Test Script và Trình duyệt?
   - Khi thực hiện một thao tác đơn giản như `click()` hay `sendKeys()`, Selenium tạo ra bao nhiêu HTTP Request? Chi phí độ trễ (Latency) cho từng request này là bao nhiêu?
   - Tại sao tính chất Stateless của HTTP 1.1 buộc Selenium phải liên tục "thăm dò thụ động" (Polling DOM) thay vì nhận thông báo đẩy?
2. **Về Kiến Trúc Playwright WebSocket CDP:**
   - Single Persistent WebSocket Pipe hoạt động như thế nào trong Playwright? Tại sao chỉ cần 1 kết nối duy nhất cho toàn bộ phiên làm việc?
   - Giao thức JSON-RPC 2.0 giải quyết bài toán truyền đồng thời nhiều lệnh (Multiplexing) mà không bị nghẽn (Head-of-Line blocking) ra sao?
   - Cơ chế Event-Driven Push Notifications của CDP giúp Playwright phát hiện sự kiện mạng hoàn tất (`networkidle`) hoặc DOM biến đổi tức thì như thế nào?
3. **Về Bảng Đối Soát Thông Số Kỹ Thuật:**
   - Xây dựng ma trận so sánh chi tiết giữa 2 kiến trúc dựa trên 5 tiêu chí: Giao thức truyền tải, Tiến trình trung gian, Độ trễ trung bình mỗi action, Cơ chế phát hiện sự kiện, Năng lực can thiệp/Mocking tầng mạng.

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

Người phụ trách bắt buộc phải đọc và trích dẫn từ các nguồn chuẩn quốc tế sau:

1. **Chuẩn Giao Thức & Đặc Tả Quốc Tế:**
   - [Chrome DevTools Protocol (CDP) Official Documentation](https://chromedevtools.github.io/devtools-protocol/)
   - [W3C WebDriver Specification (W3C Recommendation)](https://www.w3.org/TR/webdriver2/)
   - [IETF RFC 6455 - The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
2. **Tài Liệu Kiến Trúc Chính Thống:**
   - [Selenium Official Documentation - Architectural Overview](https://www.selenium.dev/documentation/overview/)
   - [Playwright Architecture Deep Dive (Microsoft)](https://playwright.dev/docs/why-playwright)

---

## 4. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo Word (`67_Bao_cao.docx` - Mục 1.2 Chương 1)
- **1.2.1. Kiến trúc truyền thống Selenium HTTP WebDriver:** Mô tả mô hình 3 tầng (Client -> Driver Proxy -> Browser), phân tích nhược điểm Stateless và chi phí HTTP overhead.
- **1.2.2. Kiến trúc hiện đại Playwright WebSocket CDP:** Mô tả mô hình kết nối trực tiếp 2 chiều (Bi-directional), giao thức JSON-RPC 2.0 và cơ chế Event-driven.
- **1.2.3. Sơ đồ kiến trúc đối chiếu:** Tự vẽ 02 sơ đồ khối đối chiếu luồng dữ liệu của Selenium và Playwright.
- **1.2.4. Bảng đối soát kỹ thuật:** Bảng ma trận so sánh 5 tiêu chí kỹ thuật cốt lõi giữa 2 kiến trúc.

---

## 5. Tiêu Chí Đánh Giá & Nghiệm Thu (Evaluation Rubric & DoD)

- [ ] **Khả Năng Phản Biện:** Giải thích rõ ràng nguyên lý TCP Handshake, WebSocket Pipe và JSON-RPC 2.0 khi được hỏi.
- [ ] **Chất Lượng Học Thuật:**
  - [ ] Sơ đồ kiến trúc tự vẽ rõ ràng, chỉ rõ chiều mũi tên truyền dữ liệu (One-way HTTP Request-Response vs Bi-directional WebSocket Pipe).
  - [ ] Dẫn nguồn đúng đặc tả W3C WebDriver và RFC 6455 theo chuẩn IEEE.
