import { expect, test } from "@playwright/test";

/**
 * WBS 2.1: API Test Suite - Auth Lifecycle and Single-Use Token Rotation
 * Assignee: Nguyễn Quốc Đương (MSSV: 0306241102)
 *
 * System Invariants:
 *  1. Dual-Token Architecture: Access Token (JWT 15m) + Refresh Token (Hex 7d).
 *  2. Single-Use Refresh Token Rotation (RTR): Every refresh call invalidates the old RT.
 *  3. Replay Attack Prevention: Attempting to reuse an invalidated RT must trigger 401 Unauthorized.
 */

// Utility: Giải mã JWT Payload (Base64Url) không cần thư viện ngoài
function parseJwtPayload(token: string): Record<string, unknown> {
  const base64Url = token.split(".")[1];
  if (!base64Url) throw new Error("Format JWT không hợp lệ!");
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
  return JSON.parse(jsonPayload) as Record<string, unknown>;
}

test.describe("WBS 2.1: Auth Lifecycle & Token Rotation API Tests", () => {
  test.describe.configure({
    mode: "serial",
    timeout: 60000, // Timeout 60s phòng ngừa Cold-start từ Render backend
  });

  const pwd = "Password123!";
  const testUser = {
    email: `duong_wbs21_${Date.now()}@example.com`,
    password: pwd,
    confirmPassword: pwd,
    fullName: "Nguyễn Quốc Đương",
    phoneNumber: "0901234567",
    agreeTerms: true,
  };

  // Seeded User sẵn có trong DB không cần verify email
  const seededUser = {
    email: "user1@test.com",
    password: "Password123!",
  };

  let currentAccessToken = "";
  let currentRefreshToken = "";

  test("TC-AUTH-01: Đăng ký tài khoản mới hợp chuẩn DTO (Register DTO Validation)", async ({
    request,
  }) => {
    const regRes = await request.post("/auth/register", {
      data: testUser,
    });

    expect([200, 201]).toContain(regRes.status());
    const regBody = await regRes.json();
    expect(regBody.success).toBe(true);
  });

  test("TC-AUTH-02: Đăng nhập Seeded User, nhận cặp Token & Giải mã JWT Payload", async ({
    request,
  }) => {
    // Đăng nhập tài khoản seeded user1@test.com
    const loginRes = await request.post("/auth/login", {
      data: seededUser,
    });

    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.data).toHaveProperty("accessToken");
    expect(loginBody.data).toHaveProperty("refreshToken");

    currentAccessToken = loginBody.data.accessToken;
    currentRefreshToken = loginBody.data.refreshToken;

    // Decode JWT Access Token và verify các Claims cơ bản
    const jwtClaims = parseJwtPayload(currentAccessToken);
    expect(jwtClaims).toHaveProperty("sub");
    expect(jwtClaims).toHaveProperty("exp");
    expect(jwtClaims.email).toBe(seededUser.email);
  });

  test("TC-AUTH-03: Single-Use Refresh Token Rotation (RTR) & Chặn Replay Attack", async ({
    request,
  }) => {
    expect(currentRefreshToken).not.toBe("");
    const initialRT = currentRefreshToken;

    // 1. Gửi request xoay vòng Refresh Token lần 1
    const refreshRes = await request.post("/auth/refresh", {
      data: { refreshToken: initialRT },
    });

    expect(refreshRes.status()).toBe(200);
    const refreshBody = await refreshRes.json();
    expect(refreshBody.success).toBe(true);

    const rotatedAT = refreshBody.data.accessToken;
    const rotatedRT = refreshBody.data.refreshToken;

    // Invariant: Refresh token mới phải khác Refresh token cũ (Token Rotation)
    expect(rotatedRT).not.toBe(initialRT);
    expect(typeof rotatedAT).toBe("string");

    // Cập nhật token cho các bước tiếp theo
    currentAccessToken = rotatedAT;
    currentRefreshToken = rotatedRT;

    // 2. REPLAY ATTACK: Cố tình gửi lại initialRT cũ đã bị hủy
    const replayRes = await request.post("/auth/refresh", {
      data: { refreshToken: initialRT },
    });

    // Invariant: Phải nhận 401 Unauthorized do token cũ đã bị thu hồi khỏi DB
    expect(replayRes.status()).toBe(401);
  });

  test("TC-AUTH-04: Đăng xuất tài khoản (Logout) & Thu hồi Refresh Token", async ({
    request,
  }) => {
    expect(currentAccessToken).not.toBe("");

    // 1. Gọi POST /auth/logout truyền Refresh Token hiện tại
    const logoutRes = await request.post("/auth/logout", {
      headers: {
        Authorization: `Bearer ${currentAccessToken}`,
      },
      data: { refreshToken: currentRefreshToken },
    });

    expect([200, 204]).toContain(logoutRes.status());

    // 2. Thử dùng lại Refresh Token vừa đăng xuất -> Phải bị chặn với 401 Unauthorized
    const postLogoutRes = await request.post("/auth/refresh", {
      data: { refreshToken: currentRefreshToken },
    });

    expect(postLogoutRes.status()).toBe(401);
  });

  test("TC-AUTH-05: Đăng nhập thất bại khi dùng sai Mật khẩu (401 Unauthorized)", async ({
    request,
  }) => {
    const invalidRes = await request.post("/auth/login", {
      data: {
        email: seededUser.email,
        password: "WrongPassword999!",
      },
    });

    expect([401, 400]).toContain(invalidRes.status());
  });
});
