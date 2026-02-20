import type { Locator } from "playwright";

/**
 * Opens the dropdown and selects the option with the given text.
 */
export async function selectFromDropdown(
  dropdownLocator: Locator,
  option: string
): Promise<void> {
  await dropdownLocator.click();
  await dropdownLocator.page().getByRole("option", { name: option }).click();
}
