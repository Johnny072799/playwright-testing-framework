import type { Locator, Page } from "playwright";
import { BasePage } from "../base-page";

/**
 * Page object for Admin > User Management > Users (user list).
 * Holds locators for the user list page. The add user form is on a separate page.
 */
export class UsersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  addButton(): Locator {
    return this.page.locator("button").filter({ hasText: "Add" });
  }

  /** Cell at second row, 4th column - contains employee name. */
  employeeNameCellSecondRow(): Locator {
    return this.page
      .locator("[role='row']")
      .nth(1)
      .locator(".oxd-table-cell[role='cell']")
      .nth(3);
  }

  /** Open the add user form (navigates to the add user page). */
  async openAddUserForm(): Promise<void> {
    await this.addButton().click();
    await this.page.waitForLoadState("networkidle");
  }
}
