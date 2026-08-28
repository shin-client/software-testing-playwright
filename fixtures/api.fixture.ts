import type { APIRequestContext } from "@playwright/test";
import { test as base } from "@playwright/test";

type ApiFixtures = {
  authRequest: APIRequestContext;
  concurrencyAuthRequests: APIRequestContext[];
};

// Module-level Token Cache để tránh spam request login gây dính Auth Throttler (429)
let singleUserTokenCache: string | null = null;
const concurrencyTokensCache: string[] = [];

async function loginUser(
  requestContext: APIRequestContext,
  email: string,
  password = "Password123!",
  maxRetries = 3,
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await requestContext.post("/auth/login", {
      data: { email, password },
    });
    const body = await res.json();
    if (body?.data?.accessToken) {
      return body.data.accessToken;
    }
    if (res.status() === 429 && attempt < maxRetries) {
      // Chờ cooldown ngắn nếu bị rate limited do test khác chạy trước đó
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, 4000 * attempt);
      await promise;
      continue;
    }
    throw new Error(
      `Login failed for ${email} with status ${res.status()}: ${JSON.stringify(body)}`,
    );
  }
  throw new Error(`Login exceeded max retries for ${email}`);
}

export const test = base.extend<ApiFixtures>({
  authRequest: async ({ playwright, baseURL }, use) => {
    const requestContext = await playwright.request.newContext({ baseURL });

    if (!singleUserTokenCache) {
      const email = process.env.TEST_USER_EMAIL || "user1@test.com";
      const password = process.env.TEST_USER_PASSWORD || "Password123!";
      singleUserTokenCache = await loginUser(requestContext, email, password);
    }

    const authContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${singleUserTokenCache}`,
        "Content-Type": "application/json",
      },
    });

    await use(authContext);

    await authContext.dispose();
    await requestContext.dispose();
  },

  concurrencyAuthRequests: async ({ playwright, baseURL }, use) => {
    const requestContext = await playwright.request.newContext({ baseURL });
    const NUM_USERS = 4;

    // Nếu chưa có token cache, thực hiện login 1 lần duy nhất với retry backoff
    if (concurrencyTokensCache.length < NUM_USERS) {
      for (let i = 0; i < NUM_USERS; i++) {
        const email = `user${i + 1}@test.com`;
        const password = "Password123!";
        const token = await loginUser(requestContext, email, password);
        concurrencyTokensCache[i] = token;
      }
    }

    // Tạo các context độc lập với token đã được cache
    const authContexts = await Promise.all(
      concurrencyTokensCache.map(async (token) => {
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
