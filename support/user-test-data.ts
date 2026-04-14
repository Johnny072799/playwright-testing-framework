import { faker } from '@faker-js/faker';

export interface User {
  username?: string;
  password?: string;
  confirmPassword?: string;
  userRole?: string;
  employeeName?: string;
  status?: string;
}

/**
 * UserData — provides User objects for test setup.
 * Framework-agnostic: no page, fixture, or test runner dependencies.
 */
export class UserData {
  /** Valid admin user sourced from environment variables. */
  baseUser(): User {
    return {
      username: process.env.USERNAME,
      password: process.env.USER_PASSWORD,
      userRole: 'Admin',
      employeeName: 'manda user',
      status: 'enabled',
    };
  }

  /** ESS user with a faker-generated username. Employee name is a placeholder
   *  and should be replaced with a real name fetched from the application. */
  essUser(): User {
    return {
      username: faker.internet.username(),
      password: process.env.USER_PASSWORD,
      confirmPassword: process.env.USER_PASSWORD,
      userRole: 'ESS',
      employeeName: faker.person.fullName(),
      status: 'Enabled',
    };
  }
}
