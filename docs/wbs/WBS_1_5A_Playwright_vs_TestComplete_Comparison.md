# WBS 1.5A: Playwright vs TestComplete Architectural Comparison

## Metadata

- **WBS Code:** `1.5A`
- **Task Name:** Nghiên cứu Đối sánh Playwright vs TestComplete (Kiến trúc & Chi phí TCO)
- **Assignee:** Ngô Gia Bảo (MSSV: 0306241090)
- **Task Weight:** `2.0%`
- **Deliverable Artifacts:** Mục 4.1 Chương 4 trong `67_Bao_cao.docx` / `67_Bao_cao.tex`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ nghiên cứu đối soát trực diện giữa Playwright (Mã nguồn mở, Microsoft) và TestComplete (Thương mại đóng phí, SmartBear).
- **Mục đích:** Cung cấp câu hỏi định hướng và tài liệu chính thống để người phụ trách xây dựng luận cứ bảo vệ trước hội đồng giảng viên về kiến trúc điều khiển, chi phí bản quyền (TCO) và năng lực tích hợp CI/CD.
- **Điểm mấu chốt:** Nêu bật ưu thế vượt trội của Playwright về tốc độ thực thi, chi phí $0$ license, và khả năng chạy Headless trên Linux Docker Containers.

---

## 1. Mục Tiêu & Phạm Vi Nghiên Cứu (Research Scope)

- **Phạm vi trọng tâm:**
  - So sánh đối kháng giữa 2 trường phái: Công cụ mã nguồn mở thế hệ mới (Playwright) và Công cụ thương mại trả phí truyền thống (TestComplete).
  - Phân tích 7 tiêu chí so sánh cốt lõi:
    1. Kiến trúc điều khiển: WebSocket CDP/Pipe trực tiếp vào Browser Engine vs OS Native Hooks / Windows COM.
    2. Tốc độ thực thi & Tối ưu RAM: Cơ chế BrowserContext siêu nhẹ vs Tiến trình desktop nặng nề.
    3. Chi phí bản quyền tổng sở hữu (TCO): Miễn phí $100\%$ Apache 2.0 vs Bản quyền thương mại (~$2,000 - $4,000 / seat / năm).
    4. Hạ tầng CI/CD & Containerization: Khả năng đóng gói Linux Docker siêu nhẹ vs Ràng buộc máy ảo Windows đầy đủ (GUI Desktop).
    5. Kiểm thử đa tầng: Hợp nhất Web UI + API trong 1 codebase vs Cần mua thêm module hoặc công cụ ngoài (ReadyAPI).
    6. Cơ chế chống Flaky: Auto-waiting 5 bước tích hợp sẵn vs Cấu hình timeout thủ công.
    7. Phương thức tiếp cận: Code-First hiện đại (TypeScript) vs Low-Code / Record-Playback / VBScript cũ.
  - Xây dựng 3 luận điểm đanh thép nhất để bảo vệ lựa chọn Playwright trước hội đồng giảng viên.
- **Ranh giới ngoài phạm vi (Non-goals):** Không đi sâu vào so sánh với Selenium/Cypress (đã phân bổ tại WBS 1.5B).

---

## 2. Các Câu Hỏi Cốt Lõi Cần Trả Lời (Core Guiding Questions)

Người phụ trách cần nghiên cứu tài liệu chính thống để trả lời các câu hỏi sau:

1. **Về Kiến Trúc Điều Khiển & Hạ Tầng HĐH:**
   - TestComplete can thiệp vào ứng dụng ở cấp độ nào (OS Native Hooks, Accessibility APIs, Windows COM)? Tại sao kiến trúc này khiến TestComplete bị ràng buộc chặt chẽ vào hệ điều hành Windows và không thể chạy trên các container Linux Docker siêu nhẹ?
   - Playwright kết nối trực tiếp vào lõi trình duyệt qua WebSocket CDP mang lại lợi thế gì về tính độc lập nền tảng (Platform Agnostic)?
2. **Về Chi Phí Bản Quyền (Total Cost of Ownership - TCO):**
   - Mức giá bản quyền của TestComplete hiện tại là bao nhiêu trên mỗi người dùng mỗi năm?
   - Đối với một doanh nghiệp có quy mô 15 - 20 kỹ sư kiểm thử và hạ tầng CI/CD chạy 10 máy ảo song song, bài toán chi phí tài chính chênh lệch giữa TestComplete và Playwright ($0 license) là bao nhiêu?
3. **Về Kiểm Thử Đa Tầng & Tính Đồng Nhất Codebase:**
   - Khi cần xây dựng một kịch bản E2E kết hợp (Gọi API tạo dữ liệu $\to$ Mở Web UI kiểm tra $\to$ Gọi API dọn dẹp dữ liệu), Playwright giải quyết như thế nào trong cùng 1 file test? TestComplete đòi hỏi quy trình phức tạp ra sao?
4. **Về 3 Luận Điểm Bảo Vệ Trước Hội Đồng Giảng Viên:**
   - Trình bày 3 luận điểm thuyết phục nhất để trả lời câu hỏi: *"Tại sao nhóm không chọn một công cụ thương mại có sẵn giao diện đồ họa hoàn chỉnh như TestComplete mà lại chọn Playwright?"*

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

Người phụ trách bắt buộc phải đọc và trích dẫn từ các nguồn chuẩn sau:

1. **Tài Liệu Chính Thống SmartBear TestComplete:**
   - [SmartBear TestComplete Documentation (Official)](https://support.smartbear.com/testcomplete/docs/)
   - [SmartBear Licensing & Architecture Overview](https://support.smartbear.com/testexecute/docs/reference/tc-doc.html)
   - [SmartBear Official Product Pricing](https://smartbear.com/pricing/)
2. **Tài Liệu Chính Thống Microsoft Playwright:**
   - [Playwright Docker & CI/CD Containerization Guide](https://playwright.dev/docs/docker)
   - [Why Playwright? Architectural Philosophy](https://playwright.dev/docs/why-playwright)

---

## 4. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo (`67_Bao_cao.docx` / `67_Bao_cao.tex` - Mục 4.1 Chương 4)
- **4.1.1. Ma trận đối soát 7 tiêu chí kiến trúc & kinh tế:** Xây dựng bảng so sánh chi tiết giữa Playwright và TestComplete.
- **4.1.2. Phân tích chi phí bản quyền tổng sở hữu (TCO):** Phân tích bài toán chi phí tài chính giữa Playwright ($0 license) và TestComplete (~$2,000 - $4,000 / seat / năm).
- **4.1.3. Khả năng đóng gói container Linux Docker & tích hợp CI/CD:** Phân tích ưu thế containerization siêu nhẹ của Playwright so với ràng buộc GUI Desktop Windows của TestComplete.
- **4.1.4. 3 Luận điểm bảo vệ lựa chọn Playwright trước hội đồng:** Trình bày 3 luận điểm cốt lõi bảo vệ trước hội đồng giảng viên.

---

## 5. Tiêu Chí Đánh Giá & Nghiệm Thu (Evaluation Rubric & DoD)

- [ ] **Khả Năng Phản Biện:** Trình bày tự tin, mạch lạc 3 luận điểm bảo vệ trước câu hỏi chất vấn của Giảng viên.
- [ ] **Chất Lượng Học Thuật:**
  - [ ] Bảng so sánh có số liệu giá tiền, thông số kỹ thuật rõ ràng.
  - [ ] Dẫn nguồn đúng tài liệu SmartBear và Microsoft theo chuẩn IEEE.
