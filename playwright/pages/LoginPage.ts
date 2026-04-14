import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  usernameInput(): Locator {
    return this.page.locator("input[name='username']");
  }

  passwordInput(): Locator {
    return this.page.locator("input[name='password']");
  }

  submitButton(): Locator {
    return this.page.locator("button[type='submit']");
  }

  brandBanner(): Locator {
    return this.page.locator('.oxd-brand-banner');
  }

  forgotPasswordLink(): Locator {
    return this.page.locator('.orangehrm-login-forgot');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }

  async loginToOrangeHRMPortal(username: string, password: string): Promise<void> {
    await this.page.goto('/');
    await this.login(username, password);
  }
}
