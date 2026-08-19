# WBS 1.4A: Web UI Testing Capabilities and Design Patterns

## Metadata

- **WBS Code:** `1.4A`
- **Task Name:** Nghiên cứu Năng lực Web UI (POM, COM, Role Locators, Network Mocking)
- **Assignee:** Lê Minh Quân (MSSV: 0306241143)
- **Task Weight:** `2.5%`
- **Deliverable Artifacts:** Mục 2.3 Chương 2 trong `67_Bao_cao.docx`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ nghiên cứu 3 trụ cột kỹ thuật kiểm thử Web UI: Mô hình phân lớp POM kết hợp COM, chiến lược định vị bền vững Role-Based Locators trên Accessibility Tree, và can thiệp tầng mạng `page.route()`.
- **Mục đích:** Cung cấp câu hỏi định hướng và tài liệu chính thống để người phụ trách thiết lập chuẩn mực kiến trúc cho toàn bộ bộ kiểm thử E2E của đồ án.
- **Điểm mấu chốt:** Nắm vững nguyên lý Composition trong COM và nguyên tắc triệt tiêu $100\%$ selector thô (XPath/CSS) trong kịch bản test.

---

## 1. Mục Tiêu & Phạm Vi Nghiên Cứu (Research Scope)

- **Phạm vi trọng tâm:**
  - Mô hình phân lớp hướng đối tượng: Page Object Model (POM) kết hợp Component Object Model (COM). Phân tách rõ ràng giữa cấu trúc giao diện, bộ định vị (Locators) và luồng kịch bản kiểm thử (`expect`).
  - Chiến lược định vị bền vững (Resilient Locators): Hệ thống Role-Based Locators dựa trên cây trợ năng W3C WAI-ARIA (`getByRole`, `getByLabel`, `getByPlaceholder`, `getByTestId`), cơ chế Lazy Evaluation, và Strict Mode chống bắt nhầm phần tử.
  - Can thiệp tầng mạng ở cấp độ CDP: Kỹ thuật Mocking API qua `page.route()`, giả lập lỗi máy chủ HTTP 500, sửa đổi response payload, và chặn tài nguyên rác.
- **Ranh giới ngoài phạm vi (Non-goals):** Không trực tiếp viết mã kịch bản test E2E cụ thể (đã phân bổ tại Phase 3).

---

## 2. Các Câu Hỏi Cốt Lõi Cần Trả Lời (Core Guiding Questions)

Người phụ trách cần nghiên cứu tài liệu chính thống để trả lời các câu hỏi sau:

1. **Về Kiến Trúc Phân Lớp POM & COM:**
   - Tại sao việc nhúng thẳng các chuỗi selector CSS/XPath vào file kịch bản test được coi là Anti-pattern trong tự động hóa?
   - Page Object Model (POM) truyền thống gặp hạn chế gì khi các thành phần giao diện (như Navbar, Shopping Cart Badge, Sidebar, Footer) xuất hiện lặp lại ở nhiều trang khác nhau?
   - Component Object Model (COM) áp dụng nguyên lý "Composition over Inheritance" như thế nào để đóng gói các thành phần dùng chung và nhúng vào các Page Objects lớn hơn?
2. **Về Chiến Lược Định Vị Bền Vững (Role-Based Locators):**
   - Trình bày thứ tự ưu tiên của bảng bộ định vị Playwright (Tier 1: `getByRole`, Tier 2: `getByLabel` / `getByPlaceholder`, Tier 3: `getByTestId`).
   - Tại sao `getByRole` được khuyến nghị là ưu tiên số 1 theo tiêu chuẩn W3C WAI-ARIA (mô phỏng chính xác cách người dùng thực tương tác và người khuyết tật dùng trình đọc màn hình)?
   - Cơ chế Strict Mode của Playwright hoạt động như thế nào khi một locator trả về $\ge 2$ phần tử trong DOM?
3. **Về Can Thiệp Tầng Mạng & Mocking (`page.route()`):**
   - Kỹ thuật `page.route()` can thiệp vào request mạng ở tầng nào bên trong trình duyệt (CDP Network Domain)?
   - Làm thế nào để giả lập mã lỗi `HTTP 500 Internal Server Error` hoặc làm trễ response $5\text{s}$ để kiểm tra khả năng chịu lỗi (Graceful Degradation) của UI mà không cần can thiệp vào backend thật?

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

Người phụ trách bắt buộc phải đọc và trích dẫn từ các nguồn chuẩn sau:

1. **Tài Liệu Chính Thống Playwright:**
   - [Playwright Page Object Model Architecture Guide](https://playwright.dev/docs/pom)
   - [Playwright Locators & Accessibility Tree Practices](https://playwright.dev/docs/locators)
   - [Playwright Network Mocking & Interception](https://playwright.dev/docs/mock)
2. **Tiêu Chuẩn Trợ Năng Quốc Tế:**
   - [W3C WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)

---

## 4. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo Word (`67_Bao_cao.docx` - Mục 2.3 Chương 2)
- **2.3.1. Kiến trúc phân lớp kép POM & COM:**
  - Phân tích nguyên lý Single Responsibility và sơ đồ cây thư mục `pages/` kết hợp `pages/components/`.
  - Minh họa mối quan hệ giữa Page Object và Component Object bằng sơ đồ khối.
- **2.3.2. Chiến lược định vị bền vững với Role-Based Locators:**
  - Bảng thứ tự ưu tiên các loại Locator.
  - Phân tích cơ chế Strict Mode và Lazy Evaluation.
- **2.3.3. Can thiệp tầng mạng & API Mocking:** Hướng dẫn sử dụng `page.route()` để chặn request và mock response lỗi.

---

## 5. Tiêu Chí Đánh Giá & Nghiệm Thu (Evaluation Rubric & DoD)

- [ ] **Khả Năng Phản Biện:** Giải thích được sự khác biệt giữa POM truyền thống và POM kết hợp COM, giải thích nguyên lý hoạt động của `page.route()`.
- [ ] **Chất Lượng Học Thuật:**
  - [ ] Sơ đồ cây thư mục phân lớp POM/COM tự vẽ rõ ràng, logic.
  - [ ] Dẫn nguồn đúng đặc tả W3C WAI-ARIA theo chuẩn IEEE.
