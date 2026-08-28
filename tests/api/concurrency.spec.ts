import { expect, test } from "@/fixtures/api.fixture.js";
import { ProblemDetailsSchema } from "../../schemas/rfc9457.schema.js";
import crypto from "node:crypto";

/**
 * WBS 2.2: API Concurrency & Redis Redlock Race Condition Test Suite
 * Assignee: Trần Văn Ngọc (MSSV: 0306241131)
 *
 * System Invariants:
 *  1. Zero Double-Booking: Exactly 1 user successfully reserves a contested seat (HTTP 201 Created).
 *  2. Fast Fail-Early: Exactly N - 1 users are rejected by Redis Redlock (HTTP 409 Conflict).
 *  3. RFC 9457 Compliance: All 409 error responses strictly adhere to the Problem Details schema.
 */
test.describe("WBS 2.2: Concurrency Race Condition & Redis Redlock Testing", () => {
  // Cấu hình serial execution, tắt retry để tránh đốt rate limit, và tăng timeout
  test.describe.configure({
    mode: "serial",
    retries: 0,
    timeout: 60000,
  });

  // Danh sách 10 ghế đã được seed trong DB (A1 -> A10)
  const SEAT_POOL = [
    "019fa8bc-8f4d-7000-b366-e691f45cfb51", // A1
    "019fa8bc-8f4d-7000-b366-e691f45cfb52", // A2
    "019fa8bc-8f4d-7000-b366-e691f45cfb53", // A3
    "019fa8bc-8f4d-7000-b366-e691f45cfb54", // A4
    "019fa8bc-8f4d-7000-b366-e691f45cfb55", // A5
    "019fa8bc-8f4d-7000-b366-e691f45cfb56", // A6
    "019fa8bc-8f4d-7000-b366-e691f45cfb57", // A7
    "019fa8bc-8f4d-7000-b366-e691f45cfb58", // A8
    "019fa8bc-8f4d-7000-b366-e691f45cfb59", // A9
    "019fa8bc-8f4d-7000-b366-e691f45cfb5a", // A10
  ];

  test("TC-CONCUR-01: High-Contention Simultaneous Seat Booking (Concurrent Race Condition)", async ({
    concurrencyAuthRequests,
  }) => {
    const targetShowId = "019fa8bc-8f4d-7000-b366-e691f45cfb8f";
    // Chọn ngẫu nhiên 1 ghế trong pool (A1 -> A8) để đảm bảo các lần chạy liên tiếp không bị đụng ghế cũ
    const randomIndex = Math.floor(Math.random() * 8);
    const targetSeatId = SEAT_POOL[randomIndex];

    // Gửi đồng thời N requests cùng tranh chấp 1 ghế duy nhất
    const requestPromises = concurrencyAuthRequests.map((authCtx) => {
      return authCtx.post("/bookings/reserve", {
        headers: {
          "idempotency-key": crypto.randomUUID(),
        },
        data: {
          showId: targetShowId,
          seatIds: [targetSeatId],
        },
      });
    });

    const responses = await Promise.all(requestPromises);

    // Assert Invariant: Đúng 1 Thành công (201), N-1 Thất bại (409)
    const createdResponses = responses.filter((r) => r.status() === 201);
    const conflictResponses = responses.filter((r) => r.status() === 409);

    // Assert bất biến toán học: Đúng 1 thành công (201), 3 thất bại do tranh chấp (409)
    expect(createdResponses).toHaveLength(1);
    expect(conflictResponses).toHaveLength(concurrencyAuthRequests.length - 1);

    // Verify cấu trúc response 201
    const successBody = await createdResponses[0].json();
    expect(successBody.success).toBe(true);
    expect(successBody.data.status).toBe("pending_payment");

    // Verify các responses 409 tuân thủ chuẩn RFC 9457
    for (const conflictRes of conflictResponses) {
      const errorBody = await conflictRes.json();
      const parsed = ProblemDetailsSchema.safeParse(errorBody);
      expect(parsed.success).toBe(true);
    }
  });

  test("TC-CONCUR-02: Lock Expiration & Resource Release (TTL Expiration Recovery)", async ({
    concurrencyAuthRequests,
  }) => {
    const user1Ctx = concurrencyAuthRequests[0];
    const user2Ctx = concurrencyAuthRequests[1];

    const targetShowId = "019fa8bc-8f4d-7000-b366-e691f45cfb8f";
    // Sử dụng ghế A9 hoặc A10 cho test case TTL
    const ttlSeatIndex = 8 + Math.floor(Math.random() * 2);
    const targetSeatId = SEAT_POOL[ttlSeatIndex];

    // 1. User 1 tiến hành giữ chỗ
    const reserveRes1 = await user1Ctx.post("/bookings/reserve", {
      headers: {
        "idempotency-key": crypto.randomUUID(),
      },
      data: {
        showId: targetShowId,
        seatIds: [targetSeatId],
      },
    });

    expect(reserveRes1.status()).toBe(201);
    const body1 = await reserveRes1.json();
    expect(body1.success).toBe(true);
    expect(body1.data.status).toBe("pending_payment");

    // 2. Xác thực thời gian hết hạn (TTL = 10 phút)
    const expiresAt = new Date(body1.data.expiresAt).getTime();
    const now = Date.now();
    const tenMinutesInMs = 10 * 60 * 1000;

    // Thời gian hết hạn phải nằm trong khoảng 9.5 -> 10.5 phút tới
    expect(expiresAt).toBeGreaterThan(now);
    expect(expiresAt - now).toBeLessThanOrEqual(tenMinutesInMs + 30000);

    // 3. User 2 cố tình đặt lại ghế A2 khi đang trong thời hạn khóa -> Phải nhận 409 Conflict
    const reserveRes2 = await user2Ctx.post("/bookings/reserve", {
      headers: {
        "idempotency-key": crypto.randomUUID(),
      },
      data: {
        showId: targetShowId,
        seatIds: [targetSeatId],
      },
    });

    expect(reserveRes2.status()).toBe(409);
    const errorBody = await reserveRes2.json();
    const parsed = ProblemDetailsSchema.safeParse(errorBody);
    expect(parsed.success).toBe(true);
  });
});
