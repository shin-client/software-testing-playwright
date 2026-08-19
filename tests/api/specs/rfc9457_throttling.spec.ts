import { test, expect } from '@playwright/test';
import { ProblemDetailsSchema } from '../schemas/rfc9457.schema.js';

test.describe('WBS 2.4: RFC 9457 Problem Details & Rate Limiting Throttler', () => {

  test('Xac minh Rate Limiting HTTP 429 va Validate Schema RFC 9457 bang Zod', async ({ request }) => {
    test.setTimeout(60000);

    const totalRequests = 15;

    // 1. Bắn bão request đồng thời vào /auth/login
    const requestPromises = Array.from({ length: totalRequests }).map(() =>
      request.post('/auth/login', {
        data: { email: 'rate_limit_test@example.com', password: 'wrongpassword' }
      })
    );

    const responses = await Promise.all(requestPromises);

    // 2. Tìm response bị 429
    const throttledResponse = responses.find(res => res.status() === 429) || responses[responses.length - 1];
    expect(throttledResponse.status()).toBe(429);

    // 3. Kiểm tra linh hoạt các Response Headers điều tiết lưu lượng
    const headers = throttledResponse.headers();
    const hasRateLimitHeader = !!(
      headers['retry-after'] || 
      headers['x-ratelimit-reset'] || 
      headers['x-ratelimit-remaining'] ||
      headers['x-ratelimit-limit']
    );
    expect(hasRateLimitHeader).toBe(true);

    // 4. Validate Schema RFC 9457 bằng Zod
    const responseBody = await throttledResponse.json();
    const validationResult = ProblemDetailsSchema.safeParse(responseBody);

    if (!validationResult.success) {
      console.error('Loi Schema RFC 9457:', validationResult.error.format());
    }

    expect(validationResult.success).toBe(true);
  });

});