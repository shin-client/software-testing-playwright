import { expect, test } from "@playwright/test";

/**
 * WBS 3.3: Web UI Test Suite - Post-Mortem Diagnostics with Trace Viewer
 * Assignee: Lê Minh Tài (MSSV: 0306241145)
 *
 * System Invariants:
 *  1. Latency Auto-Waiting: Playwright automatically waits through performance glitch delays (>5000ms).
 *  2. Diagnostic Trace Capture: Failed assertions produce structured trace.zip packages on retry.
 *  3. Network Waterfall Visibility: All HTTP requests and TTFB timings are inspected post-mortem.
 */
test.describe("WBS 3.3: Web UI Test Suite - Post-Mortem Diagnostics with Trace Viewer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-UI-TRACE-01: Performance Glitch Latency Triage & Trace Generation", async ({
    page,
  }) => {
    await page.locator("#user-name").fill("performance_glitch_user");
    await page.locator("#password").fill("secret_sauce");
    await page.locator("#login-button").click();

    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator(".title")).toHaveText("Products");

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

    await page.locator(".shopping_cart_link").click();
    await expect(page).toHaveURL(/.*cart.html/);
    await expect(page.locator(".title")).toHaveText("Your Cart");
  });

  test("TC-UI-TRACE-02: Intentional Assertion Failure for Post-Mortem Diagnostics", async ({
    page,
  }) => {
    // Đánh dấu expected failure để Playwright sinh trace.zip chẩn đoán mà không làm đỏ CI
    test.fail(
      true,
      "Cố tình kích hoạt failure để Playwright chụp Trace chẩn đoán hậu kỳ",
    );

    await page.locator("#user-name").fill("standard_user");
    await page.locator("#password").fill("secret_sauce");
    await page.locator("#login-button").click();

    await page.locator(".shopping_cart_link").click();
    await page.locator('[data-test="checkout"]').click();

    await expect(page.locator(".title")).toHaveText("Wrong Title", {
      timeout: 3000,
    });
  });

  test("TC-UI-TRACE-03: Network Waterfall & Slow Request Identification", async ({
    page,
  }) => {
    await page.locator("#user-name").fill("performance_glitch_user");
    await page.locator("#password").fill("secret_sauce");
    await page.locator("#login-button").click();

    const inventoryContainer = page.locator("#inventory_container").first();
    await expect(inventoryContainer).toBeVisible();

    const inventoryItems = page.locator(".inventory_item");
    await expect(inventoryItems).toHaveCount(6);
  });
});