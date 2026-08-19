# WBS 1.1A: Playwright Overview and Code-First Philosophy

## Metadata

- **WBS Code:** `1.1A`
- **Task Name:** Nghiên cứu Tổng quan Playwright, Lịch sử phát triển & Triết lý Code-First
- **Assignee:** Lê Minh Quân (MSSV: 0306241143)
- **Task Weight:** `2.0%`
- **Deliverable Artifacts:** Mục 1.1 Chương 1 trong `67_Bao_cao.docx`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ nghiên cứu cơ sở lý luận, nguồn gốc lịch sử và triết lý thiết kế Code-First của Playwright Test Engine.
- **Mục đích:** Cung cấp câu hỏi định hướng, tài liệu chính thống để người phụ trách tự tổng hợp nội dung cho Mục 1.1 Báo cáo đồ án.
- **Điểm mấu chốt:** Nắm vững 8 khái niệm kiến trúc cốt lõi và luận điểm bảo vệ tính ưu việt của Code-First trước hội đồng giảng viên.

---

## 1. Mục Tiêu & Phạm Vi Nghiên Cứu (Research Scope)

- **Phạm vi trọng tâm:**
  - Nguồn gốc hình thành của Playwright (Microsoft) từ nền tảng đội ngũ kỹ sư Puppeteer (Google).
  - Động lực thúc đẩy ra đời: Khắc phục các "điểm nghẽn cố hữu" của Selenium WebDriver (HTTP latency, flaky tests) và Cypress (In-browser iframe sandbox, cross-origin/multi-tab limitations).
  - Triết lý Code-First trong kiểm thử tự động (SDET): Tách biệt bản chất giữa Code-First và các công cụ Low-Code / GUI Tools truyền thống.
  - Hệ thống phân loại 8 khái niệm kiến trúc cốt lõi định hình năng lực Playwright.
- **Ranh giới ngoài phạm vi (Non-goals):** Không đi sâu vào cấu hình chi tiết code chạy thử nghiệm (đã phân bổ tại WBS 1.3A & 1.6).

---

## 2. Các Câu Hỏi Cốt Lõi Cần Trả Lời (Core Guiding Questions)

Người phụ trách cần nghiên cứu tài liệu chính thống để trả lời các câu hỏi sau:

1. **Về Nguồn Gốc & Động Lực Kỹ Thuật:**
   - Tại sao Microsoft lại đầu tư xây dựng Playwright vào năm 2020 khi thị trường đã có Selenium và Cypress thống trị?
   - Đội ngũ kỹ sư sáng lập Puppeteer đã mang những bài học kinh nghiệm gì từ Chrome DevTools sang Playwright để hỗ trợ đa engine (Chromium, WebKit, Firefox)?
2. **Về Triết Lý Code-First:**
   - Tại sao trong môi trường doanh nghiệp hiện đại, kịch bản kiểm thử bắt buộc phải là "Mã nguồn hạng nhất" (First-Class Code) thay vì file cấu hình XML/GUI của các công cụ Low-Code?
   - Tính năng `codegen` (Record & Playback) trong Playwright đóng vai trò là "Công cụ sinh mã gợi ý (Scaffolding)" hay là giải pháp thay thế hoàn toàn việc viết code?
3. **Về 8 Khái Niệm Kiến Trúc Cốt Lõi:**
   - Nêu rõ định nghĩa và vai trò của 8 khái niệm: `Browser Hierarchy`, `Locators`, `Auto-waiting`, `Web-first Assertions`, `Network Interception`, `APIRequestContext`, `POM & COM Architecture`, và `Test Fixtures`.
   - Tại sao kiến trúc kiểm thử hiện đại cần kết hợp cả Page Object Model (POM) và Component Object Model (COM)?
4. **Về Ranh Giới Kỹ Thuật Cứng (Non-goals):**
   - Những loại bài toán nào Playwright chủ đích không hỗ trợ (ví dụ: Performance Load Testing quy mô lớn, bypass Captcha/Cloudflare, tự động hóa ứng dụng Desktop ngoài trình duyệt)?

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

Người phụ trách bắt buộc phải đọc và trích dẫn từ các nguồn chính thống sau:

1. **Microsoft Playwright Official Docs:**
   - [Why Playwright? (Philosophy & Architecture Overview)](https://playwright.dev/docs/why-playwright)
   - [Getting Started & Core Concepts Guide](https://playwright.dev/docs/intro)
   - [Playwright Trace Viewer & Architecture Deep Dive](https://playwright.dev/docs/trace-viewer-intro)
2. **Repository Mã Nguồn Chính Thức:**
   - [Microsoft Playwright GitHub Repository (Architecture & Issues)](https://github.com/microsoft/playwright)
3. **Hệ Thống Tiêu Chuẩn & Bài Báo Kỹ Thuật:**
   - [W3C Web Accessibility Initiative (WAI-ARIA Core Concepts)](https://www.w3.org/WAI/ARIA/apg/)

---

## 4. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo Word (`67_Bao_cao.docx` - Mục 1.1 Chương 1)
- **1.1.1. Lịch sử phát triển & Bối cảnh ra đời:** Nêu rõ mốc thời gian 2020, giấy phép Apache 2.0, vai trò bảo trợ của Microsoft.
- **1.1.2. Triết lý thiết kế Code-First:** Bảng so sánh hoặc luận điểm đối chiếu giữa Code-First và Low-Code/GUI Tools (tính bảo trì, Git workflow, CI/CD).
- **1.1.3. Hệ thống 8 khái niệm cốt lõi:**
  - Tự vẽ sơ đồ khối phân loại 8 khái niệm.
  - Phân tích ngắn gọn bản chất kỹ thuật của từng khái niệm (tối đa 3 - 4 dòng mỗi mục).
- **1.1.4. Ranh giới kỹ thuật & Non-goals:** Liệt kê các giới hạn thiết kế của Playwright.

---

## 5. Tiêu Chí Đánh Giá & Nghiệm Thu (Evaluation Rubric & DoD)

- [ ] **Khả Năng Phản Biện:** Trả lời trôi chảy 4 nhóm câu hỏi cốt lõi khi Leader hoặc Giảng viên chất vấn.
- [ ] **Chất Lượng Học Thuật:**
  - [ ] Tuyệt đối không sao chép nguyên văn bản dịch máy; thuật ngữ kỹ thuật tiếng Anh giữ nguyên inline.
  - [ ] Sơ đồ cây 8 khái niệm được thiết kế mạch lạc, không dùng ảnh chụp mờ từ web.
  - [ ] Có trích dẫn tối thiểu 2 tài liệu tham khảo chính thống chuẩn IEEE.
