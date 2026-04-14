import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import type { User } from '../../support/user-test-data';
import { DropdownUtils } from '../../support/dropdown-utils';

/**
 * Page object for the Add User form (Admin > User Management > Users > Add).
 */
export class AddUserPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  userRoleDropdown(): Locator {
    return this.page.locator('.oxd-select-wrapper').first();
  }

  employeeNameInput(): Locator {
    return this.page.locator('.oxd-autocomplete-wrapper input').first();
  }

  usernameInput(): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.locator('label', { hasText: 'Username' }) })
      .locator('input');
  }

  statusDropdown(): Locator {
    return this.page.locator('.oxd-select-wrapper').nth(1);
  }

  passwordInput(): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.locator('label', { hasText: /^Password$/ }) })
      .locator("input[type='password']");
  }

  confirmPasswordInput(): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.locator('label', { hasText: 'Confirm Password' }) })
      .locator("input[type='password']");
  }

  saveButton(): Locator {
    return this.page.locator("button[type='submit']");
  }

  successToast(): Locator {
    return this.page.locator('.oxd-toast-container');
  }

  /** Fill and submit the add user form. Skips fields that have no value. */
  async addUser(user: User): Promise<void> {
    if (user.userRole) {
      await DropdownUtils.selectFromDropdown(this.userRoleDropdown(), user.userRole);
    }

    if (user.employeeName) {
      await this.employeeNameInput().pressSequentially(user.employeeName, { delay: 100 });
      const firstOption = this.page
        .getByRole('option')
        .filter({ hasNotText: 'Searching' })
        .first();
      await firstOption.waitFor({ state: 'visible' });
      await firstOption.click();
    }

    if (user.username) {
      await this.usernameInput().fill(user.username);
    }

    if (user.status) {
      await DropdownUtils.selectFromDropdown(this.statusDropdown(), user.status);
    }

    if (user.password) {
      await this.passwordInput().fill(user.password);
    }

    const confirmValue = user.confirmPassword !== undefined ? user.confirmPassword : user.password;
    if (confirmValue) {
      await this.confirmPasswordInput().fill(confirmValue);
    }

    await this.saveButton().click();
  }
}
