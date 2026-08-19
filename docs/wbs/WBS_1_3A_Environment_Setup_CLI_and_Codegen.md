# WBS 1.3A: Environment Setup, CLI Commands, and Playwright Codegen

## Metadata

- **WBS Code:** `1.3A`
- **Task Name:** Nghiên cứu Cài đặt môi trường Bun/TypeScript, CLI Commands & Playwright Codegen
- **Assignee:** Ngô Gia Bảo (MSSV: 0306241090)
- **Task Weight:** `2.5%`
- **Deliverable Artifacts:** Mục 2.1 & 2.2A Chương 2 trong `67_Bao_cao.docx`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ nghiên cứu quy trình thiết lập môi trường phát triển kiểm thử tự động với Bun Runtime, bảng tra cứu Playwright CLI và công cụ sinh mã tự động Codegen.
- **Mục đích:** Cung cấp câu hỏi định hướng và tài liệu chính thống để người phụ trách xây dựng hướng dẫn cài đặt chuẩn xác cho nhóm và viết phần Báo cáo Chương 2.
- **Điểm mấu chốt:** Nắm vững các cờ lệnh dòng lệnh then chốt và cơ chế sinh Role-based Locators tự động từ cây Accessibility Tree của Codegen.

---

## 1. Mục Tiêu & Phạm Vi Nghiên Cứu (Research Scope)

- **Phạm vi trọng tâm:**
  - Quy trình khởi tạo dự án kiểm thử chuẩn với Bun Runtime, TypeScript, và `@playwright/test`.
  - Cài đặt trình duyệt headless (`chromium`, `firefox`, `webkit`) và các thư viện hệ điều hành phụ thuộc Linux (`--with-deps`).
  - Hệ thống các cờ lệnh thực thi Playwright CLI: Chế độ Headed/Headless, giới hạn luồng Workers song song, cơ chế Retries khi lỗi, lọc theo Projects (`api`, `chromium`, `smoke`) hoặc Tags (`-g "@smoke"`).
  - Năng lực của công cụ sinh mã thông minh Playwright Codegen: Tự động ghi lại hành vi người dùng, dịch sang Role-based Locators chuẩn, giả lập thiết bị di động (Mobile Emulation), và tự động lưu phiên xác thực (`--save-storage`).
- **Ranh giới ngoài phạm vi (Non-goals):** Không đi sâu vào cấu hình CI Pipeline phức tạp (đã phân bổ tại WBS 1.6).

---

## 2. Các Câu Hỏi Cốt Lõi Cần Trả Lời (Core Guiding Questions)

Người phụ trách cần nghiên cứu tài liệu chính thống để trả lời các câu hỏi sau:

1. **Về Môi Trường & Runtime:**
   - Tại sao dự án đồ án lựa chọn Bun Runtime thay vì Node.js/npm truyền thống (tốc độ cài đặt package, hỗ trợ native TypeScript không cần cấu hình phức tạp)?
   - Lệnh `bunx playwright install --with-deps chromium` thực hiện những nhiệm vụ gì trên hệ điều hành Linux/Ubuntu?
2. **Về Bảng Tra Cứu Playwright CLI:**
   - Liệt kê và giải thích ý nghĩa của tối thiểu 8 cờ lệnh CLI quan trọng nhất: Chạy toàn bộ test, chạy có giao diện (`--headed`), chỉ định project (`--project=api`), lọc theo tên test (`-g`), điều chỉnh số lượng luồng (`--workers`), cấu hình chạy lại khi fail (`--retries`), và mở báo cáo kết quả (`show-report`).
3. **Về Công Cụ Sinh Mã Thông Minh (Playwright Codegen):**
   - Làm thế nào Codegen phân tích cây Accessibility Tree của trình duyệt để tự động sinh ra các locator bền vững (`getByRole`, `getByPlaceholder`, `getByTestId`) thay vì sinh ra XPath tuyệt đối dễ gãy?
   - Cờ lệnh nào cho phép Codegen giả lập thiết bị di động (như iPhone 14, Pixel 7)?
   - Làm thế nào để sử dụng Codegen ghi nhận luồng đăng nhập và xuất ra file trạng thái phiên `auth.json` (`--save-storage`)?

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

Người phụ trách bắt buộc phải đọc và trích dẫn từ các nguồn chuẩn sau:

1. **Tài Liệu Chính Thống Playwright:**
   - [Playwright Getting Started & Installation Guide](https://playwright.dev/docs/intro)
   - [Playwright Command Line Tools (CLI Reference)](https://playwright.dev/docs/test-cli)
   - [Playwright Codegen (Auto-generating Tests)](https://playwright.dev/docs/codegen)
   - [Playwright Emulation & Mobile Devices](https://playwright.dev/docs/emulation)
2. **Tài Liệu Runtime & Package Manager:**
   - [Bun Official Documentation & Package Management](https://bun.sh/docs)

---

## 4. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo Word (`67_Bao_cao.docx` - Mục 2.1 & 2.2A Chương 2)
- **2.1. Quy trình cài đặt môi trường Bun & TypeScript:** Hướng dẫn từng bước lệnh cài đặt Bun, tải browser binaries và dependencies. Đính kèm 01 ảnh chụp màn hình terminal cài đặt thành công.
- **2.2A. Bảng tổng hợp Playwright CLI & Hướng dẫn Codegen:**
  - Bảng tra cứu các cờ lệnh CLI cốt lõi.
  - Hướng dẫn thực hành sử dụng Codegen kèm 01 ảnh chụp màn hình giao diện Playwright Inspector đang bắt locator.

---

## 5. Tiêu Chí Đánh Giá & Nghiệm Thu (Evaluation Rubric & DoD)

- [ ] **Khả Năng Phản Biện:** Thao tác trực tiếp được các lệnh CLI và trình diễn Codegen khi được yêu cầu demo.
- [ ] **Chất Lượng Học Thuật:**
  - [ ] Toàn bộ lệnh trong báo cáo chuẩn hóa $100\%$ theo cú pháp Bun (`bun`, `bunx`), không bị lẫn lệnh npm/npx cũ.
  - [ ] Ảnh chụp màn hình thực tế, có chú thích hình ảnh rõ ràng.
