import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { InventoryPage } from '../../pages/InventoryPage.js';
import { CartPage } from '../../pages/CartPage.js';
import { CheckoutPage } from '../../pages/CheckoutPage.js';

test.describe('WBS 3.1: Web UI Test Suite - E2E Checkout Flow', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
  });

  test('TC-UI-CHK-01: Full E2E Happy Path Checkout with Mathematical Price Assertion', async ({ page }) => {
    // 1. Login
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/.*inventory.html/);

    // 2. Select 2 items
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.addItemToCart('Sauce Labs Bike Light');

    // 3. Verify Cart Count
    const cartCount = await inventoryPage.header.getCartCount();
    expect(cartCount).toBe(2);

    // 4. Open Cart & Proceed
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart.html/);
    await cartPage.proceedToCheckout();

    // 5. Fill Shipping Info
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
    await checkoutPage.fillInformation('John', 'Doe', '700000');

    // 6. Verify Price Invariant on Step Two
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    const { itemTotal, tax, total } = await checkoutPage.getPaymentSummary();

    // Invariant: Total = Item Total + Tax (tolerance < 0.01)
    const expectedTotal = itemTotal + tax;
    expect(Math.abs(total - expectedTotal)).toBeLessThan(0.01);

    // 7. Finish Order & Assert Complete Message
    await checkoutPage.finishOrder();
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    const completeMsg = await checkoutPage.getCompleteMessage();
    expect(completeMsg).toBe('Thank you for your order!');
  });

  test('TC-UI-CHK-02: Form Validation on Missing Mandatory Shipping Info', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    // Leave Postal Code empty
    await checkoutPage.fillInformation('John', 'Doe', '');

    // Expect error message and stay on step one
    await expect(checkoutPage.errorMessage).toBeVisible();
    await expect(checkoutPage.errorMessage).toContainText('Error: Postal Code is required');
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
  });

  test('TC-UI-CHK-03: Cart State Persistence on Navigation Back', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');

    // 1. Add item
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.header.getCartCount()).toBe(1);

    // 2. Go to Cart and Continue Shopping back to Inventory
    await inventoryPage.goToCart();
    await cartPage.continueShopping();
    await expect(page).toHaveURL(/.*inventory.html/);

    // 3. Verify Cart Badge and Button State persistent
    expect(await inventoryPage.header.getCartCount()).toBe(1);
    const backpackButton = page
      .locator('[data-test="inventory-item"]')
      .filter({ hasText: 'Sauce Labs Backpack' })
      .getByRole('button');
    await expect(backpackButton).toHaveText('Remove');
  });
});