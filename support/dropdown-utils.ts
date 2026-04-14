import { type Locator } from '@playwright/test';

/**
 * DropdownUtils — helpers for interacting with custom dropdown components.
 */
export class DropdownUtils {
  /** Opens a dropdown and clicks the option matching the given text. */
  static async selectFromDropdown(dropdown: Locator, option: string): Promise<void> {
    await dropdown.click();
    await dropdown.page().getByRole('option', { name: option }).click();
  }
}
