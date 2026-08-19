# WBS 4.2A: Slide Presentation Design - Theory and Tooling

## Metadata

- **WBS Code:** `4.2A`
- **Task Name:** Thiết kế Slide Mở đầu, Cơ sở lý thuyết & Tooling (Slide 1 $\to$ 14)
- **Assignee:** Nguyễn Quốc Đương (MSSV: 0306241102)
- **Task Weight:** `3.0%`
- **Deliverable Artifacts:** File slide thuyết trình `67_Slide.pptx` (Slide 1 đến 14) và bản xuất `67_Slide.pdf`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ thiết kế nửa đầu của bộ Slide thuyết trình đồ án môn học (`67_Slide.pptx` từ Slide 1 đến Slide 14).
- **Mục đích:** Trực quan hóa kiến thức nền tảng (Lịch sử, Triết lý Code-First, WebSocket CDP, Auto-waiting, Browser Context) và bộ công cụ SDET (CLI, Codegen, UI Mode, Trace Viewer).
- **Điểm mấu chốt:** Thiết kế chuẩn Widescreen 16:9, áp dụng nguyên lý thiết kế thông tin trực quan (Information Design), loại bỏ hoàn toàn các đoạn văn bản dài.

---

## 1. Mục Tiêu & Cấu Trúc Khung Slide Chi Tiết (Slide 1 $\to$ 14)

```text
SLIDE DECK PHẦN 1: CƠ SỞ LÝ THUYẾT & BỘ CÔNG CỤ (Slide 1 -> 14)
├── 1. MỞ ĐẦU & GIỚI THIỆU (Slide 1 - 3)
│   ├── Slide 1: Trang bìa đề tài (Logo Cao Thắng, Khoa CNTT, Đề tài C, GVHD ThS. Nguyễn Hoàng Việt, Nhóm 67)
│   ├── Slide 2: Danh sách 7 thành viên & Bảng phân công nhiệm vụ (MSSV, Tỷ lệ đóng góp chuẩn SSOT)
│   └── Slide 3: Mục lục thuyết trình (Agenda 5 phần)
├── 2. CƠ SỞ LÝ THUYẾT & KIẾN TRÚC CỐT LÕI (Slide 4 - 10)
│   ├── Slide 4: Tổng quan Playwright & Lịch sử phát triển (Microsoft, Apache 2.0)
│   ├── Slide 5: Triết lý thiết kế Code-First vs Low-Code/Record-Playback
│   ├── Slide 6: Kiến trúc kết nối WebSocket CDP vs HTTP WebDriver (Sơ đồ trực tiếp)
│   ├── Slide 7: Cơ chế Auto-waiting 5 bước (Attached, Visible, Stable, Enabled, Unobscured)
│   ├── Slide 8: Cơ chế Browser Context Isolation & Tối ưu RAM (Incognito in RAM)
│   ├── Slide 9: Chiến lược định vị Role-Based Locators trên Accessibility Tree
│   └── Slide 10: Ranh giới kỹ thuật cứng & Non-goals của Playwright
└── 3. HƯỚNG DẪN CÀI ĐẶT & BỘ CÔNG CỤ SDET (Slide 11 - 14)
    ├── Slide 11: Khởi tạo dự án Bun / TypeScript & Cấu hình playwright.config.ts
    ├── Slide 12: Demo công cụ Playwright CLI & Codegen sinh mã tự động
    ├── Slide 13: Demo công cụ Playwright UI Mode (Watch mode & Time-travel debugging)
    └── Slide 14: Demo công cụ Playwright Trace Viewer (4 luồng dữ liệu khám nghiệm sự cố)
```

---

## 2. Quy Chuẩn Trực Quan Hóa Kỹ Thuật (Visual & Presentation Standards)

1. **Quy tắc thiết kế $6 \times 6$:** Mỗi slide tối đa 6 dòng nội dung, mỗi dòng tối đa 6 từ khóa quan trọng; nhấn mạnh vào sơ đồ và từ khóa kỹ thuật.
2. **Bảng màu chủ đạo (Color Palette):**
   - Nền sáng / Đậm chất học thuật: Nền trắng (`#FFFFFF`) hoặc xám nhạt (`#F8F9FA`).
   - Màu chủ đạo: Xanh Navy (`#0F2027` / `#203A43`).
   - Màu nhấn kỹ thuật: Xanh lục cho trạng thái Pass / Thành công, Đỏ cho Fail / Lỗi.
3. **Typography & Tỷ lệ hiển thị:**
   - Tỷ lệ khung hình chuẩn Widescreen $16:9$.
   - Phông chữ không chân hiện đại (`Arial`, `Segoe UI`, `Roboto`, hoặc `Inter`).
   - Kích thước chữ: Tiêu đề $\ge 32\text{pt}$, Nội dung gạch đầu dòng $\ge 18\text{pt}$.
4. **Sơ đồ kiến trúc & Hình ảnh:**
   - Sử dụng sơ đồ vector hoặc hình ảnh chất lượng Full HD ($1920 \times 1080$), không dùng ảnh chụp mờ hoặc vỡ pixel.

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Chuẩn Thiết Kế Slide & Trực Quan Hóa Thông Tin:**
   - [Microsoft PowerPoint Official Presentation Best Practices](https://support.microsoft.com/en-us/office/tips-for-creating-and-delivering-an-effective-presentation-f43156b0-20d2-4c51-ac34-52560e6e4437)
   - [Edward Tufte - The Visual Display of Quantitative Information](https://www.edwardtufte.com/tufte/books_vdqi)
2. **Tài Liệu Kiến Trúc Playwright:**
   - [Playwright Architectural Overview Documentation](https://playwright.dev/docs/why-playwright)

---

## 4. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Hoàn Tất Slide 1 $\to$ 14:**
  - [ ] Đầy đủ 14 slides theo đúng cấu trúc khung ở Mục 1.
  - [ ] Slide bìa có đầy đủ Logo Trường Cao đẳng Kỹ thuật Cao Thắng và thông tin nhóm 67.
- [ ] **Định Dạng Chuẩn Widescreen 16:9:**
  - [ ] Khung hình chuẩn Widescreen $16:9$, màu sắc đồng bộ, không lỗi chính tả.
- [ ] **Ghép Nối & Bàn Giao:**
  - [ ] Ghép nối với Slide 15 $\to$ 26 (WBS 4.2B) thành file `67_Slide.pptx` và xuất `67_Slide.pdf` hoàn chỉnh nộp cho Trưởng nhóm.
