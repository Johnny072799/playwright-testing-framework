import type { Locator, Page } from "playwright";
import { config } from "../config";
import { waitFor, WaitForResult } from "../wait-for";

export class LoginPage {
  constructor(private readonly page: Page) {}

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
    return this.page.locator(".oxd-brand-banner");
  }

  errorMessage(): Locator {
    return this.page.locator(".oxd-alert-content-text");
  }

  async openLoginPage(): Promise<void> {
    await this.page.goto(config.baseUrl);
  }

  async login(email: string, password: string): Promise<void> {
    await this.usernameInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }

  async waitForBrandBanner(): Promise<void> {
    const banner = this.brandBanner();
    await waitFor(
      async (): Promise<WaitForResult> => {
        const isVisible = await banner.isVisible();
        return isVisible ? WaitForResult.PASS : WaitForResult.RETRY;
      },
      {
        timeout: 20000,
        wait: 2000,
        failureMessage: "The .oxd-brand-banner element did not appear after login."
      }
    );
  }

  async loginToOrangeHRMPortal(email?: string, password?: string): Promise<void> {
    if (!email || !password) {
      throw new Error(
        "Missing USER_EMAIL or USER_PASSWORD. Add them to tests/cucumber/env/.env"
      );
    }
    await this.openLoginPage();
    await this.login(email, password);
    await this.waitForBrandBanner();
  }
}