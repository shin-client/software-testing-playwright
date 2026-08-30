import { expect, test } from "@playwright/test";

/**
 * WBS 3.2: Web UI Test Suite - Network Mocking & Error Handling
 * Assignee: Ngô Gia Bảo (MSSV: 0306241108)
 *
 * System Invariants:
 *  1. Asset Resilience: HTTP 500 on product images must not break UI rendering or cart interactions.
 *  2. Authentication Security: Locked-out users must be blocked from navigating to inventory.
 *  3. Network Fault Tolerance: Aborted service worker requests must not hang the application.
 */
test.describe("WBS 3.2: Web UI Test Suite - Network Mocking & Error Handling", () => {
  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  // TC-UI-MOCK-01: Giả lập toàn bộ ảnh sản phẩm JPG bị sập HTTP 500
  test("TC-UI-MOCK-01: Simulated HTTP 500 on Product Assets & Fallback Verification", async ({
    page,
  }) => {
    // 1. Can thiệp tầng mạng CDP: Ép toàn bộ ảnh .jpg trả về status 500
    await page.route("**/*.jpg", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "text/plain",
        body: "Internal Server Error (Simulated via Playwright CDP)",
      });
    });

    // 2. Mở trang chủ và đăng nhập bằng standard_user
    await page.goto("/");
    await page.getByPlaceholder("Username").fill("standard_user");
    await page.getByPlaceholder("Password").fill("secret_sauce");
    await page.getByRole("button", { name: "Login" }).click();

    // 3. Kiểm tra giao diện không bị sập, danh sách 6 sản phẩm vẫn hiển thị
    await expect(page).toHaveURL(/.*inventory.html/);
    const inventoryItems = page.locator(".inventory_item");
    await expect(inventoryItems).toHaveCount(6);

    // Xác thực tên và giá tiền sản phẩm đầu tiên vẫn hiển thị
    const firstItemName = inventoryItems.first().locator(".inventory_item_name");
    const firstItemPrice = inventoryItems.first().locator(".inventory_item_price");
    await expect(firstItemName).toBeVisible();
    await expect(firstItemPrice).toContainText("$");

    // Thử nghiệm thêm sản phẩm vào giỏ hàng
    const addToCartBtn = inventoryItems.first().getByRole("button", { name: "Add to cart" });
    await addToCartBtn.click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
  });

  // TC-UI-MOCK-02: Kiểm tra xử lý lỗi khi đăng nhập bằng tài khoản bị khóa
  test("TC-UI-MOCK-02: Security Error Handling with Locked-Out User Account", async ({
    page,
  }) => {
    // 1. Mở trang đăng nhập
    await page.goto("/");

    // 2. Nhập thông tin tài khoản bị khóa
    await page.getByPlaceholder("Username").fill("locked_out_user");
    await page.getByPlaceholder("Password").fill("secret_sauce");
    await page.getByRole("button", { name: "Login" }).click();

    // 3. Kiểm tra bị chặn điều hướng và xuất hiện thông báo lỗi
    await expect(page).toHaveURL(/.*saucedemo.com\/?$/);
    const errorContainer = page.locator('[data-test="error"]');
    await expect(errorContainer).toBeVisible({ timeout: 5000 });
    await expect(errorContainer).toHaveText("Epic sadface: Sorry, this user has been locked out.");

    // Kiểm tra xuất hiện 2 icon lỗi màu đỏ
    await expect(page.locator(".error_icon")).toHaveCount(2);
  });

  // TC-UI-MOCK-03: Giả lập rớt mạng đột ngột (Network Abort)
  test("TC-UI-MOCK-03: Network Abort Simulation (Offline / Failed Connection)", async ({
    page,
  }) => {
    // 1. Bắt chặn và hủy request của service-worker
    await page.route("**/service-worker.js", async (route) => {
      await route.abort("failed");
    });

    // 2. Thực hiện đăng nhập
    await page.goto("/");
    await page.getByPlaceholder("Username").fill("standard_user");
    await page.getByPlaceholder("Password").fill("secret_sauce");
    await page.getByRole("button", { name: "Login" }).click();

    // 3. Kiểm tra trang web vẫn vào bình thường, không bị treo vô hạn
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator(".title")).toHaveText("Products");
  });
});
