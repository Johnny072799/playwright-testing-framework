import { test, expect } from '../../fixtures';

test.describe('Example homepage', () => {

  test('Open the homepage and verify the title contains "Google"', { tag: ['@my-tag'] }, async ({ page }) => {
    // When: I open the homepage
    await page.goto('/');

    // Then: the page title should contain "Google"
    await expect(page).toHaveTitle(/Google/);
  });

});
