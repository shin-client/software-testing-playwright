# WBS 1.4B: API Testing Capabilities and Design Patterns

## Metadata

- **WBS Code:** `1.4B`
- **Task Name:** Nghiên cứu Năng lực API (APIRequestContext, Hybrid Auth, SOM, RFC 9457)
- **Assignee:** Nguyễn Hoài Linh (MSSV: 0306241126)
- **Task Weight:** `2.5%`
- **Deliverable Artifacts:** Mục 2.4 Chương 2 trong `67_Bao_cao.docx`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ nghiên cứu năng lực tự động hóa kiểm thử API của Playwright thông qua đối tượng `APIRequestContext`, kỹ thuật xác thực lai (Hybrid Auth), mô hình Service Object Model (SOM), và chuẩn hóa dữ liệu lỗi RFC 9457 với Zod.
- **Mục đích:** Cung cấp câu hỏi định hướng và tài liệu chính thống để người phụ trách thiết lập chuẩn mực kiến trúc cho toàn bộ bộ kiểm thử API của đồ án (Phase 2).
- **Điểm mấu chốt:** Nắm vững tốc độ thực thi micro-giây, cơ chế quản lý Cookie Jar tự động và kỹ thuật chống Contract Drift bằng Zod Schema.

---

## 1. Mục Tiêu & Phạm Vi Nghiên Cứu (Research Scope)

- **Phạm vi trọng tâm:**
  - Engine HTTP độc lập: Đối tượng `APIRequestContext` trong Playwright, khả năng thực thi HTTP request trực tiếp qua socket mà không cần khởi tạo trình duyệt đồ họa.
  - Kỹ thuật Xác thực lai (Hybrid Authentication): Đăng nhập qua API lấy JWT Token ($30\text{ms}$) $\to$ Lưu `storageState` $\to$ Nạp thẳng vào `BrowserContext` của Web UI để bỏ qua bước gõ phím đăng nhập trên UI ($3\text{s} - 5\text{s}$).
  - Mô hình Service Object Model (SOM) & Request Chaining: Đóng gói API endpoints theo nghiệp vụ và chuyền dữ liệu giữa các API liên tiếp.
  - Kiểm định hợp đồng dữ liệu lỗi quốc tế: Chuẩn RFC 9457 (Problem Details for HTTP APIs - `application/problem+json`) kết hợp với thư viện xác thực Schema Zod.
- **Ranh giới ngoài phạm vi (Non-goals):** Không trực tiếp viết mã 4 ca test API cụ thể (đã phân bổ tại Phase 2).

---

## 2. Các Câu Hỏi Cốt Lõi Cần Trả Lời (Core Guiding Questions)

Người phụ trách cần nghiên cứu tài liệu chính thống để trả lời các câu hỏi sau:

1. **Về Đối Tượng `APIRequestContext`:**
   - Tại sao việc kiểm thử API trực tiếp bằng Playwright `request` lại vượt trội hơn việc dùng thư viện ngoài (như Axios, Supertest, Postman) khi tích hợp trong cùng một dự án E2E?
   - `APIRequestContext` quản lý `baseURL`, `extraHTTPHeaders` và Cookie Jar tự động giữa các request như thế nào?
2. **Về Kỹ Thuật Xác Thực Lai (Hybrid Authentication):**
   - Bản chất của Hybrid Auth là gì? Tại sao việc kết hợp kiểm thử API (để setup dữ liệu và xác thực) với kiểm thử Web UI (để test trải nghiệm người dùng) giúp giảm $> 80\%$ tổng thời gian chạy của test suite?
3. **Về Mô Hình Service Object Model (SOM) & Request Chaining:**
   - Mô hình Service Object Model (SOM) áp dụng nguyên lý tách biệt trách nhiệm (Separation of Concerns) trong API testing như thế nào?
   - Request Chaining (Chuyền Token $\to$ SeatID $\to$ BookingID $\to$ Ticket) được tổ chức ra sao để đảm bảo tính nguyên tử của kịch bản kiểm thử?
4. **Về Chuẩn Hóa Lỗi RFC 9457 & Zod Schema:**
   - Cấu trúc chuẩn của một HTTP Error Response theo chuẩn quốc tế RFC 9457 (`type`, `title`, `status`, `detail`, `instance`) gồm những trường bắt buộc nào?
   - Tại sao kiểm thử API bắt buộc phải có bước kiểm định Schema (Zod Schema Validation) thay vì chỉ kiểm tra HTTP Status Code `200` hay `400`? Vấn đề "Contract Drift" xảy ra khi nào?

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

Người phụ trách bắt buộc phải đọc và trích dẫn từ các nguồn chuẩn quốc tế sau:

1. **Tài Liệu Chính Thống Playwright:**
   - [Playwright API Testing Official Guide](https://playwright.dev/docs/api-testing)
   - [Playwright APIRequestContext API Reference](https://playwright.dev/docs/api/class-apirequestcontext)
2. **Chuẩn Giao Thức & Thư Viện Schema:**
   - [IETF RFC 9457 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc9457)
   - [Zod TypeScript-First Schema Validation Documentation](https://zod.dev/)

---

## 4. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo Word (`67_Bao_cao.docx` - Mục 2.4 Chương 2)
- **2.4.1. Năng lực kiểm thử API với `APIRequestContext`:** Phân tích cơ chế headless HTTP engine, tốc độ thực thi và cấu hình tập trung.
- **2.4.2. Kỹ thuật Xác thực lai (Hybrid Auth):**
  - Trình bày sơ đồ luồng dữ liệu Hybrid Auth giữa API và UI.
  - Phân tích định lượng thời gian tiết kiệm được.
- **2.4.3. Mô hình Service Object Model (SOM) & Request Chaining:** Cấu trúc tổ chức class dịch vụ và luồng chuyền dữ liệu.
- **2.4.4. Kiểm định hợp đồng dữ liệu chuẩn RFC 9457:** Giải thích cấu trúc 5 trường chuẩn của RFC 9457 và vai trò của Zod trong việc chống Contract Drift.

---

## 5. Tiêu Chí Đánh Giá & Nghiệm Thu (Evaluation Rubric & DoD)

- [ ] **Khả Năng Phản Biện:** Giải thích rõ ràng nguyên lý Hybrid Auth, cấu trúc RFC 9457 và cơ chế hoạt động của Zod khi được chất vấn.
- [ ] **Chất Lượng Học Thuật:**
  - [ ] Sơ đồ luồng dữ liệu Hybrid Auth tự vẽ rõ ràng, thể hiện chính xác mối quan hệ giữa API Token và Browser Context.
  - [ ] Dẫn nguồn đúng đặc tả IETF RFC 9457 theo chuẩn IEEE.
