# WBS 4.2B: Slide Presentation Design - Demo and Synthesis

## Metadata

- **WBS Code:** `4.2B`
- **Task Name:** Thiết kế Slide Thực nghiệm Demo, So sánh & Tổng kết (Slide 15 $\to$ 27)
- **Assignee:** Trần Văn Ngọc (MSSV: 0306241131)
- **Task Weight:** `3.0%`
- **Deliverable Artifacts:** File slide thuyết trình `67_Slide.pptx` (Slide 15 đến 27) và bản xuất `67_Slide.pdf`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ thiết kế nửa sau của bộ Slide thuyết trình đồ án môn học (`67_Slide.pptx` từ Slide 15 đến Slide 27).
- **Mục đích:** Trực quan hóa kết quả thực nghiệm 8 ca kiểm thử (4 API + 4 Web UI), CI/CD Pipeline trên GitHub Actions, ma trận đối soát 3 công cụ và bài học kinh nghiệm SDET.
- **Điểm mấu chốt:** Trực quan hóa kết quả thực thi ($100\%$ Pass), hình ảnh Trace Viewer, Visual Diff và bảng so sánh đa chiều.

---

## 1. Mục Tiêu & Cấu Trúc Khung Slide Chi Tiết (Slide 15 $\to$ 27)

```text
SLIDE DECK PHẦN 2: THỰC NGHIỆM DEMO & TỔNG KẾT (Slide 15 -> 27)
├── 4. THỰC NGHIỆM BỘ KIỂM THỬ TỰ ĐỘNG (DEMO) (Slide 15 - 24)
│   ├── Slide 15: Sơ đồ kiến trúc kiểm thử hai tầng (Dual-Engine Framework: API & UI)
│   ├── Slide 16: API Ca 1 - Auth Lifecycle, JWT & Single-use Token Rotation (WBS 2.1)
│   ├── Slide 17: API Ca 2 - High-Contention Concurrency & Redis Redlock (WBS 2.2)
│   ├── Slide 18: API Ca 3 - Booking Transaction & Idempotency Key (WBS 2.3)
│   ├── Slide 19: API Ca 4 - Chuẩn hóa mã lỗi RFC 9457 & Rate Limiting Throttler (WBS 2.4)
│   ├── Slide 20: Web UI Ca 1 - Luồng mua hàng E2E Checkout POM & COM trên SauceDemo (WBS 3.1)
│   ├── Slide 21: Web UI Ca 2 - Network Mocking page.route() HTTP 500 & Locked-out User (WBS 3.2)
│   ├── Slide 22: Web UI Ca 3 - Chẩn đoán sự cố với Playwright Trace Viewer & performance_glitch_user (WBS 3.3)
│   ├── Slide 23: Web UI Ca 4 - Kiểm thử hồi quy trực quan Visual Regression & Data Masking (WBS 3.4)
│   └── Slide 24: Tích hợp CI/CD Pipeline với GitHub Actions Workflow & Bun (WBS 1.6)
└── 5. ĐỐI SÁNH CÔNG CỤ & TỔNG KẾT ĐỒ ÁN (Slide 25 - 27)
    ├── Slide 25: Ma trận đối soát 7 tiêu chí: Playwright vs TestComplete, Selenium, Cypress (WBS 1.5A & 1.5B)
    ├── Slide 26: Đúc kết bài học kinh nghiệm & Phòng chống Anti-patterns trong SDET
    └── Slide 27: Kết luận mức độ hoàn thành đề tài, Lời cảm ơn & Phiên hỏi đáp (Q&A)
```

---

## 2. Quy Chuẩn Trực Quan Hóa Bằng Chứng Thực Nghiệm

1. **Hiển thị mã nguồn then chốt:** Trích dẫn $5 - 8$ dòng code quan trọng nhất theo theme màu tối (Dark Theme) với syntax highlighting rõ nét (`Promise.all()`, `page.route()`, `toHaveScreenshot()`, `zod`).
2. **Ảnh chụp kết quả thực nghiệm ($100\%$ Pass):**
   - Ảnh chụp terminal chạy pass toàn bộ test suite.
   - Biểu đồ thời gian phản hồi (Timeline Waterfall) và ảnh chụp 4 vùng của Trace Viewer.
   - Bộ 3 ảnh Visual Regression: Actual, Expected và Diff.
3. **Bảng ma trận so sánh công cụ:** Nêu bật ưu thế miễn phí $0$ license, tốc độ micro-giây và khả năng đóng gói Linux Docker của Playwright.

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Chuẩn Thiết Kế Slide & Trực Quan Hóa Dữ Liệu:**
   - [Microsoft PowerPoint Presentation Best Practices](https://support.microsoft.com/en-us/office/tips-for-creating-and-delivering-an-effective-presentation-f43156b0-20d2-4c51-ac34-52560e6e4437)
   - [Edward Tufte - Visual Display of Quantitative Information](https://www.edwardtufte.com/tufte/books_vdqi)

---

## 4. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Hoàn Tất Slide 15 $\to$ 27:**
  - [ ] Đầy đủ 13 slides theo đúng cấu trúc khung ở Mục 1.
  - [ ] Trực quan hóa đầy đủ kết quả 8 ca kiểm thử (4 API + 4 UI) và CI/CD Pipeline.
  - [ ] Bảng ma trận so sánh đầy đủ 7 tiêu chí kỹ thuật.
- [ ] **Hợp Nhất Bộ Slide Toàn Diện:**
  - [ ] Ghép nối với Slide 1 $\to$ 14 (WBS 4.2A) tạo file `67_Slide.pptx` hoàn chỉnh gồm $27$ slides chuẩn Widescreen $16:9$.
