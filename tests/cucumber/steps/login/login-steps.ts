import { Given, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../../support/world";
import { LoginPage } from "../../support/pages/login-page";
import { UserData, User } from "../../support/user-test-data";

Given(/^I (attempt to login|login) to the OrangeHRM portal$/, async function (this: CustomWorld, attemptToLogin: string) {
  const loginPage = new LoginPage(this.page);
  const user = this.state.get<User>("user");
  if (!user.username || !user.password) {
    throw new Error("User username or password is not set");
  }
  await loginPage.loginToOrangeHRMPortal(user.username, user.password);
  if (attemptToLogin === "login") {
    await loginPage.waitForBrandBanner();
  }
});

Given("I have valid credentials", async function (this: CustomWorld) {
  const userData = new UserData(this.page);
  const user = userData.baseUser();
  this.state.set("user", user);
});

Given("I do not have a valid username", async function (this: CustomWorld) {
  const userData = new UserData(this.page);
  const user = userData.baseUser();
  this.state.set("user", user);
  user.username = "invalid_username_12345";
});

Given("I do not have a valid password", async function (this: CustomWorld) {
  const userData = new UserData(this.page);
  const user = userData.baseUser();
  this.state.set("user", user);
  user.password = "invalid_password_12345";
});

Given("I do not have a username", async function (this: CustomWorld) {
  const userData = new UserData(this.page);
  const user = userData.baseUser();
  this.state.set("user", user);
  user.username = "";
});

Given("I do not have a password", async function (this: CustomWorld) {
  const userData = new UserData(this.page);
  const user = userData.baseUser();
  this.state.set("user", user);
  user.password = "";
});

Then(/^I should see the error message: (.+)$/, async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const errorText = await loginPage.errorMessage().textContent();
  
  if (!errorText || !errorText.includes(expectedMessage)) {
    throw new Error(
      `Expected error message to contain "${expectedMessage}", but got: "${errorText || "no error message found"}"`
    );
  }
});
