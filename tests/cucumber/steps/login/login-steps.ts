import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../../support/world";
import { LoginPage } from "../../support/pages/login-page";
import { User } from "../../support/user-test-data";

Given("I am on the OrangeHRM login page", async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.openLoginPage();
});

When(/^I attempt to login to the OrangeHRM portal$/, async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const user = this.state.get<User>("user");
  await loginPage.loginToOrangeHRMPortal(user?.username ?? "", user?.password ?? "");
});

Then("I see the brand banner", async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.waitForBrandBanner();
});
