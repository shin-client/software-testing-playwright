import type { APIRequestContext } from "@playwright/test";
import { test as base } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type ApiFixtures = {
  authRequest: APIRequestContext;
  concurrencyAuthRequests: APIRequestContext[];
};

interface StoredToken {
  email: string;
  userId?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

function isTokenValid(token?: string): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    );
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now() + 60000;
  } catch {
    return false;
  }
}

async function acquireToken(
  requestContext: APIRequestContext,
  email: string,
  existing?: StoredToken,
): Promise<StoredToken> {
  const password = "Password123!";

  // 1. Nếu token cũ còn hạn, tái sử dụng ngay lập tức
  if (existing?.accessToken && isTokenValid(existing.accessToken)) {
    return existing;
  }

  // 2. Nếu có refreshToken, refresh nhanh qua /auth/refresh (không bị dính 5 req/phút của /auth/login)
  if (existing?.refreshToken) {
    try {
      const refreshRes = await requestContext.post("/auth/refresh", {
        data: { refreshToken: existing.refreshToken },
      });
      if (refreshRes.status() === 200) {
        const body = await refreshRes.json();
        if (body?.data?.accessToken) {
          return {
            email,
            userId: existing.userId,
            accessToken: body.data.accessToken,
            refreshToken: body.data.refreshToken || existing.refreshToken,
            expiresAt: Date.now() + 14 * 60 * 1000,
          };
        }
      }
    } catch {
      // Fallback xuống login nếu refresh token bị thu hồi hoặc lỗi mạng
    }
  }

  // 3. Fallback: Đăng nhập mới qua /auth/login với backoff retry
  for (let attempt = 1; attempt <= 3; attempt++) {
    const loginRes = await requestContext.post("/auth/login", {
      data: { email, password },
    });
    const body = await loginRes.json();
    if (body?.data?.accessToken) {
      return {
        email,
        userId: body.data.user?.id || existing?.userId,
        accessToken: body.data.accessToken,
        refreshToken: body.data.refreshToken,
        expiresAt: Date.now() + 14 * 60 * 1000,
      };
    }
    if (loginRes.status() === 429 && attempt < 3) {
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, 4000 * attempt);
      await promise;
      continue;
    }
    throw new Error(
      `Login failed for ${email} with status ${loginRes.status()}: ${JSON.stringify(body)}`,
    );
  }

  throw new Error(`Failed to acquire valid token for ${email}`);
}

async function getTokensPool(
  requestContext: APIRequestContext,
  numUsers = 10,
): Promise<string[]> {
  const tokensFilePath = path.resolve(process.cwd(), "fixtures/auth-tokens.json");
  let storedTokens: StoredToken[] = [];

  try {
    if (fs.existsSync(tokensFilePath)) {
      storedTokens = JSON.parse(fs.readFileSync(tokensFilePath, "utf-8"));
    }
  } catch {
    storedTokens = [];
  }

  const updatedTokens: StoredToken[] = [];
  let hasChanges = false;

  for (let i = 0; i < numUsers; i++) {
    const email = `user${i + 1}@test.com`;
    const existing = storedTokens[i];
    const tokenObj = await acquireToken(requestContext, email, existing);
    updatedTokens.push(tokenObj);

    if (tokenObj.accessToken !== existing?.accessToken) {
      hasChanges = true;
    }
  }

  if (hasChanges || storedTokens.length < numUsers) {
    try {
      fs.writeFileSync(tokensFilePath, JSON.stringify(updatedTokens, null, 2));
    } catch {
      // Bỏ qua lỗi ghi file nếu môi trường Read-only
    }
  }

  return updatedTokens.map((t) => t.accessToken);
}

export const test = base.extend<ApiFixtures>({
  authRequest: async ({ playwright, baseURL }, use) => {
    const requestContext = await playwright.request.newContext({ baseURL });
    const tokens = await getTokensPool(requestContext, 1);

    const authContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${tokens[0]}`,
        "Content-Type": "application/json",
      },
    });

    await use(authContext);

    await authContext.dispose();
    await requestContext.dispose();
  },

  concurrencyAuthRequests: async ({ playwright, baseURL }, use) => {
    const requestContext = await playwright.request.newContext({ baseURL });
    const tokens = await getTokensPool(requestContext, 4);
    const authContexts = await Promise.all(
      tokens.map(async (token) => {
        return await playwright.request.newContext({
          baseURL,
          extraHTTPHeaders: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }),
    );

    await use(authContexts);

    await Promise.all(authContexts.map((ctx) => ctx.dispose()));
    await requestContext.dispose();
  },
});

export { expect } from "@playwright/test";
