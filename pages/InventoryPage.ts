import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent.js';

export class InventoryPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
  }

  async addItemToCart(productName: string): Promise<void> {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeItemFromCart(productName: string): Promise<void> {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Remove' }).click();
  }

  async goToCart(): Promise<void> {
    await this.header.openCart();
  }
}