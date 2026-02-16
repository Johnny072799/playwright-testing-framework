import { Given } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { LoginPage } from "../support/pages/login-page";

Given("I login as a customer", async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.loginAsCustomer();
});
