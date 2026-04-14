import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/LoginPage';
import { UserData } from '../../support/user-test-data';

test.describe('OrangeHRM Portal Login', { tag: ['@login', '@regression'] }, () => {

  test('Validate login with valid credentials', { tag: ['@smoke', '@valid-credentials'] }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const user = new UserData().baseUser();

    // Given: I am a valid user
    // When: I attempt to login to the OrangeHRM portal
    await loginPage.loginToOrangeHRMPortal(user.username ?? '', user.password ?? '');

    // Then: I see the brand banner
    await expect(loginPage.brandBanner()).toBeVisible({ timeout: 20_000 });
  });

  const invalidCredentialCases = [
    { description: 'I do not have a valid username', override: { username: 'invalid_username_12345' } },
    { description: 'I do not have a valid password', override: { password: 'invalid_password_12345' } },
  ];

  for (const { description, override } of invalidCredentialCases) {
    test(`Validate login with invalid credentials: ${description}`, { tag: ['@invalid-credentials'] }, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const user = { ...new UserData().baseUser(), ...override };

      // When: I attempt to login to the OrangeHRM portal
      await loginPage.loginToOrangeHRMPortal(user.username ?? '', user.password ?? '');

      // Then: I verify I see the error message: Invalid credentials
      await expect(loginPage.errorMessage()).toContainText('Invalid credentials');
    });
  }

  const blankFieldCases = [
    { description: 'I do not have a username', override: { username: '' } },
    { description: 'I do not have a password', override: { password: '' } },
  ];

  for (const { description, override } of blankFieldCases) {
    test(`Validate login with blank required fields: ${description}`, { tag: ['@blank-required-fields'] }, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const user = { ...new UserData().baseUser(), ...override };

      // When: I attempt to login to the OrangeHRM portal
      await loginPage.loginToOrangeHRMPortal(user.username ?? '', user.password ?? '');

      // Then: I verify I see the field error message: Required
      await expect(loginPage.fieldErrorMessage().first()).toContainText('Required');
    });
  }

});
