import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../../../support/world";
import { UserData } from "../../../support/user-test-data";
import type { User } from "../../../support/user-test-data";
import { UsersPage } from "../../../support/pages/user-management/users-page";
import { AddUserPage } from "../../../support/pages/user-management/add-user-page";

Given("An ESS user is added to the system", async function (this: CustomWorld) {
  const userData = new UserData(this.page);
  const essUser = userData.essUser();
  this.state.set("essUser", essUser);
});

Then("I get a valid username for the ESS user", async function (this: CustomWorld) {
  const usersPage = new UsersPage(this.page);
  const essUser = this.state.get<User>("essUser");
  const employeeName = await usersPage
    .employeeNameCellSecondRow()
    .innerText()
    .then((t) => t.trim());
  essUser.employeeName = employeeName;
});

When("I add an ESS user", async function (this: CustomWorld) {
  const usersPage = new UsersPage(this.page);
  const addUserPage = new AddUserPage(this.page);
  const essUser = this.state.get<User>("essUser");

  await usersPage.openAddUserForm();
  await addUserPage.addUser(essUser);
});

Then("I verify I see the ESS user added successfully", async function (this: CustomWorld) {
  const addUserPage = new AddUserPage(this.page);
  await addUserPage.successToast().waitFor({ state: "visible", timeout: 10000 });
});
