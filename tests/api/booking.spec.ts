import { expect, test } from "../../fixtures/api.fixture.js";
import { ProblemDetailsSchema } from "../../schemas/rfc9457.schema.js";
import crypto from "node:crypto";
import type { APIRequestContext, APIResponse } from "@playwright/test";

/**
 * WBS 2.3: API Booking Transaction, Payment Confirmation & Idempotency Verification
 * Assignee: Đặng Duy Lam (MSSV: 0306241125)
 *
 * System Invariants:
 *  1. Idempotency Invariant: f(f(x)) = f(x). Repeated calls with same idempotency-key yield identical responses.
 *  2. Zero Duplicate Payments: Duplicate confirm requests must never create secondary payment records.
 *  3. Header Enforcement: Missing 'idempotency-key' triggers RFC 9457 compliant 400 Bad Request.
 */

const TARGET_SHOW_ID = "019fa8bc-8f4d-7000-b366-e691f45cfb8f";
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

/**
 * Helper: Tạo đơn giữ chỗ ghế hợp lệ kèm xử lý Rate Limit (429) và ghế bận (409)
 */
async function createPendingReservation(
  authRequest: APIRequestContext,
): Promise<{
  bookingId: string;
  totalPrice: number;
}> {
  for (const seatId of SEAT_POOL) {
    let res = await authRequest.post("/bookings/reserve", {
      headers: {
        "idempotency-key": crypto.randomUUID(),
      },
      data: {
        showId: TARGET_SHOW_ID,
        seatIds: [seatId],
      },
    });

    if (res.status() === 429) {
      const retryAfter = res.headers()["retry-after"];
      const waitMs = (parseInt(retryAfter || "10", 10) + 1) * 1000;
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, Math.min(waitMs, 15000));
      await promise;

      res = await authRequest.post("/bookings/reserve", {
        headers: {
          "idempotency-key": crypto.randomUUID(),
        },
        data: {
          showId: TARGET_SHOW_ID,
          seatIds: [seatId],
        },
      });
    }

    if (res.status() === 201) {
      const body = await res.json();
      return {
        bookingId: body.data.bookingId || body.data.id,
        totalPrice: body.data.totalPrice || 100000,
      };
    }
  }
  throw new Error("Không tìm thấy ghế trống nào khả dụng để tạo booking!");
}

test.describe("WBS 2.3: Booking Transaction & Idempotency Verification Suite", () => {
  test.describe.configure({
    mode: "serial",
    timeout: 60000,
  });

  let sharedBookingId = "";
  let sharedTotalPrice = 100000;
  let sharedIdempotencyKey = "";
  let initialConfirmationData: {
    bookingId?: string;
    paymentId?: string;
    transactionId?: string;
    status?: string;
    confirmedAt?: string;
  } = {};

  test("TC-IDEMP-01: First Execution - Happy Path Booking Confirmation", async ({
    authRequest,
  }) => {
    // 1. Tạo đơn giữ chỗ ghế thành công
    const reservation = await createPendingReservation(authRequest);
    sharedBookingId = reservation.bookingId;
    sharedTotalPrice = reservation.totalPrice;
    sharedIdempotencyKey = crypto.randomUUID();

    // 2. Gửi request xác nhận thanh toán lần đầu
    const confirmRes = await authRequest.post("/bookings/confirm", {
      headers: {
        "idempotency-key": sharedIdempotencyKey,
      },
      data: {
        bookingId: sharedBookingId,
        orderCode: Math.floor(100000 + Math.random() * 900000),
        paymentMethod: "PAYOS",
        transactionId: `PAYOS-TX-${Date.now()}`,
        amount: sharedTotalPrice,
      },
    });

    expect(confirmRes.status()).toBe(200);
    const body = await confirmRes.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("paymentId");
    expect(body.data.status).toBe("confirmed");
    expect(body.data.bookingId).toBe(sharedBookingId);

    // Lưu lại kết quả phản hồi lần đầu để đối chiếu
    initialConfirmationData = body.data;
  });

  test("TC-IDEMP-02: Duplicate Request with Identical Idempotency Key (Network Retry Simulation)", async ({
    authRequest,
  }) => {
    expect(sharedBookingId).not.toBe("");
    expect(sharedIdempotencyKey).not.toBe("");

    // Gửi lại CHÍNH XÁC request xác nhận với cùng Idempotency Key
    const retryRes = await authRequest.post("/bookings/confirm", {
      headers: {
        "idempotency-key": sharedIdempotencyKey,
      },
      data: {
        bookingId: sharedBookingId,
        orderCode: 123456,
        paymentMethod: "PAYOS",
        transactionId: `PAYOS-TX-RETRY`,
        amount: sharedTotalPrice,
      },
    });

    expect(retryRes.status()).toBe(200);
    const retryBody = await retryRes.json();
    expect(retryBody.success).toBe(true);

    // Invariant: Kết quả từ Cache Redis phải giống hệt 100% so với lần 1
    expect(retryBody.data.paymentId).toBe(initialConfirmationData.paymentId);
    expect(retryBody.data.bookingId).toBe(initialConfirmationData.bookingId);
    expect(retryBody.data.status).toBe(initialConfirmationData.status);
    expect(retryBody.data.confirmedAt).toBe(
      initialConfirmationData.confirmedAt,
    );
  });

  test("TC-IDEMP-03: Missing Mandatory Idempotency Key Header Validation", async ({
    authRequest,
  }) => {
    // Cố tình gửi request xác nhận không kèm header 'idempotency-key'
    const invalidRes = await authRequest.post("/bookings/confirm", {
      data: {
        bookingId: crypto.randomUUID(),
        orderCode: 999999,
        paymentMethod: "PAYOS",
        transactionId: "PAYOS-MISSING-HEADER",
        amount: 100000,
      },
    });

    // Invariant: Bắt buộc nhận 400 Bad Request theo chuẩn RFC 9457
    expect(invalidRes.status()).toBe(400);
    expect(invalidRes.headers()["content-type"]).toContain(
      "application/problem+json",
    );

    const errorBody = await invalidRes.json();
    const parsed = ProblemDetailsSchema.safeParse(errorBody);
    expect(parsed.success).toBe(true);
    expect(errorBody.status).toBe(400);
  });

  test("TC-IDEMP-04: Concurrent Sockets Flooding on Same Idempotency Key (Double Click Attack)", async ({
    authRequest,
  }) => {
    const reservation = await createPendingReservation(authRequest);
    const singleKey = crypto.randomUUID();
    const commonPayload = {
      bookingId: reservation.bookingId,
      orderCode: Math.floor(100000 + Math.random() * 900000),
      paymentMethod: "PAYOS",
      transactionId: `PAYOS-DOUBLECLICK-${Date.now()}`,
      amount: reservation.totalPrice,
    };

    // Bắn đồng thời 5 requests cùng lúc mang chung 1 Idempotency Key
    const floodPromises = Array.from({ length: 5 }, () =>
      authRequest.post("/bookings/confirm", {
        headers: {
          "idempotency-key": singleKey,
        },
        data: commonPayload,
      }),
    );

    const responses: APIResponse[] = await Promise.all(floodPromises);

    // Assert: Tất cả các request đều phải nhận 200 OK
    for (const res of responses) {
      expect(res.status()).toBe(200);
    }

    // Assert: Tất cả các response phải trả về cùng 1 paymentId duy nhất
    const responseBodies = await Promise.all(responses.map((r) => r.json()));
    const firstPaymentId = responseBodies[0].data.paymentId;

    for (const body of responseBodies) {
      expect(body.data.paymentId).toBe(firstPaymentId);
      expect(body.data.status).toBe("confirmed");
    }
  });
});
