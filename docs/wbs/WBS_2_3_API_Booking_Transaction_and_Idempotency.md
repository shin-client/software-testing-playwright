# WBS 2.3: API Test Suite - Booking Transaction and Idempotency Verification

## Metadata

- **WBS Code:** `2.3`
- **Task Name:** API Ca 3: Booking Transaction, Webhook & Idempotency
- **Assignee:** Đặng Duy Lam (MSSV: 0306241125)
- **Task Weight:** `7.5%`
- **Deliverable Artifacts:** File mã nguồn `tests/api/booking.spec.ts`, Pull Request GitHub, Mục 3.2.3 Chương 3 trong `67_Bao_cao.docx` / `67_Bao_cao.tex`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ hiện thực bộ kiểm thử tự động API Ca 3: Giao dịch xác nhận thanh toán đặt vé và xác thực tính bất biến Idempotency thông qua tiêu đề `idempotency-key` (UUID v4) trên các endpoint `POST /bookings/reserve` và `POST /bookings/confirm` của hệ thống `ticket-booking`.
- **Mục đích:** Đảm bảo hệ thống xử lý an toàn tuyệt đối khi người dùng nhấp đúp (Double Click) nút thanh toán hoặc khi mạng chập chờn kích hoạt cơ chế tự động gửi lại (Client Retry).
- **Điểm mấu chốt:** Kiểm chứng cơ chế lưu bộ nhớ đệm kết quả Idempotency trong Redis (`idempotency:booking:${userId}:${key}`), đảm bảo không trừ tiền hai lần, không tạo bản ghi thanh toán thừa và trả về cùng một kết quả ban đầu.

---

## 1. Mục Tiêu & Bối Cảnh Nghiệp Vụ (Business & Technical Context)

- **Bối cảnh hệ thống `ticket-booking` (NestJS Booking & Payment Module):**
  - **Endpoints Trọng Yếu:**
    1. `POST /bookings/reserve`: Đặt giữ chỗ ghế tạm thời (bắt buộc kèm header `idempotency-key`).
    2. `POST /bookings/confirm`: Xác nhận thanh toán và xuất vé chính thức (bắt buộc kèm header `idempotency-key`).
  - **Cấu Trúc Header & Payload Xác Nhận Đơn Hàng (`ConfirmBookingDto`):**
    - Header bắt buộc: `Authorization: Bearer <token>`, `idempotency-key: <UUIDv4>`.
    - Body:
      ```json
      {
        "bookingId": "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
        "orderCode": 123456,
        "paymentMethod": "payos",
        "transactionId": "PAYOS-TX-987654",
        "amount": 100000
      }
      ```
  - **Cơ Chế Xử Lý Idempotency với Redis Cache:**
    - Khi nhận request kèm header `idempotency-key: K_1`:
      1. Backend kiểm tra trong Redis với khóa `idempotency:booking:${userId}:${K_1}`.
      2. Nếu tìm thấy dữ liệu trong Cache: Backend trả về ngay lập tức JSON response đã lưu trước đó mà **hoàn toàn không thực thi lại logic trừ tiền, không ghi thêm bản ghi vào bảng `payments`, và không sinh thêm vé mới trong bảng `tickets`**.
      3. Nếu chưa có: Backend mở Transaction thực hiện ghi nhận thanh toán, xuất vé, lưu kết quả phản hồi vào Redis với thời hạn TTL 24 giờ (`24h`), rồi trả về kết quả `HTTP 200 OK` cho Client.
    - Nếu request gửi lên thiếu header `idempotency-key`: Backend ném lỗi `BadRequestException` (`HTTP 400 Bad Request`) với thông báo: *"Idempotency key is required"*.

---

## 2. Các Yêu Cầu Thiết Kế Ca Kiểm Thử (Test Design Specifications)

Người phụ trách cần thiết kế và hiện thực tối thiểu 4 kịch bản kiểm thử tự động trong `tests/api/booking.spec.ts`:

### `TC-IDEMP-01: First Execution (Happy Path Booking Confirmation)`
- **Thao tác:**
  1. Giữ chỗ ghế thành công nhận `bookingId`.
  2. Sinh một chuỗi UUID v4 ngẫu nhiên làm `idempotency-key: K_1`.
  3. Gửi request `POST /bookings/confirm` kèm header `idempotency-key: K_1` và payload hợp lệ.
- **Kỳ vọng & Invariants:**
  - Mã trạng thái: `HTTP 200 OK`.
  - Cấu trúc response: `{ success: true, data: { bookingId, paymentId, transactionId, status: "confirmed", confirmedAt, totalPrice, tickets } }`.
  - Trạng thái đơn hàng chuyển thành `confirmed`, danh sách `tickets` sinh ra mã vé chính thức (`ticketCode`).

---

### `TC-IDEMP-02: Duplicate Request with Identical Idempotency Key (Network Retry Simulation)`
- **Thao tác:** Gửi lại chính xác request xác nhận thanh toán trên với cùng `idempotency-key: K_1` và cùng nội dung body.
- **Kỳ vọng & Bất biến toán học (Mathematical Invariants):**
  - Mã trạng thái: `HTTP 200 OK`.
  - Dữ liệu `paymentId`, `transactionId`, `bookingId`, `confirmedAt` và danh sách `tickets` trả về giống hệt $100\%$ so với lần 1.
  - **Bất biến cơ sở dữ liệu:** Số lượng bản ghi trong bảng `payments` và `tickets` không thay đổi (không sinh ra payment trùng lặp).

---

### `TC-IDEMP-03: Missing Mandatory Idempotency Key Header Validation`
- **Thao tác:** Gửi request `POST /bookings/confirm` hoặc `POST /bookings/reserve` nhưng **cố tình không truyền header `idempotency-key`**.
- **Kỳ vọng:**
  - Mã trạng thái: `HTTP 400 Bad Request`.
  - Header `content-type` là `application/problem+json`.
  - Response body chứa `status: 400`, `title: "Bad Request"`, `detail: "Idempotency key is required"`.

---

### `TC-IDEMP-04: Concurrent Sockets Flooding on Same Idempotency Key (Double Click Attack)`
- **Thao tác:** Bắn đồng thời 5 requests `POST /bookings/confirm` mang cùng 1 `idempotency-key: K_1` thông qua `Promise.all()`.
- **Kỳ vọng:**
  - Cả 5 requests đều nhận mã trạng thái `HTTP 200 OK` và trả về cùng một mã `paymentId`.
  - Duy nhất 1 giao dịch thanh toán được ghi nhận trong cơ sở dữ liệu.

---

## 3. Câu Hỏi Cốt Lõi Cần Trả Lời & Kịch Bản Thất Bại (Failure Modes)

1. **Tại sao các thao tác thanh toán tài chính bắt buộc phải dùng tiêu đề `Idempotency-Key` dạng UUID v4 thay vì để Backend tự sinh mã?**
2. **Nếu Redis bị sự cố (Crash / Network Partition), làm thế nào cơ sở dữ liệu PostgreSQL (Unique Constraint trên `orderCode` / `transactionId`) bảo vệ hệ thống không bị trừ tiền 2 lần?**
3. **Chiến lược Fail-Open trong việc đọc Idempotency Cache của `BookingService` giúp duy trì tính sẵn sàng (Availability) của hệ thống ra sao?**

---

## 4. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Chuẩn Giao Thức & Thực Tiễn Công Nghiệp:**
   - [IETF Internet-Draft - The Idempotency-Key HTTP Header Field](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header)
   - [Stripe Engineering Documentation - Designing Robust Idempotent APIs](https://stripe.com/docs/api/idempotent_requests)
2. **Tài Liệu Playwright API Testing:**
   - [Playwright API Testing Official Guide](https://playwright.dev/docs/api-testing)

---

## 5. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo (`67_Bao_cao.docx` / `67_Bao_cao.tex` - Mục 3.2.3 Chương 3)
Người phụ trách soạn thảo theo khung 5 phần học thuật:
1. **Mục tiêu & Cơ chế kỹ thuật:** Phân tích nguyên lý toán học của tính Idempotency ($f(f(x)) = f(x)$) và cơ chế lưu cache Redis `idempotency:booking:${userId}:${key}`.
2. **Đặc tả kịch bản & Dữ liệu kiểm thử:** Bảng thông số 4 ca test (`TC-IDEMP-01` $\to$ `TC-IDEMP-04`) với các endpoints `/bookings/reserve`, `/bookings/confirm`.
3. **Trích đoạn mã nguồn then chốt:** Trích dẫn 15 - 25 dòng code khởi tạo UUID v4 header và kiểm tra tính bất biến của dữ liệu thanh toán.
4. **Bằng chứng thực nghiệm & Phân tích log:** Ảnh chụp terminal chạy pass $100\%$, log JSON so sánh 2 phản hồi trùng lặp khớp nhau từng trường.
5. **Đánh giá rủi ro & Bài học kỹ thuật:** Phân tích rủi ro tài chính của hiện tượng Double-Charge và giải pháp kết hợp Redis Cache + DB Unique Constraints.

---

## 6. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Mã Nguồn Kiểm Thử & Chạy Pass ($100\%$):**
  - [ ] Tạo file `tests/api/booking.spec.ts`.
  - [ ] Chạy lệnh `bunx playwright test tests/api/booking.spec.ts --project=api` pass $100\%$ cả 4 kịch bản.
  - [ ] Đảm bảo sinh đúng mã UUID v4 cho header `idempotency-key`.
- [ ] **Bằng Chứng Git & Pull Request:**
  - [ ] Tạo nhánh `feat/wbs-2.3-api-booking-idempotency`.
  - [ ] Tạo Pull Request trên GitHub với mô tả chi tiết, log JSON và ảnh test pass.
- [ ] **Chất Lượng Học Thuật Trong Báo Cáo:**
  - [ ] Hoàn thành đầy đủ 5 phần cho Mục 3.2.3 trong Báo cáo đồ án.
