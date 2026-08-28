import type { Page, Locator } from '@playwright/test';

export class FooterComponent {
  readonly page: Page;
  readonly copyText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.copyText = page.locator('[data-test="footer-copy"]');
  }
}