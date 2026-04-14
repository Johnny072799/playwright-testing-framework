import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/LoginPage';
import { NavigationPage } from '../../pages/NavigationPage';
import { UsersPage } from '../../pages/user-management/UsersPage';
import { AddUserPage } from '../../pages/user-management/AddUserPage';
import { UserData, type User } from '../../support/user-test-data';

test.describe('OrangeHRM User Management', { tag: ['@user-management', '@regression'] }, () => {

  test('I can add an ESS user to the system', { tag: ['@smoke'] }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const navigationPage = new NavigationPage(page);
    const usersPage = new UsersPage(page);
    const addUserPage = new AddUserPage(page);

    // Background: I am a valid user and I attempt to login
    const adminUser = new UserData().baseUser();
    await loginPage.loginToOrangeHRMPortal(adminUser.username ?? '', adminUser.password ?? '');

    // Given: An ESS user is added to the system
    const essUser = new UserData().essUser();

    // And: I navigate to the admin side navigation item
    await navigationPage.adminMenuItem().click();
    await page.waitForLoadState('networkidle');

    // And: I get a valid username for the ESS user (reads a real employee name from the system)
    const employeeName = await usersPage.employeeNameCellSecondRow().innerText().then((t) => t.trim());
    essUser.employeeName = employeeName;

    // When: I add an ESS user
    await usersPage.openAddUserForm();
    await addUserPage.addUser(essUser);

    // Then: I verify I see the ESS user added successfully
    await expect(addUserPage.successToast()).toBeVisible({ timeout: 10_000 });
  });

  const validationCases: Array<{ description: string; mutate: (u: User) => void; errorMessage: string }> = [
    { description: 'user role', mutate: (u) => { u.userRole = ''; }, errorMessage: 'Required' },
    { description: 'employee name', mutate: (u) => { u.employeeName = ''; }, errorMessage: 'Required' },
    { description: 'status', mutate: (u) => { u.status = ''; }, errorMessage: 'Required' },
    { description: 'username', mutate: (u) => { u.username = ''; }, errorMessage: 'Required' },
    { description: 'password', mutate: (u) => { u.password = ''; }, errorMessage: 'Passwords do not match' },
    { description: 'confirm password', mutate: (u) => { u.confirmPassword = ''; }, errorMessage: 'Passwords do not match' },
  ];

  for (const { description, mutate, errorMessage } of validationCases) {
    test(`I cannot add a user without completing: ${description}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const navigationPage = new NavigationPage(page);
      const usersPage = new UsersPage(page);
      const addUserPage = new AddUserPage(page);

      // Background: I am a valid user and I attempt to login
      const adminUser = new UserData().baseUser();
      await loginPage.loginToOrangeHRMPortal(adminUser.username ?? '', adminUser.password ?? '');

      // Given: ESS user with the tested field cleared
      const essUser = new UserData().essUser();
      mutate(essUser);

      // And: I navigate to the admin side navigation item
      await navigationPage.adminMenuItem().click();
      await page.waitForLoadState('networkidle');

      // And: I get a valid employee name (skipped if employee name is the field under test)
      if (essUser.employeeName) {
        const employeeName = await usersPage.employeeNameCellSecondRow().innerText().then((t) => t.trim());
        essUser.employeeName = employeeName;
      }

      // When: I add an ESS user
      await usersPage.openAddUserForm();
      await addUserPage.addUser(essUser);

      // Then: I verify I see the field error message
      await expect(addUserPage.fieldErrorMessage().first()).toContainText(errorMessage);
    });
  }

});
