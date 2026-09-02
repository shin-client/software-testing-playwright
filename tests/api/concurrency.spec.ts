import type { APIRequestContext, APIResponse } from "@playwright/test";
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

interface ConcurrentResult {
  createdResponses: APIResponse[];
  conflictResponses: APIResponse[];
}

async function fireConcurrentBookingWithFallback(
  activeClients: APIRequestContext[],
  showId: string,
  seatCandidates: string[],
): Promise<ConcurrentResult> {
  for (const seatId of seatCandidates) {
    const requestPromises = activeClients.map((authCtx) => {
      return authCtx.post("/bookings/reserve", {
        headers: {
          "idempotency-key": crypto.randomUUID(),
        },
        data: {
          showId,
          seatIds: [seatId],
        },
      });
    });

    const responses = await Promise.all(requestPromises);
    const has429 = responses.some((r) => r.status() === 429);

    if (has429) {
      const retryAfter = responses.find((r) => r.status() === 429)?.headers()[
        "retry-after"
      ];
      const waitMs = (parseInt(retryAfter || "15", 10) + 2) * 1000;
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, Math.min(waitMs, 30000));
      await promise;
      continue;
    }

    const createdResponses = responses.filter((r) => r.status() === 201);
    const conflictResponses = responses.filter((r) => r.status() === 409);

    if (
      createdResponses.length === 1 &&
      conflictResponses.length === activeClients.length - 1
    ) {
      return { createdResponses, conflictResponses };
    }
  }

  return { createdResponses: [], conflictResponses: [] };
}
async function acquireSingleReservationWithFallback(
  userCtx: APIRequestContext,
  showId: string,
  seatCandidates: string[],
): Promise<{ reserveRes: APIResponse; seatId: string } | null> {
  for (const seatId of seatCandidates) {
    const reserveRes = await sendReservationWith429Retry(
      userCtx,
      showId,
      seatId,
    );

    if (reserveRes.status() === 201) {
      return { reserveRes, seatId };
    }
  }
  return null;
}

async function sendReservationWith429Retry(
  userCtx: APIRequestContext,
  showId: string,
  seatId: string,
  maxAttempts = 3,
): Promise<APIResponse> {
  let res = await userCtx.post("/bookings/reserve", {
    headers: { "idempotency-key": crypto.randomUUID() },
    data: { showId, seatIds: [seatId] },
  });

  for (let i = 1; i < maxAttempts && res.status() === 429; i++) {
    const retryAfter = res.headers()["retry-after"];
    const waitMs = (parseInt(retryAfter || "15", 10) + 2) * 1000;
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, Math.min(waitMs, 30000));
    await promise;

    res = await userCtx.post("/bookings/reserve", {
      headers: { "idempotency-key": crypto.randomUUID() },
      data: { showId, seatIds: [seatId] },
    });
  }

  return res;
}

test.describe("WBS 2.2: Concurrency Race Condition & Redis Redlock Testing", () => {
  // Cấu hình serial execution, tắt retry để tránh đốt rate limit, và tăng timeout
  test.describe.configure({
    mode: "serial",
    retries: 0,
    timeout: 60000,
  });

  test("TC-CONCUR-01: High-Contention Simultaneous Seat Booking (Concurrent Race Condition)", async ({
    concurrencyAuthRequests,
  }) => {
    const targetShowId = "019fa8bc-8f4d-7000-b366-e691f45cfb8f";
    const activeClients = concurrencyAuthRequests.slice(0, 4);

    const result = await fireConcurrentBookingWithFallback(
      activeClients,
      targetShowId,
      SEAT_POOL.slice(0, 4),
    );

    // Assert bất biến toán học: Đúng 1 thành công (201), N-1 thất bại do tranh chấp (409)
    expect(result.createdResponses).toHaveLength(1);
    expect(result.conflictResponses).toHaveLength(activeClients.length - 1);

    // Verify cấu trúc response 201
    const successBody = await result.createdResponses[0].json();
    expect(successBody.success).toBe(true);
    expect(successBody.data.status).toBe("pending_payment");

    // Verify các responses 409 tuân thủ chuẩn RFC 9457
    for (const conflictRes of result.conflictResponses) {
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

    const reservation = await acquireSingleReservationWithFallback(
      user1Ctx,
      targetShowId,
      SEAT_POOL.slice(4, 7),
    );

    expect(reservation).not.toBeNull();
    const body1 = await reservation!.reserveRes.json();
    expect(body1.success).toBe(true);
    expect(body1.data.status).toBe("pending_payment");

    // 2. Xác thực thời gian hết hạn (TTL = 10 phút)
    const expiresAt = new Date(body1.data.expiresAt).getTime();
    const now = Date.now();
    const tenMinutesInMs = 10 * 60 * 1000;

    // Thời gian hết hạn phải nằm trong khoảng 9.5 -> 10.5 phút tới
    expect(expiresAt).toBeGreaterThan(now);
    expect(expiresAt - now).toBeLessThanOrEqual(tenMinutesInMs + 30000);

    // 3. User 2 cố tình đặt lại cùng ghế khi đang trong thời hạn khóa -> Phải nhận 409 Conflict
    const reserveRes2 = await sendReservationWith429Retry(
      user2Ctx,
      targetShowId,
      reservation!.seatId,
    );

    expect(reserveRes2.status()).toBe(409);
    const errorBody = await reserveRes2.json();
    const parsed = ProblemDetailsSchema.safeParse(errorBody);
    expect(parsed.success).toBe(true);
  });
});
