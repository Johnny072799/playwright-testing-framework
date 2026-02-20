import type { Locator, Page } from "playwright";

export class ForgotPasswordPage {
  constructor(private readonly page: Page) {}

  title(): Locator {
    return this.page.locator(".orangehrm-forgot-password-title");
  }
}
