import { Given, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { ExamplePage } from "../support/pages/example-page";

Given("I open the homepage", async function (this: CustomWorld) {
  const examplePage = new ExamplePage(this.page);
  await examplePage.openHomePage();
});

Then("the page title should contain {string}", async function (this: CustomWorld, expected: string) {
  const examplePage = new ExamplePage(this.page);
  await examplePage.expectTitleToContain(expected);
});
