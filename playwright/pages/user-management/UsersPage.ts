import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object for Admin > User Management > Users (user list).
 * The add user form is on a separate page — see AddUserPage.
 */
export class UsersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  addButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Add' });
  }

  /** Second row, 4th column — contains an existing employee name. */
  employeeNameCellSecondRow(): Locator {
    return this.page
      .locator("[role='row']")
      .nth(1)
      .locator(".oxd-table-cell[role='cell']")
      .nth(3);
  }

  async openAddUserForm(): Promise<void> {
    await this.addButton().click();
    await this.page.waitForLoadState('networkidle');
  }
}
