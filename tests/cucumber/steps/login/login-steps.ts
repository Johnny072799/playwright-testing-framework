import { Given, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../../support/world";
import { LoginPage } from "../../support/pages/login-page";
import { User } from "../../support/user-test-data";

Given("I am on the OrangeHRM login page", async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.openLoginPage();
});

Then(/^I (attempt to login|login) to the OrangeHRM portal$/, async function (this: CustomWorld, attemptToLogin: string) {
  const loginPage = new LoginPage(this.page);
  const user = this.state.get<User>("user");
  await loginPage.loginToOrangeHRMPortal(user?.username ?? "", user?.password ?? "");
  if (attemptToLogin === "login") {
    await loginPage.waitForBrandBanner();
  }
});

Then(/^I verify I see the error message: (.+)$/, async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const errorText = await loginPage.errorMessage().textContent();
  
  if (!errorText || !errorText.includes(expectedMessage)) {
    throw new Error(
      `Expected error message to contain "${expectedMessage}", but got: "${errorText || "no error message found"}"`
    );
  }
});

Then(/^I verify I see the field error message: (.+)$/, async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const errorText = await loginPage.fieldErrorMessage().textContent();

  if (!errorText || !errorText.includes(expectedMessage)) {
    throw new Error(
      `Expected field error message to contain "${expectedMessage}", but got: "${errorText || "no field error message found"}"`
    );
  }
});
