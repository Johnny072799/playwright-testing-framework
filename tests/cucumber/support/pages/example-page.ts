import type { Page } from "playwright";
import { config } from "../config";

/**
 * Page object for the example/homepage flow.
 * Receives the Playwright Page from the scenario world; use from steps via CustomWorld.
 */
export class ExamplePage {
  constructor(private readonly page: Page) {}

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
