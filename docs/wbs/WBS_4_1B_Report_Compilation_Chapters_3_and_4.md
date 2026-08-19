# WBS 4.1B: Report Compilation - Chapters 3 and 4

## Metadata

- **WBS Code:** `4.1B`
- **Task Name:** Biên soạn & Format Báo cáo môn học Chương 3 & 4 (`67_Bao_cao.docx` / `67_Bao_cao.tex`)
- **Assignee:** Nguyễn Hoài Linh (MSSV: 0306241126)
- **Task Weight:** `3.5%`
- **Deliverable Artifacts:** File tài liệu Word `67_Bao_cao.docx` / LaTeX `67_Bao_cao.tex` (Phần Chương 3, Chương 4, Phần Kết Luận, Danh Mục Tài Liệu Tham Khảo chuẩn IEEE và Phụ Lục).

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ tổng hợp, biên tập và chuẩn hóa định dạng học thuật cho nửa sau của Báo cáo đồ án môn học (`67_Bao_cao.docx` / `67_Bao_cao.tex`).
- **Mục đích:** Tiếp nhận bản thảo thực nghiệm 8 ca kiểm thử (4 API + 4 Web UI) từ WBS $2.1 \to 2.4$ và $3.1 \to 3.4$, phân tích so sánh đối soát từ WBS $1.5\text{A}$ và $1.5\text{B}$.
- **Điểm mấu chốt:** Chuẩn hóa cấu trúc 5 phần cho từng ca test thực nghiệm, đính kèm ảnh terminal test pass $100\%$, trích đoạn code then chốt và tài liệu tham khảo chuẩn IEEE.

---

## 1. Mục Tiêu & Phạm Vi Biên Soạn (Scope & Inputs)

- **Chương 3: Thực Nghiệm Xây Dựng Bộ Kiểm Thử Tự Động Dual-Engine:**
  - Mục 3.1: Kiến Trúc Bộ Kiểm Thử Tự Động 2 Tầng (Kiểm thử Hộp đen / Hộp xám tích hợp).
  - Mục 3.2: Bộ Kiểm Thử Tự Động Tầng API (Ticket Booking System):
    - Mục 3.2.1: API Ca 1 - Auth Lifecycle, JWT & Single-use Token Rotation (WBS 2.1).
    - Mục 3.2.2: API Ca 2 - High-Contention Concurrency & Redis Redlock (WBS 2.2).
    - Mục 3.2.3: API Ca 3 - Booking Transaction & Idempotency Key (WBS 2.3).
    - Mục 3.2.4: API Ca 4 - Chuẩn Hóa Lỗi RFC 9457 & Rate Limiting Throttler (WBS 2.4).
  - Mục 3.3: Bộ Kiểm Thử Tự Động Tầng Web UI (SauceDemo E-Commerce):
    - Mục 3.3.1: Web UI Ca 1 - Luồng Mua Hàng E2E Checkout POM & COM (WBS 3.1).
    - Mục 3.3.2: Web UI Ca 2 - Network Mocking `page.route()` HTTP 500 & Locked-out User (WBS 3.2).
    - Mục 3.3.3: Web UI Ca 3 - Chẩn Đoán Hậu Kỳ với Trace Viewer & Performance Glitch User (WBS 3.3).
    - Mục 3.3.4: Web UI Ca 4 - Kiểm Thử Hồi Quy Trực Quan Visual Regression & Data Masking (WBS 3.4).
- **Chương 4: Đánh Giá Đối Sánh Công Cụ & Tổng Kết Đồ Án:**
  - Mục 4.1: So sánh đối kháng trực diện Playwright vs TestComplete (WBS 1.5A).
  - Mục 4.2: So sánh kỹ thuật Playwright vs Selenium 4 & Cypress (WBS 1.5B).
  - Mục 4.3: Đúc kết bài học kinh nghiệm và phòng chống Anti-patterns trong SDET.
  - Mục 4.4: Kết luận mức độ hoàn thành và hướng phát triển đề tài.
- **Phần Kết Luận, Tài Liệu Tham Khảo & Phụ Lục:**
  - Đánh giá định lượng kết quả đạt được ($100\%$ pass, 0 flaky).
  - Danh mục tài liệu tham khảo chuẩn IEEE (sắp xếp theo thứ tự trích dẫn $[1], [2], \dots$).
  - Phụ lục: Danh sách file mã nguồn, cấu hình CI/CD và link repository GitHub.

---

## 2. Quy Chuẩn Định Dạng Khung 5 Phần Học Thuật Cho Từng Ca Test

Người phụ trách bắt buộc phải biên tập từng ca kiểm thử trong Chương 3 theo cấu trúc 5 phần chuẩn:
1. **Mục tiêu & Cơ chế kỹ thuật:** Giải thích bản chất vấn đề và lý do thiết kế bài test.
2. **Đặc tả kịch bản & Dữ liệu kiểm thử:** Bảng thông số test data, endpoints, payloads, assertions.
3. **Trích đoạn mã nguồn then chốt:** Trích dẫn 15 - 25 dòng code quan trọng nhất (phông `Consolas` `10pt`, nền xám).
4. **Bằng chứng thực nghiệm & Phân tích log:** Ảnh chụp terminal pass $100\%$, log JSON, ảnh Trace Viewer / Visual Diff.
5. **Đánh giá rủi ro & Bài học kỹ thuật:** Phân tích hậu quả nếu xảy ra lỗi và giải pháp phòng vệ.

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Chuẩn Định Dạng Học Thuật & Trích Dẫn:**
   - [IEEE Reference Guide - Official Citation Standard](https://ieeeauthorcenter.ieee.org/wp-content/uploads/IEEE-Reference-Guide-2023.pdf)
   - [Microsoft Word Typography & Styles Official Guide](https://support.microsoft.com/en-us/office/format-text-in-word-37651a56-829b-4be5-a4f6-7b83fecf02f9)
   - [Overleaf LaTeX Academic Documentation Guide](https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes)

---

## 4. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Hợp Nhất Đầy Đủ $100\%$ Nội Dung Chương 3 & 4:**
  - [ ] Thu thập đầy đủ 8 bản thảo ca test từ WBS 2.1-2.4 và 3.1-3.4, 2 bản thảo so sánh từ WBS 1.5A, 1.5B.
  - [ ] Đầy đủ bằng chứng ảnh test pass $100\%$ và code snippet định dạng chuẩn.
- [ ] **Chuẩn Hóa Danh Mục Tài Liệu Tham Khảo IEEE:**
  - [ ] Danh mục tài liệu tham khảo có đầy đủ tác giả, tên tài liệu, tổ chức (IETF, Microsoft, SmartBear, Cypress, Selenium), năm và URL chính thống.
- [ ] **Hợp Nhất File Hoàn Chỉnh:**
  - [ ] Hợp nhất với Chương 1 & 2 (WBS 4.1A) tạo file `67_Bao_cao.docx` / `67_Bao_cao.tex` hoàn chỉnh nộp cho Trưởng nhóm nghiệm thu.
