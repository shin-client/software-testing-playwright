# WBS 2.4: API Test Suite - RFC 9457 Problem Details and Rate Limiting

## Metadata

- **WBS Code:** `2.4`
- **Task Name:** API Ca 4: RFC 9457 Problem Details Schema Validation & Rate Limiting
- **Assignee:** Nguyễn Hoài Linh (MSSV: 0306241126)
- **Task Weight:** `7.5%`
- **Deliverable Artifacts:** File mã nguồn `tests/api/rfc9457_throttling.spec.ts`, `schemas/rfc9457.schema.ts`, Pull Request GitHub, Mục 3.2.4 Chương 3 trong `67_Bao_cao.docx` / `67_Bao_cao.tex`.

## TL;DR

- **Bản chất:** Đặc tả nhiệm vụ hiện thực bộ kiểm thử tự động API Ca 4: Kiểm định hợp đồng cấu trúc dữ liệu lỗi chuẩn quốc tế RFC 9457 bằng Zod Schema và kiểm thử bộ điều tiết lưu lượng bảo vệ hệ thống (Rate Limiting Throttler) trên hệ thống `ticket-booking`.
- **Mục đích:** Ngăn ngừa hiện tượng Contract Drift giữa Backend và Frontend khi có lỗi xảy ra (4xx/5xx), đồng thời kiểm chứng cơ chế tự bảo vệ của API trước tấn công Brute-force mật khẩu.
- **Điểm mấu chốt:** Xác thực $100\%$ response lỗi trả về định dạng `application/problem+json` với đầy đủ 7 trường chuẩn (`type`, `title`, `status`, `detail`, `instance`, `invalidParams`, `timestamp`) và kích hoạt chính xác mã lỗi `HTTP 429 Too Many Requests` khi vượt hạn mức 5 requests/phút của Auth Throttler.

---

## 1. Mục Tiêu & Bối Cảnh Nghiệp Vụ (Business & Technical Context)

- **Bối cảnh hệ thống `ticket-booking` (NestJS Backend):**
  1. **Chuẩn Hóa Lỗi Toàn Cục (Global Exception Filter):**
     - Hệ thống triển khai `GlobalExceptionFilter` bắt toàn bộ ngoại lệ (`HttpException`, DTO Validation Errors, Database Errors, Unhandled Errors).
     - Toàn bộ phản hồi lỗi 4xx/5xx được chuẩn hóa theo chuẩn quốc tế **RFC 9457 (Problem Details for HTTP APIs)** với `Content-Type: application/problem+json; charset=utf-8`.
     - Cấu trúc JSON bắt buộc gồm 7 trường:
       - `type`: URL định danh lỗi (ví dụ: `https://ticket-booking-amqv.onrender.com/errors/bad-request`).
       - `title`: Tên ngắn gọn của lỗi (ví dụ: `Bad Request`, `Too Many Requests`, `Not Found`).
       - `status`: Mã trạng thái HTTP dạng số nguyên (400, 404, 429).
       - `detail`: Mô tả chi tiết nguyên nhân lỗi hoặc thông báo bản địa hóa đa ngôn ngữ (i18n).
       - `instance`: Đường dẫn API gây ra lỗi (ví dụ: `/auth/register`, `/auth/login`).
       - `invalidParams`: Mảng các đối tượng chứa `{ name: string, reason: string }` khi xảy ra lỗi validation DTO.
       - `timestamp`: Chuỗi thời gian chuẩn ISO-8601 UTC.
  2. **Bộ Điều Tiết Lưu Lượng (Custom Throttler Guard):**
     - Hệ thống sử dụng `@nestjs/throttler` kết hợp Redis Storage để bảo vệ các tuyến đường nhạy cảm (`@UseGuards(CustomThrottlerGuard)` trên `AuthController`).
     - Cấu hình hạn mức trên môi trường Production:
       - Throttler `auth`: Hạn mức tối đa **$5\text{ requests} / 60\text{s}$ (1 phút)** cho endpoint `/auth/login`.
       - Throttler `default`: Hạn mức tối đa **$100\text{ requests} / 60\text{s}$**.
     - Khi client gửi từ request thứ 6 trở đi trong vòng 60 giây, hệ thống trả về mã lỗi `HTTP 429 Too Many Requests` kèm theo các headers điều tiết: `retry-after-auth` (hoặc `retry-after`), `x-ratelimit-limit-auth: 5`, `x-ratelimit-remaining-auth: 0`, `x-ratelimit-reset-auth`.

---

## 2. Các Yêu Cầu Thiết Kế Ca Kiểm Thử (Test Design Specifications)

Người phụ trách cần thiết kế và hiện thực tối thiểu **3 kịch bản kiểm thử độc lập** trong `tests/api/rfc9457_throttling.spec.ts` và định nghĩa schema tại `schemas/rfc9457.schema.ts`:

### `TC-RFC-01: Zod Schema Contract Validation for 400 Bad Request & 404 Not Found`
- **Mục tiêu:** Xác thực hợp đồng dữ liệu chuẩn RFC 9457 trên các mã lỗi nghiệp vụ thông thường.
- **Kịch bản 1.1 (400 DTO Validation Error):**
  - **Endpoint:** `POST /auth/register`
  - **Payload lỗi:** Gửi body thiếu các trường bắt buộc (`fullName`, `password`, `phoneNumber`, `agreeTerms`): `{ email: "invalid-email-format" }`.
  - **Kỳ vọng & Invariants:**
    - Mã trạng thái: `HTTP 400 Bad Request`.
    - Header `content-type` chứa `application/problem+json`.
    - Dữ liệu JSON phản hồi parse thành công $100\%$ qua `ProblemDetailsSchema.safeParse(body)` với `success: true`.
    - Mảng `invalidParams` có độ dài $\ge 1$, chứa đúng tên các trường bị lỗi (`email`, `fullName`, `password`...).
- **Kịch bản 1.2 (404 Resource Not Found):**
  - **Endpoint:** `GET /api/v1/non-existent-endpoint-path`
  - **Kỳ vọng:** Mã trạng thái `HTTP 404 Not Found`, header `content-type` là `application/problem+json`, `ProblemDetailsSchema.safeParse()` trả về `success: true`, và `invalidParams` là mảng rỗng `[]`.

---

### `TC-THROTTLE-02: Auth Brute-Force Rate Limiting & HTTP 429 Validation`
- **Mục tiêu:** Kích hoạt cơ chế chặn bão request trên endpoint nhạy cảm `/auth/login` (Hạn mức: $5\text{ requests} / 60\text{s}$).
- **Thao tác thực hiện:**
  1. Gửi liên tiếp $N = 7$ requests `POST /auth/login` với thông tin sai (`{ email: "brute_force_test@example.com", password: "wrong_password" }`).
- **Kỳ vọng & Invariants:**
  - Các requests đầu tiên ($1 \to 5$): Nhận mã trạng thái `400` hoặc `401` kèm header `x-ratelimit-remaining-auth` giảm dần từ $4 \to 0$.
  - Từ request thứ $6$ trở đi: Nhận chính xác mã trạng thái `HTTP 429 Too Many Requests`.
  - Headers phản hồi chứa:
    - `content-type` là `application/problem+json`.
    - Tiêu đề kiểm soát thời gian: `retry-after-auth` (hoặc `retry-after`) là một số nguyên dương $> 0$.
    - Tiêu đề hạn mức: `x-ratelimit-remaining-auth` bằng `0`.
  - Nội dung body của response 429 parse thành công qua `ProblemDetailsSchema` với `status: 429`, `title: "Too Many Requests"`.

---

### `TC-THROTTLE-03: Rate Limit Cooldown & Normal Request Recovery`
- **Mục tiêu:** Kiểm tra cơ chế tự động mở lại quyền truy cập sau khi hết thời gian phong tỏa.
- **Thao tác thực hiện:**
  1. Đọc giá trị số giây từ header `retry-after-auth` (hoặc `retry-after`) của response 429.
  2. Nếu thời gian chờ trong ngưỡng cho phép ($\le 5\text{s}$), dùng hàm `new Promise(resolve => setTimeout(resolve, waitMs))` để chờ cooldown.
  3. Gửi lại 1 request `POST /auth/login`.
- **Kỳ vọng:** Request sau khi cooldown không còn bị chặn mã `429`, mà quay lại nhận phản hồi nghiệp vụ thông thường (`400/401` do sai pass hoặc `200` nếu đúng credentials), chứng minh hệ thống tự động giải phóng hạn ngạch.

---

## 3. Cấu Trúc Khung Zod Schema Bắt Buộc (`schemas/rfc9457.schema.ts`)

Schema phải khớp chính xác với DTO của Backend NestJS (`GlobalExceptionFilter.ts`):

```typescript
import { z } from 'zod';

export const InvalidParamSchema = z.object({
  name: z.string(),
  reason: z.string(),
});

export const ProblemDetailsSchema = z.object({
  // URI định danh loại lỗi (bắt buộc theo chuẩn RFC 9457)
  type: z.string().url(),
  // Tiêu đề ngắn gọn của loại lỗi
  title: z.string().min(1),
  // Mã trạng thái HTTP (400 <= status <= 599)
  status: z.number().int().min(400).max(599),
  // Chi tiết lỗi
  detail: z.string().min(1),
  // Endpoint/URI phát sinh lỗi
  instance: z.string().min(1),
  // Danh sách các tham số không hợp lệ (mảng các object { name, reason })
  invalidParams: z.array(InvalidParamSchema),
  // Thời gian phát sinh lỗi theo chuẩn ISO-8601 UTC
  timestamp: z.string().datetime(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;
```

---

## 4. Câu Hỏi Cốt Lõi Cần Trả Lời & Kịch Bản Thất Bại (Failure Modes)

1. **Vấn đề Contract Drift:** Nếu Backend thay đổi cấu trúc trả về lỗi mà không có Zod Schema kiểm định, bài test chỉ kiểm tra `expect(response.status()).toBe(400)` sẽ dẫn đến rủi ro gì cho ứng dụng Frontend/Mobile?
2. **Cơ chế Fail-Open trong Throttler:** Tại sao trong `throttler.guard.ts`, khi Redis lưu trữ rate limit bị mất kết nối hoặc timeout $> 2\text{s}$, hệ thống lại chọn chiến lược "Fail-Open" (cho request đi qua) thay vì "Fail-Closed"?
3. **Ý nghĩa tiêu đề `Retry-After`:** Làm thế nào Client/Frontend có thể tận dụng tiêu đề `retry-after-auth` để thiết lập thuật toán Exponential Backoff tự động gửi lại request?

---

## 5. Tài Liệu Nghiên Cứu Bắt Buộc (Primary Official Sources)

1. **Chuẩn Giao Thức Quốc Tế:**
   - [IETF RFC 9457 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc9457)
   - [IETF RFC 6585 - Additional HTTP Status Codes (Section 4: 429 Too Many Requests)](https://datatracker.ietf.org/doc/html/rfc6585#section-4)
2. **Thư Viện Schema & Rate Limiting:**
   - [Zod TypeScript-First Schema Validation Documentation](https://zod.dev/)
   - [NestJS Throttler Official Documentation](https://docs.nestjs.com/security/rate-limiting)

---

## 6. Cấu Trúc Báo Cáo & Yêu Cầu Đầu Ra (Required Deliverables)

### Báo Cáo (`67_Bao_cao.docx` / `67_Bao_cao.tex` - Mục 3.2.4 Chương 3)
Người phụ trách soạn thảo theo khung 5 phần học thuật:
1. **Mục tiêu & Cơ chế kỹ thuật:** Phân tích chuẩn hóa lỗi RFC 9457, cơ chế `GlobalExceptionFilter` và nguyên lý hoạt động của `CustomThrottlerGuard` với Redis.
2. **Đặc tả kịch bản & Dữ liệu kiểm thử:** Bảng thông số chi tiết cho 3 ca test (`TC-RFC-01`, `TC-THROTTLE-02`, `TC-THROTTLE-03`) với các endpoint `/auth/register`, `/auth/login`, `/api/v1/invalid-route`.
3. **Trích đoạn mã nguồn then chốt:** Trích dẫn 15 - 25 dòng code định nghĩa `ProblemDetailsSchema` bằng Zod và logic kiểm tra `safeParse()`.
4. **Bằng chứng thực nghiệm & Phân tích log:** Ảnh chụp màn hình terminal chạy pass $100\%$ cả 3 ca test, log JSON response RFC 9457 thực tế từ server.
5. **Đánh giá rủi ro & Bài học kỹ thuật:** Phân tích rủi ro tấn công từ chối dịch vụ (DoS), brute-force credential và giải pháp phòng vệ bằng Rate Limiting.

---

## 7. Tiêu Chí Nghiệm Thu & Bằng Chứng Bàn Giao (Definition of Done)

- [ ] **Mã Nguồn Kiểm Thử & Chạy Pass ($100\%$):**
  - [ ] Tạo file `schemas/rfc9457.schema.ts` (khớp $100\%$ cấu trúc `invalidParams` và `timestamp`).
  - [ ] Tạo file `tests/api/rfc9457_throttling.spec.ts` với đầy đủ 3 ca test (`TC-RFC-01`, `TC-THROTTLE-02`, `TC-THROTTLE-03`).
  - [ ] Chạy lệnh `bunx playwright test tests/api/rfc9457_throttling.spec.ts --project=api` pass $100\%$ ổn định (không flaky).
  - [ ] Sử dụng `bun add zod` và không commit `package-lock.json`.
- [ ] **Bằng Chứng Git & Pull Request:**
  - [ ] Cập nhật Pull Request #2 trên GitHub với mô tả chi tiết, log JSON RFC 9457 và ảnh test pass 3 test cases.
- [ ] **Chất Lượng Học Thuật Trong Báo Cáo:**
  - [ ] Hoàn thành đầy đủ 5 phần cho Mục 3.2.4 trong Báo cáo đồ án.
