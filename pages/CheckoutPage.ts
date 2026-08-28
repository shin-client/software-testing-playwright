import type { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  // Step One Locators
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  // Step Two Locators
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  // Complete Locators
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.errorMessage = page.locator('[data-test="error"]');

    this.itemTotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');

    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  async fillInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async getPaymentSummary(): Promise<{ itemTotal: number; tax: number; total: number }> {
    const parsePrice = (text: string | null) => {
      if (!text) return 0;
      const match = text.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    const itemTotalText = await this.itemTotalLabel.textContent();
    const taxText = await this.taxLabel.textContent();
    const totalText = await this.totalLabel.textContent();

    return {
      itemTotal: parsePrice(itemTotalText),
      tax: parsePrice(taxText),
      total: parsePrice(totalText),
    };
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async getCompleteMessage(): Promise<string> {
    return (await this.completeHeader.textContent())?.trim() || '';
  }
}