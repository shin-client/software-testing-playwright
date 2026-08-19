# WBS 4.3B: Video Demo Production - Web UI Automation Suite

## Metadata

- **WBS Code:** `4.3B`
- **Task Name:** Sản xuất Video Clip Thuyết minh & Demo Bộ Test Web UI (Thời lượng: 6 - 9 Phút)
- **Assignee:** Lê Minh Quân (MSSV: 0306241143)
- **Task Weight:** `3.5%`
- **Deliverable Artifacts:** File video demo `67_Demo_UI.mp4` (Full HD 1080p), đường link video YouTube trong file `67_Demo.txt`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ sản xuất video clip demo thực tế bộ kiểm thử tự động Web UI Automation Suite trên hệ sinh thái SauceDemo.
- **Mục đích:** Thuyết minh chi tiết 4 ca kiểm thử Web UI (E2E Checkout POM/COM, Network Mocking HTTP 500, Trace Viewer Diagnostics, Visual Regression Testing).
- **Điểm mấu chốt:** Minh chứng tính ổn định của cơ chế Auto-waiting, khả năng can thiệp mạng không cần mock server và công cụ khám nghiệm lỗi Trace Viewer.

---

## 1. Kịch Bản Quay & Lời Thuyết Minh Chi Tiết (Timeline: 6 - 9 Phút)

```text
TIMELINE VIDEO DEMO WEB UI (Thời lượng: 6 - 9 Phút)
├── 00:00 - 01:00 | Phần 1: Giới thiệu cấu trúc Page Object Model (POM) & Component Object Model (COM)
├── 01:00 - 02:45 | Phần 2: UI Ca 1 - Luồng mua hàng E2E Checkout POM & COM trên SauceDemo (Headed/UI Mode)
├── 02:45 - 04:30 | Phần 3: UI Ca 2 - Network Mocking page.route() HTTP 500 & Locked-out User
├── 04:30 - 06:30 | Phần 4: UI Ca 3 - Chẩn đoán sự cố với Playwright Trace Viewer & performance_glitch_user
├── 06:30 - 08:00 | Phần 5: UI Ca 4 - Kiểm thử hồi quy trực quan Visual Regression & Dynamic Data Masking
└── 08:00 - 08:30 | Phần 6: Tổng kết kết quả chạy toàn bộ Web UI Suite trên CI/CD Pipeline
```

- **Phần 1: Cấu trúc POM & COM:** Mở thư mục `pages/` và `pages/components/`, giải thích việc đóng gói Page Objects và User-Facing Locators (`getByRole`).
- **Phần 2: Demo Ca 1 (Checkout POM):** Chạy `bunx playwright test tests/e2e/checkout.spec.ts --project=chromium --headed`, giải thích các bước thêm giỏ hàng và công thức tổng tiền.
- **Phần 3: Demo Ca 2 (Network Mocking):** Chạy `bunx playwright test tests/e2e/network_mocking.spec.ts --project=chromium`, giải thích cách `page.route()` can thiệp tầng mạng để trả về HTTP 500 mà không cần sửa backend.
- **Phần 4: Demo Ca 3 (Trace Viewer):** Chạy `bunx playwright show-trace test-results/trace.zip`, minh họa chi tiết 4 vùng: Filmstrip timeline, DOM snapshots Before/After, Network Waterfall và Action Log.
- **Phần 5: Demo Ca 4 (Visual Regression):** Chạy `bunx playwright test tests/e2e/visual_regression.spec.ts --project=chromium`, minh họa tính năng Dynamic Masking và bộ 3 ảnh Actual/Expected/Diff khi có lỗi CSS.

---

## 2. Quy Chuẩn Kỹ Thuật Video & Âm Thanh

1. **Chất lượng hình ảnh:**
   - Độ phân giải: Full HD ($1920 \times 1080$), tỷ lệ $16:9$, tốc độ khung hình $\ge 30\text{fps}$ (khuyên dùng 60fps).
   - Trình duyệt chạy ở chế độ Headed với kích thước chuẩn Desktop ($1280 \times 720$ hoặc $1920 \times 1080$).
2. **Chất lượng âm thanh & Lời bình:**
   - Giọng đọc rõ ràng, phát âm chuẩn các thuật ngữ kỹ thuật tiếng Anh (*Page Object Model, Component Object Model, Network Mocking, Trace Viewer, Visual Regression, Masking*).
   - Lọc sạch tiếng ồn môi trường.
3. **Hiệu ứng & Hậu kỳ:**
   - Con trỏ chuột có highlight.
   - Zoom-in vào các tương tác Web UI quan trọng và các tab trong Trace Viewer.

---

## 3. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Chuẩn Thu Âm & Screencasting Kỹ Thuật:**
   - [OBS Studio Official Screencasting Guide](https://obsproject.com/wiki/)
   - [YouTube Recommended Upload Encoding Settings](https://support.google.com/youtube/answer/1722171)

---

## 4. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Sản Xuất & Biên Tập Video Hoàn Chỉnh:**
  - [ ] Hoàn thành video thời lượng từ $6 - 9$ phút theo đúng kịch bản tại Mục 1.
  - [ ] Âm thanh thuyết minh rõ ràng, hình ảnh sắc nét Full HD 1080p.
- [ ] **Xuất Bản & Bàn Giao:**
  - [ ] Đăng tải video lên YouTube ở chế độ Không công khai (Unlisted) hoặc Công khai.
  - [ ] Cập nhật link vào file `67_Demo.txt` và nộp file video gốc `67_Demo_UI.mp4` cho Trưởng nhóm.
