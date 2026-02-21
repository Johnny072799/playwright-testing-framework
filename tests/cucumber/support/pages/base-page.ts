import type { Locator, Page } from "playwright";

/**
 * Base page class with shared locators and patterns.
 * All page objects extend BasePage so common locators (errors, toasts) are
 * defined once. If a shared locator changes, update it here.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  /** General alert/toast error message (appears across multiple pages). */
  errorMessage(): Locator {
    return this.page.locator(".oxd-alert-content-text");
  }

  /** Field-level validation message (e.g. for blank required fields). */
  fieldErrorMessage(): Locator {
    return this.page.locator(".oxd-input-field-error-message");
  }
}
