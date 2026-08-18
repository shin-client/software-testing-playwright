import type { APIRequestContext } from '@playwright/test';
import { test as base } from '@playwright/test';

type ApiFixtures = {
  // Fixture cung cấp authenticated request context (có sẵn Bearer Token)
  authRequest: APIRequestContext;
  // TODO: Thêm các custom fixtures khác nếu cần (ví dụ: testUserData, adminRequest)
};

export const test = base.extend<ApiFixtures>({
  authRequest: async ({ playwright, baseURL }, use) => {
    // TODO: 1. Khởi tạo request context mới
    // const requestContext = await playwright.request.newContext({
    //   baseURL,
    //   extraHTTPHeaders: {
    //     'Content-Type': 'application/json',
    //   },
    // });

    // TODO: 2. Gọi API đăng nhập để lấy Bearer Token
    // const loginResponse = await requestContext.post('/auth/login', {
    //   data: {
    //     email: process.env.TEST_USER_EMAIL,
    //     password: process.env.TEST_USER_PASSWORD,
    //   },
    // });
    // const { accessToken } = await loginResponse.json();

    // TODO: 3. Tạo authenticated context gắn kèm Authorization Header
    // const authContext = await playwright.request.newContext({
    //   baseURL,
    //   extraHTTPHeaders: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    // });

    // TODO: 4. Sử dụng context trong test case và dọn dẹp sau khi test xong
    // await use(authContext);
    // await authContext.dispose();
    // await requestContext.dispose();

    // Placeholder scaffolding:
    const emptyContext = await playwright.request.newContext({ baseURL });
    await use(emptyContext);
    await emptyContext.dispose();
  },
});

export { expect } from '@playwright/test';
