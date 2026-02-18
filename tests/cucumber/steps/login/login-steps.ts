import { Given, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../../support/world";
import { LoginPage } from "../../support/pages/login-page";
import { UserData, User } from "../../support/user-test-data";

Given("I login to the OrangeHRM portal", async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.loginToOrangeHRMPortal();
});

Given("I login with an invalid username", async function (this: CustomWorld) {
  const userData = new UserData(this.page);
  const user = userData.baseUser();
  user.username = "invalid_username_12345";
  this.state.set("user", user);
});

Given("I login with an invalid password", async function (this: CustomWorld) {
  const userData = new UserData(this.page);
  const user = userData.baseUser();
  user.password = "invalid_password_12345";
  this.state.set("user", user);
});

Given("I login with a blank username", async function (this: CustomWorld) {
  const userData = new UserData(this.page);
  const user = userData.baseUser();
  user.username = "";
  this.state.set("user", user);
});

Given("I login with a blank password", async function (this: CustomWorld) {
  const userData = new UserData(this.page);
  const user = userData.baseUser();
  user.password = "";
  this.state.set("user", user);
});

Then(/^I should see the error message: (.+)$/, async function (this: CustomWorld, expectedMessage: string) {
  const user = this.state.get("user") as User;
  const loginPage = new LoginPage(this.page);
  await loginPage.openLoginPage();
  if (user.username && user.password) {
    await loginPage.login(user.username, user.password);
  } else {
    throw new Error("User username or password is not set");
  }
  const errorText = await loginPage.errorMessage().textContent();
  
  if (!errorText || !errorText.includes(expectedMessage)) {
    throw new Error(
      `Expected error message to contain "${expectedMessage}", but got: "${errorText || "no error message found"}"`
    );
  }
});
