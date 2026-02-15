import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env for local development.
// Prefer tests/cucumber/env/.env, then fall back to CWD .env.
if (!process.env.CI) {
  const envPath = path.resolve(__dirname, "..", "env", ".env");
  dotenv.config({ path: envPath });
  if (!process.env.BASE_URL) {
    dotenv.config();
  }
}

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === "") return defaultValue;
  return value.toLowerCase().trim() === "true";
}

type TestConfig = {
  baseUrl: string;
  testUserEmail?: string;
  testUserPassword?: string;
  headless: boolean;
  startMaximized: boolean;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Please set it in your environment or in a local ".env" file (for development only).`
    );
  }
  return value;
}

export const config: TestConfig = {
  baseUrl: requireEnv("BASE_URL"),
  testUserEmail: process.env.TEST_USER_EMAIL,
  testUserPassword: process.env.TEST_USER_PASSWORD,
  headless: parseBool(process.env.HEADLESS, true),
  startMaximized: parseBool(process.env.START_MAXIMIZED, false)
};

