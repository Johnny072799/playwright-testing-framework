import { faker } from "@faker-js/faker";
import { config } from "./config";

/**
 * User interface - structure for user credentials and profile.
 */
export interface User {
  username?: string;
  password?: string;
  confirmPassword?: string;
  userRole?: string;
  employeeName?: string;
  status?: string;
}

/**
 * UserData - provides User objects for test setup.
 * Framework-agnostic: no page, world, or Cucumber dependencies.
 */
export class UserData {

  /**
   * Get base valid user from config (source of truth).
   */
  baseUser(): User {
    return {
      username: config.testUsername,
      password: config.testUserPassword,
      userRole: "Admin",
      employeeName: "manda user",
      status: "enabled"
    };
  }

  /**
   * Get an ESS user with faker-generated username and employee name.
   */
  essUser(): User {
    return {
      username: faker.internet.username(),
      password: config.testUserPassword,
      confirmPassword: config.testUserPassword,
      userRole: "ESS",
      employeeName: faker.person.fullName(),
      status: "Enabled"
    };
  }
}
