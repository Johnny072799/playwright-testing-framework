import path from "path";
import { config } from "./support/config";

const projectRoot = path.resolve(__dirname, "..", "..");

/**
 * Shape of a Cucumber profile. Aligns with Cucumber's configuration options.
 * Each profile can override paths, tags, require, format, parallel, etc.
 */
export interface CucumberProfile {
  paths?: string[];
  require?: string[];
  requireModule?: string[];
  tags?: string;
  parallel?: number;
  format?: string | string[] | [string, string?][];
  publishQuiet?: boolean;
  worldParameters?: Record<string, unknown>;
}

const baseProfile: CucumberProfile = {
  paths: [path.join(projectRoot, "tests/cucumber/features/**/*.feature")],
  require: [
    path.join(projectRoot, "tests/cucumber/support/config.ts"),
    path.join(projectRoot, "tests/cucumber/support/worldState.ts"),
    path.join(projectRoot, "tests/cucumber/support/world.ts"),
    path.join(projectRoot, "tests/cucumber/support/hooks.ts"),
    path.join(projectRoot, "tests/cucumber/steps/**/*.ts")
  ],
  requireModule: ["ts-node/register/transpile-only"],
  publishQuiet: true,
  format: ["pretty"],
  parallel: config.parallel,
  worldParameters: {}
};

/**
 * Central registry of Cucumber profiles. Use with -p flag: cucumber-js -p smoke
 */
export const cucumberProfiles: Record<string, CucumberProfile> = {
  default: baseProfile,
  smoke: {
    ...baseProfile,
    tags: "@smoke"
  },
  regression: {
    ...baseProfile,
    tags: "@regression"
  },
  login: {
    ...baseProfile,
    tags: "@login"
  }
};
