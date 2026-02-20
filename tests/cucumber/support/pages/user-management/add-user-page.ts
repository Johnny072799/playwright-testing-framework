import type { Locator, Page } from "playwright";
import type { User } from "../../user-test-data";
import { selectFromDropdown } from "../../dropdown-utils";

/**
 * Page object for the Add User form (navigated to from Admin > User Management > Users).
 * Holds locators and interaction logic for adding a system user.
 */
export class AddUserPage {
  constructor(private readonly page: Page) {}

  userRoleDropdown(): Locator {
    return this.page.locator(".oxd-select-wrapper").first();
  }

  employeeNameInput(): Locator {
    return this.page.locator(".oxd-autocomplete-wrapper input").first();
  }

  usernameInput(): Locator {
    return this.page
      .locator(".oxd-input-group")
      .filter({ has: this.page.locator("label", { hasText: "Username" }) })
      .locator("input");
  }

  statusDropdown(): Locator {
    return this.page.locator(".oxd-select-wrapper").nth(1);
  }

  passwordInput(): Locator {
    return this.page
      .locator(".oxd-input-group")
      .filter({ has: this.page.locator("label", { hasText: /^Password$/ }) })
      .locator("input[type='password']");
  }

  confirmPasswordInput(): Locator {
    return this.page
      .locator(".oxd-input-group")
      .filter({ has: this.page.locator("label", { hasText: "Confirm Password" }) })
      .locator("input[type='password']");
  }

  saveButton(): Locator {
    return this.page.locator("button[type='submit']");
  }

  successToast(): Locator {
    return this.page.locator(".oxd-toast-container");
  }

  /** Fill and submit the add user form. */
  async addUser(user: User): Promise<void> {
    await selectFromDropdown(this.userRoleDropdown(), user.userRole ?? "ESS");

    await this.employeeNameInput().pressSequentially(user.employeeName ?? "", { delay: 100 });
    const firstOption = this.page
      .getByRole("option")
      .filter({ hasNotText: "Searching" })
      .first();
    await firstOption.waitFor({ state: "visible" });
    await firstOption.click();

    await this.usernameInput().fill(user.username ?? "");
    await selectFromDropdown(this.statusDropdown(), user.status ?? "Enabled");

    const password = user.password ?? "";
    await this.passwordInput().fill(password);
    await this.confirmPasswordInput().fill(password);
    await this.saveButton().click();
  }
}
