# WBS 3.2: Web UI Test Suite - Network Mocking and Error Handling

## Metadata

- **WBS Code:** `3.2`
- **Task Name:** Web UI Ca 2: Network Mocking `page.route()` HTTP 500 & Locked-out User
- **Assignee:** Ngô Gia Bảo (MSSV: 0306241090)
- **Task Weight:** `6.0%`
- **Deliverable Artifacts:** File mã nguồn `tests/e2e/network_mocking.spec.ts`, Pull Request GitHub, Mục 3.3.2 Chương 3 trong `67_Bao_cao.docx` / `67_Bao_cao.tex`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ hiện thực ca kiểm thử tự động giao diện Web UI Ca 2: Chặn bắt và giả lập lưu lượng mạng (Network Mocking & Fault Injection) bằng API `page.route()`, kết hợp kiểm thử xử lý lỗi tài khoản bị khóa (`locked_out_user`) trên SauceDemo.
- **Mục đích:** Kiểm tra độ bền vững (Resilience) và khả năng suy thoái êm dịu (Graceful Degradation) của giao diện Web Frontend khi máy chủ hoặc các tài nguyên mạng gặp sự cố (HTTP 500 Server Error, Network Abort).
- **Điểm mấu chốt:** Can thiệp trực tiếp ở tầng Network Layer của Browser Context mà không cần chạm vào Backend server thật; phân biệt rõ ràng giữa `route.fulfill()`, `route.abort()`, và `route.continue()`.

---

## 1. Mục Tiêu & Bối Cảnh Nghiệp Vụ (Business & Technical Context)

- **Bối cảnh kỹ thuật:**
  - Trong thực tế, các ứng dụng Web Client luôn phải phụ thuộc vào các dịch vụ Backend hoặc CDN bên thứ ba. Khi các dịch vụ này bị sập (trả về mã `500 Internal Server Error`, `503 Service Unavailable`, hoặc rớt mạng Timeout), một ứng dụng Web chất lượng cao không được phép bị sập trắng trang (Blank Screen) mà phải có cơ chế **Fallback UI / Error Boundary** êm dịu.
  - **Cơ chế Network Interception của Playwright:**
    - Playwright hoạt động ở mức giao thức mạng trình duyệt (CDP / BiDi), cho phép lắng nghe và can thiệp vào mọi HTTP Request trước khi nó rời khỏi trình duyệt.
    - `page.route(urlPattern, handler)`:
      - `route.fulfill({ status, contentType, body, headers })`: Trả về dữ liệu giả lập ngay lập tức mà không gửi request ra mạng ngoài.
      - `route.abort(errorCode)`: Hủy kết nối mạng đột ngột (mô phỏng rớt mạng, chặn CORS, DNS fail).
      - `route.continue()`: Cho phép request tiếp tục đi tới máy chủ thật.
  - **Kiểm thử Tài khoản Bị Khóa (`locked_out_user`):**
    - SauceDemo cung cấp sẵn tài khoản bị khóa quyền truy cập để kiểm thử thông báo bảo mật: Nhập `locked_out_user` / `secret_sauce` $\to$ Hệ thống phải chặn không cho vào trang `/inventory.html` và hiển thị thông báo lỗi tương ứng.

---

## 2. Các Yêu Cầu Thiết Kế Ca Kiểm Thử (Test Design Specifications)

Người phụ trách cần thiết kế và hiện thực 3 kịch bản kiểm thử trong `tests/e2e/network_mocking.spec.ts`:

### `TC-UI-MOCK-01: Network Fault Injection (Simulated HTTP 500 on Product Assets/Requests)`
- **Mục tiêu:** Kiểm tra khả năng xử lý của giao diện khi tài nguyên mạng bị lỗi HTTP 500.
- **Thao tác thực hiện:**
  1. Sử dụng `page.route('**/*.jpg', route => route.fulfill({ status: 500, contentType: 'text/plain', body: 'Internal Server Error' }))` để giả lập toàn bộ ảnh sản phẩm bị sập ở máy chủ CDN.
  2. Đăng nhập vào trang `/inventory.html` bằng `standard_user`.
- **Kỳ vọng & Invariants:**
  - Trang web vẫn tải thành công cấu trúc DOM, không bị crash trắng trang.
  - Danh sách 6 sản phẩm vẫn hiển thị đầy đủ tên (`inventory_item_name`), giá tiền (`inventory_item_price`), và nút `Add to cart`.
  - Người dùng vẫn có thể thêm sản phẩm vào giỏ hàng và chuyển trang bình thường.
  - Dọn dẹp route sau khi hoàn tất bằng `await page.unroute('**/*.jpg')`.

---

### `TC-UI-MOCK-02: Security Error Handling with Locked-Out User Account`
- **Mục tiêu:** Kiểm tra thông báo từ chối truy cập và trạng thái giao diện khi đăng nhập bằng tài khoản bị khóa.
- **Thao tác thực hiện:**
  1. Mở trang chủ SauceDemo `/`.
  2. Nhập `username: "locked_out_user"`, `password: "secret_sauce"` và bấm nút Login.
- **Kỳ vọng & Invariants:**
  - Trình duyệt **không được phép chuyển hướng** sang `/inventory.html` (URL vẫn giữ nguyên ở `/`).
  - Hộp thông báo lỗi hiển thị chính xác nội dung: `Epic sadface: Sorry, this user has been locked out.`.
  - Các ô nhập liệu hiển thị icon lỗi màu đỏ (Error Cross SVG) và có class CSS lỗi (ví dụ: `input_error`).

---

### `TC-UI-MOCK-03: Network Abort Simulation (Offline / Failed Connection)`
- **Mục tiêu:** Kiểm tra hành vi của trình duyệt khi kết nối mạng bị đứt gãy đột ngột.
- **Thao tác thực hiện:**
  1. Sử dụng `page.route('**/service-worker.js', route => route.abort('failed'))` hoặc chặn một tài nguyên phụ trợ.
  2. Thực hiện điều hướng và kiểm tra giao diện chính không bị treo vô hạn (No Infinite Hang).
- **Kỳ vọng:** Bài test kết thúc an toàn, hệ thống tự động bỏ qua tài nguyên bị lỗi kết nối.

---

## 3. Câu Hỏi Cốt Lõi Cần Trả Lời & Kịch Bản Thất Bại (Failure Modes)

1. **Tại sao Network Mocking trực tiếp trong Playwright bằng `page.route()` vượt trội hơn việc dựng Mock Server bên ngoài (như WireMock, json-server)?** (Không tốn chi phí quản lý hạ tầng, không chiếm dụng port, chạy song song độc lập hoàn toàn giữa các worker threads).
2. **Sự khác biệt giữa `route.fulfill()` và `route.abort()` là gì?** Khi nào nên dùng `route.abort('internetdisconnected')` để kiểm thử tính năng Offline PWA?
3. **Tại sao bắt buộc phải gọi `page.unroute()` sau khi hoàn tất bài test mock?** Nếu không dọn dẹp, route mock có thể gây ảnh hưởng (Side Effect / Leakage) sang các bài test tiếp theo chạy trên cùng worker ra sao?

---

## 4. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Tài Liệu Chặn Bắt Mạng Playwright:**
   - [Playwright Official Guide - Network Interception & Mocking](https://playwright.dev/docs/network)
   - [Playwright API Reference - Page.route()](https://playwright.dev/docs/api/class-page#page-route)
   - [Playwright API Reference - Route.fulfill()](https://playwright.dev/docs/api/class-route#route-fulfill)
2. **Chuẩn Mã Lỗi HTTP:**
   - [IETF RFC 9110 - HTTP Semantics (Section 15.6: Server Error 5xx)](https://datatracker.ietf.org/doc/html/rfc9110#section-15.6)

---

## 5. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo (`67_Bao_cao.docx` / `67_Bao_cao.tex` - Mục 3.3.2 Chương 3)
Người phụ trách soạn thảo theo khung 5 phần học thuật:
1. **Mục tiêu & Cơ chế kỹ thuật:** Phân tích nguyên lý can thiệp tầng mạng của Browser Context qua `page.route()` và cơ chế Fault Injection.
2. **Đặc tả kịch bản & Dữ liệu kiểm thử:** Bảng các kịch bản Mocking HTTP 500, Chặn mạng (Abort), và Locked-out User.
3. **Trích đoạn mã nguồn then chốt:** Trích dẫn 15 - 25 dòng code xử lý `page.route()`, `route.fulfill()`, và kiểm định thông báo lỗi `locked_out_user`.
4. **Bằng chứng thực nghiệm & Phân tích log:** Ảnh chụp màn hình terminal chạy pass $100\%$ cả 3 ca test, ảnh chụp màn hình hiển thị thông báo lỗi `Epic sadface` trên SauceDemo.
5. **Đánh giá rủi ro & Bài học kỹ thuật:** Phân tích tầm quan trọng của kiểm thử độ bền (Resilience Testing) và giải pháp xây dựng Fallback UI cho ứng dụng Web.

---

## 6. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Mã Nguồn Kiểm Thử & Chạy Pass ($100\%$):**
  - [ ] Tạo file `tests/e2e/network_mocking.spec.ts` với đầy đủ 3 ca test (`TC-UI-MOCK-01` $\to$ `TC-UI-MOCK-03`).
  - [ ] Chạy lệnh `bunx playwright test tests/e2e/network_mocking.spec.ts --project=chromium` pass $100\%$.
  - [ ] Đảm bảo gọi `page.unroute()` sau mỗi kịch bản mock mạng.
- [ ] **Bằng Chứng Git & Pull Request:**
  - [ ] Tạo nhánh `feat/wbs-3.2-ui-network-mocking`.
  - [ ] Tạo Pull Request trên GitHub với mô tả chi tiết, ảnh test pass.
- [ ] **Chất Lượng Học Thuật Trong Báo Cáo:**
  - [ ] Hoàn thành đầy đủ 5 phần cho Mục 3.3.2 trong Báo cáo đồ án.
