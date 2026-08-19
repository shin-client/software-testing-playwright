# WBS 1.5B: Playwright vs Selenium and Cypress Comparison

## Metadata

- **WBS Code:** `1.5B`
- **Task Name:** Nghiên cứu Đối sánh Playwright vs Selenium 4 & Cypress (HTTP vs CDP, Multi-tab)
- **Assignee:** Nguyễn Quốc Đương (MSSV: 0306241102)
- **Task Weight:** `2.0%`
- **Deliverable Artifacts:** Mục 4.2 Chương 4 trong `67_Bao_cao.docx` / `67_Bao_cao.tex`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ nghiên cứu so sánh kỹ thuật giữa Playwright và 2 công cụ mã nguồn mở phổ biến nhất: Selenium 4 và Cypress.
- **Mục đích:** Cung cấp câu hỏi định hướng và tài liệu chính thống để người phụ trách phân tích 3 trường phái kiến trúc (HTTP Proxy vs In-Browser Iframe vs Out-of-Process WebSocket).
- **Điểm mấu chốt:** Nắm vững giới hạn vật lý của Cypress (Sandbox iframe, không hỗ trợ đa tab thật) và độ trễ của Selenium so với khả năng điều khiển toàn diện của Playwright.

---

## 1. Mục Tiêu & Phạm Vi Nghiên Cứu (Research Scope)

- **Phạm vi trọng tâm:**
  - Phân tích 3 trường phái kiến trúc kiểm thử tự động Web mã nguồn mở:
    1. **Selenium 4 (W3C WebDriver):** Kiến trúc Out-of-process gửi request qua tiến trình trung gian HTTP Proxy (chromedriver).
    2. **Cypress (In-Browser Execution):** Kiến trúc chạy trực tiếp bên trong Iframe của trình duyệt cùng với mã nguồn ứng dụng.
    3. **Playwright (Out-of-Process WebSocket):** Kiến trúc kết nối trực tiếp vào lõi trình duyệt qua Single Persistent WebSocket Pipe.
  - So sánh kỹ thuật chi tiết trên 6 tiêu chí:
    1. Cơ chế thực thi và giới hạn Sandbox.
    2. Năng lực xử lý Đa Tab (Multiple Tabs/Windows) và Đa Tên Miền (Cross-Origin / OAuth SSO).
    3. Năng lực kiểm thử API tích hợp sẵn (`APIRequestContext` vs `cy.request` vs Thư viện ngoài).
    4. Cơ chế thực thi song song (Parallel Multi-Worker miễn phí vs Dịch vụ trả phí Cypress Cloud).
    5. Tốc độ khởi tạo môi trường (Browser Context $< 10\text{ms}$ vs Mở Browser mới $> 1500\text{ms}$).
    6. Hệ sinh thái ngôn ngữ hỗ trợ (TypeScript, Python, Java, C# vs Chỉ JS/TS).
- **Ranh giới ngoài phạm vi (Non-goals):** Không so sánh lại với TestComplete (đã phân bổ tại WBS 1.5A).

---

## 2. Các Câu Hỏi Cốt Lõi Cần Trả Lời (Core Guiding Questions)

Người phụ trách cần nghiên cứu tài liệu chính thống để trả lời các câu hỏi sau:

1. **Về Giới Hạn Vật Lý Của Cypress (In-Browser Sandbox):**
   - Tại sao việc chạy test script bên trong iframe trình duyệt khiến Cypress gặp phải giới hạn cố hữu (Permanent Trade-offs) về bảo mật: Không thể mở và điều khiển 2 tab trình duyệt thật cùng lúc, gặp khó khăn khi chuyển hướng qua tên miền khác (Cross-Origin OAuth SSO)?
   - Lệnh `cy.origin()` của Cypress giải quyết bài toán Cross-origin như thế nào và nó vẫn còn những hạn chế gì?
2. **Về Selenium 4 & W3C WebDriver:**
   - Mặc dù Selenium 4 đã hỗ trợ chuẩn W3C WebDriver và bổ sung giao thức BiDi (Bi-directional), tại sao Selenium vẫn chưa đạt được tốc độ thực thi micro-giây và khả năng quản lý `BrowserContext` cô lập trong RAM như Playwright?
3. **Về Năng Lực Thực Thi Song Song & Chi Phí Hạ Tầng:**
   - Playwright cho phép chạy song song nhiều Worker threads độc lập và chia nhỏ bài test (Sharding) trên CI hoàn toàn miễn phí ra sao?
   - Tại sao Cypress lại hạn chế tính năng chạy song song nâng cao và yêu cầu người dùng phải trả phí cho dịch vụ Cypress Cloud?
4. **Về Bảng Ma Trận So Sánh 3 Công Cụ:**
   - Xây dựng bảng ma trận so sánh chi tiết giữa Playwright, Selenium 4 và Cypress trên 6 tiêu chí kỹ thuật nêu trên.

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

Người phụ trách bắt buộc phải đọc và trích dẫn từ các nguồn chuẩn sau:

1. **Tài Liệu Chính Thống Cypress:**
   - [Cypress Architecture & Permanent Trade-offs](https://docs.cypress.io/app/references/trade-offs)
   - [Cypress Cross-Origin Testing & cy.origin()](https://docs.cypress.io/app/guides/cross-origin-testing)
2. **Tài Liệu Chính Thống Selenium:**
   - [Selenium 4 Documentation - Architectural Overview](https://www.selenium.dev/documentation/overview/)
   - [Selenium WebDriver & W3C Standard](https://www.selenium.dev/documentation/webdriver/)
3. **Tài Liệu Chính Thống Microsoft Playwright:**
   - [Why Playwright? Architectural Comparison](https://playwright.dev/docs/why-playwright)

---

## 4. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo (`67_Bao_cao.docx` / `67_Bao_cao.tex` - Mục 4.2 Chương 4)
- **4.2.1. Phân tích 3 trường phái kiến trúc:** Trình bày sơ đồ phân biệt giữa HTTP Proxy (Selenium), In-Browser Iframe (Cypress), và WebSocket CDP (Playwright).
- **4.2.2. Giới hạn vật lý của Cypress (In-Browser Iframe Sandbox):** Đi sâu vào rào cản không hỗ trợ đa tab thật và Cross-Origin testing.
- **4.2.3. Độ trễ của Selenium 4 & Năng lực đa tab của Playwright:** Phân tích độ trễ HTTP của Selenium và cơ chế mở tab tự do qua `context.newPage()`.
- **4.2.4. Bảng ma trận so sánh kỹ thuật 3 công cụ:** Bảng đối soát 6 tiêu chí kỹ thuật cốt lõi.

---

## 5. Tiêu Chí Đánh Giá & Nghiệm Thu (Evaluation Rubric & DoD)

- [ ] **Khả Năng Phản Biện:** Giải thích rõ ràng nguyên nhân Cypress không mở được 2 tab thật và nguyên nhân Selenium chậm hơn Playwright khi được chất vấn.
- [ ] **Chất Lượng Học Thuật:**
  - [ ] Sơ đồ 3 trường phái kiến trúc tự vẽ rõ ràng, logic.
  - [ ] Dẫn nguồn đúng tài liệu chính thức của Cypress, Selenium và Microsoft theo chuẩn IEEE.
