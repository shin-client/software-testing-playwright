# WBS 3.4: Web UI Test Suite - Visual Regression and Data Masking

## Metadata

- **WBS Code:** `3.4`
- **Task Name:** Web UI Ca 4: Kiểm Thử Hồi Quy Trực Quan Visual Regression & Data Masking
- **Assignee:** Lê Minh Tài (MSSV: 0306241145)
- **Task Weight:** `6.0%`
- **Deliverable Artifacts:** File mã nguồn `tests/e2e/visual_regression.spec.ts`, thư mục ảnh mẫu `tests/e2e/__snapshots__/`, Pull Request GitHub, Mục 3.3.4 Chương 3 trong `67_Bao_cao.docx` / `67_Bao_cao.tex`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ hiện thực ca kiểm thử tự động giao diện Web UI Ca 4: Kiểm thử hồi quy trực quan (Visual Regression Testing / Pixel-by-Pixel Comparison) kết hợp kỹ thuật che giấu dữ liệu động (**Dynamic Data Masking**) trên SauceDemo.
- **Mục đích:** Phát hiện các lỗi vỡ giao diện âm thầm (CSS Regression, Font Misalignment, Sai lệch màu sắc/khoảng cách) mà các câu lệnh assertion DOM thông thường không thể bắt được.
- **Điểm mấu chốt:** Sử dụng `expect(page).toHaveScreenshot({ mask: [...] })` để che đi các vùng dữ liệu biến đổi (hình ảnh sản phẩm, copyright text), triệt tiêu $100\%$ lỗi Flaky do lệch ảnh không mong muốn, đồng thời trích xuất được bộ 3 ảnh chẩn đoán: `actual.png`, `expected.png`, và `diff.png`.

---

## 1. Mục Tiêu & Bối Cảnh Nghiệp Vụ (Business & Technical Context)

- **Bối cảnh kỹ thuật:**
  - Một bài test chức năng có thể pass $100\%$ (do các thẻ HTML `<button>`, `<input>` vẫn tồn tại đầy đủ trong DOM), nhưng giao diện người dùng thực tế có thể đã bị vỡ hoàn toàn do lỗi CSS: Nút bấm bị tràn màn hình, chữ bị đè lên nhau, hoặc icon bị mất màu.
  - **Visual Regression Testing** trong Playwright giải quyết bài toán này bằng cách: Chụp ảnh màn hình thực tế của trang web và so sánh từng điểm ảnh (**Pixelmatch Engine**) với một bức ảnh chuẩn mẫu (**Golden Baseline Screenshot**). Nếu tỷ lệ sai khác vượt ngưỡng cho phép (`maxDiffPixelRatio` hoặc `maxDiffPixels`), bài test sẽ báo fail và xuất ra ảnh Visual Diff (vùng sai lệch được tô màu đỏ nổi bật).
  - **Kỹ thuật Dynamic Data Masking:**
    - Các trang web thực tế luôn có các phần tử dữ liệu động (Dynamic Elements) hoặc hình ảnh dễ biến động giữa các lần cập nhật.
    - Nếu không che chắn, bài test so sánh ảnh sẽ liên tục bị báo lỗi giả (False Positive).
    - Playwright cung cấp tùy chọn `mask: [locator1, locator2]` cho phép phủ một lớp màu hồng/xám trung tính đè lên các phần tử này trước khi thực hiện chụp ảnh so sánh pixel.

---

## 2. Các Yêu Cầu Thiết Kế Ca Kiểm Thử (Test Design Specifications)

Người phụ trách cần thiết kế và hiện thực 3 kịch bản kiểm thử trong `tests/e2e/visual_regression.spec.ts`:

### `TC-UI-VIS-01: Baseline Snapshot Generation & Page Comparison`
- **Mục tiêu:** Khởi tạo ảnh mẫu chuẩn (Golden Master) và kiểm thử so sánh toàn bộ trang sản phẩm `/inventory.html`.
- **Thao tác thực hiện:**
  1. Đăng nhập vào SauceDemo bằng `standard_user`.
  2. Thực hiện assertion: `await expect(page).toHaveScreenshot('inventory-baseline.png', { fullPage: true, maxDiffPixelRatio: 0.02 });`.
- **Kỳ vọng:**
  - Lần chạy đầu tiên (với cờ `--update-snapshots`): Sinh ra tệp ảnh mẫu chuẩn `tests/e2e/__snapshots__/inventory-baseline-chromium-linux.png`.
  - Các lần chạy tiếp theo: So sánh đạt độ khớp $100\%$ (Zero Pixel Diff) và pass bài test.

---

### `TC-UI-VIS-02: Dynamic Data Masking on Variable Elements`
- **Mục tiêu:** Kiểm tra kỹ thuật che giấu các phần tử có nội dung biến đổi hoặc hình ảnh sản phẩm.
- **Thao tác thực hiện:**
  1. Đăng nhập vào trang `/inventory.html`.
  2. Áp dụng kỹ thuật Masking:
     ```typescript
     await expect(page).toHaveScreenshot('inventory-masked.png', {
       mask: [
         page.locator('.inventory_item_img'),
         page.locator('.footer_copy'),
       ],
       maxDiffPixelRatio: 0.01,
     });
     ```
- **Kỳ vọng:** Các vùng hình ảnh sản phẩm và dòng chữ chân trang được phủ kín lớp mask bảo vệ, đảm bảo bài test ổn định tuyệt đối dù ảnh sản phẩm có bị thay đổi.

---

### `TC-UI-VIS-03: Visual Regression Mutation Failure & 3-Image Diff Generation`
- **Mục tiêu:** Cố tình tiêm lỗi CSS để kiểm chứng khả năng phát hiện sai lệch và trích xuất bộ 3 ảnh chẩn đoán.
- **Thao tác thực hiện:**
  1. Đăng nhập vào trang sản phẩm.
  2. Tiêm mã JavaScript/CSS làm đổi màu nền của nút bấm:
     ```typescript
     await page.evaluate(() => {
       const btn = document.querySelector('.btn_inventory') as HTMLElement;
       if (btn) btn.style.backgroundColor = 'rgb(255, 0, 0)'; // Đổi sang màu đỏ
     });
     ```
  3. Thực hiện so sánh với ảnh chuẩn: `await expect(page).toHaveScreenshot('inventory-baseline.png');`.
- **Kỳ vọng:**
  - Assertion phát hiện sai lệch pixel và ném lỗi thất bại.
  - Playwright tự động lưu lại **bộ 3 tệp ảnh chẩn đoán** trong thư mục `test-results/`:
    1. `actual.png`: Ảnh chụp thực tế chứa nút bấm màu đỏ.
    2. `expected.png`: Ảnh mẫu chuẩn ban đầu.
    3. `diff.png`: Ảnh chẩn đoán với các pixel sai khác được tô màu đỏ phát quang.

---

## 3. Câu Hỏi Cốt Lõi Cần Trả Lời & Kịch Bản Thất Bại (Failure Modes)

1. **Thuật toán Pixelmatch trong Playwright tính toán khoảng cách màu sắc (Color Delta E) và tỷ lệ sai lệch điểm ảnh (`maxDiffPixelRatio`) như thế nào?**
2. **Tại sao việc chạy Visual Regression trên các hệ điều hành khác nhau (macOS vs Linux vs Windows) có thể bị lệch điểm ảnh do cơ chế khử răng cưa font chữ (Font Anti-aliasing)?**
3. **Làm thế nào để giải quyết triệt để sự khác biệt font chữ giữa các hệ điều hành khi chạy Visual Test trên CI?** (Giải pháp đóng gói quy trình test vào môi trường Docker Container đồng nhất).

---

## 4. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Tài Liệu Playwright Visual Testing:**
   - [Playwright Official Guide - Visual Comparisons & Snapshots](https://playwright.dev/docs/test-snapshots)
   - [Playwright API Reference - LocatorAssertions.toHaveScreenshot()](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot)
2. **Thư Viện So Sánh Điểm Ảnh:**
   - [Mapbox Pixelmatch - Fast Pixel-level Image Comparison Engine](https://github.com/mapbox/pixelmatch)

---

## 5. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo (`67_Bao_cao.docx` / `67_Bao_cao.tex` - Mục 3.3.4 Chương 3)
Người phụ trách soạn thảo theo khung 5 phần học thuật:
1. **Mục tiêu & Cơ chế kỹ thuật:** Phân tích nguyên lý Pixel-by-Pixel comparison của Pixelmatch, cơ chế tính sai số màu và giải pháp Dynamic Data Masking.
2. **Đặc tả kịch bản & Dữ liệu kiểm thử:** Bảng các kịch bản kiểm thử Visual (Full Page Baseline, Dynamic Masking, CSS Mutation Failure).
3. **Trích đoạn mã nguồn then chốt:** Trích dẫn 15 - 25 dòng code cấu hình `toHaveScreenshot({ mask: [...], maxDiffPixelRatio })` và đoạn code tiêm CSS đột biến.
4. **Bằng chứng thực nghiệm & Phân tích log:** Ảnh chụp terminal chạy pass $100\%$, hình ảnh minh họa **bộ 3 ảnh chẩn đoán** (Actual, Expected, và Visual Diff).
5. **Đánh giá rủi ro & Bài học kỹ thuật:** Phân tích hiện tượng lệch ảnh do môi trường OS (Font Rendering) và chiến lược chuẩn hóa môi trường bằng Docker Container.

---

## 6. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Mã Nguồn Kiểm Thử & Chạy Pass ($100\%$):**
  - [ ] Tạo file `tests/e2e/visual_regression.spec.ts` với đầy đủ 3 ca test (`TC-UI-VIS-01` $\to$ `TC-UI-VIS-03`).
  - [ ] Chạy lệnh `bunx playwright test tests/e2e/visual_regression.spec.ts --project=chromium --update-snapshots` để tạo baseline chuẩn.
  - [ ] Chạy kiểm thử xác nhận pass $100\%$ với độ sai lệch trong ngưỡng cho phép ($< 1\%$).
- [ ] **Bằng Chứng Git & Pull Request:**
  - [ ] Tạo nhánh `feat/wbs-3.4-ui-visual-regression`.
  - [ ] Tạo Pull Request trên GitHub đính kèm ảnh baseline và bộ 3 ảnh Actual/Expected/Diff.
- [ ] **Chất Lượng Học Thuật Trong Báo Cáo:**
  - [ ] Hoàn thành đầy đủ 5 phần cho Mục 3.3.4 trong Báo cáo đồ án.
