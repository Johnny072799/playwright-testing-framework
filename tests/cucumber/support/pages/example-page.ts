import type { Page } from "playwright";
import { config } from "../config";
import { BasePage } from "./base-page";

/**
 * Page object for the example/homepage flow.
 * Receives the Playwright Page from the scenario world; use from steps via CustomWorld.
 */
export class ExamplePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openHomePage(): Promise<void> {
    await this.page.goto(config.baseUrl);
  }

  async expectTitleToContain(expectedSubstring: string): Promise<void> {
    const title = await this.page.title();
    if (!title.includes(expectedSubstring)) {
      throw new Error(
        `Expected page title "${title}" to contain "${expectedSubstring}"`
      );
    }
  }
}
