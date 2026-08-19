# WBS 2.2: API Test Suite - High-Contention Concurrency and Redis Redlock

## Metadata

- **WBS Code:** `2.2`
- **Task Name:** API Ca 2: Concurrency Race Condition & Redis Redlock
- **Assignee:** Trần Văn Ngọc (MSSV: 0306241131)
- **Task Weight:** `7.5%`
- **Deliverable Artifacts:** File mã nguồn `tests/api/concurrency.spec.ts`, Pull Request GitHub, Mục 3.2.2 Chương 3 trong `67_Bao_cao.docx` / `67_Bao_cao.tex`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ hiện thực bộ kiểm thử tự động API Ca 2: Điều kiện chạy đua (Race Condition) và tranh chấp tài nguyên cao độ trên endpoint `POST /bookings/reserve` của hệ thống `ticket-booking`.
- **Mục đích:** Sử dụng kỹ thuật Asynchronous Socket Flooding với `Promise.all()` để bắn đồng thời $N = 10$ requests giữ chỗ trên cùng một mã ghế duy nhất (`seatIds: [UUID]`).
- **Điểm mấu chốt:** Kiểm chứng cơ chế bảo vệ 2 tầng: Khóa phân tán **Redis Redlock** ở tầng RAM và **PostgreSQL Pessimistic Locking** (`SELECT ... FOR UPDATE`) ở tầng Database. Xác thực bất biến toán học: Đúng $1$ request nhận `HTTP 201 Created` và $N-1$ requests nhận `HTTP 409 Conflict`, triệt tiêu $100\%$ lỗi Double-booking.

---

## 1. Mục Tiêu & Bối Cảnh Nghiệp Vụ (Business & Technical Context)

- **Bối cảnh hệ thống `ticket-booking` (NestJS Booking Module):**
  - **Endpoint Trọng Yếu:** `POST /bookings/reserve`
    - Headers bắt buộc: `Authorization: Bearer <token>`, `idempotency-key: <UUIDv4>`.
    - Body (`ReserveSeatsDto`):
      ```json
      {
        "showId": "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
        "seatIds": ["019fa8bc-8f4d-7000-b366-e691f45cfb8f"],
        "voucherCode": "DISCOUNT10"
      }
      ```
  - **Cơ Chế Bảo Vệ 2 Tầng Trước Tranh Chấp (Dual-Layer Locking):**
    1. **Tầng 1 - Khóa Phân Tán Redis Redlock (RAM Layer):**
       - Khi request đến, `BookingService` sắp xếp danh sách `seatIds` và xin giữ khóa phân tán trên các tài nguyên Redis: `lock:seats:${seatId}` thông qua `RedlockService.acquireLock(resources, 2000)`.
       - Nếu không xin được khóa (do luồng khác đang giữ), hệ thống ném ngay `ConflictException` (`HTTP 409 Conflict`) với thông báo: *"Ghế đã được giữ hoặc đặt bởi người khác"*, giải phóng tải cho Database.
    2. **Tầng 2 - Khóa Bi Quan Cơ Sở Dữ Liệu (PostgreSQL Pessimistic Locking):**
       - Luồng giành được khóa Redis tiến hành mở Transaction trong PostgreSQL, thực hiện câu truy vấn `SELECT ... FROM show_seats WHERE id IN (...) FOR UPDATE`.
       - Kiểm tra trạng thái ghế phải là `available` (hoặc `status = 'reserved'` nhưng đã quá hạn `lockedUntil < now()`).
       - Cập nhật trạng thái ghế thành `reserved` với thời hạn giữ chỗ 10 phút (`lockedUntil: now() + 10m`), tạo bản ghi booking với trạng thái `pending_payment`.

---

## 2. Các Yêu Cầu Thiết Kế Ca Kiểm Thử (Test Design Specifications)

Người phụ trách cần thiết kế và hiện thực các kịch bản kiểm thử tự động trong `tests/api/concurrency.spec.ts`:

### `TC-CONCUR-01: High-Contention Simultaneous Seat Booking (10 Concurrent Requests)`
- **Mục tiêu:** Kiểm tra khả năng chặn đứng hoàn toàn hiện tượng Double-booking khi 10 người dùng cùng bấm đặt một ghế tại cùng thời điểm $t_0$.
- **Tiền điều kiện:** Chuẩn bị 1 suất chiếu hợp lệ (`showId`) và 1 mã ghế trống (`seatId`). Tạo 10 tài khoản người dùng khác nhau với 10 Access Tokens độc lập.
- **Thao tác thực hiện:**
  1. Khởi tạo mảng 10 HTTP requests, mỗi request mang một `idempotency-key` riêng (UUID v4) và Token của một người dùng khác nhau, nhưng cùng trỏ vào mã ghế đích `seatId`.
  2. Kích hoạt bắn đồng thời 10 requests qua `Promise.all(requestPromises)`.
- **Kỳ vọng & Bất biến toán học (Mathematical Invariants):**
  - **Phân bổ mã trạng thái HTTP:**
    - Số lượng phản hồi `HTTP 201 Created` (Đặt thành công): Đúng bằng **$1$**.
    - Số lượng phản hồi `HTTP 409 Conflict` (Bị từ chối do tranh chấp): Đúng bằng **$9$**.
  - **Kiểm định cấu trúc phản hồi:**
    - Request thành công: Nhận response body `{ success: true, data: { bookingId, status: "pending_payment", totalPrice, expiresAt, seats } }`.
    - 9 Requests thất bại: Nhận response body chuẩn RFC 9457 với `status: 409`, `title: "Conflict"`, `detail: "Ghế đã được giữ hoặc đặt bởi người khác"`.
  - **Bất biến cơ sở dữ liệu:** Không có ghế nào bị gán cho 2 người dùng khác nhau (Zero Double-booking).

---

### `TC-CONCUR-02: Lock Expiration & Resource Release (TTL Expiration Recovery)`
- **Mục tiêu:** Kiểm tra cơ chế tự động giải phóng ghế sau khi hết thời hạn giữ chỗ (10 phút) để người khác có thể đặt lại.
- **Kỳ vọng:** Khi bản ghi ghế hết hạn `lockedUntil`, request đặt vé tiếp theo đối với ghế này sẽ giành được quyền giữ chỗ thành công với `HTTP 201 Created`.

---

## 3. Câu Hỏi Cốt Lõi Cần Trả Lời & Kịch Bản Thất Bại (Failure Modes)

1. **Tại sao cần kết hợp cả Redis Redlock lẫn PostgreSQL `FOR UPDATE`?** Nếu chỉ dùng Redis Redlock mà Redis bị mất kết nối (Network Partition), tại sao DB Pessimistic Locking là chốt chặn an toàn cuối cùng?
2. **Tại sao danh sách `seatIds` bắt buộc phải được sắp xếp (`sort()`) trước khi xin khóa Redlock?** (Nguyên lý phòng chống bế tắc Deadlock khi 2 giao dịch xin khóa 2 ghế A và B theo thứ tự ngược nhau).
3. **Nếu không có cơ chế khóa phân tán, chi phí tài chính và pháp lý của lỗi Double-booking đối với rạp chiếu phim / sự kiện là gì?**

---

## 4. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Tài Liệu Khóa Phân Tán & Bất Đồng Bộ:**
   - [Redis Official Documentation - Distributed Locks with Redis (Redlock Algorithm)](https://redis.io/docs/latest/develop/use/dist-locks/)
   - [PostgreSQL Documentation - Explicit Locking (SELECT ... FOR UPDATE)](https://www.postgresql.org/docs/current/explicit-locking.html)
   - [MDN Web Docs - Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

---

## 5. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo (`67_Bao_cao.docx` / `67_Bao_cao.tex` - Mục 3.2.2 Chương 3)
Người phụ trách soạn thảo theo khung 5 phần học thuật:
1. **Mục tiêu & Cơ chế kỹ thuật:** Phân tích mô hình Dual-Layer Locking (Redis Redlock + DB `FOR UPDATE`) và nguyên lý Asynchronous Socket Flooding.
2. **Đặc tả kịch bản & Dữ liệu kiểm thử:** Bảng thông số 10 concurrent requests (User IDs, Tokens, Show ID, Seat ID, Idempotency Keys, Expected Statuses).
3. **Trích đoạn mã nguồn then chốt:** Trích dẫn 15 - 25 dòng code xử lý mảng `Promise.all()` và logic tính toán kiểm định $1$ Created + $9$ Conflict.
4. **Bằng chứng thực nghiệm & Phân tích log:** Ảnh chụp terminal chạy pass $100\%$, log danh sách mã trạng thái HTTP nhận về từ 10 sockets đồng thời.
5. **Đánh giá rủi ro & Bài học kỹ thuật:** Phân tích nguy cơ Deadlock, nghẽn tài nguyên và giải pháp sắp xếp khóa có thứ tự.

---

## 6. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Mã Nguồn Kiểm Thử & Chạy Pass ($100\%$):**
  - [ ] Tạo file `tests/api/concurrency.spec.ts`.
  - [ ] Chạy lệnh `bunx playwright test tests/api/concurrency.spec.ts --project=api` pass $100\%$.
  - [ ] Bất biến $1$ Success + $9$ Conflict được xác thực bằng câu lệnh assertion toán học chính xác.
- [ ] **Bằng Chứng Git & Pull Request:**
  - [ ] Tạo nhánh `feat/wbs-2.2-api-concurrency-redlock`.
  - [ ] Tạo Pull Request trên GitHub với mô tả chi tiết, log status codes và ảnh test pass.
- [ ] **Chất Lượng Học Thuật Trong Báo Cáo:**
  - [ ] Hoàn thành đầy đủ 5 phần cho Mục 3.2.2 trong Báo cáo đồ án.
