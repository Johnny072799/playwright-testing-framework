import type { Locator, Page } from "playwright";

export class NavigationPage {
  constructor(private readonly page: Page) {}

  adminMenuItem(): Locator {
    return this.page
      .locator(".oxd-main-menu-item--name")
      .filter({ hasText: "Admin" });
  }
}
