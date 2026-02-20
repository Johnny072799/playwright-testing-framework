import type { Page } from "playwright";
import { config } from "./config";

/**
 * User interface - structure for user credentials.
 */
export interface User {
  username?: string;
  password?: string;
}

/**
 * UserData class - manages user test data. Provides methods to get User objects
 * initialized with base valid data from config (source of truth).
 */
export class UserData {
  constructor(private readonly page: Page) {}

  /**
   * Get base valid user from config (source of truth).
   */
  baseUser(): User {
    return {
      username: config.testUserEmail,
      password: config.testUserPassword
    };
  }
}
