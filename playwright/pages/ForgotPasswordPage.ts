import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgotPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  title(): Locator {
    return this.page.locator('.orangehrm-forgot-password-title');
  }
}
