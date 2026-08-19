# WBS 4.1A: Report Compilation - Chapters 1 and 2

## Metadata

- **WBS Code:** `4.1A`
- **Task Name:** Biên soạn & Format Báo cáo môn học Chương 1 & 2 (`67_Bao_cao.docx` / `67_Bao_cao.tex`)
- **Assignee:** Đặng Duy Lam (MSSV: 0306241125)
- **Task Weight:** `3.5%`
- **Deliverable Artifacts:** File tài liệu Word `67_Bao_cao.docx` / LaTeX `67_Bao_cao.tex` (Phần Trang Bìa, Nhận xét GVHD, Lời cảm ơn, Mục Lục, Danh mục Bảng/Hình, Chương 1 và Chương 2).

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ tổng hợp, biên tập và chuẩn hóa định dạng học thuật cho nửa đầu của Báo cáo đồ án môn học (`67_Bao_cao.docx` / `67_Bao_cao.tex`).
- **Mục đích:** Tiếp nhận bản thảo nghiên cứu lý thuyết từ WBS $1.1\text{A} \to 1.4\text{B}$, chuẩn hóa văn phong kỹ thuật, căn lề A4, mục lục tự động và đánh số bảng biểu theo chuẩn IEEE.
- **Điểm mấu chốt:** Đảm bảo tính nhất quán cấu trúc, không có lỗi chính tả, sơ đồ sắc nét trước khi ghép nối với Chương 3 & 4.

---

## 1. Mục Tiêu & Phạm Vi Biên Soạn (Scope & Inputs)

- **Các phần đầu báo cáo (Front Matter):**
  - Trang Bìa chính thức (Logo Trường Cao đẳng Kỹ thuật Cao Thắng, Khoa CNTT, Đề tài C, GVHD ThS. Nguyễn Hoàng Việt, Nhóm 67).
  - Trang Nhận xét của Giảng viên hướng dẫn.
  - Lời cảm ơn và Bảng phân công nhiệm vụ, tỷ lệ đóng góp của 7 thành viên theo chuẩn SSOT.
  - Mục lục tự động, Danh mục từ viết tắt, Danh mục hình ảnh và Danh mục bảng biểu.
- **Chương 1: Tổng Quan Về Playwright & Cơ Sở Kiến Trúc (WBS 1.1A $\to$ 1.2B):**
  - Mục 1.1: Tổng quan Playwright, Lịch sử phát triển & Triết lý Code-First (WBS 1.1A).
  - Mục 1.2: Kiến trúc kết nối WebSocket CDP vs HTTP WebDriver (WBS 1.1B).
  - Mục 1.3: Cơ chế Auto-waiting 5 bước & Actionability Checks (WBS 1.2A).
  - Mục 1.4: Cơ chế Browser Context Isolation & Tối ưu hóa bộ nhớ RAM (WBS 1.2B).
- **Chương 2: Hướng Dẫn Cài Đặt & Năng Lực Cốt Lõi Của Playwright (WBS 1.3A $\to$ 1.4B, 1.6):**
  - Mục 2.1: Quy trình cài đặt môi trường Bun, TypeScript & Playwright Config (WBS 1.3A & 1.6).
  - Mục 2.2: Hướng dẫn sử dụng CLI, Codegen, UI Mode & Trace Viewer (WBS 1.3A & 1.3B).
  - Mục 2.3: Phân tích Năng lực Web UI (POM, COM, Role Locators, Network Mocking) (WBS 1.4A).
  - Mục 2.4: Phân tích Năng lực API (`APIRequestContext`, Hybrid Auth, SOM, RFC 9457) (WBS 1.4B).

---

## 2. Quy Chuẩn Kỹ Thuật & Định Dạng Học Thuật (Formatting Standards)

1. **Khổ giấy & Căn lề chuẩn A4:**
   - Kích thước: A4 ($210\text{mm} \times 297\text{mm}$).
   - Lề: Top $2.0\text{cm}$, Bottom $2.0\text{cm}$, Left $3.0\text{cm}$ (lề đóng gáy), Right $2.0\text{cm}$.
2. **Kiểu chữ & Giãn dòng:**
   - Phông chữ: `Times New Roman`, cỡ chữ `13pt`, Regular, Justified (căn đều hai bên).
   - Giãn dòng: `1.5 lines`, khoảng cách đoạn: `Before 3pt`, `After 3pt`.
3. **Phân cấp tiêu đề (Headings):**
   - `Heading 1` (Tên chương): `16pt`, In hoa, Đậm, Canh giữa.
   - `Heading 2` (Mục cấp 1): `14pt`, Đậm, Canh trái.
   - `Heading 3` (Mục cấp 2): `13pt`, Đậm nghiêng, Canh trái.
4. **Quy chuẩn Hình ảnh, Bảng biểu & Sơ đồ:**
   - Hình ảnh / Sơ đồ: Canh giữa, có chú thích bên dưới dạng `Hình X.Y: Tên hình ảnh`.
   - Bảng biểu: Canh giữa, có tiêu đề bên trên dạng `Bảng X.Y: Tên bảng biểu`.
   - Khối mã nguồn: Phông `Consolas` `10pt`, khung viền xám nhạt, nền `#F4F4F4`, giãn dòng đơn.

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Chuẩn Định Dạng Học Thuật & Trích Dẫn:**
   - [IEEE Reference Guide - Official Citation Standard](https://ieeeauthorcenter.ieee.org/wp-content/uploads/IEEE-Reference-Guide-2023.pdf)
   - [Microsoft Word Typography & Styles Official Guide](https://support.microsoft.com/en-us/office/format-text-in-word-37651a56-829b-4be5-a4f6-7b83fecf02f9)
   - [Overleaf LaTeX Academic Documentation Guide](https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes)

---

## 4. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Hợp Nhất Đầy Đủ $100\%$ Nội Dung Chương 1 & 2:**
  - [ ] Thu thập đầy đủ bản thảo nghiên cứu từ các thành viên phụ trách WBS 1.1A, 1.1B, 1.2A, 1.2B, 1.3A, 1.3B, 1.4A, 1.4B.
  - [ ] Không bỏ sót các sơ đồ kỹ thuật, công thức toán học và bảng đối soát quan trọng.
- [ ] **Chuẩn Hóa Format Học Thuật:**
  - [ ] Căn lề, phông chữ, giãn dòng tuân thủ nghiêm ngặt quy định tại Mục 2.
  - [ ] Cập nhật Mục lục tự động, Danh mục hình và Danh mục bảng chính xác số trang.
- [ ] **Kiểm Tra Tính Nhất Quán & Bàn Giao:**
  - [ ] Ghép nối với bản thảo Chương 3 & 4 (WBS 4.1B) để tạo thành file `67_Bao_cao.docx` / `67_Bao_cao.tex` hoàn chỉnh.
