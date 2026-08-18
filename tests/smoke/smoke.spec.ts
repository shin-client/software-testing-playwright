import { test, expect } from '@playwright/test';

test.describe('Smoke Verification Suite (WBS 1.6 Baseline)', () => {

  test('SMOKE-01: Verify SauceDemo Web UI accessibility and login title', async ({ page }) => {
    // 1. Navigate to target SauceDemo Web UI
    await page.goto('/');

    // 2. Verify page title and URL
    await expect(page).toHaveTitle(/Swag Labs/i);
    expect(page.url()).toContain('saucedemo.com');

    // 3. Verify Login Container is visible
    const loginButton = page.locator('[data-test="login-button"]');
    await expect(loginButton).toBeVisible();
  });

  test('SMOKE-02: Verify NestJS Backend API live healthcheck endpoint', async ({ request }) => {
    const apiBaseUrl = process.env.API_BASE_URL || 'https://ticket-booking-amqv.onrender.com';
    
    // 1. Send GET request to backend healthcheck route (GET /)
    const response = await request.get(`${apiBaseUrl}/`);

    // 2. Verify HTTP status 200 OK
    expect(response.status()).toBe(200);

    // 3. Verify payload response { status: "ok" }
    const body = (await response.json()) as { status?: string };
    expect(body).toEqual({ status: 'ok' });
  });

  test('SMOKE-03: Verify multi-project configuration and environment setup', async () => {
    const webUrl = process.env.WEB_BASE_URL || 'https://www.saucedemo.com';
    const apiUrl = process.env.API_BASE_URL || 'https://ticket-booking-amqv.onrender.com';

    expect(webUrl).toContain('saucedemo.com');
    expect(apiUrl).toContain('onrender.com');
  });

});
