import { When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { NavigationPage } from "../support/pages/navigation-page";

When("I navigate to the admin side navigation item", async function (this: CustomWorld) {
  const navigationPage = new NavigationPage(this.page);
  await navigationPage.adminMenuItem().click();
  await this.page.waitForLoadState("networkidle");
});
