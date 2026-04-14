import { type Locator, type Page } from '@playwright/test';

/**
 * Base page class with shared locators common across the application.
 * All page objects extend BasePage so common locators are defined once.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  /** General alert/toast error message (appears across multiple pages). */
  errorMessage(): Locator {
    return this.page.locator('.oxd-alert-content-text');
  }

  /** Field-level validation message (e.g. for blank required fields). */
  fieldErrorMessage(): Locator {
    return this.page.locator('.oxd-input-field-error-message');
  }
}
