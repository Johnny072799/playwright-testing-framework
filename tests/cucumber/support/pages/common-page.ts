import type { Locator, Page } from "playwright";

/**
 * Shared locators for Oxd components used across multiple pages.
 * Use when elements (e.g. error messages, toasts) appear app-wide.
 */
export class CommonPage {
  constructor(private readonly page: Page) {}

  /** General alert/toast error message. */
  errorMessage(): Locator {
    return this.page.locator(".oxd-alert-content-text");
  }

  /** Field-level validation message (e.g. for blank required fields). */
  fieldErrorMessage(): Locator {
    return this.page.locator(".oxd-input-field-error-message");
  }
}
