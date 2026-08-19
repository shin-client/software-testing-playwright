# WBS 3.3: Web UI Test Suite - Post-Mortem Diagnostics with Trace Viewer

## Metadata

- **WBS Code:** `3.3`
- **Task Name:** Web UI Ca 3: Chẩn Đoán Hậu Kỳ với Playwright Trace Viewer & Performance Glitch User
- **Assignee:** Lê Minh Tài (MSSV: 0306241145)
- **Task Weight:** `6.0%`
- **Deliverable Artifacts:** File mã nguồn `tests/e2e/diagnostics_trace.spec.ts`, file nén trace `test-results/trace.zip`, Pull Request GitHub, Mục 3.3.3 Chương 3 trong `67_Bao_cao.docx` / `67_Bao_cao.tex`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ hiện thực ca kiểm thử tự động giao diện Web UI Ca 3: Cơ chế ghi vết và chẩn đoán lỗi hậu kỳ (Post-Mortem Diagnostics) thông qua **Playwright Trace Viewer**, kết hợp kiểm thử tài khoản bị nghẽn hiệu năng (`performance_glitch_user`) trên SauceDemo.
- **Mục đích:** Xóa bỏ hoàn toàn tình trạng "Test fail trên CI nhưng chạy local thì pass", cung cấp bằng chứng chẩn đoán chi tiết gồm 4 vùng quan sát: Filmstrip Timeline, DOM Snapshots (Before/After action), Network Waterfall, và Action Log.
- **Điểm mấu chốt:** Khai thác cấu hình `trace: 'on-first-retry'` để tối ưu dung lượng lưu trữ trên CI/CD (chỉ lưu trace khi test gặp sự cố và phải retry lại), đồng thời biết cách trích xuất file `trace.zip` và mở bằng lệnh `bunx playwright show-trace`.

---

## 1. Mục Tiêu & Bối Cảnh Nghiệp Vụ (Business & Technical Context)

- **Bối cảnh kỹ thuật:**
  - Trong quy trình kiểm thử tự động hóa trên hạ tầng CI/CD, các lỗi Flaky (lúc pass lúc fail) hoặc lỗi trễ mạng (Network Latency) rất khó tái hiện lại trên máy cá nhân của lập trình viên.
  - Video quay màn hình thông thường chỉ là các điểm ảnh (Pixels) thụ động, không thể inspect DOM, không xem được HTTP request/response payloads, và không xem được console logs tại micro-giây xảy ra lỗi.
  - **Playwright Trace Viewer** là công cụ chẩn đoán hậu kỳ độc quyền: Ghi lại toàn bộ hành trình thực thi của bài test dưới dạng một gói nén ZIP gồm **4 vùng phân tích cốt lõi**:
    1. **Filmstrip Timeline:** Ảnh chụp màn hình tuần tự từng mili-giây giúp quan sát quá trình render giao diện.
    2. **DOM Snapshots (Before / Action / After):** Bản sao cây DOM thực tế tại từng bước (cho phép bật DevTools Inspect element trực tiếp trên bản ghi quá khứ).
    3. **Network Waterfall:** Toàn bộ requests/responses HTTP, mã trạng thái, headers, timing và payload diễn ra trong phiên test.
    4. **Action Log & Source Inspector:** Vị trí dòng lệnh mã nguồn TypeScript đang chạy, thời gian thực thi, và chi tiết từng bước kiểm tra tính sẵn sàng (Actionability Checks: Attached, Visible, Stable, Enabled).
  - Trên SauceDemo, tài khoản `performance_glitch_user` mô phỏng độ trễ tải trang nghiêm trọng ($> 5000\text{ms}$), là đối tượng hoàn hảo để phân tích Timeline và Network Waterfall trong Trace Viewer.

---

## 2. Các Yêu Cầu Thiết Kế Ca Kiểm Thử (Test Design Specifications)

Người phụ trách cần thiết kế và hiện thực 3 kịch bản kiểm thử trong `tests/e2e/diagnostics_trace.spec.ts`:

### `TC-UI-TRACE-01: Performance Glitch Latency Triage & Trace Generation`
- **Mục tiêu:** Kiểm tra khả năng tự động chờ (Auto-waiting) khi tải trang bị nghẽn hiệu năng ($> 5000\text{ms}$) và sinh tệp trace chẩn đoán.
- **Thao tác thực hiện:**
  1. Đăng nhập vào SauceDemo bằng tài khoản `performance_glitch_user` và mật khẩu `secret_sauce`.
  2. Chọn thêm 1 sản phẩm vào giỏ hàng và mở giỏ hàng `/cart.html`.
- **Kỳ vọng & Invariants:**
  - Bài test vượt qua thành công $100\%$ mà không cần bất kỳ lệnh `page.waitForTimeout()` cứng nào, nhờ cơ chế Auto-waiting thông minh của Playwright.
  - Sinh ra tệp dữ liệu `test-results/trace.zip` ghi nhận đầy đủ timeline độ trễ $5000\text{ms}$.

---

### `TC-UI-TRACE-02: Intentional Assertion Failure for Post-Mortem Diagnostics`
- **Mục tiêu:** Mô phỏng một bài test bị thất bại để kiểm chứng cơ chế chụp vết lỗi tự động của Trace Viewer.
- **Thao tác thực hiện:**
  1. Thực hiện đăng nhập và đi tới trang thanh toán.
  2. Thiết kế một assertion cố tình kiểm tra sai lệch (ví dụ: `expect(page.locator('.title')).toHaveText('Wrong Title')`).
- **Kỳ vọng:**
  - Playwright báo lỗi tại bước assertion và tự động đóng gói toàn bộ trạng thái phiên test vào file `trace.zip`.
  - Khi mở tệp trace bằng lệnh `bunx playwright show-trace <path-to-trace.zip>`, người kiểm thử có thể:
    - Nhìn thấy ô đỏ đánh dấu vị trí assertion bị thất bại trong Filmstrip.
    - Inspect trực tiếp DOM Snapshot để thấy giá trị thực tế của `.title` là `Checkout: Your Information`.

---

### `TC-UI-TRACE-03: Network Waterfall & Slow Request Identification`
- **Mục tiêu:** Mở Trace Viewer và xác định chính xác request nào gây ra độ trễ $> 5000\text{ms}$ trong Network Tab.
- **Kỳ vọng:** Phân tích được thời gian chờ mạng (Waiting TTFB / Content Download) và giải thích nguyên nhân gây nghẽn hiệu năng từ bản ghi Trace.

---

## 3. Câu Hỏi Cốt Lõi Cần Trả Lời & Kịch Bản Thất Bại (Failure Modes)

1. **Tại sao cấu hình `trace: 'on-first-retry'` được xem là chuẩn mực vàng trên hạ tầng CI/CD doanh nghiệp thay vì `trace: 'on'` cho mọi bài test?** (Tiết kiệm băng thông, giảm dung lượng lưu trữ artifact trên GitHub Actions, chỉ tốn tài nguyên ghi trace khi có lỗi thực sự xảy ra).
2. **Sự khác biệt căn bản giữa việc xem lại một Video MP4 thông thường và việc mở một tệp `trace.zip` trong Playwright Trace Viewer là gì?** (Video chỉ là pixel thụ động, Trace Viewer là môi trường tương tác sống với DOM Snapshot, Network, Console, Source Code).
3. **Làm thế nào Playwright ghi lại được DOM Snapshot thật mà không làm suy giảm nghiêm trọng tốc độ thực thi của bài test?**

---

## 4. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Tài Liệu Playwright Trace Viewer & CI Triage:**
   - [Playwright Official Guide - Trace Viewer](https://playwright.dev/docs/trace-viewer)
   - [Playwright Official Guide - Test Retries and Flaky Test Triage](https://playwright.dev/docs/test-retries)
2. **Chuẩn Kiến Trúc Tracing:**
   - [Chrome DevTools Protocol - Tracing Domain](https://chromedevtools.github.io/devtools-protocol/tot/Tracing/)

---

## 5. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo (`67_Bao_cao.docx` / `67_Bao_cao.tex` - Mục 3.3.3 Chương 3)
Người phụ trách soạn thảo theo khung 5 phần học thuật:
1. **Mục tiêu & Cơ chế kỹ thuật:** Phân tích nguyên lý thu thập Trace (DOM Snapshots, Filmstrip, Action Logs, Network Waterfall) của Playwright.
2. **Đặc tả kịch bản & Dữ liệu kiểm thử:** Bảng kịch bản kiểm thử hiệu năng với `performance_glitch_user` và kịch bản cố tình kích hoạt lỗi chẩn đoán.
3. **Trích đoạn mã nguồn then chốt:** Trích dẫn 15 - 25 dòng code cấu hình Trace trong `playwright.config.ts` (`trace: 'on-first-retry'`) hoặc programmatic tracing (`context.tracing.start()`).
4. **Bằng chứng thực nghiệm & Phân tích log:** Ảnh chụp màn hình giao diện Trace Viewer thể hiện rõ **4 vùng quan sát** (Filmstrip timeline, DOM snapshot, Network waterfall, và Action log).
5. **Đánh giá rủi ro & Bài học kỹ thuật:** Phân tích quy trình điều tra nguyên nhân gốc rễ (Root Cause Analysis - RCA) để dứt điểm các lỗi Flaky trong môi trường CI/CD.

---

## 6. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Mã Nguồn Kiểm Thử & Chạy Pass ($100\%$):**
  - [ ] Tạo file `tests/e2e/diagnostics_trace.spec.ts` với đầy đủ 3 ca test (`TC-UI-TRACE-01` $\to$ `TC-UI-TRACE-03`).
  - [ ] Chạy lệnh `bunx playwright test tests/e2e/diagnostics_trace.spec.ts --project=chromium --trace on` pass $100\%$.
  - [ ] Trích xuất thành công file `trace.zip` và mở kiểm tra được bằng `bunx playwright show-trace`.
- [ ] **Bằng Chứng Git & Pull Request:**
  - [ ] Tạo nhánh `feat/wbs-3.3-ui-diagnostics-trace`.
  - [ ] Tạo Pull Request trên GitHub đính kèm ảnh chụp 4 vùng chức năng của Trace Viewer.
- [ ] **Chất Lượng Học Thuật Trong Báo Cáo:**
  - [ ] Hoàn thành đầy đủ 5 phần cho Mục 3.3.3 trong Báo cáo đồ án.
