# WBS 2.1: API Test Suite - Auth Lifecycle and Single-Use Token Rotation

## Metadata

- **WBS Code:** `2.1`
- **Task Name:** API Ca 1: Auth Lifecycle, Token Rotation & Family Revocation
- **Assignee:** Nguyễn Quốc Đương (MSSV: 0306241102)
- **Task Weight:** `7.5%`
- **Deliverable Artifacts:** File mã nguồn `tests/api/auth.spec.ts`, `fixtures/api.fixture.ts`, Pull Request GitHub, Mục 3.2.1 Chương 3 trong `67_Bao_cao.docx` / `67_Bao_cao.tex`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ hiện thực bộ kiểm thử tự động API Ca 1: Toàn bộ vòng đời xác thực tài khoản (`/auth/register` $\to$ `/auth/login` $\to$ `/auth/refresh` $\to$ `/auth/logout` $\to$ `/auth/logout-all`) trên hệ thống NestJS `ticket-booking`.
- **Mục đích:** Kiểm chứng cơ chế Single-Use Refresh Token Rotation (RTR) và cơ chế thu hồi tức thì khi phát hiện tấn công tái sử dụng token cũ (Token Reuse Attack).
- **Điểm mấu chốt:** Xác thực giải mã JWT Payload (`sub`, `email`, `role`, `exp`), kiểm chứng việc xóa token cũ trong Database và kích hoạt mã lỗi `HTTP 401 Unauthorized` khi phát lại refresh token cũ.

---

## 1. Mục Tiêu & Bối Cảnh Nghiệp Vụ (Business & Technical Context)

- **Bối cảnh hệ thống `ticket-booking` (NestJS Auth Module):**
  - **Cơ chế Token Kép (Dual-Token Architecture):**
    - **Access Token:** JWT ký bằng thuật toán HMAC-SHA256, thời hạn sống ngắn (15 phút), chứa payload `{ sub: userId, email, role }`. Dùng để đính kèm header `Authorization: Bearer <accessToken>` truy cập các tuyến đường bảo vệ.
    - **Refresh Token:** Chuỗi ngẫu nhiên $32\text{ bytes}$ Hexadecimal (`randomBytes(32).toString('hex')`), thời hạn sống 7 ngày (`expiresAt: +7d`). Backend lưu giá trị băm `tokenHash = sha256(refreshToken)` vào bảng `refresh_tokens` trong PostgreSQL.
  - **Cơ chế Single-Use Refresh Token Rotation (RTR):**
    - Khi Client gọi `POST /auth/refresh` với body `{ refreshToken: RT_1 }`:
      1. Backend tính `sha256(RT_1)` và thực hiện lệnh `DELETE FROM refresh_tokens WHERE token_hash = sha256(RT_1) RETURNING ...`.
      2. Nếu không tìm thấy bản ghi (token không tồn tại, đã bị thu hồi hoặc đã quá hạn `expiresAt`), Backend ném lỗi `UnauthorizedException` (`HTTP 401 Unauthorized`).
      3. Nếu hợp lệ, Backend sinh cặp token mới ($AT_2, RT_2$), lưu `sha256(RT_2)` vào database và trả về cho Client.
  - **Phát hiện Tấn công Tái sử dụng (Token Reuse Detection):**
    - Nếu kẻ tấn công đánh cắp được $RT_1$ cũ và cố tình gọi lại `POST /auth/refresh`, do $RT_1$ đã bị xóa khỏi bảng `refresh_tokens` ở lần dùng trước, Backend lập tức từ chối với `HTTP 401 Unauthorized` (Invalid Refresh Token).

---

## 2. Các Yêu Cầu Thiết Kế Ca Kiểm Thử (Test Design Specifications)

Người phụ trách cần thiết kế và hiện thực tối thiểu 4 kịch bản kiểm thử tự động trong `tests/api/auth.spec.ts`:

### `TC-AUTH-01: Happy Path Login & JWT Payload Decoding`
- **Endpoint:** `POST /auth/login`
- **Payload:** `{ email: "test_user@example.com", password: "Password123!" }`
- **Kỳ vọng & Invariants:**
  - Mã trạng thái: `HTTP 200 OK` (hoặc `HTTP 201 Created`).
  - Cấu trúc response: `{ success: true, data: { accessToken, refreshToken, user: { id, email, fullName, role } } }`.
  - Kiểm tra `accessToken`: Chuỗi JWT có đúng 3 phần phân tách bởi dấu chấm (`header.payload.signature`).
  - Giải mã Base64 phần Payload (`Buffer.from(token.split('.')[1], 'base64').toString()`):
    - Chứa đúng trường `sub` trùng khớp với `user.id`.
    - Chứa đúng `email` và `role`.
    - Thời gian hết hạn thỏa mãn: `exp > iat`.

---

### `TC-AUTH-02: Single-Use Refresh Token Rotation & Replay Attack Rejection`
- **Mục tiêu:** Kiểm tra cơ chế xoay vòng token và từ chối token cũ.
- **Thao tác thực hiện:**
  1. Đăng nhập lấy cặp token ban đầu ($AT_1, RT_1$).
  2. Gửi request xoay vòng token lần 1: `POST /auth/refresh` với `{ refreshToken: RT_1 }`.
     - **Kỳ vọng:** Nhận `HTTP 200 OK`, trả về cặp token mới ($AT_2, RT_2$), với $RT_2 \neq RT_1$ và $AT_2 \neq AT_1$.
  3. Gửi lại request phát lại token cũ (Replay Attack): `POST /auth/refresh` với `{ refreshToken: RT_1 }`.
     - **Kỳ vọng:** Nhận chính xác `HTTP 401 Unauthorized`, response format chuẩn RFC 9457 với `detail: "Refresh token không hợp lệ hoặc đã hết hạn"`.
  4. Sử dụng $AT_2$ mới để truy cập endpoint bảo vệ $\to$ Thành công (`HTTP 200 OK`).

---

### `TC-AUTH-03: Tampered Signature & Expired Token Rejection`
- **Mục tiêu:** Kiểm tra cơ chế bảo vệ của `JwtAuthGuard` trước token bị sửa đổi hoặc hết hạn.
- **Thao tác thực hiện:**
  1. Tạo token giả mạo: Lấy $AT_1$ hợp lệ và thay đổi 2 ký tự cuối cùng của phần `signature`.
  2. Gửi request `POST /bookings/reserve` với header `Authorization: Bearer <tampered_token>`.
- **Kỳ vọng:**
  - Mã trạng thái: `HTTP 401 Unauthorized`.
  - Header `content-type` là `application/problem+json`.
  - Backend từ chối ngay lập tức ở tầng Guard trước khi chạm vào Controller/Database.

---

### `TC-AUTH-04: Full Logout & Session Termination`
- **Mục tiêu:** Kiểm tra việc vô hiệu hóa phiên làm việc khi người dùng đăng xuất.
- **Thao tác thực hiện:**
  1. Đăng nhập lấy $RT_1$.
  2. Gọi `POST /auth/logout` với body `{ refreshToken: RT_1 }`.
     - **Kỳ vọng:** Nhận `HTTP 200 OK`, `{ success: true, data: null }`.
  3. Gọi lại `POST /auth/refresh` với $RT_1$ vừa đăng xuất.
     - **Kỳ vọng:** Nhận `HTTP 401 Unauthorized` (do token đã bị xóa khỏi bảng `refresh_tokens`).

---

## 3. Câu Hỏi Cốt Lõi & Kịch Bản Thất Bại Cần Kiểm Chứng (Failure Modes)

1. **Tại sao backend lưu `tokenHash = sha256(refreshToken)` thay vì lưu chuỗi thô (Plaintext)?** Nếu database bị rò rỉ (SQL Injection / Dump), việc băm SHA-256 bảo vệ người dùng như thế nào?
2. **Cơ chế Single-Use RTR giải quyết bài toán gì so với Refresh Token cố định?** Khi một thiết bị di động bị đánh cắp gói tin refresh token, cơ chế xoay vòng phát hiện sự bất thường ra sao?
3. **Sự khác biệt giữa `POST /auth/logout` (đăng xuất 1 thiết bị) và `POST /auth/logout-all` (đăng xuất mọi thiết bị)?**

---

## 4. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Chuẩn Xác Thực & RFCs:**
   - [IETF RFC 7519 - JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
   - [IETF RFC 6749 - The OAuth 2.0 Authorization Framework (Section 6: Refreshing an Access Token)](https://datatracker.ietf.org/doc/html/rfc6749#section-6)
   - [OWASP JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
2. **Tài Liệu Playwright API Testing:**
   - [Playwright API Testing Official Guide](https://playwright.dev/docs/api-testing)

---

## 5. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo (`67_Bao_cao.docx` / `67_Bao_cao.tex` - Mục 3.2.1 Chương 3)
Người phụ trách soạn thảo theo khung 5 phần học thuật:
1. **Mục tiêu & Cơ chế kỹ thuật:** Phân tích mô hình Dual-Token JWT kết hợp Single-Use RTR và cơ chế lưu `tokenHash` trong PostgreSQL.
2. **Đặc tả kịch bản & Dữ liệu kiểm thử:** Bảng thông số chi tiết cho 4 ca test (`TC-AUTH-01` $\to$ `TC-AUTH-04`) với các endpoints `/auth/login`, `/auth/refresh`, `/auth/logout`.
3. **Trích đoạn mã nguồn then chốt:** Trích dẫn 15 - 25 dòng code xử lý kiểm tra xoay vòng token và giải mã payload JWT Base64.
4. **Bằng chứng thực nghiệm & Phân tích log:** Ảnh chụp terminal chạy pass $100\%$, log JSON phản hồi giải mã JWT payload và response 401 khi phát lại token cũ.
5. **Đánh giá rủi ro & Bài học kỹ thuật:** Phân tích rủi ro Replay Attack, rủi ro lộ token và tầm quan trọng của cơ chế Family Revocation.

---

## 6. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Mã Nguồn Kiểm Thử & Chạy Pass ($100\%$):**
  - [ ] Tạo file `tests/api/auth.spec.ts` và `fixtures/api.fixture.ts`.
  - [ ] Chạy lệnh `bunx playwright test tests/api/auth.spec.ts --project=api` pass $100\%$ cả 4 kịch bản.
  - [ ] Giải mã trực tiếp payload JWT bằng Node.js Buffer native, không cài đặt thêm thư viện ngoài.
- [ ] **Bằng Chứng Git & Pull Request:**
  - [ ] Tạo nhánh `feat/wbs-2.1-api-auth-lifecycle`.
  - [ ] Tạo Pull Request trên GitHub với mô tả chi tiết, log JSON và ảnh test pass.
- [ ] **Chất Lượng Học Thuật Trong Báo Cáo:**
  - [ ] Hoàn thành đầy đủ 5 phần cho Mục 3.2.1 trong Báo cáo đồ án.
