import type { Locator, Page } from "playwright";
import { BasePage } from "./base-page";

export class ForgotPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  title(): Locator {
    return this.page.locator(".orangehrm-forgot-password-title");
  }
}
