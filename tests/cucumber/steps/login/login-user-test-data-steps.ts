import { Given } from "@cucumber/cucumber";
import { CustomWorld } from "../../support/world";
import { UserData } from "../../support/user-test-data";

Given("I am a valid user", async function (this: CustomWorld) {
  const userData = new UserData();
  const user = userData.baseUser();
  this.state.set("user", user);
});

Given("I do not have a valid username", async function (this: CustomWorld) {
  const userData = new UserData();
  const user = userData.baseUser();
  this.state.set("user", user);
  user.username = "invalid_username_12345";
});

Given("I do not have a valid password", async function (this: CustomWorld) {
  const userData = new UserData();
  const user = userData.baseUser();
  this.state.set("user", user);
  user.password = "invalid_password_12345";
});

Given("I do not have a username", async function (this: CustomWorld) {
  const userData = new UserData();
  const user = userData.baseUser();
  this.state.set("user", user);
  user.username = "";
});

Given("I do not have a password", async function (this: CustomWorld) {
  const userData = new UserData();
  const user = userData.baseUser();
  this.state.set("user", user);
  user.password = "";
});
