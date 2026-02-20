import { When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../../support/world";
import { LoginPage } from "../../support/pages/login-page";
import { ForgotPasswordPage } from "../../support/pages/forgot-password-page";

When("I click the forgot password link", async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.forgotPasswordLink().click();
  await this.page.waitForLoadState("networkidle");
});

Then("I verify I see the forgot password page", async function (this: CustomWorld) {
  const forgotPasswordPage = new ForgotPasswordPage(this.page);
  const title = forgotPasswordPage.title();
  await title.waitFor({ state: "visible", timeout: 10000 });
});
