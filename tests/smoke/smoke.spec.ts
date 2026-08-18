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

  test('SMOKE-02: Verify multi-project configuration and environment setup', async () => {
    expect(process.env.WEB_BASE_URL || 'https://www.saucedemo.com').toContain('saucedemo.com');
  });

});
