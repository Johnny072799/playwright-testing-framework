import { BasePage } from "./base-page";
import type { Page } from "playwright";

/**
 * Shared page for cross-app elements. Extends BasePage.
 * Use when you need common locators (errors, toasts) without a specific page context.
 * For page objects, extend BasePage directly.
 */
export class CommonPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
}
