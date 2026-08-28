import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  async getCartCount(): Promise<number> {
    if (await this.cartBadge.isVisible()) {
      const text = await this.cartBadge.textContent();
      return text ? parseInt(text.trim(), 10) : 0;
    }
    return 0;
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}