import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  adminMenuItem(): Locator {
    return this.page
      .locator('.oxd-main-menu-item--name')
      .filter({ hasText: 'Admin' });
  }
}
