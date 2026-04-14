import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/LoginPage';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';

test.describe('OrangeHRM Forgot Password', { tag: ['@login', '@regression'] }, () => {

  test('User can navigate to the forgot password page', { tag: ['@forgot-password'] }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);

    // Given: I am on the OrangeHRM login page
    await page.goto('/');

    // When: I click the forgot password link
    await loginPage.forgotPasswordLink().click();
    await page.waitForLoadState('networkidle');

    // Then: I verify I see the forgot password page
    await expect(forgotPasswordPage.title()).toBeVisible({ timeout: 10_000 });
  });

});
