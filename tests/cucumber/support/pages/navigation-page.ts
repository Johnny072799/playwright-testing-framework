import type { Locator, Page } from "playwright";
import { BasePage } from "./base-page";

export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  adminMenuItem(): Locator {
    return this.page
      .locator(".oxd-main-menu-item--name")
      .filter({ hasText: "Admin" });
  }
}
