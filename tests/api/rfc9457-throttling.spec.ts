import { test, expect } from "@playwright/test";
import { ProblemDetailsSchema } from "../../schemas/rfc9457.schema.js";

test.describe("WBS 2.4: RFC 9457 Problem Details & Rate Limiting Throttler", () => {
  // Tăng Timeout mặc định lên 60s để tránh lỗi Cold Start của Render Server
  test.describe.configure({
    mode: "serial",
    retries: 1,
    timeout: 60000,
  });

  test("TC-RFC-01: Zod Schema Contract Validation for 400 Bad Request & 404 Not Found", async ({
    request,
  }) => {
    // 1.1 Kiểm tra 400 Bad Request (Sai DTO Validation)
    const res400 = await request.post("/auth/register", {
      data: { email: "invalid-email-format" },
    });
    expect(res400.status()).toBe(400);
    expect(res400.headers()["content-type"]).toContain(
      "application/problem+json",
    );

    const body400 = await res400.json();
    const parse400 = ProblemDetailsSchema.safeParse(body400);
    expect(parse400.success).toBe(true);

    // 1.2 Kiểm tra 404 Not Found (Endpoint không tồn tại)
    const res404 = await request.get("/api/v1/non-existent-endpoint-12345");
    expect(res404.status()).toBe(404);
    expect(res404.headers()["content-type"]).toContain(
      "application/problem+json",
    );

    const body404 = await res404.json();
    const parse404 = ProblemDetailsSchema.safeParse(body404);
    expect(parse404.success).toBe(true);
  });

  test("TC-THROTTLE-02: Auth Brute-Force Rate Limiting & HTTP 429 Validation", async ({
    request,
  }) => {
    let lastResponse;

    // Bắn liên tiếp các request sai thông tin để kích hoạt Throttler Guard
    for (let i = 0; i < 6; i++) {
      lastResponse = await request.post("/auth/login", {
        data: {
          email: "brute_force_test@example.com",
          password: "wrong_password",
        },
      });
    }
    // Assert phải nhận đúng mã HTTP 429 Too Many Requests
    expect(lastResponse!.status()).toBe(429);

    const headers = lastResponse!.headers();
    expect(headers["content-type"]).toContain("application/problem+json");

    // Kiểm tra linh hoạt các dạng Header Rate Limit do Server trả về
    const remaining =
      headers["x-ratelimit-remaining-auth"] ?? headers["x-ratelimit-remaining"];
    const retryAfter = headers["retry-after"] ?? headers["retry-after-auth"];

    expect(remaining !== undefined || retryAfter !== undefined).toBe(true);

    // Assert Body khớp Schema RFC 9457
    const body429 = await lastResponse!.json();
    expect(body429.status).toBe(429);
    const parse429 = ProblemDetailsSchema.safeParse(body429);
    expect(parse429.success).toBe(true);
  });

  test("TC-THROTTLE-03: Rate Limit Cooldown & Normal Request Recovery", async ({
    request,
  }) => {
    // Tăng Timeout riêng cho test case này lên 120s để đủ thời gian Cooldown
    test.setTimeout(120000);

    // 1. Bắn request để ép rơi vào trạng thái 429
    let res;
    for (let i = 0; i < 6; i++) {
      res = await request.post("/auth/login", {
        data: {
          email: "cooldown_test@example.com",
          password: "wrong_password",
        },
      });
    }
    expect(res!.status()).toBe(429);

    // lấy cooldown từ header
    const headers = res!.headers();
    const retryAfterHeader =
      headers["retry-after-auth"] ?? headers["retry-after"] ?? 60;
    const waitSeconds = parseInt(retryAfterHeader, 10) || 60;

    // Chờ hết thời gian phạt cộng thêm 3s buffer bù trừ chênh lệch đồng hồ mạng
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, (waitSeconds + 3) * 1000);
    await promise;
    // xác nhận
    const recoveryRes = await request.post("/auth/login", {
      data: { email: "cooldown_test@example.com", password: "wrong_password" },
    });
    expect(recoveryRes.status()).not.toBe(429);
  });
});
