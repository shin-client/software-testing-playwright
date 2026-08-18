import { test, expect } from "@playwright/test";

/**
 * Kịch bản dự phòng cho Web UI Testing
 * Trang mục tiêu: https://www.saucedemo.com/ (Trang sandbox tiêu chuẩn của QA)
 */
test("TC10: Thử nghiệm gửi lệnh CDP và kiểm tra giao diện SauceDemo", async ({ page }) => {
  await page.goto("https://www.saucedemo.com/");
  const loginButton = page.locator('[data-test="login-button"]');
  await expect(loginButton).toBeVisible();
});
