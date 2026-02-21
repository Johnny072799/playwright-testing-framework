import { Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { CommonPage } from "../support/pages/common-page";

Then(/^I verify I see the error message: (.+)$/, async function (this: CustomWorld, expectedMessage: string) {
  const commonPage = new CommonPage(this.page);
  const alertText = await commonPage.errorMessage().textContent();
  const fieldErrorText = await commonPage.fieldErrorMessage().first().textContent().catch(() => null);
  const foundInAlert = alertText?.includes(expectedMessage);
  const foundInField = fieldErrorText?.includes(expectedMessage);
  if (!foundInAlert && !foundInField) {
    throw new Error(
      `Expected error message to contain "${expectedMessage}", but got: alert="${alertText || "none"}", field="${fieldErrorText || "none"}"`
    );
  }
});

Then(/^I verify I see the field error message: (.+)$/, async function (this: CustomWorld, expectedMessage: string) {
  const commonPage = new CommonPage(this.page);
  const errorText = await commonPage.fieldErrorMessage().textContent();

  if (!errorText || !errorText.includes(expectedMessage)) {
    throw new Error(
      `Expected field error message to contain "${expectedMessage}", but got: "${errorText || "no field error message found"}"`
    );
  }
});
